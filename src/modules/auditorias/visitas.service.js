import prisma from '#core/config/prisma.js';
import storageService from '#modules/sistema/storage.service.js';
import { env } from '#core/config/env.js';
import { haversineMeters } from '#core/security/geofence.js';
import { negociosDe, puntoDeReferencia, conUbicacionNegocio } from '#modules/expedientes/ubicaciones.js';
import { propagarUbicacionAVecinos } from '#modules/geocodificacion/vecinos.js';
import { registrarEventosDeCampo, invalidarPuntos } from './eventos-campo.js';
import { estadoDeMovimiento } from '#modules/usuarios/movimiento.js';
import { decidirPunto } from '#modules/usuarios/recorrido.js';
import { reglas as reglasEmpresa } from '#modules/empresas/empresas.service.js';
import { logger } from '#core/config/logger.js';
import { cierreAlReiniciar, textoZona, zonaDeJornada } from './jornada.core.js';
import { conteosPorResultado, construirDonde, fechaYHora, filaVisitaCsv, COLUMNAS_CSV } from './visitas.filtros.js';
import { filaCsv } from '#modules/sistema/seguridad.filtros.js';
import { once } from 'node:events';
import { validarFirmaAuditor } from './firma-auditor.js';
import ExcelJS from 'exceljs';
import { publica as empresaPublica } from '#modules/empresas/empresas.service.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { COLUMNAS, COLOR_GRUPO, COLOR_RESULTADO, ETIQUETA_RESULTADO, filaVisitaXlsx, descripcionDeFiltros, idx } from './visitas.excel.js';

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
  const existente = await prisma.evidencia.findFirst({ where: { hash_sha256: hash } });
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
const ZONA_RADIO_POR_DEFECTO_M = 1000;

// Sin referencia todavía, la ubicación aproximada que ya se conoce (sugerencia del mapa o de las visitas vecinas de la zona) sirve para
// comprobar que el auditor está al menos en la zona: una primera visita hecha desde otro lugar no fija la referencia ni pasa como conforme.
function zonaDe(expediente, punto) {
  if (!expediente || punto.latitud != null) return null;
  const g = punto.destino === 'NEGOCIO' ? negociosDe(expediente)[punto.indice]?.geo : { latitud: expediente.geo_latitud, longitud: expediente.geo_longitud };
  if (g?.latitud == null || g?.longitud == null) return null;
  const latitud = Number(g.latitud);
  const longitud = Number(g.longitud);
  return Number.isFinite(latitud) && Number.isFinite(longitud) ? { latitud, longitud } : null;
}

function evaluarSenales({ punto, zona = null, payload, serverNow, reglas }) {
  const alertas = [];
  let distancia = null;
  if (punto.latitud != null && punto.longitud != null) {
    distancia = haversineMeters(punto.latitud, punto.longitud, payload.latitud, payload.longitud);
    if (distancia > reglas.geocerca_radio_m) alertas.push('GEOCERCA_EXCEDIDA');
  } else if (zona) {
    const distanciaZona = haversineMeters(zona.latitud, zona.longitud, payload.latitud, payload.longitud);
    if (distanciaZona > (reglas.zona_radio_m ?? ZONA_RADIO_POR_DEFECTO_M)) alertas.push('FUERA_DE_ZONA');
  }
  if (payload.precision_metros != null && payload.precision_metros > reglas.precision_maxima_m) {
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
  validarFirmaAuditor(payload, env.FIRMA_AUDITOR_OBLIGATORIA === 'true');
  validarFichaMype(payload);
  const punto = puntoDeReferencia(expediente, payload.ubicacion_visitada || 'DOMICILIO', payload.indice_negocio ?? 0);
  if (!punto) {
    throw Object.assign(new Error('Este expediente no tiene ese negocio para visitar. Elige el domicilio o actualiza tu muestra.'), { statusCode: 422, code: 'DESTINO_INVALIDO' });
  }

  const serverNow = new Date();
  const { alertas, distancia } = evaluarSenales({ reglas: await reglasEmpresa(), punto, zona: zonaDe(expediente, punto), payload, serverNow });
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
    const existente = await prisma.evidencia.findFirst({ where: { hash_sha256: evidencia.hash } });
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
        firma_auditor: payload.firma_auditor || null,
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
  // Si esta visita fijó la referencia del domicilio, los vecinos de su manzana reciben la misma ubicación y los de su zona una sugerencia.
  if (punto.destino !== 'NEGOCIO' && punto.latitud == null && !alertas.length && ['CONFORME', 'OBSERVADO'].includes(payload.resultado)) {
    await propagarUbicacionAVecinos(payload.id_expediente, { actorId: auditorId });
  }
  invalidarPuntos(); // la asignación pasó a FINALIZADA: los avisos de llegada/salida deben releerla ya
  return { ...serialize(visita), _alertas: alertas };
}

// Lo más reciente primero. El id desempata las visitas del mismo instante, así las páginas no repiten ni saltan filas.
const ORDEN_LISTA = [{ fecha_hora_checkin: 'desc' }, { id_visita: 'desc' }];
const AUDITOR_RESUMEN = { id_usuario: true, username: true, nombres: true, apellidos: true };

// Lista paginada con los filtros de la pantalla Visitas (resultado y ficha de uno o varios, fechas del usuario, auditor, alertas y búsqueda). Además de la
// página trae cuántas visitas habría de cada resultado con los DEMÁS filtros puestos: son los números que acompañan a cada opción de «Resultado».
async function listar(consulta = {}) {
  const { page = 1, limit = 25 } = consulta;
  const where = construirDonde(consulta);
  const [data, total, porResultado] = await Promise.all([
    prisma.visitaAuditoria.findMany({
      where, orderBy: ORDEN_LISTA, skip: (page - 1) * limit, take: limit,
      // Listado liviano: sin los bloques JSON del expediente, el snapshot ni la firma; de las fotos solo se necesita saber cuántas hay.
      omit: { expediente_snapshot: true, firma_evidencia: true, firma_auditor: true, conformidad_financiera: true },
      include: { expediente: { select: EXPEDIENTE_RESUMEN }, auditor: { select: AUDITOR_RESUMEN }, evidencias: { select: { id_evidencia: true } } },
    }),
    prisma.visitaAuditoria.count({ where }),
    prisma.visitaAuditoria.groupBy({ by: ['resultado'], where: construirDonde(consulta, { sinResultado: true }), _count: { _all: true } }),
  ]);
  return { data: serialize(data), pagination: { page, limit, total, pages: Math.ceil(total / limit) }, conteos: conteosPorResultado(porResultado) };
}

// Exporta a CSV las visitas que cumplen los filtros, por lotes con cursor (fecha, id), sin cargarlas todas en memoria y sin tope de filas. `escribir(texto)`
// devuelve una promesa que se resuelve cuando se puede seguir escribiendo; `cancelado()` avisa si el cliente cortó la descarga.
async function exportarCsv(consulta, { escribir, cancelado = () => false, lote = 500 }) {
  const base = construirDonde(consulta);
  const desfase = consulta.desfase || 0;
  const radioM = (await reglasEmpresa()).geocerca_radio_m;
  await escribir('\uFEFF' + filaCsv(COLUMNAS_CSV));
  let cursor = null; let filas = 0;
  for (;;) {
    if (cancelado()) break;
    const where = cursor ? { AND: [base, { OR: [{ fecha_hora_checkin: { lt: cursor.fecha } }, { fecha_hora_checkin: cursor.fecha, id_visita: { lt: cursor.id } }] }] } : base;
    const pagina = await prisma.visitaAuditoria.findMany({
      where, orderBy: ORDEN_LISTA, take: lote,
      omit: { expediente_snapshot: true, firma_evidencia: true, firma_auditor: true, conformidad_financiera: true },
      include: { expediente: { select: { ...EXPEDIENTE_RESUMEN, oficina: true } }, auditor: { select: AUDITOR_RESUMEN }, evidencias: { select: { id_evidencia: true } } },
    });
    if (!pagina.length) break;
    await escribir(pagina.map((v) => filaVisitaCsv(v, { desfase, radioM })).join(''));
    filas += pagina.length;
    const ultima = pagina[pagina.length - 1];
    cursor = { fecha: ultima.fecha_hora_checkin, id: ultima.id_visita };
    if (pagina.length < lote) break;
  }
  return { filas };
}

// Reporte de visitas en Excel con formato (el que baja el panel): las mismas visitas filtradas que el CSV, por lotes con cursor y escritas al archivo a medida que
// salen (sin tope de filas ni cargar todo en memoria). Hoja «Resumen» (filtros usados y visitas por resultado) y hoja «Visitas» con una fila por visita.
// `stream` es donde se escribe el .xlsx (la respuesta HTTP); `cancelado()` avisa si el cliente cortó la descarga; `antesDeCerrar({ filas })` se llama justo antes de terminar el archivo.
// Alto de la fila (en puntos) según cuántas líneas ocupa el texto que se ajusta dentro de su celda: Excel no lo calcula solo al abrir un archivo escrito por partes.
function alturaDeFila(valores) {
  let lineas = 1;
  COLUMNAS.forEach((c, i) => {
    if (!(c.ajustar || c.t === 'Alertas' || c.t === 'Dirección registrada' || c.t === 'Dirección visitada')) return;
    const texto = String(valores[i] ?? '');
    if (texto) lineas = Math.max(lineas, Math.ceil((texto.length * 1.1) / c.w));
  });
  return Math.min(180, Math.max(22, lineas * 13.5 + 8));
}

async function exportarXlsx(consulta, { stream, cancelado = () => false, antesDeCerrar = () => {}, lote = 500 }) {
  const base = construirDonde(consulta);
  const desfase = consulta.desfase || 0;
  const [reglas, porResultado, auditor, empresa] = await Promise.all([
    reglasEmpresa(),
    prisma.visitaAuditoria.groupBy({ by: ['resultado'], where: base, _count: { _all: true } }),
    consulta.id_usuario_auditor ? prisma.usuario.findFirst({ where: { id_usuario: consulta.id_usuario_auditor }, select: { username: true, nombres: true, apellidos: true } }) : null,
    Promise.resolve(empresaPublica(empresaActual())).catch(() => null),
  ]);
  const radioM = reglas.geocerca_radio_m;
  const conteos = conteosPorResultado(porResultado);
  const borde = { bottom: { style: 'thin', color: { argb: 'FFE5E8F2' } } };
  const relleno = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useStyles: true, useSharedStrings: false });
  wb.creator = 'Auditoría de Visitas';
  wb.created = new Date();

  // ---- Resumen
  const rs = wb.addWorksheet('Resumen', { views: [{ showGridLines: false }], pageSetup: { orientation: 'portrait', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
  rs.getColumn(1).width = 30; rs.getColumn(2).width = 16; rs.getColumn(3).width = 12; rs.getColumn(4).width = 46;
  const [hoyDia, hoyHora] = fechaYHora(new Date(), desfase);
  // `unir` = [desde, hasta]: columnas que se juntan en una sola celda (para que un texto largo no se salga de la hoja).
  const escribir = (valores, { font = {}, alto, unir } = {}) => {
    const fila = rs.addRow(valores);
    fila.font = { name: 'Calibri', size: 11, ...font };
    if (unir) { rs.mergeCells(fila.number, unir[0], fila.number, unir[1]); fila.getCell(unir[0]).alignment = { vertical: 'top', wrapText: true }; }
    if (alto) fila.height = alto;
    fila.commit();
  };
  escribir(['Reporte de visitas'], { font: { size: 20, bold: true, color: { argb: 'FF2F3E9E' } }, alto: 32 });
  escribir([`${empresa?.nombre || 'Auditoría de Visitas'} · generado el ${hoyDia} a las ${hoyHora}`], { font: { color: { argb: 'FF6B7194' } } });
  escribir([]);
  escribir(['Filtros aplicados'], { font: { bold: true, size: 13, color: { argb: 'FF2F3E9E' } } });
  const nombreAuditor = auditor ? ([auditor.nombres, auditor.apellidos].filter(Boolean).join(' ') || auditor.username) : null;
  for (const [k, v] of descripcionDeFiltros(consulta, { nombreAuditor })) escribir([k, v], { unir: [2, 4] });
  escribir([]);
  escribir(['Visitas por resultado'], { font: { bold: true, size: 13, color: { argb: 'FF2F3E9E' } } });
  for (const r of ['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO']) {
    const fila = rs.addRow([ETIQUETA_RESULTADO[r], conteos[r], conteos.total ? conteos[r] / conteos.total : 0]);
    const c = COLOR_RESULTADO[r];
    fila.getCell(1).fill = relleno(c.fondo); fila.getCell(1).font = { name: 'Calibri', bold: true, color: { argb: c.texto } };
    fila.getCell(2).numFmt = '#,##0'; fila.getCell(2).alignment = { horizontal: 'left' };
    fila.getCell(3).numFmt = '0%'; fila.getCell(3).alignment = { horizontal: 'left' };
    fila.commit();
  }
  const total = rs.addRow(['Total', conteos.total]);
  total.font = { name: 'Calibri', bold: true }; total.getCell(2).numFmt = '#,##0'; total.getCell(2).alignment = { horizontal: 'left' };
  total.commit();
  escribir([]);
  escribir(['Cómo leer la hoja «Visitas»'], { font: { bold: true, size: 13, color: { argb: 'FF2F3E9E' } } });
  for (const t of [
    'Una fila por visita, de la más reciente a la más antigua. Las columnas están agrupadas por tema (franja de colores de arriba).',
    'La columna «Alertas» dice en palabras por qué conviene mirar esa visita: GPS simulado, dispositivo no íntegro, fuera de la geocerca, sin fotografías o una respuesta del cliente que preocupa.',
    `La geocerca de esta empresa es de ${radioM} m. Las celdas en rojo son lo que salió mal; en verde, los controles que salieron bien.`,
    '«Latitud/Longitud del cliente» es el punto de referencia del domicilio; «De dónde salió el punto» dice si vino de la base, del mapa, de un supervisor o de la primera visita.',
  ]) escribir([t], { font: { color: { argb: 'FF4B5170' } }, unir: [1, 4], alto: 32 });
  await rs.commit();

  // ---- Visitas
  const ws = wb.addWorksheet('Visitas', {
    views: [{ state: 'frozen', xSplit: 4, ySplit: 2, showGridLines: false }],
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  COLUMNAS.forEach((c, i) => { ws.getColumn(i + 1).width = c.w; });
  // Franja de grupos (fila 1) y títulos (fila 2).
  const franja = ws.addRow(COLUMNAS.map((c, i) => (i === 0 || COLUMNAS[i - 1].g !== c.g ? c.g : null)));
  const titulos = ws.addRow(COLUMNAS.map((c) => c.t));
  franja.height = 22; titulos.height = 44;
  COLUMNAS.forEach((c, i) => {
    const celdaF = franja.getCell(i + 1); const celdaT = titulos.getCell(i + 1);
    celdaF.fill = relleno(COLOR_GRUPO[c.g]); celdaF.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    celdaF.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    celdaT.fill = relleno('FFE8ECF9'); celdaT.font = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FF2F3E9E' } };
    celdaT.alignment = { vertical: 'middle', horizontal: c.c ? 'center' : 'left', wrapText: true };
    celdaT.border = { bottom: { style: 'medium', color: { argb: 'FF2F3E9E' } } };
  });
  franja.commit(); titulos.commit();
  const IDX_RESULTADO = idx('Resultado');
  let cursor = null; let filas = 0;
  for (;;) {
    if (cancelado()) break;
    const where = cursor ? { AND: [base, { OR: [{ fecha_hora_checkin: { lt: cursor.fecha } }, { fecha_hora_checkin: cursor.fecha, id_visita: { lt: cursor.id } }] }] } : base;
    const pagina = await prisma.visitaAuditoria.findMany({
      where, orderBy: ORDEN_LISTA, take: lote,
      omit: { expediente_snapshot: true, firma_evidencia: true, firma_auditor: true, conformidad_financiera: true },
      include: { expediente: { select: { ...EXPEDIENTE_RESUMEN, latitud: true, longitud: true, ubicacion_origen: true } }, auditor: { select: AUDITOR_RESUMEN }, evidencias: { select: { id_evidencia: true } } },
    });
    if (!pagina.length) break;
    for (const v of pagina) {
      const { valores, malas, buenas } = filaVisitaXlsx(v, { desfase, radioM });
      const fila = ws.addRow(valores);
      fila.height = alturaDeFila(valores);
      const zebra = filas % 2 === 1 ? relleno('FFF7F8FC') : null;
      COLUMNAS.forEach((c, i) => {
        const celda = fila.getCell(i + 1);
        celda.font = { name: 'Calibri', size: 10, color: { argb: 'FF1F2340' } };
        celda.alignment = { vertical: c.ajustar ? 'top' : 'middle', horizontal: c.c ? 'center' : 'left', wrapText: Boolean(c.ajustar || c.t === 'Alertas' || c.t === 'Dirección registrada' || c.t === 'Dirección visitada') };
        celda.border = borde;
        if (c.f) celda.numFmt = c.f;
        if (zebra) celda.fill = zebra;
        if (malas.has(i)) { celda.fill = relleno('FFFCEBED'); celda.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFA33C43' } }; }
        else if (buenas.has(i)) celda.font = { name: 'Calibri', size: 10, color: { argb: 'FF267254' } };
      });
      const rc = COLOR_RESULTADO[v.resultado];
      if (rc) { const c = fila.getCell(IDX_RESULTADO + 1); c.fill = relleno(rc.fondo); c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: rc.texto } }; }
      fila.commit();
      filas += 1;
    }
    // Si la conexión va lenta se espera a que se vacíe el búfer en vez de acumular el archivo en memoria.
    if (stream.writableNeedDrain && !cancelado()) await once(stream, 'drain');
    const ultima = pagina[pagina.length - 1];
    cursor = { fecha: ultima.fecha_hora_checkin, id: ultima.id_visita };
    if (pagina.length < lote) break;
  }
  ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: COLUMNAS.length } };
  antesDeCerrar({ filas }); // al cerrar el archivo se termina la respuesta: lo que hay que anotar en el registro de seguridad se deja listo antes
  await ws.commit();
  await wb.commit();
  return { filas };
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
      geocerca_m: (await reglasEmpresa()).geocerca_radio_m,
      cambios_ubicacion: cambiosUbicacion.map((c) => ({ ...c, id_cambio: String(c.id_cambio) })),
    },
  });
}

async function obtenerArchivoEvidencia(idEvidencia) {
  const evidencia = await prisma.evidencia.findUnique({ where: { id_evidencia: idEvidencia } });
  if (!evidencia) throw Object.assign(new Error('Evidencia no encontrada'), { statusCode: 404 });
  return { bytes: await storageService.readEvidence(evidencia.object_key), tipo: evidencia.tipo };
}

// Últimos puntos buenos de cada auditor en la última hora, para calcular cómo se mueve. Se leen de la base UNA vez (al primer punto tras arrancar
// el servidor) y desde ahí se mantienen en memoria: antes cada posición volvía a leer hasta 59 filas.
const MOV_VENTANA_MS = 60 * 60 * 1000;
const MOV_MAX_PUNTOS = 59;
const MOV_MAX_AUDITORES = 5000;
// Sin un punto bueno hace más de esto, una posición imprecisa pasa a ser la posición en vivo (con su radio de error): mejor «por aquí, ±600 m» que «sin señal».
const IMPRECISA_MANDA_TRAS_MS = 2 * 60 * 1000;
const memoriaMov = new Map(); // id del auditor → [{ latitud, longitud, fecha: Date }] (del más antiguo al más reciente)
const memoriaSalto = new Map(); // id del auditor → último punto apartado por salto (ver recorrido.js)
async function puntosPrevios(usuarioId, ahora) {
  let lista = memoriaMov.get(usuarioId);
  if (!lista) {
    const filas = await prisma.trackingUbicacion.findMany({
      where: { id_usuario: usuarioId, simulada: false, registrado_en: { gte: new Date(ahora.getTime() - MOV_VENTANA_MS) } },
      orderBy: { registrado_en: 'desc' }, take: MOV_MAX_PUNTOS, select: { latitud: true, longitud: true, registrado_en: true, capturado_en: true },
    });
    lista = filas.map((p) => ({ latitud: Number(p.latitud), longitud: Number(p.longitud), fecha: p.capturado_en || p.registrado_en })).sort((a, b) => a.fecha - b.fecha);
  }
  const corte = ahora.getTime() - MOV_VENTANA_MS;
  return lista.filter((p) => p.fecha.getTime() >= corte).slice(-MOV_MAX_PUNTOS);
}
function recordarPuntos(usuarioId, previos, nuevos) {
  if (memoriaMov.size >= MOV_MAX_AUDITORES) { memoriaMov.clear(); memoriaSalto.clear(); }
  memoriaMov.set(usuarioId, [...previos, ...nuevos].sort((a, b) => a.fecha - b.fecha).slice(-MOV_MAX_PUNTOS));
}
// Hora en que el celular tomó la posición. Si no la manda (apps anteriores) o su reloj está mal (más de 2 min en el futuro o más de un día atrás),
// vale la hora de llegada al servidor.
function horaDelCelular(texto, ahora) {
  const t = texto ? Date.parse(texto) : NaN;
  if (!Number.isFinite(t) || t > ahora.getTime() + 2 * 60 * 1000 || t < ahora.getTime() - 24 * 60 * 60 * 1000) return null;
  return new Date(t);
}

// Cada posición del celular se clasifica antes de guardarla (ver recorrido.js): BUENA entra al recorrido y es la posición en vivo; SIMULADA se guarda
// marcada y se avisa; IMPRECISA (peor que la regla de la empresa) no entra al recorrido y solo manda en vivo si hace rato no llega una buena; SALTO
// (una posición imposible respecto de la anterior) no entra ni manda, pero el estado de movimiento lo delata. Así el recorrido del día ya no tiene
// las rectas largas que dejaban las posiciones por antena o wifi.
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
  const capturado = horaDelCelular(payload.fecha, ahora);
  const reglas = await reglasEmpresa();
  const punto = { latitud, longitud, precision, fecha: capturado || ahora, capturado, registrado: ahora };
  const previos = await puntosPrevios(usuarioId, ahora);
  const ultimoBueno = previos[previos.length - 1] || null;
  let calidad = simulada ? 'SIMULADA' : precision != null && precision > reglas.precision_maxima_m ? 'IMPRECISA' : 'BUENA';
  let entran = [];
  if (calidad === 'BUENA') {
    const decision = decidirPunto(ultimoBueno, memoriaSalto.get(usuarioId) || null, punto);
    entran = decision.entran;
    if (decision.pendiente) memoriaSalto.set(usuarioId, decision.pendiente); else memoriaSalto.delete(usuarioId);
    if (!entran.length) calidad = 'SALTO';
  }
  // Cómo se mueve (a pie, vehículo, detenido…): se calcula aquí, con los puntos buenos de ESTE auditor, y se guarda en su registro; así la lista en
  // vivo del supervisor no tiene que releer los puntos de todos los auditores en cada refresco. Un salto entra al cálculo solo para que se vea como tal.
  const serie = calidad === 'BUENA' ? [...previos, ...entran] : calidad === 'SALTO' ? [...previos, punto] : previos;
  const mov = estadoDeMovimiento(serie, ahora.getTime());
  const posicionManda = calidad === 'BUENA' || calidad === 'SIMULADA'
    || (calidad === 'IMPRECISA' && (!ultimoBueno || ahora.getTime() - ultimoBueno.fecha.getTime() > IMPRECISA_MANDA_TRAS_MS));
  const datos = {
    ubicacion_en: ahora, bateria_porcentaje: bateria, bateria_cargando: cargando,
    mov_estado: mov.estado, mov_desde: mov.desde ? new Date(mov.desde) : null, mov_velocidad: mov.velocidad_kmh, mov_modo: mov.modo,
    ...(posicionManda ? { latitud, longitud, ubicacion_precision: precision, ubicacion_simulada: simulada } : {}),
  };
  // Se conserva cada punto bueno (no solo el último) para reconstruir la ruta recorrida en el mapa de supervisión; el simulado queda marcado, como prueba.
  const guardar = calidad === 'SIMULADA' ? [punto] : entran;
  const [fila] = await prisma.$transaction([
    prisma.usuario.update({ where: { id_usuario: usuarioId }, data: datos, select: { id_usuario: true, username: true, nombres: true, apellidos: true, latitud: true, longitud: true, ubicacion_precision: true, ubicacion_simulada: true } }),
    ...guardar.map((p) => prisma.trackingUbicacion.create({ data: { id_usuario: usuarioId, latitud: p.latitud, longitud: p.longitud, precision_metros: p.precision, simulada, registrado_en: p.registrado, capturado_en: p.capturado } })),
  ]);
  if (calidad === 'BUENA') recordarPuntos(usuarioId, previos, entran.map((p) => ({ latitud: p.latitud, longitud: p.longitud, fecha: p.fecha })));
  // Avisos de llegada/salida: un fallo aquí nunca debe impedir que la posición quede registrada. Un salto no prueba que alguien llegó ni que se fue.
  let eventos = [];
  if (calidad !== 'SALTO') {
    try { eventos = await registrarEventosDeCampo(usuarioId, { latitud, longitud, precision, simulada }); } catch (error) { logger.warn({ err: error.message }, 'eventos_campo_fallo'); }
  }
  // Lo que ve el panel en vivo es la posición que quedó en el registro (la buena, aunque el punto de ahora no haya mandado) con su propia precisión.
  const { ubicacion_precision: precisionEnVivo, ubicacion_simulada: simuladaEnVivo, ...usuario } = fila;
  return serialize({
    ...usuario, precision: precisionEnVivo == null ? null : Number(precisionEnVivo), simulada: Boolean(simuladaEnVivo), bateria, cargando, calidad,
    actualizado_en: ahora, fecha: ahora, eventos,
  });
}

// Jornada de campo: INICIAR / TERMINAR. Cada inicio queda en el historial (`jornadas_campo`) con la posición del celular en ese momento y la zona (distrito,
// provincia y departamento) que averiguó la app; la zona de trabajo del usuario es la de su última jornada. Una jornada que sigue abierta cuando se inicia otra
// se cierra aparte (ver cierreAlReiniciar). Cada llamada además queda en el registro de seguridad.
const SELECCION_JORNADA = { id_usuario: true, username: true, nombres: true, apellidos: true, jornada_inicio: true, jornada_fin: true, zona_distrito: true, zona_provincia: true, zona_departamento: true, zona_en: true };
const abiertas = (usuarioId) => ({ id_usuario: usuarioId, fin: null, cierre: null });

async function registrarJornada(usuarioId, accion, cuerpo = {}) {
  const ahora = new Date();
  const zona = zonaDeJornada(cuerpo);
  const { usuario, idJornada } = await prisma.$transaction(async (tx) => {
    let id = null;
    if (accion === 'INICIAR') {
      for (const previa of await tx.jornadaCampo.findMany({ where: abiertas(usuarioId), orderBy: { inicio: 'desc' }, take: 5, select: { id_jornada: true, inicio: true } })) {
        await tx.jornadaCampo.update({ where: { id_jornada: previa.id_jornada }, data: cierreAlReiniciar({ inicio: previa.inicio, ahora }) });
      }
      const nueva = await tx.jornadaCampo.create({ data: {
        id_usuario: usuarioId, inicio: ahora, latitud: zona.latitud, longitud: zona.longitud, precision_metros: zona.precision_metros, simulada: zona.simulada,
        distrito: zona.distrito, provincia: zona.provincia, departamento: zona.departamento,
      } });
      id = nueva.id_jornada;
    } else {
      // La más reciente se cierra normal; si hubiera otras abiertas (no debería), quedan sin cierre.
      const [reciente, ...otras] = await tx.jornadaCampo.findMany({ where: abiertas(usuarioId), orderBy: { inicio: 'desc' }, take: 5, select: { id_jornada: true } });
      if (reciente) { await tx.jornadaCampo.update({ where: { id_jornada: reciente.id_jornada }, data: { fin: ahora, cierre: 'NORMAL' } }); id = reciente.id_jornada; }
      if (otras.length) await tx.jornadaCampo.updateMany({ where: { id_jornada: { in: otras.map((o) => o.id_jornada) } }, data: { cierre: 'SIN_CIERRE' } });
    }
    const data = accion === 'INICIAR'
      ? { jornada_inicio: ahora, jornada_fin: null, ...(zona.actualizaZona ? { zona_distrito: zona.distrito, zona_provincia: zona.provincia, zona_departamento: zona.departamento, zona_en: ahora } : {}) }
      : { jornada_fin: ahora };
    return { usuario: await tx.usuario.update({ where: { id_usuario: usuarioId }, data, select: SELECCION_JORNADA }), idJornada: id };
  });
  const u = usuario;
  const enJornada = Boolean(u.jornada_inicio) && (!u.jornada_fin || u.jornada_fin < u.jornada_inicio);
  const zonaTexto = u.zona_en ? textoZona({ distrito: u.zona_distrito, provincia: u.zona_provincia, departamento: u.zona_departamento }) || null : null;
  return {
    ...serialize({ id_usuario: u.id_usuario, username: u.username, nombres: u.nombres, apellidos: u.apellidos, en_jornada: enJornada, jornada_inicio: u.jornada_inicio, jornada_fin: u.jornada_fin, zona: zonaTexto, id_jornada: idJornada }),
    // Lo que queda en el registro de seguridad: la acción y, al iniciar, la zona (sin coordenadas: eso ya está en el historial de la jornada).
    _auditDiff: { entidad: 'JornadaCampo', entidad_id: idJornada, valor_anterior: null, valor_nuevo: { accion, ...(accion === 'INICIAR' ? { zona: zona.texto || null, con_posicion: zona.tienePosicion, simulada: zona.simulada } : {}) } },
  };
}

export { snapshotExpediente, evaluarSenales, zonaDe };
export default { presignEvidencia, recibirEvidencia, crearVisita, listar, exportarCsv, exportarXlsx, obtener, obtenerArchivoEvidencia, actualizarUbicacionEnVivo, registrarJornada };
