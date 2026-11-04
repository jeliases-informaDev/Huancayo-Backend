import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { licenciaMiddleware } from '../src/modules/licencias/licencia.middleware.js';
import { TTL_MS, _pruebas } from '../src/modules/licencias/licencias.service.js';

// El guard de licencia contra un servicio de licencias de mentira: un servidor http local de Node que responde lo que cada prueba le indique.
// LICENCIAS_URL y LICENCIAS_TOKEN se fijan en cada prueba: el servicio las lee en el momento, no al arrancar.
const E = '216bd472-029a-44ab-83fa-93889a0187fd';
let respuesta = { status: 200, body: {} };
const pedidas = [];
const servidor = http.createServer((req, res) => {
  pedidas.push({ metodo: req.method, url: req.url, autorizacion: req.headers.authorization });
  res.writeHead(respuesta.status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(respuesta.body));
});
let direccion;
// Una dirección donde no escucha nadie (se abre un puerto y se cierra): simula a Sulotec caído sin esperar ningún tiempo de espera.
async function direccionCaida() {
  const s = http.createServer();
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  const puerto = s.address().port;
  await new Promise((r) => s.close(r));
  return `http://127.0.0.1:${puerto}`;
}
before(async () => {
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  direccion = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => { servidor.closeAllConnections(); servidor.close(); });
beforeEach(() => {
  _pruebas.vaciarCache();
  pedidas.length = 0;
  respuesta = { status: 200, body: { estado: 'ACTIVA', plan: 'Equipo', usuarios_max: 10, usuarios_activos: 2, puede_crear_usuarios: true } };
  process.env.LICENCIAS_URL = direccion;
  process.env.LICENCIAS_TOKEN = 'geomatrix.prueba-local';
});

function fakeRes() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(payload) { this.body = payload; return this; } };
}
const fakeReq = (cambios = {}) => ({
  id: 'req-prueba', method: 'POST', baseUrl: '/api/visitas', originalUrl: '/api/visitas?reintento=1', body: { resultado: 'CONFORME' },
  user: { id: 'u1', username: 'cmh.auditor', rol: 'AUDITOR', empresa_id: E }, ...cambios,
});
async function correr(req) {
  const res = fakeRes();
  let siguio = false;
  await licenciaMiddleware(req, res, () => { siguio = true; });
  return { res, siguio };
}

test('SOLO_LECTURA + POST /api/visitas → 403 con código, estado, enlace y requestId; a Sulotec se le preguntó una vez con el token', async () => {
  respuesta = { status: 200, body: { estado: 'SOLO_LECTURA', plan: 'Equipo', usuarios_max: 10, usuarios_activos: 2, puede_crear_usuarios: false } };
  const req = fakeReq();
  const { res, siguio } = await correr(req);
  assert.equal(siguio, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    error: 'La licencia de GeoMatrix de tu empresa venció: puedes consultar la información, pero no registrar cambios. Renueva en Sulotec.',
    code: 'LICENCIA_SOLO_LECTURA', estado: 'SOLO_LECTURA', enlace: 'https://sulotec.com/mi-licencia', requestId: 'req-prueba',
  });
  assert.deepEqual(req.licenciaBloqueo, { code: 'LICENCIA_SOLO_LECTURA', estado: 'SOLO_LECTURA' });
  assert.deepEqual(pedidas, [{ metodo: 'GET', url: `/v1/licencias/${E}`, autorizacion: 'Bearer geomatrix.prueba-local' }]);
});

test('GET pasa sin preguntar nada, aunque la licencia esté vencida', async () => {
  respuesta = { status: 200, body: { estado: 'SOLO_LECTURA' } };
  const { res, siguio } = await correr(fakeReq({ method: 'GET', originalUrl: '/api/visitas/5' }));
  assert.equal(siguio, true); assert.equal(res.body, null); assert.equal(pedidas.length, 0);
});

test('ACTIVA deja pasar la escritura; la segunda petición de la misma empresa usa la caché', async () => {
  assert.equal((await correr(fakeReq())).siguio, true);
  assert.equal((await correr(fakeReq({ originalUrl: '/api/visitas/jornada', body: { accion: 'INICIAR' } }))).siguio, true);
  assert.equal(pedidas.length, 1);
});

test('con las licencias apagadas (sin token) todo pasa y no se pregunta nada', async () => {
  delete process.env.LICENCIAS_TOKEN;
  respuesta = { status: 200, body: { estado: 'CANCELADA' } };
  const { siguio } = await correr(fakeReq());
  assert.equal(siguio, true); assert.equal(pedidas.length, 0);
});

test('Sulotec caído y sin caché previa: pasa (se trata como activa)', async () => {
  process.env.LICENCIAS_URL = await direccionCaida();
  const { res, siguio } = await correr(fakeReq());
  assert.equal(siguio, true); assert.equal(res.body, null);
});

test('Sulotec caído con una SOLO_LECTURA conocida y ya vencida en caché: sigue bloqueando con lo último conocido', async () => {
  respuesta = { status: 200, body: { estado: 'SOLO_LECTURA' } };
  assert.equal((await correr(fakeReq())).res.statusCode, 403);
  _pruebas.avanzarReloj(TTL_MS + 1000); // la caché venció: toca volver a preguntar…
  process.env.LICENCIAS_URL = await direccionCaida(); // …pero Sulotec no responde
  const { res, siguio } = await correr(fakeReq());
  assert.equal(siguio, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, 'LICENCIA_SOLO_LECTURA');
  assert.equal(pedidas.length, 1); // al servidor vivo solo se le preguntó la primera vez
});

test('SIN_LICENCIA (404 del servicio) no bloquea nada, ni crear usuarios', async () => {
  respuesta = { status: 404, body: { error: 'SIN_LICENCIA', mensaje: 'La empresa no tiene este producto' } };
  const { siguio } = await correr(fakeReq({ baseUrl: '/api/usuarios', originalUrl: '/api/usuarios', user: { id: 'a', username: 'cmh.admin', rol: 'ADMINISTRADOR', empresa_id: E } }));
  assert.equal(siguio, true);
});

test('el administrador universal pasa aunque la empresa elegida esté CANCELADA, y las exentas ni preguntan', async () => {
  respuesta = { status: 200, body: { estado: 'CANCELADA' } };
  assert.equal((await correr(fakeReq({ user: { id: 's', username: 'sulotec', rol: 'UNIVERSAL', empresa_id: E } }))).siguio, true);
  assert.equal((await correr(fakeReq({ method: 'PATCH', originalUrl: '/api/visitas/ubicacion' }))).siguio, true);
  assert.equal((await correr(fakeReq({ originalUrl: '/api/visitas/jornada', body: { accion: 'TERMINAR' } }))).siguio, true);
  assert.equal(pedidas.length, 0);
  const { res } = await correr(fakeReq());
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, 'LICENCIA_CANCELADA');
});

test('un error inesperado dentro del guard no tumba la petición: se registra y se deja pasar', async () => {
  const req = fakeReq();
  Object.defineProperty(req, 'user', { get() { throw new Error('roto a propósito'); } });
  const { siguio } = await correr(req);
  assert.equal(siguio, true);
});
