// Puntos visitables de un expediente: el domicilio de la persona y, en créditos MYPE (tipo OTROS), cada
// negocio de la base (datos_negocio.negocios[]). Cada punto trae sus coordenadas de referencia (o null
// si todavía no se conocen). La ubicación de un negocio vive dentro del propio bloque datos_negocio:
//   { direccion, distrito, referencia, ..., latitud, longitud, ubicacion_origen }

import { descomponerDireccion } from '../geocodificacion/direcciones.js';

const comoNumero = (valor) => {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

export function negociosDe(expediente) {
  const lista = expediente?.datos_negocio?.negocios;
  return Array.isArray(lista) ? lista : [];
}

const unirDireccion = (direccion, distrito) => [direccion, distrito].filter(Boolean).join(', ') || null;

// destino: 'DOMICILIO' | 'NEGOCIO'. Devuelve null si se pide un negocio que el expediente no tiene.
export function puntoDeReferencia(expediente, destino = 'DOMICILIO', indice = 0) {
  if (destino === 'NEGOCIO') {
    const negocio = expediente.tipo_credito === 'OTROS' ? negociosDe(expediente)[indice] : null;
    if (!negocio) return null;
    return {
      destino: 'NEGOCIO', indice, direccion: unirDireccion(negocio.direccion, negocio.distrito),
      latitud: comoNumero(negocio.latitud), longitud: comoNumero(negocio.longitud), origen: negocio.ubicacion_origen ?? null,
    };
  }
  return {
    destino: 'DOMICILIO', indice: 0, direccion: unirDireccion(expediente.direccion_domicilio, expediente.distrito),
    latitud: comoNumero(expediente.latitud), longitud: comoNumero(expediente.longitud), origen: expediente.ubicacion_origen ?? null,
  };
}

// Copia de datos_negocio con la ubicación del negocio `indice` fijada.
export function conUbicacionNegocio(datosNegocio, indice, latitud, longitud, origen) {
  const negocios = negociosDe({ datos_negocio: datosNegocio }).map((n, i) => (i === indice ? { ...n, latitud, longitud, ubicacion_origen: origen } : n));
  return { ...datosNegocio, negocios };
}

// Al reimportar la base, la ubicación de un negocio fijada por una persona (panel o primera visita)
// no se pisa mientras la dirección del negocio siga siendo la misma.
export function conservarUbicacionesNegocio(datosActuales, datosNuevos) {
  const antiguos = negociosDe({ datos_negocio: datosActuales });
  const nuevos = negociosDe({ datos_negocio: datosNuevos });
  if (!antiguos.length || !nuevos.length) return datosNuevos;
  const clave = (s) => String(s || '').trim().toLowerCase();
  const negocios = nuevos.map((n, i) => {
    const a = antiguos[i];
    const mismaDireccion = Boolean(a) && clave(a.direccion) === clave(n.direccion);
    if (mismaDireccion && ['MANUAL', 'PRIMERA_VISITA', 'GEOCODIFICADA'].includes(a.ubicacion_origen) && comoNumero(a.latitud) !== null) {
      return { ...n, latitud: a.latitud, longitud: a.longitud, ubicacion_origen: a.ubicacion_origen, ...(a.geo ? { geo: a.geo } : {}) };
    }
    // Lo que el mapa averiguó de esa dirección (la sugerencia) también se conserva mientras la dirección no cambie.
    if (mismaDireccion && a.geo && comoNumero(n.latitud) === null) return { ...n, geo: a.geo };
    return n;
  });
  return { ...datosNuevos, negocios };
}

// Cada negocio o empleador con su dirección descompuesta (zona, manzana, lote, vía…), igual que el domicilio: así se puede buscar en el mapa
// y reconocer vecinos. Se agrega después de calcular la huella de la fila para no alterar la huella de lo ya importado.
export function conDireccionesDescompuestas(datosNegocio, { distrito, provincia } = {}) {
  if (!datosNegocio || !Array.isArray(datosNegocio.negocios)) return datosNegocio;
  const negocios = datosNegocio.negocios.map((n) => {
    if (!n?.direccion) return n;
    const d = descomponerDireccion(n.direccion, { distrito: n.distrito || distrito, provincia });
    return { ...n, direccion_normalizada: d.normalizada, componentes: d.componentes ? { ...d.componentes, calidad: d.calidad } : null };
  });
  return { ...datosNegocio, negocios };
}

// Estado de la cola del mapa para los negocios: PENDIENTE si alguno con dirección sigue sin coordenadas y sin sugerencia; LISTO si ya no hay
// nada que buscar; null si el expediente no tiene negocios.
export function estadoGeoNegocios(datosNegocio) {
  const negocios = negociosDe({ datos_negocio: datosNegocio });
  if (!negocios.length) return null;
  return negocios.some((n) => n.direccion && comoNumero(n.latitud) === null && !n.geo) ? 'PENDIENTE' : 'LISTO';
}
