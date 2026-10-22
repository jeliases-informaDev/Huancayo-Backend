import * as service from './limpieza.service.js';

async function estado(_req, res, next) {
  try { res.json({ data: await service.estadoModoPruebas() }); } catch (error) { next(error); }
}

// Enciende o apaga el modo pruebas. Queda en el registro de auditoría con el valor anterior y el nuevo.
async function fijarModoPruebas(req, res, next) {
  try {
    const { anterior, nuevo } = await service.cambiarModoPruebas(req.body.activo, req.user.id);
    req.auditContext = { entidad: 'ConfiguracionSistema', entidad_id: 'modo_pruebas', valor_anterior: { activo: anterior }, valor_nuevo: { activo: nuevo } };
    res.json({ data: { modo_pruebas: nuevo } });
  } catch (error) { next(error); }
}

async function vistaPreviaDatos(req, res, next) {
  try { res.json({ data: await service.vistaPreviaDatos(req.validated.query.alcance) }); } catch (error) { next(error); }
}

async function limpiarDatos(req, res, next) {
  try {
    const { _auditDiff, ...data } = await service.limpiarDatos({ alcance: req.body.alcance, actorId: req.user.id, confirmar: req.body.confirmar, clave: req.body.clave });
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}

async function vistaPreviaUsuario(req, res, next) {
  try { res.json({ data: await service.vistaPreviaUsuario({ id: req.validated.params.id, actorId: req.user.id }) }); } catch (error) { next(error); }
}

async function borrarUsuario(req, res, next) {
  try {
    const { _auditDiff, ...data } = await service.borrarUsuario({ id: req.validated.params.id, actorId: req.user.id, confirmar: req.body.confirmar });
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}

async function vistaPreviaEmpleados(_req, res, next) {
  try { res.json({ data: await service.vistaPreviaEmpleados() }); } catch (error) { next(error); }
}

async function borrarEmpleados(req, res, next) {
  try {
    const { _auditDiff, ...data } = await service.borrarEmpleados({ actorId: req.user.id, confirmar: req.body.confirmar, clave: req.body.clave });
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}

export default { estado, fijarModoPruebas, vistaPreviaDatos, limpiarDatos, vistaPreviaUsuario, borrarUsuario, vistaPreviaEmpleados, borrarEmpleados };
