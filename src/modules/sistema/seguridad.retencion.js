// Depuración del registro de seguridad: la tabla crece con cada operación, así que los registros más viejos que AUDITORIA_RETENCION_DIAS se borran por
// lotes (para no bloquear la tabla) y en segundo plano. Es la única forma en que se borra algo de ese registro; con 0 no se depura nunca.
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { logger } from '#core/config/logger.js';
import { sinEmpresa } from '#core/tenant/contexto.js';

const LOTE = 5000;
const MAX_LOTES_POR_CORRIDA = 40; // 200 000 filas por corrida como máximo: si hay más atrasado, sigue en la corrida siguiente
const CADA_MS = 6 * 60 * 60 * 1000;

export async function depurarAuditoria({ dias = env.AUDITORIA_RETENCION_DIAS, lote = LOTE, maxLotes = MAX_LOTES_POR_CORRIDA, ahora = Date.now() } = {}) {
  if (!dias || dias <= 0) return { borrados: 0, omitido: true };
  const limite = new Date(ahora - dias * 24 * 60 * 60 * 1000);
  let borrados = 0;
  for (let i = 0; i < maxLotes; i += 1) {
    const n = Number(await prisma.$executeRaw`DELETE FROM auditoria_seguridad WHERE fecha < ${limite} LIMIT ${lote}`);
    borrados += n;
    if (n < lote) break;
  }
  if (borrados) logger.info({ borrados, dias }, 'auditoria_seguridad_depurada');
  return { borrados, omitido: false };
}

export function iniciarRetencionAuditoria() {
  if (!env.AUDITORIA_RETENCION_DIAS) return;
  const correr = () => sinEmpresa(() => depurarAuditoria()).catch((error) => logger.warn({ err: error.message }, 'auditoria_depuracion_fallo'));
  setTimeout(correr, 90_000).unref();
  setInterval(correr, CADA_MS).unref();
}
