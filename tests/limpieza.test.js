import test from 'node:test';
import assert from 'node:assert/strict';
import { ceros, confirmaLimpieza, confirmaUsuario, crearPresupuesto, esSinPermiso, estadoDespuesDeBorrar, motivoQueImpideBorrar } from '../src/modules/limpieza/limpieza.core.js';
import { limpiezaDatosBody, limpiezaDatosQuery, limpiezaEmpleadosBody, limpiezaUsuarioBody, modoPruebasBody } from '../src/validation/schemas.js';

test('el estado del expediente tras borrar: asignación activa > visita > pendiente', () => {
  assert.equal(estadoDespuesDeBorrar({ tieneActiva: true, tieneVisita: true }), 'ASIGNADO');
  assert.equal(estadoDespuesDeBorrar({ tieneActiva: true, tieneVisita: false }), 'ASIGNADO');
  assert.equal(estadoDespuesDeBorrar({ tieneActiva: false, tieneVisita: true }), 'VISITADO');
  assert.equal(estadoDespuesDeBorrar({ tieneActiva: false, tieneVisita: false }), 'PENDIENTE');
});

test('el presupuesto de tiempo se acaba cuando pasa el plazo, pero siempre deja hacer un lote', () => {
  let reloj = 1000;
  const p = crearPresupuesto(500, () => reloj);
  assert.equal(p.queda(), true);
  p.hizoTrabajo();
  reloj = 1499; assert.equal(p.queda(), true);
  reloj = 1500; assert.equal(p.queda(), false);
  // aunque el plazo ya haya pasado, la primera llamada hace un lote (si no, una base lenta no avanzaría nunca)
  const tarde = crearPresupuesto(10, () => reloj);
  reloj = 99999; assert.equal(tarde.queda(), true);
  tarde.hizoTrabajo(); assert.equal(tarde.queda(), false);
});

test('confirmar un empleado: su usuario exacto, sin importar mayúsculas ni espacios; vacío nunca vale', () => {
  assert.equal(confirmaUsuario('arq.jorge', 'arq.jorge'), true);
  assert.equal(confirmaUsuario('  ARQ.Jorge ', 'arq.jorge'), true);
  assert.equal(confirmaUsuario('arq.jorg', 'arq.jorge'), false);
  assert.equal(confirmaUsuario('', ''), false);
  assert.equal(confirmaUsuario(undefined, 'arq.jorge'), false);
});

test('confirmar la limpieza: solo la palabra BORRAR', () => {
  assert.equal(confirmaLimpieza('BORRAR'), true);
  assert.equal(confirmaLimpieza(' borrar '), true);
  assert.equal(confirmaLimpieza('BORRAR TODO'), false);
  assert.equal(confirmaLimpieza(''), false);
  assert.equal(confirmaLimpieza(null), false);
});

test('no se puede borrar a uno mismo ni al último administrador activo', () => {
  const admin = { id_usuario: 'a1', rol: 'ADMINISTRADOR', estado: 'ACTIVO' };
  assert.equal(motivoQueImpideBorrar({ usuario: admin, actorId: 'a1', otrosAdminsActivos: 3 }).code, 'NO_PUEDE_BORRARSE_A_SI_MISMO');
  assert.equal(motivoQueImpideBorrar({ usuario: admin, actorId: 'u9', otrosAdminsActivos: 0 }).code, 'ULTIMO_ADMINISTRADOR');
  assert.equal(motivoQueImpideBorrar({ usuario: admin, actorId: 'u9', otrosAdminsActivos: 1 }), null);
  // un administrador ya inactivo no cuenta como activo: se puede terminar de borrar
  assert.equal(motivoQueImpideBorrar({ usuario: { ...admin, estado: 'INACTIVO' }, actorId: 'u9', otrosAdminsActivos: 0 }), null);
  // un auditor se borra aunque no haya otros administradores que revisar
  assert.equal(motivoQueImpideBorrar({ usuario: { id_usuario: 'x', rol: 'AUDITOR', estado: 'ACTIVO' }, actorId: 'a1', otrosAdminsActivos: 0 }), null);
});

test('un almacén que rechaza borrar (403) se distingue de un fallo de red', () => {
  assert.equal(esSinPermiso({ name: 'AccessDenied' }), true);
  assert.equal(esSinPermiso({ $metadata: { httpStatusCode: 403 } }), true);
  assert.equal(esSinPermiso({ name: 'TimeoutError' }), false);
  assert.equal(esSinPermiso({ code: 'ECONNRESET' }), false);
  assert.equal(esSinPermiso(null), false);
});

test('ceros arma el contador de lo borrado', () => {
  assert.deepEqual(ceros(['visitas', 'fotos']), { visitas: 0, fotos: 0 });
});

test('esquemas del modo pruebas: formas válidas y rechazos', () => {
  assert.equal(modoPruebasBody.safeParse({ activo: true }).success, true);
  assert.equal(modoPruebasBody.safeParse({ activo: 'si' }).success, false);
  assert.equal(limpiezaDatosQuery.safeParse({ alcance: 'todo' }).success, true);
  assert.equal(limpiezaDatosQuery.safeParse({ alcance: 'usuarios' }).success, false);
  assert.equal(limpiezaDatosBody.safeParse({ alcance: 'campo', confirmar: 'BORRAR', clave: 'x' }).success, true);
  assert.equal(limpiezaDatosBody.safeParse({ alcance: 'campo', confirmar: 'BORRAR' }).success, false); // sin contraseña
  assert.equal(limpiezaDatosBody.safeParse({ alcance: 'campo', confirmar: 'BORRAR', clave: 'x', empresa_id: 'otra' }).success, false);
  assert.equal(limpiezaUsuarioBody.safeParse({ confirmar: 'arq.jorge' }).success, true);
  assert.equal(limpiezaUsuarioBody.safeParse({}).success, false);
  assert.equal(limpiezaEmpleadosBody.safeParse({ confirmar: 'BORRAR', clave: 'x' }).success, true);
  assert.equal(limpiezaEmpleadosBody.safeParse({ confirmar: 'BORRAR' }).success, false); // sin contraseña
  assert.equal(limpiezaEmpleadosBody.safeParse({ confirmar: 'BORRAR', clave: 'x', rol: 'ADMINISTRADOR' }).success, false); // el rol no se elige desde afuera
});
