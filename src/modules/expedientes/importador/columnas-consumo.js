// La base de Consumo que entrega Caja Huancayo (hoja CONSUMO): una fila por crédito, 297 columnas con nombres de sistema (c = texto, n = número, d = fecha),
// en su orden original. Es la estructura de la muestra «MUESTRA CCONSUMO» que envió el banco; la ficha «FICHA DE ENTREVISTA - CONSUMO» (muestras CC1, CC2 y CC3) sale de ella.
//   · 1-57: el cliente, su domicilio, el empleador y el crédito (lo mismo que la base MYPE del core, con otros nombres).
//   · 58-109: historial crediticio, hasta 4 créditos anteriores del cliente (13 datos cada uno).
//   · 110-168 y 169-238: balance, estado de resultados y líneas de ingreso de la evaluación MYPE (en Consumo vienen vacías o en cero).
//   · 239-256: hasta 3 ingresos del cliente (descripción, relación, moneda, tipo, fuente y monto).
//   · 257-297: calificación SBS y endeudamiento del cliente y del cónyuge (hasta 5 entidades cada uno).
export const COLUMNAS_CONSUMO_BANCO = [
  'cNum', 'cTipFic', 'cCodCtaCre', 'cCodSolCre', 'dFecDesCre', 'cCodExpCli', 'cNomCliente', 'cTipClient',
  'cDesCorMon', 'nCapDes', 'cDesCorta', 'cConDomCli', 'cNomProvCli', 'cDestin', 'cDesProdu', 'cTelFijCli',
  'cTelPerCli', 'cNomEmp1', 'cNomEmp2', 'cTelEmp1', 'cTelEmp2', 'cNomAseAct', 'cNomAseOri', 'cOficin',
  'nNumCuoApr', 'cDesCreTip', 'cDirEmp1', 'cDisNeg1', 'cRefEmp1', 'cDirEmp2', 'cDisNeg2', 'cRefEmp2',
  'cDirDomCli', 'cDisDom', 'dFecNacCli', 'cDesEstCiv', 'cSuministr', 'cDocIde', 'cRefDomCli', 'cDesCorEst',
  'cCodLinCre', 'cCodCliente', 'cFuente', 'cAspExpAct', 'dFecUltPag', 'cCarPerApr', 'NomAprobador', 'cDesActivi',
  'cEdad', 'nSalCapSol', 'cNomConyug', 'cFiadores', 'cRepresent', 'cCuoDiaMasAtr', 'dFecVenci', 'nMonCuota',
  'SustIngres', 'cLinCre1', 'cTipCredit1', 'dFecDesemb1', 'nMonDesemb1', 'cMoneda1', 'cSolCre1', 'cCodCtaCre1',
  'nNumCuoApr1', 'nMontCuota1', 'cCondContab1', 'nSalCap1', 'cNomAsesor1', 'cCuoMasAtr1', 'cLinCre2', 'cTipCredit2',
  'dFecDesemb2', 'nMonDesemb2', 'cMoneda2', 'cSolCre2', 'cCodCtaCre2', 'nNumCuoApr2', 'nMontCuota2', 'cCondContab2',
  'nSalCap2', 'cNomAsesor2', 'cCuoMasAtr2', 'cLinCre3', 'cTipCredit3', 'dFecDesemb3', 'nMonDesemb3', 'cMoneda3',
  'cSolCre3', 'cCodCtaCre3', 'nNumCuoApr3', 'nMontCuota3', 'cCondContab3', 'nSalCap3', 'cNomAsesor3', 'cCuoMasAtr3',
  'cLinCre4', 'cTipCredit4', 'dFecDesemb4', 'nMonDesemb4', 'cMoneda4', 'cSolCre4', 'cCodCtaCre4', 'nNumCuoApr4',
  'nMontCuota4', 'cCondContab4', 'nSalCap4', 'cNomAsesor4', 'cCuoMasAtr4', 'cActNoCor', 'cActNoCor2', 'cPasivoCor',
  'cPasivoCor2', 'cPasNoCor', 'cPasNoCor2', 'cPatrim', 'cPatrim2', 'nMonDis1', 'nMonDis2', 'nMonCtaCob1',
  'nMonCtaCob2', 'nMonOtrCta1', 'nMonOtrCta2', 'nMonAdeProv1', 'nMonAdeProv2', 'nMonExiste1', 'nMonExiste2', 'nMonProvee1',
  'nMonProvee2', 'nMonCtaPag1', 'nMonCtaPag2', 'nMonPreCP1', 'nMonPreCP2', 'nTotAct', 'nTotAct2', 'nTotPas',
  'nTotPas2', 'PasMasPat', 'PasMasPat2', 'nNumEva1', 'dFecEva1', 'nNumEva2', 'dFecEva2', 'nNroEnt',
  'nMonVentas1', 'nCosVenPro1', 'nUtilidBru1', 'nGasOpeNeg1', 'nUtilidOpe1', 'nObligaNeg1', 'nOblNetNeg1', 'nOtrIngUef1',
  'nTotOblFam1', 'nGasFamili1', 'nResultUef1', 'nCapacPago1', 'nMonVentas2', 'nCosVenPro2', 'nUtilidBru2', 'nGasOpeNeg2',
  'nUtilidOpe2', 'nObligaNeg2', 'nOblNetNeg2', 'nOtrIngUef2', 'nTotOblFam2', 'nGasFamili2', 'nResultUef2', 'nCapacPago2',
  'cDescripci1', 'cFrecuenci1', 'nDiaBuenCAn1', 'nDiaBueDia1', 'nDiaMalCan1', 'nDiaMalDia1', 'nDiaEstCan1', 'nDiaEstUni1',
  'nPreVenFin1', 'nPreComPro1', 'nTotMerFin1', 'nTotComPro1', 'nTotVenFin1', 'nCanEstFin1', 'cDescripci2', 'cFrecuenci2',
  'nDiaBuenCAn2', 'nDiaBueDia2', 'nDiaMalCan2', 'nDiaMalDia2', 'nDiaEstCan2', 'nDiaEstUni2', 'nPreVenFin2', 'nPreComPro2',
  'nTotMerFin2', 'nTotComPro2', 'nTotVenFin2', 'nCanEstFin2', 'cDescripci3', 'cFrecuenci3', 'nDiaBuenCAn3', 'nDiaBueDia3',
  'nDiaMalCan3', 'nDiaMalDia3', 'nDiaEstCan3', 'nDiaEstUni3', 'nPreVenFin3', 'nPreComPro3', 'nTotMerFin3', 'nTotComPro3',
  'nTotVenFin3', 'nCanEstFin3', 'cDescripci4', 'cFrecuenci4', 'nDiaBuenCAn4', 'nDiaBueDia4', 'nDiaMalCan4', 'nDiaMalDia4',
  'nDiaEstCan4', 'nDiaEstUni4', 'nPreVenFin4', 'nPreComPro4', 'nTotMerFin4', 'nTotComPro4', 'nTotVenFin4', 'nCanEstFin4',
  'cDescripci5', 'cFrecuenci5', 'nDiaBuenCAn5', 'nDiaBueDia5', 'nDiaMalCan5', 'nDiaMalDia5', 'nDiaEstCan5', 'nDiaEstUni5',
  'nPreVenFin5', 'nPreComPro5', 'nTotMerFin5', 'nTotComPro5', 'nTotVenFin5', 'nCanEstFin5', 'cDesConsum1', 'cRelaci1',
  'cMoneda12', 'cTipIng1', 'cFueIng1', 'nMonIngDeu1', 'cDesConsum2', 'cRelaci2', 'cMoneda23', 'cTipIng2',
  'cFueIng2', 'nMonIngDeu2', 'cDesConsum3', 'cRelaci3', 'cMoneda34', 'cTipIng3', 'cFueIng3', 'nMonIngDeu3',
  'cCalSbs', 'cNomIfi1', 'cCalEmpDes1', 'cDesTipCre1', 'nSaldo1', 'cNomIfi2', 'cCalEmpDes2', 'cDesTipCre2',
  'nSaldo2', 'cNomIfi3', 'cCalEmpDes3', 'cDesTipCre3', 'nSaldo3', 'cNomIfi4', 'cCalEmpDes4', 'cDesTipCre4',
  'nSaldo4', 'cNomIfi5', 'cCalEmpDes5', 'cDesTipCre5', 'nSaldo5', 'cNomIfiConyu1', 'cCalEmpConyu1', 'cTipCreConyu1',
  'nSalConyu1', 'cNomIfiConyu2', 'cCalEmpConyu2', 'cTipCreConyu2', 'nSalConyu2', 'cNomIfiConyu3', 'cCalEmpConyu3', 'cTipCreConyu3',
  'nSalConyu3', 'cNomIfiConyu4', 'cCalEmpConyu4', 'cTipCreConyu4', 'nSalConyu4', 'cNomIfiConyu5', 'cCalEmpConyu5', 'cTipCreConyu5',
  'nSalConyu5',
];

// «Fuente» de la muestra: la ficha impresa del banco escribe «MPAUCC/<fuente>» (por ejemplo MPAUCC/NUEVO), con la columna cFuente después de la barra.
export const PREFIJO_FUENTE_CONSUMO = 'MPAUCC';

// El mapeo (formato-core.js) pide cada dato por su nombre en la base MYPE de 262 columnas. Cuando esta base lo llama distinto, aquí está el equivalente: nombre
// del core → nombres de Consumo (todo en minúsculas). Así los dos formatos pasan por el mismo mapeo y una fila con los nombres anteriores sigue funcionando.
const PARES = [
  // Cliente y domicilio
  ['docide', 'cdocide'], ['provdom', 'cnomprovcli'], ['disdom', 'cdisdom'], ['telefijodom', 'ctelfijcli'], ['telfcliente', 'ctelpercli'],
  ['condiciondomcli', 'ccondomcli'], ['suministro', 'csuministr'], ['edad', 'cedad'], ['tipodecliente', 'ctipclient'], ['fuente', 'cfuente'], ['oficina', 'coficin'],
  // Lugar de trabajo: en Consumo el «negocio» es el empleador
  ['actividad', 'cdesactivi'], ['sustingreso', 'sustingres'],
  // Crédito y participantes
  ['desembolsado', 'ncapdes'], ['moneda', 'cdescormon'], ['destino', 'cdestin'], ['cdescortatipcre', 'cdescretip'], ['cdescortaestado', 'cdescorest'],
  ['fechavencimiento', 'dfecvenci'], ['saldocapsoles', 'nsalcapsol'], ['nombreasesoractual', 'cnomaseact'], ['nombreasesororigen', 'cnomaseori'],
  ['cargoperaprob', 'ccarperapr'], ['nombreconyuge', 'cnomconyug'], ['fiadores', 'cfiadores'], ['representantes', 'crepresent'],
  ['calificacionsbs', 'ccalsbs'], ['nnroentida', 'nnroent'],
  // Balance de la evaluación MYPE (en Consumo viene vacío)
  ['activonocorriente', 'cactnocor'], ['activonocorriente2', 'cactnocor2'], ['pasicocorriente', 'cpasivocor'], ['pasivocorriente2', 'cpasivocor2'],
  ['pasivonocorriente', 'cpasnocor'], ['pasivonocorriente2', 'cpasnocor2'], ['patrimonio', 'cpatrim'], ['patrominio2', 'cpatrim2'],
  ['totalactivo', 'ntotact'], ['totalactivo2', 'ntotact2'], ['totalpasivo', 'ntotpas'], ['totalpasivo2', 'ntotpas2'],
  ['pasivomaspatrimonio', 'pasmaspat'], ['pasivomaspatrimonio2', 'pasmaspat2'],
];
// Lugar de trabajo (hasta dos empleadores): nombre, teléfono, dirección, distrito y referencia.
for (const n of [1, 2]) {
  PARES.push(
    [`nomemp_${n}`, `cnomemp${n}`], [`telemp_${n}`, `ctelemp${n}`], [`diremp_${n}`, `cdiremp${n}`], [`distneg_${n}`, `cdisneg${n}`], [`refemp_${n}`, `crefemp${n}`],
  );
}
// Evaluación: sufijo 1 = anterior, 2 = reevaluación (igual que en el core).
for (const n of [1, 2]) {
  PARES.push(
    [`numeva${n}`, `nnumeva${n}`], [`fechaeva${n}`, `dfeceva${n}`],
    [`nmondisponible${n}`, `nmondis${n}`], [`nmonctasxcobrar${n}`, `nmonctacob${n}`], [`nmonotrasctasxcobrar${n}`, `nmonotrcta${n}`],
    [`nmonadelantoprovee${n}`, `nmonadeprov${n}`], [`nmonexistencias${n}`, `nmonexiste${n}`], [`nmonproveedores${n}`, `nmonprovee${n}`],
    [`nmonctasxpagar${n}`, `nmonctapag${n}`], [`nmonprestamocp${n}`, `nmonprecp${n}`],
  );
}
// Cinco líneas de ingreso MYPE y cinco entidades del cónyuge.
for (const n of [1, 2, 3, 4, 5]) {
  PARES.push(
    [`descripcion${n}`, `cdescripci${n}`], [`frecuencia${n}`, `cfrecuenci${n}`],
    [`ccalempdesconyu${n}`, `ccalempconyu${n}`], [`cdestipcreconyu${n}`, `ctipcreconyu${n}`], [`nsaldoconyu${n}`, `nsalconyu${n}`],
  );
}
// Hasta 3 ingresos del cliente. La moneda se llama distinto en cada uno (cMoneda12, cMoneda23, cMoneda34): así viene en la base del banco.
const MONEDA_DEL_INGRESO = ['cmoneda12', 'cmoneda23', 'cmoneda34'];
for (const n of [1, 2, 3]) {
  PARES.push(
    [`descripcionconsumo${n}`, `cdesconsum${n}`], [`relacion${n}`, `crelaci${n}`], [`moneda${n}`, MONEDA_DEL_INGRESO[n - 1]],
    [`tipoing${n}`, `ctiping${n}`], [`fuenteing${n}`, `cfueing${n}`],
  );
}

export const ALIAS_CONSUMO_BANCO = Object.freeze(Object.fromEntries(PARES.map(([core, consumo]) => [core, [consumo]])));
