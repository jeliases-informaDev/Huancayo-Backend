import ExcelJS from 'exceljs';
import expedientesService from './expedientes.service.js';

// Valor de una celda de ExcelJS: puede ser un primitivo, una fecha, texto enriquecido
// o el resultado cacheado de una fórmula — se normaliza todo a primitivo simple.
function cellValue(cell) {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) return cell.toISOString();
  if (typeof cell === 'object') {
    if (Array.isArray(cell.richText)) return cell.richText.map(part => part.text).join('');
    if (cell.text !== undefined) return cell.text;
    if (cell.result !== undefined) return cell.result;
  }
  return cell;
}

async function leerFilasExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];
  const headers = worksheet.getRow(1).values.slice(1).map(header => String(cellValue(header)).trim());
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const fila = {};
    headers.forEach((header, index) => {
      if (!header) return;
      fila[header] = cellValue(values[index + 1]);
    });
    rows.push(fila);
  });
  return rows;
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
  try { res.json({ data: await expedientesService.actualizar(req.validated.params.id, req.body) }); } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try { await expedientesService.eliminar(req.validated.params.id); res.status(204).send(); } catch (error) { next(error); }
}
async function importar(req, res, next) {
  try {
    if (!req.file) { const error = new Error('Debe adjuntar un archivo XLSX'); error.statusCode = 400; throw error; }
    const rows = await leerFilasExcel(req.file.path);
    const resultado = await expedientesService.importarExcel(rows, req.user.id, req.file.originalname);
    res.status(201).json({ data: resultado });
  } catch (error) { next(error); }
}

export default { listar, obtener, crear, actualizar, eliminar, importar };
