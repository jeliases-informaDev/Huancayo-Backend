import test from 'node:test';
import assert from 'node:assert/strict';
import { ubicacionBody, jornadaBody } from '../src/validation/schemas.js';

test('ubicacionBody acepta el aviso de GPS simulado y sigue aceptando apps anteriores que no lo envían', () => {
  assert.equal(ubicacionBody.safeParse({ latitud: -12.06, longitud: -75.2, precision: 10, simulada: true }).success, true);
  assert.equal(ubicacionBody.safeParse({ latitud: -12.06, longitud: -75.2 }).success, true);
  assert.equal(ubicacionBody.safeParse({ latitud: -12.06, longitud: -75.2, simulada: 'si' }).success, false);
  assert.equal(ubicacionBody.safeParse({ latitud: 123, longitud: -75.2 }).success, false);
});

test('jornadaBody solo admite INICIAR o TERMINAR', () => {
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR' }).success, true);
  assert.equal(jornadaBody.safeParse({ accion: 'TERMINAR' }).success, true);
  assert.equal(jornadaBody.safeParse({ accion: 'PAUSAR' }).success, false);
  assert.equal(jornadaBody.safeParse({}).success, false);
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', extra: 1 }).success, false);
});

test('ubicacionBody acepta la hora en que el celular tomó la posición (ISO con zona) y rechaza otros formatos', () => {
  assert.equal(ubicacionBody.safeParse({ latitud: -12.06, longitud: -75.2, precision: 10, fecha: '2026-10-29T14:15:07.000-05:00' }).success, true);
  assert.equal(ubicacionBody.safeParse({ latitud: -12.06, longitud: -75.2, fecha: '2026-10-29T19:15:07Z' }).success, true);
  assert.equal(ubicacionBody.safeParse({ latitud: -12.06, longitud: -75.2, fecha: '29/10/2026 14:15' }).success, false);
});

test('rutaTrazarBody: de 2 a 60 paradas con solo coordenadas', async () => {
  const { rutaTrazarBody } = await import('../src/validation/schemas.js');
  assert.equal(rutaTrazarBody.safeParse({ paradas: [{ latitud: -12.06, longitud: -75.2 }, { latitud: -12.07, longitud: -75.21 }] }).success, true);
  assert.equal(rutaTrazarBody.safeParse({ paradas: [{ latitud: -12.06, longitud: -75.2 }] }).success, false);
  assert.equal(rutaTrazarBody.safeParse({ paradas: [{ latitud: -12.06, longitud: -75.2, nombre: 'x' }, { latitud: -12.07, longitud: -75.21 }] }).success, false);
  assert.equal(rutaTrazarBody.safeParse({ paradas: Array.from({ length: 61 }, () => ({ latitud: -12, longitud: -75 })) }).success, false);
});
