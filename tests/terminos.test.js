import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { VERSION_TERMINOS, exentoDeTerminos, plataformaDe, terminosVigentes } from '../src/modules/terminos/terminos.reglas.js';

describe('términos y condiciones — reglas', () => {
  test('el texto vigente lleva versión, título y las cinco secciones con el nombre de la empresa', () => {
    const t = terminosVigentes('Caja Huancayo');
    assert.equal(t.version, VERSION_TERMINOS);
    assert.equal(t.secciones.length, 5);
    assert.match(t.secciones[0].texto, /Caja Huancayo/);
    assert.match(t.secciones[2].texto, /Ley N\.º 29733/);
    assert.ok(t.secciones.every((s) => s.titulo && s.texto.length > 40));
  });

  test('sin nombre de empresa usa un genérico', () => {
    assert.match(terminosVigentes(null).secciones[0].texto, /de la empresa para/);
  });

  test('solo el administrador universal está exento (el alias ADMIN no lo está)', () => {
    assert.equal(exentoDeTerminos('UNIVERSAL'), true);
    assert.equal(exentoDeTerminos('AUDITOR'), false);
    assert.equal(exentoDeTerminos('ADMIN'), false);
    assert.equal(exentoDeTerminos(undefined), false);
  });

  test('la plataforma sale de la cabecera: mobile → MOVIL, lo demás → WEB', () => {
    assert.equal(plataformaDe('mobile'), 'MOVIL');
    assert.equal(plataformaDe(' Mobile '), 'MOVIL');
    assert.equal(plataformaDe('web'), 'WEB');
    assert.equal(plataformaDe(undefined), 'WEB');
  });
});
