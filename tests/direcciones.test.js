import test from 'node:test';
import assert from 'node:assert/strict';
import { descomponerDireccion, limpiarDireccion, evaluarResultado, coincideDistrito } from '../src/modules/geocodificacion/direcciones.js';

const zona = { distrito: 'Huancayo', provincia: 'Huancayo' };

test('jirón con número: tipo de vía, nombre y número, y queda completa', () => {
  const d = descomponerDireccion('JR. LOS PINOS 210', zona);
  assert.equal(d.componentes.tipo_via, 'Jirón');
  assert.equal(d.componentes.nombre_via, 'Los Pinos');
  assert.equal(d.componentes.numero, '210');
  assert.equal(d.normalizada, 'Jirón Los Pinos 210');
  assert.deepEqual(d.calidad, []);
});

test('avenida con «N°», urbanización y referencia: las separa', () => {
  const d = descomponerDireccion('AV. FERROCARRIL N° 1250 URB. SAN CARLOS REF. FRENTE AL MERCADO', zona);
  assert.equal(d.componentes.tipo_via, 'Avenida');
  assert.equal(d.componentes.nombre_via, 'Ferrocarril');
  assert.equal(d.componentes.numero, '1250');
  assert.equal(d.componentes.urbanizacion, 'Urbanización San Carlos');
  assert.match(d.componentes.referencia, /FRENTE AL MERCADO/i);
  assert.equal(d.normalizada, 'Avenida Ferrocarril 1250, Urbanización San Carlos');
});

test('manzana y lote en un AA.HH.: se marcan como dirección de baja precisión, sin exigir número', () => {
  const d = descomponerDireccion('Mz D Lt 15 AA.HH. Los Olivos', zona);
  assert.equal(d.componentes.manzana, 'D');
  assert.equal(d.componentes.lote, '15');
  assert.match(d.componentes.urbanizacion, /Los Olivos/);
  assert.ok(d.calidad.includes('MANZANA_LOTE'));
  assert.ok(!d.calidad.includes('SIN_NUMERO'));
});

test('sin número, sin tipo de vía, sin distrito y vacía: cada falta se avisa', () => {
  assert.ok(descomponerDireccion('Calle Real', zona).calidad.includes('SIN_NUMERO'));
  const sinTipo = descomponerDireccion('Los Pinos 210', zona);
  assert.ok(sinTipo.calidad.includes('SIN_TIPO_VIA')); assert.equal(sinTipo.componentes.numero, '210');
  assert.ok(descomponerDireccion('Jr. Lima 100', { provincia: 'Huancayo' }).calidad.includes('SIN_DISTRITO'));
  assert.deepEqual(descomponerDireccion('', zona).calidad, ['SIN_DIRECCION']);
  assert.ok(descomponerDireccion('Jr 1', zona).calidad.includes('DIRECCION_CORTA'));
});

test('carretera con kilómetro y pasaje con interior', () => {
  const k = descomponerDireccion('Carretera Central Km 5', zona);
  assert.equal(k.componentes.tipo_via, 'Carretera'); assert.equal(k.componentes.numero, 'Km 5');
  const p = descomponerDireccion('Psje. Las Flores 123 Dpto 301', zona);
  assert.equal(p.componentes.tipo_via, 'Pasaje'); assert.equal(p.componentes.nombre_via, 'Las Flores'); assert.equal(p.componentes.numero, '123'); assert.match(p.componentes.interior, /301/);
});

test('limpiarDireccion expande abreviaturas para el buscador', () => {
  const l = limpiarDireccion('Av.Petit Thouars 4567 Dpto 301');
  assert.equal(l.calle, 'Avenida Petit Thouars'); assert.equal(l.numero, '4567');
});

test('confianza del punto: exacto con número y distrito = ALTA; calle = MEDIA; fuera del distrito = BAJA; manzana/lote = BAJA', () => {
  const exacto = { addresstype: 'house', address: { house_number: '210', suburb: 'Huancayo' } };
  assert.equal(evaluarResultado({ item: exacto, numeroSolicitado: '210', distritoEsperado: 'Huancayo' }).confianza, 'ALTA');
  const calle = { addresstype: 'road', address: { suburb: 'Huancayo' } };
  assert.equal(evaluarResultado({ item: calle, numeroSolicitado: '210', distritoEsperado: 'Huancayo' }).confianza, 'MEDIA');
  assert.equal(evaluarResultado({ item: exacto, numeroSolicitado: '210', distritoEsperado: 'Chilca' }).confianza, 'BAJA');
  assert.equal(evaluarResultado({ item: exacto, esManzanaLote: true, distritoEsperado: 'Huancayo' }).confianza, 'BAJA');
  assert.equal(coincideDistrito('Chilca', { suburb: 'Huancayo' }), false);
});

// ---------------------------------------------------------------- búsquedas para el mapa (manzana y lote)
import { busquedasParaDireccion, zonaParaBuscar, nombreDeZona } from '../src/modules/geocodificacion/direcciones.js';

test('la zona se escribe como la tienen los mapas y se le puede quitar el tipo', () => {
  assert.equal(zonaParaBuscar('AA.HH. Pamplona Alta'), 'Asentamiento Humano Pamplona Alta');
  assert.equal(zonaParaBuscar('Asociación Viv. Valle de Mantaro'), 'Asociación Vivienda Valle de Mantaro');
  assert.equal(zonaParaBuscar('Cooperativa Pro Viv. Los Alamos'), 'Cooperativa Pro Vivienda Los Alamos');
  assert.equal(nombreDeZona('Asentamiento Humano Pamplona Alta'), 'Pamplona Alta');
  assert.equal(nombreDeZona('Urbanización Las Gardenias'), 'Las Gardenias');
  assert.equal(nombreDeZona('Pueblo Joven 1ro de Mayo'), '1ro de Mayo');
});

test('con número de puerta se busca calle + número + distrito y, si no, el texto completo', () => {
  const { busquedas, limpia } = busquedasParaDireccion({ direccion: 'AV. TUPAC AMARU 1500', distrito: 'COMAS', provincia: 'LIMA', departamento: 'LIMA' });
  assert.equal(limpia.numero, '1500');
  assert.deepEqual(busquedas.map((b) => b.street || b.q), ['1500 Avenida TUPAC AMARU', 'Avenida TUPAC AMARU 1500, COMAS, LIMA']);
  assert.equal(busquedas[0].city, 'COMAS');
});

test('con manzana y lote no se busca la puerta: se busca la zona (con y sin su tipo) y luego la calle, siempre con el distrito', () => {
  const { busquedas } = busquedasParaDireccion({ direccion: 'AA.HH. PAMPLONA ALTA MZ C LT 10', distrito: 'SAN JUAN DE MIRAFLORES', provincia: 'LIMA', departamento: 'LIMA' });
  assert.deepEqual(busquedas.map((b) => b.q), ['Asentamiento Humano Pamplona Alta, SAN JUAN DE MIRAFLORES, LIMA', 'Pamplona Alta, SAN JUAN DE MIRAFLORES, LIMA']);
  assert.ok(busquedas.every((b) => !b.street), 'nada estructurado: no hay número de puerta');
  const conCalle = busquedasParaDireccion({ direccion: 'CALLE LOS CEDROS MZ B LT 3', distrito: 'CHILCA', provincia: 'HUANCAYO', departamento: 'JUNIN' }).busquedas;
  assert.deepEqual(conCalle.map((b) => b.q), ['Calle Los Cedros, CHILCA, HUANCAYO, JUNIN']);
  assert.deepEqual(busquedasParaDireccion({ direccion: 'MZ A LT 3', distrito: 'COMAS' }).busquedas, [], 'solo manzana y lote: no hay nada que buscar');
});
