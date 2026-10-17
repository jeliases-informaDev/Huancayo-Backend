// Lógica pura de los avisos de llegada y salida (sin base de datos ni variables de entorno, para probarla sola).
import { haversineMeters } from '#core/security/geofence.js';
import { negociosDe, puntoDeReferencia } from '#modules/expedientes/ubicaciones.js';

export const FACTOR_SALIDA = 1.5;
export const claveDe = (idExpediente, punto) => `${idExpediente}|${punto}`;

// Puntos con coordenadas de un caso: «DOMICILIO» y, en créditos MYPE, «NEGOCIO:n».
export function puntosDeCaso(expediente, { soloSalida = false } = {}) {
  const lista = [];
  const domicilio = puntoDeReferencia(expediente, 'DOMICILIO');
  if (domicilio.latitud !== null && domicilio.longitud !== null) lista.push({ id_expediente: expediente.id_expediente, punto: 'DOMICILIO', direccion: domicilio.direccion, latitud: domicilio.latitud, longitud: domicilio.longitud, soloSalida });
  negociosDe(expediente).forEach((_n, indice) => {
    const negocio = puntoDeReferencia(expediente, 'NEGOCIO', indice);
    if (negocio && negocio.latitud !== null && negocio.longitud !== null) lista.push({ id_expediente: expediente.id_expediente, punto: `NEGOCIO:${indice}`, direccion: negocio.direccion, latitud: negocio.latitud, longitud: negocio.longitud, soloSalida });
  });
  return lista;
}

// Decide qué avisos corresponden a una posición. Función pura (sin base de datos) para poder probarla sola.
//   dentro: Set de «idExpediente|punto» donde el auditor ya figura como llegado.
export function decidirEventos({ latitud, longitud, precision = null, simulada = false, puntos, dentro = new Set(), radio }) {
  // Una posición simulada o muy imprecisa no prueba que alguien llegó ni que se fue.
  if (simulada || (precision !== null && precision > radio)) return [];
  const eventos = [];
  for (const p of puntos) {
    const distancia = haversineMeters(latitud, longitud, p.latitud, p.longitud);
    const estaDentro = dentro.has(claveDe(p.id_expediente, p.punto));
    if (!estaDentro && !p.soloSalida && distancia <= radio) eventos.push({ tipo: 'LLEGADA', id_expediente: p.id_expediente, punto: p.punto, distancia_m: Math.round(distancia) });
    else if (estaDentro && distancia > radio * FACTOR_SALIDA) eventos.push({ tipo: 'SALIDA', id_expediente: p.id_expediente, punto: p.punto, distancia_m: Math.round(distancia) });
  }
  return eventos;
}

