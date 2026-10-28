// Filas de ejemplo con la estructura exacta de la base de Consumo del banco (297 columnas, hoja CONSUMO; ver columnas-consumo.js), con datos INVENTADOS pero
// completos y coherentes: sirven para la plantilla descargable del panel y para probar sin datos personales. Cada fila trae SUS PROPIOS datos de punta a punta:
// la evaluación, los ingresos y las deudas son del mismo cliente que el crédito (la fecha de evaluación es la del desembolso, como en la base del banco).
import { ALIAS_CONSUMO_BANCO, COLUMNAS_CONSUMO_BANCO } from './columnas-consumo.js';
import { construirFilaConsumo } from './muestra-core.js';

const SIN_DATO = 'NULL'; // como en la base del banco: NULL para lo que no existe
const f2 = (n) => Number(n).toFixed(2);
const dmy = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
const FUENTES = ['NUEVO', 'RECURRENTE', 'VIG. CON ATRASO'];

// Nombre de la base de Consumo (en minúsculas) → nombre del core con que ya genera sus datos la muestra de Consumo anterior.
const DEL_CORE = new Map(Object.entries(ALIAS_CONSUMO_BANCO).flatMap(([core, nuevos]) => nuevos.map((nuevo) => [nuevo, core])));

// De la evaluación MYPE, en Consumo la base trae los resultados en cero y el balance vacío.
const RESULTADOS_EN_CERO = /^n(MonVentas|CosVenPro|UtilidBru|GasOpeNeg|UtilidOpe|ObligaNeg|OblNetNeg|OtrIngUef|TotOblFam|GasFamili|ResultUef|CapacPago)[12]$/;
const BALANCE_VACIO = /^(cActNoCor2?|cPasivoCor2?|cPasNoCor2?|cPatrim2?|nMon(Dis|CtaCob|OtrCta|AdeProv|Existe|Provee|CtaPag|PreCP)[12]|nTotAct2?|nTotPas2?|PasMasPat2?)$/;
// Las cinco líneas de ingreso del negocio: la primera viene NULL; las otras, con «-» y ceros.
const LINEA_VACIA = [['cDescripci', '-'], ['cFrecuenci', '0.00'], ['nDiaBuenCAn', '0.00'], ['nDiaBueDia', '0'], ['nDiaMalCan', '0.00'], ['nDiaMalDia', '0'],
  ['nDiaEstCan', '0.00'], ['nDiaEstUni', '0'], ['nPreVenFin', '0.00'], ['nPreComPro', '0.0000'], ['nTotMerFin', '0.00'], ['nTotComPro', '0.00'], ['nTotVenFin', '0.00'], ['nCanEstFin', '0.00']];

function mesesAntes(ddmmaaaa, meses) {
  const [d, m, a] = ddmmaaaa.split('-').map(Number);
  return dmy(new Date(a, m - 1 - meses, Math.min(d, 28)));
}

/**
 * Construye la fila i (desde 0) como objeto { columna: valor } con las 297 columnas de Consumo. opciones.semilla y opciones.hoy cambian los datos.
 */
export function construirFilaConsumoBanco(i, opciones = {}) {
  const base = Object.fromEntries(Object.entries(construirFilaConsumo(i, opciones)).map(([k, valor]) => [k.toLowerCase(), valor]));
  const fila = {};
  for (const columna of COLUMNAS_CONSUMO_BANCO) {
    const clave = columna.toLowerCase();
    const valor = base[DEL_CORE.get(clave) ?? clave];
    fila[columna] = valor === undefined ? SIN_DATO : valor;
    if (RESULTADOS_EN_CERO.test(columna)) fila[columna] = '0.00';
    else if (BALANCE_VACIO.test(columna)) fila[columna] = SIN_DATO;
  }

  const n = i + 1;
  const fuente = FUENTES[i % FUENTES.length];
  Object.assign(fila, {
    cNum: String(n), cTipFic: 'CONSUMO', cFuente: fuente, cTipClient: fuente === 'RECURRENTE' ? 'RECURRENTE' : 'NUEVO',
    // Una sola evaluación, la del desembolso (la reevaluación no existe en Consumo).
    dFecEva1: fila.dFecDesCre, nNumEva2: SIN_DATO, dFecEva2: '-',
    nNroEnt: fila.nNroEnt,
  });
  for (let l = 1; l <= 5; l += 1) for (const [columna, vacio] of LINEA_VACIA) fila[`${columna}${l}`] = l === 1 ? SIN_DATO : vacio;
  for (let k = 1; k <= 3; k += 1) fila[`cFueIng${k}`] = fila[`cTipIng${k}`];

  // Historial: 0, 1 o 2 créditos anteriores (los de meses atrás, ya pagados y con el mismo asesor); el resto de lugares queda NULL.
  const anteriores = [2, 0, 1][i % 3];
  for (let k = 1; k <= 4; k += 1) {
    const existe = k <= anteriores;
    const monto = 1000 * k;
    const plazo = [12, 6, 3, 2][k - 1];
    const valores = {
      cLinCre: `163002${String(20000 + n * 10 + k).padStart(6, '0')}`, cTipCredit: 'CONSUMO', dFecDesemb: mesesAntes(fila.dFecDesCre, 2 * k), nMonDesemb: f2(monto),
      cMoneda: 'S/', cSolCre: `1630${String(40000 + n * 10 + k).padStart(6, '0')}`, cCodCtaCre: `1071631055519${String(60000 + n * 10 + k).padStart(6, '0')}`,
      nNumCuoApr: String(plazo), nMontCuota: f2((monto * 1.12) / plazo), cCondContab: 'VIGENTE', nSalCap: '0.00', cNomAsesor: fila.cNomAseAct, cCuoMasAtr: '-.-',
    };
    for (const [columna, valor] of Object.entries(valores)) fila[`${columna}${k}`] = existe ? valor : SIN_DATO;
  }
  return fila;
}

// Fila como arreglo en el orden de las 297 columnas (para escribir el Excel).
export const filaConsumoBancoComoArreglo = (fila) => COLUMNAS_CONSUMO_BANCO.map((c) => (fila[c] === undefined ? '' : fila[c]));
