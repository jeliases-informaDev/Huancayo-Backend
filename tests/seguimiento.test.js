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
