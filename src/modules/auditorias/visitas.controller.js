import visitasService from './visitas.service.js';

function notifyRoles(req, event, data) {
  const io = req.app.get('io');
  if (!io) return;
  ['ADMINISTRADOR', 'SUPERVISOR'].forEach(rol => io.to(`role:${rol}`).emit(event, data));
}

async function presignEvidencia(req, res, next) {
  try {
    const id_expediente = Number(req.body.id_expediente || req.query.id_expediente);
    if (!id_expediente) { const error = new Error('id_expediente es obligatorio'); error.statusCode = 400; throw error; }
    res.json({ data: await visitasService.presignEvidencia(req.user.id, id_expediente, req.body) });
  } catch (error) { next(error); }
}

async function subirEvidencia(req, res, next) {
  try {
    const key = decodeURIComponent(req.params.key);
    const id_expediente = Number(req.query.id_expediente);
    const tipo = req.query.tipo;
    if (!id_expediente || !['FOTO_PRINCIPAL', 'FOTO_ADICIONAL'].includes(tipo)) {
      const error = new Error('id_expediente y tipo son obligatorios'); error.statusCode = 400; throw error;
    }
    const resultado = await visitasService.recibirEvidencia({ key, buffer: req.body, auditorId: req.user.id, id_expediente, tipo });
    res.json({ data: resultado });
  } catch (error) { next(error); }
}

async function crear(req, res, next) {
  try {
    const data = await visitasService.crearVisita(req.user.id, req.body);
    notifyRoles(req, 'visita_registrada', { id_visita: data.id_visita, id_expediente: data.id_expediente, id_usuario_auditor: req.user.id, resultado: data.resultado, alertas: data._alertas });
    res.status(201).json({ data });
  } catch (error) { next(error); }
}

async function listar(req, res, next) {
  try { res.json(await visitasService.listar(req.validated.query)); } catch (error) { next(error); }
}
async function obtener(req, res, next) {
  try { res.json({ data: await visitasService.obtener(Number(req.params.id)) }); } catch (error) { next(error); }
}

async function archivoEvidencia(req, res, next) {
  try {
    const { path } = await visitasService.obtenerArchivoEvidencia(req.params.idEvidencia);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.sendFile(path);
  } catch (error) { next(error); }
}

async function ubicacion(req, res, next) {
  try {
    const data = await visitasService.actualizarUbicacionEnVivo(req.user.id, req.body);
    notifyRoles(req, 'ubicacion_actualizada', data);
    res.json({ data });
  } catch (error) { next(error); }
}

export default { presignEvidencia, subirEvidencia, crear, listar, obtener, archivoEvidencia, ubicacion };
