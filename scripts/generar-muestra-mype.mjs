// Genera un Excel SINTÉTICO con la misma estructura (262 columnas, hoja OTROS) que la base
// real de créditos MYPE de Caja Huancayo, pero con datos inventados. Sirve para probar la
// importación, la ficha del auditor y el Word sin usar datos personales reales.
//
//   node scripts/generar-muestra-mype.mjs [ruta-de-salida.xlsx] [cantidad]
//
// Incluye, a propósito, los casos difíciles de la base real: NULL como texto, valores con
// relleno de espacios, fechas dd-mm-aaaa, coordenadas escritas en la referencia (3 formatos),
// una fila sin coordenadas, una sin reevaluación y una con texto dañado (�).
import ExcelJS from 'exceljs';
import { COLUMNAS_CORE as COLUMNAS } from '../src/modules/expedientes/importador/columnas-core.js';


const salida = process.argv[2] || 'Muestra-MYPE-Sintetica.xlsx';
const cantidad = Math.min(Math.max(Number(process.argv[3]) || 6, 1), 200);

const f2 = (n) => Number(n).toFixed(2);
const pad = (texto, ancho) => String(texto).padEnd(ancho, ' ');
const dmy = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

const NOMBRES = ['PRUEBA UNO, CLIENTE MYPE', 'PRUEBA DOS, CLIENTE MYPE', 'MU�OZ PRUEBA, TRES MYPE', 'PRUEBA CUATRO, CLIENTE MYPE', 'PRUEBA CINCO, CLIENTE MYPE', 'PRUEBA SEIS, CLIENTE MYPE'];
const GIROS = ['VENTA AL POR MENOR DE ABARROTES', 'CONFECCION DE PRENDAS DE VESTIR', 'SERVICIO DE TRANSPORTE URBANO', 'VENTA DE COMIDA PREPARADA', 'TALLER DE MECANICA', 'VENTA DE ROPA Y CALZADO'];
// Referencias con coordenadas en tres formatos distintos y una sin coordenadas (zona Miraflores, Lima).
const REFERENCIAS = [
  'Ref: -12.119400,-77.029500 FRENTE AL PARQUE',
  'Ref: 12.12034510S 77.03120045W ALT. DEL MERCADO',
  'Ref: CERCA DEL COLEGIO SAN JOSE, SIN COORDENADAS',
  `Ref: 12°07'12.5"S 77°01'48.2"W ESQUINA CON AV. PETIT THOUARS`,
  'Ref: -12.121800,-77.031200 AL COSTADO DE LA BODEGA',
  'Ref: -12.118900,-77.027900 SEGUNDO PISO',
];

function construirFila(i) {
  const n = i + 1;
  const hoy = new Date();
  const desembolso = new Date(hoy.getFullYear(), hoy.getMonth() - 3 - i, 10);
  const monto = 15000 + i * 7500;
  const tieneReevaluacion = i !== 2;
  const activoCte = 8000 + i * 3000;
  const activoNoCte = 20000 + i * 9000;
  const pasivoCp = 5000 + i * 1500;
  const pasivoLp = 3000 + i * 2000;
  const ventas = 6000 + i * 1800;
  const costo = Math.round(ventas * 0.55);
  const gastosOp = Math.round(ventas * 0.15);
  const obligNegocio = Math.round(monto / 30);
  const gastosFam = 900 + i * 120;
  const utilNeta = ventas - costo - gastosOp - obligNegocio;
  const resultadoUef = utilNeta - gastosFam;
  const v = {};
  const set = (k, valor) => { v[k] = valor; };

  set('Nro', String(n));
  set('ccodctacre', `1071631055519954${String(30 + n).padStart(2, '0')}`);
  set('cCodSolCre', `16300${42880 + n}`);
  set('dfecdescre', dmy(desembolso));
  set('ccodexpcli', `16300${5380 + n}`);
  set('cnomcliente', pad(NOMBRES[i % NOMBRES.length], 40));
  set('tipodecliente', 'RECURRENTE');
  set('Moneda', 'S/');
  set('desembolsado', f2(monto));
  set('saldocap', f2(monto * 0.7));
  set('diasatraso', String((i * 7) % 40));
  set('cDesCorta', pad(i % 2 ? 'VIGENTE' : 'REFINANCIADO', 12));
  set('CONDICIONDOMCLI', i % 2 ? 'ALQUILADA' : 'PROPIA AUTOFINANCIADA');
  set('ProvDom', 'LIMA');
  set('destino', 'CAPITAL DE TRABAJO');
  set('cdesprodu', 'A CUOTA FIJA');
  set('cdessubcre', 'PEQUENA EMPRESA');
  set('Modalidadcre', 'NORMAL');
  set('TelefijoDom', 'NULL');
  set('TELFCLIENTE', pad(`9${String(10000000 + n * 1111111).slice(0, 8)}`, 12));
  set('NomEmp_1', 'NULL');
  set('TelEmp_1', pad(`9${String(20000000 + n * 2222222).slice(0, 8)}`, 12));
  set('cCodConyug', 'NOCONYU');
  set('ccodusuana', `ASESOR${n}`);
  set('nombreAsesorActual', `ASESOR/PRUEBA,ASESOR NUMERO ${n}`);
  set('AnaSolicitud', `ASESOR${n}`);
  set('nombreAsesorOrigen', `ASESOR/PRUEBA,ASESOR NUMERO ${n}`);
  set('cCodOficin', '163');
  set('Oficina', 'AG. MIRAFLORES');
  set('desembolsadoSoles', f2(monto));
  set('nnumcuoapr', String(24 + (i % 3) * 6));
  set('cDesSecEco', 'NULL');
  set('cDesCortaTipCre', pad('PEQ.EMP', 20));
  set('DirEmp_1', `AV. PETIT THOUARS ${1100 + n * 3}`);
  set('DISTNEG_1', 'MIRAFLORES');
  set('DEPNEG_1', 'LIMA');
  set('RefEmp_1', REFERENCIAS[i % REFERENCIAS.length]);
  if (i % 2 === 0) { set('DirEmp_2', `JR. DE PRUEBA ${200 + n}`); set('DISTNEG_2', 'SURQUILLO'); set('DEPNEG_2', 'LIMA'); set('RefEmp_2', 'Ref: SEGUNDO LOCAL'); }
  set('cdirdomcli', `AV. PETIT THOUARS ${1100 + n * 3}  DPTO. ${n}0${n}`);
  set('DisDOM', 'MIRAFLORES');
  set('depDom', 'LIMA');
  set('dFecNacCli', dmy(new Date(1975 + i * 3, i % 12, 5 + i)));
  set('CDESESTCIV', pad(i % 2 ? 'CASADO' : 'SOLTERO', 20));
  set('CDESSEXO', i % 2 ? 'MASCULINO' : 'FEMENINO');
  set('suministro', String(1434300 + n));
  set('DocIde', pad(String(90000000 + n * 137), 20));
  set('ubiDOM', 'LIMA - LIMA - MIRAFLORES');
  set('zonaDOM', 'MIRAFLORES');
  set('cRefDomCli', REFERENCIAS[i % REFERENCIAS.length]);
  set('cDesCortaEstado', pad(i % 2 ? 'VIGENTE' : 'COBR. JUDI', 12));
  set('cCodTipMon', '1'); set('cCodTipCre', '13'); set('cCodProduc', '02'); set('cCodSubPro', '01');
  set('cCodPagare', `16300001${6700 + n}`);
  set('cCodLinCre', `16300210${50 + n}`);
  set('cCreNorRef', i % 2 ? 'N' : 'R');
  set('cCodCliente', `10701199${8000 + n}`);
  set('cestcrecon', 'F'); set('cCodModCre', '01'); set('cCodPlazo', '2');
  set('Fuente', 'PRUEBA/SINTETICO');
  set('cCodSexo', i % 2 ? 'M' : 'F'); set('cCodEstCiv', '1');
  set('cAspExpAct', i % 3 === 0 ? String(60 + i * 12) : i % 3 === 1 ? `${24 + i * 6} MESES` : `${3 + i} AÑOS`);
  set('dFecUltPag', dmy(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 5)));
  set('usuarioAprueba', 'JEFE1'); set('nNumDiaGra', '0');
  set('cargoPERAprob', 'JEFE DE NEGOCIOS REGIONALES');
  set('NomAprobador', 'JEFE/PRUEBA,JEFE DE NEGOCIOS');
  set('actividad', pad(GIROS[i % GIROS.length], 70));
  set('edad', String(hoy.getFullYear() - (1975 + i * 3)));
  set('SALDOCAPSoles', f2(monto * 0.7)); set('nTipCamFijDes', '0');
  set('nombreconyuge', 'NULL'); set('fiadores', 'NULL'); set('representantes', 'NULL');
  set('cCuoDiaMasAtr', i % 2 ? '-.-' : '002 - 16 día(s)');
  set('FECHAVENCIMIENTO', dmy(new Date(hoy.getFullYear() + 2, hoy.getMonth(), 15)));
  set('nmoncuota', f2(monto / 18));
  set('CALIFICACIONSBS', i % 2 ? 'NORMAL' : 'CPP');

  // Evaluación: sufijo 1 = anterior, sufijo 2 = reevaluación
  const ant = new Date(hoy.getFullYear(), hoy.getMonth() - 8, 12);
  set('numeva1', String(7000000 + n)); set('fechaeva1', dmy(ant));
  if (tieneReevaluacion) { set('numeva2', String(7100000 + n)); set('fechaeva2', dmy(new Date(hoy.getFullYear(), hoy.getMonth() - 3, 20))); }
  else { set('numeva2', '0'); set('fechaeva2', 'NULL'); }
  const periodos = tieneReevaluacion ? [1, 2] : [1];
  for (const p of periodos) {
    const k = p === 2 ? 1.08 : 1; // la reevaluación suma ~8 %
    const sfx = (a, b) => (p === 1 ? a : b);
    const ac = Math.round(activoCte * k); const anc = Math.round(activoNoCte * k);
    const pc = Math.round(pasivoCp * k); const pl = Math.round(pasivoLp * k);
    const totalActivo = ac + anc; const totalPasivo = pc + pl;
    set(sfx('ACTCTE1', 'ACTCTE2'), f2(ac)); set(sfx('activonocorriente', 'activonocorriente2'), f2(anc));
    set(sfx('PASICOCORRIENTE', 'PASIVOCORRIENTE2'), f2(pc)); set(sfx('PASIVONOCORRIENTE', 'PASIVONOCORRIENTE2'), f2(pl));
    set(sfx('PATRIMONIO', 'PATROMINIO2'), f2(totalActivo - totalPasivo));
    set(`nMonDISPONIBLE${p}`, f2(Math.round(ac * 0.1))); set(`nMonCTASXCOBRAR${p}`, '0.00'); set(`nMonOTRASCTASXCOBRAR${p}`, '0.00');
    set(`nMonADELANTOPROVEE${p}`, '0.00'); set(`nMonEXISTENCIAS${p}`, f2(Math.round(ac * 0.9)));
    set(`nMonPROVEEDORES${p}`, '0.00'); set(`nMonCTASXPAGAR${p}`, '0.00'); set(`nMonPRESTAMOCP${p}`, f2(pc)); set(`nMonPRESTAMOLP${p}`, f2(pl));
    set(sfx('TOTALACTIVO', 'TOTALACTIVO2'), f2(totalActivo)); set(sfx('TOTALPASIVO', 'TOTALPASIVO2'), f2(totalPasivo));
    set(sfx('PASIVOMASPATRIMONIO', 'PASIVOMASPATRIMONIO2'), f2(totalActivo));
    const vt = Math.round(ventas * k);
    set(`nMonVentas${p}`, f2(vt)); set(`nCosVenPro${p}`, f2(Math.round(costo * k))); set(`nUtilidBru${p}`, f2(vt - Math.round(costo * k)));
    set(`nGasOpeNeg${p}`, f2(gastosOp)); set(`nUtilidOpe${p}`, f2(vt - Math.round(costo * k) - gastosOp)); set(`nObligaNeg${p}`, f2(obligNegocio));
    set(`nOblNetNeg${p}`, f2(utilNeta)); set(`nOtrIngUef${p}`, '0.00'); set(`nTotOblFam${p}`, '0.00'); set(`nGasFamili${p}`, f2(gastosFam));
    set(`nResultUef${p}`, f2(resultadoUef)); set(`nCapacPago${p}`, f2(resultadoUef * 0.9)); set(`ntotporepg${p}`, '90.00');
  }
  if (!tieneReevaluacion) { for (const c of COLUMNAS.filter((c) => /2$/.test(c) && /^(n(Mon|Cos|Util|Gas|Obl|Otr|Tot|Res|Cap)|ntotpor)/.test(c) && !/^nDia|^nPre|^nTot(Mer|Com|Ven)/.test(c))) set(c, '0.00'); }

  // Ingresos del negocio (1 a 3 líneas)
  const lineas = 1 + (i % 3);
  for (let l = 1; l <= 5; l += 1) {
    if (l <= lineas) {
      const frec = 20 + l * 2; const cant = 40 + l * 10; const pv = 8 + l * 2.5; const pcmp = pv * 0.55;
      set(`descripcion${l}`, l === 1 ? GIROS[i % GIROS.length].slice(0, 28) : `INGRESO COMPLEMENTARIO ${l}`);
      set(`Frecuencia${l}`, f2(frec)); set(`nDiaBuenCAn${l}`, f2(cant * 1.3)); set(`nDiaBueDia${l}`, '8'); set(`nDiaMalCan${l}`, f2(cant * 0.6)); set(`nDiaMalDia${l}`, '6');
      set(`nDiaEstCan${l}`, f2(cant)); set(`nDiaEstUni${l}`, '10'); set(`nPreVenFin${l}`, f2(pv)); set(`nPreComPro${l}`, pcmp.toFixed(4));
      set(`nTotMerFin${l}`, f2(cant * pcmp * 2)); set(`nTotComPro${l}`, f2(cant * pcmp * frec)); set(`nTotVenFin${l}`, f2(cant * pv * frec)); set(`nCanEstFin${l}`, f2(cant));
    } else {
      set(`descripcion${l}`, 'NULL'); set(`Frecuencia${l}`, '0.00');
      for (const c of ['nDiaBuenCAn', 'nDiaMalCan', 'nDiaEstCan', 'nPreVenFin', 'nTotMerFin', 'nTotComPro', 'nTotVenFin', 'nCanEstFin']) set(`${c}${l}`, '0.00');
      set(`nDiaBueDia${l}`, '0'); set(`nDiaMalDia${l}`, '0'); set(`nDiaEstUni${l}`, '0'); set(`nPreComPro${l}`, '0.0000');
    }
  }

  // Endeudamiento del cliente (y cónyuge en algunas filas)
  const entidades = [['CAJA MUNICIPAL DE AHORRO Y CREDITO HUANCAYO', 'NORMAL', 'PEQ.EMP', monto * 0.7], ['BANCO DE PRUEBA S.A.', 'NORMAL', 'MICROEMPRESAS', 3200 + i * 400], ['FINANCIERA DE PRUEBA', 'CPP', 'CONSUMO NO REV', 900 + i * 100]];
  set('NNROENTIDA', String(entidades.length));
  set('FECHAOBTENCION', dmy(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
  entidades.forEach(([nom, cal, tipo, saldo], idx) => { set(`cnomifi${idx + 1}`, nom); set(`ccalempdes${idx + 1}`, cal); set(`cdestipcre${idx + 1}`, tipo); set(`nsaldo${idx + 1}`, f2(saldo)); });
  if (i % 2 === 1) { set('cnomifiConyu1', 'BANCO DE PRUEBA S.A.'); set('ccalempdesConyu1', 'NORMAL'); set('cdestipcreConyu1', 'CONSUMO REVOLVENTE'); set('nsaldoConyu1', f2(1800 + i * 100)); }
  return v;
}

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('OTROS');
ws.addRow(COLUMNAS);
for (let i = 0; i < cantidad; i += 1) {
  const fila = construirFila(i);
  ws.addRow(COLUMNAS.map((c) => (fila[c] === undefined ? 'NULL' : fila[c])));
}
await wb.xlsx.writeFile(salida);
console.log(`Muestra sintética generada: ${salida} (${cantidad} filas, ${COLUMNAS.length} columnas)`);
