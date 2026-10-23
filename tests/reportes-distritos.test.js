import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_DISTRITOS, formaDistritos } from '../src/modules/reportes/distritos.js';

test('los conteos que llegan como BigInt o texto se vuelven números normales', () => {
  const r = formaDistritos([{ distrito: 'LINCE', visitas: 7n, asignados: '12' }]);
  assert.deepEqual(r.distritos_actividad, [{ distrito: 'LINCE', visitas: 7, asignados: 12 }]);
  assert.equal(typeof r.distritos_actividad[0].visitas, 'number');
});

test('con casos asignados y sin visitas la tarjeta no queda en blanco', () => {
  const r = formaDistritos([{ distrito: 'LINCE', visitas: 0n, asignados: 25n }, { distrito: 'COMAS', visitas: 0n, asignados: 4n }]);
  assert.equal(r.distritos_actividad.length, 2);
  assert.deepEqual(r.distritos_actividad.map((d) => d.distrito), ['LINCE', 'COMAS']);
  assert.deepEqual(r.distritos_visitados, []); // el campo de la primera versión es solo de visitas: sin visitas queda vacío
});

test('el campo viejo (solo visitas) deja fuera los distritos sin visitas y se queda con 4', () => {
  const filas = ['A', 'B', 'C', 'D', 'E'].map((distrito, i) => ({ distrito, visitas: 9 - i, asignados: i }));
  filas.push({ distrito: 'F', visitas: 0, asignados: 50 });
  const r = formaDistritos(filas);
  assert.equal(r.distritos_visitados.length, 4);
  assert.deepEqual(r.distritos_visitados[0], { distrito: 'A', visitas: 9 }); // sin el campo «asignados»
  assert.ok(r.distritos_visitados.every((d) => d.visitas > 0 && !('asignados' in d)));
});

test('nunca devuelve más distritos que el máximo ni filas vacías o sin nada', () => {
  const muchas = Array.from({ length: 20 }, (_, i) => ({ distrito: `D${i}`, visitas: 20 - i, asignados: 1 }));
  assert.equal(formaDistritos(muchas).distritos_actividad.length, MAX_DISTRITOS);
  const raras = formaDistritos([{ distrito: '  ', visitas: 3, asignados: 3 }, { distrito: null, visitas: 1, asignados: 1 }, { distrito: 'SIN NADA', visitas: 0, asignados: 0 }, { distrito: ' Lince ', visitas: 1, asignados: 0 }]);
  assert.deepEqual(raras.distritos_actividad, [{ distrito: 'Lince', visitas: 1, asignados: 0 }]);
});

test('sin filas devuelve listas vacías (no falla)', () => {
  assert.deepEqual(formaDistritos([]), { distritos_actividad: [], distritos_visitados: [] });
  assert.deepEqual(formaDistritos(), { distritos_actividad: [], distritos_visitados: [] });
});
