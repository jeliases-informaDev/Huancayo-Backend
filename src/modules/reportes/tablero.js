import { cubetasDe, agruparPorCubeta, aFecha, aIso } from './actividad.js';

// Armado del tablero del Resumen. Funciones puras (sin base de datos): las tarjetas, el gráfico y el ranking de auditores salen de UNA misma ventana
// de fechas y de los mismos conteos por día, y por eso coinciden: el total de cada tarjeta es exactamente el total que dibuja el gráfico.

const DIA_MS = 24 * 60 * 60 * 1000;

export const RESULTADOS = ['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO'];
const TIPO_DE_FICHA = { MYPE_V1: 'MYPE', CONSUMO_V1: 'CONSUMO' };
export const MAX_RANKING = 50;
// Nivel de cada auditor frente al promedio del equipo en el mismo tramo: destacado desde el 125 % del promedio, por debajo bajo el 75 %.
export const UMBRAL_DESTACADO = 1.25;
export const UMBRAL_BAJO = 0.75;

// La ventana del tramo (7 días, 8 bloques de 7 días o 6 meses de calendario terminando en `hasta`) y la anterior, que tiene los MISMOS días y termina
// la víspera: así «subió o bajó» compara lo mismo con lo mismo (un mes a medias contra meses enteros engañaría).
export function ventanas(periodo, hasta) {
  const cubetas = cubetasDe(periodo, hasta);
  const desde = cubetas[0].inicio;
  const dias = Math.round((aFecha(hasta).getTime() - aFecha(desde).getTime()) / DIA_MS) + 1;
  return {
    cubetas, desde, hasta, dias,
    desdeAnterior: aIso(new Date(aFecha(desde).getTime() - dias * DIA_MS)),
    hastaAnterior: aIso(new Date(aFecha(desde).getTime() - DIA_MS)),
  };
}

// Suma los días de `porDia` (Map AAAA-MM-DD → n) entre dos fechas, ambas incluidas.
export function sumarRango(porDia, desde, hasta) {
  let total = 0;
  for (let d = aFecha(desde); aIso(d) <= hasta; d = new Date(d.getTime() + DIA_MS)) total += porDia.get(aIso(d)) || 0;
  return total;
}

// Una serie lista para dibujar: los puntos del gráfico, su total (lo que muestra la tarjeta) y el total del tramo anterior.
export function armarSerie(v, porDia) {
  const puntos = agruparPorCubeta(v.cubetas, porDia);
  return { total: puntos.reduce((s, p) => s + p.total, 0), anterior: sumarRango(porDia, v.desdeAnterior, v.hastaAnterior), puntos };
}

const sinResultados = () => ({ CONFORME: 0, OBSERVADO: 0, NO_UBICADO: 0, RECHAZADO: 0 });

// Visitas del tramo por resultado, de TODOS los auditores (aunque el ranking muestre solo a los primeros).
export function resultadosDe(conteos = []) {
  const r = sinResultados();
  for (const c of conteos) if (c.resultado in r) r[c.resultado] += Number(c.n) || 0;
  return r;
}

export function nivelDe(visitas, promedio) {
  if (!visitas) return 'SIN_VISITAS';
  if (!(promedio > 0)) return 'PROMEDIO';
  const razon = visitas / promedio;
  if (razon >= UMBRAL_DESTACADO) return 'DESTACADO';
  if (razon < UMBRAL_BAJO) return 'BAJO';
  return 'PROMEDIO';
}

// Ranking de auditores por visitas en el tramo, con sus categorías: cuántas fueron conformes, observadas, no ubicadas y rechazadas, y de qué ficha
// (MYPE o Consumo). `conteos`: [{ id, resultado, plantilla, n }] (una fila por auditor, resultado y ficha); `anteriores`: Map id → visitas del tramo
// anterior; `auditores`: [{ id, nombre, usuario, zona, activo }] (los activos más cualquiera que haya visitado en el tramo).
export function armarRanking({ conteos = [], anteriores = new Map(), auditores = [], max = MAX_RANKING } = {}) {
  const por = new Map();
  for (const a of auditores) {
    por.set(a.id, {
      id: a.id, nombre: a.nombre, usuario: a.usuario ?? null, zona: a.zona ?? null, activo: a.activo !== false,
      visitas: 0, resultados: sinResultados(), tipos: { MYPE: 0, CONSUMO: 0 }, anterior: anteriores.get(a.id) || 0,
    });
  }
  for (const c of conteos) {
    const fila = por.get(c.id);
    if (!fila) continue;
    const n = Number(c.n) || 0;
    fila.visitas += n;
    if (c.resultado in fila.resultados) fila.resultados[c.resultado] += n;
    const tipo = TIPO_DE_FICHA[c.plantilla];
    if (tipo) fila.tipos[tipo] += n;
  }
  // Más visitas primero; con las mismas, más conformes; y por último el nombre, para que el orden no cambie de una carga a otra.
  const lista = [...por.values()].sort((x, y) => y.visitas - x.visitas || y.resultados.CONFORME - x.resultados.CONFORME || String(x.nombre).localeCompare(String(y.nombre), 'es'));
  const promedio = lista.length ? lista.reduce((s, f) => s + f.visitas, 0) / lista.length : 0;
  return {
    promedio: Math.round(promedio * 10) / 10,
    total_auditores: lista.length,
    con_visitas: lista.filter((f) => f.visitas > 0).length,
    auditores: lista.slice(0, max).map((f, i) => ({
      ...f,
      posicion: i + 1,
      efectividad: f.visitas ? Math.round((1000 * f.resultados.CONFORME) / f.visitas) / 10 : null, // % de visitas conformes
      nivel: nivelDe(f.visitas, promedio),
    })),
  };
}
