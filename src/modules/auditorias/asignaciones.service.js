import prisma from '#core/config/prisma.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

const expedienteSelect = {
  id_expediente: true, codigo_expediente: true, tipo_credito: true, oficina: true,
  numero_documento_cliente: true, nombres_cliente: true, direccion_domicilio: true,
  distrito: true, provincia: true, latitud: true, longitud: true,
  asesor_responsable: true, monto_desembolso: true, moneda: true, estado: true,
};

async function crear({ id_expediente, id_usuario_auditor, prioridad }) {
  const expediente = await prisma.expediente.findUnique({ where: { id_expediente } });
  if (!expediente) { const error = new Error('Expediente no encontrado'); error.statusCode = 404; throw error; }
  const auditor = await prisma.usuario.findFirst({ where: { id_usuario: id_usuario_auditor, rol: 'AUDITOR', estado: 'ACTIVO' } });
  if (!auditor) { const error = new Error('El auditor indicado no existe o está inactivo'); error.statusCode = 400; throw error; }
  const [asignacion] = await prisma.$transaction([
    prisma.asignacionAuditoria.create({ data: { id_expediente, id_usuario_auditor, prioridad: prioridad || 'MEDIA' } }),
    prisma.expediente.update({ where: { id_expediente }, data: { estado: 'ASIGNADO' } }),
  ]);
  return serialize(asignacion);
}

async function crearMasivo({ id_usuario_auditor, id_expedientes, prioridad }) {
  const resultados = [];
  for (const id_expediente of id_expedientes) {
    try { resultados.push({ id_expediente, ok: true, asignacion: await crear({ id_expediente, id_usuario_auditor, prioridad }) }); }
    catch (error) { resultados.push({ id_expediente, ok: false, error: error.message }); }
  }
  return resultados;
}

async function misAsignaciones(auditorId) {
  const asignaciones = await prisma.asignacionAuditoria.findMany({
    where: { id_usuario_auditor: auditorId, estado: 'ACTIVA' },
    orderBy: [{ prioridad: 'asc' }, { fecha_asignacion: 'asc' }],
    include: { expediente: { select: expedienteSelect } },
  });
  return serialize(asignaciones);
}

async function listar({ page = 1, limit = 25, estado } = {}) {
  const where = estado ? { estado } : {};
  const [data, total] = await Promise.all([
    prisma.asignacionAuditoria.findMany({
      where, orderBy: { fecha_asignacion: 'desc' }, skip: (page - 1) * limit, take: limit,
      include: { expediente: { select: expedienteSelect }, auditor: { select: { id_usuario: true, username: true, nombres: true, apellidos: true } } },
    }),
    prisma.asignacionAuditoria.count({ where }),
  ]);
  return { data: serialize(data), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function cancelar(id) {
  const asignacion = await prisma.asignacionAuditoria.update({ where: { id_asignacion: id }, data: { estado: 'CANCELADA', fecha_fin: new Date() } });
  return serialize(asignacion);
}

export default { crear, crearMasivo, misAsignaciones, listar, cancelar };
