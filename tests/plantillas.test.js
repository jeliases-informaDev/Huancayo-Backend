import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { generarPlantilla, COLUMNAS_SIMPLE } from '../src/modules/expedientes/plantillas.service.js';
import { COLUMNAS_CORE } from '../src/modules/expedientes/importador/columnas-core.js';
import { construirFilaCore } from '../src/modules/expedientes/importador/muestra-core.js';
import { mapearFilaCore } from '../src/modules/expedientes/importador/formato-core.js';

const leer = async (buffer) => { const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buffer); return wb; };
const encabezados = (ws) => ws.getRow(1).values.slice(1).map((v) => String(v));

test('la plantilla CORE trae las 262 columnas en su orden, 3 ejemplos y la hoja de instrucciones', async () => {
  const wb = await leer(await generarPlantilla('CORE_262'));
  const ws = wb.getWorksheet('OTROS');
  assert.ok(ws, 'hoja OTROS');
  assert.deepEqual(encabezados(ws), COLUMNAS_CORE);
  assert.equal(ws.rowCount, 4);
  assert.ok(wb.getWorksheet('Instrucciones'), 'hoja Instrucciones');
});

test('la plantilla SIMPLE trae las columnas del formato simple con las obligatorias primero', async () => {
  const wb = await leer(await generarPlantilla('SIMPLE'));
  const ws = wb.getWorksheet('Expedientes');
  assert.deepEqual(encabezados(ws), [...COLUMNAS_SIMPLE]);
  assert.deepEqual(COLUMNAS_SIMPLE.slice(0, 5), ['codigo_expediente', 'tipo_credito', 'numero_documento_cliente', 'nombres_cliente', 'asesor_responsable']);
  assert.equal(ws.rowCount, 4);
  await assert.rejects(() => generarPlantilla('OTRO'), /desconocido/);
});

test('las filas de ejemplo son completas: ninguna columna vacía, el importador las acepta sin errores ni avisos', () => {
  for (let i = 0; i < 12; i += 1) {
    const fila = construirFilaCore(i, { hoy: '2026-10-18' });
    const vacias = COLUMNAS_CORE.filter((c) => fila[c] === undefined || fila[c] === '' || fila[c] === 'NULL');
    assert.deepEqual(vacias, [], `fila ${i} con columnas vacías`);
    const r = mapearFilaCore(fila, { hoja: 'OTROS' });
    assert.equal(r.error, undefined, `fila ${i}: ${r.error}`);
    assert.deepEqual(r.advertencias, [], `fila ${i} con avisos: ${r.advertencias.join(',')}`);
    assert.ok(r.expediente.latitud && r.expediente.longitud, 'coordenadas desde la referencia');
    assert.equal(r.expediente.datos_negocio.negocios.length, 2);
    assert.ok(r.expediente.evaluacion_financiera.reevaluacion && r.expediente.evaluacion_financiera.anterior);
    assert.equal(r.expediente.evaluacion_financiera.ingresos.length, 5);
  }
  // Determinista: la misma semilla da la misma fila (la plantilla no cambia en cada descarga).
  assert.deepEqual(construirFilaCore(3, { hoy: '2026-10-18' }), construirFilaCore(3, { hoy: '2026-10-18' }));
  assert.notEqual(construirFilaCore(3, { semilla: 1, hoy: '2026-10-18' }).cnomcliente, construirFilaCore(3, { semilla: 2, hoy: '2026-10-18' }).cnomcliente);
});
