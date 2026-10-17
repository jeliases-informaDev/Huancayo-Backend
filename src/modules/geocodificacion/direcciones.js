// Nomenclatura de direcciones del Perú: separa una dirección escrita en sus partes (tipo de vía, nombre, número, manzana/lote,
// urbanización, interior, referencia), la deja normalizada (Av. → Avenida, Jr. → Jirón…) y marca lo que le falta para ubicarla con
// precisión. También evalúa qué tan confiable es el punto que devuelve un proveedor de mapas.
// Parte de la lógica probada en Radar 360 (Afacop), ampliada con la descomposición de la dirección.

const TIPOS_EDIFICIO = ['house', 'building'];
const TIPOS_CALLE = ['road', 'street', 'pedestrian', 'residential'];
const TIPOS_ZONA = ['suburb', 'neighbourhood', 'quarter', 'city_district'];
const TIPOS_CIUDAD = ['city', 'town', 'municipality', 'province'];

// Cada abreviatura se reconoce con punto (aunque venga pegada: "Av.Petit Thouars") o sin punto seguida de espacio.
const ABREVIATURAS = [
  [/\bAV(?:DA?)?(?:\.\s*|(?=\s))/gi, 'Avenida '],
  [/\bJR(?:\.\s*|(?=\s))/gi, 'Jirón '],
  [/\bCAL?(?:\.\s*|(?=\s))/gi, 'Calle '],
  [/\bPSJE?(?:\.\s*|(?=\s))/gi, 'Pasaje '],
  [/\bURB(?:\.\s*|(?=\s))/gi, 'Urbanización '],
  [/\bPROL(?:\.\s*|(?=\s))/gi, 'Prolongación '],
];
const REFERENCIAS = /\b(?:REF|REFERENCIA|FRENTE A|CERCA A|CERCA DE|ALTURA DE|ESQ|ESQUINA|CRUCE)\b\.?:?.*$/i;
const INTERIOR = /\b(?:DEPARTAMENTO|INTERIOR|DEPTO|DPTO|OFICINA|EDIFICIO|TIENDA|BLOCK|STAND|PUESTO|OFIC|PISO|EDIF|INT|DEP|BLQ|TDA|OF)\b/i;
const MARCADOR_NUMERO = /(?:\b(?:N[°º]|NRO|NUM|NÚM|NUMERO|NÚMERO)\.?|#)\s*(?=\d)/gi;
const MANZANA = /\b(?:MANZANA|MZA|MZ)\b\.?\s*[A-Z0-9]+/gi;
const LOTE = /\b(?:LOTE|LTE|LT)\b\.?\s*\d+[A-Z]?/gi;

const quitarTildes = (value) => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function normalizarNumero(valor) {
  return String(valor || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizarTexto(valor) {
  return quitarTildes(valor)
    .toLowerCase()
    .replace(/\b(?:distrito|provincia|departamento|cercado)\s+de\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function limpiarDireccion(direccion) {
  let texto = String(direccion ?? '').replace(/\s+/g, ' ').trim();
  if (!texto) return { texto: '', calle: '', numero: null, esManzanaLote: false };

  texto = texto.replace(REFERENCIAS, '');
  const esManzanaLote = new RegExp(MANZANA.source, 'i').test(texto) || new RegExp(LOTE.source, 'i').test(texto);
  const sinInterior = texto.split(INTERIOR)[0].trim();
  if (sinInterior) texto = sinInterior;
  texto = texto.replace(MARCADOR_NUMERO, '');
  if (esManzanaLote) texto = texto.replace(MANZANA, ' ').replace(LOTE, ' ');
  for (const [patron, reemplazo] of ABREVIATURAS) texto = texto.replace(patron, reemplazo);
  texto = texto.replace(/\s+/g, ' ').replace(/[,;\s]+$/, '').trim();

  let numero = null;
  let calle = texto;
  if (!esManzanaLote) {
    const coincidencias = [...texto.matchAll(/\b(\d{1,5}[A-Z]?)\b(?!\s+de\b)/gi)];
    const ultima = coincidencias.at(-1);
    if (ultima) {
      numero = ultima[1].toUpperCase();
      calle = `${texto.slice(0, ultima.index)}${texto.slice(ultima.index + ultima[0].length)}`
        .replace(/\s+/g, ' ').replace(/[,;\s]+$/, '').trim();
    }
  }
  return { texto, calle, numero, esManzanaLote };
}

// ---------------------------------------------------------------- descomposición de la dirección
const TIPOS_VIA = [
  ['Avenida', /^(?:AV(?:DA?)?|AVENIDA)\b\.?\s*/i],
  ['Jirón', /^(?:JR|JIRON|JIRÓN)\b\.?\s*/i],
  ['Calle', /^(?:CALLE|CAL?)\b\.?\s*/i],
  ['Pasaje', /^(?:PSJE?|PASAJE)\b\.?\s*/i],
  ['Prolongación', /^(?:PROL|PROLONGACION|PROLONGACIÓN)\b\.?\s*/i],
  ['Carretera', /^(?:CARR|CARRETERA)\b\.?\s*/i],
  ['Malecón', /^(?:MALEC[OÓ]N|MALEC)\b\.?\s*/i],
  ['Alameda', /^(?:ALAMEDA|ALM)\b\.?\s*/i],
  ['Óvalo', /^(?:[OÓ]VALO|OVL)\b\.?\s*/i],
  ['Plaza', /^(?:PLAZA|PZA)\b\.?\s*/i],
  ['Parque', /^PARQUE\b\.?\s*/i],
  ['Camino', /^CAMINO\b\.?\s*/i],
  ['Pasaje', /^PJE\b\.?\s*/i],
];
// Zonas de vivienda que suelen escribirse después de la calle: se separan para no confundir al buscador.
const ZONA = /\b(URB(?:ANIZACI[OÓ]N)?|AA\.?\s?HH\.?|A\.?\s?H\.?|ASOC(?:IACI[OÓ]N)?|COOP(?:ERATIVA)?|PP\.?\s?JJ\.?|P\.?\s?J\.?|RES(?:IDENCIAL)?|CONJ(?:UNTO)?(?:\s+HABITACIONAL)?|C\.?\s?H\.?|COND(?:OMINIO)?|SECTOR|BARRIO|CASER[IÍ]O|CENTRO POBLADO|C\.?\s?P\.?)\b\.?\s+([^,;]+?)(?=\s*(?:,|;|$|\bMZ\b|\bLT\b|\bMANZANA\b|\bLOTE\b))/i;
const NOMBRES_ZONA = { URB: 'Urbanización', URBANIZACION: 'Urbanización', ASOC: 'Asociación', ASOCIACION: 'Asociación', COOP: 'Cooperativa', COOPERATIVA: 'Cooperativa', RES: 'Residencial', RESIDENCIAL: 'Residencial', SECTOR: 'Sector', BARRIO: 'Barrio', COND: 'Condominio', CONDOMINIO: 'Condominio', CASERIO: 'Caserío', 'CASERÍO': 'Caserío' };

const capitalizar = (t) => String(t || '').toLowerCase().replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Del|La|Las|Los|El|Y)\b/g, (m) => m.toLowerCase()).replace(/^\p{Ll}/u, (c) => c.toUpperCase());

// Devuelve las partes de la dirección, la dirección normalizada (sin distrito) y las señales de calidad.
//   calidad: SIN_DIRECCION, DIRECCION_CORTA, SIN_TIPO_VIA, SIN_NUMERO, MANZANA_LOTE, SIN_DISTRITO, SIN_PROVINCIA
export function descomponerDireccion(direccion, { distrito, provincia } = {}) {
  const original = String(direccion ?? '').replace(/\s+/g, ' ').trim();
  const calidad = [];
  if (!original) return { original, normalizada: null, componentes: null, calidad: ['SIN_DIRECCION'] };

  let resto = original;
  let referencia = null;
  const mRef = resto.match(REFERENCIAS);
  if (mRef) { referencia = mRef[0].replace(/^\w+\.?:?\s*/i, (x) => x).trim(); resto = resto.replace(REFERENCIAS, '').trim(); }

  let interior = null;
  const partes = resto.split(INTERIOR);
  if (partes.length > 1 && partes[0].trim()) { interior = resto.slice(partes[0].length).trim(); resto = partes[0].trim(); }

  const manzana = (resto.match(new RegExp(MANZANA.source, 'i')) || [null])[0];
  const lote = (resto.match(new RegExp(LOTE.source, 'i')) || [null])[0];
  const mz = manzana ? manzana.replace(/^\w+\.?\s*/i, '').trim().toUpperCase() : null;
  const lt = lote ? lote.replace(/^\w+\.?\s*/i, '').trim().toUpperCase() : null;
  resto = resto.replace(MANZANA, ' ').replace(LOTE, ' ');

  let urbanizacion = null;
  const mZona = resto.match(ZONA);
  if (mZona) {
    const clave = quitarTildes(mZona[1]).toUpperCase().replace(/[.\s]/g, '');
    const etiqueta = NOMBRES_ZONA[clave] || (/^A+H+/.test(clave) ? 'AA.HH.' : /^PP?J/.test(clave) ? 'Pueblo Joven' : /^C?H$/.test(clave) ? 'Conjunto Habitacional' : /^CP$/.test(clave) ? 'Centro Poblado' : capitalizar(mZona[1]));
    urbanizacion = `${etiqueta} ${capitalizar(mZona[2].trim())}`;
    resto = resto.replace(mZona[0], ' ');
  }

  resto = resto.replace(MARCADOR_NUMERO, '').replace(/\s+/g, ' ').replace(/[,;\s]+$/, '').replace(/^[,;\s]+/, '').trim();
  let tipoVia = null;
  for (const [nombre, patron] of TIPOS_VIA) {
    if (patron.test(resto)) { tipoVia = nombre; resto = resto.replace(patron, '').trim(); break; }
  }

  let numero = null;
  const km = resto.match(/\bK(?:M|ILOMETRO|ILÓMETRO)\.?\s*(\d+(?:[.,]\d+)?)/i);
  if (km) { numero = `Km ${km[1]}`; resto = resto.replace(km[0], ' '); }
  else if (!mz && !lt) {
    const cand = [...resto.matchAll(/\b(\d{1,5}[A-Z]?)\b(?!\s+de\b)/gi)].at(-1);
    if (cand) { numero = cand[1].toUpperCase(); resto = `${resto.slice(0, cand.index)} ${resto.slice(cand.index + cand[0].length)}`; }
  }
  const nombreVia = capitalizar(resto.replace(/\s+/g, ' ').replace(/[,;\s]+$/, '').trim()) || null;

  if (original.length < 8) calidad.push('DIRECCION_CORTA');
  if (!tipoVia && !mz && !lt && !urbanizacion) calidad.push('SIN_TIPO_VIA');
  if (!numero && !mz && !lt) calidad.push('SIN_NUMERO');
  if (mz || lt) calidad.push('MANZANA_LOTE');
  if (!String(distrito ?? '').trim()) calidad.push('SIN_DISTRITO');
  if (!String(provincia ?? '').trim()) calidad.push('SIN_PROVINCIA');

  const lista = [
    [tipoVia, nombreVia, numero].filter(Boolean).join(' ').trim(),
    mz || lt ? ['Mz', mz, 'Lt', lt].filter(Boolean).join(' ') : null,
    urbanizacion,
    interior ? capitalizar(interior) : null,
  ].filter(Boolean);
  return {
    original,
    normalizada: lista.join(', ').slice(0, 300) || null,
    componentes: { tipo_via: tipoVia, nombre_via: nombreVia, numero, manzana: mz, lote: lt, urbanizacion, interior: interior ? capitalizar(interior) : null, referencia: referencia || null },
    calidad,
  };
}

const ADVERTENCIA_DE = {
  SIN_NUMERO: 'DIRECCION_SIN_NUMERO', MANZANA_LOTE: 'DIRECCION_MANZANA_LOTE', SIN_TIPO_VIA: 'DIRECCION_SIN_TIPO_VIA',
  SIN_DISTRITO: 'DIRECCION_SIN_DISTRITO', DIRECCION_CORTA: 'DIRECCION_CORTA', SIN_DIRECCION: 'SIN_DIRECCION',
};

// Campos de dirección de un expediente (para guardar al importar o crear) y las advertencias de calidad correspondientes.
export function camposDeDireccion({ direccion, distrito, provincia, tieneCoordenadas = false }) {
  const d = descomponerDireccion(direccion, { distrito, provincia });
  return {
    campos: {
      direccion_normalizada: d.normalizada,
      direccion_componentes: d.componentes ? { ...d.componentes, calidad: d.calidad } : null,
      // Con coordenadas ya conocidas no hace falta consultar a nadie; sin ellas la dirección entra a la cola de geocodificación.
      geo_estado: !tieneCoordenadas && d.normalizada ? 'PENDIENTE' : null,
    },
    advertencias: d.calidad.map((c) => ADVERTENCIA_DE[c]).filter(Boolean),
  };
}

// Lo que se borra de la sugerencia del mapa cuando cambia la dirección del expediente.
export const SIN_SUGERENCIA = { geo_confianza: null, geo_precision: null, geo_proveedor: null, geo_latitud: null, geo_longitud: null, geo_direccion_encontrada: null, geo_fecha: null };

// ---------------------------------------------------------------- calidad del punto devuelto por el proveedor
export function coincideDistrito(distritoEsperado, address = {}) {
  const esperado = normalizarTexto(distritoEsperado);
  if (!esperado) return null;
  const candidatos = ['suburb', 'city_district', 'neighbourhood', 'quarter', 'city', 'town', 'village', 'municipality']
    .map((clave) => normalizarTexto(address?.[clave]))
    .filter(Boolean);
  if (!candidatos.length) return null;
  return candidatos.some((candidato) => candidato === esperado || candidato.includes(esperado) || esperado.includes(candidato));
}

export function evaluarResultado({ item, numeroSolicitado = null, distritoEsperado = null, esManzanaLote = false }) {
  const tipo = String(item.addresstype || item.type || '').toLowerCase();
  const coincideNumero = Boolean(numeroSolicitado && normalizarNumero(item.address?.house_number) === numeroSolicitado);

  let precision;
  if (coincideNumero && TIPOS_EDIFICIO.includes(tipo)) precision = 'EXACTA';
  else if (coincideNumero) precision = 'APROXIMADA';
  else if (TIPOS_EDIFICIO.includes(tipo)) precision = numeroSolicitado ? 'APROXIMADA' : 'EXACTA';
  else if (TIPOS_CALLE.includes(tipo)) precision = 'APROXIMADA';
  else if (TIPOS_ZONA.includes(tipo)) precision = 'DISTRITO';
  else if (TIPOS_CIUDAD.includes(tipo)) precision = 'PROVINCIA';
  else precision = 'APROXIMADA';

  const distritoCoincide = coincideDistrito(distritoEsperado, item.address);

  let confianza;
  if (esManzanaLote) confianza = 'BAJA';
  else if (distritoCoincide === false) confianza = 'BAJA';
  else if (precision === 'EXACTA' && numeroSolicitado) confianza = 'ALTA';
  else if (precision === 'EXACTA' || precision === 'APROXIMADA') confianza = 'MEDIA';
  else confianza = 'BAJA';

  return { precision, confianza, distritoCoincide };
}

// Traduce un resultado de Mapbox (API v6) al formato interno para aplicar las mismas reglas de confianza a cualquier proveedor.
export function mapearFeatureMapbox(feature) {
  const props = feature?.properties ?? {};
  const contexto = props.context ?? {};
  const [longitud, latitud] = feature?.geometry?.coordinates ?? [props.coordinates?.longitude, props.coordinates?.latitude];
  const puntoExacto = ['rooftop', 'parcel', 'point'].includes(props.coordinates?.accuracy);

  let addresstype;
  switch (props.feature_type) {
    case 'address': addresstype = puntoExacto && props.match_code?.address_number === 'matched' ? 'building' : 'place'; break;
    case 'street': addresstype = 'road'; break;
    case 'neighborhood': addresstype = 'neighbourhood'; break;
    case 'locality':
    case 'district': addresstype = 'suburb'; break;
    default: addresstype = 'city';
  }
  return {
    lat: String(latitud), lon: String(longitud),
    display_name: props.full_address || [props.name, props.place_formatted].filter(Boolean).join(', ') || null,
    addresstype, type: addresstype,
    address: {
      house_number: contexto.address?.address_number ?? null,
      road: contexto.street?.name ?? contexto.address?.street_name ?? null,
      suburb: contexto.neighborhood?.name ?? null,
      city_district: contexto.locality?.name ?? null,
      city: contexto.place?.name ?? null,
    },
  };
}

// Un punto aproximado sirve para ver la zona pero NO es una referencia para medir los 100 m; solo uno ALTO y que cae en el distrito
// declarado se usa como referencia. Lo que cae fuera del distrito declarado se marca para revisar.
export const estadoSegunResultado = ({ distritoCoincide }) => (distritoCoincide === false ? 'REVISAR' : 'LOCALIZADO');
