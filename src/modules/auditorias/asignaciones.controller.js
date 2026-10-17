import asignacionesService from './asignaciones.service.js';
import { fijarAutoasignacion as fijarAjuste } from '#modules/sistema/configuracion.service.js';

function notifyRoles(req, event, data) {
  const io = req.app.get('io');
  if (!io) return;
  ['ADMINISTRADOR', 'SUPERVISOR'].forEach(rol => io.to(`role:${rol}`).emit(event, data));
  if (data.id_usuario_auditor) io.to(`auditor:${data.id_usuario_auditor}`).emit(event, data);
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
  try { res.json({ data: await asignacionesService.misAsignaciones(req.user.id) }); } catch (error) { next(error); }
}
async function disponibles(req, res, next) {
  try { res.json({ data: await asignacionesService.disponiblesParaAuditor(req.user.id) }); } catch (error) { next(error); }
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
async function cancelar(req, res, next) {
  try {
    const { _auditDiff, ...data } = await asignacionesService.cancelar(req.validated.params.id);
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}

export default { crear, crearMasivo, misAsignaciones, disponibles, autoAsignar, listar, cancelar, resumenOrigen, fijarAutoasignacion };
