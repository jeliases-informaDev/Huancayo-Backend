import XLSX from 'xlsx';
import expedientesService from './expedientes.service.js';

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
  try { res.json({ data: await expedientesService.actualizar(req.validated.params.id, req.body) }); } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try { await expedientesService.eliminar(req.validated.params.id); res.status(204).send(); } catch (error) { next(error); }
}
async function importar(req, res, next) {
  try {
    if (!req.file) { const error = new Error('Debe adjuntar un archivo XLSX'); error.statusCode = 400; throw error; }
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const resultado = await expedientesService.importarExcel(rows, req.user.id, req.file.originalname);
    res.status(201).json({ data: resultado });
  } catch (error) { next(error); }
}

export default { listar, obtener, crear, actualizar, eliminar, importar };
