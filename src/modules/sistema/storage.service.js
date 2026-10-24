import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { env } from '#core/config/env.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { almacenS3 } from './storage.s3.js';

// Evidencias (fotos de las visitas). Dos destinos, elegidos por EVIDENCIAS_BACKEND:
//   · local: disco del servidor (desarrollo y demo);
//   · s3: un bucket compatible con S3 (Oracle Object Storage en Sulotec, también Backblaze/AWS).
// El contrato "pedir clave + subir + confirmar" es el mismo en ambos y cada clave lleva el prefijo de su empresa (empresa/<id>/…), así
// que cambiar de destino no cambia nada en la app ni en la base.
const TYPES = {
  FOTO_PRINCIPAL: { extension: 'jpg', maxBytes: 4 * 1024 * 1024 },
  FOTO_ADICIONAL: { extension: 'jpg', maxBytes: 4 * 1024 * 1024 },
};

const usaBucket = () => env.EVIDENCIAS_BACKEND === 's3';

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

// La firma de la clave de una evidencia prueba que la emitio este servidor para ese auditor, expediente y tipo. Se firma con EVIDENCIA_FIRMA_SECRET si
// existe (llave propia, distinta de la de las sesiones) y si no con JWT_SECRET. Al validar se aceptan las dos, para no perder las visitas que un celular
// tenia en cola con claves firmadas antes del cambio.
export function llavesDeFirma(entorno = env) {
  return [entorno.EVIDENCIA_FIRMA_SECRET, entorno.JWT_SECRET].filter(Boolean);
}

export function firmaDePropiedad({ auditorId, expedienteId, tipo, timestamp, id }, llave) {
  return crypto.createHmac('sha256', llave)
    .update([auditorId, Number(expedienteId), tipo, timestamp, id].join(':'))
    .digest('hex').slice(0, 24);
}

export function firmaEsValida(suministrada, datos, llaves = llavesDeFirma()) {
  if (typeof suministrada !== 'string') return false;
  return llaves.some((llave) => {
    const esperada = firmaDePropiedad(datos, llave);
    return suministrada.length === esperada.length && crypto.timingSafeEqual(Buffer.from(suministrada), Buffer.from(esperada));
  });
}

const ownershipSignature = (datos) => firmaDePropiedad(datos, llavesDeFirma()[0]);

// Clave de una evidencia nueva: empresa/<id de empresa>/aaaa/mm/dd/<expediente>/<tipo>-<momento>-<id>-<firma>.jpg
export function claveEvidencia({ empresaId, expedienteId, tipo, timestamp, id, signature, extension, date }) {
  return `empresa/${empresaId}/${datePath(date)}/${expedienteId}/${tipo}-${timestamp}-${id}-${signature}.${extension}`;
}

function validateOwnedKey(key, auditorId, expedienteId, tipo) {
  const config = TYPES[tipo];
  const filename = typeof key === 'string' ? key.split('/').at(-1) : '';
  const match = filename.match(/^([A-Z_]+)-(\d+)-([0-9a-f-]{36})-([0-9a-f]{24})\.([a-z0-9]+)$/i);
  const [, keyType, timestamp, id, suppliedSignature, extension] = match || [];
  const validSignature = match && firmaEsValida(suppliedSignature, { auditorId, expedienteId, tipo: keyType, timestamp, id });
  // La clave debe ser de la empresa de la petición: ni siquiera con una firma válida se toca una evidencia de otra empresa.
  const deEstaEmpresa = typeof key === 'string' && key.startsWith(`empresa/${empresaActual()}/`);
  if (!config || typeof key !== 'string' || key.includes('..') || keyType !== tipo || extension !== config.extension || !validSignature || key.length > 255 || !deEstaEmpresa) {
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
  const key = claveEvidencia({ empresaId: empresaActual(), expedienteId, tipo, timestamp, id, signature, extension: config.extension });
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

async function guardarBytes(key, buffer) {
  if (usaBucket()) { await almacenS3().subir(key, buffer, 'image/jpeg'); return; }
  const resolved = keyPath(key);
  await fsp.mkdir(path.dirname(resolved), { recursive: true, mode: 0o700 });
  await fsp.writeFile(resolved, buffer, { mode: 0o600 });
}

// Devuelve los bytes de una evidencia (o null si no existe), venga del disco o del bucket.
async function leerBytes(key) {
  if (usaBucket()) return almacenS3().leer(key);
  try { return await fsp.readFile(keyPath(key)); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Recibe los bytes crudos (PUT) y los guarda. La clave ya trae la firma de propiedad;
// validarla aquí evita que un auditor suba evidencia con la clave de otro.
async function receiveUpload({ key, buffer, auditorId, expedienteId, tipo }) {
  const ownedKey = validateOwnedKey(key, auditorId, expedienteId, tipo);
  const config = TYPES[tipo];
  if (!buffer || buffer.length < 1 || buffer.length > config.maxBytes || !isJpegSignature(buffer)) {
    throw Object.assign(new Error('El archivo recibido no es válido.'), { statusCode: 400, code: 'INVALID_EVIDENCE_FILE' });
  }
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  await guardarBytes(ownedKey, buffer);
  return { key: ownedKey, hash, size: buffer.length };
}

// Confirma que la evidencia referenciada en una visita realmente fue subida por este
// auditor para este expediente, y recalcula el hash desde lo guardado (nunca confiar
// en un hash enviado por el cliente).
async function verifyUploaded(key, auditorId, expedienteId, tipo) {
  const ownedKey = validateOwnedKey(key, auditorId, expedienteId, tipo);
  const config = TYPES[tipo];
  const buffer = await leerBytes(ownedKey);
  if (!buffer || buffer.length < 1 || buffer.length > config.maxBytes) {
    throw Object.assign(new Error(`No se encontró la evidencia de ${tipo} cargada correctamente.`), { statusCode: 400, code: 'EVIDENCE_UPLOAD_INCOMPLETE' });
  }
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return { key: ownedKey, hash, size: buffer.length };
}

// Bytes de una evidencia ya registrada, para servirla al panel. La clave viene de la base (de la fila de la propia empresa).
async function readEvidence(key) {
  if (typeof key !== 'string' || key.includes('..')) {
    throw Object.assign(new Error('Clave de evidencia inválida.'), { statusCode: 400, code: 'INVALID_EVIDENCE_KEY' });
  }
  const buffer = await leerBytes(key);
  if (!buffer) throw Object.assign(new Error('Evidencia no encontrada'), { statusCode: 404, code: 'NOT_FOUND' });
  return buffer;
}

// Borra una evidencia. Solo para mantenimiento, para la prueba de almacenamiento (scripts/probar-almacenamiento.js) y para el modo pruebas
// (borrar un empleado o limpiar los datos cargados, con confirmación y solo si la empresa lo encendió): fuera de eso el sistema nunca
// borra evidencias de visitas.
async function borrarEvidencia(key) {
  if (typeof key !== 'string' || key.includes('..')) {
    throw Object.assign(new Error('Clave de evidencia inválida.'), { statusCode: 400, code: 'INVALID_EVIDENCE_KEY' });
  }
  if (usaBucket()) { await almacenS3().borrar(key); return; }
  await fsp.rm(keyPath(key), { force: true });
}

export default { createUpload, receiveUpload, verifyUploaded, readEvidence, borrarEvidencia, TYPES };
