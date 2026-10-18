import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarEmpresa, MODELOS_EMPRESA, extensionEmpresa } from '../src/core/tenant/empresa.prisma.js';
import { conEmpresa, sinEmpresa, empresaActual, contextoEmpresa } from '../src/core/tenant/contexto.js';

const E = '216bd472-029a-44ab-83fa-93889a0187fd';

test('las lecturas y conteos se filtran por empresa sin perder el filtro original', () => {
  assert.deepEqual(aplicarEmpresa('findMany', { where: { estado: 'ACTIVA' } }, E).where, { AND: [{ empresa_id: E }, { estado: 'ACTIVA' }] });
  assert.deepEqual(aplicarEmpresa('count', {}, E).where, { empresa_id: E });
  assert.deepEqual(aplicarEmpresa('groupBy', { by: ['rol'], where: { estado: 'ACTIVO' } }, E).where, { AND: [{ empresa_id: E }, { estado: 'ACTIVO' }] });
  assert.deepEqual(aplicarEmpresa('updateMany', { where: { id: 1 }, data: { x: 1 } }, E).where, { AND: [{ empresa_id: E }, { id: 1 }] });
  assert.deepEqual(aplicarEmpresa('deleteMany', undefined, E).where, { empresa_id: E });
});

test('las operaciones por clave única exigen que la fila sea de la empresa', () => {
  assert.deepEqual(aplicarEmpresa('findUnique', { where: { id_expediente: 7 } }, E).where, { id_expediente: 7, empresa_id: E });
  assert.deepEqual(aplicarEmpresa('update', { where: { id_usuario: 'u' }, data: { estado: 'INACTIVO' } }, E).where, { id_usuario: 'u', empresa_id: E });
  assert.deepEqual(aplicarEmpresa('delete', { where: { id_dispositivo: 'd' } }, E).where, { id_dispositivo: 'd', empresa_id: E });
});

test('todo registro nuevo nace con la empresa del contexto (create, createMany y upsert)', () => {
  assert.equal(aplicarEmpresa('create', { data: { nombres_cliente: 'X' } }, E).data.empresa_id, E);
  assert.deepEqual(aplicarEmpresa('createMany', { data: [{ a: 1 }, { a: 2 }] }, E).data.map((d) => d.empresa_id), [E, E]);
  const u = aplicarEmpresa('upsert', { where: { clave: 'k' }, create: { clave: 'k', valor: 'v' }, update: { valor: 'v' } }, E);
  assert.equal(u.create.empresa_id, E); assert.equal(u.where.empresa_id, E); assert.deepEqual(u.update, { valor: 'v' });
});

test('una operación desconocida sin where se rechaza en vez de dejar pasar datos de todas las empresas', () => {
  assert.throws(() => aplicarEmpresa('loQueSea', {}, E), /no admitida/);
  assert.deepEqual(aplicarEmpresa('loQueSea', { where: { x: 1 } }, E).where, { AND: [{ empresa_id: E }, { x: 1 }] });
});

test('la extensión: sin contexto falla con EMPRESA_REQUERIDA; con empresa filtra; en ámbito de plataforma pasa tal cual; Empresa no se toca', async () => {
  const ext = extensionEmpresa();
  const op = ext.query.$allModels.$allOperations;
  const eco = (args) => Promise.resolve(args);
  await assert.rejects(op({ model: 'Expediente', operation: 'findMany', args: {}, query: eco }), (e) => e.code === 'EMPRESA_REQUERIDA');
  const dentro = await conEmpresa(E, () => op({ model: 'Expediente', operation: 'findMany', args: { where: { estado: 'PENDIENTE' } }, query: eco }));
  assert.deepEqual(dentro.where, { AND: [{ empresa_id: E }, { estado: 'PENDIENTE' }] });
  const global = await sinEmpresa(() => op({ model: 'Usuario', operation: 'findUnique', args: { where: { username: 'a' } }, query: eco }));
  assert.deepEqual(global.where, { username: 'a' });
  const catalogo = await op({ model: 'Empresa', operation: 'findMany', args: { where: { estado: 'ACTIVA' } }, query: eco });
  assert.deepEqual(catalogo.where, { estado: 'ACTIVA' });
});

test('el contexto viaja por las llamadas asíncronas de la misma petición y no se mezcla entre peticiones', async () => {
  const leer = async () => { await new Promise((r) => setTimeout(r, 5)); return empresaActual(); };
  const [a, b, fuera] = await Promise.all([conEmpresa('A', leer), conEmpresa('B', leer), leer()]);
  assert.equal(a, 'A'); assert.equal(b, 'B'); assert.equal(fuera, null);
  assert.equal(contextoEmpresa(), null);
  assert.equal(await sinEmpresa(async () => contextoEmpresa().global), true);
});

test('todos los modelos con datos de clientes están en la lista de aislamiento', () => {
  for (const m of ['Usuario', 'Expediente', 'AsignacionAuditoria', 'VisitaAuditoria', 'Evidencia', 'TrackingUbicacion', 'EventoCampo', 'ConfiguracionSistema', 'DispositivoAutorizado', 'ExpedienteCambio', 'AuditoriaSeguridad', 'ImportacionMasiva']) assert.ok(MODELOS_EMPRESA.has(m), m);
  assert.equal(MODELOS_EMPRESA.has('Empresa'), false);
});
