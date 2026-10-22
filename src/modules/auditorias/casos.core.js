// Piezas puras de los casos de un asesor (tope de casos abiertos y quitar casos): sin base de datos, para probarlas solas.

// Por qué se le quitan los casos a un asesor. DESACTIVADO lo pone el sistema cuando se da de baja la cuenta; CANCELADA, la cancelación
// de un solo caso desde el panel. Los demás los elige quien quita los casos.
export const MOTIVOS_QUITAR = Object.freeze(['ENFERMEDAD', 'RETIRO', 'REASIGNACION', 'OTRO']);
export const MOTIVOS_FIN = Object.freeze([...MOTIVOS_QUITAR, 'DESACTIVADO', 'CANCELADA']);

// A dónde van los casos que se quitan: DISPONIBLES (quedan pendientes y cualquier asesor puede tomarlos) o ASESOR (pasan a otro asesor).
export const DESTINOS_QUITAR = Object.freeze(['DISPONIBLES', 'ASESOR']);

// Casos que se quitan en cada vuelta: así una sola petición nunca arma una sentencia gigante aunque el asesor tenga miles.
export const LOTE_QUITAR = 500;

// El tope se guarda como texto en la configuración. Un valor ausente o raro vuelve al predeterminado; 0 significa «sin tope».
export function interpretarTope(valor, porDefecto) {
  const n = Number(valor);
  return valor !== null && valor !== undefined && valor !== '' && Number.isInteger(n) && n >= 0 ? n : porDefecto;
}

// Con tope 0 nunca se alcanza. `abiertos` son los casos activos que el asesor ya tiene.
export const topeAlcanzado = ({ abiertos, tope }) => tope > 0 && abiertos >= tope;

export const mensajeTope = ({ abiertos, tope }) =>
  `Ya tienes ${abiertos} casos abiertos y el máximo es ${tope}. Termina o devuelve alguno para poder tomar otro.`;

// Cuántos casos más puede tomar (null = sin límite). Sirve para que la app avise antes de que el servidor rechace.
export const cupoRestante = ({ abiertos, tope }) => (tope > 0 ? Math.max(0, tope - abiertos) : null);

// Parte una lista en trozos de `n` (el último puede ser más corto).
export function trozos(lista, n) {
  const salida = [];
  for (let i = 0; i < lista.length; i += n) salida.push(lista.slice(i, i + n));
  return salida;
}
