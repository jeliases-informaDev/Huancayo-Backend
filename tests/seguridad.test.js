import test from 'node:test';
import assert from 'node:assert/strict';
import { PLURAL_CRITICO, clasificar, esLecturaAuditada } from '../src/modules/sistema/seguridad.catalogo.js';
import {
  celdaCsv, codificarCursor, construirFiltro, decodificarCursor, despuesDelCursor, esIp, filaCsv, filtroBusqueda, rangoFechas,
} from '../src/modules/sistema/seguridad.filtros.js';
import { crearDeduplicador } from '../src/core/middlewares/audit.middleware.js';
import { auditoriaQuery, exportarAuditoriaQuery, metricasSeguridadQuery } from '../src/validation/schemas.js';

const U = '11111111-2222-4333-8444-555555555555';

test('el inicio de sesión se clasifica por su resultado', () => {
  assert.deepEqual(['accion', 'severidad'].map((k) => clasificar({ metodo: 'POST', ruta: '/api/auth/login', estado: 200 })[k]), ['ACCESO_EXITOSO', 'INFO']);
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/login', estado: 401 }).accion, 'ACCESO_FALLIDO');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/login', estado: 409 }).accion, 'ACCESO_FALLIDO'); // otro dispositivo
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/login', estado: 423 }).accion, 'ACCESO_BLOQUEADO');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/login', estado: 429 }).accion, 'ACCESO_LIMITE');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/login', estado: 401 }).severidad, 'AVISO');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/mfa/verify', estado: 401 }).severidad, 'AVISO');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/mfa/verify', estado: 200 }).accion, 'ACCESO_MFA');
});

test('un 403 es un intento sin permiso (aviso) y un 401 fuera del login es una sesión vencida (info)', () => {
  const sinPermiso = clasificar({ metodo: 'DELETE', ruta: `/api/usuarios/${U}`, estado: 403 });
  assert.equal(sinPermiso.accion, 'ACCESO_DENEGADO'); assert.equal(sinPermiso.severidad, 'AVISO'); assert.match(sinPermiso.titulo, /sin permiso.*Eliminó la cuenta/);
  const vencida = clasificar({ metodo: 'POST', ruta: '/api/asignaciones', estado: 401 });
  assert.equal(vencida.accion, 'SESION_INVALIDA'); assert.equal(vencida.severidad, 'INFO');
  // un 404 o un 409 no cambian la acción: el resultado se ve aparte
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/asignaciones', estado: 409 }).accion, 'ASIGNACION_CREAR');
});

test('los cambios a una cuenta se distinguen por lo que cambió (rol > contraseña > estado > verificación > datos)', () => {
  const ruta = `/api/usuarios/${U}`;
  const base = { username: 'rosa', rol: 'AUDITOR', estado: 'ACTIVO', mfa_requerido: false, mfa_exento: false };
  const c = (anterior, nuevo, metodo = 'PATCH') => clasificar({ metodo, ruta, anterior, nuevo });
  assert.equal(c(base, { ...base, rol: 'ADMINISTRADOR' }).accion, 'USUARIO_CAMBIAR_ROL');
  assert.equal(c(base, { ...base, rol: 'ADMINISTRADOR' }).severidad, 'CRITICO');
  assert.match(c(base, { ...base, rol: 'SUPERVISOR' }).titulo, /Asesor de campo → Supervisor/);
  assert.equal(c(base, { ...base, clave_cambiada: true }).accion, 'USUARIO_CAMBIAR_CLAVE');
  assert.equal(c(base, { ...base, estado: 'INACTIVO' }).accion, 'USUARIO_DESACTIVAR');
  assert.equal(c({ ...base, estado: 'INACTIVO' }, base).accion, 'USUARIO_ACTIVAR');
  assert.equal(c(base, { ...base, mfa_exento: true }).accion, 'USUARIO_CAMBIAR_MFA');
  assert.equal(c(base, { ...base, username: 'rosa2' }, 'PUT').accion, 'USUARIO_EDITAR');
  assert.equal(c(null, null).accion, 'USUARIO_EDITAR'); // un intento rechazado no trae cambios
  assert.deepEqual(c(base, base).ref, { tipo: 'Usuario', id: U });
});

test('crear un administrador es un aviso; crear un asesor, información', () => {
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/usuarios', nuevo: { username: 'a', rol: 'ADMINISTRADOR' } }).severidad, 'AVISO');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/usuarios', nuevo: { username: 'a', rol: 'AUDITOR' } }).severidad, 'INFO');
});

test('las operaciones destructivas o de seguridad son críticas', () => {
  for (const [metodo, ruta, accion] of [
    ['DELETE', `/api/usuarios/${U}`, 'USUARIO_ELIMINAR'], ['POST', `/api/usuarios/${U}/mfa/reset`, 'USUARIO_RESET_MFA'], ['DELETE', '/api/expedientes/12', 'EXPEDIENTE_ELIMINAR'],
    ['POST', '/api/limpieza/datos', 'BORRADO_DATOS'], ['POST', `/api/limpieza/usuarios/${U}`, 'BORRADO_USUARIO'], ['POST', '/api/limpieza/empleados', 'BORRADO_EMPLEADOS'],
  ]) {
    const r = clasificar({ metodo, ruta });
    assert.equal(r.accion, accion, ruta); assert.equal(r.severidad, 'CRITICO', ruta);
    assert.ok(PLURAL_CRITICO[accion], `falta el plural de ${accion}`); // la lista «Requiere atención» necesita cómo contarlas
  }
  assert.equal(clasificar({ metodo: 'PUT', ruta: '/api/limpieza/modo-pruebas', nuevo: { activo: true } }).severidad, 'CRITICO');
  assert.equal(clasificar({ metodo: 'PUT', ruta: '/api/limpieza/modo-pruebas', nuevo: { activo: false } }).severidad, 'AVISO');
});

test('quitar casos cuenta cuántos, a quién y por qué', () => {
  const r = clasificar({ metodo: 'POST', ruta: '/api/asignaciones/quitar', nuevo: { quitadas: 6, motivo: 'ENFERMEDAD' }, objetivo: '@rosa' });
  assert.equal(r.accion, 'ASIGNACION_QUITAR'); assert.equal(r.titulo, 'Quitó 6 casos a @rosa (enfermedad)');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/asignaciones/quitar', nuevo: { quitadas: 1, motivo: 'RETIRO' } }).titulo, 'Quitó 1 caso a un asesor (retiro)');
  assert.match(clasificar({ metodo: 'PUT', ruta: '/api/asignaciones/tope-casos', anterior: { maximo: 30 }, nuevo: { maximo: 0 } }).titulo, /30 → 0/);
});

test('el nombre de quien recibe la acción entra en el texto; sin él, una frase genérica', () => {
  assert.equal(clasificar({ metodo: 'DELETE', ruta: `/api/usuarios/${U}`, objetivo: '@rosa' }).titulo, 'Eliminó la cuenta de @rosa');
  assert.equal(clasificar({ metodo: 'DELETE', ruta: `/api/usuarios/${U}` }).titulo, 'Eliminó la cuenta de un usuario');
  assert.equal(clasificar({ metodo: 'GET', ruta: '/api/expedientes/45', objetivo: 'el expediente CR-45' }).titulo, 'Consultó el expediente CR-45');
  assert.equal(clasificar({ metodo: 'GET', ruta: '/api/expedientes/45' }).titulo, 'Consultó un expediente');
  // un expediente ya eliminado se nombra por el código que quedó en el cambio guardado
  assert.equal(clasificar({ metodo: 'DELETE', ruta: '/api/expedientes/45', anterior: { codigo_expediente: 'CR-45' }, nuevo: null }).titulo, 'Eliminó el expediente CR-45');
});

test('lo que no está en el catálogo no se esconde: queda como «Otros» con su método y ruta', () => {
  const r = clasificar({ metodo: 'POST', ruta: '/api/algo/nuevo' });
  assert.deepEqual([r.categoria, r.accion, r.severidad, r.titulo], ['OTRO', 'OTRO', 'INFO', 'POST /api/algo/nuevo']);
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/auth/login?x=1', estado: 200 }).accion, 'ACCESO_EXITOSO'); // la consulta no cuenta
});

test('solo se auditan las lecturas de datos personales, descargas y exportaciones', () => {
  for (const ruta of ['/api/expedientes/45', '/api/visitas/9', '/api/reportes/visita/9/word', `/api/usuarios/${U}/tracking`, '/api/seguridad/exportar?desde=2026-01-01']) assert.equal(esLecturaAuditada(ruta), true, ruta);
  // listados, posiciones en vivo y el propio registro no se anotan (serían millones de filas sin información)
  for (const ruta of ['/api/expedientes', '/api/visitas', '/api/usuarios/ubicaciones', '/api/asignaciones/mias', '/api/seguridad/auditoria', '/api/reportes/resumen', '/api/expedientes/plantilla']) assert.equal(esLecturaAuditada(ruta), false, ruta);
});

test('la búsqueda libre usa siempre un índice según su forma', () => {
  assert.deepEqual(filtroBusqueda('190.12.4.8'), { ip_address: '190.12.4.8' });
  assert.deepEqual(filtroBusqueda('2800:200:e8b0::1'), { ip_address: '2800:200:e8b0::1' });
  assert.deepEqual(filtroBusqueda(U), { OR: [{ actor_id: U }, { entidad_id: U }] });
  assert.deepEqual(filtroBusqueda('12345'), { entidad_id: '12345' });
  assert.deepEqual(filtroBusqueda('  arq.ro '), { actor: { startsWith: 'arq.ro' } });
  assert.equal(filtroBusqueda('   '), null);
  assert.equal(esIp('999'), false);
});

test('los filtros se combinan con Y y sin filtros no hay condición', () => {
  assert.deepEqual(construirFiltro({}), {});
  const f = construirFiltro({ categoria: 'ACCESO', severidad: 'AVISO', resultado: 'error', solo_cambios: 'true', actor: 'rosa' });
  assert.deepEqual(f.AND, [{ categoria: 'ACCESO' }, { severidad: 'AVISO' }, { estado_http: { gte: 400 } }, { con_cambios: true }, { actor: { startsWith: 'rosa' } }]);
  assert.deepEqual(construirFiltro({ resultado: 'ok' }).AND, [{ estado_http: { lt: 400 } }]);
  assert.deepEqual(construirFiltro({ solo_cambios: 'false' }), {});
});

test('las fechas: un día solo vale el día completo en UTC; con hora se respeta', () => {
  const r = rangoFechas('2026-10-01', '2026-10-02');
  assert.equal(r.gte.toISOString(), '2026-10-01T00:00:00.000Z'); assert.equal(r.lte.toISOString(), '2026-10-02T23:59:59.999Z');
  assert.equal(rangoFechas('2026-10-01T05:00:00.000Z', null).gte.toISOString(), '2026-10-01T05:00:00.000Z');
  assert.equal(rangoFechas(null, null), null); assert.equal(rangoFechas('no-es-fecha', undefined), null);
});

test('el cursor guarda fecha e id y rechaza lo que no es suyo', () => {
  const fecha = new Date('2026-10-22T15:30:00.123Z');
  const c = codificarCursor(fecha, U);
  assert.deepEqual(decodificarCursor(c), { fecha, id: U });
  assert.equal(decodificarCursor('basura'), null); assert.equal(decodificarCursor(''), null);
  assert.equal(decodificarCursor(Buffer.from('2026-10-22T15:30:00.000Z|no-uuid').toString('base64url')), null);
  assert.deepEqual(despuesDelCursor({ fecha, id: U }), { AND: [{ fecha: { lte: fecha } }, { OR: [{ fecha: { lt: fecha } }, { id_auditoria: { lt: U } }] }] });
});

test('el CSV entrecomilla lo que hace falta y neutraliza las fórmulas de Excel', () => {
  assert.equal(celdaCsv('simple'), 'simple');
  assert.equal(celdaCsv('con, coma'), '"con, coma"');
  assert.equal(celdaCsv('dice "hola"'), '"dice ""hola"""');
  assert.equal(celdaCsv('línea 1\nlínea 2'), '"línea 1\nlínea 2"');
  assert.equal(celdaCsv(null), ''); assert.equal(celdaCsv(undefined), ''); assert.equal(celdaCsv(401), '401');
  assert.equal(celdaCsv({ a: 1 }), '"{""a"":1}"');
  // el usuario de un intento de acceso lo escribe cualquiera: «=2+5» no debe ejecutarse al abrir el archivo
  for (const peligro of ['=HYPERLINK("http://x")', '+1', '-1+1', '@SUM(A1)', '\tx']) assert.ok(celdaCsv(peligro).replace(/^"/, '').startsWith("'"), peligro);
  assert.equal(filaCsv(['a', 'b,c']), 'a,"b,c"\r\n');
});

test('las lecturas repetidas dentro de la ventana se anotan una sola vez, y la memoria no crece sin límite', () => {
  const repetida = crearDeduplicador({ ventanaMs: 1000, maximo: 3 });
  assert.equal(repetida('a', 0), false); assert.equal(repetida('a', 500), true); assert.equal(repetida('a', 1001), false); // pasada la ventana vuelve a anotarse
  assert.equal(repetida('b', 2000), false); assert.equal(repetida('c', 2000), false); assert.equal(repetida('d', 2000), false); assert.equal(repetida('e', 2000), false);
  // con el máximo en 3 se descartaron los más viejos: «b» ya se olvidó y vuelve a anotarse, «e» (el último) todavía se recuerda
  assert.equal(repetida('e', 2100), true); assert.equal(repetida('b', 2100), false);
});

test('esquemas del registro: rangos, categorías y campos extra', () => {
  assert.equal(auditoriaQuery.safeParse({}).success, true);
  assert.equal(auditoriaQuery.safeParse({ categoria: 'ACCESO', severidad: 'CRITICO', resultado: 'error', limit: '50', contar: 'true', desde: '2026-10-01', hasta: '2026-10-02T10:00:00Z' }).success, true);
  assert.equal(auditoriaQuery.safeParse({ categoria: 'HACKER' }).success, false);
  assert.equal(auditoriaQuery.safeParse({ limit: '101' }).success, false);
  assert.equal(auditoriaQuery.safeParse({ desde: 'ayer' }).success, false);
  assert.equal(auditoriaQuery.safeParse({ accion: 'drop table' }).success, false);
  assert.equal(auditoriaQuery.safeParse({ empresa_id: 'otra' }).success, false); // la empresa nunca se elige desde afuera
  assert.equal(metricasSeguridadQuery.safeParse({ ventana: '7d', fresco: 'true' }).success, true); assert.equal(metricasSeguridadQuery.safeParse({ ventana: '1y' }).success, false);
});

test('exportar exige un rango de fechas de hasta un año', () => {
  assert.equal(exportarAuditoriaQuery.safeParse({}).success, false);
  assert.equal(exportarAuditoriaQuery.safeParse({ desde: '2026-01-01' }).success, false);
  assert.equal(exportarAuditoriaQuery.safeParse({ desde: '2026-10-01', hasta: '2026-10-22', categoria: 'ACCESO' }).success, true);
  assert.equal(exportarAuditoriaQuery.safeParse({ desde: '2026-10-22', hasta: '2026-10-01' }).success, false);
  assert.equal(exportarAuditoriaQuery.safeParse({ desde: '2025-01-01', hasta: '2026-10-01' }).success, false);
  assert.equal(exportarAuditoriaQuery.safeParse({ desde: '2025-10-22', hasta: '2026-10-22' }).success, true);
});
