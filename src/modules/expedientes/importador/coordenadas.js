// La base de Caja Huancayo no trae latitud/longitud, pero algunos asesores escriben las
// coordenadas dentro de la referencia del domicilio (texto libre). Formatos vistos:
//   "-12.345678,-76.543210"            (decimal con signo)
//   "12.34567890S 76.54321098W"        (decimal con hemisferio)
//   "-6.12345678 -78.12345678°NW"      (decimal con signo separado por un espacio, con la orientación al final: así viene en la base de Consumo)
// También se aceptan grados/minutos/segundos. Todo se valida contra una caja que cubre el Perú
// para descartar números que se parecen a coordenadas pero no lo son.

const PERU = { latMin: -18.5, latMax: 0.5, lngMin: -81.5, lngMax: -68.5 };

function dentroDePeru(lat, lng) {
  return lat >= PERU.latMin && lat <= PERU.latMax && lng >= PERU.lngMin && lng <= PERU.lngMax;
}

function aceptar(lat, lng, formato) {
  if (dentroDePeru(lat, lng)) return { latitud: lat, longitud: lng, formato };
  // Pareja invertida (longitud, latitud): se corrige.
  if (dentroDePeru(lng, lat)) return { latitud: lng, longitud: lat, formato: `${formato}_INVERTIDO` };
  return null;
}

const firmado = (valor, hemisferio) => (/[SWO]/i.test(hemisferio) ? -Math.abs(valor) : Math.abs(valor));

export function extraerCoordenadas(textoLibre) {
  if (!textoLibre || typeof textoLibre !== 'string') return null;
  const s = textoLibre.replace(/\s+/g, ' ');

  // 1) Decimal con hemisferio: 12.345S 76.543W
  const conHemisferio = s.match(/(\d{1,2}\.\d{3,})\s*°?\s*([NS])[\s,;]*(\d{1,3}\.\d{3,})\s*°?\s*([EWO])/i);
  if (conHemisferio) {
    const r = aceptar(firmado(Number(conHemisferio[1]), conHemisferio[2]), firmado(Number(conHemisferio[3]), conHemisferio[4]), 'DECIMAL_HEMISFERIO');
    if (r) return r;
  }

  // 2) Grados, minutos y segundos: 12°03'45"S 77°02'10"W
  const gms = s.match(/(\d{1,2})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*["″]?\s*([NS])[\s,;]*(\d{1,3})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*["″]?\s*([EWO])/i);
  if (gms) {
    const lat = Number(gms[1]) + Number(gms[2]) / 60 + Number(gms[3]) / 3600;
    const lng = Number(gms[5]) + Number(gms[6]) / 60 + Number(gms[7]) / 3600;
    const r = aceptar(firmado(lat, gms[4]), firmado(lng, gms[8]), 'GMS');
    if (r) return r;
  }

  // 3) Decimal con signo: -12.345678,-76.543210
  const conSigno = s.match(/(-?\d{1,2}\.\d{3,})\s*[,;]\s*(-?\d{1,3}\.\d{3,})/);
  if (conSigno) {
    const r = aceptar(Number(conSigno[1]), Number(conSigno[2]), 'DECIMAL');
    if (r) return r;
  }

  // 4) Decimal con signo separado por un espacio: -6.123456 -78.123456°NW. Los dos con signo (en el Perú siempre son negativos): así no se confunde con dos números cualquiera.
  const conEspacio = s.match(/(-\d{1,2}\.\d{3,})\s+(-\d{1,3}\.\d{3,})/);
  if (conEspacio) {
    const r = aceptar(Number(conEspacio[1]), Number(conEspacio[2]), 'DECIMAL_ESPACIO');
    if (r) return r;
  }
  return null;
}

// Quita del texto las coordenadas encontradas para mostrar solo la referencia legible.
export function sinCoordenadas(textoLibre) {
  if (!textoLibre) return textoLibre;
  return textoLibre
    .replace(/(\d{1,2}\.\d{3,})\s*°?\s*[NS][\s,;]*(\d{1,3}\.\d{3,})\s*°?\s*[EWO]/gi, '')
    .replace(/(-?\d{1,2}\.\d{3,})\s*[,;]\s*(-?\d{1,3}\.\d{3,})/g, '')
    .replace(/(-\d{1,2}\.\d{3,})\s+(-\d{1,3}\.\d{3,})(?:\s*°\s*[NSEWO]{1,2}\b)?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
