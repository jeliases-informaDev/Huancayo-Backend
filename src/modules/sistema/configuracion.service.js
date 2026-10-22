// Ajustes que un administrador cambia desde el panel (tabla configuracion_sistema). Si el ajuste nunca se tocó, vale el valor por
// defecto de las variables de entorno; así un servidor recién instalado se comporta como siempre.
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { empresaActual } from '#core/tenant/contexto.js';

export const CLAVES = Object.freeze({ AUTOASIGNACION: 'autoasignacion', MODO_PRUEBAS: 'modo_pruebas' });
const TTL_MS = 10_000; // el valor se relee cada 10 s: un cambio en el panel llega a todos los procesos del servidor casi al instante
const cache = new Map();

const porDefecto = (clave) => (clave === CLAVES.AUTOASIGNACION ? env.PERMITIR_AUTOASIGNACION === 'true' : false);

// Cada empresa tiene sus ajustes: la caché y la fila se identifican por empresa y clave.
const claveCache = (clave) => `${empresaActual()}:${clave}`;
async function leerBool(clave) {
  const hit = cache.get(claveCache(clave));
  if (hit && Date.now() - hit.en < TTL_MS) return hit.valor;
  const fila = await prisma.configuracionSistema.findFirst({ where: { clave } });
  const valor = fila ? fila.valor === 'true' : porDefecto(clave);
  cache.set(claveCache(clave), { valor, en: Date.now() });
  return valor;
}

export const autoasignacionPermitida = () => leerBool(CLAVES.AUTOASIGNACION);
// Modo pruebas: mientras esté apagado (lo normal) no se puede borrar ningún empleado ni limpiar datos. Cada empresa lo enciende o apaga.
export const modoPruebasActivo = () => leerBool(CLAVES.MODO_PRUEBAS);

// Devuelve el valor anterior y el nuevo, para dejarlos en el registro de auditoría.
async function fijarBool(clave, activa, actorId) {
  const anterior = await leerBool(clave);
  const cambiadas = await prisma.configuracionSistema.updateMany({ where: { clave }, data: { valor: String(activa), actualizado_por: actorId } });
  if (!cambiadas.count) await prisma.configuracionSistema.create({ data: { clave, valor: String(activa), actualizado_por: actorId } });
  cache.set(claveCache(clave), { valor: activa, en: Date.now() });
  return { anterior, nuevo: activa };
}
export const fijarAutoasignacion = (activa, actorId) => fijarBool(CLAVES.AUTOASIGNACION, activa, actorId);
export const fijarModoPruebas = (activa, actorId) => fijarBool(CLAVES.MODO_PRUEBAS, activa, actorId);
