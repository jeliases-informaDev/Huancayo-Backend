// Genera un Excel con la estructura exacta de la base MYPE del core (262 columnas, hoja OTROS) y datos INVENTADOS pero
// completos y coherentes: todas las columnas con valor, domicilios y locales con coordenadas (Lima y Huancayo), las dos
// evaluaciones, cinco líneas de ingresos y el endeudamiento. Sirve para cargar una base de demostración sin datos personales.
//   node scripts/generar-muestra-completa.mjs [ruta-de-salida.xlsx] [cantidad] [semilla]
import ExcelJS from 'exceljs';
import { COLUMNAS_CORE } from '../src/modules/expedientes/importador/columnas-core.js';
import { construirFilaCore, filaCoreComoArreglo } from '../src/modules/expedientes/importador/muestra-core.js';

const salida = process.argv[2] || 'Muestra-completa.xlsx';
const cantidad = Math.min(Math.max(Number(process.argv[3]) || 100, 1), 5000);
const semilla = Number(process.argv[4]) || 20261018;

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('OTROS');
ws.addRow(COLUMNAS_CORE);
for (let i = 0; i < cantidad; i += 1) ws.addRow(filaCoreComoArreglo(construirFilaCore(i, { semilla })));
ws.getRow(1).font = { bold: true };
ws.views = [{ state: 'frozen', ySplit: 1 }];
await wb.xlsx.writeFile(salida);
console.log(`Muestra completa generada: ${salida} (${cantidad} filas, ${COLUMNAS_CORE.length} columnas, semilla ${semilla})`);
