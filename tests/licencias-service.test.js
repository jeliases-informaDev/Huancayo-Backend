import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { ENLACES, textoCupo } from '../src/modules/licencias/licencias.core.js';
import { PAUSA_TRAS_FALLO_MS, TTL_MS, _pruebas, configuracion, estadoConocido, licenciaDe, licenciaPublica, reportarActivosDeEmpresa, reportarLuego, verificarCupo } from '../src/modules/licencias/licencias.service.js';

// El servicio contra un Sulotec de mentira (servidor http local): la licencia (a) y el cupo (b) se cambian en cada prueba.
const E = '216bd472-029a-44ab-83fa-93889a0187fd';
const OTRA = '9c1a7a1e-3b2f-4e3d-8c5a-0f1e2d3c4b5a';
let licencia = { status: 200, body: {} };
let cupo = { status: 200, body: {} };
const pedidas = [];
const servidor = http.createServer((req, res) => {
  pedidas.push({ metodo: req.method, url: req.url });
  const r = req.url.endsWith('/cupo') ? cupo : licencia;
  res.writeHead(r.status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(r.body));
});
let direccion;
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
  licencia = { status: 200, body: { estado: 'ACTIVA', plan: 'Equipo', usuarios_max: 10, usuarios_activos: 4, puede_crear_usuarios: true, vencimiento: '2027-01-31', dias_para_vencer: 88 } };
  cupo = { status: 200, body: { puede_crear: true, activos: 4, usuarios_max: 10, estado: 'ACTIVA' } };
  process.env.LICENCIAS_URL = direccion;
  process.env.LICENCIAS_TOKEN = 'geomatrix.prueba-local';
  delete process.env.LICENCIAS_PRODUCTO;
});

test('configuracion() lee process.env en el momento: sin token (o sin URL) está apagado', () => {
  assert.deepEqual(configuracion(), { url: direccion, token: 'geomatrix.prueba-local', producto: 'geomatrix', activo: true });
  process.env.LICENCIAS_TOKEN = '  ';
  assert.equal(configuracion().activo, false);
  process.env.LICENCIAS_TOKEN = 'geomatrix.x';
  delete process.env.LICENCIAS_URL;
  assert.equal(configuracion().activo, false);
});

test('licenciaDe: la segunda llamada dentro de los 5 minutos no vuelve a pedir; al vencer la caché sí; forzar siempre; cada empresa aparte', async () => {
  assert.equal((await licenciaDe(E)).estado, 'ACTIVA');
  assert.equal((await licenciaDe(E)).estado, 'ACTIVA');
  assert.equal(pedidas.length, 1);
  _pruebas.avanzarReloj(TTL_MS - 1000);
  await licenciaDe(E);
  assert.equal(pedidas.length, 1);
  _pruebas.avanzarReloj(2000);
  licencia.body = { ...licencia.body, estado: 'SOLO_LECTURA' };
  assert.equal((await licenciaDe(E)).estado, 'SOLO_LECTURA');
  assert.equal(pedidas.length, 2);
  await licenciaDe(E, { forzar: true });
  assert.equal(pedidas.length, 3);
  await licenciaDe(OTRA);
  assert.equal(pedidas.length, 4);
  assert.equal(pedidas[3].url, `/v1/licencias/${OTRA}`);
});

test('las peticiones simultáneas de la misma empresa comparten una sola llamada', async () => {
  const r = await Promise.all([licenciaDe(E), licenciaDe(E), licenciaDe(E), licenciaDe(E)]);
  assert.equal(pedidas.length, 1);
  assert.deepEqual(r.map((l) => l.estado), ['ACTIVA', 'ACTIVA', 'ACTIVA', 'ACTIVA']);
});

test('si Sulotec cae se sigue con la última conocida, se hace una pausa antes de reintentar y estadoConocido la recuerda', async () => {
  licencia.body = { ...licencia.body, estado: 'SOLO_LECTURA' };
  await licenciaDe(E);
  _pruebas.avanzarReloj(TTL_MS + 1000);
  process.env.LICENCIAS_URL = await direccionCaida();
  assert.equal((await licenciaDe(E)).estado, 'SOLO_LECTURA');
  assert.equal(estadoConocido(E), 'SOLO_LECTURA');
  // vuelve el servicio con otra respuesta: durante la pausa no se le pregunta; pasada la pausa, sí
  process.env.LICENCIAS_URL = direccion;
  licencia.body = { ...licencia.body, estado: 'ACTIVA' };
  assert.equal((await licenciaDe(E)).estado, 'SOLO_LECTURA');
  assert.equal(pedidas.length, 1);
  _pruebas.avanzarReloj(PAUSA_TRAS_FALLO_MS + 1000);
  assert.equal((await licenciaDe(E)).estado, 'ACTIVA');
  assert.equal(pedidas.length, 2);
});

test('nunca conocida y Sulotec caído → null (se trata como activa); apagado → null; licenciaPublica igual', async () => {
  process.env.LICENCIAS_URL = await direccionCaida();
  assert.equal(await licenciaDe(E), null);
  assert.equal(await licenciaPublica(E), null);
  assert.equal(estadoConocido(E), null);
  process.env.LICENCIAS_URL = direccion;
  delete process.env.LICENCIAS_TOKEN;
  assert.equal(await licenciaDe(E), null);
  assert.equal(pedidas.length, 0);
});

test('licenciaPublica entrega lo que ven el panel y la app, y con 404 el aviso de SIN_LICENCIA', async () => {
  assert.deepEqual(await licenciaPublica(E), { estado: 'ACTIVA', plan: 'Equipo', usuarios_max: 10, usuarios_activos: 4, puede_crear_usuarios: true, vencimiento: '2027-01-31', dias_para_vencer: 88, mensaje: '', enlace: ENLACES.miLicencia });
  licencia = { status: 404, body: { error: 'SIN_LICENCIA' } };
  const sin = await licenciaPublica(OTRA);
  assert.equal(sin.estado, 'SIN_LICENCIA');
  assert.equal(sin.mensaje, 'Esta empresa no tiene una licencia de GeoMatrix registrada en Sulotec.');
  assert.equal(estadoConocido(OTRA), 'SIN_LICENCIA');
});

test('verificarCupo lanza 409 LICENCIA_SIN_CUPO con los números y el enlace según quién crea', async () => {
  cupo.body = { puede_crear: false, activos: 10, usuarios_max: 10, estado: 'ACTIVA' };
  await assert.rejects(() => verificarCupo(E), (e) => {
    assert.equal(e.statusCode, 409); assert.equal(e.code, 'LICENCIA_SIN_CUPO');
    assert.equal(e.activos, 10); assert.equal(e.usuarios_max, 10);
    assert.equal(e.enlace, ENLACES.miLicencia);
    assert.equal(e.message, textoCupo({ activos: 10, usuarios_max: 10 }));
    return true;
  });
  await assert.rejects(() => verificarCupo(E, { universal: true }), (e) => e.code === 'LICENCIA_SIN_CUPO' && e.enlace === ENLACES.licencias);
  assert.deepEqual(pedidas.map((p) => p.url), [`/v1/licencias/${E}/cupo`, `/v1/licencias/${E}/cupo`]);
});

test('verificarCupo con cupo permite y refresca los números de la licencia en caché', async () => {
  await licenciaDe(E);
  cupo.body = { puede_crear: true, activos: 7, usuarios_max: 10, estado: 'ACTIVA' };
  await verificarCupo(E);
  assert.equal((await licenciaPublica(E)).usuarios_activos, 7);
  assert.equal(pedidas.length, 2); // licencia + cupo; la pública salió de la caché
});

test('verificarCupo con Sulotec caído: permite si no se conocía nada; aplica la última licencia si decía que no se podía crear', async () => {
  process.env.LICENCIAS_URL = await direccionCaida();
  assert.equal(await verificarCupo(E), undefined);
  process.env.LICENCIAS_URL = direccion;
  licencia.body = { ...licencia.body, puede_crear_usuarios: false, usuarios_activos: 10, usuarios_max: 10 };
  await licenciaDe(OTRA);
  process.env.LICENCIAS_URL = await direccionCaida();
  await assert.rejects(() => verificarCupo(OTRA), (e) => e.code === 'LICENCIA_SIN_CUPO' && e.activos === 10 && e.usuarios_max === 10);
});

test('verificarCupo con 404 SIN_LICENCIA no exige cupo; apagado tampoco pregunta', async () => {
  cupo = { status: 404, body: { error: 'SIN_LICENCIA' } };
  assert.equal(await verificarCupo(E), undefined);
  assert.equal(pedidas.length, 1);
  delete process.env.LICENCIAS_TOKEN;
  assert.equal(await verificarCupo(E), undefined);
  assert.equal(pedidas.length, 1);
});

test('reportarLuego y reportarActivosDeEmpresa no hacen nada sin empresa o con las licencias apagadas (no tocan la base)', async () => {
  assert.equal(reportarLuego(null), undefined);
  delete process.env.LICENCIAS_TOKEN;
  assert.equal(reportarLuego(E), undefined);
  assert.equal(await reportarActivosDeEmpresa(E), null);
  assert.equal(pedidas.length, 0);
});
