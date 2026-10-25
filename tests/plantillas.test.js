import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { generarPlantilla, COLUMNAS_SIMPLE } from '../src/modules/expedientes/plantillas.service.js';
import fs from 'node:fs';
import { COLUMNAS_CORE, COLUMNAS_CONSUMO, COLUMNAS_CONSUMO_PROPIAS } from '../src/modules/expedientes/importador/columnas-core.js';
import { construirFilaCore, construirFilaConsumo } from '../src/modules/expedientes/importador/muestra-core.js';
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

test('el Modelo Consumo y el Modelo MYPE de la plantilla SIMPLE solo cambian el tipo de las filas de ejemplo', async () => {
  const tipos = async (tipo) => {
    const ws = (await leer(await generarPlantilla('SIMPLE', { tipo }))).getWorksheet('Expedientes');
    return [2, 3, 4].map((n) => String(ws.getRow(n).getCell(2).value));
  };
  assert.deepEqual(await tipos('CONSUMO'), ['CONSUMO', 'CONSUMO', 'CONSUMO']);
  assert.deepEqual(await tipos('OTROS'), ['MYPE', 'MYPE', 'MYPE']);
  assert.deepEqual(await tipos(undefined), ['OTROS', 'CONSUMO', 'OTROS'], 'sin tipo quedan los ejemplos mezclados de siempre');
  const wb = await leer(await generarPlantilla('SIMPLE', { tipo: 'OTROS' }));
  assert.deepEqual(encabezados(wb.getWorksheet('Expedientes')), [...COLUMNAS_SIMPLE], 'las columnas son las mismas');
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

// Los campos combinados de las dos fichas del banco (PLANTILLAS FICHAS DE VISITA.docx): es lo que tiene que poder llegar por la carga completa.
const fichasBanco = JSON.parse(fs.readFileSync(new URL('./fixtures/campos-fichas-banco.json', import.meta.url), 'utf8'));
const minusculas = (lista) => new Set(lista.map((c) => c.toLowerCase()));

test('la ficha MYPE del banco entera sale de las 262 columnas del core: ningún campo queda sin columna', () => {
  const core = minusculas(COLUMNAS_CORE);
  assert.equal(fichasBanco.OTROS.length, 204);
  assert.deepEqual(fichasBanco.OTROS.filter((c) => !core.has(c.toLowerCase())), []);
});

test('la ficha de Consumo del banco entera sale de la plantilla de Consumo: sus columnas del core más las 16 propias', () => {
  const consumo = minusculas(COLUMNAS_CONSUMO);
  assert.equal(fichasBanco.CONSUMO.length, 102);
  assert.deepEqual(fichasBanco.CONSUMO.filter((c) => !consumo.has(c.toLowerCase())), [], 'campos de la ficha sin columna en la plantilla');
  assert.equal(COLUMNAS_CONSUMO_PROPIAS.length, 16);
  assert.deepEqual(COLUMNAS_CONSUMO.slice(-16), COLUMNAS_CONSUMO_PROPIAS, 'las propias van al final');
  assert.equal(new Set(COLUMNAS_CONSUMO.map((c) => c.toLowerCase())).size, COLUMNAS_CONSUMO.length, 'sin columnas repetidas');
  assert.ok(COLUMNAS_CONSUMO.length > COLUMNAS_SIMPLE.length * 5, 'la plantilla completa no es la mínima');
});

test('la plantilla CORE de Consumo trae la hoja CONSUMO con todas las columnas de su ficha, 3 ejemplos y las instrucciones; sin tipo u OTROS sigue siendo la MYPE', async () => {
  const wb = await leer(await generarPlantilla('CORE_262', { tipo: 'CONSUMO' }));
  const ws = wb.getWorksheet('CONSUMO');
  assert.ok(ws, 'hoja CONSUMO');
  assert.equal(wb.getWorksheet('OTROS'), undefined);
  assert.deepEqual(encabezados(ws), COLUMNAS_CONSUMO);
  assert.equal(ws.rowCount, 4);
  assert.ok(wb.getWorksheet('Instrucciones'), 'hoja Instrucciones');
  for (const tipo of [undefined, 'OTROS']) {
    const mype = await leer(await generarPlantilla('CORE_262', { tipo }));
    assert.deepEqual(encabezados(mype.getWorksheet('OTROS')), COLUMNAS_CORE);
  }
});

test('las filas de ejemplo de Consumo se importan sin errores ni avisos y llevan el sustento y los ingresos', () => {
  for (let i = 0; i < 12; i += 1) {
    const fila = construirFilaConsumo(i, { hoy: '2026-10-18' });
    const vacias = COLUMNAS_CONSUMO.filter((c) => fila[c] === undefined || fila[c] === '' || fila[c] === 'NULL');
    assert.deepEqual(vacias, [], `fila ${i} con columnas vacías`);
    const r = mapearFilaCore(fila, { hoja: 'CONSUMO' });
    assert.equal(r.error, undefined, `fila ${i}: ${r.error}`);
    assert.deepEqual(r.advertencias, [], `fila ${i} con avisos: ${r.advertencias.join(',')}`);
    assert.equal(r.expediente.tipo_credito, 'CONSUMO');
    assert.ok(r.expediente.latitud && r.expediente.longitud, 'coordenadas desde la referencia');
    assert.ok(r.expediente.datos_negocio.sustento_ingreso, 'documento de sustento');
    const ingresos = r.expediente.evaluacion_financiera.ingresos_consumo;
    assert.ok(ingresos.length >= 1 && ingresos.length <= 3, `ingresos: ${ingresos.length}`);
    assert.ok(ingresos.every((x) => x.descripcion && x.monto > 0 && x.relacion && x.moneda && x.tipo_ingreso), 'cada ingreso completo');
  }
  assert.deepEqual(construirFilaConsumo(3, { hoy: '2026-10-18' }), construirFilaConsumo(3, { hoy: '2026-10-18' }), 'determinista');
});

test('en Consumo el aviso «sin evaluación» depende de los ingresos, no del balance de un negocio', () => {
  const fila = construirFilaConsumo(0, { hoy: '2026-10-18' });
  assert.deepEqual(mapearFilaCore(fila, { hoja: 'CONSUMO' }).advertencias, [], 'con ingresos no hay aviso');
  const sinIngresos = { ...fila, DESCRIPCIONCONSUMO1: '-', NMONINGDEU1: '0.00', DESCRIPCIONCONSUMO2: '-', NMONINGDEU2: '0.00', DESCRIPCIONCONSUMO3: '-', NMONINGDEU3: '0.00' };
  assert.ok(mapearFilaCore(sinIngresos, { hoja: 'CONSUMO' }).advertencias.includes('SIN_EVALUACION'), 'sin ingresos sí avisa');
  const mype = construirFilaCore(0, { hoy: '2026-10-18' });
  assert.ok(!mapearFilaCore(mype, { hoja: 'OTROS' }).advertencias.includes('SIN_EVALUACION'));
  assert.ok(mapearFilaCore({ ...mype, numeva1: '0', fechaeva1: '', numeva2: '0', fechaeva2: '' }, { hoja: 'OTROS' }).advertencias.includes('SIN_EVALUACION'), 'MYPE sin evaluación sigue avisando');
});
