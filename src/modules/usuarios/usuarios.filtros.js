// Filtros y paginación de las listas de usuarios y de auditores (lógica pura, probada sola). Ninguna lista del panel debe cortarse en silencio:
// siempre se pide por páginas y la respuesta dice cuántos hay en total.
import { FIELD_ROLES, ROLES } from '#core/security/roles.js';

export const USUARIOS_POR_PAGINA = 25;
export const USUARIOS_MAXIMO = 100;

export function paginaDeUsuarios({ page, limit } = {}) {
  return { page: Math.max(1, page ?? 1), limit: Math.max(1, Math.min(limit ?? USUARIOS_POR_PAGINA, USUARIOS_MAXIMO)) };
}

// Cada palabra de la búsqueda tiene que aparecer en alguno de los campos: «luis ramos» encuentra a Luis Ramos Torres aunque el nombre y el
// apellido estén en columnas distintas. Hasta 5 palabras (más no aportan y solo encarecen la consulta).
export function filtroTexto(q, campos) {
  const palabras = String(q || '').trim().split(/\s+/).filter(Boolean).slice(0, 5);
  return palabras.map((palabra) => ({ OR: campos.map((campo) => ({ [campo]: { contains: palabra } })) }));
}

// Lista de usuarios de la empresa (pantalla Usuarios): por texto, rol y estado.
export function filtroUsuarios({ q, rol, estado } = {}) {
  const texto = filtroTexto(q, ['username', 'nombres', 'apellidos', 'email']);
  return {
    // «ADMIN» es el nombre anterior del rol de administrador: se sigue encontrando.
    ...(rol ? { rol: rol === ROLES.ADMINISTRADOR ? { in: [ROLES.ADMINISTRADOR, 'ADMIN'] } : rol } : {}),
    ...(estado ? { estado } : {}),
    ...(texto.length ? { AND: texto } : {}),
  };
}

// Auditores de campo activos (columna «Auditores» de Asignaciones). La zona es la de su última jornada; quien nunca inició una usa su zona habitual escrita a mano.
export function filtroZona(zona) {
  return zona ? { OR: [{ zona_departamento: zona }, { zona_en: null, departamento: zona }] } : null;
}
export function filtroAuditores({ q, zona, id } = {}) {
  const condiciones = [...filtroTexto(q, ['username', 'nombres', 'apellidos']), ...[filtroZona(zona)].filter(Boolean)];
  return { rol: { in: [...FIELD_ROLES] }, estado: 'ACTIVO', ...(id ? { id_usuario: id } : {}), ...(condiciones.length ? { AND: condiciones } : {}) };
}

// Zonas para el filtro de auditores: departamento de la última jornada (o la zona habitual de quien no inició ninguna), con cuántos auditores hay en cada una.
export function juntarZonas(conJornada, sinJornada) {
  const porNombre = new Map();
  for (const [nombre, n] of [...conJornada, ...sinJornada]) {
    const limpio = String(nombre || '').trim();
    if (!limpio) continue;
    const clave = limpio.toLocaleLowerCase('es-PE');
    const previa = porNombre.get(clave);
    porNombre.set(clave, { zona: previa?.zona || limpio, n: (previa?.n || 0) + n });
  }
  return [...porNombre.values()].sort((a, b) => b.n - a.n || a.zona.localeCompare(b.zona, 'es-PE'));
}
