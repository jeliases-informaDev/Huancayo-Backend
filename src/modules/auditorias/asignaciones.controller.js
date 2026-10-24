import asignacionesService from './asignaciones.service.js';
import { fijarAutoasignacion as fijarAjuste, fijarTopeCasos } from '#modules/sistema/configuracion.service.js';

function notifyRoles(req, event, data) {
  const io = req.app.get('io');
  if (!io) return;
  const e = req.user.empresa_id; // solo la empresa de la petición recibe el aviso
  ['ADMINISTRADOR', 'SUPERVISOR'].forEach(rol => io.to(`empresa:${e}:role:${rol}`).emit(event, data));
  if (data.id_usuario_auditor) io.to(`empresa:${e}:auditor:${data.id_usuario_auditor}`).emit(event, data);
}

async function crear(req, res, next) {
  try {
    const data = await asignacionesService.crear(req.body, req.user.id);
    notifyRoles(req, 'muestra_actualizada', data);
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function crearMasivo(req, res, next) {
  try {
    const data = await asignacionesService.crearMasivo(req.body, req.user.id);
    notifyRoles(req, 'muestra_actualizada', { id_usuario_auditor: req.body.id_usuario_auditor });
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function misAsignaciones(req, res, next) {
  try { res.json(await asignacionesService.misAsignaciones(req.user.id, req.validated?.query || {})); } catch (error) { next(error); }
}
async function disponibles(req, res, next) {
  try { res.json(await asignacionesService.disponiblesParaAuditor(req.user.id, req.validated?.query || {})); } catch (error) { next(error); }
}
async function autoAsignar(req, res, next) {
  try {
    const data = await asignacionesService.autoAsignar(req.user.id, req.validated.params.id);
    notifyRoles(req, 'muestra_actualizada', data);
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function listar(req, res, next) {
  try { res.json(await asignacionesService.listar(req.validated.query)); } catch (error) { next(error); }
}
async function versionMia(req, res, next) {
  try { res.json({ data: { version: await asignacionesService.versionMuestra(req.user.id) } }); } catch (error) { next(error); }
}
async function carga(_req, res, next) {
  try { res.json({ data: await asignacionesService.cargaPorAuditor() }); } catch (error) { next(error); }
}
async function pendientes(req, res, next) {
  try { res.json(await asignacionesService.pendientesParaAsignar(req.validated?.query || {})); } catch (error) { next(error); }
}
async function pendientesDistritos(req, res, next) {
  try { res.json(await asignacionesService.distritosPendientes(req.validated?.query || {})); } catch (error) { next(error); }
}
async function mapa(req, res, next) {
  try {
    const { visitados_desde: visitadosDesde, ...filtros } = req.validated?.query || {};
    res.json(await asignacionesService.puntosParaMapa({ ...filtros, visitadosDesde }));
  } catch (error) { next(error); }
}
async function resumenOrigen(_req, res, next) {
  try { res.json({ data: await asignacionesService.resumenPorOrigen() }); } catch (error) { next(error); }
}
// Solo el administrador: enciende o apaga que los auditores puedan tomar casos por su cuenta. Queda en el registro de auditoría.
async function fijarAutoasignacion(req, res, next) {
  try {
    const { anterior, nuevo } = await fijarAjuste(req.body.activa, req.user.id);
    req.auditContext = { entidad: 'ConfiguracionSistema', entidad_id: 'autoasignacion', valor_anterior: { activa: anterior }, valor_nuevo: { activa: nuevo } };
    res.json({ data: await asignacionesService.resumenPorOrigen() });
  } catch (error) { next(error); }
}
// Solo el administrador: cuántos casos abiertos puede tener un asesor cuando los toma por su cuenta (0 = sin tope). Queda en el registro de auditoría.
async function fijarTope(req, res, next) {
  try {
    const { anterior, nuevo } = await fijarTopeCasos(req.body.maximo, req.user.id);
    req.auditContext = { entidad: 'ConfiguracionSistema', entidad_id: 'tope_casos_activos', valor_anterior: { maximo: anterior }, valor_nuevo: { maximo: nuevo } };
    res.json({ data: await asignacionesService.resumenPorOrigen() });
  } catch (error) { next(error); }
}
// Quita casos a un asesor (se enfermó, se retiró…) y los devuelve a «Disponibles» o los pasa a otro asesor. Avisa a los dos por tiempo real
// para que su app recargue la muestra.
async function quitarCasos(req, res, next) {
  try {
    const { _auditDiff, ...data } = await asignacionesService.quitarCasos({ ...req.body, actorId: req.user.id });
    req.auditContext = _auditDiff;
    notifyRoles(req, 'muestra_actualizada', { id_usuario_auditor: req.body.id_usuario_auditor });
    if (req.body.id_usuario_destino) notifyRoles(req, 'muestra_actualizada', { id_usuario_auditor: req.body.id_usuario_destino });
    res.json({ data });
  } catch (error) { next(error); }
}
// Solo el administrador: deja tomables por los auditores de su zona todos los pendientes que hoy solo asigna un supervisor.
async function liberarPendientes(req, res, next) {
  try {
    const data = await asignacionesService.liberarPendientes();
    req.auditContext = { entidad: 'Expediente', entidad_id: 'pendientes', valor_anterior: null, valor_nuevo: { accion: 'LIBERAR_A_AUDITORES', ...data } };
    res.json({ data: { ...data, resumen: await asignacionesService.resumenPorOrigen() } });
  } catch (error) { next(error); }
}
async function cancelar(req, res, next) {
  try {
    const { _auditDiff, ...data } = await asignacionesService.cancelar(req.validated.params.id, req.user.id);
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}

export default { crear, crearMasivo, misAsignaciones, disponibles, autoAsignar, listar, cancelar, quitarCasos, resumenOrigen, fijarAutoasignacion, fijarTope, liberarPendientes, carga, pendientes, pendientesDistritos, mapa, versionMia };
