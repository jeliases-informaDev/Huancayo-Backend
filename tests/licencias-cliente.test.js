import test from 'node:test';
import assert from 'node:assert/strict';
import { ErrorLicencias, TIEMPO_MS, consultarCupo, obtenerLicencia, reportarActivos } from '../src/modules/licencias/licencias.cliente.js';

const E = '216bd472-029a-44ab-83fa-93889a0187fd';
const cfg = { url: 'http://licencias:3200/', token: 'geomatrix.prueba' };
// Un servicio de licencias de mentira: anota lo que se le pide y responde lo indicado (sin JSON legible si body es undefined).
function servicio(status, body) {
  const pedidas = [];
  const fetchFn = async (url, opciones) => {
    pedidas.push({ url, ...opciones });
    return { ok: status >= 200 && status < 300, status, json: async () => { if (body === undefined) throw new SyntaxError('sin JSON'); return body; } };
  };
  return { fetchFn, pedidas };
}
const licencia = { id: 1, empresa_uuid: E, producto: 'geomatrix', plan: 'Equipo', estado: 'ACTIVA', usuarios_max: 10, usuarios_activos: 3, puede_crear_usuarios: true };

test('obtenerLicencia: GET /v1/licencias/{uuid} con Bearer y JSON, sin barra doble, y devuelve la licencia tal cual', async () => {
  const s = servicio(200, licencia);
  assert.deepEqual(await obtenerLicencia(cfg, E, { fetchFn: s.fetchFn }), licencia);
  assert.equal(s.pedidas.length, 1);
  const p = s.pedidas[0];
  assert.equal(p.url, `http://licencias:3200/v1/licencias/${E}`);
  assert.equal(p.method, 'GET');
  assert.equal(p.headers.Authorization, 'Bearer geomatrix.prueba');
  assert.equal(p.headers.Accept, 'application/json');
  assert.equal(p.headers['Content-Type'], 'application/json');
  assert.ok(p.signal instanceof AbortSignal);
  assert.equal(p.body, undefined);
  assert.equal(TIEMPO_MS, 3000);
});

test('obtenerLicencia: 404 SIN_LICENCIA no es un error, devuelve { estado: SIN_LICENCIA }', async () => {
  const s = servicio(404, { error: 'SIN_LICENCIA', mensaje: 'La empresa no tiene este producto' });
  assert.deepEqual(await obtenerLicencia(cfg, E, { fetchFn: s.fetchFn }), { estado: 'SIN_LICENCIA' });
});

test('un 404 que no es SIN_LICENCIA (p. ej. una URL mal configurada) sí es un error, para no mostrar «sin licencia» por una ruta equivocada', async () => {
  const s = servicio(404, undefined);
  await assert.rejects(() => obtenerLicencia(cfg, E, { fetchFn: s.fetchFn }), (e) => e instanceof ErrorLicencias && e.codigo === 'HTTP_404' && e.status === 404);
});

test('500 lanza ErrorLicencias con el código del servicio o HTTP_<status>; 401 lanza con TOKEN_INVALIDO', async () => {
  const conCodigo = servicio(500, { error: 'ERROR_INTERNO', mensaje: 'Falló la base' });
  await assert.rejects(() => obtenerLicencia(cfg, E, { fetchFn: conCodigo.fetchFn }), (e) => e instanceof ErrorLicencias && e.codigo === 'ERROR_INTERNO' && e.status === 500 && /Falló la base/.test(e.message));
  const sinCuerpo = servicio(502, undefined);
  await assert.rejects(() => obtenerLicencia(cfg, E, { fetchFn: sinCuerpo.fetchFn }), (e) => e.codigo === 'HTTP_502' && e.status === 502);
  const sinToken = servicio(401, { error: 'TOKEN_INVALIDO', mensaje: 'Token inválido' });
  await assert.rejects(() => obtenerLicencia(cfg, E, { fetchFn: sinToken.fetchFn }), (e) => e instanceof ErrorLicencias && e.codigo === 'TOKEN_INVALIDO' && e.status === 401);
});

test('red caída o tiempo agotado lanzan ErrorLicencias RED con el motivo', async () => {
  const caido = async () => { throw Object.assign(new TypeError('fetch failed'), { cause: new Error('connect ECONNREFUSED 127.0.0.1:3200') }); };
  await assert.rejects(() => obtenerLicencia(cfg, E, { fetchFn: caido }), (e) => e instanceof ErrorLicencias && e.codigo === 'RED' && e.status === null && /ECONNREFUSED/.test(e.message));
  const lento = async () => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError'); };
  await assert.rejects(() => consultarCupo(cfg, E, { fetchFn: lento }), (e) => e.codigo === 'RED' && /timeout/.test(e.message));
});

test('un 200 sin JSON es RESPUESTA_INVALIDA (no se toma el HTML de un proxy como licencia)', async () => {
  const s = servicio(200, undefined);
  await assert.rejects(() => obtenerLicencia(cfg, E, { fetchFn: s.fetchFn }), (e) => e.codigo === 'RESPUESTA_INVALIDA');
});

test('consultarCupo: GET …/cupo; con 404 responde que sí se puede crear y lo marca sin_licencia', async () => {
  const s = servicio(200, { puede_crear: false, activos: 10, usuarios_max: 10, estado: 'ACTIVA' });
  assert.deepEqual(await consultarCupo(cfg, E, { fetchFn: s.fetchFn }), { puede_crear: false, activos: 10, usuarios_max: 10, estado: 'ACTIVA' });
  assert.equal(s.pedidas[0].url, `http://licencias:3200/v1/licencias/${E}/cupo`);
  assert.equal(s.pedidas[0].method, 'GET');
  const sin = servicio(404, { error: 'SIN_LICENCIA' });
  assert.deepEqual(await consultarCupo(cfg, E, { fetchFn: sin.fetchFn }), { estado: 'SIN_LICENCIA', puede_crear: true, sin_licencia: true });
});

test('reportarActivos: PUT …/usuarios-activos con { activos } en el cuerpo; 404 se marca sin_licencia', async () => {
  const s = servicio(200, { puede_crear: true, activos: 7, usuarios_max: 10, estado: 'ACTIVA' });
  assert.deepEqual(await reportarActivos(cfg, E, 7, { fetchFn: s.fetchFn }), { puede_crear: true, activos: 7, usuarios_max: 10, estado: 'ACTIVA' });
  assert.equal(s.pedidas[0].url, `http://licencias:3200/v1/licencias/${E}/usuarios-activos`);
  assert.equal(s.pedidas[0].method, 'PUT');
  assert.equal(s.pedidas[0].body, JSON.stringify({ activos: 7 }));
  assert.equal(s.pedidas[0].headers.Authorization, 'Bearer geomatrix.prueba');
  const sin = servicio(404, { error: 'SIN_LICENCIA' });
  assert.deepEqual(await reportarActivos(cfg, E, 7, { fetchFn: sin.fetchFn }), { estado: 'SIN_LICENCIA', sin_licencia: true });
});
