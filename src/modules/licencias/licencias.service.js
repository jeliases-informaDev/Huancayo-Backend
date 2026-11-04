// Licencia de GeoMatrix de cada empresa según el servicio común de licencias de Sulotec (Licencias-Backend): aquí vive el estado del proceso
// (caché por empresa, peticiones en vuelo, pausa tras un fallo). Reglas de la casa: la caché dura 5 minutos; si Sulotec no responde se sigue con
// la última licencia conocida y, si nunca se conoció, se trata como ACTIVA (nunca se bloquea a un cliente por una caída nuestra); con
// LICENCIAS_TOKEN vacío todo está apagado y nada de aquí toca la red ni la base. Nada lanza hacia la petición, salvo verificarCupo con su 409.
import { logger } from '#core/config/logger.js';
import { conEmpresa, sinEmpresa } from '#core/tenant/contexto.js';
import { obtenerLicencia, consultarCupo, reportarActivos } from './licencias.cliente.js';
import { crearCache, publica, textoCupo, ENLACES } from './licencias.core.js';

export const TTL_MS = 5 * 60_000;
// Tras un fallo del servicio no se reintenta en cada petición (cada intento puede esperar hasta TIEMPO_MS): se espera esta pausa.
export const PAUSA_TRAS_FALLO_MS = 30_000;

// Se lee process.env en cada llamada (como rutas.service.js): así se prueba con variables y un token vacío apaga todo sin más.
export const configuracion = () => {
  const url = String(process.env.LICENCIAS_URL || '').trim();
  const token = String(process.env.LICENCIAS_TOKEN || '').trim();
  return { url, token, producto: String(process.env.LICENCIAS_PRODUCTO || 'geomatrix').trim(), activo: Boolean(url && token) };
};

let desfaseMs = 0; // solo las pruebas lo mueven, para vencer la caché sin esperar 5 minutos
const ahora = () => Date.now() + desfaseMs;
const cache = crearCache({ ttlMs: TTL_MS, ahora });
const enVuelo = new Map(); // empresaId → promesa de la licencia que ya se está pidiendo (las peticiones simultáneas la comparten)
const pausaHasta = new Map(); // empresaId → hasta cuándo no se vuelve a preguntar tras un fallo
const enPausa = (empresaId) => (pausaHasta.get(empresaId) || 0) > ahora();

// Una línea de log por llamada al servicio: empresa, llamada, resultado y milisegundos.
async function medir(empresaId, llamada, fn) {
  const inicio = Date.now();
  try {
    const r = await fn();
    logger.info({ empresa: empresaId, llamada, resultado: r?.estado || 'ok', ms: Date.now() - inicio }, 'licencias_llamada');
    return r;
  } catch (error) {
    logger.info({ empresa: empresaId, llamada, resultado: error?.codigo || 'error', ms: Date.now() - inicio }, 'licencias_llamada');
    throw error;
  }
}
// 401 = el token de GeoMatrix está mal configurado (ERROR: hay que corregirlo); lo demás es una caída (WARN). En ambos casos se sigue con lo
// último conocido y se deja de preguntar un rato.
function avisarFallo(empresaId, error, evento = 'licencias_fallo') {
  if (error?.status === 401) logger.error({ empresa: empresaId, err: error.message }, 'licencias_token_invalido');
  else logger.warn({ empresa: empresaId, err: error.message }, evento);
  pausaHasta.set(empresaId, ahora() + PAUSA_TRAS_FALLO_MS);
}
// El cupo recién consultado o reportado refresca los números de la licencia en caché (sin alargar su vida).
const anotarCupo = (empresaId, cupo) => {
  if (!cupo || cupo.sin_licencia) return;
  cache.tocar(empresaId, { usuarios_activos: cupo.activos, usuarios_max: cupo.usuarios_max, puede_crear_usuarios: cupo.puede_crear, estado: cupo.estado });
};

async function pedirLicencia(cfg, empresaId, ultima) {
  try {
    const licencia = await medir(empresaId, 'licencia', () => obtenerLicencia(cfg, empresaId));
    // Sin licencia no se bloquea nada (D5), pero debe notarse en el log: una vez por ciclo de caché.
    if (licencia.estado === 'SIN_LICENCIA') logger.warn({ empresa: empresaId }, 'licencias_sin_licencia');
    cache.guardar(empresaId, licencia);
    pausaHasta.delete(empresaId);
    return licencia;
  } catch (error) {
    avisarFallo(empresaId, error);
    return ultima; // la última conocida, o null si nunca se conoció (= se trata como activa)
  }
}

// La licencia cruda de la empresa (lo que respondió Sulotec), { estado: 'SIN_LICENCIA' } o null si está apagado o nunca se pudo leer.
export async function licenciaDe(empresaId, { forzar = false } = {}) {
  const cfg = configuracion();
  if (!cfg.activo || !empresaId) return null;
  const guardada = cache.obtener(empresaId);
  if (guardada?.vigente && !forzar) return guardada.valor;
  if (enPausa(empresaId) && !forzar) return guardada?.valor ?? null;
  if (enVuelo.has(empresaId)) return enVuelo.get(empresaId);
  const pedido = pedirLicencia(cfg, empresaId, guardada?.valor ?? null).finally(() => enVuelo.delete(empresaId));
  enVuelo.set(empresaId, pedido);
  return pedido;
}

// Estado que ya tenemos en caché (aunque esté vencida), sin preguntar nada: null si no se conoce.
export const estadoConocido = (empresaId) => cache.obtener(empresaId)?.valor?.estado ?? null;

export async function licenciaPublica(empresaId, { forzar = false } = {}) {
  return publica(await licenciaDe(empresaId, { forzar }));
}

// El cupo es del plan de la empresa y lo exige Sulotec incluso al administrador universal; a él se le manda a ampliar la licencia, no a renovarla.
const errorSinCupo = ({ activos, usuarios_max, universal }) => Object.assign(new Error(textoCupo({ activos, usuarios_max })), {
  statusCode: 409, code: 'LICENCIA_SIN_CUPO', activos: activos ?? null, usuarios_max: usuarios_max ?? null, enlace: universal ? ENLACES.licencias : ENLACES.miLicencia,
});

// Justo antes de crear un usuario ACTIVO o de reactivar uno (D6): pregunta el cupo en vivo. Sin cupo lanza el 409; si Sulotec no responde se aplica
// la última licencia conocida (si decía que no se podía crear, se respeta) o se permite con aviso.
export async function verificarCupo(empresaId, { universal = false } = {}) {
  const cfg = configuracion();
  if (!cfg.activo || !empresaId) return;
  let cupo;
  try {
    cupo = await medir(empresaId, 'cupo', () => consultarCupo(cfg, empresaId));
  } catch (error) {
    avisarFallo(empresaId, error);
    const ultima = cache.obtener(empresaId)?.valor;
    if (ultima?.puede_crear_usuarios === false) throw errorSinCupo({ activos: ultima.usuarios_activos, usuarios_max: ultima.usuarios_max, universal });
    logger.warn({ empresa: empresaId }, 'licencias_cupo_sin_verificar');
    return;
  }
  anotarCupo(empresaId, cupo);
  if (cupo.puede_crear === false) throw errorSinCupo({ activos: cupo.activos, usuarios_max: cupo.usuarios_max, universal });
}

// Cuenta los usuarios activos de la empresa (cualquier rol, D7) y se lo dice a Sulotec. Nunca lanza: devuelve el cupo que respondió o null.
// Prisma se importa aquí dentro para que las pruebas del módulo no necesiten la base.
export async function reportarActivosDeEmpresa(empresaId) {
  const cfg = configuracion();
  if (!cfg.activo || !empresaId) return null;
  try {
    const { default: prisma } = await import('#core/config/prisma.js');
    const activos = await conEmpresa(empresaId, () => prisma.usuario.count({ where: { estado: 'ACTIVO' } }));
    const cupo = await medir(empresaId, 'usuarios-activos', () => reportarActivos(cfg, empresaId, activos));
    anotarCupo(empresaId, cupo);
    return cupo;
  } catch (error) {
    logger.warn({ empresa: empresaId, err: error?.message }, 'licencias_reporte_fallo');
    return null;
  }
}

// Después de crear, activar, desactivar o eliminar un usuario: se reporta sin esperar la respuesta (la petición de la persona no debe demorarse).
export const reportarLuego = (empresaId) => {
  if (!empresaId || !configuracion().activo) return;
  reportarActivosDeEmpresa(empresaId).catch(() => {});
};

// Al arrancar: cada empresa activa reporta sus usuarios activos, así Sulotec queda alineado aunque algún aviso anterior se haya perdido.
export async function alinearActivosAlArrancar() {
  if (!configuracion().activo) return;
  try {
    const { default: prisma } = await import('#core/config/prisma.js');
    const empresas = await sinEmpresa(() => prisma.empresa.findMany({ where: { estado: 'ACTIVA' }, select: { id_empresa: true } }));
    for (const e of empresas) await reportarActivosDeEmpresa(e.id_empresa);
    logger.info({ empresas: empresas.length }, 'licencias_activos_alineados');
  } catch (error) {
    logger.warn({ err: error?.message }, 'licencias_alineacion_fallo');
  }
}

export const _pruebas = {
  vaciarCache() { cache.vaciar(); enVuelo.clear(); pausaHasta.clear(); desfaseMs = 0; },
  avanzarReloj(ms) { desfaseMs += ms; },
};
