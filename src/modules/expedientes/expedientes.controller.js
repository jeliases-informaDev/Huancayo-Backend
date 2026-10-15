import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import ExcelJS from 'exceljs';
import expedientesService from './expedientes.service.js';

// Valor de una celda de ExcelJS: puede ser un primitivo, una fecha, texto enriquecido
// o el resultado cacheado de una fórmula — se normaliza todo a primitivo simple.
function cellValue(cell) {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) return cell;
  if (typeof cell === 'object') {
    if (Array.isArray(cell.richText)) return cell.richText.map(part => part.text).join('');
    if (cell.text !== undefined) return cell.text;
    if (cell.result !== undefined) return cell.result;
  }
  return cell;
}

// Lee TODAS las hojas con datos (la base de Caja Huancayo separa por tipo de crédito:
// la hoja OTROS es MYPE, CONSUMO es consumo). Cada hoja usa su fila 1 como encabezados.
async function leerHojasExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const hojas = [];
  for (const worksheet of workbook.worksheets) {
    const encabezados = worksheet.getRow(1).values.slice(1).map(header => String(cellValue(header)).trim());
    const filas = [];
    const numeros = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values = row.values;
      const fila = {};
      encabezados.forEach((header, index) => {
        if (!header) return;
        fila[header] = cellValue(values[index + 1]);
      });
      filas.push(fila);
      numeros.push(rowNumber);
    });
    if (filas.length) hojas.push({ nombre: worksheet.name, encabezados: encabezados.filter(Boolean), filas, numeros });
  }
  return hojas;
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
async function eliminar(req, res, next) {
  try {
    const { _auditDiff } = await expedientesService.eliminar(req.validated.params.id);
    req.auditContext = _auditDiff;
    res.status(204).send();
  } catch (error) { next(error); }
}
async function importar(req, res, next) {
  const ruta = req.file?.path;
  try {
    if (!req.file) { const error = new Error('Debe adjuntar un archivo XLSX'); error.statusCode = 400; throw error; }
    const contenido = await fs.readFile(ruta);
    const archivoSha256 = crypto.createHash('sha256').update(contenido).digest('hex');
    const hojas = await leerHojasExcel(ruta);
    if (!hojas.length) { const error = new Error('El archivo no tiene filas de datos.'); error.statusCode = 400; throw error; }
    const resultado = await expedientesService.importador.importarHojas(hojas, { actorId: req.user.id, archivo: req.file.originalname, archivoSha256 });
    req.auditContext = {
      entidad: 'ImportacionMasiva', entidad_id: resultado.id_importacion, valor_anterior: null,
      valor_nuevo: { archivo: resultado.archivo, formato: resultado.formato, total_filas: resultado.total_filas, insertadas: resultado.insertadas, actualizadas: resultado.actualizadas, sin_cambios: resultado.sin_cambios, omitidas: resultado.omitidas, errores: resultado.errores, archivo_sha256: archivoSha256 },
    };
    res.status(201).json({ data: resultado });
  } catch (error) {
    next(error);
  } finally {
    // El archivo trae datos personales de clientes: no debe quedar en el disco del servidor.
    if (ruta) await fs.rm(ruta, { force: true }).catch(() => {});
  }
}
async function listarImportaciones(req, res, next) {
  try { res.json(await expedientesService.importador.listarImportaciones(req.validated.query)); } catch (error) { next(error); }
}
async function obtenerImportacion(req, res, next) {
  try { res.json({ data: await expedientesService.importador.obtenerImportacion(req.validated.params.id) }); } catch (error) { next(error); }
}

export default { listar, obtener, crear, actualizar, eliminar, importar, listarImportaciones, obtenerImportacion };
