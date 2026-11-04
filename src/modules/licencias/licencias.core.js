// Reglas de la licencia de GeoMatrix (lógica pura: sin red ni base, para poder probarlas solas). La única verdad de la licencia de cada empresa es
// el servicio común de licencias de Sulotec; GeoMatrix se licencia solo por usuarios y no decide reglas: aquí solo se traduce el estado que ese
// servicio respondió a qué peticiones pasan, cuáles se bloquean y qué texto ve la persona. Ante la duda (estado nulo o desconocido) se permite.
export const ENLACES = Object.freeze({ miLicencia: 'https://sulotec.com/mi-licencia', licencias: 'https://sulotec.com/licencias', contacto: 'contacto@sulotec.com' });

// Textos que ve la persona por cada estado (ACTIVA no necesita aviso). Se consultan con hasOwn para que un estado raro no pesque nada del prototipo.
const MENSAJES = Object.freeze({
  ACTIVA: '',
  SOLO_LECTURA: 'La licencia de GeoMatrix de tu empresa venció: puedes consultar la información, pero no registrar cambios. Renueva en Sulotec.',
  SUSPENDIDA: 'La licencia de GeoMatrix de tu empresa está suspendida: no se pueden registrar cambios. Escribe a contacto@sulotec.com.',
  CANCELADA: 'La licencia de GeoMatrix de tu empresa está cancelada. Escribe a contacto@sulotec.com.',
  SIN_LICENCIA: 'Esta empresa no tiene una licencia de GeoMatrix registrada en Sulotec.',
});
export const mensajeDeEstado = (estado) => (Object.hasOwn(MENSAJES, String(estado)) ? MENSAJES[estado] : '');
export const textoCupo = ({ activos, usuarios_max }) => `Tu plan llegó al máximo de usuarios activos (${activos} de ${usuarios_max}). Desactiva un usuario o amplía tu licencia en Sulotec.`;

// Código del 403 por cada estado que bloquea. Los demás estados (ACTIVA, SIN_LICENCIA, nulo o uno nuevo que aún no conocemos) no bloquean.
const CODIGOS = Object.freeze({ SOLO_LECTURA: 'LICENCIA_SOLO_LECTURA', SUSPENDIDA: 'LICENCIA_SUSPENDIDA', CANCELADA: 'LICENCIA_CANCELADA' });
const codigoDe = (estado) => (Object.hasOwn(CODIGOS, String(estado)) ? CODIGOS[estado] : null);

const LEE = new Set(['GET', 'HEAD', 'OPTIONS']);
// Rutas que nunca se bloquean: la sesión, los términos, el catálogo de empresas y la propia licencia (sin ellas nadie podría ni ver el aviso).
const PREFIJOS_EXENTOS = Object.freeze(['/api/auth', '/api/terminos', '/api/empresas', '/api/licencia']);
const USUARIO = /^\/api\/usuarios\/[^/]+$/; // PUT, PATCH o DELETE /api/usuarios/:id
const USUARIO_RESET = /^\/api\/usuarios\/[^/]+\/(mfa|device)\/reset$/;

// La ruta se compara sin query ni barra final; el método, en mayúsculas.
const normalizar = (ruta) => String(ruta || '').split('?')[0].replace(/\/+$/, '') || '/';
const bajo = (ruta, prefijo) => ruta === prefijo || ruta.startsWith(prefijo + '/');

// Peticiones que no se miran nunca (D2): las lecturas, el administrador universal de Sulotec, lo que no es de ninguna empresa, las rutas exentas y
// las escrituras que no son trabajo (la posición del celular, trazar una ruta, cerrar la jornada y apagar el modo pruebas deben poder hacerse siempre).
export function esExenta({ metodo, baseUrl, ruta, body, rol, empresaId }) {
  const m = String(metodo || '').toUpperCase();
  if (LEE.has(m)) return true;
  if (rol === 'UNIVERSAL') return true;
  if (!empresaId) return true;
  const r = normalizar(ruta);
  const base = baseUrl ? normalizar(baseUrl) : null;
  if (PREFIJOS_EXENTOS.some((p) => bajo(r, p) || (base && bajo(base, p)))) return true;
  if (m === 'PATCH' && r === '/api/visitas/ubicacion') return true;
  if (m === 'POST' && r === '/api/rutas/trazar') return true;
  if (m === 'POST' && r === '/api/visitas/jornada' && body?.accion === 'TERMINAR') return true;
  if (m === 'PUT' && r === '/api/limpieza/modo-pruebas') return true;
  return false;
}

// SOLO_LECTURA (D3): se puede administrar la gente que ya hay (editar, desactivar, eliminar, reiniciar MFA o celular) y cerrar las llaves de
// autoasignación y tope de casos, pero no crear ni reactivar usuarios (eso ocupa cupo) ni registrar trabajo.
const permiteEnSoloLectura = ({ metodo, ruta, body }) => {
  if (USUARIO.test(ruta)) {
    if (metodo === 'DELETE') return true;
    if ((metodo === 'PUT' || metodo === 'PATCH') && body?.estado !== 'ACTIVO') return true;
  }
  if (metodo === 'POST' && USUARIO_RESET.test(ruta)) return true;
  if (metodo === 'PUT' && (ruta === '/api/asignaciones/autoasignacion' || ruta === '/api/asignaciones/tope-casos')) return true;
  return false;
};
// SUSPENDIDA o CANCELADA (D4): solo las bajas de usuarios (desactivar o eliminar).
const permiteSoloBajas = ({ metodo, ruta, body }) => USUARIO.test(ruta) && (metodo === 'DELETE' || ((metodo === 'PUT' || metodo === 'PATCH') && body?.estado === 'INACTIVO'));

// Qué hacer con una petición dado el estado de la licencia: { permitir: true } o { permitir: false, statusCode: 403, code, mensaje }.
export function decidir({ metodo, baseUrl, ruta, body, rol, empresaId, estado }) {
  const datos = { metodo: String(metodo || '').toUpperCase(), baseUrl, ruta: normalizar(ruta), body, rol, empresaId };
  if (esExenta(datos)) return { permitir: true };
  const code = codigoDe(estado);
  if (!code) return { permitir: true };
  const permite = estado === 'SOLO_LECTURA' ? permiteEnSoloLectura : permiteSoloBajas;
  if (permite(datos)) return { permitir: true };
  return { permitir: false, statusCode: 403, code, mensaje: mensajeDeEstado(estado) };
}

// Lo que ven el panel y la app (D9). null = licencias apagadas o nunca se pudo leer (no se muestra nada).
export function publica(licencia) {
  if (!licencia) return null;
  const estado = licencia.estado ?? null;
  const vacia = { plan: null, usuarios_max: null, usuarios_activos: null, puede_crear_usuarios: null, vencimiento: null, dias_para_vencer: null };
  if (estado === 'SIN_LICENCIA') return { estado, ...vacia, mensaje: mensajeDeEstado(estado), enlace: ENLACES.miLicencia };
  return {
    estado,
    plan: licencia.plan ?? null, usuarios_max: licencia.usuarios_max ?? null, usuarios_activos: licencia.usuarios_activos ?? null,
    puede_crear_usuarios: licencia.puede_crear_usuarios ?? null, vencimiento: licencia.vencimiento ?? null, dias_para_vencer: licencia.dias_para_vencer ?? null,
    mensaje: mensajeDeEstado(estado), enlace: ENLACES.miLicencia,
  };
}

// Caché por empresa con vencimiento. Una entrada vencida no se borra sola: se devuelve marcada como no vigente, porque ante una caída del
// servicio la última licencia conocida vale más que nada. La memoria está acotada: pasado el tope se borra lo vencido y, si aún sobra, lo
// más antiguo. `ahora` se inyecta para probarla sin esperar.
export function crearCache({ ttlMs = 5 * 60_000, maximo = 500, ahora = () => Date.now() } = {}) {
  const filas = new Map(); // empresaId → { valor, vence }
  return {
    obtener(empresaId) {
      const fila = filas.get(empresaId);
      return fila ? { valor: fila.valor, vigente: fila.vence > ahora() } : null;
    },
    guardar(empresaId, valor) {
      filas.delete(empresaId); // vuelve al final: el Map guarda el orden de llegada y es lo primero que se poda
      filas.set(empresaId, { valor, vence: ahora() + ttlMs });
      if (filas.size > maximo) {
        const t = ahora();
        for (const [k, f] of filas) if (f.vence <= t) filas.delete(k);
        for (const k of filas.keys()) { if (filas.size <= maximo) break; filas.delete(k); }
      }
    },
    // Mezcla datos frescos (p. ej. el cupo recién consultado) sin renovar el vencimiento: la licencia completa se vuelve a pedir cuando toque.
    tocar(empresaId, parcial) {
      const fila = filas.get(empresaId);
      if (!fila) return false;
      fila.valor = { ...fila.valor, ...parcial };
      return true;
    },
    olvidar(empresaId) { filas.delete(empresaId); },
    vaciar() { filas.clear(); },
    tamano() { return filas.size; },
  };
}
