import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarPaginacion, infoPaginas, ordenarPorPrioridad, paginaDe, LIMITE_LEGADO, LIMITE_MAXIMO } from '../src/modules/auditorias/asignaciones.paginacion.js';
import { miasQuery, disponiblesQuery, mapaQuery } from '../src/validation/schemas.js';

test('sin page ni limit es un cliente anterior: recibe la lista completa hasta el tope grande, no 150', () => {
  const p = normalizarPaginacion({});
  assert.equal(p.legado, true); assert.equal(p.limit, LIMITE_LEGADO); assert.equal(p.page, 1);
});

test('con page o limit se pagina, con 100 por defecto y nunca más de 200 por página', () => {
  assert.deepEqual(normalizarPaginacion({ page: 2 }), { page: 2, limit: 100, legado: false });
  assert.equal(normalizarPaginacion({ limit: 50 }).limit, 50);
  assert.equal(normalizarPaginacion({ limit: 5000, page: 1 }).limit, LIMITE_MAXIMO);
  assert.equal(normalizarPaginacion({ page: 0, limit: 10 }).page, 1);
});

test('infoPaginas cuenta bien las páginas (al menos una, aunque no haya casos)', () => {
  assert.deepEqual(infoPaginas({ page: 1, limit: 100 }, 230), { page: 1, limit: 100, total: 230, pages: 3 });
  assert.equal(infoPaginas({ page: 1, limit: 100 }, 0).pages, 1);
  assert.equal(infoPaginas({ page: 1, limit: 100 }, 100).pages, 1);
  assert.equal(infoPaginas({ page: 1, limit: 100 }, 101).pages, 2);
});

test('el orden es alta, media, baja (no el alfabético) y dentro de cada prioridad conserva la antigüedad', () => {
  const filas = [
    { id: 1, prioridad: 'BAJA' }, { id: 2, prioridad: 'MEDIA' }, { id: 3, prioridad: 'ALTA' },
    { id: 4, prioridad: 'MEDIA' }, { id: 5, prioridad: 'ALTA' }, { id: 6, prioridad: 'BAJA' },
  ];
  assert.deepEqual(ordenarPorPrioridad(filas).map((f) => f.id), [3, 5, 2, 4, 1, 6]);
  assert.deepEqual(filas.map((f) => f.id), [1, 2, 3, 4, 5, 6], 'no debe modificar la lista original');
});

test('las páginas recorren todos los casos una sola vez, sin repetir ni perder ninguno', () => {
  const todos = Array.from({ length: 230 }, (_, i) => ({ id: i + 1, prioridad: ['ALTA', 'MEDIA', 'BAJA'][i % 3] }));
  const orden = ordenarPorPrioridad(todos);
  const vistos = [];
  for (let page = 1; page <= 3; page++) vistos.push(...paginaDe(orden, { page, limit: 100 }));
  assert.equal(vistos.length, 230);
  assert.equal(new Set(vistos.map((f) => f.id)).size, 230);
  assert.equal(paginaDe(orden, { page: 4, limit: 100 }).length, 0);
});

test('los parámetros de las listas se validan: límites, valores y nada de claves desconocidas', () => {
  assert.equal(miasQuery.safeParse({}).success, true);
  assert.equal(miasQuery.safeParse({ page: '2', limit: '50', q: 'perez', tipo: 'OTROS', prioridad: 'ALTA', ligero: 'true' }).success, true);
  assert.equal(miasQuery.safeParse({ limit: '500' }).success, false);
  assert.equal(miasQuery.safeParse({ tipo: 'OTRO' }).success, false);
  assert.equal(miasQuery.safeParse({ cualquiera: '1' }).success, false);
  assert.equal(disponiblesQuery.safeParse({ page: '3', limit: '100', q: 'ana', tipo: 'CONSUMO' }).success, true);
  assert.equal(disponiblesQuery.safeParse({ limit: '0' }).success, false);
  assert.equal(mapaQuery.safeParse({ departamento: 'Lima', limite: '5000' }).success, true);
  assert.equal(mapaQuery.safeParse({ limite: '999999' }).success, false);
});
