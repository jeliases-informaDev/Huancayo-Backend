// Puntos visitables de un expediente: el domicilio de la persona y, en créditos MYPE (tipo OTROS), cada
// negocio de la base (datos_negocio.negocios[]). Cada punto trae sus coordenadas de referencia (o null
// si todavía no se conocen). La ubicación de un negocio vive dentro del propio bloque datos_negocio:
//   { direccion, distrito, referencia, ..., latitud, longitud, ubicacion_origen }

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
    if (a && ['MANUAL', 'PRIMERA_VISITA'].includes(a.ubicacion_origen) && comoNumero(a.latitud) !== null && clave(a.direccion) === clave(n.direccion)) {
      return { ...n, latitud: a.latitud, longitud: a.longitud, ubicacion_origen: a.ubicacion_origen };
    }
    return n;
  });
  return { ...datosNuevos, negocios };
}
