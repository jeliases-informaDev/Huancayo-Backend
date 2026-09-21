import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { haversineMeters } from '#core/security/geofence.js';

describe('geofence.js — haversineMeters', () => {
  test('la distancia de un punto a si mismo es cero', () => {
    assert.equal(haversineMeters(-12.0653, -75.2049, -12.0653, -75.2049), 0);
  });

  test('es simetrica: A→B es igual que B→A', () => {
    const ab = haversineMeters(-12.0653, -75.2049, -12.0687, -75.2094);
    const ba = haversineMeters(-12.0687, -75.2094, -12.0653, -75.2049);
    assert.equal(ab, ba);
  });

  test('Huancayo → Lima da un valor cercano a la distancia real en linea recta (~198 km)', () => {
    // Plaza Huamanmarca (Huancayo) vs Plaza de Armas (Lima). Nota: la ruta por
    // carretera es de ~300 km por la sierra, pero en linea recta son ~198 km.
    const d = haversineMeters(-12.0687, -75.2094, -12.0463, -77.0311);
    assert.ok(d > 190000 && d < 205000, `esperaba ~198 km, obtuve ${Math.round(d / 1000)} km`);
  });

  test('un grado de latitud equivale a ~111 km, sin importar la longitud', () => {
    const d = haversineMeters(0, 0, 1, 0);
    assert.ok(d > 110000 && d < 112000, `esperaba ~111 km, obtuve ${Math.round(d / 1000)} km`);
  });

  test('una diferencia pequeña (10 m aprox.) da un valor pequeño, no explota ni da NaN', () => {
    const d = haversineMeters(-12.0653, -75.2049, -12.06531, -75.20491);
    assert.ok(Number.isFinite(d));
    assert.ok(d > 0 && d < 20, `esperaba unos pocos metros, obtuve ${d}`);
  });

  test('funciona cruzando el ecuador y el meridiano de Greenwich', () => {
    const d = haversineMeters(1, 1, -1, -1);
    assert.ok(Number.isFinite(d) && d > 0);
  });
});
