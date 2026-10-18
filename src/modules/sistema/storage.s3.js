// Bucket compatible con S3 para las evidencias (Oracle Object Storage en Sulotec; también sirve Backblaze o AWS). Solo se usa con
// EVIDENCIAS_BACKEND=s3. Oracle necesita direcciones por ruta (forcePathStyle) y sumas de verificación solo cuando se piden.
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '#core/config/env.js';

let cliente = null;

export function configuracionS3(e = env) {
  const faltan = ['S3_BUCKET', 'S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'].filter((k) => !e[k]);
  if (faltan.length) throw new Error(`EVIDENCIAS_BACKEND=s3 requiere ${faltan.join(', ')}`);
  return {
    bucket: e.S3_BUCKET,
    client: {
      endpoint: e.S3_ENDPOINT, region: e.S3_REGION, forcePathStyle: e.S3_FORCE_PATH_STYLE !== 'false',
      credentials: { accessKeyId: e.S3_ACCESS_KEY_ID, secretAccessKey: e.S3_SECRET_ACCESS_KEY },
      requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED',
    },
  };
}

function conexion() {
  if (cliente) return cliente;
  const c = configuracionS3();
  cliente = { bucket: c.bucket, s3: new S3Client(c.client) };
  return cliente;
}

export function almacenS3() {
  return {
    async subir(key, buffer, contentType) {
      const { bucket, s3 } = conexion();
      await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
    },
    // null si el objeto no existe.
    async leer(key) {
      const { bucket, s3 } = conexion();
      try {
        const r = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        return Buffer.from(await r.Body.transformToByteArray());
      } catch (error) {
        if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) return null;
        throw error;
      }
    },
  };
}
