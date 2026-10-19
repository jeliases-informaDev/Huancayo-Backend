import terminosService from './terminos.service.js';

async function obtener(req, res, next) {
  try { res.json({ data: await terminosService.obtener(req.user) }); } catch (error) { next(error); }
}

async function aceptar(req, res, next) {
  try {
    const data = await terminosService.aceptar(req.user, {
      version: req.body.version,
      plataforma: terminosService.plataformaDe(req.get('x-client-platform')),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    // Queda también en la bitácora de seguridad (quién aceptó qué versión y desde dónde).
    if (data.id_aceptacion) {
      req.auditContext = { entidad: 'AceptacionTerminos', entidad_id: data.id_aceptacion, valor_anterior: null, valor_nuevo: { usuario: req.user.username, version: data.version, plataforma: data.plataforma } };
    }
    res.status(data.id_aceptacion ? 201 : 200).json({ data });
  } catch (error) { next(error); }
}

export default { obtener, aceptar };
