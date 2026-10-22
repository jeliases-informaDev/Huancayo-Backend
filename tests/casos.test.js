import test from 'node:test';
import assert from 'node:assert/strict';
import { LOTE_QUITAR, MOTIVOS_QUITAR, cupoRestante, interpretarTope, mensajeTope, topeAlcanzado, trozos } from '../src/modules/auditorias/casos.core.js';
import { disponiblesQuery, quitarCasosBody, topeCasosBody } from '../src/validation/schemas.js';

const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('el tope guardado se lee como número entero; lo raro vuelve al predeterminado y 0 es «sin tope»', () => {
  assert.equal(interpretarTope('30', 5), 30);
  assert.equal(interpretarTope('0', 5), 0);
  assert.equal(interpretarTope(undefined, 5), 5);
  assert.equal(interpretarTope(null, 5), 5);
  assert.equal(interpretarTope('', 5), 5);
  assert.equal(interpretarTope('abc', 5), 5);
  assert.equal(interpretarTope('-3', 5), 5);
  assert.equal(interpretarTope('2.5', 5), 5);
});

test('el tope se alcanza al llegar al máximo, no antes; con 0 nunca', () => {
  assert.equal(topeAlcanzado({ abiertos: 29, tope: 30 }), false);
  assert.equal(topeAlcanzado({ abiertos: 30, tope: 30 }), true);
  assert.equal(topeAlcanzado({ abiertos: 45, tope: 30 }), true); // un supervisor pudo asignarle más: igual no puede tomar otro
  assert.equal(topeAlcanzado({ abiertos: 500, tope: 0 }), false);
});

test('el cupo restante avisa cuántos puede tomar; sin tope no hay límite', () => {
  assert.equal(cupoRestante({ abiertos: 12, tope: 30 }), 18);
  assert.equal(cupoRestante({ abiertos: 45, tope: 30 }), 0);
  assert.equal(cupoRestante({ abiertos: 12, tope: 0 }), null);
});

test('el mensaje del tope dice cuántos tiene y cuál es el máximo', () => {
  assert.match(mensajeTope({ abiertos: 30, tope: 30 }), /30 casos abiertos.*máximo es 30/);
});

test('trozos parte la lista en lotes y deja el último más corto', () => {
  assert.deepEqual(trozos([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(trozos([], 2), []);
  assert.equal(trozos(Array.from({ length: 1201 }, (_, i) => i), LOTE_QUITAR).length, 3);
});

test('Disponibles todavía acepta la ubicación que mandan las apps anteriores', () => {
  assert.equal(disponiblesQuery.safeParse({ lat: '-12.06', lon: '-75.2', page: '2' }).success, true);
  assert.equal(disponiblesQuery.safeParse({}).success, true);
  assert.equal(disponiblesQuery.safeParse({ distrito: 'x' }).success, false);
});

test('esquema del tope: entero entre 0 y 1000', () => {
  assert.equal(topeCasosBody.safeParse({ maximo: 30 }).success, true);
  assert.equal(topeCasosBody.safeParse({ maximo: 0 }).success, true);
  assert.equal(topeCasosBody.safeParse({ maximo: -1 }).success, false);
  assert.equal(topeCasosBody.safeParse({ maximo: 1001 }).success, false);
  assert.equal(topeCasosBody.safeParse({ maximo: 2.5 }).success, false);
  assert.equal(topeCasosBody.safeParse({ maximo: '30' }).success, false);
  assert.equal(topeCasosBody.safeParse({ maximo: 30, otro: 1 }).success, false);
});

test('esquema de quitar casos: motivo y destino válidos, y el asesor que recibe solo cuando corresponde', () => {
  const base = { id_usuario_auditor: uuid(1), motivo: 'ENFERMEDAD', destino: 'DISPONIBLES' };
  assert.equal(quitarCasosBody.safeParse(base).success, true);
  assert.equal(quitarCasosBody.safeParse({ ...base, nota: 'Reposo médico 10 días', id_asignaciones: [1, 2, 3] }).success, true);
  for (const motivo of MOTIVOS_QUITAR) assert.equal(quitarCasosBody.safeParse({ ...base, motivo }).success, true);
  assert.equal(quitarCasosBody.safeParse({ ...base, motivo: 'DESACTIVADO' }).success, false); // ese motivo lo pone solo el sistema
  assert.equal(quitarCasosBody.safeParse({ ...base, motivo: 'VACACIONES' }).success, false);
  // pasar a otro asesor exige decir a cuál, y ese no puede ser el mismo
  assert.equal(quitarCasosBody.safeParse({ ...base, destino: 'ASESOR' }).success, false);
  assert.equal(quitarCasosBody.safeParse({ ...base, destino: 'ASESOR', id_usuario_destino: uuid(2) }).success, true);
  assert.equal(quitarCasosBody.safeParse({ ...base, destino: 'ASESOR', id_usuario_destino: uuid(1) }).success, false);
  // a «Disponibles» no se elige asesor
  assert.equal(quitarCasosBody.safeParse({ ...base, id_usuario_destino: uuid(2) }).success, false);
  // listas y textos con tope
  assert.equal(quitarCasosBody.safeParse({ ...base, id_asignaciones: [] }).success, false);
  assert.equal(quitarCasosBody.safeParse({ ...base, id_asignaciones: Array.from({ length: 501 }, (_, i) => i + 1) }).success, false);
  assert.equal(quitarCasosBody.safeParse({ ...base, nota: 'x'.repeat(201) }).success, false);
  assert.equal(quitarCasosBody.safeParse({ ...base, id_usuario_auditor: 'no-es-uuid' }).success, false);
  assert.equal(quitarCasosBody.safeParse({ ...base, extra: true }).success, false);
});
