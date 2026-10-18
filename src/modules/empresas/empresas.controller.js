import empresasService from './empresas.service.js';

// Solo el administrador universal de Sulotec ve y administra el catálogo de empresas.
async function listar(_req, res, next) {
  try { res.json({ data: await empresasService.listar() }); } catch (error) { next(error); }
}
async function crear(req, res, next) {
  try {
    const data = await empresasService.crear(req.body);
    req.auditContext = { entidad: 'Empresa', entidad_id: data.id, valor_anterior: null, valor_nuevo: data };
    res.status(201).json({ data });
  } catch (error) { next(error); }
}
async function actualizar(req, res, next) {
  try {
    const { _auditDiff, ...data } = await empresasService.actualizar(req.validated.params.id, req.body);
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}
// La propia empresa del usuario (nombre, marca y reglas). Nunca devuelve nada de otras empresas.
async function actual(req, res, next) {
  try {
    const data = await empresasService.publica(req.user.empresa_id);
    if (!data) return res.status(400).json({ error: 'Elige la empresa con la que vas a trabajar (cabecera x-empresa-id).', code: 'EMPRESA_REQUERIDA', requestId: req.id });
    res.json({ data });
  } catch (error) { next(error); }
}

export default { listar, crear, actualizar, actual };
