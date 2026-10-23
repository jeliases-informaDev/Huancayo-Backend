// Piezas puras de la jornada de campo (zona de trabajo e historial): sin base de datos, para probarlas solas.

// Una jornada abierta de hace más horas que esto no se «reinicia» al iniciar otra: se da por sin cierre (nunca la terminó), porque su hora de fin sería un invento.
export const HORAS_MAXIMAS_DE_REINICIO = 16;

const limpio = (valor) => String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, 100) || null;

// «Chilca, Huancayo, Junín»: los nombres que haya, de lo más cercano a lo más amplio y sin repetir seguidos (en Huancayo el distrito y la provincia se llaman igual).
export function textoZona({ distrito, provincia, departamento } = {}) {
  const partes = [distrito, provincia, departamento].map((p) => String(p || '').trim()).filter(Boolean);
  return partes.filter((p, i) => i === 0 || p.toLowerCase() !== partes[i - 1].toLowerCase()).join(', ');
}

// La zona que manda la app al iniciar la jornada, ya limpia. `actualizaZona` dice si debe reemplazar la zona de trabajo del usuario: solo con una posición
// real (con una simulada o sin posición la zona anterior se queda, porque no se sabe dónde está). Con posición pero sin nombres (el celular no pudo
// averiguarlos) la zona del usuario queda en blanco con la fecha de hoy, en vez de dejar la de ayer como si siguiera valiendo.
export function zonaDeJornada(cuerpo = {}) {
  const tienePosicion = Number.isFinite(cuerpo.latitud) && Number.isFinite(cuerpo.longitud);
  const zona = {
    latitud: tienePosicion ? cuerpo.latitud : null,
    longitud: tienePosicion ? cuerpo.longitud : null,
    precision_metros: tienePosicion && Number.isFinite(cuerpo.precision) ? cuerpo.precision : null,
    simulada: tienePosicion && cuerpo.simulada === true,
    distrito: tienePosicion ? limpio(cuerpo.distrito) : null,
    provincia: tienePosicion ? limpio(cuerpo.provincia) : null,
    departamento: tienePosicion ? limpio(cuerpo.departamento) : null,
  };
  return { ...zona, tienePosicion, actualizaZona: tienePosicion && !zona.simulada, texto: textoZona(zona) };
}

// Qué pasa con una jornada que sigue abierta cuando el auditor inicia otra.
export function cierreAlReiniciar({ inicio, ahora }) {
  const horas = (new Date(ahora) - new Date(inicio)) / 3_600_000;
  return horas <= HORAS_MAXIMAS_DE_REINICIO ? { cierre: 'REINICIADA', fin: new Date(ahora) } : { cierre: 'SIN_CIERRE', fin: null };
}

// Minutos que duró una jornada (null si sigue abierta o no tiene fin).
export const duracionMin = ({ inicio, fin }) => (fin ? Math.max(0, Math.round((new Date(fin) - new Date(inicio)) / 60_000)) : null);

// ---------------------------------------------------------------- páginas del historial: cursor (inicio, id) de la última jornada vista
export const codificarCursorJornada = (inicio, id) => Buffer.from(`${new Date(inicio).toISOString()}|${id}`).toString('base64url');
export function decodificarCursorJornada(cursor) {
  try {
    const [f, id] = Buffer.from(String(cursor), 'base64url').toString('utf8').split('|');
    const inicio = new Date(f);
    return Number.isNaN(inicio.getTime()) || !/^\d{1,10}$/.test(id || '') ? null : { inicio, id: Number(id) };
  } catch { return null; }
}
