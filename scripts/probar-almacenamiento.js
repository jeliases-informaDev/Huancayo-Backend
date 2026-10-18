// Prueba de punta a punta el almacenamiento de evidencias con la configuración vigente (EVIDENCIAS_BACKEND y S3_*):
// pedir clave → subir → verificar → leer → borrar, y que el bucket no sea público. Sirve para comprobar un bucket nuevo
// (Oracle Object Storage en Sulotec) antes de usarlo. Sube un archivo de 2 KB con forma de JPEG y lo borra al terminar; no toca datos reales.
//   docker exec auditoria-api node scripts/probar-almacenamiento.js
import 'dotenv/config';
import crypto from 'node:crypto';
import { env } from '#core/config/env.js';
import { conEmpresa } from '#core/tenant/contexto.js';
import storageService from '../src/modules/sistema/storage.service.js';

let fallos = 0;
const paso = (nombre, ok, detalle = '') => {
  if (!ok) fallos += 1;
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${nombre}${detalle ? ` - ${detalle}` : ''}`);
};

const enBucket = env.EVIDENCIAS_BACKEND === 's3';
console.log(enBucket
  ? `Destino: bucket ${env.S3_BUCKET} en ${new URL(env.S3_ENDPOINT).host} (${env.S3_REGION})\n`
  : `Destino: disco local ${env.EVIDENCIAS_DIR}\n`);

// Empresa ficticia solo para esta prueba: la clave queda bajo empresa/prueba-almacenamiento/… y se borra al final.
const EMPRESA = 'prueba-almacenamiento';
const auditorId = 'prueba-almacenamiento';
const expedienteId = 1;
const tipo = 'FOTO_PRINCIPAL';
const contenido = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), crypto.randomBytes(2044)]); // 2 KB con forma de JPEG
let key;

await conEmpresa(EMPRESA, async () => {
  try {
    const subida = storageService.createUpload({ auditorId, expedienteId, tipo, contentType: 'image/jpeg', size: contenido.length });
    key = subida.key;
    paso('1. Clave de subida con el prefijo de la empresa', key.startsWith(`empresa/${EMPRESA}/`), key);

    const recibido = await storageService.receiveUpload({ key, buffer: contenido, auditorId, expedienteId, tipo });
    paso('2. Subir la foto', recibido.size === contenido.length, `${recibido.size} bytes`);

    const verificado = await storageService.verifyUploaded(key, auditorId, expedienteId, tipo);
    paso('3. Verificar lo guardado (hash recalculado desde el destino)', verificado.hash === recibido.hash);

    const leido = await storageService.readEvidence(key);
    paso('4. Leer la evidencia y comparar bytes', leido.equals(contenido), `${leido.length} bytes`);

    if (enBucket) {
      const sinFirma = await fetch(`${env.S3_ENDPOINT.replace(/\/$/, '')}/${env.S3_BUCKET}/${key}`);
      paso('5. El bucket NO es público (lectura anónima rechazada)', [401, 403, 404].includes(sinFirma.status), `HTTP ${sinFirma.status}`);
    }
  } catch (error) {
    paso('Error inesperado', false, `${error.name}: ${error.message}`);
  } finally {
    if (key) {
      try { await storageService.borrarEvidencia(key); paso('6. Borrar el archivo de prueba', true); }
      catch (error) { paso('6. Borrar el archivo de prueba', false, error.message); }
    }
  }
});

console.log(fallos === 0 ? '\nTODO BIEN: el almacenamiento sirve para Auditoría de Visitas.' : `\n${fallos} paso(s) fallaron.`);
process.exit(fallos === 0 ? 0 : 1);
