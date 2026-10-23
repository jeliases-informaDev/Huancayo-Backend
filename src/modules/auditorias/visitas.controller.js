import visitasService from './visitas.service.js';
import { env } from '#core/config/env.js';
import { autoasignacionPermitida } from '#modules/sistema/configuracion.service.js';
import { publica as empresaPublica } from '#modules/empresas/empresas.service.js';

function notifyRoles(req, event, data) {
  const io = req.app.get('io');
  if (!io) return;
  const e = req.user.empresa_id; // solo la empresa de la petición recibe el aviso
  ['ADMINISTRADOR', 'SUPERVISOR'].forEach(rol => io.to(`empresa:${e}:role:${rol}`).emit(event, data));
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
    const { bytes } = await visitasService.obtenerArchivoEvidencia(req.params.idEvidencia);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(bytes);
  } catch (error) { next(error); }
}

async function ubicacion(req, res, next) {
  try {
    const { eventos = [], ...data } = await visitasService.actualizarUbicacionEnVivo(req.user.id, req.body);
    notifyRoles(req, 'ubicacion_actualizada', data);
    eventos.forEach((evento) => notifyRoles(req, 'evento_campo', evento));
    res.json({ data });
  } catch (error) { next(error); }
}

async function jornada(req, res, next) {
  try {
    const { accion, ...zona } = req.body;
    const { _auditDiff, ...data } = await visitasService.registrarJornada(req.user.id, accion, zona);
    req.auditContext = _auditDiff;
    notifyRoles(req, 'jornada_actualizada', data);
    res.json({ data });
  } catch (error) { next(error); }
}

async function config(_req, res, next) {
  try {
    // Reglas y marca de la empresa del usuario (las del producto si no tiene propias).
    const empresa = await empresaPublica();
    res.json({ data: { ...(empresa?.reglas || { geocerca_radio_m: env.GEOFENCE_RADIO_METROS, precision_maxima_m: env.GEOFENCE_PRECISION_MAXIMA_METROS }), autoasignacion: await autoasignacionPermitida(), empresa: empresa ? { id: empresa.id, nombre: empresa.nombre, marca: empresa.marca } : null } });
  } catch (error) { next(error); }
}

export default { presignEvidencia, subirEvidencia, crear, listar, obtener, archivoEvidencia, ubicacion, jornada, config };
