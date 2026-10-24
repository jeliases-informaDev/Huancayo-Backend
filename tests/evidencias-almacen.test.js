import test from 'node:test';
import assert from 'node:assert/strict';
import { claveEvidencia } from '../src/modules/sistema/storage.service.js';
import { configuracionS3 } from '../src/modules/sistema/storage.s3.js';

test('la clave de una evidencia lleva el prefijo de su empresa, la fecha, el expediente y la firma', () => {
  const k = claveEvidencia({ empresaId: 'E1', expedienteId: 77, tipo: 'FOTO_PRINCIPAL', timestamp: 1700000000000, id: 'abc', signature: 'f1rm4', extension: 'jpg', date: new Date('2026-10-18T03:00:00Z') });
  assert.equal(k, 'empresa/E1/2026/10/18/77/FOTO_PRINCIPAL-1700000000000-abc-f1rm4.jpg');
});

test('la configuración del bucket exige las cinco variables y usa direcciones por ruta y sumas solo cuando se piden (Oracle)', () => {
  assert.throws(() => configuracionS3({ S3_BUCKET: 'b' }), /requiere S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY/);
  const c = configuracionS3({ S3_BUCKET: 'huancayo-archivos', S3_ENDPOINT: 'https://x.compat.objectstorage.sa-santiago-1.oraclecloud.com', S3_REGION: 'sa-santiago-1', S3_ACCESS_KEY_ID: 'k', S3_SECRET_ACCESS_KEY: 's' });
  assert.equal(c.bucket, 'huancayo-archivos');
  assert.equal(c.client.forcePathStyle, true);
  assert.equal(c.client.requestChecksumCalculation, 'WHEN_REQUIRED');
  assert.equal(configuracionS3({ S3_BUCKET: 'b', S3_ENDPOINT: 'e', S3_REGION: 'r', S3_ACCESS_KEY_ID: 'k', S3_SECRET_ACCESS_KEY: 's', S3_FORCE_PATH_STYLE: 'false' }).client.forcePathStyle, false);
});

test('la firma de una clave de evidencia: se acepta con la llave propia y con la de sesiones (claves anteriores), y se rechaza cualquier otra cosa', async () => {
  const { firmaDePropiedad, firmaEsValida, llavesDeFirma } = await import('../src/modules/sistema/storage.service.js');
  const datos = { auditorId: 'aud-1', expedienteId: 77, tipo: 'FOTO_PRINCIPAL', timestamp: 1700000000000, id: '6f1c9b0e-2d3a-4c5b-8e7f-0a1b2c3d4e5f' };
  const propia = 'p'.repeat(40), sesiones = 's'.repeat(40);
  const conPropia = firmaDePropiedad(datos, propia), conSesiones = firmaDePropiedad(datos, sesiones);
  assert.notEqual(conPropia, conSesiones);
  assert.equal(conPropia.length, 24);
  // con llave propia configurada: firma las nuevas con ella y sigue aceptando las que firmo la de sesiones
  assert.equal(firmaEsValida(conPropia, datos, [propia, sesiones]), true);
  assert.equal(firmaEsValida(conSesiones, datos, [propia, sesiones]), true);
  // sin llave propia: solo la de sesiones
  assert.equal(firmaEsValida(conSesiones, datos, [sesiones]), true);
  assert.equal(firmaEsValida(conPropia, datos, [sesiones]), false);
  // otra llave, otro auditor, otro expediente, otro tipo, firma corta o ausente
  assert.equal(firmaEsValida(firmaDePropiedad(datos, 'x'.repeat(40)), datos, [propia, sesiones]), false);
  assert.equal(firmaEsValida(conPropia, { ...datos, auditorId: 'aud-2' }, [propia, sesiones]), false);
  assert.equal(firmaEsValida(conPropia, { ...datos, expedienteId: 78 }, [propia, sesiones]), false);
  assert.equal(firmaEsValida(conPropia, { ...datos, tipo: 'FOTO_ADICIONAL' }, [propia, sesiones]), false);
  assert.equal(firmaEsValida(conPropia.slice(0, 10), datos, [propia, sesiones]), false);
  assert.equal(firmaEsValida(undefined, datos, [propia, sesiones]), false);
  // llavesDeFirma: la propia va primero (con ella se firma) y se omite si no esta configurada
  assert.deepEqual(llavesDeFirma({ EVIDENCIA_FIRMA_SECRET: propia, JWT_SECRET: sesiones }), [propia, sesiones]);
  assert.deepEqual(llavesDeFirma({ JWT_SECRET: sesiones }), [sesiones]);
});
