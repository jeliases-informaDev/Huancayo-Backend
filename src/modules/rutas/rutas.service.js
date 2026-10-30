// Rutas por calles para la app y el panel, con un motor OSRM propio (mapas de OpenStreetMap de Perú en el servidor de Sulotec; ver apps/auditoria
// en Sulotec-infra). Sin OSRM_URL no hay motor: todo devuelve «no disponible» y la app y el panel dibujan rectas, como antes. Al motor solo van
// coordenadas y horas, nunca nombres ni expedientes.
import { logger } from '#core/config/logger.js';
import { rutaPorCalles, ajustarACalles } from './osrm.js';

const motor = () => String(process.env.OSRM_URL || '').trim();
export const rutasDisponibles = () => Boolean(motor());

// Ruta sugerida entre el auditor y sus paradas, en ese orden. null = sin motor o motor caído (el que pide dibuja rectas).
export async function trazarRuta(paradas) {
  if (!rutasDisponibles() || !Array.isArray(paradas) || paradas.length < 2) return null;
  try { return await rutaPorCalles(motor(), paradas); } catch (error) { logger.warn({ err: error.message }, 'ruta_calles_fallo'); return null; }
}

// Recorrido real ajustado a las calles: [{ coordenadas, confianza, distancia_m }] o null si no hay motor o falló.
export async function ajustarRecorrido(puntos) {
  if (!rutasDisponibles() || !Array.isArray(puntos) || puntos.length < 2) return null;
  try { return await ajustarACalles(motor(), puntos); } catch (error) { logger.warn({ err: error.message }, 'ajuste_recorrido_fallo'); return null; }
}
