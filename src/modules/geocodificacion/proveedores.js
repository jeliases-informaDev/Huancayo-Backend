// Proveedores de mapas para ubicar una dirección escrita. Se elige con GEOCODING_PROVIDER:
//   · nominatim (por defecto): OpenStreetMap gratuito; su política limita a 1 consulta por segundo (sirve para unos pocos miles de direcciones).
//   · mapbox: con clave (MAPBOX_ACCESS_TOKEN), rápido y con nivel de precisión por dirección; guardar coordenadas exige su modo permanente.
// Al proveedor solo se le envía el texto de la dirección con distrito y provincia: nunca el nombre ni el documento del cliente.
import { logger } from '#core/config/logger.js';
import { busquedasParaDireccion, coincideDistrito, evaluarResultado, mapearFeatureMapbox, normalizarNumero } from './direcciones.js';

const PAUSA_NOMINATIM_MS = 1200;
const PAUSA_MAPBOX_MS = 100;
const baseUrl = () => String(process.env.GEOCODING_BASE_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, '');
const esNominatimPublico = () => /nominatim\.openstreetmap\.org/i.test(baseUrl());

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function proveedorActivo() {
  return String(process.env.GEOCODING_PROVIDER || 'nominatim').trim().toLowerCase() === 'mapbox' ? 'mapbox' : 'nominatim';
}

export function pausaEntreConsultasMs(proveedor = proveedorActivo()) {
  const texto = process.env.GEOCODING_DELAY_MS;
  const configurada = texto === undefined || texto === '' ? NaN : Number(texto);
  if (Number.isFinite(configurada) && configurada >= 0) return proveedor === 'nominatim' && esNominatimPublico() ? Math.max(configurada, 1000) : configurada;
  return proveedor === 'mapbox' ? PAUSA_MAPBOX_MS : PAUSA_NOMINATIM_MS;
}

export function tamanoMaximoLote(proveedor = proveedorActivo()) {
  return proveedor === 'nominatim' && esNominatimPublico() ? 20 : 500;
}

function verificarRespuesta(response, nombre) {
  if (response.ok) return;
  const error = new Error(`Servicio de geocodificación (${nombre}) respondió ${response.status}`);
  error.status = response.status;
  // Clave inválida, límite excedido o caída del servicio: no es culpa de la dirección, el lote se detiene y las filas siguen pendientes.
  if ([401, 403, 429].includes(response.status) || response.status >= 500) error.detenerLote = true;
  throw error;
}

async function consultarNominatim(params) {
  const url = new URL(`${baseUrl()}/search`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('countrycodes', 'pe');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  for (const [clave, valor] of Object.entries(params)) url.searchParams.set(clave, valor);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'Accept-Language': 'es', 'User-Agent': process.env.GEOCODING_USER_AGENT || 'CajaHuancayoAuditoria/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  verificarRespuesta(response, 'Nominatim');
  const results = await response.json();
  return Array.isArray(results) ? results : [];
}

async function consultarMapbox({ consulta, permanente }) {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) throw Object.assign(new Error('MAPBOX_ACCESS_TOKEN no está configurado.'), { detenerLote: true });
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', consulta);
  url.searchParams.set('country', 'pe');
  url.searchParams.set('limit', '5');
  url.searchParams.set('language', 'es');
  url.searchParams.set('autocomplete', 'false');
  url.searchParams.set('permanent', permanente ? 'true' : 'false');
  url.searchParams.set('access_token', token);
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  verificarRespuesta(response, 'Mapbox');
  const data = await response.json();
  return Array.isArray(data.features) ? data.features.map(mapearFeatureMapbox) : [];
}

// Prueba las búsquedas de la dirección en orden y se queda con las del primer intento que encuentre algo (ver busquedasParaDireccion).
async function buscarCandidatos({ proveedor, busquedas, permanente }) {
  try {
    if (proveedor === 'mapbox') return await consultarMapbox({ consulta: busquedas[0].texto, permanente });
    for (let i = 0; i < busquedas.length; i += 1) {
      const { texto, ...parametros } = busquedas[i];
      const results = await consultarNominatim(parametros);
      if (results.length) return results;
      if (i < busquedas.length - 1) await sleep(pausaEntreConsultasMs('nominatim'));
    }
    return [];
  } catch (error) {
    if (error.status === undefined) error.detenerLote = true; // error de red, de espera o de configuración
    throw error;
  }
}

// Devuelve { latitud, longitud, precision, confianza, distritoCoincide, direccionEncontrada } o null si no encontró nada utilizable.
export async function geocodificarDireccion({ direccion, direccion_normalizada: direccionNormalizada, distrito, provincia, departamento }, { proveedor = proveedorActivo(), permanente = true } = {}) {
  const { limpia, busquedas } = busquedasParaDireccion({ direccion, direccion_normalizada: direccionNormalizada, distrito, provincia, departamento });
  const numeroSolicitado = limpia.numero ? normalizarNumero(limpia.numero) : null;
  if (!busquedas.length) return null; // una dirección de manzana y lote sin zona ni calle no se puede buscar
  const results = await buscarCandidatos({ proveedor, busquedas, permanente });
  if (!results.length) return null;

  let item;
  if (numeroSolicitado) {
    // Solo se acepta un resultado cuyo número coincida realmente.
    const conNumero = results.filter((c) => normalizarNumero(c.address?.house_number) === numeroSolicitado);
    item = conNumero.find((c) => coincideDistrito(distrito, c.address) !== false) ?? conNumero[0];
    if (!item) {
      logger.warn({ direccion: direccionNormalizada, numeroSolicitado, resultados: results.length }, 'geocodificacion_numero_no_encontrado');
      // Sin el número exacto se usa la calle como aproximación (confianza media) en vez de descartar la dirección.
      item = results.find((c) => coincideDistrito(distrito, c.address) !== false) ?? results[0];
    }
  } else {
    item = results.find((c) => coincideDistrito(distrito, c.address) !== false) ?? results[0];
  }

  const latitud = Number(item.lat);
  const longitud = Number(item.lon);
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null;
  const evaluacion = evaluarResultado({ item, numeroSolicitado, distritoEsperado: distrito, esManzanaLote: limpia.esManzanaLote });
  // Un punto a nivel de ciudad o provincia no sirve ni como aproximación.
  if (evaluacion.precision === 'PROVINCIA') return null;
  return { latitud, longitud, precision: evaluacion.precision, confianza: evaluacion.confianza, distritoCoincide: evaluacion.distritoCoincide, direccionEncontrada: item.display_name?.slice(0, 400) || null };
}
