import test from 'node:test';
import assert from 'node:assert/strict';
import { decidirEventos, puntosDeCaso, claveDe } from '../src/modules/auditorias/eventos-campo.logica.js';
import { ubicacionBody } from '../src/validation/schemas.js';

// Cliente en Comas (Lima Norte). 0,00045° de latitud ≈ 50 m.
const LA = -11.9613896; const LO = -77.0491826;
const puntos = [{ id_expediente: 7, punto: 'DOMICILIO', latitud: LA, longitud: LO, soloSalida: false }];
const dentro = new Set([claveDe(7, 'DOMICILIO')]);
const en = (metrosNorte, extra = {}) => decidirEventos({ latitud: LA + metrosNorte * 0.000009, longitud: LO, puntos, radio: 100, ...extra });

test('llegada: entrar a la geocerca avisa una vez; si ya figura dentro, no repite', () => {
  assert.deepEqual(en(300), []);
  const llegada = en(50);
  assert.equal(llegada.length, 1);
  assert.equal(llegada[0].tipo, 'LLEGADA');
  assert.equal(llegada[0].id_expediente, 7);
  assert.equal(llegada[0].punto, 'DOMICILIO');
  assert.ok(llegada[0].distancia_m >= 45 && llegada[0].distancia_m <= 55);
  assert.deepEqual(en(50, { dentro }), []);
});

test('salida: hay que alejarse más de 1,5 veces el radio (el GPS que baila en el borde no genera avisos)', () => {
  assert.deepEqual(en(120, { dentro }), []);
  assert.deepEqual(en(149, { dentro }), []);
  const salida = en(200, { dentro });
  assert.equal(salida.length, 1);
  assert.equal(salida[0].tipo, 'SALIDA');
});

test('una posición simulada o muy imprecisa no prueba ni la llegada ni la salida', () => {
  assert.deepEqual(en(10, { simulada: true }), []);
  assert.deepEqual(en(10, { precision: 250 }), []);
  assert.deepEqual(en(400, { dentro, simulada: true }), []);
  assert.deepEqual(en(400, { dentro, precision: 250 }), []);
  assert.equal(en(10, { precision: 12 })[0].tipo, 'LLEGADA');
});

test('un caso ya cerrado hoy solo puede producir la salida, nunca otra llegada', () => {
  const cerrado = [{ ...puntos[0], soloSalida: true }];
  assert.deepEqual(decidirEventos({ latitud: LA, longitud: LO, puntos: cerrado, radio: 100 }), []);
  assert.equal(decidirEventos({ latitud: LA + 0.0027, longitud: LO, puntos: cerrado, dentro, radio: 100 })[0].tipo, 'SALIDA');
});

test('varios casos a la vez: cada uno se evalúa por separado', () => {
  const dos = [...puntos, { id_expediente: 9, punto: 'DOMICILIO', latitud: LA + 0.05, longitud: LO, soloSalida: false }];
  const r = decidirEventos({ latitud: LA, longitud: LO, puntos: dos, radio: 100 });
  assert.deepEqual(r.map((e) => `${e.tipo}:${e.id_expediente}`), ['LLEGADA:7']);
});

test('puntosDeCaso: domicilio y cada negocio con coordenadas (los que no tienen, no cuentan)', () => {
  const consumo = { id_expediente: 1, tipo_credito: 'CONSUMO', direccion_domicilio: 'Av. San Martín 840', distrito: 'Comas', latitud: LA, longitud: LO };
  assert.deepEqual(puntosDeCaso(consumo).map((p) => p.punto), ['DOMICILIO']);
  const sinCoordenadas = { ...consumo, latitud: null, longitud: null };
  assert.deepEqual(puntosDeCaso(sinCoordenadas), []);
  const mype = { ...consumo, tipo_credito: 'OTROS', datos_negocio: { negocios: [{ direccion: 'Jr. A 1', latitud: -12.0, longitud: -77.0 }, { direccion: 'Jr. B 2' }, { direccion: 'Jr. C 3', latitud: -12.1, longitud: -77.1 }] } };
  assert.deepEqual(puntosDeCaso(mype).map((p) => p.punto), ['DOMICILIO', 'NEGOCIO:0', 'NEGOCIO:2']);
  assert.equal(puntosDeCaso(mype, { soloSalida: true }).every((p) => p.soloSalida), true);
});

test('ubicacionBody acepta batería y carga, y sigue aceptando apps anteriores que no las envían', () => {
  assert.equal(ubicacionBody.safeParse({ latitud: LA, longitud: LO, bateria: 18, cargando: false }).success, true);
  assert.equal(ubicacionBody.safeParse({ latitud: LA, longitud: LO }).success, true);
  assert.equal(ubicacionBody.safeParse({ latitud: LA, longitud: LO, bateria: 101 }).success, false);
  assert.equal(ubicacionBody.safeParse({ latitud: LA, longitud: LO, bateria: -1 }).success, false);
  assert.equal(ubicacionBody.safeParse({ latitud: LA, longitud: LO, cargando: 'si' }).success, false);
});
