import prisma from '#core/config/prisma.js';
import { autoasignacionPermitida, topeCasosActivos } from '#modules/sistema/configuracion.service.js';
import { normalizarPaginacion, infoPaginas, ordenarPorPrioridad, paginaDe, buscarEnExpediente } from './asignaciones.paginacion.js';
import { Prisma } from '../../generated/prisma/index.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { invalidarPuntos } from './eventos-campo.js';
import { LOTE_QUITAR, mensajeTope, topeAlcanzado, cupoRestante, trozos } from './casos.core.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

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

  const [asignacion] = await prisma.$transaction([
    prisma.asignacionAuditoria.create({ data: { id_expediente, id_usuario_auditor, prioridad: prioridad || 'MEDIA', origen: 'SUPERVISOR', asignado_por: actorId } }),
    prisma.expediente.update({ where: { id_expediente }, data: { estado: 'ASIGNADO' } }),
  ]);
  invalidarPuntos(); // los avisos de llegada/salida del auditor deben ver ya la nueva asignación
  return serialize(asignacion);
}

// Cuántos casos abiertos tiene un asesor y cuántos puede tener cuando los toma por su cuenta (maximo 0 = sin tope; cupo null = sin límite).
async function estadoTope(auditorId) {
  const [maximo, abiertos] = await Promise.all([
    topeCasosActivos(),
    prisma.asignacionAuditoria.count({ where: { id_usuario_auditor: auditorId, estado: 'ACTIVA' } }),
  ]);
  return { maximo, abiertos, cupo: cupoRestante({ abiertos, tope: maximo }) };
}

// Expedientes PENDIENTE que un auditor puede tomar por su cuenta, de cualquier distrito: ni la zona del usuario ni el lugar donde esté ahora
// lo limitan. Salen del más antiguo al más nuevo (un orden estable que el índice entrega ya ordenado, aunque haya cientos de miles) y se
// buscan por cliente, crédito, documento o distrito. Las apps anteriores todavía mandan su ubicación (lat y lon): se ignora. `tope` le dice a la
// app cuántos casos abiertos tiene el asesor y cuántos puede tener, para avisarle antes de que el servidor rechace uno más.
async function disponiblesParaAuditor(auditorId, consulta = {}) {
  const pag = normalizarPaginacion(consulta);
  const vacio = { data: [], pagination: infoPaginas(pag, 0) };
  if (!(await autoasignacionPermitida())) return vacio;
  const auditor = await prisma.usuario.findFirst({ where: { id_usuario: auditorId, rol: 'AUDITOR', estado: 'ACTIVO' } });
  if (!auditor) { const error = new Error('El auditor indicado no existe o está inactivo'); error.statusCode = 400; throw error; }
  const where = {
    estado: 'PENDIENTE', autoasignable: true,
    ...(consulta.tipo ? { tipo_credito: consulta.tipo } : {}),
    ...(consulta.q ? buscarEnExpediente(consulta.q) : {}),
  };
  const [total, filas, tope] = await Promise.all([
    prisma.expediente.count({ where }),
    prisma.expediente.findMany({ where, select: expedienteSelect, orderBy: [{ fecha_creacion: 'asc' }, { id_expediente: 'asc' }], skip: (pag.page - 1) * pag.limit, take: pag.limit }),
    estadoTope(auditorId),
  ]);
  return { data: serialize(filas), pagination: infoPaginas(pag, total), tope };
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

  const maximo = await topeCasosActivos();
  const asignacion = await prisma.$transaction(async tx => {
    // Tope de casos abiertos: se bloquea la fila del asesor mientras se cuenta y se toma, así dos «Tomar» seguidos (o desde dos celulares) no pueden
    // pasarse del tope. El bloqueo dura lo que la transacción y solo detiene a ese mismo asesor.
    if (maximo > 0) {
      await tx.$queryRaw`SELECT id_usuario FROM usuarios WHERE id_usuario = ${auditorId} FOR UPDATE`;
      const abiertos = await tx.asignacionAuditoria.count({ where: { id_usuario_auditor: auditorId, estado: 'ACTIVA' } });
      if (topeAlcanzado({ abiertos, tope: maximo })) {
        const error = new Error(mensajeTope({ abiertos, tope: maximo }));
        error.statusCode = 409; error.code = 'TOPE_CASOS'; throw error;
      }
    }
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
  invalidarPuntos(); // los avisos de llegada/salida del auditor deben ver ya la nueva asignación
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

// Huella de la muestra de un auditor: cambia si se le asigna, quita o finaliza un caso o si se edita alguno de sus expedientes. La app la compara
// (consulta barata) y solo vuelve a descargar la muestra completa cuando cambió, en vez de repetir la descarga cada pocos segundos.
async function versionMuestra(auditorId) {
  const base = { id_usuario_auditor: auditorId, estado: 'ACTIVA' };
  const [a, e] = await Promise.all([
    prisma.asignacionAuditoria.aggregate({ where: base, _count: { _all: true }, _max: { id_asignacion: true, fecha_asignacion: true } }),
    prisma.expediente.aggregate({ where: { asignaciones: { some: base } }, _max: { fecha_actualizar: true } }),
  ]);
  return [a._count._all, a._max.id_asignacion ?? 0, a._max.fecha_asignacion ? a._max.fecha_asignacion.getTime() : 0, e._max.fecha_actualizar ? e._max.fecha_actualizar.getTime() : 0].join('|');
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
  const [datos, porPrioridad, porTipo, version, maximo] = await Promise.all([
    ids.length ? prisma.asignacionAuditoria.findMany({ where: { id_asignacion: { in: ids } }, include: { expediente: { select: consulta.ligero === 'true' ? expedienteLigeroSelect : expedienteMuestraSelect } } }) : [],
    prisma.asignacionAuditoria.groupBy({ by: ['prioridad'], where: base, _count: { _all: true } }),
    prisma.expediente.groupBy({ by: ['tipo_credito'], where: { asignaciones: { some: base } }, _count: { _all: true } }),
    versionMuestra(auditorId),
    topeCasosActivos(),
  ]);
  const posicion = new Map(ids.map((id, i) => [id, i]));
  datos.sort((a, b) => posicion.get(a.id_asignacion) - posicion.get(b.id_asignacion));
  const cuenta = (lista, clave, valor) => lista.find((x) => x[clave] === valor)?._count._all ?? 0;
  const resumen = {
    total: porPrioridad.reduce((n, x) => n + x._count._all, 0),
    ALTA: cuenta(porPrioridad, 'prioridad', 'ALTA'), MEDIA: cuenta(porPrioridad, 'prioridad', 'MEDIA'), BAJA: cuenta(porPrioridad, 'prioridad', 'BAJA'),
    CONSUMO: cuenta(porTipo, 'tipo_credito', 'CONSUMO'), OTROS: cuenta(porTipo, 'tipo_credito', 'OTROS'),
  };
  return { data: serialize(datos), pagination: infoPaginas(pag, filas.length), resumen, version, tope: { maximo, abiertos: resumen.total, cupo: cupoRestante({ abiertos: resumen.total, tope: maximo }) } };
}

// Casos activos de cada auditor (para la carga en el panel): un conteo en la base, no una lista cortada.
async function cargaPorAuditor() {
  const filas = await prisma.asignacionAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { estado: 'ACTIVA' }, _count: { _all: true } });
  return filas.map((f) => ({ id_usuario_auditor: f.id_usuario_auditor, activas: f._count._all }));
}

// Puntos de clientes con caso activo para el mapa del supervisor: filtrados por zona en el servidor, con tope de seguridad y la lista de zonas
// (departamento/provincia/distrito con su cantidad) para armar los filtros aunque la respuesta venga truncada.
// La lista de zonas se guarda 30 s POR EMPRESA (una sola para todas mostraba a una empresa los distritos y cantidades de otra).
const cacheZonas = new Map(); // id de la empresa → { hasta, valor }
async function zonasDelMapa() {
  const empresaId = empresaActual();
  const hit = cacheZonas.get(empresaId);
  if (hit && Date.now() < hit.hasta) return hit.valor;
  const filas = await prisma.expediente.groupBy({
    by: ['departamento', 'provincia', 'distrito'], _count: { _all: true },
    where: { latitud: { not: null }, longitud: { not: null }, asignaciones: { some: { estado: 'ACTIVA' } } },
  });
  const valor = filas.map((z) => ({ departamento: z.departamento, provincia: z.provincia, distrito: z.distrito, n: z._count._all }));
  if (cacheZonas.size >= 500) cacheZonas.clear();
  cacheZonas.set(empresaId, { hasta: Date.now() + 30_000, valor });
  return valor;
}
// `visitadosDesde` (fecha y hora): además de los casos activos trae los que se visitaron desde ese momento (asignación FINALIZADA al registrar la
// visita), para ver en el mapa lo ya visitado hoy. Son pocos (las visitas de un día) y salen por el índice (empresa, estado, fecha de fin).
async function puntosParaMapa({ departamento, provincia, distrito, auditor, q, visitadosDesde, limite = 5000 } = {}) {
  const expediente = {
    latitud: { not: null }, longitud: { not: null },
    ...(departamento ? { departamento } : {}), ...(provincia ? { provincia } : {}), ...(distrito ? { distrito } : {}),
    ...(q ? buscarEnExpediente(q) : {}),
  };
  const estados = visitadosDesde ? { OR: [{ estado: 'ACTIVA' }, { estado: 'FINALIZADA', fecha_fin: { gte: new Date(visitadosDesde) } }] } : { estado: 'ACTIVA' };
  const where = { ...estados, ...(auditor ? { id_usuario_auditor: auditor } : {}), expediente };
  const [filas, total, zonas] = await Promise.all([
    prisma.asignacionAuditoria.findMany({
      where, orderBy: { id_asignacion: 'asc' }, take: limite + 1,
      select: { id_asignacion: true, id_usuario_auditor: true, prioridad: true, estado: true, fecha_fin: true, expediente: { select: expedienteSelect }, auditor: { select: { id_usuario: true, username: true, nombres: true, apellidos: true } } },
    }),
    prisma.asignacionAuditoria.count({ where }),
    q ? Promise.resolve(null) : zonasDelMapa(),
  ]);
  const truncado = filas.length > limite;
  return { data: serialize(truncado ? filas.slice(0, limite) : filas), total, truncado, ...(zonas ? { zonas } : {}) };
}

async function listar({ page = 1, limit = 25, estado, auditor } = {}) {
  const where = { ...(estado ? { estado } : {}), ...(auditor ? { id_usuario_auditor: auditor } : {}) };
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
  // Pendientes que los auditores ven en «Disponibles» frente a los que solo un supervisor puede asignar (cargas de Excel sin la casilla).
  const pendientes = await prisma.expediente.groupBy({ by: ['autoasignable'], where: { estado: 'PENDIENTE' }, _count: { _all: true } });
  const contar = (valor) => pendientes.find((p) => p.autoasignable === valor)?._count._all || 0;
  return {
    autoasignacion_activa: await autoasignacionPermitida(), tope_casos: await topeCasosActivos(), total, autoasignadas, porcentaje: total ? Math.round((autoasignadas / total) * 100) : 0, auditores,
    pendientes_tomables: contar(true), pendientes_reservados: contar(false),
  };
}

// Deja tomables todos los pendientes que hoy solo asigna un supervisor. Una sola sentencia sobre el índice
// (empresa, estado, autoasignable): no recorre expedientes uno a uno, así que aguanta cualquier volumen.
async function liberarPendientes() {
  const r = await prisma.expediente.updateMany({ where: { estado: 'PENDIENTE', autoasignable: false }, data: { autoasignable: true } });
  return { liberados: r.count };
}

function auditSnapshotAsignacion(a) {
  return { id_expediente: a.id_expediente, id_usuario_auditor: a.id_usuario_auditor, estado: a.estado, prioridad: a.prioridad };
}

async function cancelar(id, actorId = null) {
  const actual = await prisma.asignacionAuditoria.findUnique({ where: { id_asignacion: id } });
  if (!actual) { const error = new Error('Asignación no encontrada'); error.statusCode = 404; throw error; }

  const asignacion = await prisma.asignacionAuditoria.update({ where: { id_asignacion: id }, data: { estado: 'CANCELADA', fecha_fin: new Date(), motivo_fin: 'CANCELADA', fin_por: actorId } });

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

  invalidarPuntos();
  return {
    ...serialize(asignacion),
    _auditDiff: { entidad: 'AsignacionAuditoria', entidad_id: id, valor_anterior: auditSnapshotAsignacion(actual), valor_nuevo: auditSnapshotAsignacion(asignacion) },
  };
}

// Quita casos a un asesor (se enfermó, se retiró, pasa a otro trabajo…). Sin `id_asignaciones` se le quitan todos los casos activos. Los casos van a
// «Disponibles» (quedan pendientes y cualquier asesor puede tomarlos) o pasan directo a otro asesor. Las asignaciones quitadas no se borran: quedan
// CANCELADAS con el motivo, quién las quitó y cuándo, así se sabe quién tuvo cada caso. Va por lotes de LOTE_QUITAR y cada lote es una transacción,
// con las filas bloqueadas mientras se cambian: aguanta cualquier cantidad sin sentencias gigantes y dos personas quitando a la vez no se pisan.
async function quitarCasos({ id_usuario_auditor: auditorId, id_asignaciones: pedidas, motivo, nota, destino = 'DISPONIBLES', id_usuario_destino: destinoId, actorId = null }) {
  const empresaId = empresaActual();
  if (!empresaId) { const error = new Error('Falta la empresa de la sesión'); error.statusCode = 403; throw error; }
  // Se puede quitar casos a una cuenta ya dada de baja (el caso más común: se retiró), por eso no se pide que esté activa.
  const origen = await prisma.usuario.findFirst({ where: { id_usuario: auditorId }, select: { id_usuario: true, username: true, nombres: true, apellidos: true } });
  if (!origen) { const error = new Error('El asesor indicado no existe'); error.statusCode = 404; throw error; }
  let receptor = null;
  if (destino === 'ASESOR') {
    receptor = await prisma.usuario.findFirst({ where: { id_usuario: destinoId, rol: 'AUDITOR', estado: 'ACTIVO' }, select: { id_usuario: true, username: true, nombres: true, apellidos: true } });
    if (!receptor) { const error = new Error('El asesor que recibe los casos no existe o está inactivo'); error.statusCode = 400; throw error; }
    if (receptor.id_usuario === origen.id_usuario) { const error = new Error('El asesor que recibe tiene que ser otro'); error.statusCode = 400; throw error; }
  }

  const fin = new Date();
  const abiertosAntes = await prisma.asignacionAuditoria.count({ where: { id_usuario_auditor: auditorId, estado: 'ACTIVA' } });
  const lotes = pedidas ? trozos([...new Set(pedidas)], LOTE_QUITAR) : Array.from({ length: Math.ceil(abiertosAntes / LOTE_QUITAR) + 1 }, () => null);
  const total = { quitadas: 0, devueltas: 0, reasignadas: 0, sin_cambio: 0 };
  for (const ids of lotes) {
    const r = await prisma.$transaction((tx) => quitarLote(tx, { empresaId, auditorId, ids, motivo, nota, fin, destino, destinoId, actorId }), { timeout: 20000 });
    if (!r.quitadas) { if (ids) continue; break; } // sin pedido concreto, un lote vacío significa que ya no quedan casos activos
    for (const k of Object.keys(total)) total[k] += r[k];
  }
  invalidarPuntos(); // los avisos de llegada/salida de los asesores deben ver ya el cambio
  const nombre = (u) => [u?.nombres, u?.apellidos].filter(Boolean).join(' ') || u?.username || null;
  return {
    ...total, abiertos_antes: abiertosAntes, motivo, destino, de: nombre(origen), a: receptor ? nombre(receptor) : null,
    _auditDiff: {
      entidad: 'Usuario', entidad_id: auditorId,
      valor_anterior: { casos_activos: abiertosAntes },
      valor_nuevo: { accion: 'QUITAR_CASOS', motivo, nota: nota || null, destino, id_usuario_destino: receptor?.id_usuario || null, solo_elegidos: Boolean(pedidas), ...total },
    },
  };
}

// Un lote de quitarCasos, dentro de la transacción `tx`. Las consultas crudas no pasan por el filtro de empresa de Prisma: se filtra aquí por la
// empresa de la sesión. Devuelve cuántas asignaciones se quitaron y qué pasó con sus expedientes.
async function quitarLote(tx, { empresaId, auditorId, ids, motivo, nota, fin, destino, destinoId, actorId }) {
  const filtroIds = ids ? Prisma.sql`AND id_asignacion IN (${Prisma.join(ids)})` : Prisma.empty;
  const filas = await tx.$queryRaw(Prisma.sql`
    SELECT id_asignacion, id_expediente, prioridad FROM asignaciones_auditoria
    WHERE empresa_id = ${empresaId} AND id_usuario_auditor = ${auditorId} AND estado = 'ACTIVA' ${filtroIds}
    ORDER BY id_asignacion LIMIT ${LOTE_QUITAR} FOR UPDATE`);
  const vacio = { quitadas: 0, devueltas: 0, reasignadas: 0, sin_cambio: 0 };
  if (!filas.length) return vacio;
  const idsAsignacion = filas.map((f) => Number(f.id_asignacion));
  await tx.asignacionAuditoria.updateMany({
    where: { id_asignacion: { in: idsAsignacion } },
    data: { estado: 'CANCELADA', fecha_fin: fin, motivo_fin: motivo, fin_por: actorId, nota_fin: nota || null },
  });
  // Un expediente que aún tenga otra asignación activa (un duplicado de antes) se queda como está; y uno ya visitado o cerrado no vuelve a pendiente.
  const idsExpediente = filas.map((f) => Number(f.id_expediente));
  const conOtra = new Set((await tx.asignacionAuditoria.findMany({ where: { id_expediente: { in: idsExpediente }, estado: 'ACTIVA' }, select: { id_expediente: true } })).map((x) => x.id_expediente));
  const libres = filas.filter((f) => !conOtra.has(Number(f.id_expediente)));
  const idsLibres = libres.map((f) => Number(f.id_expediente));
  let devueltas = 0; let reasignadas = 0;
  if (destino === 'ASESOR') {
    const vigentes = new Set((await tx.expediente.findMany({ where: { id_expediente: { in: idsLibres }, estado: 'ASIGNADO' }, select: { id_expediente: true } })).map((x) => x.id_expediente));
    const nuevas = libres.filter((f) => vigentes.has(Number(f.id_expediente))).map((f) => ({ id_expediente: Number(f.id_expediente), id_usuario_auditor: destinoId, prioridad: f.prioridad, origen: 'SUPERVISOR', asignado_por: actorId }));
    if (nuevas.length) reasignadas = (await tx.asignacionAuditoria.createMany({ data: nuevas })).count;
  } else if (idsLibres.length) {
    devueltas = (await tx.expediente.updateMany({ where: { id_expediente: { in: idsLibres }, estado: 'ASIGNADO' }, data: { estado: 'PENDIENTE', autoasignable: true } })).count;
  }
  return { quitadas: idsAsignacion.length, devueltas, reasignadas, sin_cambio: idsAsignacion.length - devueltas - reasignadas };
}

// Usado al desactivar una cuenta: sus clientes en curso no deben quedar colgados de alguien que ya no puede iniciar sesión a atenderlos.
// Vuelven a «Disponibles». Es una operación por lotes, no una vuelta por caso.
async function cancelarTodasDeAuditor(auditorId, actorId = null) {
  const r = await quitarCasos({ id_usuario_auditor: auditorId, motivo: 'DESACTIVADO', destino: 'DISPONIBLES', actorId });
  return r.quitadas;
}

export default { crear, crearMasivo, misAsignaciones, versionMuestra, cargaPorAuditor, puntosParaMapa, listar, cancelar, quitarCasos, cancelarTodasDeAuditor, disponiblesParaAuditor, autoAsignar, resumenPorOrigen, liberarPendientes };
