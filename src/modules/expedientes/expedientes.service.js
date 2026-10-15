import prisma from '#core/config/prisma.js';
import importador from './importador/importador.service.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

const listSelect = {
  id_expediente: true, codigo_expediente: true, tipo_credito: true, oficina: true,
  numero_documento_cliente: true, nombres_cliente: true, distrito: true, provincia: true, departamento: true,
  latitud: true, longitud: true, asesor_responsable: true, monto_desembolso: true, moneda: true,
  estado: true, fecha_creacion: true, ubicacion_origen: true, advertencias_origen: true, id_importacion: true,
};

async function listar({ page = 1, limit = 25, search, estado, distrito, departamento, tipo_credito, sin_ubicacion } = {}) {
  const where = {
    ...(sin_ubicacion === 'true' ? { OR: [{ latitud: null }, { longitud: null }] } : {}),
    ...(estado ? { estado } : {}),
    ...(distrito ? { distrito: { contains: distrito } } : {}),
    ...(departamento ? { departamento: { contains: departamento } } : {}),
    ...(tipo_credito ? { tipo_credito } : {}),
    ...(search ? {
      OR: [
        { codigo_expediente: { contains: search } },
        { nombres_cliente: { contains: search } },
        { numero_documento_cliente: { contains: search } },
        { asesor_responsable: { contains: search } },
      ],
    } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.expediente.findMany({ where, select: listSelect, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.expediente.count({ where }),
  ]);
  return { data: serialize(data), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function obtener(id) {
  const expediente = await prisma.expediente.findUnique({
    where: { id_expediente: id },
    include: {
      cambios: { orderBy: { fecha: 'desc' }, take: 30 },
      asignaciones: { orderBy: { fecha_asignacion: 'desc' }, take: 10, include: { auditor: { select: { username: true, nombres: true, apellidos: true } } } },
      visitas: { orderBy: { fecha_creacion: 'desc' }, take: 10, select: { id_visita: true, resultado: true, plantilla: true, fecha_hora_checkin: true, distancia_domicilio_m: true, id_usuario_auditor: true } },
    },
  });
  if (!expediente) { const error = new Error('Expediente no encontrado'); error.statusCode = 404; throw error; }
  // Trazabilidad del dato: de qué importación/archivo viene y quién la ejecutó.
  let importacion = null;
  if (expediente.id_importacion) {
    const imp = await prisma.importacionMasiva.findUnique({
      where: { id_importacion: expediente.id_importacion },
      select: { id_importacion: true, archivo: true, formato: true, archivo_sha256: true, fecha_creacion: true, actor_id: true },
    });
    if (imp) {
      const actor = imp.actor_id ? await prisma.usuario.findUnique({ where: { id_usuario: imp.actor_id }, select: { username: true } }) : null;
      importacion = { ...imp, actor: actor?.username || null };
    }
  }
  // Nombre de quien hizo cada cambio (en la tabla solo se guarda el id).
  const actorIds = [...new Set(expediente.cambios.map((c) => c.actor_id).filter(Boolean))];
  const actores = actorIds.length ? await prisma.usuario.findMany({ where: { id_usuario: { in: actorIds } }, select: { id_usuario: true, username: true } }) : [];
  const nombrePorId = new Map(actores.map((u) => [u.id_usuario, u.username]));
  const cambios = expediente.cambios.map((c) => ({ ...c, id_cambio: String(c.id_cambio), actor: nombrePorId.get(c.actor_id) || null }));
  return serialize({ ...expediente, cambios, importacion });
}

async function crear(datos) {
  const expediente = await prisma.expediente.create({ data: datos });
  return serialize(expediente);
}

// Snapshot para auditoría: solo los campos de referencia del expediente, no los
// bloques JSON variables (evaluacion_financiera, endeudamiento, etc.) que pueden
// pesar mucho y no aportan valor al diff de negocio.
function auditSnapshotExpediente(e) {
  return {
    codigo_expediente: e.codigo_expediente, tipo_credito: e.tipo_credito, oficina: e.oficina,
    numero_documento_cliente: e.numero_documento_cliente, nombres_cliente: e.nombres_cliente,
    distrito: e.distrito, provincia: e.provincia, departamento: e.departamento,
    asesor_responsable: e.asesor_responsable, monto_desembolso: e.monto_desembolso ? Number(e.monto_desembolso) : null,
    estado: e.estado,
    latitud: e.latitud == null ? null : Number(e.latitud), longitud: e.longitud == null ? null : Number(e.longitud), ubicacion_origen: e.ubicacion_origen,
  };
}

async function actualizar(id, datos, actorId) {
  const actual = await prisma.expediente.findUnique({ where: { id_expediente: id } });
  if (!actual) { const error = new Error('Expediente no encontrado'); error.statusCode = 404; throw error; }
  const data = { ...datos };
  const cambioUbicacion = (datos.latitud !== undefined || datos.longitud !== undefined)
    && (Number(datos.latitud ?? actual.latitud) !== Number(actual.latitud) || Number(datos.longitud ?? actual.longitud) !== Number(actual.longitud));
  if (cambioUbicacion) data.ubicacion_origen = 'MANUAL';
  const expediente = await prisma.expediente.update({ where: { id_expediente: id }, data });
  if (cambioUbicacion) {
    await prisma.expedienteCambio.create({
      data: {
        id_expediente: id, actor_id: actorId || null, tipo: 'UBICACION',
        cambios: { latitud: { antes: actual.latitud == null ? null : Number(actual.latitud), despues: Number(expediente.latitud) }, longitud: { antes: actual.longitud == null ? null : Number(actual.longitud), despues: Number(expediente.longitud) }, ubicacion_origen: { antes: actual.ubicacion_origen, despues: 'MANUAL' } },
      },
    });
  }
  return {
    ...serialize(expediente),
    _auditDiff: { entidad: 'Expediente', entidad_id: id, valor_anterior: auditSnapshotExpediente(actual), valor_nuevo: auditSnapshotExpediente(expediente) },
  };
}

async function eliminar(id) {
  const actual = await prisma.expediente.findUnique({ where: { id_expediente: id } });
  await prisma.expediente.delete({ where: { id_expediente: id } });
  return { _auditDiff: { entidad: 'Expediente', entidad_id: id, valor_anterior: actual ? auditSnapshotExpediente(actual) : null, valor_nuevo: null } };
}


export default { listar, obtener, crear, actualizar, eliminar, importador };
