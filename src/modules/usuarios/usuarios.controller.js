import usuariosService from './usuarios.service.js';
import { listarEventos } from '#modules/auditorias/eventos-campo.js';

async function listar(req, res, next) {
  try { res.json(await usuariosService.listar(req.validated?.query || {})); } catch (error) { next(error); }
}
async function listarAuditores(req, res, next) {
  try { res.json(await usuariosService.listarAuditores(req.validated?.query || {})); } catch (error) { next(error); }
}
async function zonasDeAuditores(_req, res, next) {
  try { res.json({ data: await usuariosService.zonasDeAuditores() }); } catch (error) { next(error); }
}
// El rol UNIVERSAL (administrador de Sulotec) solo lo da o quita otro universal; un administrador de empresa no puede.
function soloUniversalDaUniversal(req, res) {
  if (req.body?.rol === 'UNIVERSAL' && req.user.rol !== 'UNIVERSAL') {
    res.status(403).json({ error: 'Solo el administrador universal puede asignar ese rol', code: 'ROL_NO_PERMITIDO', requestId: req.id });
    return false;
  }
  return true;
}
async function crear(req, res, next) {
  try {
    if (!soloUniversalDaUniversal(req, res)) return;
    const { _auditDiff, ...data } = await usuariosService.crear(req.body);
    req.auditContext = _auditDiff;
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function actualizar(req, res, next) {
  try {
    if (!soloUniversalDaUniversal(req, res)) return;
    const { _auditDiff, ...data } = await usuariosService.actualizar(req.params.id, req.body, req.user.id);
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try {
    const { _auditDiff } = await usuariosService.eliminar(req.params.id, req.user.id);
    req.auditContext = _auditDiff;
    res.status(204).send();
  } catch (error) { next(error); }
}

async function resetMfa(req, res, next) {
  try { await usuariosService.resetMfa(req.params.id); res.json({ message: 'MFA restablecido; el usuario deberá enrolarlo nuevamente' }); } catch (error) { next(error); }
}
async function resetDevice(req, res, next) {
  try { await usuariosService.resetDevice(req.params.id); res.json({ message: 'Dispositivo liberado; el próximo inicio de sesión autorizará el nuevo equipo' }); } catch (error) { next(error); }
}
// "ahora" es la hora del servidor: el panel mide la antigüedad de cada posición sin depender del reloj de la PC.
async function ubicacionesActivas(_req, res, next) {
  try { res.json({ data: await usuariosService.ubicacionesActivas(), ahora: new Date().toISOString() }); } catch (error) { next(error); }
}
async function tracking(req, res, next) {
  try { res.json({ data: await usuariosService.trackingDeUsuario(req.validated.params.id, req.validated.query.fecha) }); } catch (error) { next(error); }
}
async function jornadas(req, res, next) {
  try { res.json(await usuariosService.jornadasDe(req.validated.params.id, req.validated.query)); } catch (error) { next(error); }
}
async function eventos(req, res, next) {
  try { res.json({ data: await listarEventos(req.validated.query.fecha) }); } catch (error) { next(error); }
}
export default { listar, listarAuditores, zonasDeAuditores, crear, actualizar, eliminar, resetMfa, resetDevice, ubicacionesActivas, tracking, eventos, jornadas };
