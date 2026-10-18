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
