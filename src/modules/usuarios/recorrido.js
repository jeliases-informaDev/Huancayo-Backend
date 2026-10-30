// Limpieza del recorrido GPS de un auditor (lógica pura, sin base de datos, para probarla sola). El celular manda una posición cada ~15 s y no todas
// sirven: bajo techo o dentro de un vehículo el GPS se pierde y Android devuelve posiciones por antena o wifi (cientos de metros de error), y de vez en
// cuando llega una posición imposible (un «salto»). Dibujadas tal cual, esas posiciones salen como rectas largas que van y vuelven desde donde el
// auditor estaba de verdad. Aquí se ordena por la hora real del celular, se descartan los puntos simulados, los imprecisos (peores que la regla de la
// empresa, precision_maxima_m) y los saltos, se corta el recorrido donde hubo pausas largas sin señal y se reducen los puntos para pedirle al motor
// de rutas que los ajuste a las calles. La misma regla vale al recibir cada punto (visitas.service.js) y al leer recorridos ya guardados.
import { haversineMeters } from '#core/security/geofence.js';

export const PRECISION_MAXIMA_M = 100; // si la empresa no tiene regla propia
export const SALTO_KMH = 180; // como en movimiento.js: más rápido que esto no es un desplazamiento real
export const TRAMO_MINIMO_S = 3; // con menos tiempo entre dos puntos la velocidad no se puede calcular
export const SALTO_INSTANTANEO_M = 150; // dos puntos casi simultáneos a más de esto: uno de los dos no es real
export const RUIDO_M = 50; // el GPS «baila» unos metros aun estando quieto: menos de esto nunca es un salto
export const PAUSA_S = 300; // más de 5 min sin puntos: el recorrido se corta ahí (no se une con una recta)
export const SIMPLIFICAR_M = 20; // al ajustar a calles, un punto a menos de esto del anterior conservado no aporta

const ms = (f) => (f instanceof Date ? f.getTime() : typeof f === 'number' ? f : Date.parse(f));

// ¿`punto` es un salto respecto del último punto bueno `anterior`?
export function esSalto(anterior, punto, { saltoKmh = SALTO_KMH } = {}) {
  const metros = haversineMeters(anterior.latitud, anterior.longitud, punto.latitud, punto.longitud);
  if (metros <= RUIDO_M) return false;
  const segundos = Math.abs(ms(punto.fecha) - ms(anterior.fecha)) / 1000;
  if (segundos < TRAMO_MINIMO_S) return metros > SALTO_INSTANTANEO_M;
  return (metros / segundos) * 3.6 > saltoKmh;
}

// Decide si un punto entra al recorrido. `anterior` es el último aceptado y `pendiente` el último apartado por salto. Un salto se aparta; si el punto
// siguiente también es un salto respecto del anterior pero coincide con el apartado, entran los dos: el auditor sí se movió (o el punto anterior era el
// malo). Así un punto malo nunca deja fuera a los buenos que vienen después.
export function decidirPunto(anterior, pendiente, punto, opciones) {
  if (!anterior || !esSalto(anterior, punto, opciones)) return { entran: [punto], pendiente: null };
  if (pendiente && !esSalto(pendiente, punto, opciones)) return { entran: [pendiente, punto], pendiente: null };
  return { entran: [], pendiente: punto };
}

// La hora que vale de un punto: la del celular (capturado_en) y, para las apps anteriores que no la mandan, la de llegada al servidor.
export const fechaDePunto = (p) => p.capturado_en ?? p.fecha ?? p.registrado_en;

// puntos: [{ latitud, longitud, precision, simulada, fecha | capturado_en | registrado_en }] en cualquier orden.
// Devuelve los puntos buenos en orden cronológico (con `fecha` como Date) y cuántos se descartaron por cada motivo.
export function limpiarRecorrido(puntos, { precisionMaxima = PRECISION_MAXIMA_M, saltoKmh = SALTO_KMH } = {}) {
  const ordenados = (Array.isArray(puntos) ? puntos : [])
    .map((p) => ({ ...p, latitud: Number(p.latitud), longitud: Number(p.longitud), fecha: new Date(ms(fechaDePunto(p))) }))
    .filter((p) => Number.isFinite(p.fecha.getTime()) && Number.isFinite(p.latitud) && Number.isFinite(p.longitud))
    .sort((a, b) => a.fecha - b.fecha);
  const descartados = { simulados: 0, imprecisos: 0, saltos: 0 };
  const limpios = [];
  let pendiente = null;
  for (const p of ordenados) {
    if (p.simulada) { descartados.simulados += 1; continue; }
    if (p.precision != null && Number(p.precision) > precisionMaxima) { descartados.imprecisos += 1; continue; }
    const r = decidirPunto(limpios[limpios.length - 1] || null, pendiente, p, { saltoKmh });
    if (!r.entran.length) descartados.saltos += 1;
    else if (r.entran.length === 2) descartados.saltos -= 1; // el apartado resultó bueno
    limpios.push(...r.entran);
    pendiente = r.pendiente;
  }
  return { puntos: limpios, descartados };
}

// Numera los tramos: uno nuevo cada vez que pasan más de `pausaS` segundos sin puntos (sin señal, sin batería o app cerrada).
export function numerarTramos(puntos, { pausaS = PAUSA_S } = {}) {
  let tramo = 0;
  return puntos.map((p, i) => {
    if (i === 0 || ms(p.fecha) - ms(puntos[i - 1].fecha) > pausaS * 1000) tramo += 1;
    return { ...p, tramo };
  });
}

// Menos puntos para el motor de rutas: se conserva el primero, cada punto que se alejó al menos `distanciaMin` metros del último conservado y el
// último. Si aun así son más de `maximo`, se toma uno de cada tantos.
export function simplificarRecorrido(puntos, { distanciaMin = SIMPLIFICAR_M, maximo = 1500 } = {}) {
  if (!Array.isArray(puntos) || puntos.length < 3) return [...(puntos || [])];
  const salida = [puntos[0]];
  for (let i = 1; i < puntos.length - 1; i += 1) {
    const u = salida[salida.length - 1];
    if (haversineMeters(u.latitud, u.longitud, puntos[i].latitud, puntos[i].longitud) >= distanciaMin) salida.push(puntos[i]);
  }
  salida.push(puntos[puntos.length - 1]);
  if (salida.length <= maximo) return salida;
  const paso = Math.ceil(salida.length / maximo);
  return salida.filter((_, i) => i % paso === 0 || i === salida.length - 1);
}
