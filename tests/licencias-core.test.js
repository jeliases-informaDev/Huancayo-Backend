import test from 'node:test';
import assert from 'node:assert/strict';
import { ENLACES, crearCache, decidir, esExenta, mensajeDeEstado, publica, textoCupo } from '../src/modules/licencias/licencias.core.js';

const E = '216bd472-029a-44ab-83fa-93889a0187fd';
const U = '/api/usuarios/8f1c2b3a-4d5e-4f60-9a7b-1c2d3e4f5a6b';
const BLOQUEAN = ['SOLO_LECTURA', 'SUSPENDIDA', 'CANCELADA'];
// Una escritura de trabajo típica (el auditor de campo guarda una visita); cada prueba cambia lo que necesita.
const peticion = (cambios = {}) => ({ metodo: 'POST', baseUrl: '/api/visitas', ruta: '/api/visitas', body: {}, rol: 'AUDITOR', empresaId: E, ...cambios });
const pasa = (d) => assert.deepEqual(d, { permitir: true });
const bloquea = (d, estado) => assert.deepEqual(d, { permitir: false, statusCode: 403, code: 'LICENCIA_' + estado, mensaje: mensajeDeEstado(estado) });

test('las lecturas, el administrador universal y lo que no es de ninguna empresa pasan en cualquier estado', () => {
  for (const estado of BLOQUEAN) {
    for (const metodo of ['GET', 'HEAD', 'OPTIONS', 'get']) pasa(decidir(peticion({ metodo, ruta: '/api/visitas/5', estado })));
    pasa(decidir(peticion({ rol: 'UNIVERSAL', estado })));
    pasa(decidir(peticion({ empresaId: null, estado })));
  }
});

test('las rutas de sesión, términos, empresas y licencia nunca se bloquean (por la ruta o por el baseUrl del router)', () => {
  for (const ruta of ['/api/auth/logout', '/api/auth/mfa/enroll', '/api/terminos/aceptar', '/api/empresas', '/api/empresas/x', '/api/licencia']) {
    assert.equal(esExenta(peticion({ ruta, baseUrl: undefined })), true, ruta);
    for (const estado of BLOQUEAN) pasa(decidir(peticion({ ruta, baseUrl: undefined, estado })));
  }
  assert.equal(esExenta(peticion({ baseUrl: '/api/auth', ruta: '/otra/cosa' })), true);
  // un prefijo parecido no es la ruta exenta
  assert.equal(esExenta(peticion({ baseUrl: undefined, ruta: '/api/authx/login' })), false);
  assert.equal(esExenta(peticion()), false);
});

test('telemetría y cierres pasan: posición del celular, trazar ruta, terminar jornada y apagar el modo pruebas; iniciar jornada se bloquea', () => {
  for (const estado of BLOQUEAN) {
    pasa(decidir(peticion({ metodo: 'PATCH', ruta: '/api/visitas/ubicacion', estado })));
    pasa(decidir(peticion({ metodo: 'POST', baseUrl: '/api/rutas', ruta: '/api/rutas/trazar', estado })));
    pasa(decidir(peticion({ metodo: 'POST', ruta: '/api/visitas/jornada', body: { accion: 'TERMINAR' }, estado })));
    pasa(decidir(peticion({ metodo: 'PUT', baseUrl: '/api/limpieza', ruta: '/api/limpieza/modo-pruebas', body: { activo: false }, rol: 'ADMINISTRADOR', estado })));
    bloquea(decidir(peticion({ metodo: 'POST', ruta: '/api/visitas/jornada', body: { accion: 'INICIAR' }, estado })), estado);
    bloquea(decidir(peticion({ metodo: 'POST', ruta: '/api/visitas/jornada', body: {}, estado })), estado);
  }
});

test('SOLO_LECTURA bloquea las escrituras de trabajo con 403 LICENCIA_SOLO_LECTURA y su texto', () => {
  const estado = 'SOLO_LECTURA';
  bloquea(decidir(peticion({ estado })), estado);
  bloquea(decidir(peticion({ baseUrl: '/api/expedientes', ruta: '/api/expedientes', rol: 'SUPERVISOR', estado })), estado);
  bloquea(decidir(peticion({ metodo: 'DELETE', baseUrl: '/api/expedientes', ruta: '/api/expedientes/12', rol: 'ADMINISTRADOR', estado })), estado);
  bloquea(decidir(peticion({ metodo: 'PUT', ruta: '/api/visitas/evidencias/upload/clave', estado })), estado);
  bloquea(decidir(peticion({ metodo: 'POST', baseUrl: '/api/asignaciones', ruta: '/api/asignaciones', rol: 'SUPERVISOR', estado })), estado);
  bloquea(decidir(peticion({ metodo: 'POST', baseUrl: '/api/limpieza', ruta: '/api/limpieza/datos', rol: 'ADMINISTRADOR', estado })), estado);
  assert.equal(decidir(peticion({ estado })).mensaje, 'La licencia de GeoMatrix de tu empresa venció: puedes consultar la información, pero no registrar cambios. Renueva en Sulotec.');
});

test('SOLO_LECTURA en usuarios: editar, desactivar, eliminar y reiniciar MFA o celular pasan; crear y reactivar se bloquean', () => {
  const estado = 'SOLO_LECTURA';
  const admin = (cambios) => peticion({ baseUrl: '/api/usuarios', rol: 'ADMINISTRADOR', estado, ...cambios });
  pasa(decidir(admin({ metodo: 'PUT', ruta: U, body: { nombres: 'Ana' } })));
  pasa(decidir(admin({ metodo: 'PATCH', ruta: U, body: { estado: 'INACTIVO' } })));
  pasa(decidir(admin({ metodo: 'DELETE', ruta: U, body: undefined })));
  pasa(decidir(admin({ metodo: 'POST', ruta: U + '/mfa/reset' })));
  pasa(decidir(admin({ metodo: 'POST', ruta: U + '/device/reset' })));
  bloquea(decidir(admin({ metodo: 'POST', ruta: '/api/usuarios', body: { username: 'nuevo' } })), estado);
  bloquea(decidir(admin({ metodo: 'PUT', ruta: U, body: { estado: 'ACTIVO' } })), estado);
  bloquea(decidir(admin({ metodo: 'PATCH', ruta: U, body: { estado: 'ACTIVO' } })), estado);
});

test('SOLO_LECTURA deja cerrar las llaves de autoasignación y tope de casos, pero no asignar ni liberar', () => {
  const estado = 'SOLO_LECTURA';
  const admin = (cambios) => peticion({ metodo: 'PUT', baseUrl: '/api/asignaciones', rol: 'ADMINISTRADOR', estado, ...cambios });
  pasa(decidir(admin({ ruta: '/api/asignaciones/autoasignacion', body: { permitido: false } })));
  pasa(decidir(admin({ ruta: '/api/asignaciones/tope-casos', body: { tope: 10 } })));
  bloquea(decidir(admin({ metodo: 'POST', ruta: '/api/asignaciones/liberar' })), estado);
  bloquea(decidir(admin({ metodo: 'POST', ruta: '/api/asignaciones/masivo' })), estado);
});

test('SUSPENDIDA y CANCELADA bloquean todo salvo las bajas de usuarios, cada una con su código y su texto', () => {
  for (const estado of ['SUSPENDIDA', 'CANCELADA']) {
    const admin = (cambios) => peticion({ baseUrl: '/api/usuarios', rol: 'ADMINISTRADOR', estado, ...cambios });
    bloquea(decidir(peticion({ baseUrl: '/api/expedientes', ruta: '/api/expedientes', rol: 'SUPERVISOR', estado })), estado);
    bloquea(decidir(peticion({ estado })), estado);
    pasa(decidir(admin({ metodo: 'DELETE', ruta: U })));
    pasa(decidir(admin({ metodo: 'PATCH', ruta: U, body: { estado: 'INACTIVO' } })));
    pasa(decidir(admin({ metodo: 'PUT', ruta: U, body: { estado: 'INACTIVO' } })));
    bloquea(decidir(admin({ metodo: 'PUT', ruta: U, body: { nombres: 'Ana' } })), estado);
    bloquea(decidir(admin({ metodo: 'PATCH', ruta: U, body: { estado: 'ACTIVO' } })), estado);
    bloquea(decidir(admin({ metodo: 'POST', ruta: U + '/mfa/reset' })), estado);
    bloquea(decidir(admin({ metodo: 'POST', ruta: '/api/usuarios' })), estado);
    bloquea(decidir(peticion({ metodo: 'PUT', baseUrl: '/api/asignaciones', ruta: '/api/asignaciones/autoasignacion', rol: 'ADMINISTRADOR', estado })), estado);
  }
  assert.equal(decidir(peticion({ estado: 'SUSPENDIDA' })).mensaje, 'La licencia de GeoMatrix de tu empresa está suspendida: no se pueden registrar cambios. Escribe a contacto@sulotec.com.');
  assert.equal(decidir(peticion({ estado: 'CANCELADA' })).mensaje, 'La licencia de GeoMatrix de tu empresa está cancelada. Escribe a contacto@sulotec.com.');
});

test('ACTIVA, SIN_LICENCIA, sin estado o un estado que no conocemos permiten todo (nunca se bloquea por duda)', () => {
  for (const estado of ['ACTIVA', 'SIN_LICENCIA', null, undefined, 'PRUEBA_NUEVA', 'constructor']) {
    pasa(decidir(peticion({ estado })));
    pasa(decidir(peticion({ metodo: 'POST', baseUrl: '/api/usuarios', ruta: '/api/usuarios', rol: 'ADMINISTRADOR', estado })));
  }
});

test('la ruta se compara sin query ni barra final', () => {
  pasa(decidir(peticion({ metodo: 'PATCH', ruta: '/api/visitas/ubicacion/?x=1', estado: 'SOLO_LECTURA' })));
  bloquea(decidir(peticion({ ruta: '/api/visitas/?reintento=1', estado: 'SOLO_LECTURA' })), 'SOLO_LECTURA');
  assert.equal(esExenta(peticion({ ruta: '/api/licencia/?refrescar=1', baseUrl: undefined })), true);
});

test('mensajeDeEstado, textoCupo y ENLACES: los textos y direcciones exactos que ve la persona', () => {
  assert.equal(mensajeDeEstado('ACTIVA'), '');
  assert.equal(mensajeDeEstado(null), '');
  assert.equal(mensajeDeEstado('constructor'), '');
  assert.equal(mensajeDeEstado('SIN_LICENCIA'), 'Esta empresa no tiene una licencia de GeoMatrix registrada en Sulotec.');
  assert.equal(textoCupo({ activos: 5, usuarios_max: 5 }), 'Tu plan llegó al máximo de usuarios activos (5 de 5). Desactiva un usuario o amplía tu licencia en Sulotec.');
  assert.deepEqual(ENLACES, { miLicencia: 'https://sulotec.com/mi-licencia', licencias: 'https://sulotec.com/licencias', contacto: 'contacto@sulotec.com' });
});

test('publica(): null sin licencia conocida; SIN_LICENCIA con campos nulos y su texto; la activa con sus números y sin mensaje', () => {
  assert.equal(publica(null), null);
  assert.equal(publica(undefined), null);
  assert.deepEqual(publica({ estado: 'SIN_LICENCIA' }), {
    estado: 'SIN_LICENCIA', plan: null, usuarios_max: null, usuarios_activos: null, puede_crear_usuarios: null, vencimiento: null, dias_para_vencer: null,
    mensaje: 'Esta empresa no tiene una licencia de GeoMatrix registrada en Sulotec.', enlace: 'https://sulotec.com/mi-licencia',
  });
  const cruda = {
    id: 7, empresa_uuid: E, empresa_nombre: 'Caja Huancayo', producto: 'geomatrix', plan: 'Equipo', plan_id: 2, estado: 'ACTIVA', usuarios_max: 25, usuarios_activos: 12,
    puede_crear_usuarios: true, periodo: 'ANUAL', tokens: null, inicio: '2026-01-01', vencimiento: '2026-12-31', dias_para_vencer: 57, titular: { email: 'x@y.pe', nombre: 'X' }, creado_en: '2026-01-01T00:00:00Z',
  };
  assert.deepEqual(publica(cruda), { estado: 'ACTIVA', plan: 'Equipo', usuarios_max: 25, usuarios_activos: 12, puede_crear_usuarios: true, vencimiento: '2026-12-31', dias_para_vencer: 57, mensaje: '', enlace: 'https://sulotec.com/mi-licencia' });
  // nada interno (titular, ids) sale al panel ni a la app
  assert.equal('titular' in publica(cruda), false);
  const vencida = publica({ ...cruda, estado: 'SOLO_LECTURA', puede_crear_usuarios: false, dias_para_vencer: -3 });
  assert.equal(vencida.mensaje, mensajeDeEstado('SOLO_LECTURA'));
  assert.equal(vencida.dias_para_vencer, -3);
});

test('crearCache con reloj inyectado: vigente, vencida pero recordada, tocar sin renovar, olvidar y tope de memoria', () => {
  let t = 1_000_000;
  const cache = crearCache({ ttlMs: 1000, maximo: 3, ahora: () => t });
  assert.equal(cache.obtener('a'), null);
  cache.guardar('a', { estado: 'ACTIVA', usuarios_activos: 1 });
  assert.deepEqual(cache.obtener('a'), { valor: { estado: 'ACTIVA', usuarios_activos: 1 }, vigente: true });
  t += 999;
  assert.equal(cache.obtener('a').vigente, true);
  t += 1;
  assert.deepEqual(cache.obtener('a'), { valor: { estado: 'ACTIVA', usuarios_activos: 1 }, vigente: false }); // vencida, pero se recuerda
  assert.equal(cache.tocar('a', { usuarios_activos: 2 }), true);
  assert.deepEqual(cache.obtener('a'), { valor: { estado: 'ACTIVA', usuarios_activos: 2 }, vigente: false }); // tocar no la revive
  assert.equal(cache.tocar('nadie', { x: 1 }), false);
  cache.olvidar('a');
  assert.equal(cache.obtener('a'), null);
  // tope: con 3 de máximo, la cuarta saca primero lo vencido y, si aún sobra, lo más antiguo
  cache.guardar('v', { estado: 'ACTIVA' });
  t += 2000; // 'v' vence
  cache.guardar('b', {}); cache.guardar('c', {}); cache.guardar('d', {});
  assert.equal(cache.tamano(), 3);
  assert.equal(cache.obtener('v'), null);
  cache.guardar('e', {});
  assert.equal(cache.tamano(), 3);
  assert.equal(cache.obtener('b'), null); // la más antigua de las vigentes
  assert.ok(cache.obtener('e'));
  cache.vaciar();
  assert.equal(cache.tamano(), 0);
});
