import asignacionesService from './asignaciones.service.js';

function notifyRoles(req, event, data) {
  const io = req.app.get('io');
  if (!io) return;
  ['ADMINISTRADOR', 'SUPERVISOR'].forEach(rol => io.to(`role:${rol}`).emit(event, data));
  if (data.id_usuario_auditor) io.to(`auditor:${data.id_usuario_auditor}`).emit(event, data);
}

async function crear(req, res, next) {
  try {
    const data = await asignacionesService.crear(req.body);
    notifyRoles(req, 'muestra_actualizada', data);
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function crearMasivo(req, res, next) {
  try {
    const data = await asignacionesService.crearMasivo(req.body);
    notifyRoles(req, 'muestra_actualizada', { id_usuario_auditor: req.body.id_usuario_auditor });
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function misAsignaciones(req, res, next) {
  try { res.json({ data: await asignacionesService.misAsignaciones(req.user.id) }); } catch (error) { next(error); }
}
async function listar(req, res, next) {
  try { res.json(await asignacionesService.listar(req.validated.query)); } catch (error) { next(error); }
}
async function cancelar(req, res, next) {
  try { res.json({ data: await asignacionesService.cancelar(req.validated.params.id) }); } catch (error) { next(error); }
}

export default { crear, crearMasivo, misAsignaciones, listar, cancelar };
