// Genera un Excel con casos de PRUEBA en LINCE (Lima) para que los probadores tengan casos cerca de donde trabajan. Datos inventados:
//  · hoja OTROS: créditos MYPE en el formato core de 262 columnas (domicilio y locales del negocio con coordenadas en Lince, evaluaciones, ingresos y deudas).
//  · hoja Expedientes: créditos de CONSUMO en el formato simple (con coordenadas).
// Los códigos no chocan con los de las muestras generales (no pisan ningún expediente existente). Se carga desde el panel: Expedientes → Cargar archivo.
//   node scripts/generar-muestra-lince.mjs [salida.xlsx] [cantidad MYPE=18] [cantidad CONSUMO=12]
import ExcelJS from 'exceljs';
import { COLUMNAS_CORE } from '../src/modules/expedientes/importador/columnas-core.js';
import { construirFilaCore, construirFilaSimple, filaCoreComoArreglo } from '../src/modules/expedientes/importador/muestra-core.js';
import { COLUMNAS_SIMPLE } from '../src/modules/expedientes/plantillas.service.js';

const salida = process.argv[2] || 'Lince-casos-de-prueba.xlsx';
const mype = Math.min(Math.max(Number(process.argv[3]) || 18, 0), 500);
const consumo = Math.min(Math.max(Number(process.argv[4]) || 12, 0), 500);
// Las filas del core se numeran desde aquí: el número de crédito (ccodctacre) sale del índice, y las muestras generales usan 1…5000.
const DESDE = 9000;
const SEMILLA = 20261023;

const wb = new ExcelJS.Workbook();
wb.creator = 'Auditoria de Visitas';
if (mype) {
  const ws = wb.addWorksheet('OTROS');
  ws.addRow(COLUMNAS_CORE);
  for (let i = 0; i < mype; i += 1) ws.addRow(filaCoreComoArreglo(construirFilaCore(DESDE + i, { zona: 'LINCE', semilla: SEMILLA })));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}
if (consumo) {
  const ws = wb.addWorksheet('Expedientes');
  ws.addRow([...COLUMNAS_SIMPLE]);
  for (let i = 0; i < consumo; i += 1) { const f = construirFilaSimple(i, { zona: 'LINCE', semilla: SEMILLA }); ws.addRow(COLUMNAS_SIMPLE.map((c) => f[c] ?? '')); }
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  COLUMNAS_SIMPLE.forEach((c, i) => { ws.getColumn(i + 1).width = Math.max(14, c.length + 2); });
}
await wb.xlsx.writeFile(salida);
console.log(`Casos de prueba en Lince: ${salida} (${mype} MYPE + ${consumo} consumo = ${mype + consumo})`);
