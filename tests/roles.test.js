import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES, normalizeRole, ALL_ROLES, ADMIN_ROLES, FIELD_ROLES, OPERATIONAL_MANAGERS,
} from '#core/security/roles.js';

describe('roles.js', () => {
  test('ROLES contiene exactamente los 3 roles del sistema', () => {
    assert.deepEqual(Object.keys(ROLES).sort(), ['ADMINISTRADOR', 'AUDITOR', 'SUPERVISOR']);
  });

  test('normalizeRole traduce el alias legado ADMIN a ADMINISTRADOR', () => {
    assert.equal(normalizeRole('ADMIN'), 'ADMINISTRADOR');
  });

  test('normalizeRole deja pasar roles que ya son canonicos', () => {
    assert.equal(normalizeRole('SUPERVISOR'), 'SUPERVISOR');
    assert.equal(normalizeRole('AUDITOR'), 'AUDITOR');
    assert.equal(normalizeRole('ADMINISTRADOR'), 'ADMINISTRADOR');
  });

  test('normalizeRole no inventa un rol para valores desconocidos (los deja pasar tal cual)', () => {
    assert.equal(normalizeRole('LO_QUE_SEA'), 'LO_QUE_SEA');
  });

  test('FIELD_ROLES contiene unicamente AUDITOR — el Auditor de Oficina (SUPERVISOR) nunca sale a campo', () => {
    assert.deepEqual([...FIELD_ROLES], ['AUDITOR']);
    assert.ok(!FIELD_ROLES.includes('SUPERVISOR'));
    assert.ok(!FIELD_ROLES.includes('ADMINISTRADOR'));
  });

  test('OPERATIONAL_MANAGERS contiene Administrador y Supervisor, pero no Auditor', () => {
    assert.deepEqual([...OPERATIONAL_MANAGERS].sort(), ['ADMINISTRADOR', 'SUPERVISOR']);
    assert.ok(!OPERATIONAL_MANAGERS.includes('AUDITOR'));
  });

  test('ADMIN_ROLES contiene unicamente ADMINISTRADOR', () => {
    assert.deepEqual([...ADMIN_ROLES], ['ADMINISTRADOR']);
  });

  test('ALL_ROLES cubre los mismos 3 roles que ROLES, sin duplicados', () => {
    assert.deepEqual([...ALL_ROLES].sort(), Object.values(ROLES).sort());
  });

  test('los objetos exportados son inmutables (Object.freeze)', () => {
    assert.throws(() => { ROLES.NUEVO = 'X'; }, TypeError);
    assert.throws(() => { FIELD_ROLES.push('SUPERVISOR'); }, TypeError);
  });
});
