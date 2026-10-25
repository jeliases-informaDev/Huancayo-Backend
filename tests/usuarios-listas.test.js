import test from 'node:test';
import assert from 'node:assert/strict';
import { paginaDeUsuarios, filtroTexto, filtroUsuarios, filtroAuditores, filtroZona, juntarZonas, ESTADO_ELIMINADO, USUARIOS_POR_PAGINA, USUARIOS_MAXIMO } from '../src/modules/usuarios/usuarios.filtros.js';
import { filtroPendientes } from '../src/modules/auditorias/asignaciones.paginacion.js';
import { usuariosListQuery, userUpdateBody, auditoresQuery, pendientesQuery, pendientesDistritosQuery } from '../src/validation/schemas.js';

test('las listas de usuarios siempre van por páginas: 25 por defecto y nunca más de 100', () => {
  assert.deepEqual(paginaDeUsuarios({}), { page: 1, limit: USUARIOS_POR_PAGINA });
  assert.deepEqual(paginaDeUsuarios({ page: 3, limit: 10 }), { page: 3, limit: 10 });
  assert.equal(paginaDeUsuarios({ limit: 5000 }).limit, USUARIOS_MAXIMO);
  assert.equal(paginaDeUsuarios({ page: 0, limit: 0 }).page, 1);
  assert.equal(paginaDeUsuarios({ limit: 0 }).limit, 1);
});

test('cada palabra de la búsqueda debe aparecer en algún campo: «luis ramos» encuentra a Luis Ramos Torres', () => {
  const f = filtroTexto('luis ramos', ['nombres', 'apellidos']);
  assert.equal(f.length, 2);
  assert.deepEqual(f[0], { OR: [{ nombres: { contains: 'luis' } }, { apellidos: { contains: 'luis' } }] });
  assert.deepEqual(f[1], { OR: [{ nombres: { contains: 'ramos' } }, { apellidos: { contains: 'ramos' } }] });
  assert.deepEqual(filtroTexto('   ', ['nombres']), []);
  assert.deepEqual(filtroTexto(undefined, ['nombres']), []);
  assert.equal(filtroTexto('a b c d e f g', ['x']).length, 5, 'más de 5 palabras no aportan y encarecen la consulta');
});

test('filtro de usuarios: rol, estado y texto; el administrador también encuentra el nombre anterior del rol', () => {
  const sinEliminadas = { estado: { not: 'ELIMINADO' } };
  assert.deepEqual(filtroUsuarios({}), sinEliminadas, 'las cuentas eliminadas nunca salen en la lista');
  assert.deepEqual(filtroUsuarios({ rol: 'AUDITOR' }), { rol: 'AUDITOR', ...sinEliminadas });
  assert.deepEqual(filtroUsuarios({ rol: 'ADMINISTRADOR' }), { rol: { in: ['ADMINISTRADOR', 'ADMIN'] }, ...sinEliminadas });
  const f = filtroUsuarios({ q: 'ana', estado: 'INACTIVO', rol: 'SUPERVISOR' });
  assert.equal(f.estado, 'INACTIVO'); assert.equal(f.rol, 'SUPERVISOR'); assert.equal(f.AND.length, 1);
  assert.deepEqual(f.AND[0].OR.map((c) => Object.keys(c)[0]), ['username', 'nombres', 'apellidos', 'email']);
});

test('una cuenta eliminada no es un estado que se pueda pedir ni activar desde el panel, y el nombre del estado es el que usa el servidor', () => {
  assert.equal(ESTADO_ELIMINADO, 'ELIMINADO');
  assert.ok(!usuariosListQuery.safeParse({ estado: 'ELIMINADO' }).success, 'no se lista por estado ELIMINADO');
  assert.ok(!userUpdateBody.safeParse({ estado: 'ELIMINADO' }).success, 'tampoco se fija con PATCH: se elimina solo con DELETE');
  assert.ok(userUpdateBody.safeParse({ estado: 'INACTIVO' }).success);
});

test('filtro de auditores: solo auditores de campo activos; la zona es la de la última jornada o, si nunca salió, su zona habitual', () => {
  assert.deepEqual(filtroAuditores(), { rol: { in: ['AUDITOR'] }, estado: 'ACTIVO' });
  assert.equal(filtroZona(''), null);
  assert.deepEqual(filtroZona('Junín'), { OR: [{ zona_departamento: 'Junín' }, { zona_en: null, departamento: 'Junín' }] });
  const f = filtroAuditores({ q: 'andres', zona: 'Junín' });
  assert.equal(f.estado, 'ACTIVO'); assert.equal(f.AND.length, 2);
  assert.deepEqual(filtroAuditores({ zona: 'Lima' }).AND, [filtroZona('Lima')]);
  assert.equal(filtroAuditores({ id: '216bd472-029a-44ab-83fa-93889a0187fd' }).id_usuario, '216bd472-029a-44ab-83fa-93889a0187fd', 'un auditor concreto, para los enlaces con el auditor ya elegido');
});

test('las zonas de los auditores se juntan sin distinguir mayúsculas, suman sus cantidades y salen de más a menos', () => {
  const z = juntarZonas([['Junín', 3], ['Lima', 2]], [['JUNÍN', 1], ['Cusco', 1], ['  ', 4], [null, 2]]);
  assert.deepEqual(z, [{ zona: 'Junín', n: 4 }, { zona: 'Lima', n: 2 }, { zona: 'Cusco', n: 1 }]);
  assert.deepEqual(juntarZonas([], []), []);
});

test('expedientes sin asignar: siempre PENDIENTE; el distrito se compara completo y el texto busca en cliente, crédito, documento y distrito', () => {
  assert.deepEqual(filtroPendientes({}), { estado: 'PENDIENTE' });
  assert.deepEqual(filtroPendientes({ tipo: 'OTROS', distrito: 'LIMA' }), { estado: 'PENDIENTE', tipo_credito: 'OTROS', distrito: 'LIMA' });
  const f = filtroPendientes({ q: 'lince' });
  assert.equal(f.estado, 'PENDIENTE'); assert.equal(f.OR.length, 4);
});

test('los parámetros de las listas de Usuarios y Asignaciones se validan: páginas de hasta 100, valores conocidos y nada de claves ajenas', () => {
  assert.equal(usuariosListQuery.safeParse({}).success, true);
  assert.equal(usuariosListQuery.safeParse({ page: '2', limit: '25', q: 'ana', rol: 'AUDITOR', estado: 'ACTIVO' }).success, true);
  assert.equal(usuariosListQuery.safeParse({ limit: '101' }).success, false);
  assert.equal(usuariosListQuery.safeParse({ rol: 'DIOS' }).success, false);
  assert.equal(usuariosListQuery.safeParse({ otra: '1' }).success, false);
  assert.equal(auditoresQuery.safeParse({}).success, true, 'los selectores de otras pantallas siguen pidiendo la lista sin parámetros');
  assert.equal(auditoresQuery.safeParse({ page: '1', limit: '10', q: 'a', zona: 'Junín' }).success, true);
  assert.equal(auditoresQuery.safeParse({ limit: '500' }).success, false);
  assert.equal(auditoresQuery.safeParse({ id: '216bd472-029a-44ab-83fa-93889a0187fd', page: '1', limit: '1' }).success, true);
  assert.equal(auditoresQuery.safeParse({ id: 'no-es-un-id' }).success, false);
  assert.equal(pendientesQuery.safeParse({ page: '3', limit: '50', q: 'x', tipo: 'CONSUMO', distrito: 'ATE' }).success, true);
  assert.equal(pendientesQuery.safeParse({ tipo: 'MYPE' }).success, false);
  assert.equal(pendientesQuery.safeParse({ limit: '0' }).success, false);
  assert.equal(pendientesDistritosQuery.safeParse({ tipo: 'OTROS' }).success, true);
  assert.equal(pendientesDistritosQuery.safeParse({ distrito: 'x' }).success, false);
});
