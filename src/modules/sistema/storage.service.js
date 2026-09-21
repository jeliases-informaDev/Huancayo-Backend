import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { env } from '#core/config/env.js';

// Fase 1: evidencias en disco local del servidor (sin credenciales cloud todavía).
// El contrato "presign + subir + confirmar" se conserva igual que en Afacop, así que
// migrar a S3/Backblaze B2 más adelante solo implica reescribir este archivo.
const TYPES = {
  FOTO_PRINCIPAL: { extension: 'jpg', maxBytes: 4 * 1024 * 1024 },
  FOTO_ADICIONAL: { extension: 'jpg', maxBytes: 4 * 1024 * 1024 },
};

function baseDir() {
  const dir = path.resolve(env.EVIDENCIAS_DIR);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

function datePath(date = new Date()) {
  return [String(date.getUTCFullYear()), String(date.getUTCMonth() + 1).padStart(2, '0'), String(date.getUTCDate()).padStart(2, '0')].join('/');
}

function keyPath(key) {
  const resolved = path.resolve(baseDir(), key);
  if (!resolved.startsWith(baseDir() + path.sep)) {
    throw Object.assign(new Error('Clave de evidencia inválida.'), { statusCode: 400, code: 'INVALID_EVIDENCE_KEY' });
  }
  return resolved;
}

function ownershipSignature({ auditorId, expedienteId, tipo, timestamp, id }) {
  return crypto.createHmac('sha256', env.JWT_SECRET)
    .update([auditorId, Number(expedienteId), tipo, timestamp, id].join(':'))
    .digest('hex').slice(0, 24);
}

function validateOwnedKey(key, auditorId, expedienteId, tipo) {
  const config = TYPES[tipo];
  const filename = typeof key === 'string' ? key.split('/').at(-1) : '';
  const match = filename.match(/^([A-Z_]+)-(\d+)-([0-9a-f-]{36})-([0-9a-f]{24})\.([a-z0-9]+)$/i);
  const [, keyType, timestamp, id, suppliedSignature, extension] = match || [];
  const expectedSignature = match ? ownershipSignature({ auditorId, expedienteId, tipo: keyType, timestamp, id }) : '';
  const validSignature = suppliedSignature && expectedSignature
    && crypto.timingSafeEqual(Buffer.from(suppliedSignature), Buffer.from(expectedSignature));
  if (!config || typeof key !== 'string' || key.includes('..') || keyType !== tipo || extension !== config.extension || !validSignature || key.length > 255) {
    throw Object.assign(new Error(`La evidencia de ${tipo} no es válida para este auditor y expediente.`), { statusCode: 400, code: 'INVALID_EVIDENCE_KEY' });
  }
  return key;
}

function createUpload({ auditorId, expedienteId, tipo, contentType, size }) {
  const config = TYPES[tipo];
  const bytes = Number(size);
  if (!config || contentType !== 'image/jpeg' || !Number.isInteger(bytes) || bytes < 1 || bytes > config.maxBytes) {
    throw Object.assign(new Error('La foto debe ser JPEG y pesar como máximo 4 MB.'), { statusCode: 400, code: 'INVALID_EVIDENCE_FILE' });
  }
  const timestamp = Date.now();
  const id = crypto.randomUUID();
  const signature = ownershipSignature({ auditorId, expedienteId, tipo, timestamp, id });
  const key = `${datePath()}/${expedienteId}/${tipo}-${timestamp}-${id}-${signature}.${config.extension}`;
  const query = new URLSearchParams({ id_expediente: String(expedienteId), tipo }).toString();
  return {
    key,
    uploadUrl: `${env.EVIDENCIAS_BASE_URL}/api/visitas/evidencias/upload/${encodeURIComponent(key)}?${query}`,
    contentType, maxBytes: config.maxBytes, expiresIn: 900,
  };
}

// Firma JPEG (JFIF/Exif): los primeros 3 bytes son siempre FF D8 FF. El Content-Type
// que declara el cliente al pedir la URL firmada no prueba nada del archivo real que
// llega en el PUT — esta comprobación evita guardar como "evidencia" un archivo que
// en realidad no es una fotografía.
function isJpegSignature(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

// Recibe los bytes crudos (PUT) y los escribe en disco. La clave ya trae la firma
// de propiedad; validarla aquí evita que un auditor suba evidencia con la clave de otro.
async function receiveUpload({ key, buffer, auditorId, expedienteId, tipo }) {
  const ownedKey = validateOwnedKey(key, auditorId, expedienteId, tipo);
  const config = TYPES[tipo];
  if (!buffer || buffer.length < 1 || buffer.length > config.maxBytes || !isJpegSignature(buffer)) {
    throw Object.assign(new Error('El archivo recibido no es válido.'), { statusCode: 400, code: 'INVALID_EVIDENCE_FILE' });
  }
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const resolved = keyPath(ownedKey);
  await fsp.mkdir(path.dirname(resolved), { recursive: true, mode: 0o700 });
  await fsp.writeFile(resolved, buffer, { mode: 0o600 });
  return { key: ownedKey, hash, size: buffer.length };
}

// Confirma que la evidencia referenciada en una visita realmente fue subida por este
// auditor para este expediente, y recalcula el hash desde el archivo en disco (nunca
// confiar en un hash enviado por el cliente).
async function verifyUploaded(key, auditorId, expedienteId, tipo) {
  const ownedKey = validateOwnedKey(key, auditorId, expedienteId, tipo);
  const resolved = keyPath(ownedKey);
  let stat;
  try {
    stat = await fsp.stat(resolved);
  } catch {
    throw Object.assign(new Error(`No se encontró la evidencia de ${tipo} cargada correctamente.`), { statusCode: 400, code: 'EVIDENCE_UPLOAD_INCOMPLETE' });
  }
  const config = TYPES[tipo];
  if (!stat.isFile() || stat.size < 1 || stat.size > config.maxBytes) {
    throw Object.assign(new Error(`No se encontró la evidencia de ${tipo} cargada correctamente.`), { statusCode: 400, code: 'EVIDENCE_UPLOAD_INCOMPLETE' });
  }
  const buffer = await fsp.readFile(resolved);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return { key: ownedKey, hash, size: stat.size };
}

function absolutePath(key) {
  if (typeof key !== 'string' || key.includes('..')) {
    throw Object.assign(new Error('Clave de evidencia inválida.'), { statusCode: 400, code: 'INVALID_EVIDENCE_KEY' });
  }
  return keyPath(key);
}

export default { createUpload, receiveUpload, verifyUploaded, absolutePath, TYPES };
