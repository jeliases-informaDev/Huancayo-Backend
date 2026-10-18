// Filas de ejemplo con la estructura exacta de la base MYPE del core (262 columnas, hoja OTROS), con datos INVENTADOS pero
// completos y coherentes: sirven para la plantilla descargable del panel y para generar muestras de prueba sin datos personales.
// Cada fila trae domicilio con coordenadas en la referencia, dos locales del negocio, las dos evaluaciones, cinco líneas de
// ingresos y el endeudamiento del cliente (y del cónyuge cuando está casado).
import { COLUMNAS_CORE } from './columnas-core.js';

const f2 = (n) => Number(n).toFixed(2);
const dmy = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

const APELLIDOS = ['QUISPE', 'HUAMAN', 'FLORES', 'ROJAS', 'TORRES', 'CASTRO', 'VARGAS', 'MENDOZA', 'PAREDES', 'SALAZAR', 'ESPINOZA', 'CHAVEZ', 'RAMOS', 'GUTIERREZ', 'MAMANI', 'CCANTO', 'POMA', 'SOTO'];
const NOMBRES = ['MARIA ELENA', 'JOSE LUIS', 'ROSA ISABEL', 'CARLOS ALBERTO', 'ANA LUCIA', 'JUAN CARLOS', 'LUZ MARINA', 'PEDRO PABLO', 'GLADYS', 'VICTOR RAUL', 'NANCY', 'MIGUEL ANGEL', 'ELIZABETH', 'RICHARD', 'YOLANDA', 'WILMER'];
const GIROS = [
  ['VENTA AL POR MENOR DE ABARROTES', 'COMERCIO', 'BODEGA', 'ABARROTES SURTIDOS'],
  ['CONFECCION DE PRENDAS DE VESTIR', 'INDUSTRIA', 'TALLER DE CONFECCIONES', 'POLOS Y PANTALONES'],
  ['SERVICIO DE TRANSPORTE DE PASAJEROS', 'SERVICIOS', 'TRANSPORTE URBANO', 'PASAJES'],
  ['VENTA DE COMIDA PREPARADA', 'SERVICIOS', 'RESTAURANTE', 'MENUS Y PLATOS A LA CARTA'],
  ['REPARACION DE VEHICULOS', 'SERVICIOS', 'TALLER DE MECANICA', 'SERVICIO DE MECANICA'],
  ['VENTA DE ROPA Y CALZADO', 'COMERCIO', 'TIENDA DE ROPA', 'ROPA PARA DAMA'],
  ['VENTA DE FRUTAS Y VERDURAS', 'COMERCIO', 'PUESTO DE MERCADO', 'FRUTAS Y VERDURAS'],
  ['PELUQUERIA Y SALON DE BELLEZA', 'SERVICIOS', 'SALON DE BELLEZA', 'CORTES Y TINTES'],
  ['FERRETERIA', 'COMERCIO', 'FERRETERIA', 'MATERIALES DE CONSTRUCCION'],
  ['VENTA DE PRODUCTOS DE LIMPIEZA', 'COMERCIO', 'DISTRIBUIDORA', 'PRODUCTOS DE LIMPIEZA'],
];
// Zonas con coordenadas reales de la calle principal (Lima y Huancayo), agencia que las atiende y vías cercanas.
const ZONAS = [
  // El nombre de la agencia nunca coincide con el distrito: el importador avisa cuando el asesor puso la agencia en vez del distrito real.
  { distrito: 'COMAS', provincia: 'LIMA', departamento: 'LIMA', oficina: 'AG. LIMA NORTE', codOficina: '301', lat: -11.9330, lon: -77.0540, vias: ['AV. TUPAC AMARU', 'AV. SAN MARTIN', 'JR. LOS INCAS', 'AV. UNIVERSITARIA'] },
  { distrito: 'LOS OLIVOS', provincia: 'LIMA', departamento: 'LIMA', oficina: 'AG. PRO', codOficina: '302', lat: -11.9780, lon: -77.0710, vias: ['AV. ALFREDO MENDIOLA', 'AV. ANTUNEZ DE MAYOLO', 'JR. LAS PALMERAS'] },
  { distrito: 'SAN JUAN DE LURIGANCHO', provincia: 'LIMA', departamento: 'LIMA', oficina: 'AG. ZARATE', codOficina: '303', lat: -11.9960, lon: -77.0050, vias: ['AV. PROCERES DE LA INDEPENDENCIA', 'AV. LAS FLORES', 'JR. LOS JARDINES'] },
  { distrito: 'VILLA EL SALVADOR', provincia: 'LIMA', departamento: 'LIMA', oficina: 'AG. LIMA SUR', codOficina: '304', lat: -12.2130, lon: -76.9370, vias: ['AV. PACHACUTEC', 'AV. MICAELA BASTIDAS', 'AV. REVOLUCION'] },
  { distrito: 'ATE', provincia: 'LIMA', departamento: 'LIMA', oficina: 'AG. SANTA CLARA', codOficina: '305', lat: -12.0260, lon: -76.9180, vias: ['AV. NICOLAS AYLLON', 'AV. SEPARADORA INDUSTRIAL', 'JR. LOS CIPRESES'] },
  { distrito: 'SAN MARTIN DE PORRES', provincia: 'LIMA', departamento: 'LIMA', oficina: 'AG. FIORI', codOficina: '306', lat: -12.0160, lon: -77.0680, vias: ['AV. PERU', 'AV. EDUARDO DE HABICH', 'JR. HUASCAR'] },
  { distrito: 'CALLAO', provincia: 'CALLAO', departamento: 'CALLAO', oficina: 'AG. BELLAVISTA', codOficina: '307', lat: -12.0560, lon: -77.1180, vias: ['AV. SAENZ PEÑA', 'AV. OSCAR R. BENAVIDES', 'JR. COLON'] },
  { distrito: 'EL TAMBO', provincia: 'HUANCAYO', departamento: 'JUNIN', oficina: 'AG. HUANCAYO NORTE', codOficina: '101', lat: -12.0470, lon: -75.2160, vias: ['AV. MARISCAL CASTILLA', 'JR. JULIO SUMAR', 'AV. HUANCAVELICA'] },
  { distrito: 'CHILCA', provincia: 'HUANCAYO', departamento: 'JUNIN', oficina: 'AG. HUANCAYO SUR', codOficina: '102', lat: -12.0860, lon: -75.2060, vias: ['AV. 9 DE DICIEMBRE', 'JR. LEONCIO PRADO', 'AV. LOS PROCERES'] },
  { distrito: 'HUANCAYO', provincia: 'HUANCAYO', departamento: 'JUNIN', oficina: 'OF. PRINCIPAL', codOficina: '100', lat: -12.0650, lon: -75.2100, vias: ['CALLE REAL', 'JR. ANCASH', 'AV. GIRALDEZ'] },
];
const ASESORES = [['LRIVAS', 'RIVAS/LAUREANO,LORENA MEDALI'], ['PCRUZF', 'CRUZ/FERNANDEZ,EVELYN PAMELA'], ['JTORRES', 'TORRES/VILCA,JORGE LUIS'], ['MCHAVEZ', 'CHAVEZ/ROMERO,MARIA DEL PILAR'], ['AQUISPE', 'QUISPE/HUAMAN,ANDRES'], ['DSOTO', 'SOTO/PAREDES,DIANA CAROLINA']];
const ENTIDADES = [['CAJA MUNICIPAL DE AHORRO Y CREDITO HUANCAYO', 'PEQ.EMP'], ['BANCO DE CREDITO DEL PERU', 'MICROEMPRESAS'], ['MIBANCO', 'PEQ.EMP'], ['FINANCIERA CONFIANZA', 'CONSUMO NO REV'], ['CAJA AREQUIPA', 'MICROEMPRESAS'], ['COMPARTAMOS FINANCIERA', 'PEQ.EMP'], ['BANCO PICHINCHA', 'CONSUMO REVOLVENTE']];

// Generador determinista: la misma semilla produce la misma muestra (así las plantillas no cambian en cada descarga).
function azar(semilla) {
  let s = semilla >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/**
 * Construye la fila i (desde 0) como objeto { columna: valor } con las 262 columnas. opciones.semilla cambia los datos.
 */
export function construirFilaCore(i, opciones = {}) {
  const rnd = azar((opciones.semilla ?? 20261018) + i * 7919);
  const elegir = (lista) => lista[Math.floor(rnd() * lista.length)];
  const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const n = i + 1;
  const hoy = opciones.hoy ? new Date(opciones.hoy) : new Date();
  const zona = ZONAS[i % ZONAS.length];
  const giro = GIROS[i % GIROS.length];
  const [codAsesor, asesor] = ASESORES[i % ASESORES.length];
  const [codAsesorOrigen, asesorOrigen] = ASESORES[(i + 2) % ASESORES.length];
  const femenino = i % 2 === 0;
  const casado = i % 3 !== 1;
  const apellido1 = elegir(APELLIDOS); const apellido2 = elegir(APELLIDOS);
  const nombre = `${apellido1} ${apellido2}, ${NOMBRES[(i * 5) % NOMBRES.length]}`;
  const conyuge = `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}, ${NOMBRES[(i * 5 + 1) % NOMBRES.length]}`;
  const nacimiento = new Date(1962 + (i * 7) % 38, (i * 5) % 12, 1 + (i * 3) % 27);
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  const desembolso = new Date(hoy.getFullYear(), hoy.getMonth() - 1 - (i % 9), 2 + (i % 25));
  const monto = 3000 + entre(0, 40) * 1000;
  const cuotas = [12, 18, 24, 36][i % 4];
  const cuota = monto * (1 + 0.028 * cuotas) / cuotas;
  const pagadas = Math.min(cuotas - 1, 1 + (i % 9));
  const saldo = monto * (1 - pagadas / cuotas);
  const atraso = i % 5 === 0 ? entre(8, 60) : 0;
  const refinanciado = i % 11 === 0;
  const lat = zona.lat + (rnd() - 0.5) * 0.02; const lon = zona.lon + (rnd() - 0.5) * 0.02;
  const numero = 100 + entre(0, 1800);
  const via = elegir(zona.vias); const via2 = elegir(zona.vias);
  const celular = `9${String(10000000 + ((i * 7919 + 1234567) % 89999999)).padStart(8, '0')}`;
  const fijo = `0${zona.departamento === 'LIMA' || zona.departamento === 'CALLAO' ? '1' : '64'}${String(2000000 + ((i * 104729) % 7999999)).padStart(7, '0')}`;
  const dni = String(10000000 + ((i * 2654435) % 89999999)).padStart(8, '0');

  const v = {};
  const set = (k, valor) => { v[k] = valor; };
  set('Nro', String(n));
  set('ccodctacre', `1071631055519${String(50000 + n).padStart(6, '0')}`);
  set('cCodSolCre', `1630${String(40000 + n).padStart(6, '0')}`);
  set('dfecdescre', dmy(desembolso));
  set('ccodexpcli', `1010${String(3000 + n).padStart(5, '0')}`);
  set('cnomcliente', nombre);
  set('tipodecliente', i % 4 === 0 ? 'NUEVO' : 'RECURRENTE');
  set('Moneda', 'S/');
  set('desembolsado', f2(monto)); set('saldocap', f2(saldo));
  set('diasatraso', String(atraso));
  set('cDesCorta', refinanciado ? 'REFINANCIADO' : 'VIGENTE');
  set('CONDICIONDOMCLI', ['PROPIA AUTOFINANCIADA', 'ALQUILADA', 'FAMILIAR', 'PROPIA HIPOTECADA'][i % 4]);
  set('ProvDom', zona.provincia);
  set('destino', ['CAPITAL DE TRABAJO', 'ACTIVO FIJO', 'CAPITAL DE TRABAJO', 'MEJORA DE LOCAL'][i % 4]);
  set('cdesprodu', 'A CUOTA FIJA');
  set('cdessubcre', monto > 20000 ? 'PEQUENA EMPRESA' : 'MICROEMPRESA');
  set('Modalidadcre', refinanciado ? 'REFINANCIADO' : 'NORMAL');
  set('TelefijoDom', fijo); set('TELFCLIENTE', celular);
  set('NomEmp_1', `${nombre.split(',')[1].trim()} ${apellido1} / ${giro[0]}`);
  set('NomEmp_2', `${conyuge.split(',')[1].trim()} ${conyuge.split(' ')[0]} / ${giro[2]}`);
  set('TelEmp_1', celular); set('TelEmp_2', `9${String(20000000 + ((i * 7877 + 7654321) % 79999999)).padStart(8, '0')}`);
  set('cCodConyug', casado ? `C${String(100000 + n).padStart(6, '0')}` : 'NOCONYU');
  set('ccodusuana', codAsesor); set('nombreAsesorActual', asesor);
  set('AnaSolicitud', codAsesorOrigen); set('nombreAsesorOrigen', asesorOrigen);
  set('cCodOficin', zona.codOficina); set('Oficina', zona.oficina);
  set('desembolsadoSoles', f2(monto));
  set('nnumcuoapr', String(cuotas));
  set('cDesSecEco', giro[1]);
  set('cDesCortaTipCre', monto > 20000 ? 'PEQ.EMP' : 'MICROEMP');
  set('DirEmp_1', `${via} ${numero}`); set('DISTNEG_1', zona.distrito); set('DEPNEG_1', zona.departamento);
  set('RefEmp_1', `Ref: ${lat.toFixed(6)},${lon.toFixed(6)} ${['FRENTE AL MERCADO', 'A MEDIA CUADRA DEL PARADERO', 'AL COSTADO DE LA FARMACIA', 'ESQUINA CON EL PARQUE'][i % 4]}`);
  set('DirEmp_2', `${via2} ${numero + 120}`); set('DISTNEG_2', zona.distrito); set('DEPNEG_2', zona.departamento);
  set('RefEmp_2', `Ref: ${(lat + 0.0021).toFixed(6)},${(lon - 0.0017).toFixed(6)} SEGUNDO LOCAL, PUESTO ${10 + (i % 40)}`);
  set('cdirdomcli', `${via} ${numero} ${i % 3 === 0 ? `INT. ${1 + (i % 6)}` : i % 3 === 1 ? `PISO ${1 + (i % 4)}` : `DPTO. ${100 + (i % 12) * 100 + (i % 9)}`}`);
  set('DisDOM', zona.distrito); set('depDom', zona.departamento);
  set('dFecNacCli', dmy(nacimiento));
  set('CDESESTCIV', casado ? (i % 6 === 0 ? 'CONVIVIENTE' : 'CASADO') : (i % 7 === 0 ? 'DIVORCIADO' : 'SOLTERO'));
  set('CDESSEXO', femenino ? 'FEMENINO' : 'MASCULINO');
  set('suministro', String(1400000 + ((i * 7331) % 599999)));
  set('DocIde', dni);
  set('ubiDOM', `${zona.departamento} - ${zona.provincia} - ${zona.distrito}`);
  set('zonaDOM', `${zona.distrito} ${['CENTRO', 'NORTE', 'SUR', 'ESTE'][i % 4]}`);
  set('cRefDomCli', `Ref: ${lat.toFixed(6)},${lon.toFixed(6)} ${['CASA DE DOS PISOS, PUERTA VERDE', 'PORTON NEGRO FRENTE A LA LOSA', 'AL LADO DE LA BODEGA, REJA BLANCA', 'TERCER PISO, TIMBRE 3'][i % 4]}`);
  set('cDesCortaEstado', atraso > 30 ? 'VENCIDO' : 'VIGENTE');
  set('cCodTipMon', '1'); set('cCodTipCre', monto > 20000 ? '13' : '14'); set('cCodProduc', '02'); set('cCodSubPro', monto > 20000 ? '01' : '02');
  set('cCodPagare', `163000${String(16000 + n).padStart(6, '0')}`);
  set('cCodLinCre', `163002${String(10000 + n).padStart(6, '0')}`);
  set('cCreNorRef', refinanciado ? 'R' : 'N');
  set('cCodCliente', `10701${String(190000 + n).padStart(7, '0')}`);
  set('cestcrecon', atraso > 30 ? 'V' : 'F'); set('cCodModCre', refinanciado ? '02' : '01'); set('cCodPlazo', String(cuotas / 6));
  set('Fuente', 'BASE CORE MYPE');
  set('cCodSexo', femenino ? 'F' : 'M'); set('cCodEstCiv', casado ? '2' : '1');
  set('cAspExpAct', `${2 + (i % 14)} AÑOS`);
  set('dFecUltPag', dmy(new Date(hoy.getFullYear(), hoy.getMonth() - (atraso > 30 ? 2 : 0), 2 + (i % 25))));
  set('usuarioAprueba', 'JNEGOCIOS'); set('nNumDiaGra', String(i % 3 === 0 ? 5 : 0));
  set('cargoPERAprob', 'JEFE DE NEGOCIOS REGIONALES');
  set('NomAprobador', 'GUTIERREZ/SALAZAR,RICARDO MANUEL');
  set('actividad', giro[0]);
  set('edad', String(edad));
  set('SALDOCAPSoles', f2(saldo)); set('nTipCamFijDes', '1.00');
  set('nombreconyuge', casado ? conyuge : 'SIN CONYUGE');
  set('fiadores', i % 4 === 0 ? `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}, ${NOMBRES[(i * 3) % NOMBRES.length]}` : 'SIN FIADOR');
  set('representantes', 'TITULAR');
  set('cCuoDiaMasAtr', atraso ? `${String(pagadas + 1).padStart(3, '0')} - ${atraso} día(s)` : '-.-');
  set('FECHAVENCIMIENTO', dmy(new Date(desembolso.getFullYear(), desembolso.getMonth() + cuotas, desembolso.getDate())));
  set('nmoncuota', f2(cuota));
  set('CALIFICACIONSBS', atraso > 30 ? 'DEFICIENTE' : atraso > 8 ? 'CPP' : 'NORMAL');

  // Evaluación financiera: sufijo 1 = anterior, sufijo 2 = reevaluación (más reciente, ~8 % más)
  const ventas = Math.round(monto * (0.25 + rnd() * 0.3)); const costo = Math.round(ventas * 0.58); const gastosOp = Math.round(ventas * 0.14);
  const obligNegocio = Math.round(cuota); const gastosFam = 800 + entre(0, 12) * 100;
  const activoCte = Math.round(monto * 0.8); const activoNoCte = Math.round(monto * 1.6); const pasivoCp = Math.round(monto * 0.3); const pasivoLp = Math.round(saldo);
  set('numeva1', String(7000000 + n)); set('fechaeva1', dmy(new Date(hoy.getFullYear(), hoy.getMonth() - 10 - (i % 4), 12)));
  set('numeva2', String(7100000 + n)); set('fechaeva2', dmy(new Date(hoy.getFullYear(), hoy.getMonth() - 2 - (i % 4), 20)));
  for (const p of [1, 2]) {
    const k = p === 2 ? 1.08 : 1;
    const sfx = (a, b) => (p === 1 ? a : b);
    const ac = Math.round(activoCte * k); const anc = Math.round(activoNoCte * k); const pc = Math.round(pasivoCp * k); const pl = Math.round(pasivoLp * k);
    const totalActivo = ac + anc; const totalPasivo = pc + pl;
    set(sfx('ACTCTE1', 'ACTCTE2'), f2(ac)); set(sfx('activonocorriente', 'activonocorriente2'), f2(anc));
    set(sfx('PASICOCORRIENTE', 'PASIVOCORRIENTE2'), f2(pc)); set(sfx('PASIVONOCORRIENTE', 'PASIVONOCORRIENTE2'), f2(pl));
    set(sfx('PATRIMONIO', 'PATROMINIO2'), f2(totalActivo - totalPasivo));
    set(`nMonDISPONIBLE${p}`, f2(Math.round(ac * 0.12))); set(`nMonCTASXCOBRAR${p}`, f2(Math.round(ac * 0.08))); set(`nMonOTRASCTASXCOBRAR${p}`, f2(Math.round(ac * 0.03)));
    set(`nMonADELANTOPROVEE${p}`, f2(Math.round(ac * 0.02))); set(`nMonEXISTENCIAS${p}`, f2(ac - Math.round(ac * 0.25)));
    set(`nMonPROVEEDORES${p}`, f2(Math.round(pc * 0.5))); set(`nMonCTASXPAGAR${p}`, f2(Math.round(pc * 0.1))); set(`nMonPRESTAMOCP${p}`, f2(pc - Math.round(pc * 0.6))); set(`nMonPRESTAMOLP${p}`, f2(pl));
    set(sfx('TOTALACTIVO', 'TOTALACTIVO2'), f2(totalActivo)); set(sfx('TOTALPASIVO', 'TOTALPASIVO2'), f2(totalPasivo));
    set(sfx('PASIVOMASPATRIMONIO', 'PASIVOMASPATRIMONIO2'), f2(totalActivo));
    const vt = Math.round(ventas * k); const cv = Math.round(costo * k); const utilNeta = vt - cv - gastosOp - obligNegocio; const resultadoUef = utilNeta + 300 - gastosFam;
    set(`nMonVentas${p}`, f2(vt)); set(`nCosVenPro${p}`, f2(cv)); set(`nUtilidBru${p}`, f2(vt - cv));
    set(`nGasOpeNeg${p}`, f2(gastosOp)); set(`nUtilidOpe${p}`, f2(vt - cv - gastosOp)); set(`nObligaNeg${p}`, f2(obligNegocio));
    set(`nOblNetNeg${p}`, f2(utilNeta)); set(`nOtrIngUef${p}`, '300.00'); set(`nTotOblFam${p}`, f2(Math.round(gastosFam * 0.2))); set(`nGasFamili${p}`, f2(gastosFam));
    set(`nResultUef${p}`, f2(resultadoUef)); set(`nCapacPago${p}`, f2(Math.round(resultadoUef * 0.8))); set(`ntotporepg${p}`, f2(Math.min(95, Math.max(20, Math.round(100 * cuota / Math.max(1, resultadoUef))))));
  }

  // Cinco líneas de ingresos del negocio (productos o servicios que vende)
  for (let l = 1; l <= 5; l += 1) {
    const frec = [26, 24, 20, 12, 8][l - 1]; const cant = 20 + ((i + l) * 13) % 60; const pv = 5 + ((i * l) % 40) * 1.5; const pcmp = pv * 0.6;
    set(`descripcion${l}`, l === 1 ? giro[3] : `${['VENTA', 'SERVICIO', 'PRODUCTO', 'LINEA'][l % 4]} ${l}: ${['GASEOSAS Y AGUA', 'GOLOSINAS', 'PRODUCTOS DE LIMPIEZA', 'ENVIOS Y RECARGAS', 'ACCESORIOS'][(i + l) % 5]}`);
    set(`Frecuencia${l}`, f2(frec)); set(`nDiaBuenCAn${l}`, f2(cant * 1.3)); set(`nDiaBueDia${l}`, '8'); set(`nDiaMalCan${l}`, f2(cant * 0.6)); set(`nDiaMalDia${l}`, '6');
    set(`nDiaEstCan${l}`, f2(cant)); set(`nDiaEstUni${l}`, '12'); set(`nPreVenFin${l}`, f2(pv)); set(`nPreComPro${l}`, pcmp.toFixed(4));
    set(`nTotMerFin${l}`, f2(cant * pcmp * 2)); set(`nTotComPro${l}`, f2(cant * pcmp * frec)); set(`nTotVenFin${l}`, f2(cant * pv * frec)); set(`nCanEstFin${l}`, f2(cant));
  }

  // Endeudamiento en el sistema financiero: entre 1 y 5 entidades (la primera siempre la propia caja)
  const cantidadEntidades = 1 + (i % 5);
  set('NNROENTIDA', String(cantidadEntidades));
  set('FECHAOBTENCION', dmy(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
  for (let e = 1; e <= 5; e += 1) {
    if (e <= cantidadEntidades) {
      const [entidad, tipo] = ENTIDADES[(i + e - 1) % ENTIDADES.length];
      set(`cnomifi${e}`, entidad); set(`ccalempdes${e}`, e === 1 && atraso > 8 ? 'CPP' : 'NORMAL'); set(`cdestipcre${e}`, tipo);
      set(`nsaldo${e}`, f2(e === 1 ? saldo : 500 + ((i * e * 977) % 9000)));
    } else { set(`cnomifi${e}`, '-'); set(`ccalempdes${e}`, '-'); set(`cdestipcre${e}`, '-'); set(`nsaldo${e}`, '0.00'); }
  }
  const entidadesConyuge = casado ? 1 + (i % 2) : 0;
  for (let e = 1; e <= 5; e += 1) {
    if (e <= entidadesConyuge) {
      const [entidad, tipo] = ENTIDADES[(i + e + 3) % ENTIDADES.length];
      set(`cnomifiConyu${e}`, entidad); set(`ccalempdesConyu${e}`, 'NORMAL'); set(`cdestipcreConyu${e}`, tipo); set(`nsaldoConyu${e}`, f2(800 + ((i * e * 613) % 6000)));
    } else { set(`cnomifiConyu${e}`, '-'); set(`ccalempdesConyu${e}`, '-'); set(`cdestipcreConyu${e}`, '-'); set(`nsaldoConyu${e}`, '0.00'); }
  }
  return v;
}

// Fila como arreglo en el orden de las 262 columnas (para escribir el Excel).
export const filaCoreComoArreglo = (fila) => COLUMNAS_CORE.map((c) => (fila[c] === undefined ? '' : fila[c]));
