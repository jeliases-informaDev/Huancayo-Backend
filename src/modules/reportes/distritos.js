// Distritos del Resumen: a dónde van los asesores. Por cada distrito del expediente se cuentan las visitas hechas y los casos asignados en los últimos
// 30 días, así la tarjeta no queda en blanco mientras los asesores ya tienen casos pero todavía no han visitado. Pieza pura, sin base de datos.

export const MAX_DISTRITOS = 5;
// La primera versión de la tarjeta (solo visitas) mostraba 4; los paneles que aún no se actualizaron siguen leyendo ese campo.
const MAX_DISTRITOS_VISITADOS = 4;

// Las filas llegan de la base con los conteos como BigInt o texto: se pasan a números normales. Vienen ya ordenadas (más visitas, luego más asignados).
export function formaDistritos(filas = []) {
  const distritos = filas
    .map((f) => ({ distrito: String(f.distrito ?? '').trim(), visitas: Number(f.visitas) || 0, asignados: Number(f.asignados) || 0 }))
    .filter((d) => d.distrito && (d.visitas > 0 || d.asignados > 0))
    .slice(0, MAX_DISTRITOS);
  return {
    distritos_actividad: distritos,
    distritos_visitados: distritos.filter((d) => d.visitas > 0).slice(0, MAX_DISTRITOS_VISITADOS).map(({ distrito, visitas }) => ({ distrito, visitas })),
  };
}
