import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import expedientesService from './expedientes.service.js';

function sha256Archivo(ruta) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    createReadStream(ruta).on('data', (parte) => hash.update(parte)).on('end', () => resolve(hash.digest('hex'))).on('error', reject);
  });
}

async function listar(req, res, next) {
  try { res.json(await expedientesService.listar(req.validated.query)); } catch (error) { next(error); }
}
async function obtener(req, res, next) {
  try { res.json({ data: await expedientesService.obtener(req.validated.params.id) }); } catch (error) { next(error); }
}
async function crear(req, res, next) {
  try { res.status(201).json({ data: await expedientesService.crear(req.body) }); } catch (error) { next(error); }
}
async function actualizar(req, res, next) {
  try {
    const { _auditDiff, ...data } = await expedientesService.actualizar(req.validated.params.id, req.body, req.user.id);
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}
async function fijarUbicacionNegocio(req, res, next) {
  try {
    const { id, indice } = req.validated.params;
    const { _auditDiff, ...data } = await expedientesService.fijarUbicacionNegocio(id, indice, req.body, req.user.id);
    req.auditContext = _auditDiff;
    res.json({ data });
  } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try {
    const { _auditDiff } = await expedientesService.eliminar(req.validated.params.id);
    req.auditContext = _auditDiff;
    res.status(204).send();
  } catch (error) { next(error); }
}
// Responde de inmediato (202) y procesa en segundo plano; el panel consulta el avance en
// GET /importaciones/:id. Con ?simular=true solo valida y devuelve el reporte, sin guardar nada.
async function importar(req, res, next) {
  const ruta = req.file?.path;
  let delegado = false;
  try {
    if (!req.file) { const error = new Error('Debe adjuntar un archivo XLSX'); error.statusCode = 400; throw error; }
    const archivoSha256 = await sha256Archivo(ruta);
    const { simular, autoasignable } = req.validated?.query || {};
    const resultado = await expedientesService.importador.iniciarImportacion({
      ruta, actorId: req.user.id, archivo: req.file.originalname, archivoSha256, simular: simular === 'true', autoasignable: autoasignable === 'true',
    });
    delegado = true; // desde aquí el servicio borra el archivo al terminar
    req.auditContext = {
      entidad: 'ImportacionMasiva', entidad_id: resultado.id_importacion, valor_anterior: null,
      valor_nuevo: { archivo: req.file.originalname, archivo_sha256: archivoSha256, simulacion: resultado.simulacion, autoasignable: autoasignable === 'true' },
    };
    res.status(202).json({ data: resultado });
  } catch (error) {
    next(error);
  } finally {
    if (!delegado && ruta) await fs.rm(ruta, { force: true }).catch(() => {});
  }
}
async function listarImportaciones(req, res, next) {
  try { res.json(await expedientesService.importador.listarImportaciones(req.validated.query)); } catch (error) { next(error); }
}
async function obtenerImportacion(req, res, next) {
  try { res.json({ data: await expedientesService.importador.obtenerImportacion(req.validated.params.id) }); } catch (error) { next(error); }
}

async function liberarImportacion(req, res, next) {
  try {
    const data = await expedientesService.importador.liberarImportacion(req.validated.params.id);
    req.auditContext = { entidad: 'ImportacionMasiva', entidad_id: req.validated.params.id, valor_anterior: null, valor_nuevo: { accion: 'LIBERAR_A_AUDITORES', ...data } };
    res.json({ data });
  } catch (error) { next(error); }
}

export default { listar, obtener, crear, actualizar, fijarUbicacionNegocio, eliminar, importar, listarImportaciones, obtenerImportacion, liberarImportacion };
