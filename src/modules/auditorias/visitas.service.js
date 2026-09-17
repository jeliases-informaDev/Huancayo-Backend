import prisma from '#core/config/prisma.js';
import storageService from '#modules/sistema/storage.service.js';
import { env } from '#core/config/env.js';
import { haversineMeters } from '#core/security/geofence.js';

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
function evaluarSenales({ expediente, payload, serverNow }) {
  const alertas = [];
  let distancia = null;
  if (expediente.latitud != null && expediente.longitud != null) {
    distancia = haversineMeters(Number(expediente.latitud), Number(expediente.longitud), payload.latitud, payload.longitud);
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

  const serverNow = new Date();
  const { alertas, distancia } = evaluarSenales({ expediente, payload, serverNow });
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
        distancia_domicilio_m: distancia,
        mock_location: false, device_integrity_ok: true,
        device_id: payload.device_id || null,
        server_received_at: serverNow,
        resultado: payload.resultado,
        respuestas_cuestionario: payload.respuestas_cuestionario,
        comentario_negocio: payload.comentario_negocio || null,
        comentario_auditor: payload.comentario_auditor || null,
        otros_clientes_domicilio: payload.otros_clientes_domicilio || null,
        otros_ingresos: payload.otros_ingresos || null,
        firma_evidencia: payload.firma_evidencia,
        estado: 'CERRADA',
      },
    });
    await tx.evidencia.create({ data: { id_visita: created.id_visita, tipo: 'FOTO_PRINCIPAL', object_key: principal.key, hash_sha256: principal.hash, latitud_captura: payload.latitud, longitud_captura: payload.longitud, capturado_en: new Date(payload.fecha_hora_checkin) } });
    if (adicional) await tx.evidencia.create({ data: { id_visita: created.id_visita, tipo: 'FOTO_ADICIONAL', object_key: adicional.key, hash_sha256: adicional.hash, latitud_captura: payload.latitud, longitud_captura: payload.longitud, capturado_en: new Date(payload.fecha_hora_checkin) } });
    await tx.expediente.update({ where: { id_expediente: payload.id_expediente }, data: { estado: 'VISITADO' } });
    await tx.asignacionAuditoria.update({ where: { id_asignacion: asignacion.id_asignacion }, data: { estado: 'FINALIZADA', fecha_fin: serverNow } });
    return created;
  });
  return { ...serialize(visita), _alertas: alertas };
}

async function listar({ page = 1, limit = 25, estado } = {}) {
  const where = estado ? { estado } : {};
  const [data, total] = await Promise.all([
    prisma.visitaAuditoria.findMany({
      where, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit,
      include: { expediente: true, auditor: { select: { id_usuario: true, username: true, nombres: true, apellidos: true } }, evidencias: true },
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
  return serialize(visita);
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
  const [usuario] = await prisma.$transaction([
    prisma.usuario.update({ where: { id_usuario: usuarioId }, data: { latitud, longitud }, select: { id_usuario: true, username: true, nombres: true, apellidos: true, latitud: true, longitud: true } }),
    // Se conserva cada punto (no solo el último) para poder reconstruir la ruta recorrida
    // en el mapa de supervisión, tal como pide el flujo (Fase 2/Fase 6).
    prisma.trackingUbicacion.create({ data: { id_usuario: usuarioId, latitud, longitud, precision_metros: precision } }),
  ]);
  return serialize({ ...usuario, precision, fecha: new Date() });
}

export default { presignEvidencia, recibirEvidencia, crearVisita, listar, obtener, obtenerArchivoEvidencia, actualizarUbicacionEnVivo };
