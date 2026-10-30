import test from 'node:test';
import assert from 'node:assert/strict';
import { esSalto, decidirPunto, limpiarRecorrido, numerarTramos, simplificarRecorrido } from '../src/modules/usuarios/recorrido.js';

// Puntos cerca de Comas, Lima. 0,000009° de latitud ≈ 1 m.
const LA = -11.9613896; const LO = -77.0491826;
const T0 = Date.parse('2026-10-29T14:15:00-05:00');
const pt = (segundos, metrosNorte = 0, extra = {}) => ({ latitud: LA + metrosNorte * 0.000009, longitud: LO, precision: 12, simulada: false, fecha: new Date(T0 + segundos * 1000), ...extra });
const metros = (p) => Math.round((p.latitud - LA) / 0.000009);

test('limpiarRecorrido descarta los puntos imprecisos (peores que la regla) y los simulados, conserva los demás y los ordena por hora', () => {
  const { puntos, descartados } = limpiarRecorrido([pt(30, 20), pt(0, 0), pt(15, 10, { precision: 650 }), pt(45, 30, { simulada: true }), pt(60, 40, { precision: null })], { precisionMaxima: 100 });
  assert.deepEqual(puntos.map(metros), [0, 20, 40]);
  assert.deepEqual(descartados, { simulados: 1, imprecisos: 1, saltos: 0 });
});

test('un salto (más de 180 km/h) se aparta y el recorrido sigue con el siguiente punto bueno', () => {
  const { puntos, descartados } = limpiarRecorrido([pt(0), pt(15), pt(30, 2000), pt(45, 5)]);
  assert.deepEqual(puntos.map(metros), [0, 0, 5]);
  assert.equal(descartados.saltos, 1);
});

test('si el punto siguiente confirma el salto (también imposible desde el anterior pero coherente con el apartado), entran los dos', () => {
  const { puntos, descartados } = limpiarRecorrido([pt(0), pt(15, 2000), pt(30, 2050)]);
  assert.deepEqual(puntos.map(metros), [0, 2000, 2050]);
  assert.equal(descartados.saltos, 0);
});

test('un primer punto malo no deja fuera a los buenos que vienen después', () => {
  const { puntos } = limpiarRecorrido([pt(0, 5000), pt(15, 0), pt(30, 5), pt(45, 8)]);
  assert.deepEqual(puntos.map(metros), [5000, 0, 5, 8]);
});

test('esSalto: caminar o ir en carro no es salto; dos puntos casi simultáneos muy lejos sí; el baile del GPS nunca', () => {
  assert.equal(esSalto(pt(0), pt(15, 30)), false); // 7 km/h
  assert.equal(esSalto(pt(0), pt(15, 300)), false); // 72 km/h
  assert.equal(esSalto(pt(0), pt(15, 1000)), true); // 240 km/h
  assert.equal(esSalto(pt(0), pt(1, 500)), true); // 500 m en 1 s
  assert.equal(esSalto(pt(0), pt(1, 40)), false); // ruido
  assert.equal(esSalto(pt(15, 1000), pt(0)), true); // el orden no importa
});

test('decidirPunto: sin punto anterior entra el primero', () => {
  assert.deepEqual(decidirPunto(null, null, pt(0)), { entran: [pt(0)], pendiente: null });
});

test('la hora del celular manda sobre la de llegada: un punto que llegó tarde se ordena donde se tomó', () => {
  const { puntos } = limpiarRecorrido([
    { latitud: LA, longitud: LO, precision: 10, simulada: false, capturado_en: new Date(T0), registrado_en: new Date(T0 + 90_000) },
    { latitud: LA + 0.00009, longitud: LO, precision: 10, simulada: false, capturado_en: null, registrado_en: new Date(T0 + 30_000) },
  ]);
  assert.equal(puntos[0].fecha.getTime(), T0);
  assert.equal(puntos[1].fecha.getTime(), T0 + 30_000);
});

test('numerarTramos corta el recorrido donde hubo más de 5 min sin puntos', () => {
  const t = numerarTramos([pt(0), pt(15), pt(15 + 400), pt(15 + 415)]);
  assert.deepEqual(t.map((p) => p.tramo), [1, 1, 2, 2]);
});

test('simplificarRecorrido deja el primero, los que se alejaron 20 m del último conservado y el último', () => {
  const s = simplificarRecorrido([pt(0, 0), pt(15, 3), pt(30, 5), pt(45, 25), pt(60, 27), pt(75, 60), pt(90, 61)]);
  assert.deepEqual(s.map(metros), [0, 25, 60, 61]);
  assert.equal(simplificarRecorrido([pt(0), pt(15)]).length, 2);
  assert.equal(simplificarRecorrido(Array.from({ length: 4000 }, (_, i) => pt(i * 15, i * 30)), { maximo: 100 }).length <= 101, true);
});
