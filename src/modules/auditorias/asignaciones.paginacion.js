// Paginación y orden de las listas de casos (lógica pura, probada sola). Ninguna lista de la app o del panel debe cortarse en silencio:
// siempre se pide por páginas y la respuesta dice cuántos hay en total.

export const LIMITE_MAXIMO = 200; // por página, para los clientes nuevos
export const LIMITE_POR_DEFECTO = 100;
// Las apps ya instaladas piden la lista completa sin parámetros: se les da hasta esto (antes se cortaba a 150 sin avisar).
export const LIMITE_LEGADO = 1000;
export const RANGO_PRIORIDAD = Object.freeze({ ALTA: 0, MEDIA: 1, BAJA: 2 });

// Sin page ni limit = cliente anterior a la paginación.
export function normalizarPaginacion({ page, limit } = {}) {
  const legado = page === undefined && limit === undefined;
  const tope = legado ? LIMITE_LEGADO : LIMITE_MAXIMO;
  const tam = Math.max(1, Math.min(limit ?? (legado ? LIMITE_LEGADO : LIMITE_POR_DEFECTO), tope));
  return { page: Math.max(1, page ?? 1), limit: tam, legado };
}

export const infoPaginas = ({ page, limit }, total) => ({ page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });

// Orden de «mi muestra»: primero la prioridad real (alta, media, baja; en la base se guarda como texto y alfabéticamente BAJA iría
// antes que MEDIA) y dentro de cada una, la más antigua primero. Las filas ya vienen por antigüedad: el orden es estable.
export function ordenarPorPrioridad(filas) {
  return [...filas].sort((a, b) => (RANGO_PRIORIDAD[a.prioridad] ?? 1) - (RANGO_PRIORIDAD[b.prioridad] ?? 1));
}

export const paginaDe = (lista, { page, limit }) => lista.slice((page - 1) * limit, page * limit);

// Búsqueda por texto sobre el expediente (la base distingue mayúsculas y tildes con su collation, así que «junin» encuentra «Junín»).
export const buscarEnExpediente = (q) => ({
  OR: [{ nombres_cliente: { contains: q } }, { codigo_expediente: { contains: q } }, { numero_documento_cliente: { contains: q } }, { distrito: { contains: q } }],
});
