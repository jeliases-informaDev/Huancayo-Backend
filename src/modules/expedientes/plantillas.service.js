// Plantillas de Excel descargables desde el panel («Cargar expedientes»): una por formato que la empresa acepta, con los
// encabezados exactos, filas de ejemplo con datos inventados y una hoja de instrucciones. Así nadie tiene que adivinar columnas.
import { PRODUCTO } from '#core/config/producto.js';
import ExcelJS from 'exceljs';
import { COLUMNAS_CORE } from './importador/columnas-core.js';
import { COLUMNAS_CONSUMO_BANCO } from './importador/columnas-consumo.js';
import { construirFilaCore, filaCoreComoArreglo } from './importador/muestra-core.js';
import { construirFilaConsumoBanco, filaConsumoBancoComoArreglo } from './importador/muestra-consumo.js';

export const FORMATOS = Object.freeze(['CORE_262', 'SIMPLE']);

// Formato SIMPLE: las columnas que lee procesarLoteSimple (las cinco primeras son obligatorias).
export const COLUMNAS_SIMPLE = Object.freeze([
  'codigo_expediente', 'tipo_credito', 'numero_documento_cliente', 'nombres_cliente', 'asesor_responsable',
  'tipo_documento_cliente', 'oficina', 'telefono_cliente', 'direccion_domicilio', 'distrito', 'provincia', 'departamento',
  'latitud', 'longitud', 'monto_desembolso', 'moneda',
]);

const EJEMPLOS_SIMPLE = [
  ['CR-2026-000101', 'OTROS', '45678912', 'QUISPE HUAMAN, MARIA ELENA', 'RIVAS/LAUREANO,LORENA MEDALI', 'DNI', 'AG. COMAS', '987654321', 'AV. SAN MARTIN 840 INT. 2', 'COMAS', 'LIMA', 'LIMA', -11.9332, -77.0541, 12000, 'PEN'],
  ['CR-2026-000102', 'CONSUMO', '41234567', 'FLORES ROJAS, JOSE LUIS', 'CRUZ/FERNANDEZ,EVELYN PAMELA', 'DNI', 'AG. LOS OLIVOS', '912345678', 'AV. ALFREDO MENDIOLA 2550 DPTO. 301', 'LOS OLIVOS', 'LIMA', 'LIMA', -11.9779, -77.0712, 8500, 'PEN'],
  ['CR-2026-000103', 'OTROS', '20123456789', 'COMERCIAL TORRES S.A.C.', 'TORRES/VILCA,JORGE LUIS', 'RUC', 'AG. EL TAMBO', '964123456', 'AV. MARISCAL CASTILLA 1230', 'EL TAMBO', 'HUANCAYO', 'JUNIN', -12.0471, -75.2162, 35000, 'PEN'],
];

function hojaInstrucciones(wb, lineas) {
  const ws = wb.addWorksheet('Instrucciones');
  ws.getColumn(1).width = 120;
  lineas.forEach((texto, i) => { const fila = ws.addRow([texto]); if (i === 0) fila.font = { bold: true, size: 13 }; });
}

function ajustarEncabezado(ws) {
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8ECF9' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

// `tipo` (CONSUMO u OTROS): en la plantilla CORE_262 elige la ficha completa (CONSUMO = la base de Consumo del banco, 297 columnas, hoja CONSUMO; sin tipo u OTROS =
// las 262 columnas de la base MYPE, hoja OTROS). En la SIMPLE solo cambia el tipo de las filas de ejemplo.
export async function generarPlantilla(formato, { ejemplos = 3, tipo } = {}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = PRODUCTO;
  if (formato === 'CORE_262' && tipo === 'CONSUMO') {
    const ws = wb.addWorksheet('CONSUMO');
    ws.addRow(COLUMNAS_CONSUMO_BANCO);
    for (let i = 0; i < ejemplos; i += 1) ws.addRow(filaConsumoBancoComoArreglo(construirFilaConsumoBanco(i)));
    ajustarEncabezado(ws);
    COLUMNAS_CONSUMO_BANCO.forEach((c, i) => { ws.getColumn(i + 1).width = Math.min(40, Math.max(12, c.length + 2)); });
    hojaInstrucciones(wb, [
      `Plantilla de CONSUMO (${COLUMNAS_CONSUMO_BANCO.length} columnas): la base de Consumo tal como la entrega Caja Huancayo, con los mismos nombres de columna.`,
      'Qué trae: el cliente y su domicilio, el empleador (cNomEmp1/cDirEmp1…), el crédito, el historial con hasta 4 créditos anteriores (cLinCre1… cCuoMasAtr4), hasta 3 ingresos (cDesConsum1… nMonIngDeu3), la calificación SBS y el endeudamiento del cliente (cNomIfi1…) y del cónyuge (cNomIfiConyu1…).',
      'El balance, el estado de resultados y las líneas de ingreso del negocio (cActNoCor… nCanEstFin5) son de la evaluación MYPE: en Consumo van vacíos o en cero.',
      'La hoja debe llamarse CONSUMO. Si tu base trae más columnas, no pasa nada: se leen todas y las que no se conocen se guardan tal cual.',
      'Columnas obligatorias por fila: cCodCtaCre (N° de crédito), cNomCliente, cDocIde y cNomAseAct (o cNomAseOri). Las demás pueden quedar vacías.',
      'Cada fila debe traer TODOS sus datos juntos: la evaluación (nNumEva1, dFecEva1), los ingresos y las deudas tienen que ser del mismo cliente que el crédito de esa fila. Si el archivo sale de varias consultas, únelas por cCodCtaCre antes de cargarlo. El sistema avisa cuando la fecha de evaluación es posterior al desembolso (señal de datos de otro cliente).',
      'Ubicación del domicilio: escribe las coordenadas dentro de cRefDomCli, por ejemplo "Ref: -11.933000,-77.054000 FRENTE AL PARQUE" (también sirve "-11.933000 -77.054000"). Lo mismo en cRefEmp1 y cRefEmp2 para el lugar de trabajo.',
      'Fechas en formato dd-mm-aaaa. Montos con punto decimal. Lo que no existe va como NULL, vacío o «-».',
      'La plantilla anterior de Consumo (con los nombres del core: ccodctacre, cnomcliente, DocIde…) todavía se lee, pero conviene usar los nombres de esta.',
      'Las 3 filas de ejemplo son datos inventados: bórralas antes de cargar tu base. Si el N° de crédito ya existe se actualiza; si ya fue auditado no se modifica.',
      'Todo o nada: si alguna fila trae un error no se guarda ninguna (ni las válidas). El reporte dice la fila del archivo, el campo y qué corregir; corrige y vuelve a cargar.',
      'Al cargar el archivo, el sistema primero lo revisa completo sin guardar nada y te muestra el reporte; después decides si importarlo.',
    ]);
  } else if (formato === 'CORE_262') {
    const ws = wb.addWorksheet('OTROS');
    ws.addRow(COLUMNAS_CORE);
    for (let i = 0; i < ejemplos; i += 1) ws.addRow(filaCoreComoArreglo(construirFilaCore(i)));
    ajustarEncabezado(ws);
    COLUMNAS_CORE.forEach((c, i) => { ws.getColumn(i + 1).width = Math.min(40, Math.max(12, c.length + 2)); });
    hojaInstrucciones(wb, [
      'Plantilla CORE (262 columnas): la base de créditos MYPE tal como la exporta el sistema core.',
      'La hoja debe llamarse OTROS (créditos MYPE) o CONSUMO (créditos de consumo). Se cargan todas las hojas con ese formato.',
      'Columnas obligatorias por fila: ccodctacre (N° de crédito), cnomcliente, DocIde y nombreAsesorActual. Las demás pueden quedar vacías.',
      'Ubicación del domicilio: escribe las coordenadas dentro de cRefDomCli, por ejemplo "Ref: -11.933000,-77.054000 FRENTE AL PARQUE". Lo mismo en RefEmp_1 y RefEmp_2 para los locales del negocio.',
      'Fechas en formato dd-mm-aaaa. Montos con punto decimal. Evaluación: sufijo 1 = evaluación anterior, sufijo 2 = reevaluación (la más reciente).',
      'Las 3 filas de ejemplo son datos inventados: bórralas antes de cargar tu base. Si el N° de crédito ya existe se actualiza; si ya fue auditado no se modifica.',
      'Todo o nada: si alguna fila trae un error no se guarda ninguna (ni las válidas). El reporte dice la fila del archivo, el campo y qué corregir; corrige y vuelve a cargar.',
      'Al cargar el archivo, el sistema primero lo revisa completo sin guardar nada y te muestra el reporte; después decides si importarlo.',
    ]);
  } else if (formato === 'SIMPLE') {
    const ws = wb.addWorksheet('Expedientes');
    ws.addRow([...COLUMNAS_SIMPLE]);
    const tipoEjemplo = tipo === 'OTROS' ? 'MYPE' : tipo === 'CONSUMO' ? 'CONSUMO' : null;
    EJEMPLOS_SIMPLE.slice(0, ejemplos).forEach((f) => ws.addRow(tipoEjemplo ? f.map((celda, i) => (i === 1 ? tipoEjemplo : celda)) : f));
    ajustarEncabezado(ws);
    COLUMNAS_SIMPLE.forEach((c, i) => { ws.getColumn(i + 1).width = Math.max(14, c.length + 2); });
    hojaInstrucciones(wb, [
      'Plantilla SIMPLE: una fila por expediente con los datos mínimos para la visita.',
      'Obligatorias: codigo_expediente (número de crédito), tipo_credito (CONSUMO o MYPE), numero_documento_cliente, nombres_cliente, asesor_responsable.',
      'tipo_documento_cliente: DNI, CE, PASAPORTE o RUC (si lo dejas vacío se deduce del largo del documento). moneda: PEN o USD. latitud y longitud en grados decimales (ej. -11.9332 y -77.0541), las dos juntas; si no las tienes, déjalas vacías.',
      'Todo o nada: si alguna fila trae un error no se guarda ninguna (ni las válidas). El reporte dice la fila del archivo, el campo y qué corregir; corrige y vuelve a cargar.',
      'Las 3 filas de ejemplo son datos inventados: bórralas antes de cargar tu base. Si el código ya existe se actualiza; si ya fue auditado no se modifica.',
      'Al cargar el archivo, el sistema primero lo revisa completo sin guardar nada y te muestra el reporte; después decides si importarlo.',
    ]);
  } else {
    throw Object.assign(new Error('Formato de plantilla desconocido'), { statusCode: 400, code: 'FORMATO_DESCONOCIDO' });
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export default { generarPlantilla, FORMATOS, COLUMNAS_SIMPLE };
