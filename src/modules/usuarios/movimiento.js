// Estado de movimiento del auditor a partir de sus últimos puntos (ya guardados en tracking_ubicacion), sin pedirle nada
// más al celular: «detenido hace 14 min», «a pie · 4 km/h» o «en vehículo · 28 km/h». Lógica pura, para probarla sola.
import { haversineMeters } from '#core/security/geofence.js';

export const RADIO_DETENIDO_M = 40; // el GPS «baila» unos metros aun estando quieto
export const MINUTOS_DETENIDO = 3;
export const VENTANA_VELOCIDAD_S = 120;
export const TRAMO_MINIMO_S = 3; // con menos tiempo entre puntos (ráfaga de envíos) la velocidad no es confiable
// Más rápido que esto en un tramo corto no es un desplazamiento real: es un salto del GPS (mala señal o ubicación simulada).
export const LIMITE_SALTO_KMH = 180;
export const LIMITE_A_PIE_KMH = 9; // caminando se llega a ~7 km/h; un mototaxi o un carro urbano superan esto
export const SIN_DATOS = { estado: 'SIN_DATOS', desde: null, velocidad_kmh: null, modo: null };

const ms = (f) => (f instanceof Date ? f.getTime() : typeof f === 'number' ? f : Date.parse(f));

// puntos: [{ latitud, longitud, fecha }] en orden cronológico (los de GPS simulado no deben entrar).
// ahoraMs: si el último punto es más viejo que 5 min no se opina (el panel ya avisa «sin señal»).
export function estadoDeMovimiento(puntos, ahoraMs = Date.now()) {
  if (!Array.isArray(puntos) || puntos.length < 2) return SIN_DATOS;
  const ultimo = puntos[puntos.length - 1];
  const tUltimo = ms(ultimo.fecha);
  if (!Number.isFinite(tUltimo) || ahoraMs - tUltimo > 5 * 60 * 1000) return SIN_DATOS;

  // ¿Cuánto lleva en el mismo lugar? Se retrocede mientras los puntos sigan dentro del radio del último.
  let i = puntos.length - 1;
  while (i > 0 && haversineMeters(puntos[i - 1].latitud, puntos[i - 1].longitud, ultimo.latitud, ultimo.longitud) <= RADIO_DETENIDO_M) i -= 1;
  const desde = ms(puntos[i].fecha);
  if (i < puntos.length - 1 && tUltimo - desde >= MINUTOS_DETENIDO * 60 * 1000) {
    return { estado: 'DETENIDO', desde: new Date(desde).toISOString(), velocidad_kmh: 0, modo: null };
  }

  // En movimiento: velocidad media del tramo recorrido en los últimos 2 min.
  const inicio = tUltimo - VENTANA_VELOCIDAD_S * 1000;
  let j = puntos.length - 1;
  while (j > 0 && ms(puntos[j - 1].fecha) >= inicio) j -= 1;
  let metros = 0;
  for (let k = j; k < puntos.length - 1; k += 1) metros += haversineMeters(puntos[k].latitud, puntos[k].longitud, puntos[k + 1].latitud, puntos[k + 1].longitud);
  const segundos = (tUltimo - ms(puntos[j].fecha)) / 1000;
  if (segundos < TRAMO_MINIMO_S) return { estado: 'EN_MOVIMIENTO', desde: null, velocidad_kmh: null, modo: null };
  const kmh = Math.round((metros / segundos) * 3.6 * 10) / 10;
  return { estado: 'EN_MOVIMIENTO', desde: null, velocidad_kmh: kmh, modo: kmh < 2 ? null : kmh < LIMITE_A_PIE_KMH ? 'A_PIE' : kmh <= LIMITE_SALTO_KMH ? 'VEHICULO' : 'SALTO_GPS' };
}
