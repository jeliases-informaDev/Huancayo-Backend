import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import expedientesService from './expedientes.service.js';
import { generarPlantilla } from './plantillas.service.js';
import { reglas as reglasEmpresa } from '#modules/empresas/empresas.service.js';

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
async function geoResumen(_req, res, next) { try { res.json({ data: await expedientesService.geoResumen() }); } catch (error) { next(error); } }
async function geoProcesar(req, res, next) {
  try {
    if (!(await expedientesService.geoResumen()).activa) { const e = new Error('La búsqueda de direcciones en un proveedor de mapas está desactivada en este servidor (GEOCODING_WORKER_ENABLED).'); e.statusCode = 409; e.code = 'GEOCODING_DISABLED'; throw e; }
    res.json({ data: await expedientesService.geoProcesar({ limite: req.validated?.query?.limite }) });
  } catch (error) { next(error); }
}
async function geoReencolar(_req, res, next) { try { res.json({ data: await expedientesService.geoReencolar() }); } catch (error) { next(error); } }
async function geoUno(req, res, next) { try { res.json({ data: await expedientesService.geoUno(req.validated.params.id) }); } catch (error) { next(error); } }
async function aceptarUbicacionSugerida(req, res, next) {
  try {
    const { _auditDiff, ...data } = await expedientesService.aceptarUbicacionSugerida(req.validated.params.id, req.user.id);
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
// Plantilla de Excel del formato pedido, solo si la empresa lo acepta.
async function plantilla(req, res, next) {
  try {
    const formato = req.validated.query.formato;
    const permitidos = (await reglasEmpresa()).formatos_importacion || [];
    if (!permitidos.includes(formato)) return res.status(403).json({ error: 'Tu empresa no acepta este formato de importación', code: 'FORMATO_NO_PERMITIDO' });
    const archivo = await generarPlantilla(formato);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="plantilla-expedientes-${formato.toLowerCase()}.xlsx"`);
    res.send(archivo);
  } catch (error) { next(error); }
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

export default { listar, obtener, crear, actualizar, fijarUbicacionNegocio, geoResumen, geoProcesar, geoReencolar, geoUno, aceptarUbicacionSugerida, eliminar, importar, plantilla, listarImportaciones, obtenerImportacion, liberarImportacion };
