// Empresas (clientes de Sulotec). El catálogo no pertenece a ninguna empresa: lo administra solo el rol UNIVERSAL. Lo que cada empresa
// ve de sí misma (nombre, marca, reglas) sale de aquí; sus reglas se combinan con los valores por defecto del servidor.
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { PRODUCTO } from '#core/config/producto.js';

const TTL_MS = 10_000;
const cache = new Map();

export const slugDe = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

// Abreviatura de la empresa: prefijo fijo de sus nombres de usuario (arq + jorge = arq.jorge). Así un usuario nunca choca con el de otra
// empresa y el inicio de sesión sigue identificando a la empresa sin preguntar nada. Se sugiere desde la palabra distintiva del nombre;
// el administrador universal la puede cambiar, pero toda empresa debe tener una (si dos empresas no la tuvieran, "supervisor1" chocaría).
// Las cuentas ya existentes no se renombran.
const PALABRAS_GENERICAS = new Set(['caja', 'municipal', 'rural', 'de', 'del', 'la', 'el', 'y', 'e', 'los', 'las', 'ahorro', 'ahorros', 'credito', 'creditos', 'cmac', 'crac', 'edpyme', 'financiera', 'cooperativa', 'coop', 'banco', 'sa', 'sac', 'srl', 'eirl', 'empresa', 'grupo']);
export const prefijoDe = (texto) => {
  const slug = slugDe(texto);
  const palabras = slug.split('-').filter((p) => p && !PALABRAS_GENERICAS.has(p));
  const base = (palabras[0] || slug.replace(/-/g, '') || 'emp').slice(0, 3);
  return base.length >= 2 ? base : base.padEnd(2, 'x');
};
export function limpiarPrefijo(valor) {
  if (valor === undefined) return undefined;
  const v = String(valor ?? '').trim().toLowerCase();
  if (v === '') throw Object.assign(new Error('La abreviatura de la empresa es obligatoria (de 2 a 8 letras o números)'), { statusCode: 400, code: 'PREFIJO_INVALIDO' });
  if (!/^[a-z0-9]{2,8}$/.test(v)) throw Object.assign(new Error('La abreviatura debe tener de 2 a 8 letras o números, sin espacios ni puntos'), { statusCode: 400, code: 'PREFIJO_INVALIDO' });
  return v;
}
// Nombre de usuario completo dentro de una empresa: <prefijo>.<usuario>; si ya viene con el prefijo, se respeta.
export function usuarioConPrefijo(prefijo, username) {
  const u = String(username || '').trim().toLowerCase();
  if (!prefijo || u.startsWith(prefijo + '.')) return u;
  return prefijo + '.' + u;
}

// Reglas por defecto del producto; cada empresa puede cambiar las suyas (empresas.configuracion). Solo estas claves se aceptan.
export const REGLAS_POR_DEFECTO = () => ({
  geocerca_radio_m: env.GEOFENCE_RADIO_METROS,
  precision_maxima_m: env.GEOFENCE_PRECISION_MAXIMA_METROS,
  zona_radio_m: 1000, // primera visita sin referencia: cuánto puede alejarse de la zona ya conocida (sugerencia del mapa o visitas vecinas)
  formatos_importacion: [...FORMATOS_IMPORTACION],
});
const REGLAS_PERMITIDAS = Object.freeze({ geocerca_radio_m: [10, 50000], precision_maxima_m: [5, 5000], zona_radio_m: [100, 20000] });
// Formatos de Excel que la empresa acepta al cargar expedientes: CORE_262 (base del sistema core de Caja Huancayo) y SIMPLE (plantilla
// de demostración). Una empresa nueva trae ambos; cada formato nuevo se suma aquí y en el importador, sin tocar los demás.
export const FORMATOS_IMPORTACION = Object.freeze(['CORE_262', 'SIMPLE']);
// El nombre del producto no se personaliza (siempre GeoMatrix): la marca de la empresa solo cambia su nombre, color y logo.
const MARCA_PERMITIDA = Object.freeze(['nombre', 'color', 'logo_url']);

function limpiarReglas(configuracion = {}) {
  const limpias = {};
  for (const [clave, [min, max]] of Object.entries(REGLAS_PERMITIDAS)) {
    if (configuracion[clave] === undefined || configuracion[clave] === null) continue;
    const n = Number(configuracion[clave]);
    if (!Number.isInteger(n) || n < min || n > max) throw Object.assign(new Error(`${clave} debe ser un entero entre ${min} y ${max}`), { statusCode: 400, code: 'REGLA_INVALIDA' });
    limpias[clave] = n;
  }
  if (configuracion.formatos_importacion !== undefined && configuracion.formatos_importacion !== null) {
    const lista = Array.isArray(configuracion.formatos_importacion) ? configuracion.formatos_importacion.map((f) => String(f).toUpperCase()) : [];
    if (!lista.length || lista.some((f) => !FORMATOS_IMPORTACION.includes(f))) throw Object.assign(new Error(`formatos_importacion debe ser una lista con valores de: ${FORMATOS_IMPORTACION.join(', ')}`), { statusCode: 400, code: 'REGLA_INVALIDA' });
    limpias.formatos_importacion = [...new Set(lista)];
  }
  return limpias;
}
function limpiarMarca(marca = {}) {
  const limpia = {};
  for (const clave of MARCA_PERMITIDA) {
    if (marca[clave] === undefined || marca[clave] === null || marca[clave] === '') continue;
    const v = String(marca[clave]).trim().slice(0, clave === 'logo_url' ? 500 : 80);
    if (clave === 'color' && !/^#[0-9a-fA-F]{6}$/.test(v)) throw Object.assign(new Error('El color debe tener el formato #RRGGBB'), { statusCode: 400, code: 'MARCA_INVALIDA' });
    if (clave === 'logo_url' && !/^https:\/\//.test(v)) throw Object.assign(new Error('El logo debe ser una dirección https'), { statusCode: 400, code: 'MARCA_INVALIDA' });
    limpia[clave] = v;
  }
  return limpia;
}

const aPublica = (e) => ({
  id: e.id_empresa, nombre: e.nombre, nombre_corto: e.nombre_corto || e.nombre, slug: e.slug, estado: e.estado, prefijo: e.prefijo || null,
  // `producto` va al final: aunque una marca guardada antes traiga otro nombre de producto, se muestra siempre GeoMatrix.
  marca: { nombre: e.nombre_corto || e.nombre, ...(e.marca || {}), producto: PRODUCTO },
  reglas: { ...REGLAS_POR_DEFECTO(), ...limpiarReglas(e.configuracion || {}) },
});

async function obtenerFila(id) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.en < TTL_MS) return hit.fila;
  const fila = await prisma.empresa.findUnique({ where: { id_empresa: id } });
  cache.set(id, { fila, en: Date.now() });
  return fila;
}

// Lo que ve de sí misma la empresa del contexto (o la que se pida).
export async function publica(id = empresaActual()) {
  if (!id) return null;
  const fila = await obtenerFila(id);
  return fila ? aPublica(fila) : null;
}

// Reglas efectivas de la empresa del contexto (las del producto si no tiene propias).
export async function reglas() {
  const id = empresaActual();
  const fila = id ? await obtenerFila(id) : null;
  return { ...REGLAS_POR_DEFECTO(), ...limpiarReglas(fila?.configuracion || {}) };
}

export async function empresaActivaPorId(id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ''))) return null;
  const fila = await obtenerFila(id);
  return fila && fila.estado === 'ACTIVA' ? fila : null;
}

export async function listar() {
  const filas = await prisma.empresa.findMany({ orderBy: { creado_en: 'asc' } });
  return filas.map(aPublica);
}
export async function listarActivas() {
  return prisma.empresa.findMany({ where: { estado: 'ACTIVA' }, select: { id_empresa: true, nombre: true } });
}

// La abreviatura es única: la sugerida puede estar ocupada (dos «Caja …» parecidas), así que se le suma un número hasta que quede
// libre; una abreviatura indicada a mano que ya esté en uso se rechaza con un mensaje claro (no con el error genérico de la base).
async function prefijoOcupado(prefijo, salvoId = null) {
  const fila = await prisma.empresa.findFirst({ where: { prefijo }, select: { id_empresa: true } });
  return Boolean(fila && fila.id_empresa !== salvoId);
}
async function prefijoLibre(base) {
  for (let n = 1; n <= 99; n += 1) {
    const candidato = n === 1 ? base : base.slice(0, 8 - String(n).length) + String(n);
    if (!(await prefijoOcupado(candidato))) return candidato;
  }
  throw Object.assign(new Error('No se pudo sugerir una abreviatura libre: indica una'), { statusCode: 409, code: 'PREFIJO_EN_USO' });
}
async function prefijoValidado(prefijo, salvoId = null) {
  const limpio = limpiarPrefijo(prefijo);
  if (await prefijoOcupado(limpio, salvoId)) throw Object.assign(new Error('La abreviatura «' + limpio + '» ya la usa otra empresa: elige otra'), { statusCode: 409, code: 'PREFIJO_EN_USO' });
  return limpio;
}

export async function crear({ nombre, nombre_corto, slug, prefijo, configuracion, marca }) {
  const abreviatura = prefijo === undefined || prefijo === null ? await prefijoLibre(prefijoDe(nombre_corto || nombre)) : await prefijoValidado(prefijo);
  const fila = await prisma.empresa.create({ data: {
    nombre: nombre.trim(), nombre_corto: nombre_corto?.trim() || null, slug: slugDe(slug || nombre),
    prefijo: abreviatura, // sin abreviatura se sugiere desde el nombre (y se hace única)
    configuracion: limpiarReglas(configuracion || {}), marca: limpiarMarca(marca || {}),
  } });
  return aPublica(fila);
}

export async function actualizar(id, cambios) {
  const actual = await prisma.empresa.findUnique({ where: { id_empresa: id } });
  if (!actual) throw Object.assign(new Error('Empresa no encontrada'), { statusCode: 404, code: 'NOT_FOUND' });
  const data = {};
  if (cambios.nombre !== undefined) data.nombre = cambios.nombre.trim();
  if (cambios.nombre_corto !== undefined) data.nombre_corto = cambios.nombre_corto?.trim() || null;
  if (cambios.estado !== undefined) data.estado = cambios.estado;
  if (cambios.prefijo !== undefined) data.prefijo = await prefijoValidado(cambios.prefijo, id);
  if (cambios.configuracion !== undefined) data.configuracion = { ...(actual.configuracion || {}), ...limpiarReglas(cambios.configuracion || {}) };
  if (cambios.marca !== undefined) data.marca = { ...(actual.marca || {}), ...limpiarMarca(cambios.marca || {}) };
  const fila = await prisma.empresa.update({ where: { id_empresa: id }, data });
  cache.delete(id);
  return { ...aPublica(fila), _auditDiff: { entidad: 'Empresa', entidad_id: id, valor_anterior: aPublica(actual), valor_nuevo: aPublica(fila) } };
}

export default { publica, reglas, empresaActivaPorId, listar, listarActivas, crear, actualizar, slugDe, prefijoDe, limpiarPrefijo, usuarioConPrefijo };
