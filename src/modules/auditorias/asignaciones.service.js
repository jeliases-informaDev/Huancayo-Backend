import prisma from '#core/config/prisma.js';
import { autoasignacionPermitida } from '#modules/sistema/configuracion.service.js';
import { normalizarPaginacion, infoPaginas, ordenarPorPrioridad, paginaDe, buscarEnExpediente } from './asignaciones.paginacion.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

// Comparación tolerante a mayúsculas/tildes: "Junín", "junin" y "JUNÍN" deben
// contarse como el mismo departamento.
function normalizarTexto(valor) {
  return String(valor || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const expedienteSelect = {
  id_expediente: true, codigo_expediente: true, tipo_credito: true, oficina: true,
  numero_documento_cliente: true, nombres_cliente: true, direccion_domicilio: true,
  distrito: true, provincia: true, departamento: true, latitud: true, longitud: true, direccion_normalizada: true,
  asesor_responsable: true, monto_desembolso: true, moneda: true, estado: true,
};

// Versión ligera (mapa, resumen): lo del listado más el teléfono, sin los bloques grandes de la ficha.
const expedienteLigeroSelect = { ...expedienteSelect, telefono_cliente: true, tipo_documento_cliente: true };

// El auditor recibe, solo de SUS expedientes asignados, los bloques de la ficha (cliente,
// negocio, crédito, evaluación y deuda): los necesita en campo, incluso sin señal. La lista
// de "disponibles" y el catálogo general NO los incluyen (mínimo privilegio).
const expedienteMuestraSelect = {
  ...expedienteSelect,
  telefono_cliente: true, tipo_documento_cliente: true, ubicacion_origen: true,
  datos_cliente: true, datos_negocio: true, datos_credito: true, evaluacion_financiera: true, endeudamiento: true,
};

async function crear({ id_expediente, id_usuario_auditor, prioridad }, actorId = null) {
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
    prisma.asignacionAuditoria.create({ data: { id_expediente, id_usuario_auditor, prioridad: prioridad || 'MEDIA', origen: 'SUPERVISOR', asignado_por: actorId } }),
    prisma.expediente.update({ where: { id_expediente }, data: { estado: 'ASIGNADO' } }),
  ]);
  return serialize(asignacion);
}

// Expedientes PENDIENTE que un auditor podría tomar por su cuenta: solo los de su
// propio departamento (misma regla geográfica que crear()). Sin departamento
// configurado, no ve ninguno — evita que se autoasigne fuera de su zona por defecto.
async function disponiblesParaAuditor(auditorId, consulta = {}) {
  const pag = normalizarPaginacion(consulta);
  const vacio = { data: [], pagination: infoPaginas(pag, 0) };
  if (!(await autoasignacionPermitida())) return vacio;
  const auditor = await prisma.usuario.findFirst({ where: { id_usuario: auditorId, rol: 'AUDITOR', estado: 'ACTIVO' } });
  if (!auditor) { const error = new Error('El auditor indicado no existe o está inactivo'); error.statusCode = 400; throw error; }
  if (!auditor.departamento) return vacio;
  const where = {
    estado: 'PENDIENTE', autoasignable: true, departamento: auditor.departamento,
    ...(consulta.tipo ? { tipo_credito: consulta.tipo } : {}),
    ...(consulta.q ? buscarEnExpediente(consulta.q) : {}),
  };
  const [data, total] = await Promise.all([
    prisma.expediente.findMany({ where, select: expedienteSelect, orderBy: [{ fecha_creacion: 'asc' }, { id_expediente: 'asc' }], skip: (pag.page - 1) * pag.limit, take: pag.limit }),
    prisma.expediente.count({ where }),
  ]);
  return { data: serialize(data), pagination: infoPaginas(pag, total) };
}

// Auto-asignación: el propio auditor "toma" un expediente pendiente de su muestra,
// en vez de que un supervisor se lo asigne. El punto crítico es que dos auditores
// no pueden tomar el mismo cliente si presionan "tomar" casi al mismo tiempo — se
// resuelve con un UPDATE condicionado (WHERE estado = 'PENDIENTE') dentro de una
// transacción: MySQL/InnoDB toma un lock de fila exclusivo al ejecutar ese UPDATE y
// evalúa el WHERE contra el valor ya comprometido más reciente (no contra la foto
// de la transacción), así que si dos auditores lo intentan a la vez, el segundo
// UPDATE simplemente afecta 0 filas (el estado ya cambió) y falla limpio con
// ALREADY_CLAIMED — sin necesidad de locks manuales ni de un semáforo aparte.
async function autoAsignar(auditorId, idExpediente) {
  if (!(await autoasignacionPermitida())) {
    const error = new Error('Tomar casos por cuenta propia está desactivado: tu supervisor te asigna la muestra.');
    error.statusCode = 403; error.code = 'SELF_ASSIGN_DISABLED'; throw error;
  }
  const auditor = await prisma.usuario.findFirst({ where: { id_usuario: auditorId, rol: 'AUDITOR', estado: 'ACTIVO' } });
  if (!auditor) { const error = new Error('El auditor indicado no existe o está inactivo'); error.statusCode = 400; throw error; }

  const expediente = await prisma.expediente.findUnique({ where: { id_expediente: idExpediente } });
  if (!expediente) { const error = new Error('Expediente no encontrado'); error.statusCode = 404; throw error; }

  if (!expediente.autoasignable) {
    const error = new Error('Este expediente lo asigna un supervisor: no está disponible para tomarlo por tu cuenta.');
    error.statusCode = 403; error.code = 'NOT_SELF_ASSIGNABLE'; throw error;
  }

  if (auditor.departamento && expediente.departamento && normalizarTexto(auditor.departamento) !== normalizarTexto(expediente.departamento)) {
    const error = new Error(`Este expediente está en ${expediente.departamento} y tú operas en ${auditor.departamento}. Solo puedes tomar expedientes de tu propia zona.`);
    error.statusCode = 422; error.code = 'GEOGRAPHIC_MISMATCH'; throw error;
  }

  const asignacion = await prisma.$transaction(async tx => {
    const reclamo = await tx.expediente.updateMany({
      where: { id_expediente: idExpediente, estado: 'PENDIENTE' },
      data: { estado: 'ASIGNADO' },
    });
    if (reclamo.count === 0) {
      const error = new Error('Este expediente ya no está disponible: otro auditor lo tomó primero.');
      error.statusCode = 409; error.code = 'ALREADY_CLAIMED';
      throw error;
    }
    return tx.asignacionAuditoria.create({ data: { id_expediente: idExpediente, id_usuario_auditor: auditorId, prioridad: 'MEDIA', origen: 'AUTOASIGNADA', asignado_por: auditorId } });
  });
  return serialize(asignacion);
}

async function crearMasivo({ id_usuario_auditor, id_expedientes, prioridad }, actorId = null) {
  const resultados = [];
  for (const id_expediente of id_expedientes) {
    try { resultados.push({ id_expediente, ok: true, asignacion: await crear({ id_expediente, id_usuario_auditor, prioridad }, actorId) }); }
    catch (error) { resultados.push({ id_expediente, ok: false, error: error.message }); }
  }
  return resultados;
}

// «Mi muestra» del auditor, por páginas. Sin page ni limit (apps anteriores) devuelve hasta 1000 en vez de cortar en 150.
// Se ordena por prioridad real y antigüedad: primero se leen solo ids y prioridad (barato), y después las filas completas de la página pedida.
async function misAsignaciones(auditorId, consulta = {}) {
  const pag = normalizarPaginacion(consulta);
  const base = { id_usuario_auditor: auditorId, estado: 'ACTIVA' };
  const filtroExpediente = { ...(consulta.tipo ? { tipo_credito: consulta.tipo } : {}), ...(consulta.q ? buscarEnExpediente(consulta.q) : {}) };
  const where = { ...base, ...(consulta.prioridad ? { prioridad: consulta.prioridad } : {}), ...(Object.keys(filtroExpediente).length ? { expediente: filtroExpediente } : {}) };
  const filas = ordenarPorPrioridad(await prisma.asignacionAuditoria.findMany({ where, select: { id_asignacion: true, prioridad: true }, orderBy: [{ fecha_asignacion: 'asc' }, { id_asignacion: 'asc' }] }));
  const ids = paginaDe(filas, pag).map((f) => f.id_asignacion);
  const [datos, porPrioridad, porTipo] = await Promise.all([
    ids.length ? prisma.asignacionAuditoria.findMany({ where: { id_asignacion: { in: ids } }, include: { expediente: { select: consulta.ligero === 'true' ? expedienteLigeroSelect : expedienteMuestraSelect } } }) : [],
    prisma.asignacionAuditoria.groupBy({ by: ['prioridad'], where: base, _count: { _all: true } }),
    prisma.expediente.groupBy({ by: ['tipo_credito'], where: { asignaciones: { some: base } }, _count: { _all: true } }),
  ]);
  const posicion = new Map(ids.map((id, i) => [id, i]));
  datos.sort((a, b) => posicion.get(a.id_asignacion) - posicion.get(b.id_asignacion));
  const cuenta = (lista, clave, valor) => lista.find((x) => x[clave] === valor)?._count._all ?? 0;
  const resumen = {
    total: porPrioridad.reduce((n, x) => n + x._count._all, 0),
    ALTA: cuenta(porPrioridad, 'prioridad', 'ALTA'), MEDIA: cuenta(porPrioridad, 'prioridad', 'MEDIA'), BAJA: cuenta(porPrioridad, 'prioridad', 'BAJA'),
    CONSUMO: cuenta(porTipo, 'tipo_credito', 'CONSUMO'), OTROS: cuenta(porTipo, 'tipo_credito', 'OTROS'),
  };
  return { data: serialize(datos), pagination: infoPaginas(pag, filas.length), resumen };
}

// Casos activos de cada auditor (para la carga en el panel): un conteo en la base, no una lista cortada.
async function cargaPorAuditor() {
  const filas = await prisma.asignacionAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { estado: 'ACTIVA' }, _count: { _all: true } });
  return filas.map((f) => ({ id_usuario_auditor: f.id_usuario_auditor, activas: f._count._all }));
}

// Puntos de clientes con caso activo para el mapa del supervisor: filtrados por zona en el servidor, con tope de seguridad y la lista de zonas
// (departamento/provincia/distrito con su cantidad) para armar los filtros aunque la respuesta venga truncada.
let cacheZonas = { hasta: 0, valor: null };
async function zonasDelMapa() {
  if (cacheZonas.valor && Date.now() < cacheZonas.hasta) return cacheZonas.valor;
  const filas = await prisma.expediente.groupBy({
    by: ['departamento', 'provincia', 'distrito'], _count: { _all: true },
    where: { latitud: { not: null }, longitud: { not: null }, asignaciones: { some: { estado: 'ACTIVA' } } },
  });
  const valor = filas.map((z) => ({ departamento: z.departamento, provincia: z.provincia, distrito: z.distrito, n: z._count._all }));
  cacheZonas = { hasta: Date.now() + 30_000, valor };
  return valor;
}
async function puntosParaMapa({ departamento, provincia, distrito, auditor, q, limite = 5000 } = {}) {
  const expediente = {
    latitud: { not: null }, longitud: { not: null },
    ...(departamento ? { departamento } : {}), ...(provincia ? { provincia } : {}), ...(distrito ? { distrito } : {}),
    ...(q ? buscarEnExpediente(q) : {}),
  };
  const where = { estado: 'ACTIVA', ...(auditor ? { id_usuario_auditor: auditor } : {}), expediente };
  const [filas, total, zonas] = await Promise.all([
    prisma.asignacionAuditoria.findMany({
      where, orderBy: { id_asignacion: 'asc' }, take: limite + 1,
      select: { id_asignacion: true, id_usuario_auditor: true, prioridad: true, expediente: { select: expedienteSelect }, auditor: { select: { id_usuario: true, username: true, nombres: true, apellidos: true } } },
    }),
    prisma.asignacionAuditoria.count({ where }),
    q ? Promise.resolve(null) : zonasDelMapa(),
  ]);
  const truncado = filas.length > limite;
  return { data: serialize(truncado ? filas.slice(0, limite) : filas), total, truncado, ...(zonas ? { zonas } : {}) };
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

// Cuántos casos tomó cada auditor por su cuenta frente a los que le asignó un supervisor (sin contar las canceladas).
async function resumenPorOrigen() {
  const filas = await prisma.asignacionAuditoria.groupBy({
    by: ['id_usuario_auditor', 'origen'], where: { estado: { in: ['ACTIVA', 'FINALIZADA'] } }, _count: { _all: true },
  });
  const usuarios = await prisma.usuario.findMany({
    where: { id_usuario: { in: [...new Set(filas.map((f) => f.id_usuario_auditor))] } },
    select: { id_usuario: true, username: true, nombres: true, apellidos: true },
  });
  const porAuditor = new Map();
  for (const f of filas) {
    const u = usuarios.find((x) => x.id_usuario === f.id_usuario_auditor);
    const fila = porAuditor.get(f.id_usuario_auditor) || { id: f.id_usuario_auditor, nombre: [u?.nombres, u?.apellidos].filter(Boolean).join(' ') || u?.username || '', total: 0, autoasignadas: 0 };
    fila.total += f._count._all;
    if (f.origen === 'AUTOASIGNADA') fila.autoasignadas += f._count._all;
    porAuditor.set(f.id_usuario_auditor, fila);
  }
  const auditores = [...porAuditor.values()].map((a) => ({ ...a, porcentaje: a.total ? Math.round((a.autoasignadas / a.total) * 100) : 0 })).sort((a, b) => b.autoasignadas - a.autoasignadas || b.total - a.total);
  const total = auditores.reduce((n, a) => n + a.total, 0);
  const autoasignadas = auditores.reduce((n, a) => n + a.autoasignadas, 0);
  return { autoasignacion_activa: await autoasignacionPermitida(), total, autoasignadas, porcentaje: total ? Math.round((autoasignadas / total) * 100) : 0, auditores };
}

function auditSnapshotAsignacion(a) {
  return { id_expediente: a.id_expediente, id_usuario_auditor: a.id_usuario_auditor, estado: a.estado, prioridad: a.prioridad };
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

  return {
    ...serialize(asignacion),
    _auditDiff: { entidad: 'AsignacionAuditoria', entidad_id: id, valor_anterior: auditSnapshotAsignacion(actual), valor_nuevo: auditSnapshotAsignacion(asignacion) },
  };
}

// Usado al desactivar una cuenta de auditor: sus clientes en curso no deben quedar
// colgados de alguien que ya no puede iniciar sesión a atenderlos.
async function cancelarTodasDeAuditor(auditorId) {
  const activas = await prisma.asignacionAuditoria.findMany({ where: { id_usuario_auditor: auditorId, estado: 'ACTIVA' } });
  for (const a of activas) await cancelar(a.id_asignacion);
  return activas.length;
}

export default { crear, crearMasivo, misAsignaciones, cargaPorAuditor, puntosParaMapa, listar, cancelar, cancelarTodasDeAuditor, disponiblesParaAuditor, autoAsignar, resumenPorOrigen };
