import test from 'node:test';
import assert from 'node:assert/strict';
import { rutaPorCalles, ajustarACalles, ErrorOsrm, MAX_PUNTOS_AJUSTE } from '../src/modules/rutas/osrm.js';

// Un «motor» de mentira: anota las direcciones pedidas y responde lo que se le indique.
function motor(respuestas) {
  const pedidas = [];
  const fetchFn = async (url) => {
    pedidas.push(url);
    const r = typeof respuestas === 'function' ? respuestas(url, pedidas.length) : respuestas;
    return { ok: true, status: 200, json: async () => r };
  };
  return { fetchFn, pedidas };
}

test('rutaPorCalles pide longitud,latitud y devuelve la línea como [latitud, longitud] con metros y segundos redondeados', async () => {
  const m = motor({ code: 'Ok', routes: [{ distance: 3343.2, duration: 385.9, geometry: { type: 'LineString', coordinates: [[-77.042873, -12.046405], [-77.03, -12.06]] }, legs: [{ distance: 3343.2, duration: 385.9 }] }] });
  const r = await rutaPorCalles('http://osrm:5000/', [{ latitud: -12.0464, longitud: -77.0428 }, { latitud: -12.06, longitud: -77.03 }], { fetchFn: m.fetchFn });
  assert.equal(m.pedidas[0].startsWith('http://osrm:5000/route/v1/driving/-77.042800,-12.046400;-77.030000,-12.060000?'), true);
  assert.deepEqual(r.coordenadas, [[-12.046405, -77.042873], [-12.06, -77.03]]);
  assert.equal(r.distancia_m, 3343);
  assert.equal(r.duracion_s, 386);
  assert.deepEqual(r.tramos, [{ distancia_m: 3343, duracion_s: 386 }]);
});

test('rutaPorCalles: una respuesta que no es Ok se propaga como ErrorOsrm con su código', async () => {
  const m = motor({ code: 'NoRoute', message: 'Impossible route between points' });
  await assert.rejects(() => rutaPorCalles('http://osrm:5000', [{ latitud: -12, longitud: -77 }, { latitud: -12.1, longitud: -77.1 }], { fetchFn: m.fetchFn }), (e) => e instanceof ErrorOsrm && e.codigo === 'NoRoute');
});

test('ajustarACalles manda horas crecientes (en segundos) y radios entre 10 y 50 m, y devuelve una línea por cada parte casada', async () => {
  const m = motor({ code: 'Ok', matchings: [{ confidence: 0.8753793157, distance: 407.3, geometry: { type: 'LineString', coordinates: [[-77.0428, -12.0464], [-77.042, -12.047]] } }], tracepoints: [] });
  const t = Date.parse('2026-10-29T14:15:00-05:00');
  const puntos = [
    { latitud: -12.0464, longitud: -77.0428, precision: 5, fecha: new Date(t) },
    { latitud: -12.047, longitud: -77.042, precision: 650, fecha: new Date(t + 400) }, // mismo segundo: se separa un segundo
    { latitud: -12.0478, longitud: -77.041, precision: null, fecha: new Date(t + 15000) },
  ];
  const lineas = await ajustarACalles('http://osrm:5000', puntos, { fetchFn: m.fetchFn });
  const url = new URL(m.pedidas[0]);
  const s = Math.floor(t / 1000);
  assert.equal(url.searchParams.get('timestamps'), `${s};${s + 1};${s + 15}`);
  assert.equal(url.searchParams.get('radiuses'), '10;50;15');
  assert.equal(url.searchParams.get('gaps'), 'split');
  assert.deepEqual(lineas, [{ coordenadas: [[-12.0464, -77.0428], [-12.047, -77.042]], confianza: 0.88, distancia_m: 407 }]);
});

test('ajustarACalles: una parte sin calles cerca (NoMatch) se salta sin romper las demás; otro error sí se propaga', async () => {
  const sinCalles = motor({ code: 'NoMatch', message: 'Could not match the trace.' });
  const t = Date.now();
  const puntos = [{ latitud: -12, longitud: -77, precision: 10, fecha: new Date(t) }, { latitud: -12.001, longitud: -77, precision: 10, fecha: new Date(t + 15000) }];
  assert.deepEqual(await ajustarACalles('http://osrm:5000', puntos, { fetchFn: sinCalles.fetchFn }), []);
  const caido = motor({ code: 'TooBig', message: 'Too many trace coordinates' });
  await assert.rejects(() => ajustarACalles('http://osrm:5000', puntos, { fetchFn: caido.fetchFn }), (e) => e.codigo === 'TooBig');
});

test('ajustarACalles consulta por partes cuando hay más puntos que el máximo, repitiendo el último de cada parte', async () => {
  const m = motor({ code: 'Ok', matchings: [] });
  const t = Date.now();
  const puntos = Array.from({ length: MAX_PUNTOS_AJUSTE + 10 }, (_, i) => ({ latitud: -12 - i * 0.0001, longitud: -77, precision: 10, fecha: new Date(t + i * 15000) }));
  await ajustarACalles('http://osrm:5000', puntos, { fetchFn: m.fetchFn });
  assert.equal(m.pedidas.length, 2);
  const primera = m.pedidas[0].split('/driving/')[1].split('?')[0].split(';');
  const segunda = m.pedidas[1].split('/driving/')[1].split('?')[0].split(';');
  assert.equal(primera.length, MAX_PUNTOS_AJUSTE);
  assert.equal(segunda.length, 11);
  assert.equal(primera[primera.length - 1], segunda[0]);
});
