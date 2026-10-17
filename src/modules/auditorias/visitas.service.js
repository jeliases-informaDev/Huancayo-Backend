import prisma from '#core/config/prisma.js';
import storageService from '#modules/sistema/storage.service.js';
import { env } from '#core/config/env.js';
import { haversineMeters } from '#core/security/geofence.js';
import { puntoDeReferencia, conUbicacionNegocio } from '#modules/expedientes/ubicaciones.js';
import { registrarEventosDeCampo } from './eventos-campo.js';
import { logger } from '#core/config/logger.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

async function requireActiveAssignment(auditorId, expedienteId) {
  const asignacion = await prisma.asignacionAuditoria.findFirst({ where: { id_usuario_auditor: auditorId, id_expediente: expedienteId, estado: 'ACTIVA' } });
  if (!asignacion) throw Object.assign(new Error('Este expediente no está en tu muestra asignada.'), { statusCode: 403, code: 'NOT_ASSIGNED' });
  return asignacion;
}

// --- Evidencias ---
async function presignEvidencia(auditorId, id_expediente, payload) {
  await requireActiveAssignment(auditorId, id_expediente);
  return storageService.createUpload({ auditorId, expedienteId: id_expediente, tipo: payload.tipo, contentType: payload.content_type, size: payload.size });
}

async function recibirEvidencia({ key, buffer, auditorId, id_expediente, tipo }) {
  const { hash } = await storageService.receiveUpload({ key, buffer, auditorId, expedienteId: id_expediente, tipo });
  const existente = await prisma.evidencia.findUnique({ where: { hash_sha256: hash } });
  if (existente) {
    throw Object.assign(new Error('Esta fotografía ya fue utilizada como evidencia en otra visita. Debes tomar una foto nueva desde la cámara.'), { statusCode: 409, code: 'EVIDENCE_REUSED' });
  }
  return { key, hash };
}

// --- Visitas ---
const EXPEDIENTE_RESUMEN = {
  id_expediente: true, codigo_expediente: true, tipo_credito: true, tipo_documento_cliente: true, numero_documento_cliente: true,
  nombres_cliente: true, direccion_domicilio: true, distrito: true, oficina: true, asesor_responsable: true,
};

const SNAPSHOT_CAMPOS = [
  'id_expediente', 'codigo_expediente', 'tipo_credito', 'oficina', 'tipo_documento_cliente', 'numero_documento_cliente',
  'nombres_cliente', 'telefono_cliente', 'direccion_domicilio', 'distrito', 'provincia', 'departamento', 'latitud', 'longitud',
  'ubicacion_origen', 'asesor_responsable', 'monto_desembolso', 'moneda', 'datos_cliente', 'datos_negocio', 'datos_credito',
  'evaluacion_financiera', 'endeudamiento', 'id_importacion', 'fila_origen', 'hash_origen', 'advertencias_origen',
];

// Congela los datos de la base tal como los vio el auditor. Si el expediente se reimporta o
// se corrige después, la ficha ya cerrada (y su Word) sigue mostrando lo que se auditó.
function snapshotExpediente(expediente) {
  return serialize(Object.fromEntries(SNAPSHOT_CAMPOS.map((campo) => [campo, expediente[campo] ?? null])));
}

const plantillaDe = (expediente) => (expediente.tipo_credito === 'OTROS' ? 'MYPE_V1' : 'CONSUMO_V1');

// Reglas propias de la ficha MYPE. Solo se exigen si la app declara plantilla MYPE_V1: las
// apps anteriores (sin estos campos) siguen pudiendo enviar visitas.
// Si el auditor llegó al cliente (CONFORME/OBSERVADO) deben estar las 3 preguntas anti-fraude y la
// firma; en NO_UBICADO / RECHAZADO el cliente no está o no quiere, y eso no se puede exigir.
function validarFichaBasica(payload) {
  if (!['CONFORME', 'OBSERVADO'].includes(payload.resultado)) return;
  const r = payload.respuestas_cuestionario || {};
  if ([r.entrego_dinero_asesor, r.pago_comision_adicional, r.recibio_monto_total].some((v) => typeof v !== 'boolean')) {
    throw Object.assign(new Error('Responde las 3 preguntas obligatorias del cuestionario.'), { statusCode: 422, code: 'CUESTIONARIO_INCOMPLETO' });
  }
  if (!payload.firma_evidencia) {
    throw Object.assign(new Error('Falta la firma del cliente.'), { statusCode: 422, code: 'FIRMA_REQUIRED' });
  }
}

function validarFichaMype(payload) {
  if (payload.plantilla !== 'MYPE_V1') return;
  if (!['CONFORME', 'OBSERVADO'].includes(payload.resultado)) return;
  if (!payload.estado_negocio) throw Object.assign(new Error('Indica el estado del negocio (en funcionamiento, inoperativo o de terceros).'), { statusCode: 422, code: 'ESTADO_NEGOCIO_REQUIRED' });
  if (!payload.propiedad_local) throw Object.assign(new Error('Indica la propiedad del local.'), { statusCode: 422, code: 'PROPIEDAD_LOCAL_REQUIRED' });
  const conformidad = payload.conformidad_financiera;
  if (!conformidad) throw Object.assign(new Error('Registra el análisis y conformidad de la evaluación financiera (ingresos, balance y resultados).'), { statusCode: 422, code: 'CONFORMIDAD_REQUIRED' });
  const observados = Object.entries(conformidad).filter(([, bloque]) => bloque.conforme === false);
  for (const [nombre, bloque] of observados) {
    if (!bloque.comentario || bloque.comentario.trim().length < 5) {
      throw Object.assign(new Error(`Explica la observación en "${nombre}" de la evaluación financiera.`), { statusCode: 422, code: 'CONFORMIDAD_COMMENT_REQUIRED' });
    }
  }
  if (payload.resultado === 'CONFORME') {
    if (payload.estado_negocio !== 'EN_FUNCIONAMIENTO') {
      throw Object.assign(new Error('Un negocio inoperativo o de terceros no puede registrarse como CONFORME. Usa OBSERVADO y explica el motivo.'), { statusCode: 422, code: 'NEGOCIO_NO_CONFORME' });
    }
    if (observados.length) {
      throw Object.assign(new Error('Hay observaciones en la evaluación financiera: la visita no puede registrarse como CONFORME.'), { statusCode: 422, code: 'CONFORMIDAD_OBSERVADA' });
    }
  }
}

// La distancia se mide contra el punto que el auditor declaró visitar: el domicilio de la persona o,
// en MYPE, uno de los negocios. Sin ese dato (apps anteriores) se usa el domicilio, como siempre.
function evaluarSenales({ punto, payload, serverNow }) {
  const alertas = [];
  let distancia = null;
  if (punto.latitud != null && punto.longitud != null) {
    distancia = haversineMeters(punto.latitud, punto.longitud, payload.latitud, payload.longitud);
    if (distancia > env.GEOFENCE_RADIO_METROS) alertas.push('GEOCERCA_EXCEDIDA');
  }
  if (payload.precision_metros != null && payload.precision_metros > env.GEOFENCE_PRECISION_MAXIMA_METROS) {
    alertas.push('PRECISION_INSUFICIENTE');
  }
  const checkin = new Date(payload.fecha_hora_checkin);
  if (checkin.getTime() - serverNow.getTime() > 5 * 60 * 1000) alertas.push('FECHA_FUTURA');
  return { alertas, distancia };
}

async function crearVisita(auditorId, payload) {
  if (payload.client_sync_id) {
    const existente = await prisma.visitaAuditoria.findUnique({ where: { client_sync_id: payload.client_sync_id } });
    if (existente) {
      if (existente.id_usuario_auditor !== auditorId) throw Object.assign(new Error('El identificador de sincronización ya está en uso.'), { statusCode: 409, code: 'SYNC_ID_CONFLICT' });
      return { ...serialize(existente), _already_synced: true };
    }
  }

  // Señales anti-fraude "duras": una ubicación simulada o un dispositivo comprometido
  // nunca se aceptan, sin importar el resultado que el auditor quiera registrar.
  if (payload.mock_location) {
    throw Object.assign(new Error('Se detectó una ubicación simulada (Fake GPS). No se puede registrar la visita.'), { statusCode: 422, code: 'MOCK_LOCATION_DETECTED' });
  }
  if (payload.device_integrity_ok === false) {
    throw Object.assign(new Error('Se detectaron indicios de manipulación del dispositivo (root, jailbreak o emulador). No se puede registrar la visita.'), { statusCode: 422, code: 'DEVICE_INTEGRITY_FAILED' });
  }

  const asignacion = await requireActiveAssignment(auditorId, payload.id_expediente);
  const expediente = await prisma.expediente.findUnique({ where: { id_expediente: payload.id_expediente } });
  if (!expediente) throw Object.assign(new Error('Expediente no encontrado'), { statusCode: 404 });
  const plantillaEsperada = plantillaDe(expediente);
  if (payload.plantilla && payload.plantilla !== plantillaEsperada) {
    throw Object.assign(new Error(`Este expediente es de crédito ${expediente.tipo_credito}: corresponde la ficha ${plantillaEsperada}, no ${payload.plantilla}.`), { statusCode: 422, code: 'TEMPLATE_MISMATCH' });
  }
  validarFichaBasica(payload);
  validarFichaMype(payload);
  const punto = puntoDeReferencia(expediente, payload.ubicacion_visitada || 'DOMICILIO', payload.indice_negocio ?? 0);
  if (!punto) {
    throw Object.assign(new Error('Este expediente no tiene ese negocio para visitar. Elige el domicilio o actualiza tu muestra.'), { statusCode: 422, code: 'DESTINO_INVALIDO' });
  }

  const serverNow = new Date();
  const { alertas, distancia } = evaluarSenales({ punto, payload, serverNow });
  // Señales "blandas" (geocerca, precisión, reloj adelantado): no se bloquean, porque
  // pueden tener explicaciones legítimas, pero se obliga a declararlas — el auditor no
  // puede marcar la visita como CONFORME sin dejar constancia del motivo.
  if (alertas.length) {
    if (payload.resultado === 'CONFORME') {
      throw Object.assign(new Error(`La visita presenta observaciones (${alertas.join(', ')}) y no puede marcarse como CONFORME.`), { statusCode: 422, code: 'LOCATION_SIGNAL_MISMATCH', alertas });
    }
    if (!payload.comentario_auditor || payload.comentario_auditor.trim().length < 10) {
      throw Object.assign(new Error(`Explica en el comentario del auditor por qué ocurrió: ${alertas.join(', ')}.`), { statusCode: 422, code: 'EXPLANATION_REQUIRED', alertas });
    }
  }

  const principal = await storageService.verifyUploaded(payload.evidencia_principal_key, auditorId, payload.id_expediente, 'FOTO_PRINCIPAL');
  const adicional = payload.evidencia_adicional_key
    ? await storageService.verifyUploaded(payload.evidencia_adicional_key, auditorId, payload.id_expediente, 'FOTO_ADICIONAL')
    : null;
  if (adicional && principal.hash === adicional.hash) {
    throw Object.assign(new Error('Debes registrar dos fotografías diferentes.'), { statusCode: 400, code: 'DUPLICATE_EVIDENCE' });
  }
  for (const evidencia of [principal, adicional].filter(Boolean)) {
    const existente = await prisma.evidencia.findUnique({ where: { hash_sha256: evidencia.hash } });
    if (existente) throw Object.assign(new Error('Una de las fotografías ya fue utilizada como evidencia en otra visita.'), { statusCode: 409, code: 'EVIDENCE_REUSED' });
  }

  const visita = await prisma.$transaction(async tx => {
    const created = await tx.visitaAuditoria.create({
      data: {
        client_sync_id: payload.client_sync_id || null,
        id_asignacion: asignacion.id_asignacion,
        id_expediente: payload.id_expediente,
        id_usuario_auditor: auditorId,
        fecha_hora_checkin: new Date(payload.fecha_hora_checkin),
        fecha_hora_checkout: serverNow,
        latitud: payload.latitud, longitud: payload.longitud,
        precision_metros: payload.precision_metros ?? null,
        distancia_domicilio_m: distancia, // distancia al punto visitado (domicilio o negocio)
        ubicacion_visitada: punto.destino,
        direccion_visitada: punto.direccion ? punto.direccion.slice(0, 255) : null,
        mock_location: false, device_integrity_ok: true,
        device_id: payload.device_id || null,
        server_received_at: serverNow,
        resultado: payload.resultado,
        respuestas_cuestionario: payload.respuestas_cuestionario,
        comentario_negocio: payload.comentario_negocio || null,
        comentario_auditor: payload.comentario_auditor || null,
        otros_clientes_domicilio: payload.otros_clientes_domicilio || undefined,
        otros_ingresos: payload.otros_ingresos || undefined,
        firma_evidencia: payload.firma_evidencia || null,
        plantilla: plantillaEsperada,
        expediente_snapshot: snapshotExpediente(expediente),
        estado_negocio: payload.estado_negocio || null,
        propiedad_local: payload.propiedad_local || null,
        otros_pasivos: payload.otros_pasivos || null,
        conformidad_financiera: payload.conformidad_financiera || undefined,
        firmante_documento: payload.firmante_documento || null,
        estado: 'CERRADA',
      },
    });
    await tx.evidencia.create({ data: { id_visita: created.id_visita, tipo: 'FOTO_PRINCIPAL', object_key: principal.key, hash_sha256: principal.hash, latitud_captura: payload.latitud, longitud_captura: payload.longitud, capturado_en: new Date(payload.fecha_hora_checkin) } });
    if (adicional) await tx.evidencia.create({ data: { id_visita: created.id_visita, tipo: 'FOTO_ADICIONAL', object_key: adicional.key, hash_sha256: adicional.hash, latitud_captura: payload.latitud, longitud_captura: payload.longitud, capturado_en: new Date(payload.fecha_hora_checkin) } });
    // Sin coordenadas en la base, la primera visita limpia (sin alertas y con resultado que
    // implique haber llegado al domicilio) fija la ubicación de referencia. Queda marcada
    // PRIMERA_VISITA y en el historial del expediente para que se pueda revisar.
    // Lo mismo vale para el negocio: si no tenía ubicación, la primera visita limpia a ese negocio la fija.
    const fijaUbicacion = punto.latitud == null && !alertas.length && ['CONFORME', 'OBSERVADO'].includes(payload.resultado);
    const esNegocio = punto.destino === 'NEGOCIO';
    await tx.expediente.update({
      where: { id_expediente: payload.id_expediente },
      data: {
        estado: 'VISITADO',
        ...(fijaUbicacion && !esNegocio ? { latitud: payload.latitud, longitud: payload.longitud, ubicacion_origen: 'PRIMERA_VISITA' } : {}),
        ...(fijaUbicacion && esNegocio ? { datos_negocio: conUbicacionNegocio(expediente.datos_negocio, punto.indice, payload.latitud, payload.longitud, 'PRIMERA_VISITA') } : {}),
      },
    });
    if (fijaUbicacion) {
      const prefijo = esNegocio ? `negocio_${punto.indice + 1}_` : '';
      await tx.expedienteCambio.create({
        data: { id_expediente: payload.id_expediente, actor_id: auditorId, tipo: 'UBICACION', cambios: { [`${prefijo}latitud`]: { antes: null, despues: payload.latitud }, [`${prefijo}longitud`]: { antes: null, despues: payload.longitud }, [`${prefijo}ubicacion_origen`]: { antes: null, despues: 'PRIMERA_VISITA' }, id_visita: created.id_visita } },
      });
    }
    await tx.asignacionAuditoria.update({ where: { id_asignacion: asignacion.id_asignacion }, data: { estado: 'FINALIZADA', fecha_fin: serverNow } });
    return created;
  });
  return { ...serialize(visita), _alertas: alertas };
}

async function listar({ page = 1, limit = 25, estado, id_usuario_auditor, resultado, tipo_credito, con_alertas } = {}) {
  const where = {
    ...(estado ? { estado } : {}),
    ...(id_usuario_auditor ? { id_usuario_auditor } : {}),
    ...(resultado ? { resultado } : {}),
    ...(tipo_credito ? { expediente: { tipo_credito } } : {}),
    ...(con_alertas === 'true' ? { OR: [{ mock_location: true }, { device_integrity_ok: false }, { resultado: { in: ['OBSERVADO', 'RECHAZADO'] } }] } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.visitaAuditoria.findMany({
      where, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit,
      // Listado liviano: sin los bloques JSON del expediente, el snapshot ni la firma.
      omit: { expediente_snapshot: true, firma_evidencia: true, conformidad_financiera: true },
      include: { expediente: { select: EXPEDIENTE_RESUMEN }, auditor: { select: { id_usuario: true, username: true, nombres: true, apellidos: true } }, evidencias: true },
    }),
    prisma.visitaAuditoria.count({ where }),
  ]);
  return { data: serialize(data), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function obtener(id) {
  const visita = await prisma.visitaAuditoria.findUnique({
    where: { id_visita: id },
    include: { expediente: true, auditor: { select: { id_usuario: true, username: true, nombres: true, apellidos: true } }, evidencias: true },
  });
  if (!visita) throw Object.assign(new Error('Visita no encontrada'), { statusCode: 404 });

  // Trazabilidad: quién asignó la muestra, cuándo, y de qué archivo salieron los datos que vio el auditor.
  const asignacion = visita.id_asignacion ? await prisma.asignacionAuditoria.findUnique({ where: { id_asignacion: visita.id_asignacion } }) : null;
  const asignador = asignacion?.asignado_por
    ? await prisma.usuario.findUnique({ where: { id_usuario: asignacion.asignado_por }, select: { username: true, nombres: true, apellidos: true } })
    : null;
  const idImportacion = visita.expediente_snapshot?.id_importacion || visita.expediente.id_importacion;
  const importacion = idImportacion
    ? await prisma.importacionMasiva.findUnique({ where: { id_importacion: idImportacion }, select: { id_importacion: true, archivo: true, formato: true, archivo_sha256: true, fecha_creacion: true } })
    : null;
  const cambiosUbicacion = await prisma.expedienteCambio.findMany({
    where: { id_expediente: visita.id_expediente, tipo: 'UBICACION' }, orderBy: { fecha: 'desc' }, take: 5,
  });
  return serialize({
    ...visita,
    trazabilidad: {
      asignacion: asignacion ? { id_asignacion: asignacion.id_asignacion, fecha_asignacion: asignacion.fecha_asignacion, fecha_fin: asignacion.fecha_fin, origen: asignacion.origen, prioridad: asignacion.prioridad, asignado_por: asignador } : null,
      importacion,
      geocerca_m: env.GEOFENCE_RADIO_METROS,
      cambios_ubicacion: cambiosUbicacion.map((c) => ({ ...c, id_cambio: String(c.id_cambio) })),
    },
  });
}

async function obtenerArchivoEvidencia(idEvidencia) {
  const evidencia = await prisma.evidencia.findUnique({ where: { id_evidencia: idEvidencia } });
  if (!evidencia) throw Object.assign(new Error('Evidencia no encontrada'), { statusCode: 404 });
  return { path: storageService.absolutePath(evidencia.object_key), tipo: evidencia.tipo };
}

async function actualizarUbicacionEnVivo(usuarioId, payload) {
  const latitud = Number(payload.latitud); const longitud = Number(payload.longitud);
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud) || Math.abs(latitud) > 90 || Math.abs(longitud) > 180) {
    throw Object.assign(new Error('Las coordenadas recibidas no son válidas.'), { statusCode: 400 });
  }
  const precision = payload.precision != null ? Number(payload.precision) : null;
  const simulada = payload.simulada === true;
  const bateria = payload.bateria != null ? Math.round(Number(payload.bateria)) : null;
  const cargando = payload.cargando === true;
  const ahora = new Date();
  const [usuario] = await prisma.$transaction([
    prisma.usuario.update({ where: { id_usuario: usuarioId }, data: { latitud, longitud, ubicacion_en: ahora, ubicacion_precision: precision, ubicacion_simulada: simulada, bateria_porcentaje: bateria, bateria_cargando: cargando }, select: { id_usuario: true, username: true, nombres: true, apellidos: true, latitud: true, longitud: true } }),
    // Se conserva cada punto (no solo el último) para poder reconstruir la ruta recorrida
    // en el mapa de supervisión, tal como pide el flujo (Fase 2/Fase 6).
    prisma.trackingUbicacion.create({ data: { id_usuario: usuarioId, latitud, longitud, precision_metros: precision, simulada, registrado_en: ahora } }),
  ]);
  // Avisos de llegada/salida: un fallo aquí nunca debe impedir que la posición quede registrada.
  let eventos = [];
  try { eventos = await registrarEventosDeCampo(usuarioId, { latitud, longitud, precision, simulada }); } catch (error) { logger.warn({ err: error.message }, 'eventos_campo_fallo'); }
  return serialize({ ...usuario, precision, simulada, bateria, cargando, actualizado_en: ahora, fecha: ahora, eventos });
}

// Jornada de campo: INICIAR / TERMINAR. Queda en el usuario y en el registro de auditoría (cada llamada a la API se registra).
async function registrarJornada(usuarioId, accion) {
  const ahora = new Date();
  const data = accion === 'INICIAR' ? { jornada_inicio: ahora, jornada_fin: null } : { jornada_fin: ahora };
  const u = await prisma.usuario.update({ where: { id_usuario: usuarioId }, data, select: { id_usuario: true, username: true, nombres: true, apellidos: true, jornada_inicio: true, jornada_fin: true } });
  const enJornada = Boolean(u.jornada_inicio) && (!u.jornada_fin || u.jornada_fin < u.jornada_inicio);
  return serialize({ id_usuario: u.id_usuario, username: u.username, nombres: u.nombres, apellidos: u.apellidos, en_jornada: enJornada, jornada_inicio: u.jornada_inicio, jornada_fin: u.jornada_fin });
}

export default { presignEvidencia, recibirEvidencia, crearVisita, listar, obtener, obtenerArchivoEvidencia, actualizarUbicacionEnVivo, registrarJornada };
