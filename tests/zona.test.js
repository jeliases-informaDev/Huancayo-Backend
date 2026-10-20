import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretarZona, zonaIncluye, filtroDeZona } from '../src/modules/auditorias/zona.js';

const lince = { distrito: 'LINCE', provincia: 'LIMA', departamento: 'LIMA' };
const comas = { distrito: 'COMAS', provincia: 'LIMA', departamento: 'LIMA' };
const huancayo = { distrito: 'HUANCAYO', provincia: 'HUANCAYO', departamento: 'JUNIN' };
const elTambo = { distrito: 'EL TAMBO', provincia: 'HUANCAYO', departamento: 'JUNIN' };
const sinUbicacion = { distrito: null, provincia: '', departamento: null };

test('«Lince, Lima» es el distrito Lince de Lima: coincide con Lince y no con Comas', () => {
  assert.equal(zonaIncluye('Lince, Lima', lince), true);
  assert.equal(zonaIncluye('Lince, Lima', comas), false);
  assert.equal(zonaIncluye('Lince, Lima', huancayo), false);
});

test('mayúsculas, tildes y espacios no cuentan', () => {
  assert.equal(zonaIncluye('  LINCE ,lima  ', lince), true);
  assert.equal(zonaIncluye('junín', huancayo), true);
  assert.equal(zonaIncluye('JUNÍN', { departamento: 'Junin' }), true);
});

test('un solo nombre sirve para distrito, provincia o departamento', () => {
  assert.equal(zonaIncluye('Lima', comas), true);
  assert.equal(zonaIncluye('Lima', lince), true);
  assert.equal(zonaIncluye('Huancayo', elTambo), true);
  assert.equal(zonaIncluye('El Tambo', huancayo), false);
});

test('el orden y el separador no importan: «Lima, Lince», «Lince / Lima» y «Lince - Lima»', () => {
  for (const zona of ['Lima, Lince', 'Lince / Lima', 'Lince - Lima', 'Lince – Lima']) assert.equal(zonaIncluye(zona, lince), true, zona);
});

test('el punto y coma separa varias zonas', () => {
  assert.deepEqual(interpretarZona('Lince, Lima; Huancayo'), [['lince', 'lima'], ['huancayo']]);
  assert.equal(zonaIncluye('Lince, Lima; Huancayo', huancayo), true);
  assert.equal(zonaIncluye('Lince, Lima; Huancayo', lince), true);
  assert.equal(zonaIncluye('Lince, Lima; Huancayo', comas), false);
});

test('«Junín, Lima» (el ejemplo viejo del formulario) vale para los dos departamentos', () => {
  assert.deepEqual(interpretarZona('Junín, Lima'), [['junin'], ['lima']]);
  assert.equal(zonaIncluye('Junín, Lima', huancayo), true);
  assert.equal(zonaIncluye('Junín, Lima', comas), true);
  assert.equal(zonaIncluye('Junín, Lima', { departamento: 'CUSCO', distrito: 'CUSCO', provincia: 'CUSCO' }), false);
});

test('sin zona escrita no hay restricción; un expediente sin ubicación no se puede juzgar y pasa', () => {
  for (const vacia of [null, undefined, '', '   ', ' , ; ']) assert.equal(zonaIncluye(vacia, comas), true);
  assert.equal(zonaIncluye('Lince, Lima', sinUbicacion), true);
});

test('no repite nombres ni deja vacíos', () => {
  assert.deepEqual(interpretarZona('Lima, , lima'), [['lima']]);
});

test('filtroDeZona arma el mismo criterio para la base: cada nombre en distrito, provincia o departamento', () => {
  assert.equal(filtroDeZona(''), null);
  assert.equal(filtroDeZona(undefined), null);
  const donde = (n) => ({ OR: [{ distrito: n }, { provincia: n }, { departamento: n }] });
  assert.deepEqual(filtroDeZona('Lince, Lima'), { OR: [{ AND: [donde('lince'), donde('lima')] }] });
  assert.deepEqual(filtroDeZona('Lince, Lima; Huancayo'), { OR: [{ AND: [donde('lince'), donde('lima')] }, { AND: [donde('huancayo')] }] });
});
