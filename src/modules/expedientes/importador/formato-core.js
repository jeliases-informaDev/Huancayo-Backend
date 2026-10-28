import crypto from 'node:crypto';
import { antiguedadEnMeses, entero, fecha, normalizarClave, numero, tieneTextoDanado, texto } from './limpieza.js';
import { extraerCoordenadas, sinCoordenadas } from './coordenadas.js';
import { camposDeDireccion } from '../../geocodificacion/direcciones.js';
import { ALIAS_CONSUMO_BANCO, PREFIJO_FUENTE_CONSUMO } from './columnas-consumo.js';

// Base "FV_..._CRED_EMP" del sistema core de Caja Huancayo: una fila por crédito, 262 columnas
// con nombres técnicos. Este módulo la convierte al modelo del sistema:
//   · columnas propias del expediente (para filtrar y asignar),
//   · cinco bloques JSON que alimentan la ficha (cliente, negocio, crédito, evaluación, deuda).
// La base de Consumo (297 columnas, ver columnas-consumo.js) llama distinto a muchos datos: pasa por el mismo mapeo, que pide cada dato por su nombre del
// core y, si no está, por el equivalente de Consumo (ALIAS_CONSUMO_BANCO). Solo trae de más el historial de créditos anteriores y la fuente de cada ingreso.
//
// Convención de la evaluación financiera en la base: cada valor viene en dos periodos.
//   sufijo 2 = reevaluación (la más reciente)   sufijo 1 = evaluación anterior
// Si no hubo reevaluación, el sufijo 2 viene en 0/NULL y el periodo se descarta.

export const FORMATO_CORE = 'CORE_262';
const COLUMNAS_FIRMA = ['ccodctacre', 'cnomcliente', 'docide'];

export function esFormatoCore(encabezados) {
  const claves = new Set(encabezados.map((h) => String(h).trim().toLowerCase()));
  const tiene = (c) => claves.has(c) || (ALIAS_CONSUMO_BANCO[c] || []).some((a) => claves.has(a));
  return COLUMNAS_FIRMA.every(tiene);
}

const BALANCE = [
  ['activo_corriente', 'ACTCTE1', 'ACTCTE2'],
  ['disponibles', 'nMonDISPONIBLE1', 'nMonDISPONIBLE2'],
  ['cuentas_por_cobrar', 'nMonCTASXCOBRAR1', 'nMonCTASXCOBRAR2'],
  ['otras_cuentas_por_cobrar', 'nMonOTRASCTASXCOBRAR1', 'nMonOTRASCTASXCOBRAR2'],
  ['adelanto_proveedores', 'nMonADELANTOPROVEE1', 'nMonADELANTOPROVEE2'],
  ['existencias', 'nMonEXISTENCIAS1', 'nMonEXISTENCIAS2'],
  ['activo_no_corriente', 'activonocorriente', 'activonocorriente2'],
  ['total_activo', 'TOTALACTIVO', 'TOTALACTIVO2'],
  ['pasivo_corriente', 'PASICOCORRIENTE', 'PASIVOCORRIENTE2'],
  ['proveedores', 'nMonPROVEEDORES1', 'nMonPROVEEDORES2'],
  ['otras_cuentas_por_pagar', 'nMonCTASXPAGAR1', 'nMonCTASXPAGAR2'],
  ['prestamos_corto_plazo', 'nMonPRESTAMOCP1', 'nMonPRESTAMOCP2'],
  ['prestamos_largo_plazo', 'nMonPRESTAMOLP1', 'nMonPRESTAMOLP2'],
  ['pasivo_no_corriente', 'PASIVONOCORRIENTE', 'PASIVONOCORRIENTE2'],
  ['total_pasivo', 'TOTALPASIVO', 'TOTALPASIVO2'],
  ['patrimonio', 'PATRIMONIO', 'PATROMINIO2'], // sic: así se llama la columna en la base
  ['total_pasivo_patrimonio', 'PASIVOMASPATRIMONIO', 'PASIVOMASPATRIMONIO2'],
];

const RESULTADOS = [
  ['ventas_netas', 'nMonVentas'],
  ['costo_ventas', 'nCosVenPro'],
  ['utilidad_bruta', 'nUtilidBru'],
  ['gastos_operativos', 'nGasOpeNeg'],
  ['utilidad_operativa', 'nUtilidOpe'],
  ['obligaciones_negocio', 'nObligaNeg'],
  ['utilidad_neta', 'nOblNetNeg'],
  ['otros_ingresos_uef', 'nOtrIngUef'],
  ['obligaciones_uef', 'nTotOblFam'],
  ['gastos_familiares', 'nGasFamili'],
  ['resultado_uef', 'nResultUef'],
  ['capacidad_pago', 'nCapacPago'],
  ['porcentaje_capacidad', 'ntotporepg'],
];

// `leerSiVacio`: en la base de Consumo las columnas de un periodo sin evaluación vienen en cero y no son «datos sin destino»: se leen aunque el periodo se descarte,
// para que no terminen en campos_adicionales. En la base MYPE no se toca (lo que ya se importó no cambia).
function periodo(v, n, { leerSiVacio = false } = {}) {
  const numeroEvaluacion = texto(v(`numeva${n}`));
  const fechaEvaluacion = fecha(v(`fechaeva${n}`));
  const sinEvaluacion = (!numeroEvaluacion || numeroEvaluacion === '0') && !fechaEvaluacion;
  if (sinEvaluacion) {
    if (leerSiVacio) {
      for (const [, col1, col2] of BALANCE) v(n === 1 ? col1 : col2);
      for (const [, base] of RESULTADOS) v(`${base}${n}`);
    }
    return null;
  }
  const balance = {};
  for (const [clave, col1, col2] of BALANCE) balance[clave] = numero(v(n === 1 ? col1 : col2));
  const resultados = {};
  for (const [clave, base] of RESULTADOS) resultados[clave] = numero(v(`${base}${n}`));
  return { numero_evaluacion: numeroEvaluacion, fecha: fechaEvaluacion, balance, resultados };
}

function ingresos(v) {
  const lineas = [];
  for (let n = 1; n <= 5; n += 1) {
    const linea = {
      descripcion: texto(v(`descripcion${n}`)),
      frecuencia: numero(v(`Frecuencia${n}`)),
      dias_buenos: { cantidad: numero(v(`nDiaBuenCAn${n}`)), dias: numero(v(`nDiaBueDia${n}`)) },
      dias_malos: { cantidad: numero(v(`nDiaMalCan${n}`)), dias: numero(v(`nDiaMalDia${n}`)) },
      dias_estandar: { cantidad: numero(v(`nDiaEstCan${n}`)), dias: numero(v(`nDiaEstUni${n}`)) },
      precio_compra: numero(v(`nPreComPro${n}`)),
      precio_venta: numero(v(`nPreVenFin${n}`)),
      total_mercaderias: numero(v(`nTotMerFin${n}`)),
      total_compras: numero(v(`nTotComPro${n}`)),
      total_ventas: numero(v(`nTotVenFin${n}`)),
      cantidad_estandar_fin: numero(v(`nCanEstFin${n}`)),
    };
    // Las 5 líneas siempre vienen; solo se guardan las que tienen contenido real.
    if (linea.descripcion || linea.total_ventas || linea.total_compras || linea.total_mercaderias) lineas.push(linea);
  }
  return lineas;
}

// Ficha de Consumo: la base de consumo del banco trae hasta 3 ingresos del cliente (descripción, relación, moneda,
// monto y tipo). La base MYPE de 262 columnas no trae estas columnas: entonces la lista queda vacía y no se guarda.
function ingresosConsumo(v) {
  const lineas = [];
  for (let n = 1; n <= 3; n += 1) {
    const linea = {
      descripcion: texto(v(`DESCRIPCIONCONSUMO${n}`)),
      relacion: texto(v(`RELACION${n}`)),
      moneda: texto(v(`MONEDA${n}`)),
      monto: numero(v(`NMONINGDEU${n}`)),
      tipo_ingreso: texto(v(`TIPOING${n}`)),
    };
    // La base de Consumo del banco agrega de dónde viene el ingreso (cFueIng); la anterior no lo trae y entonces la clave no se agrega (la huella no cambia).
    const fuenteIngreso = texto(v(`FUENTEING${n}`));
    if (fuenteIngreso) linea.fuente_ingreso = fuenteIngreso;
    if (linea.descripcion || linea.monto) lineas.push(linea);
  }
  return lineas;
}

function entidades(v, prefijo) {
  const lista = [];
  for (let n = 1; n <= 5; n += 1) {
    const entidad = texto(v(`cnomifi${prefijo}${n}`));
    const saldo = numero(v(`nsaldo${prefijo}${n}`));
    const calificacion = texto(v(`ccalempdes${prefijo}${n}`));
    const tipoCredito = texto(v(`cdestipcre${prefijo}${n}`));
    if (!entidad && !saldo) continue;
    lista.push({ entidad, saldo, calificacion, tipo_credito: tipoCredito });
  }
  return lista;
}

// Créditos anteriores del cliente (hasta 4): solo los trae la base de Consumo del banco, con los mismos 13 datos por crédito que su historial impreso. Salen con las
// claves del historial del crédito vigente (ver datosCredito.historial); en la base MYPE la lista queda vacía.
function historialPrevio(v) {
  const lista = [];
  for (let n = 1; n <= 4; n += 1) {
    const credito = {
      linea: texto(v(`cLinCre${n}`)),
      tipo: texto(v(`cTipCredit${n}`)),
      fecha_desembolso: fecha(v(`dFecDesemb${n}`)),
      monto: numero(v(`nMonDesemb${n}`)),
      moneda: moneda(v(`cMoneda${n}`), null),
      solicitud: texto(v(`cSolCre${n}`)),
      numero_credito: texto(v(`cCodCtaCre${n}`)),
      plazo_cuotas: entero(v(`nNumCuoApr${n}`)),
      cuota: numero(v(`nMontCuota${n}`)),
      condicion: texto(v(`cCondContab${n}`)),
      saldo: numero(v(`nSalCap${n}`)),
      asesor: texto(v(`cNomAsesor${n}`)),
      cuota_mas_atrasada: texto(v(`cCuoMasAtr${n}`)),
    };
    // Los créditos que no existen vienen como NULL o en blanco: solo se guardan los que tienen número, solicitud o monto.
    if (credito.numero_credito || credito.solicitud || credito.monto) lista.push(credito);
  }
  return lista;
}

// «006 - 73 día(s)»: cuota más atrasada y sus días. La base de Consumo no trae la columna de días de atraso; salen de este texto.
function diasDeAtraso(cuotaMasAtrasada) {
  const hit = String(cuotaMasAtrasada || '').match(/-\s*(\d+)\s*d/i);
  return hit ? Number(hit[1]) : null;
}

function deducirTipoCredito(hoja, descripcionTipo) {
  const h = normalizarClave(hoja);
  if (h.includes('CONSUMO')) return 'CONSUMO';
  if (h.includes('OTROS') || h.includes('MYPE') || h.includes('EMP')) return 'OTROS';
  const d = normalizarClave(descripcionTipo);
  if (d.startsWith('CONS')) return 'CONSUMO';
  if (d.includes('EMP') || d.includes('MICRO') || d.includes('PEQ') || d.includes('MYPE')) return 'OTROS';
  return null;
}

function deducirDocumento(valor) {
  const numeroDoc = texto(valor);
  if (!numeroDoc) return { tipo: 'DNI', numero: null, atipico: false };
  const digitos = numeroDoc.replace(/\D/g, '');
  if (digitos.length === 11) return { tipo: 'RUC', numero: numeroDoc, atipico: false };
  if (digitos.length === 8) return { tipo: 'DNI', numero: numeroDoc, atipico: false };
  if (digitos.length === 9) return { tipo: 'CE', numero: numeroDoc, atipico: false };
  return { tipo: 'DNI', numero: numeroDoc, atipico: true };
}

function moneda(valorTexto, codigo) {
  const m = normalizarClave(valorTexto);
  if (m.includes('US') || m.includes('$') || String(codigo).trim() === '2') return 'USD';
  return 'PEN';
}

function telefono(...valores) {
  for (const valor of valores) {
    const t = texto(valor);
    if (t) { const limpio = t.replace(/[^\d+ ]/g, '').trim(); if (limpio) return limpio.slice(0, 20); }
  }
  return null;
}

// Acceso a una fila sin distinguir mayúsculas en el nombre de la columna. Si la fila no trae la columna con el nombre del core, se busca con el de la base de Consumo
// (ALIAS_CONSUMO_BANCO) y se marca como usada la que se leyó. `v.existe(nombre)` dice si la fila trae esa columna, tal cual se llama.
function accesoFila(fila, usadas) {
  const porClave = new Map(Object.entries(fila).map(([k, val]) => [k.trim().toLowerCase(), val]));
  const v = (nombre) => {
    const clave = nombre.toLowerCase();
    usadas.add(clave);
    if (porClave.has(clave)) return porClave.get(clave);
    for (const alias of Object.hasOwn(ALIAS_CONSUMO_BANCO, clave) ? ALIAS_CONSUMO_BANCO[clave] : []) {
      if (porClave.has(alias)) { usadas.add(alias); return porClave.get(alias); }
    }
    return undefined;
  };
  v.existe = (nombre) => porClave.has(nombre.toLowerCase());
  return v;
}

const huella = (objeto) => crypto.createHash('sha256').update(JSON.stringify(objeto)).digest('hex');

/**
 * @returns {{ expediente?: object, advertencias: string[], error?: string, errores?: {campo: string, problema: string, corregir: string}[] }}
 *   `error` es el texto corrido de siempre; `errores` trae lo mismo separado por problema para mostrarlo en tabla.
 */
export function mapearFilaCore(fila, { hoja }) {
  const usadas = new Set();
  const v = accesoFila(fila, usadas);
  const advertencias = [];
  const consumoBanco = v.existe('cDocIde'); // la fila viene de la base de Consumo del banco (297 columnas)

  const codigo = texto(v('ccodctacre'), 50);
  const nombre = texto(v('cnomcliente'), 200);
  const documento = deducirDocumento(v('DocIde'));
  const asesor = texto(v('nombreAsesorActual'), 150) || texto(v('nombreAsesorOrigen'), 150);
  // Cada dato obligatorio que falta es un problema aparte: dice el campo, qué pasa y qué corregir (lo que se muestra en «Qué debes corregir»).
  const faltantes = [];
  const errores = [];
  const falta = (columna, campo, problema, corregir) => { faltantes.push(columna); errores.push({ campo, problema, corregir }); };
  if (!codigo) falta('ccodctacre (N° de crédito)', 'Crédito', 'Crédito vacío', 'Completa el número de crédito (columna ccodctacre).');
  if (!nombre) falta('cnomcliente', 'Cliente', 'Nombre del cliente vacío', 'Completa el nombre del cliente (columna cnomcliente).');
  if (!documento.numero) falta('DocIde', 'Documento', 'Documento vacío', 'Completa el documento del cliente (columna DocIde).');
  if (!asesor) falta('nombreAsesorActual', 'Asesor', 'Asesor vacío', 'Completa el asesor (columna nombreAsesorActual o nombreAsesorOrigen).');
  if (faltantes.length) return { advertencias, error: `Faltan datos obligatorios: ${faltantes.join(', ')}`, errores };

  const tipoCredito = deducirTipoCredito(hoja, v('cDesCortaTipCre'));
  if (!tipoCredito) {
    return {
      advertencias, error: 'No se pudo determinar el tipo de crédito (la hoja debe llamarse OTROS o CONSUMO).',
      errores: [{ campo: 'Tipo', problema: 'No se pudo determinar el tipo de crédito', corregir: 'Pon la fila en una hoja llamada OTROS (MYPE) o CONSUMO.' }],
    };
  }

  const referenciaOriginal = texto(v('cRefDomCli'));
  const coordenadas = extraerCoordenadas(referenciaOriginal);
  if (!coordenadas) advertencias.push('SIN_COORDENADAS');
  if (documento.atipico) advertencias.push('DOCUMENTO_ATIPICO');

  const oficina = texto(v('Oficina'), 100);
  const distrito = texto(v('DisDOM'), 100);
  if (distrito && oficina && normalizarClave(oficina).replace(/^(AG\.?|AGENCIA|OF\.? ESP\.?)\s*/, '') === normalizarClave(distrito)) {
    advertencias.push('DISTRITO_IGUAL_A_AGENCIA');
  }

  const reevaluacion = periodo(v, 2, { leerSiVacio: consumoBanco });
  const anterior = periodo(v, 1, { leerSiVacio: consumoBanco });
  // La evaluación de Consumo son sus ingresos (no el balance de un negocio): sin ellos es cuando se avisa. Si no, cada fila de Consumo saldría con un aviso falso.
  const lineasConsumo = ingresosConsumo(v);
  if (tipoCredito === 'CONSUMO' ? !lineasConsumo.length : (!reevaluacion && !anterior)) advertencias.push('SIN_EVALUACION');

  const monedaCodigo = moneda(v('Moneda'), v('cCodTipMon'));
  const celular = telefono(v('TELFCLIENTE'));
  const fijo = telefono(v('TelefijoDom'));

  // Como en el domicilio, algunos asesores escriben las coordenadas del local dentro de la referencia.
  const negocios = [1, 2]
    .map((n) => {
      const referenciaNegocio = texto(v(`RefEmp_${n}`));
      const coordenadasNegocio = extraerCoordenadas(referenciaNegocio);
      return {
        direccion: texto(v(`DirEmp_${n}`)),
        distrito: texto(v(`DISTNEG_${n}`)),
        departamento: texto(v(`DEPNEG_${n}`)),
        referencia: (referenciaNegocio ? sinCoordenadas(referenciaNegocio) : null) || null,
        contacto: texto(v(`NomEmp_${n}`)),
        telefono: telefono(v(`TelEmp_${n}`)),
        latitud: coordenadasNegocio?.latitud ?? null,
        longitud: coordenadasNegocio?.longitud ?? null,
        ubicacion_origen: coordenadasNegocio ? 'REFERENCIA' : null,
      };
    })
    .filter((negocio) => negocio.direccion || negocio.referencia || negocio.telefono || negocio.latitud !== null);

  // La ficha impresa de Consumo escribe «MPAUCC/<fuente>» (ver columnas-consumo.js): la columna cFuente trae solo lo de después de la barra.
  const fuenteBase = texto(v('Fuente'));
  const fuente = consumoBanco && tipoCredito === 'CONSUMO' && fuenteBase && !fuenteBase.toUpperCase().startsWith(`${PREFIJO_FUENTE_CONSUMO}/`)
    ? `${PREFIJO_FUENTE_CONSUMO}/${fuenteBase}` : fuenteBase;

  const datosCliente = {
    fuente,
    fecha_nacimiento: fecha(v('dFecNacCli')),
    edad: entero(v('edad')),
    estado_civil: texto(v('CDESESTCIV')),
    sexo: texto(v('CDESSEXO')),
    tipo_vivienda: texto(v('CONDICIONDOMCLI')),
    numero_suministro: texto(v('suministro')),
    zona: texto(v('zonaDOM')),
    referencia_domicilio: referenciaOriginal ? sinCoordenadas(referenciaOriginal) : null,
    tipo_cliente: texto(v('tipodecliente')),
    codigo_cliente: texto(v('cCodCliente')),
    codigo_expediente_core: texto(v('ccodexpcli')),
    codigos: { sexo: texto(v('cCodSexo')), estado_civil: texto(v('cCodEstCiv')) },
    telefono_fijo: fijo,
    telefono_celular: celular,
  };

  const datosNegocio = {
    actividad: texto(v('actividad')),
    sector_economico: texto(v('cDesSecEco')),
    antiguedad_meses: antiguedadEnMeses(v('cAspExpAct')),
    antiguedad_texto: texto(v('cAspExpAct')),
    negocios,
  };
  // Documento con que el cliente de consumo sustenta sus ingresos (columna de la base de consumo; en la MYPE no existe).
  const sustentoIngreso = texto(v('SustIngreso'));
  if (sustentoIngreso) datosNegocio.sustento_ingreso = sustentoIngreso;

  const datosCredito = {
    numero_credito: codigo,
    solicitud: texto(v('cCodSolCre')),
    linea_credito: texto(v('cCodLinCre')),
    producto: texto(v('cdesprodu')),
    subproducto: texto(v('cdessubcre')),
    modalidad: texto(v('Modalidadcre')),
    tipo_credito_desc: texto(v('cDesCortaTipCre')),
    fecha_desembolso: fecha(v('dfecdescre')),
    monto_desembolsado: numero(v('desembolsado')),
    monto_desembolsado_soles: numero(v('desembolsadoSoles')),
    saldo_capital: numero(v('saldocap')),
    saldo_capital_soles: numero(v('SALDOCAPSoles')),
    dias_atraso: entero(v('diasatraso')) ?? diasDeAtraso(v('cCuoDiaMasAtr')),
    condicion_contable: texto(v('cDesCorta')),
    estado: texto(v('cDesCortaEstado')),
    destino: texto(v('destino')),
    plazo_cuotas: entero(v('nnumcuoapr')),
    monto_cuota: numero(v('nmoncuota')),
    fecha_vencimiento: fecha(v('FECHAVENCIMIENTO')),
    fecha_ultimo_pago: fecha(v('dFecUltPag')),
    cuota_mas_atrasada: texto(v('cCuoDiaMasAtr')),
    calificacion_sbs: texto(v('CALIFICACIONSBS')),
    numero_entidades: entero(v('NNROENTIDA')),
    asesor_solicitud: texto(v('nombreAsesorOrigen')),
    asesor_actual: texto(v('nombreAsesorActual')),
    usuario_asesor_solicitud: texto(v('AnaSolicitud')),
    usuario_asesor_actual: texto(v('ccodusuana')),
    nivel_aprobador: { nombre: texto(v('NomAprobador')), cargo: texto(v('cargoPERAprob')), usuario: texto(v('usuarioAprueba')) },
    conyuge: texto(v('nombreconyuge')),
    marca_conyuge: texto(v('cCodConyug')),
    aval: texto(v('fiadores')),
    rep_legal: texto(v('representantes')),
    tipo_cambio: numero(v('nTipCamFijDes')),
    dias_gracia: entero(v('nNumDiaGra')),
    codigos: {
      moneda: texto(v('cCodTipMon')), tipo_credito: texto(v('cCodTipCre')), producto: texto(v('cCodProduc')),
      subproducto: texto(v('cCodSubPro')), pagare: texto(v('cCodPagare')), normal_refinanciado: texto(v('cCreNorRef')),
      estado_contable: texto(v('cestcrecon')), modalidad: texto(v('cCodModCre')), plazo: texto(v('cCodPlazo')), oficina: texto(v('cCodOficin')),
    },
  };
  // La base MYPE trae solo el crédito vigente; la de Consumo trae además hasta 4 créditos anteriores del cliente (historialPrevio): primero va el vigente.
  datosCredito.historial = [{
    linea: datosCredito.linea_credito,
    tipo: datosCredito.tipo_credito_desc,
    fecha_desembolso: datosCredito.fecha_desembolso,
    monto: datosCredito.monto_desembolsado,
    moneda: monedaCodigo,
    solicitud: datosCredito.solicitud,
    numero_credito: codigo,
    plazo_cuotas: datosCredito.plazo_cuotas,
    cuota: datosCredito.monto_cuota,
    condicion: datosCredito.condicion_contable,
    saldo: datosCredito.saldo_capital_soles ?? datosCredito.saldo_capital,
    asesor: datosCredito.asesor_actual,
    cuota_mas_atrasada: datosCredito.cuota_mas_atrasada,
  }, ...historialPrevio(v)];

  // Una evaluación posterior al desembolso no pudo sustentar este crédito: lo normal es que la evaluación, los ingresos y las deudas de la fila sean de OTRO cliente
  // (por ejemplo, un archivo armado juntando consultas ordenadas distinto) y la ficha mostraría datos ajenos. Se avisa; solo se revisa en la base de Consumo del banco.
  if (consumoBanco && anterior?.fecha && datosCredito.fecha_desembolso && anterior.fecha > datosCredito.fecha_desembolso) advertencias.push('EVALUACION_POSTERIOR_AL_DESEMBOLSO');

  const evaluacionFinanciera = { moneda: monedaCodigo, reevaluacion, anterior, ingresos: ingresos(v) };
  if (lineasConsumo.length) evaluacionFinanciera.ingresos_consumo = lineasConsumo;
  const endeudamiento = {
    fecha_corte: fecha(v('FECHAOBTENCION')),
    numero_entidades: datosCredito.numero_entidades,
    entidades: entidades(v, ''),
    entidades_conyuge: entidades(v, 'Conyu'),
  };

  const expediente = {
    codigo_expediente: codigo,
    tipo_credito: tipoCredito,
    oficina,
    tipo_documento_cliente: documento.tipo,
    numero_documento_cliente: documento.numero.slice(0, 20),
    nombres_cliente: nombre,
    telefono_cliente: celular || fijo,
    direccion_domicilio: texto(v('cdirdomcli'), 255),
    distrito,
    provincia: texto(v('ProvDom'), 100),
    departamento: texto(v('depDom'), 100),
    latitud: coordenadas?.latitud ?? null,
    longitud: coordenadas?.longitud ?? null,
    ubicacion_origen: coordenadas ? 'REFERENCIA' : null,
    asesor_responsable: asesor,
    monto_desembolso: datosCredito.monto_desembolsado,
    moneda: monedaCodigo,
    datos_cliente: datosCliente,
    datos_negocio: datosNegocio,
    datos_credito: datosCredito,
    evaluacion_financiera: evaluacionFinanciera,
    endeudamiento,
  };

  // Ninguna columna de la base queda sin destino: lo que el mapeo no consume (columnas nuevas o
  // sin uso conocido) se conserva tal cual en datos_credito.campos_adicionales.
  usadas.add('nro'); usadas.add('ubidom'); usadas.add('cnum'); usadas.add('ctipfic'); // cNum: correlativo de la muestra; cTipFic: «CONSUMO», ya lo dice la hoja
  const adicionales = {};
  for (const [clave, valor] of Object.entries(fila)) {
    if (usadas.has(clave.trim().toLowerCase())) continue;
    const limpio = typeof valor === 'string' || typeof valor === 'number' ? texto(valor) : null;
    if (limpio !== null) adicionales[clave.trim()] = limpio;
  }
  // Descartadas a propósito: correlativo de la muestra y ubicación redundante (depto-provincia-distrito).
  datosCredito.campos_adicionales = adicionales;

  // Texto dañado: el archivo perdió Ñ/acentos al exportarse (aparece U+FFFD). Se importa igual,
  // pero se avisa para pedir un archivo nuevo en UTF-8 en lugar de corregir a mano.
  const dañados = [];
  const revisar = (ruta, valor) => {
    if (typeof valor === 'string') { if (tieneTextoDanado(valor)) dañados.push(ruta); return; }
    if (Array.isArray(valor)) { valor.forEach((x, i) => revisar(`${ruta}[${i}]`, x)); return; }
    if (valor && typeof valor === 'object') Object.entries(valor).forEach(([k, x]) => revisar(ruta ? `${ruta}.${k}` : k, x));
  };
  revisar('', expediente);
  if (dañados.length) advertencias.push('TEXTO_DANADO');

  // Nomenclatura de la dirección (tipo de vía, número, manzana/lote…) y su calidad. Se agrega después de calcular la huella para no
  // alterar la huella de las filas ya importadas.
  const huellaFila = huella(expediente);
  const direccionNormalizada = camposDeDireccion({ direccion: expediente.direccion_domicilio, distrito: expediente.distrito, provincia: expediente.provincia, tieneCoordenadas: expediente.latitud != null });
  advertencias.push(...direccionNormalizada.advertencias);
  return { expediente: { ...expediente, ...direccionNormalizada.campos }, advertencias, camposDanados: dañados.slice(0, 8), huella: huellaFila, columnasUsadas: usadas };
}
