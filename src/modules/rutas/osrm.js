// Cliente del motor de rutas OSRM (lógica pura: arma las consultas y lee las respuestas; quien lo usa decide la dirección del motor y qué hacer si
// falla). OSRM habla en «longitud,latitud»; aquí todo entra como { latitud, longitud } y sale como [latitud, longitud], que es lo que dibujan los mapas.
export const MAX_PARADAS = 60; // paradas por ruta sugerida (el motor arranca con --max-viaroute-size 200)
export const MAX_PUNTOS_AJUSTE = 300; // puntos por consulta de ajuste (el motor arranca con --max-matching-size 500)
export const TIEMPO_MS = 8000;

const coordenadas = (puntos) => puntos.map((p) => `${Number(p.longitud).toFixed(6)},${Number(p.latitud).toFixed(6)}`).join(';');
const aLatLng = (geometria) => (geometria?.coordinates || []).map(([lng, lat]) => [Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6]);

export class ErrorOsrm extends Error {
  constructor(codigo, mensaje) {
    super('OSRM ' + codigo + (mensaje ? ': ' + mensaje : ''));
    this.codigo = codigo;
  }
}

async function consultar(baseUrl, ruta, fetchFn) {
  const r = await fetchFn(String(baseUrl).replace(/\/$/, '') + ruta, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(TIEMPO_MS) });
  const j = await r.json().catch(() => null);
  if (!j || j.code !== 'Ok') throw new ErrorOsrm(j?.code || `HTTP ${r.status}`, j?.message);
  return j;
}

// Ruta por calles pasando por las paradas en ese orden: la línea [lat, lng], metros y segundos totales y de cada tramo entre paradas.
export async function rutaPorCalles(baseUrl, paradas, { fetchFn = fetch } = {}) {
  const lista = paradas.slice(0, MAX_PARADAS);
  const j = await consultar(baseUrl, `/route/v1/driving/${coordenadas(lista)}?overview=simplified&geometries=geojson&steps=false&annotations=false`, fetchFn);
  const ruta = j.routes?.[0];
  if (!ruta) return null;
  return {
    coordenadas: aLatLng(ruta.geometry), distancia_m: Math.round(ruta.distance), duracion_s: Math.round(ruta.duration),
    tramos: (ruta.legs || []).map((l) => ({ distancia_m: Math.round(l.distance), duracion_s: Math.round(l.duration) })),
  };
}

// Ajusta a las calles un tramo del recorrido real (map matching): devuelve una línea por cada parte que el motor logró casar. Los puntos van con su
// hora (el motor exige horas crecientes) y con su precisión como radio de búsqueda. Con más de MAX_PUNTOS_AJUSTE se consulta por partes, repitiendo
// el último punto de una en la siguiente. Una parte sin calles cerca (NoMatch) simplemente no devuelve línea; cualquier otro fallo se propaga.
export async function ajustarACalles(baseUrl, puntos, { fetchFn = fetch } = {}) {
  const lineas = [];
  for (let i = 0; i < puntos.length - 1; i += MAX_PUNTOS_AJUSTE - 1) {
    const parte = puntos.slice(i, i + MAX_PUNTOS_AJUSTE);
    if (parte.length < 2) break;
    const horas = parte.map((p) => Math.floor(new Date(p.fecha).getTime() / 1000));
    for (let k = 1; k < horas.length; k += 1) if (!(horas[k] > horas[k - 1])) horas[k] = horas[k - 1] + 1;
    const radios = parte.map((p) => Math.min(50, Math.max(10, Math.round(Number(p.precision) || 15))));
    try {
      const j = await consultar(baseUrl, `/match/v1/driving/${coordenadas(parte)}?timestamps=${horas.join(';')}&radiuses=${radios.join(';')}&overview=full&geometries=geojson&gaps=split&tidy=true&steps=false&annotations=false`, fetchFn);
      for (const m of j.matchings || []) {
        const c = aLatLng(m.geometry);
        if (c.length > 1) lineas.push({ coordenadas: c, confianza: Math.round((m.confidence || 0) * 100) / 100, distancia_m: Math.round(m.distance || 0) });
      }
    } catch (error) {
      if (error instanceof ErrorOsrm && (error.codigo === 'NoMatch' || error.codigo === 'NoSegment')) continue;
      throw error;
    }
  }
  return lineas;
}
