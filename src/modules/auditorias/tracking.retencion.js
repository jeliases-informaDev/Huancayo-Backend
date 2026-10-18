// Depuración de los puntos GPS: tracking_ubicacion recibe un punto cada ~15 s por auditor en jornada, así que crece sin parar. Se borran los
// más antiguos que TRACKING_RETENCION_DIAS, por lotes (para no bloquear la tabla) y en segundo plano. Con 0 no se depura nada.
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { logger } from '#core/config/logger.js';
import { sinEmpresa } from '#core/tenant/contexto.js';

const LOTE = 5000;
const MAX_LOTES_POR_CORRIDA = 40; // 200 000 filas por corrida como máximo: si hay más atrasado, sigue en la corrida siguiente
const CADA_MS = 6 * 60 * 60 * 1000;

export async function depurarTracking({ dias = env.TRACKING_RETENCION_DIAS, lote = LOTE, maxLotes = MAX_LOTES_POR_CORRIDA } = {}) {
  if (!dias || dias <= 0) return { borrados: 0, omitido: true };
  const limite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  let borrados = 0;
  for (let i = 0; i < maxLotes; i += 1) {
    const n = Number(await prisma.$executeRaw`DELETE FROM tracking_ubicacion WHERE registrado_en < ${limite} LIMIT ${lote}`);
    borrados += n;
    if (n < lote) break;
  }
  if (borrados) logger.info({ borrados, dias }, 'tracking_depurado');
  return { borrados, omitido: false };
}

export function iniciarRetencionTracking() {
  if (!env.TRACKING_RETENCION_DIAS) return;
  const correr = () => sinEmpresa(() => depurarTracking()).catch((error) => logger.warn({ err: error.message }, 'tracking_depuracion_fallo'));
  setTimeout(correr, 60_000).unref();
  setInterval(correr, CADA_MS).unref();
}
