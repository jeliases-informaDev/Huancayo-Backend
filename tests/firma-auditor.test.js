import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { firmaAuditorExigida, validarFirmaAuditor } from '../src/modules/auditorias/firma-auditor.js';

const FIRMA = 'data:image/png;base64,AAAA';

describe('firma del auditor de campo', () => {
  test('una app anterior (sin ficha_version) sigue pudiendo enviar visitas sin esa firma', () => {
    assert.equal(firmaAuditorExigida({ resultado: 'CONFORME' }), false);
    assert.doesNotThrow(() => validarFirmaAuditor({ resultado: 'CONFORME' }));
  });

  test('una app que declara la ficha 2 debe enviar la firma del auditor', () => {
    assert.throws(
      () => validarFirmaAuditor({ resultado: 'CONFORME', ficha_version: 2 }),
      (error) => error.statusCode === 422 && error.code === 'FIRMA_AUDITOR_REQUIRED' && /auditor de campo/.test(error.message),
    );
    assert.doesNotThrow(() => validarFirmaAuditor({ resultado: 'CONFORME', ficha_version: 2, firma_auditor: FIRMA }));
  });

  test('también se pide cuando el cliente no estaba (no ubicado) o rechazó: el auditor da fe de su trabajo', () => {
    for (const resultado of ['NO_UBICADO', 'RECHAZADO', 'OBSERVADO']) {
      assert.throws(() => validarFirmaAuditor({ resultado, ficha_version: 2 }), (error) => error.code === 'FIRMA_AUDITOR_REQUIRED');
      assert.doesNotThrow(() => validarFirmaAuditor({ resultado, ficha_version: 2, firma_auditor: FIRMA }));
    }
  });

  test('con la regla obligatoria encendida se exige a todas las apps, también a las anteriores', () => {
    assert.equal(firmaAuditorExigida({ resultado: 'CONFORME' }, true), true);
    assert.throws(() => validarFirmaAuditor({ resultado: 'CONFORME' }, true), (error) => error.code === 'FIRMA_AUDITOR_REQUIRED');
    assert.doesNotThrow(() => validarFirmaAuditor({ resultado: 'CONFORME', firma_auditor: FIRMA }, true));
  });

  test('una ficha_version 1 no cambia nada', () => {
    assert.doesNotThrow(() => validarFirmaAuditor({ resultado: 'CONFORME', ficha_version: 1 }));
  });
});
