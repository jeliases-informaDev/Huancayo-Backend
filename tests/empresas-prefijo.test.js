import test from 'node:test';
import assert from 'node:assert/strict';
import { prefijoDe, limpiarPrefijo, usuarioConPrefijo } from '../src/modules/empresas/empresas.service.js';

test('la abreviatura se sugiere desde la palabra distintiva del nombre de la empresa', () => {
  assert.equal(prefijoDe('Caja Arequipa'), 'are');
  assert.equal(prefijoDe('Caja Municipal de Ahorro y Crédito de Huancayo'), 'hua');
  assert.equal(prefijoDe('BanBif'), 'ban');
  assert.equal(prefijoDe('Caja'), 'caj');
});

test('la abreviatura se normaliza y se valida (2 a 8 letras o números)', () => {
  assert.equal(limpiarPrefijo(' ARQ '), 'arq');
  assert.equal(limpiarPrefijo(''), null, 'vacío explícito = sin abreviatura');
  assert.equal(limpiarPrefijo(undefined), undefined, 'no enviado = no cambia');
  assert.throws(() => limpiarPrefijo('a'), /2 a 8/);
  assert.throws(() => limpiarPrefijo('arq.x'), /2 a 8/);
  assert.throws(() => limpiarPrefijo('demasiadolargo'), /2 a 8/);
});

test('el nombre de usuario lleva el prefijo fijo de su empresa una sola vez y en minúsculas', () => {
  assert.equal(usuarioConPrefijo('arq', 'Jorge'), 'arq.jorge');
  assert.equal(usuarioConPrefijo('arq', 'arq.jorge'), 'arq.jorge');
  assert.equal(usuarioConPrefijo('arq', 'ARQ.Jorge'), 'arq.jorge');
  assert.equal(usuarioConPrefijo(null, 'Jorge'), 'jorge', 'empresa sin abreviatura o administrador universal');
});
