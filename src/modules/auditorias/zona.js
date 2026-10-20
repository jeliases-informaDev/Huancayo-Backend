// Zona de trabajo de un auditor (usuarios.departamento). Es un texto libre que escribe quien crea el usuario, así que no
// puede compararse "tal cual" con el departamento del expediente: «Lince, Lima» nunca igualaba a «LIMA» y el auditor
// quedaba sin poder recibir ni tomar casos.
//
// Cómo se lee:
//  - Cada zona es una lista de nombres separados por coma (también «/» o « - »): «Lince, Lima» = el distrito Lince de Lima.
//    Un expediente pertenece a la zona si TODOS esos nombres coinciden con su distrito, su provincia o su departamento.
//  - Varias zonas se separan con punto y coma (o salto de línea): «Junín; Lima» = todo Junín y todo Lima.
//  - Si todos los nombres de una lista son departamentos del Perú («Junín, Lima»), se leen como varias zonas: así se
//    comportan los usuarios que ya se crearon con el ejemplo anterior del formulario.
// Mayúsculas y tildes no cuentan.

export const DEPARTAMENTOS_PERU = [
  'amazonas', 'ancash', 'apurimac', 'arequipa', 'ayacucho', 'cajamarca', 'callao', 'cusco', 'huancavelica', 'huanuco',
  'ica', 'junin', 'la libertad', 'lambayeque', 'lima', 'loreto', 'madre de dios', 'moquegua', 'pasco', 'piura', 'puno',
  'san martin', 'tacna', 'tumbes', 'ucayali',
];

export function normalizarTexto(valor) {
  return String(valor || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
}

// «Lince, Lima; Junín» → [['lince', 'lima'], ['junin']] (nombres ya normalizados, sin vacíos ni repetidos)
export function interpretarZona(texto) {
  const zonas = [];
  for (const bloque of String(texto || '').split(/[;\n|]+/)) {
    const nombres = [...new Set(bloque.split(/,|\/|\s[-–—]\s/).map(normalizarTexto).filter(Boolean))];
    if (!nombres.length) continue;
    if (nombres.length > 1 && nombres.every((n) => DEPARTAMENTOS_PERU.includes(n))) nombres.forEach((n) => zonas.push([n]));
    else zonas.push(nombres);
  }
  return zonas;
}

function lugaresDe(expediente) {
  return [expediente.distrito, expediente.provincia, expediente.departamento].map(normalizarTexto).filter(Boolean);
}

// Sin zona escrita no hay restricción (se conserva la regla anterior). Un expediente sin ninguna ubicación tampoco se
// puede juzgar, y se deja pasar como antes.
export function zonaIncluye(textoZona, expediente) {
  const zonas = interpretarZona(textoZona);
  if (!zonas.length) return true;
  const lugares = lugaresDe(expediente);
  if (!lugares.length) return true;
  return zonas.some((nombres) => nombres.every((n) => lugares.includes(n)));
}

// El mismo criterio como filtro de Prisma, para la lista «Disponibles». Con la colación del servidor (utf8mb4_unicode_ci)
// la igualdad ya ignora mayúsculas y tildes. Devuelve null si el texto no trae ninguna zona.
export function filtroDeZona(textoZona) {
  const zonas = interpretarZona(textoZona);
  if (!zonas.length) return null;
  const coincide = (nombre) => ({ OR: [{ distrito: nombre }, { provincia: nombre }, { departamento: nombre }] });
  return { OR: zonas.map((nombres) => ({ AND: nombres.map(coincide) })) };
}
