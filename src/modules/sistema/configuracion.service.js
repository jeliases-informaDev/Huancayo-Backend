// Ajustes que un administrador cambia desde el panel (tabla configuracion_sistema). Si el ajuste nunca se tocó, vale el valor por
// defecto de las variables de entorno; así un servidor recién instalado se comporta como siempre.
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';

export const CLAVES = Object.freeze({ AUTOASIGNACION: 'autoasignacion' });
const TTL_MS = 10_000; // el valor se relee cada 10 s: un cambio en el panel llega a todos los procesos del servidor casi al instante
const cache = new Map();

const porDefecto = (clave) => (clave === CLAVES.AUTOASIGNACION ? env.PERMITIR_AUTOASIGNACION === 'true' : false);

async function leerBool(clave) {
  const hit = cache.get(clave);
  if (hit && Date.now() - hit.en < TTL_MS) return hit.valor;
  const fila = await prisma.configuracionSistema.findUnique({ where: { clave } });
  const valor = fila ? fila.valor === 'true' : porDefecto(clave);
  cache.set(clave, { valor, en: Date.now() });
  return valor;
}

export const autoasignacionPermitida = () => leerBool(CLAVES.AUTOASIGNACION);

// Devuelve el valor anterior y el nuevo, para dejarlos en el registro de auditoría.
export async function fijarAutoasignacion(activa, actorId) {
  const anterior = await autoasignacionPermitida();
  await prisma.configuracionSistema.upsert({
    where: { clave: CLAVES.AUTOASIGNACION },
    create: { clave: CLAVES.AUTOASIGNACION, valor: String(activa), actualizado_por: actorId },
    update: { valor: String(activa), actualizado_por: actorId },
  });
  cache.set(CLAVES.AUTOASIGNACION, { valor: activa, en: Date.now() });
  return { anterior, nuevo: activa };
}
