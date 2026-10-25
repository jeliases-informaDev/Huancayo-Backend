// Las 262 columnas de la base MYPE ("FV_..._CRED_EMP") del sistema core de Caja Huancayo, en su orden original.
// Es la referencia del formato: el generador de muestras y las pruebas de cobertura la usan para asegurar
// que ninguna columna queda sin destino al importar.
export const COLUMNAS_CORE = [
  'Nro', 'ccodctacre', 'cCodSolCre', 'dfecdescre', 'ccodexpcli', 'cnomcliente', 'tipodecliente', 'Moneda',
  'desembolsado', 'saldocap', 'diasatraso', 'cDesCorta', 'CONDICIONDOMCLI', 'ProvDom', 'destino', 'cdesprodu',
  'cdessubcre', 'Modalidadcre', 'TelefijoDom', 'TELFCLIENTE', 'NomEmp_1', 'NomEmp_2', 'TelEmp_1', 'TelEmp_2',
  'cCodConyug', 'ccodusuana', 'nombreAsesorActual', 'AnaSolicitud', 'nombreAsesorOrigen', 'cCodOficin', 'Oficina', 'desembolsadoSoles',
  'nnumcuoapr', 'cDesSecEco', 'cDesCortaTipCre', 'DirEmp_1', 'DISTNEG_1', 'DEPNEG_1', 'RefEmp_1', 'DirEmp_2',
  'DISTNEG_2', 'DEPNEG_2', 'RefEmp_2', 'cdirdomcli', 'DisDOM', 'depDom', 'dFecNacCli', 'CDESESTCIV',
  'CDESSEXO', 'suministro', 'DocIde', 'ubiDOM', 'zonaDOM', 'cRefDomCli', 'cDesCortaEstado', 'cCodTipMon',
  'cCodTipCre', 'cCodProduc', 'cCodSubPro', 'cCodPagare', 'cCodLinCre', 'cCreNorRef', 'cCodCliente', 'cestcrecon',
  'cCodModCre', 'cCodPlazo', 'Fuente', 'cCodSexo', 'cCodEstCiv', 'cAspExpAct', 'dFecUltPag', 'usuarioAprueba',
  'nNumDiaGra', 'cargoPERAprob', 'NomAprobador', 'actividad', 'edad', 'SALDOCAPSoles', 'nTipCamFijDes', 'nombreconyuge',
  'fiadores', 'representantes', 'cCuoDiaMasAtr', 'FECHAVENCIMIENTO', 'numeva1', 'fechaeva1', 'numeva2', 'fechaeva2',
  'nmoncuota', 'ACTCTE1', 'ACTCTE2', 'activonocorriente', 'activonocorriente2', 'PASICOCORRIENTE', 'PASIVOCORRIENTE2', 'PASIVONOCORRIENTE',
  'PASIVONOCORRIENTE2', 'PATRIMONIO', 'PATROMINIO2', 'nMonDISPONIBLE1', 'nMonDISPONIBLE2', 'nMonCTASXCOBRAR1', 'nMonCTASXCOBRAR2', 'nMonOTRASCTASXCOBRAR1',
  'nMonOTRASCTASXCOBRAR2', 'nMonADELANTOPROVEE1', 'nMonADELANTOPROVEE2', 'nMonEXISTENCIAS1', 'nMonEXISTENCIAS2', 'nMonPROVEEDORES1', 'nMonPROVEEDORES2', 'nMonCTASXPAGAR1',
  'nMonCTASXPAGAR2', 'nMonPRESTAMOCP1', 'nMonPRESTAMOCP2', 'nMonPRESTAMOLP1', 'nMonPRESTAMOLP2', 'nMonVentas1', 'nCosVenPro1', 'nUtilidBru1',
  'nGasOpeNeg1', 'nUtilidOpe1', 'nObligaNeg1', 'nOblNetNeg1', 'nOtrIngUef1', 'nTotOblFam1', 'nGasFamili1', 'nResultUef1',
  'nCapacPago1', 'ntotporepg1', 'nMonVentas2', 'nCosVenPro2', 'nUtilidBru2', 'nGasOpeNeg2', 'nUtilidOpe2', 'nObligaNeg2',
  'nOblNetNeg2', 'nOtrIngUef2', 'nTotOblFam2', 'nGasFamili2', 'nResultUef2', 'nCapacPago2', 'ntotporepg2', 'CALIFICACIONSBS',
  'TOTALACTIVO', 'TOTALACTIVO2', 'TOTALPASIVO', 'TOTALPASIVO2', 'PASIVOMASPATRIMONIO', 'PASIVOMASPATRIMONIO2', 'descripcion1', 'Frecuencia1',
  'nDiaBuenCAn1', 'nDiaBueDia1', 'nDiaMalCan1', 'nDiaMalDia1', 'nDiaEstCan1', 'nDiaEstUni1', 'nPreVenFin1', 'nPreComPro1',
  'nTotMerFin1', 'nTotComPro1', 'nTotVenFin1', 'nCanEstFin1', 'descripcion2', 'Frecuencia2', 'nDiaBuenCAn2', 'nDiaBueDia2',
  'nDiaMalCan2', 'nDiaMalDia2', 'nDiaEstCan2', 'nDiaEstUni2', 'nPreVenFin2', 'nPreComPro2', 'nTotMerFin2', 'nTotComPro2',
  'nTotVenFin2', 'nCanEstFin2', 'descripcion3', 'Frecuencia3', 'nDiaBuenCAn3', 'nDiaBueDia3', 'nDiaMalCan3', 'nDiaMalDia3',
  'nDiaEstCan3', 'nDiaEstUni3', 'nPreVenFin3', 'nPreComPro3', 'nTotMerFin3', 'nTotComPro3', 'nTotVenFin3', 'nCanEstFin3',
  'descripcion4', 'Frecuencia4', 'nDiaBuenCAn4', 'nDiaBueDia4', 'nDiaMalCan4', 'nDiaMalDia4', 'nDiaEstCan4', 'nDiaEstUni4',
  'nPreVenFin4', 'nPreComPro4', 'nTotMerFin4', 'nTotComPro4', 'nTotVenFin4', 'nCanEstFin4', 'descripcion5', 'Frecuencia5',
  'nDiaBuenCAn5', 'nDiaBueDia5', 'nDiaMalCan5', 'nDiaMalDia5', 'nDiaEstCan5', 'nDiaEstUni5', 'nPreVenFin5', 'nPreComPro5',
  'nTotMerFin5', 'nTotComPro5', 'nTotVenFin5', 'nCanEstFin5', 'NNROENTIDA', 'FECHAOBTENCION', 'cnomifi1', 'ccalempdes1',
  'cdestipcre1', 'nsaldo1', 'cnomifi2', 'ccalempdes2', 'cdestipcre2', 'nsaldo2', 'cnomifi3', 'ccalempdes3',
  'cdestipcre3', 'nsaldo3', 'cnomifi4', 'ccalempdes4', 'cdestipcre4', 'nsaldo4', 'cnomifi5', 'ccalempdes5',
  'cdestipcre5', 'nsaldo5', 'cnomifiConyu1', 'ccalempdesConyu1', 'cdestipcreConyu1', 'nsaldoConyu1', 'cnomifiConyu2', 'ccalempdesConyu2',
  'cdestipcreConyu2', 'nsaldoConyu2', 'cnomifiConyu3', 'ccalempdesConyu3', 'cdestipcreConyu3', 'nsaldoConyu3', 'cnomifiConyu4', 'ccalempdesConyu4',
  'cdestipcreConyu4', 'nsaldoConyu4', 'cnomifiConyu5', 'ccalempdesConyu5', 'cdestipcreConyu5', 'nsaldoConyu5',
];

// Ficha de Consumo: la base de consumo del banco trae el documento con que el cliente sustenta su ingreso y hasta 3 ingresos (descripción, relación, moneda,
// monto y tipo). Son 16 columnas que la base MYPE de 262 no tiene; el importador ya las lee.
export const COLUMNAS_CONSUMO_PROPIAS = [
  'SustIngreso',
  'DESCRIPCIONCONSUMO1', 'RELACION1', 'MONEDA1', 'NMONINGDEU1', 'TIPOING1',
  'DESCRIPCIONCONSUMO2', 'RELACION2', 'MONEDA2', 'NMONINGDEU2', 'TIPOING2',
  'DESCRIPCIONCONSUMO3', 'RELACION3', 'MONEDA3', 'NMONINGDEU3', 'TIPOING3',
];

// Columnas de la base de 262 que usa la ficha de Consumo del banco (los campos combinados de «PLANTILLA PARA CRÉDITOS CONSUMO»), más depDom, con el que se
// fija el departamento del expediente. Las otras (balance, estado de resultados e ingresos del negocio) son de la evaluación MYPE y en Consumo no se piden.
const CORE_EN_CONSUMO = [
  'ccodctacre', 'cCodSolCre', 'dfecdescre', 'cnomcliente', 'Moneda', 'desembolsado', 'cDesCorta', 'CONDICIONDOMCLI', 'ProvDom', 'destino',
  'cdesprodu', 'TelefijoDom', 'TELFCLIENTE', 'NomEmp_1', 'NomEmp_2', 'TelEmp_1', 'TelEmp_2', 'nombreAsesorActual', 'nombreAsesorOrigen', 'Oficina',
  'nnumcuoapr', 'cDesCortaTipCre', 'DirEmp_1', 'DISTNEG_1', 'RefEmp_1', 'DirEmp_2', 'DISTNEG_2', 'RefEmp_2', 'cdirdomcli', 'DisDOM', 'depDom', 'dFecNacCli',
  'CDESESTCIV', 'suministro', 'DocIde', 'cRefDomCli', 'cDesCortaEstado', 'cCodLinCre', 'Fuente', 'cAspExpAct', 'dFecUltPag', 'cargoPERAprob',
  'NomAprobador', 'actividad', 'edad', 'SALDOCAPSoles', 'nombreconyuge', 'fiadores', 'representantes', 'cCuoDiaMasAtr', 'FECHAVENCIMIENTO',
  'nmoncuota', 'CALIFICACIONSBS', 'NNROENTIDA', 'FECHAOBTENCION', 'cnomifi1', 'ccalempdes1', 'cdestipcre1', 'nsaldo1', 'cnomifi2', 'ccalempdes2',
  'cdestipcre2', 'nsaldo2', 'cnomifi3', 'ccalempdes3', 'cdestipcre3', 'nsaldo3', 'cnomifi4', 'ccalempdes4', 'cdestipcre4', 'nsaldo4', 'cnomifi5',
  'ccalempdes5', 'cdestipcre5', 'nsaldo5', 'cnomifiConyu1', 'ccalempdesConyu1', 'cdestipcreConyu1', 'nsaldoConyu1', 'cnomifiConyu2',
  'ccalempdesConyu2', 'cdestipcreConyu2', 'nsaldoConyu2', 'cnomifiConyu3', 'ccalempdesConyu3', 'cdestipcreConyu3', 'nsaldoConyu3',
];
const enConsumo = new Set(CORE_EN_CONSUMO.map((c) => c.toLowerCase()));
// Base de consumo completa: las columnas del core que usa su ficha, en el mismo orden que el core, y al final las 16 propias de Consumo.
export const COLUMNAS_CONSUMO = [...COLUMNAS_CORE.filter((c) => enConsumo.has(c.toLowerCase())), ...COLUMNAS_CONSUMO_PROPIAS];
