import test from 'node:test';
import assert from 'node:assert/strict';
import { ZONAS_ESPECIALES, construirFilaCore, construirFilaSimple } from '../src/modules/expedientes/importador/muestra-core.js';
import { COLUMNAS_SIMPLE } from '../src/modules/expedientes/plantillas.service.js';

const coordenadasDe = (texto) => { const m = /Ref:\s*(-?\d+\.\d+),(-?\d+\.\d+)/.exec(texto); return m ? [Number(m[1]), Number(m[2])] : null; };
// Lince, con margen: su centro es (-12.084, -77.0335) y las muestras se reparten ±550 m alrededor.
const enLince = ([lat, lon]) => lat > -12.0895 && lat < -12.0785 && lon > -77.0390 && lon < -77.0280;

test('las filas MYPE de Lince traen domicilio, locales y oficina en Lince, con coordenadas dentro del distrito', () => {
  for (let i = 0; i < 18; i += 1) {
    const f = construirFilaCore(9000 + i, { zona: 'LINCE', semilla: 20261023 });
    assert.equal(f.DisDOM, 'LINCE'); assert.equal(f.ProvDom, 'LIMA'); assert.equal(f.depDom, 'LIMA'); assert.equal(f.DISTNEG_1, 'LINCE');
    assert.notEqual(f.Oficina, f.DisDOM, 'la agencia no debe llamarse como el distrito (el importador avisa)');
    for (const campo of ['cRefDomCli', 'RefEmp_1']) { const c = coordenadasDe(f[campo]); assert.ok(c && enLince(c), `${campo} fuera de Lince: ${f[campo]}`); }
    assert.match(f.cdirdomcli, /AV\.|JR\./);
  }
});

test('los números de crédito de Lince son únicos y no chocan con los de las muestras generales (1 a 5000)', () => {
  const lince = Array.from({ length: 30 }, (_, i) => construirFilaCore(9000 + i, { zona: 'LINCE' }).ccodctacre);
  assert.equal(new Set(lince).size, 30);
  const generales = new Set(Array.from({ length: 5000 }, (_, i) => construirFilaCore(i).ccodctacre));
  assert.ok(lince.every((c) => !generales.has(c)), 'un número de Lince coincide con el de una muestra general: la pisaría al importarla');
});

test('pedir una zona no cambia las muestras generales (siguen rotando por sus zonas de siempre)', () => {
  assert.equal(construirFilaCore(0).DisDOM, 'COMAS');
  assert.equal(construirFilaCore(5).DisDOM, 'SAN MARTIN DE PORRES');
  assert.equal(construirFilaCore(9).DisDOM, 'HUANCAYO');
  assert.equal(construirFilaCore(10).DisDOM, 'COMAS');
  assert.equal(construirFilaCore(3, { zona: 'NO-EXISTE' }).DisDOM, 'VILLA EL SALVADOR'); // una zona desconocida cae a la rotación normal
  assert.deepEqual(construirFilaCore(7), construirFilaCore(7, { zona: undefined }));
});

test('las filas de consumo de Lince cumplen el formato simple: obligatorias completas, coordenadas en Lince y códigos únicos', () => {
  const filas = Array.from({ length: 12 }, (_, i) => construirFilaSimple(i, { zona: 'LINCE', semilla: 20261023 }));
  for (const f of filas) {
    for (const c of ['codigo_expediente', 'tipo_credito', 'numero_documento_cliente', 'nombres_cliente', 'asesor_responsable']) assert.ok(f[c], `falta ${c}`);
    assert.equal(f.tipo_credito, 'CONSUMO'); assert.match(f.numero_documento_cliente, /^\d{8}$/); assert.match(f.telefono_cliente, /^9\d{8}$/);
    assert.equal(f.distrito, 'LINCE'); assert.ok(enLince([f.latitud, f.longitud]), `fuera de Lince: ${f.latitud}, ${f.longitud}`);
    assert.ok(f.monto_desembolso >= 1500 && f.monto_desembolso <= 12500);
    assert.ok(Object.keys(f).every((k) => COLUMNAS_SIMPLE.includes(k)), 'columna que la plantilla simple no conoce');
  }
  assert.equal(new Set(filas.map((f) => f.codigo_expediente)).size, 12); assert.equal(filas[0].codigo_expediente, 'CR-LINCE-0001');
  assert.equal(new Set(filas.map((f) => f.numero_documento_cliente)).size, 12);
  assert.deepEqual(construirFilaSimple(3, { zona: 'LINCE' }), construirFilaSimple(3, { zona: 'LINCE' })); // determinista: la misma muestra cada vez
});

test('la zona de Lince está registrada con su centro', () => {
  assert.equal(ZONAS_ESPECIALES.LINCE.distrito, 'LINCE');
  assert.ok(enLince([ZONAS_ESPECIALES.LINCE.lat, ZONAS_ESPECIALES.LINCE.lon]));
});
