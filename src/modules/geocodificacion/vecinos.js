// Ubicación a partir de nuestras propias visitas (dato de GeoMatrix, sin proveedores externos). Una manzana mide 60–100 m: cuando un auditor ya
// verificó un lote de la Mz. C del AA.HH. X (o un supervisor fijó su ubicación), los demás lotes de esa manzana quedan dentro de la geocerca, así
// que reciben esa ubicación como referencia (MANZANA_VECINA). Si solo hay visitas en la misma zona (otra manzana), queda como sugerencia
// aproximada (ZONA): sirve para llegar y para comprobar que la primera visita se hizo en la zona, no para medir los 100 m.
import prisma from '#core/config/prisma.js';
import { logger } from '#core/config/logger.js';
import { claveManzana, claveZona } from './direcciones.js';

// Ubicaciones que valen como verificadas: las fijó una persona (visita, panel) o venían escritas en la base.
export const ORIGENES_VERIFICADOS = Object.freeze(['PRIMERA_VISITA', 'MANUAL', 'REFERENCIA']);
const MAX_VECINOS = 50;
const SELECT = { id_expediente: true, latitud: true, longitud: true, distrito: true, direccion_componentes: true, ubicacion_origen: true, geo_latitud: true, geo_proveedor: true, geo_estado: true };

/** Punto medio de varias ubicaciones (redondeado a 7 decimales, ~1 cm). */
export function centroide(puntos) {
  const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
  const validos = puntos.map((p) => [num(p.latitud), num(p.longitud)]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (!validos.length) return null;
  const lat = validos.reduce((s, [a]) => s + a, 0) / validos.length;
  const lng = validos.reduce((s, [, b]) => s + b, 0) / validos.length;
  return { latitud: Number(lat.toFixed(7)), longitud: Number(lng.toFixed(7)), puntos: validos.length };
}

// Expedientes verificados de la misma zona (y, si se pide, de la misma manzana) que el dado, dentro de la misma empresa (lo pone el filtro central).
async function verificadosCerca(e, { mismaManzana }) {
  const comp = e.direccion_componentes || {};
  if (!comp.urbanizacion || !e.distrito || (mismaManzana && !comp.manzana)) return [];
  const filas = await prisma.expediente.findMany({
    where: {
      id_expediente: { not: e.id_expediente }, distrito: e.distrito, latitud: { not: null }, ubicacion_origen: { in: [...ORIGENES_VERIFICADOS] },
      AND: [
        { direccion_componentes: { path: '$.urbanizacion', equals: comp.urbanizacion } },
        ...(mismaManzana ? [{ direccion_componentes: { path: '$.manzana', equals: comp.manzana } }] : []),
      ],
    },
    select: SELECT, take: MAX_VECINOS, orderBy: { id_expediente: 'desc' },
  });
  // Doble comprobación con las claves normalizadas (la zona y la manzana escritas de otra forma deben coincidir igual).
  const clave = mismaManzana ? claveManzana : claveZona;
  const propia = clave(comp, e.distrito);
  return filas.filter((f) => clave(f.direccion_componentes, f.distrito) === propia);
}

/** Ubica un expediente sin referencia con lo que ya verificaron otras visitas: 'MANZANA' (queda como referencia), 'ZONA' (solo sugerencia) o null. */
export async function ubicarPorVecinos(e, { actorId = null } = {}) {
  if (e.latitud != null) return null;
  const ahora = new Date();
  const manzana = await verificadosCerca(e, { mismaManzana: true });
  if (manzana.length) {
    const c = centroide(manzana);
    await prisma.expediente.update({
      where: { id_expediente: e.id_expediente },
      data: {
        latitud: c.latitud, longitud: c.longitud, ubicacion_origen: 'MANZANA_VECINA',
        geo_estado: 'LOCALIZADO', geo_confianza: 'MEDIA', geo_precision: 'MANZANA', geo_proveedor: 'vecinos', geo_latitud: c.latitud, geo_longitud: c.longitud, geo_direccion_encontrada: null, geo_fecha: ahora,
      },
    });
    await prisma.expedienteCambio.create({
      data: {
        id_expediente: e.id_expediente, actor_id: actorId, tipo: 'UBICACION',
        cambios: { latitud: { antes: null, despues: c.latitud }, longitud: { antes: null, despues: c.longitud }, ubicacion_origen: { antes: e.ubicacion_origen ?? null, despues: 'MANZANA_VECINA' }, vecinos_verificados: c.puntos },
      },
    });
    return 'MANZANA';
  }
  // Sin vecinos en la manzana, la zona solo sirve como aproximación; no se pisa una sugerencia que ya tenga de otra fuente (p. ej. el mapa).
  if (e.geo_latitud != null && e.geo_proveedor !== 'vecinos') return null;
  const zona = await verificadosCerca(e, { mismaManzana: false });
  if (!zona.length) return null;
  const c = centroide(zona);
  await prisma.expediente.update({
    where: { id_expediente: e.id_expediente },
    // Si la dirección sigue en cola para el mapa, se deja en cola: el mapa puede dar algo mejor y entonces reemplaza esta sugerencia.
    data: { ...(e.geo_estado === 'PENDIENTE' ? {} : { geo_estado: 'LOCALIZADO' }), geo_confianza: 'BAJA', geo_precision: 'ZONA', geo_proveedor: 'vecinos', geo_latitud: c.latitud, geo_longitud: c.longitud, geo_direccion_encontrada: null, geo_fecha: ahora },
  });
  return 'ZONA';
}

/** Tras fijarse la ubicación de un expediente (visita, panel, base): se la pasa a los vecinos de su manzana que aún no tienen referencia y a los de su zona como sugerencia. */
export async function propagarUbicacionAVecinos(idExpediente, { actorId = null } = {}) {
  const r = { manzana: 0, zona: 0 };
  try {
    const e = await prisma.expediente.findUnique({ where: { id_expediente: idExpediente }, select: SELECT });
    if (!e || e.latitud == null || !ORIGENES_VERIFICADOS.includes(e.ubicacion_origen)) return r;
    const comp = e.direccion_componentes || {};
    if (!comp.urbanizacion || !e.distrito) return r;
    const candidatos = await prisma.expediente.findMany({
      where: { id_expediente: { not: e.id_expediente }, distrito: e.distrito, latitud: null, direccion_componentes: { path: '$.urbanizacion', equals: comp.urbanizacion } },
      select: SELECT, take: 500,
    });
    for (const c of candidatos) {
      const nivel = await ubicarPorVecinos(c, { actorId });
      if (nivel === 'MANZANA') r.manzana += 1; else if (nivel === 'ZONA') r.zona += 1;
    }
    if (r.manzana || r.zona) logger.info({ expediente: idExpediente, ...r }, 'ubicacion_propagada_a_vecinos');
  } catch (error) {
    logger.warn({ err: error, expediente: idExpediente }, 'ubicacion_vecinos_fallo');
  }
  return r;
}

/** Para los expedientes recién cargados sin coordenadas: intenta ubicarlos con lo ya verificado. Nunca hace fallar la carga. */
export async function ubicarNuevosPorVecinos(ids, { actorId = null } = {}) {
  const r = { manzana: 0, zona: 0 };
  if (!ids.length) return r;
  try {
    const filas = await prisma.expediente.findMany({ where: { id_expediente: { in: ids }, latitud: null }, select: SELECT });
    for (const e of filas) {
      const nivel = await ubicarPorVecinos(e, { actorId });
      if (nivel === 'MANZANA') r.manzana += 1; else if (nivel === 'ZONA') r.zona += 1;
    }
    if (r.manzana || r.zona) logger.info(r, 'nuevos_ubicados_por_vecinos');
  } catch (error) {
    logger.warn({ err: error }, 'ubicacion_vecinos_fallo');
  }
  return r;
}
