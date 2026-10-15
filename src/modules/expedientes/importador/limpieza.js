// Limpieza de valores del archivo de la base de Caja Huancayo.
// El archivo llega del sistema core con TODO como texto: números y fechas escritos como
// cadena, la palabra NULL para vacíos, rellenos de espacios y '-.-' como "sin dato".

const VACIOS = new Set(['', 'NULL', '-.-', 'N/A', '#N/A']);

export function esVacio(valor) {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string') return VACIOS.has(valor.trim().toUpperCase());
  return false;
}

// Texto sin rellenos ni espacios repetidos. Vacío → null.
export function texto(valor, max) {
  if (esVacio(valor)) return null;
  if (valor instanceof Date) return fecha(valor);
  const limpio = String(valor).replace(/\s+/g, ' ').trim();
  if (!limpio || limpio === '-') return null;
  return max ? limpio.slice(0, max) : limpio;
}

export function numero(valor) {
  if (esVacio(valor)) return null;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  const n = Number(String(valor).trim().replace(/,/g, '.'));
  return Number.isFinite(n) ? n : null;
}

export function entero(valor) {
  const n = numero(valor);
  return n === null ? null : Math.round(n);
}

// dd-mm-aaaa (formato del core), aaaa-mm-dd o Date → 'AAAA-MM-DD'. Fechas imposibles → null.
export function fecha(valor) {
  if (esVacio(valor)) return null;
  let d;
  let m;
  let a;
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return null;
    [a, m, d] = [valor.getUTCFullYear(), valor.getUTCMonth() + 1, valor.getUTCDate()];
  } else {
    const s = String(valor).trim();
    let hit = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (hit) { [d, m, a] = [Number(hit[1]), Number(hit[2]), Number(hit[3])]; }
    else {
      hit = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!hit) return null;
      [a, m, d] = [Number(hit[1]), Number(hit[2]), Number(hit[3])];
    }
  }
  if (a < 1900 || a > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const probe = new Date(Date.UTC(a, m - 1, d));
  if (probe.getUTCMonth() !== m - 1) return null;
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// "120", "48 MESES", "5 AÑOS" → meses. Lo que no se reconoce → null (el texto original se conserva aparte).
export function antiguedadEnMeses(valor) {
  const t = texto(valor);
  if (!t) return null;
  const hit = t.match(/^(\d+(?:[.,]\d+)?)\s*(M(?:ESES|ES)?|A(?:[ÑN�]OS?)?)?$/i);
  if (!hit) return null;
  const n = Number(hit[1].replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  const unidad = (hit[2] || 'M').toUpperCase();
  return Math.round(unidad.startsWith('M') ? n : n * 12);
}

// Carácter de reemplazo U+FFFD: señal de que el archivo perdió una Ñ o un acento al exportarse.
export function tieneTextoDanado(valor) {
  return typeof valor === 'string' && valor.includes('�');
}

export function normalizarClave(valor) {
  return String(valor || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
}
