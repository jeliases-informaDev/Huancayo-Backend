// Cliente HTTP del servicio común de licencias de Sulotec (Licencias-Backend). Lógica pura: arma las peticiones y lee las respuestas; quien lo usa
// (licencias.service.js) decide qué hacer si falla. `fetchFn` se inyecta para probarlo sin red. Contrato: Authorization Bearer <token>, todo en
// JSON, errores { error: 'CODIGO', mensaje } y 404 { error: 'SIN_LICENCIA' } cuando la empresa no tiene GeoMatrix contratado.
export const TIEMPO_MS = 3000;

export class ErrorLicencias extends Error {
  constructor(codigo, mensaje, status) {
    super('Licencias ' + codigo + (mensaje ? ': ' + mensaje : ''));
    this.codigo = codigo;
    this.status = status ?? null;
  }
}

const SIN_LICENCIA = 'SIN_LICENCIA';

// Una petición al servicio → { status, body }. Red o tiempo agotado → ErrorLicencias('RED'). El 404 SIN_LICENCIA no es un error sino una
// respuesta (la empresa no tiene el producto); cualquier otro no-2xx lanza con el código que mandó el servicio o HTTP_<status>.
async function pedir({ url, token }, ruta, { metodo = 'GET', cuerpo, fetchFn = fetch } = {}) {
  const direccion = String(url || '').replace(/\/+$/, '') + ruta;
  const opciones = {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(TIEMPO_MS),
    ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }),
  };
  let r;
  try { r = await fetchFn(direccion, opciones); } catch (error) { throw new ErrorLicencias('RED', error?.cause?.message || error?.message || String(error)); }
  const body = await r.json().catch(() => null);
  if (r.status === 404 && body?.error === SIN_LICENCIA) return { status: 404, body };
  if (r.status < 200 || r.status >= 300) throw new ErrorLicencias(body?.error || 'HTTP_' + r.status, body?.mensaje, r.status);
  if (!body || typeof body !== 'object') throw new ErrorLicencias('RESPUESTA_INVALIDA', 'La respuesta del servicio no es JSON', r.status);
  return { status: r.status, body };
}

const rutaDe = (empresaUuid, sufijo = '') => `/v1/licencias/${encodeURIComponent(String(empresaUuid))}${sufijo}`;

// (a) La licencia completa de la empresa; { estado: 'SIN_LICENCIA' } si no tiene GeoMatrix contratado.
export async function obtenerLicencia(cfg, empresaUuid, opts = {}) {
  const { status, body } = await pedir(cfg, rutaDe(empresaUuid), opts);
  return status === 404 ? { estado: SIN_LICENCIA } : body;
}

// (b) ¿Puede crear o reactivar un usuario? { puede_crear, activos, usuarios_max, estado }. Sin licencia no hay cupo que exigir.
export async function consultarCupo(cfg, empresaUuid, opts = {}) {
  const { status, body } = await pedir(cfg, rutaDe(empresaUuid, '/cupo'), opts);
  return status === 404 ? { estado: SIN_LICENCIA, puede_crear: true, sin_licencia: true } : body;
}

// (c) Avisa cuántos usuarios activos tiene la empresa; responde igual que (b).
export async function reportarActivos(cfg, empresaUuid, activos, opts = {}) {
  const { status, body } = await pedir(cfg, rutaDe(empresaUuid, '/usuarios-activos'), { ...opts, metodo: 'PUT', cuerpo: { activos: Number(activos) } });
  return status === 404 ? { estado: SIN_LICENCIA, sin_licencia: true } : body;
}
