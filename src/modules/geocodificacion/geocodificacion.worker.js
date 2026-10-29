// Trabajador en segundo plano: toma lotes de direcciones pendientes y las ubica. Apagado por defecto (GEOCODING_WORKER_ENABLED=true para
// encenderlo): enviar direcciones de clientes a un proveedor externo de mapas requiere que el banco lo autorice.
import { logger } from '#core/config/logger.js';
import { borrarSugerenciasVencidas, geocodificacionActiva, geocodificarPendientes } from './geocodificacion.service.js';
import { tamanoMaximoLote } from './proveedores.js';
import { conEmpresa } from '#core/tenant/contexto.js';
import { listarActivas } from '#modules/empresas/empresas.service.js';

const LOTE = Math.min(Math.max(Number(process.env.GEOCODING_BATCH_SIZE) || 5, 1), tamanoMaximoLote());
const CONTINUAR_MS = 2000; // si el lote salió completo hay más en cola: se sigue casi de inmediato
const INTERVALO_MS = Math.max(Number(process.env.GEOCODING_INTERVAL_MS) || 30000, 5000);

let iniciado = false;
let procesando = false;
let temporizador = null;
let ultimaLimpieza = 0;
const LIMPIEZA_MS = 60 * 60 * 1000; // las sugerencias temporales vencidas se borran una vez por hora

function programar(ms = INTERVALO_MS) {
  if (!iniciado) return;
  temporizador = setTimeout(ciclo, ms);
}

async function ciclo() {
  temporizador = null;
  if (!iniciado) return;
  if (procesando) { programar(); return; }
  procesando = true;
  let siguiente = INTERVALO_MS;
  try {
    // Una empresa por vez: la cola de direcciones de cada una se procesa dentro de su propio contexto.
    const r = { procesados: 0, detenido: false };
    const limpiar = Date.now() - ultimaLimpieza > LIMPIEZA_MS;
    if (limpiar) ultimaLimpieza = Date.now();
    for (const empresa of await listarActivas()) {
      if (limpiar) {
        const vencidas = await conEmpresa(empresa.id_empresa, () => borrarSugerenciasVencidas());
        if (vencidas.domicilios || vencidas.negocios) logger.info({ empresa: empresa.id_empresa, ...vencidas }, 'geocodificacion_sugerencias_vencidas');
      }
      const parcial = await conEmpresa(empresa.id_empresa, () => geocodificarPendientes({ limit: LOTE }));
      if (parcial.tope) { logger.info({ proveedor: parcial.proveedor, motivo: parcial.detenido }, 'geocodificacion_tope_mensual'); r.detenido = true; break; }
      r.procesados += parcial.procesados || 0; r.detenido = r.detenido || Boolean(parcial.detenido);
      if (r.procesados >= LOTE) break;
    }
    // Con el servidor público de OpenStreetMap se mantiene siempre el ritmo lento; solo un proveedor con clave avanza rápido.
    if (tamanoMaximoLote() > 20 && !r.detenido && r.procesados >= LOTE) siguiente = CONTINUAR_MS;
    if (r.procesados > 0) logger.info(r, 'geocodificacion_lote_listo');
  } catch (error) {
    logger.error({ err: error }, 'geocodificacion_worker_fallo');
  } finally {
    procesando = false;
    programar(siguiente);
  }
}

export function iniciarGeocodificacion() {
  if (iniciado) return;
  if (!geocodificacionActiva()) { logger.info('geocodificacion_worker_desactivado'); return; }
  iniciado = true;
  logger.info({ lote: LOTE, intervaloMs: INTERVALO_MS }, 'geocodificacion_worker_iniciado');
  temporizador = setTimeout(ciclo, 5000);
}

export function detenerGeocodificacion() {
  iniciado = false;
  if (temporizador) { clearTimeout(temporizador); temporizador = null; }
}
