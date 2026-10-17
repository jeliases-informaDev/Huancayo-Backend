import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoDeMovimiento } from '../src/modules/usuarios/movimiento.js';

// Puntos cerca de Comas, Lima. 0,000009° de latitud ≈ 1 m.
const LA = -11.9613896; const LO = -77.0491826;
const AHORA = Date.parse('2026-10-17T16:00:00-05:00');
const pt = (segundosAtras, metrosNorte = 0, metrosEste = 0) => ({ latitud: LA + metrosNorte * 0.000009, longitud: LO + metrosEste * 0.000009, fecha: new Date(AHORA - segundosAtras * 1000) });

test('quieto más de 3 minutos = DETENIDO, con la hora desde la que está ahí (aunque el GPS baile unos metros)', () => {
  const r = estadoDeMovimiento([pt(840, 0), pt(600, 8), pt(420, -6), pt(240, 12, 5), pt(120, -4), pt(15, 3)], AHORA);
  assert.equal(r.estado, 'DETENIDO');
  assert.equal(Date.parse(r.desde), AHORA - 840 * 1000);
});

test('quieto menos de 3 minutos todavía no es DETENIDO', () => {
  const r = estadoDeMovimiento([pt(100, 0), pt(60, 3), pt(15, 1)], AHORA);
  assert.equal(r.estado, 'EN_MOVIMIENTO');
  assert.equal(r.modo, null);
});

test('caminando (~5 km/h) = A_PIE y en carro (~30 km/h) = VEHICULO', () => {
  // 5 km/h ≈ 1,39 m/s: 21 m cada 15 s
  const pie = [0, 1, 2, 3, 4, 5, 6].map((k) => pt(90 - k * 15, k * 21));
  const a = estadoDeMovimiento(pie, AHORA);
  assert.equal(a.estado, 'EN_MOVIMIENTO'); assert.equal(a.modo, 'A_PIE');
  assert.ok(a.velocidad_kmh > 4 && a.velocidad_kmh < 6, String(a.velocidad_kmh));
  // 30 km/h ≈ 8,33 m/s: 125 m cada 15 s
  const carro = [0, 1, 2, 3, 4, 5, 6].map((k) => pt(90 - k * 15, k * 125));
  const b = estadoDeMovimiento(carro, AHORA);
  assert.equal(b.modo, 'VEHICULO');
  assert.ok(b.velocidad_kmh > 27 && b.velocidad_kmh < 33, String(b.velocidad_kmh));
});

test('un salto imposible (cientos de km/h en segundos) no es un desplazamiento: se marca SALTO_GPS', () => {
  const r = estadoDeMovimiento([pt(30, 0), pt(15, 3000), pt(5, 6000)], AHORA);
  assert.equal(r.estado, 'EN_MOVIMIENTO'); assert.equal(r.modo, 'SALTO_GPS');
});

test('dos puntos casi simultáneos no permiten calcular velocidad: no se inventa un modo', () => {
  const r = estadoDeMovimiento([{ ...pt(1, 0) }, { ...pt(0.5, 50) }], AHORA);
  assert.equal(r.estado, 'EN_MOVIMIENTO'); assert.equal(r.modo, null); assert.equal(r.velocidad_kmh, null);
});

test('sin puntos suficientes o con el último muy viejo no se opina', () => {
  assert.equal(estadoDeMovimiento([], AHORA).estado, 'SIN_DATOS');
  assert.equal(estadoDeMovimiento([pt(10)], AHORA).estado, 'SIN_DATOS');
  assert.equal(estadoDeMovimiento([pt(1200, 0), pt(900, 300)], AHORA).estado, 'SIN_DATOS');
});

test('si se detuvo hace poco tras caminar, cuenta solo el tiempo que lleva quieto', () => {
  const r = estadoDeMovimiento([pt(600, 0), pt(540, 200), pt(480, 400), pt(300, 600), pt(200, 602), pt(100, 601), pt(5, 603)], AHORA);
  assert.equal(r.estado, 'DETENIDO');
  assert.equal(Date.parse(r.desde), AHORA - 300 * 1000);
});
