// Piezas puras del registro de seguridad: filtros, cursor de páginas y exportación a CSV. Sin base de datos, para probarlas solas.

const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

export const esUuid = (t) => UUID.test(String(t || ''));
export const esIp = (t) => IPV4.test(String(t || '')) || (String(t || '').includes(':') && IPV6.test(String(t || '')));

// Una fecha sola (AAAA-MM-DD) vale el día completo en UTC; con hora se respeta tal cual. `hasta` incluye todo ese día.
export function rangoFechas(desde, hasta) {
  const limite = (valor, fin) => {
    if (!valor) return null;
    const soloDia = /^\d{4}-\d{2}-\d{2}$/.test(valor);
    const d = new Date(soloDia ? `${valor}T${fin ? '23:59:59.999' : '00:00:00.000'}Z` : valor);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const gte = limite(desde, false);
  const lte = limite(hasta, true);
  if (!gte && !lte) return null;
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}

// La búsqueda libre se interpreta por su forma, para usar siempre un índice: una IP, un identificador (cuenta o expediente) o, si no, el comienzo
// del nombre de usuario. Así buscar no obliga a recorrer toda la tabla.
export function filtroBusqueda(texto) {
  const t = String(texto || '').trim();
  if (!t) return null;
  if (esIp(t)) return { ip_address: t };
  if (esUuid(t)) return { OR: [{ actor_id: t }, { entidad_id: t }] };
  if (/^\d+$/.test(t)) return { entidad_id: t };
  return { actor: { startsWith: t } };
}

// Arma el `where` de Prisma (sin la empresa: la pone el filtro central) a partir de los parámetros de la consulta.
export function construirFiltro(q = {}) {
  const y = [];
  if (q.categoria) y.push({ categoria: q.categoria });
  if (q.accion) y.push({ accion: q.accion });
  if (q.severidad) y.push({ severidad: q.severidad });
  if (q.resultado === 'ok') y.push({ estado_http: { lt: 400 } });
  if (q.resultado === 'error') y.push({ estado_http: { gte: 400 } });
  if (q.solo_cambios === 'true') y.push({ con_cambios: true });
  if (q.entidad) y.push({ entidad: q.entidad });
  if (q.entidad_id) y.push({ entidad_id: q.entidad_id });
  if (q.actor) y.push({ actor: { startsWith: q.actor } });
  if (q.ruta) y.push({ ruta: { contains: q.ruta } });
  const fecha = rangoFechas(q.desde, q.hasta);
  if (fecha) y.push({ fecha });
  const busqueda = filtroBusqueda(q.q);
  if (busqueda) y.push(busqueda);
  return y.length ? { AND: y } : {};
}

// ---------------------------------------------------------------- páginas por cursor: (fecha, id) del último registro visto. No recorre ni cuenta lo anterior.
export const codificarCursor = (fecha, id) => Buffer.from(`${new Date(fecha).toISOString()}|${id}`).toString('base64url');
export function decodificarCursor(cursor) {
  try {
    const [f, id] = Buffer.from(String(cursor), 'base64url').toString('utf8').split('|');
    const fecha = new Date(f);
    return Number.isNaN(fecha.getTime()) || !esUuid(id) ? null : { fecha, id };
  } catch { return null; }
}
// Condición de «los que van después del cursor» con el orden fecha descendente, id descendente. Es lo mismo que (fecha < X) o (fecha = X y id < Y), escrito con
// la cota `fecha <= X` por delante para que la base la resuelva como un rango del índice (empresa, fecha) y no recorra otras empresas.
export const despuesDelCursor = ({ fecha, id }) => ({ AND: [{ fecha: { lte: fecha } }, { OR: [{ fecha: { lt: fecha } }, { id_auditoria: { lt: id } }] }] });

export const VENTANAS_HORAS = Object.freeze({ '24h': 24, '7d': 168, '30d': 720 });

// ---------------------------------------------------------------- CSV
// Una celda que empieza con = + - @ (o tabulador / retorno) la interpreta Excel como fórmula; el nombre de usuario de un intento de acceso lo escribe
// cualquiera, así que se neutraliza anteponiendo una comilla simple. Después se entrecomilla si lleva coma, comillas o saltos de línea.
export function celdaCsv(valor) {
  if (valor === null || valor === undefined) return '';
  let t = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}
export const filaCsv = (celdas) => `${celdas.map(celdaCsv).join(',')}\r\n`;

export const COLUMNAS_CSV = Object.freeze([
  'Fecha (UTC)', 'Usuario', 'Nombre', 'Rol', 'Acción', 'Categoría', 'Gravedad', 'Resultado', 'Código HTTP', 'Método', 'Ruta', 'IP', 'Plataforma',
  'Dispositivo', 'Entidad', 'Id de la entidad', 'Id de la petición', 'Valor anterior', 'Valor nuevo',
]);
