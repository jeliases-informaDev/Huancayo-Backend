import test from 'node:test';
import assert from 'node:assert/strict';
import { cubetasDe, agruparPorCubeta } from '../src/modules/reportes/actividad.js';

test('diario: 7 días terminando en la fecha elegida, del más antiguo al más reciente', () => {
  const c = cubetasDe('diario', '2026-10-05');
  assert.equal(c.length, 7);
  assert.deepEqual(c[0], { inicio: '2026-09-29', fin: '2026-09-29' });
  assert.deepEqual(c[6], { inicio: '2026-10-05', fin: '2026-10-05' });
});

test('semanal: 8 bloques de 7 días que se tocan sin huecos ni solapes', () => {
  const c = cubetasDe('semanal', '2026-10-05');
  assert.equal(c.length, 8);
  assert.deepEqual(c[7], { inicio: '2026-09-29', fin: '2026-10-05' });
  for (let i = 1; i < c.length; i += 1) {
    const finAnterior = new Date(`${c[i - 1].fin}T00:00:00Z`).getTime();
    assert.equal(new Date(`${c[i].inicio}T00:00:00Z`).getTime() - finAnterior, 24 * 60 * 60 * 1000, `bloque ${i}`);
  }
});

test('mensual: 6 meses de calendario; el último llega solo hasta el día elegido (también cruzando el año)', () => {
  const c = cubetasDe('mensual', '2026-02-10');
  assert.equal(c.length, 6);
  assert.deepEqual(c[0], { inicio: '2025-09-01', fin: '2025-09-30' });
  assert.deepEqual(c[3], { inicio: '2025-12-01', fin: '2025-12-31' });
  assert.deepEqual(c[5], { inicio: '2026-02-01', fin: '2026-02-10' });
});

test('agruparPorCubeta suma los días de cada cubeta y deja 0 donde no hubo nada', () => {
  const porDia = new Map([['2026-10-03', 4], ['2026-10-05', 6], ['2026-09-30', 2], ['2026-09-10', 99]]);
  const diario = agruparPorCubeta(cubetasDe('diario', '2026-10-05'), porDia);
  assert.deepEqual(diario.map((p) => p.total), [0, 2, 0, 0, 4, 0, 6]);
  const semanal = agruparPorCubeta(cubetasDe('semanal', '2026-10-05'), porDia);
  assert.equal(semanal[7].total, 12);
  assert.equal(semanal.reduce((s, p) => s + p.total, 0), 12 + 99); // el 10 de septiembre cae en un bloque anterior
});
