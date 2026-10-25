import crypto from 'node:crypto';

// Sello de integridad del registro de auditoría (lógica pura, probada sola). Cada anotación lleva un número correlativo (`secuencia`) y una huella
// SHA-256 (`sello`) calculada sobre su contenido y sobre el sello de la anotación anterior (`sello_previo`): una cadena. Si alguien modifica una
// anotación, su sello deja de coincidir; si borra una, la siguiente ya no enlaza; si inserta una en medio, los números saltan. Verificar la cadena
// es recorrerla y recalcular. La primera anotación enlaza con GENESIS.
export const GENESIS = '0'.repeat(64);

// Columnas que entran en la huella, en este orden fijo. `sello` queda fuera (es el resultado); `sello_previo` entra para encadenar.
export const CAMPOS_SELLADOS = Object.freeze([
  'secuencia', 'sello_previo', 'id_auditoria', 'empresa_id', 'fecha', 'request_id', 'actor_id', 'actor', 'rol', 'metodo', 'ruta', 'estado_http',
  'ip_address', 'ip_hash', 'user_agent', 'device_id', 'mock_location', 'entidad', 'entidad_id', 'valor_anterior', 'valor_nuevo',
  'accion', 'categoria', 'severidad', 'plataforma', 'con_cambios',
]);

// Forma canónica de un valor: la misma huella salga de donde salga la fila. Claves ordenadas en todos los niveles (la base guarda el JSON con
// otro orden), sin espacios, fechas en ISO con milisegundos, undefined y null iguales.
export function canonico(valor) {
  if (valor === undefined || valor === null) return 'null';
  if (valor instanceof Date) return JSON.stringify(valor.toISOString());
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  if (typeof valor === 'object') {
    const claves = Object.keys(valor).sort();
    return `{${claves.map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(',')}}`;
  }
  if (typeof valor === 'number' && !Number.isFinite(valor)) return 'null';
  if (typeof valor === 'bigint') return String(valor);
  return JSON.stringify(valor);
}

export function calcularSello(fila) {
  const base = CAMPOS_SELLADOS.map((c) => canonico(fila[c])).join('\n');
  return crypto.createHash('sha256').update(base, 'utf8').digest('hex');
}

// Recorre filas consecutivas (ordenadas por secuencia ascendente) y devuelve la primera rotura, o el estado para seguir con el siguiente lote.
// `estado` = { sello, secuencia } de la anotación anterior a la primera (GENESIS y null si la cadena empieza en 1).
export function verificarCadena(filas, estado = { sello: GENESIS, secuencia: null }) {
  let { sello: previo, secuencia: secuenciaPrevia } = estado;
  for (const f of filas) {
    if (secuenciaPrevia !== null && f.secuencia !== secuenciaPrevia + 1) {
      return { ok: false, secuencia: f.secuencia, motivo: 'SALTO', detalle: `falta la anotación n.° ${secuenciaPrevia + 1}: fue borrada o nunca se selló` };
    }
    if (f.sello_previo !== previo) return { ok: false, secuencia: f.secuencia, motivo: 'ENLACE', detalle: 'no enlaza con la anotación anterior: la anterior fue modificada o reemplazada' };
    if (f.sello !== calcularSello(f)) return { ok: false, secuencia: f.secuencia, motivo: 'CONTENIDO', detalle: 'su contenido no coincide con su sello: fue modificada' };
    previo = f.sello; secuenciaPrevia = f.secuencia;
  }
  return { ok: true, sello: previo, secuencia: secuenciaPrevia };
}
