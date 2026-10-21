// Cubetas de tiempo para los gráficos del Resumen (asignaciones por día, por semana o por mes). Funciones puras: reciben las fechas ya
// convertidas a «día local» y devuelven siempre todas las cubetas (con 0 donde no hubo nada) para que el gráfico no tenga huecos.

export const PERIODOS = { diario: { cubetas: 7 }, semanal: { cubetas: 8 }, mensual: { cubetas: 6 } };
const DIA_MS = 24 * 60 * 60 * 1000;

export const aFecha = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const aIso = (fecha) => fecha.toISOString().slice(0, 10);
const sumarDias = (fecha, n) => new Date(fecha.getTime() + n * DIA_MS);

// Rango de cada cubeta, de la más antigua a la más reciente, terminando en el día `hasta` (AAAA-MM-DD, día local del usuario).
//  diario: 7 días · semanal: 8 bloques de 7 días hacia atrás · mensual: 6 meses de calendario (el último, el mes de `hasta`)
export function cubetasDe(periodo, hasta) {
  const { cubetas } = PERIODOS[periodo];
  const fin = aFecha(hasta);
  const lista = [];
  if (periodo === 'mensual') {
    for (let i = cubetas - 1; i >= 0; i -= 1) {
      const inicio = new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth() - i, 1));
      const ultimo = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + 1, 0));
      lista.push({ inicio: aIso(inicio), fin: aIso(i === 0 ? fin : ultimo) });
    }
  } else {
    const largo = periodo === 'semanal' ? 7 : 1;
    for (let i = cubetas - 1; i >= 0; i -= 1) {
      const finCubeta = sumarDias(fin, -i * largo);
      lista.push({ inicio: aIso(sumarDias(finCubeta, -(largo - 1))), fin: aIso(finCubeta) });
    }
  }
  return lista;
}

// Suma el conteo por día (`porDia`: Map AAAA-MM-DD → n) dentro de cada cubeta.
export function agruparPorCubeta(cubetas, porDia) {
  return cubetas.map((c) => {
    let total = 0;
    for (let d = aFecha(c.inicio); aIso(d) <= c.fin; d = sumarDias(d, 1)) total += porDia.get(aIso(d)) || 0;
    return { ...c, total };
  });
}
