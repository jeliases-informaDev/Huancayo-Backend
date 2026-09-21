import prisma from '#core/config/prisma.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

// Comparación tolerante a mayúsculas/tildes: "Junín", "junin" y "JUNÍN" deben
// contarse como el mismo departamento.
function normalizarTexto(valor) {
  return String(valor || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const expedienteSelect = {
  id_expediente: true, codigo_expediente: true, tipo_credito: true, oficina: true,
  numero_documento_cliente: true, nombres_cliente: true, direccion_domicilio: true,
  distrito: true, provincia: true, departamento: true, latitud: true, longitud: true,
  asesor_responsable: true, monto_desembolso: true, moneda: true, estado: true,
};

async function crear({ id_expediente, id_usuario_auditor, prioridad }) {
  const expediente = await prisma.expediente.findUnique({ where: { id_expediente } });
  if (!expediente) { const error = new Error('Expediente no encontrado'); error.statusCode = 404; throw error; }
  const auditor = await prisma.usuario.findFirst({ where: { id_usuario: id_usuario_auditor, rol: 'AUDITOR', estado: 'ACTIVO' } });
  if (!auditor) { const error = new Error('El auditor indicado no existe o está inactivo'); error.statusCode = 400; throw error; }

  // Un cliente no puede tener dos auditores trabajándolo a la vez: sin este chequeo,
  // ambos lo verían en su muestra y hasta podrían enviar dos visitas distintas para
  // el mismo expediente.
  const yaAsignado = await prisma.asignacionAuditoria.findFirst({
    where: { id_expediente, estado: 'ACTIVA' },
    include: { auditor: { select: { nombres: true, apellidos: true, username: true } } },
  });
  if (yaAsignado) {
    const nombreActual = yaAsignado.auditor.nombres || yaAsignado.auditor.username;
    const error = new Error(`Este expediente ya está asignado activamente a ${nombreActual}. Cancela esa asignación antes de reasignarlo.`);
    error.statusCode = 409; error.code = 'ALREADY_ASSIGNED'; throw error;
  }

  // No tiene sentido operativo mandar a un auditor a visitar a otra ciudad: si el
  // auditor tiene una sede/departamento configurado, el cliente debe pertenecer a
  // esa misma zona.
  if (auditor.departamento && expediente.departamento && normalizarTexto(auditor.departamento) !== normalizarTexto(expediente.departamento)) {
    const error = new Error(`${auditor.nombres || auditor.username} trabaja en ${auditor.departamento} y este expediente está en ${expediente.departamento}. Asígnalo a un auditor de esa zona.`);
    error.statusCode = 422; error.code = 'GEOGRAPHIC_MISMATCH'; throw error;
  }

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
    take: 500,
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
  const actual = await prisma.asignacionAuditoria.findUnique({ where: { id_asignacion: id } });
  if (!actual) { const error = new Error('Asignación no encontrada'); error.statusCode = 404; throw error; }

  const asignacion = await prisma.asignacionAuditoria.update({ where: { id_asignacion: id }, data: { estado: 'CANCELADA', fecha_fin: new Date() } });

  // Sin esto, el cliente quedaba "asignado" para siempre y desaparecía de la lista
  // de pendientes sin que nadie pudiera volver a asignarlo. Solo se libera si el
  // expediente sigue en estado ASIGNADO (no toca uno ya VISITADO/CERRADO) y no le
  // queda otra asignación activa (por ejemplo, un duplicado histórico).
  const expediente = await prisma.expediente.findUnique({ where: { id_expediente: actual.id_expediente } });
  if (expediente?.estado === 'ASIGNADO') {
    const otraActiva = await prisma.asignacionAuditoria.findFirst({ where: { id_expediente: actual.id_expediente, estado: 'ACTIVA' } });
    if (!otraActiva) {
      await prisma.expediente.update({ where: { id_expediente: actual.id_expediente }, data: { estado: 'PENDIENTE' } });
    }
  }

  return serialize(asignacion);
}

// Usado al desactivar una cuenta de auditor: sus clientes en curso no deben quedar
// colgados de alguien que ya no puede iniciar sesión a atenderlos.
async function cancelarTodasDeAuditor(auditorId) {
  const activas = await prisma.asignacionAuditoria.findMany({ where: { id_usuario_auditor: auditorId, estado: 'ACTIVA' } });
  for (const a of activas) await cancelar(a.id_asignacion);
  return activas.length;
}

export default { crear, crearMasivo, misAsignaciones, listar, cancelar, cancelarTodasDeAuditor };
