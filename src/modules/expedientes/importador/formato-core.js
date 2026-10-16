import crypto from 'node:crypto';
import { antiguedadEnMeses, entero, fecha, normalizarClave, numero, tieneTextoDanado, texto } from './limpieza.js';
import { extraerCoordenadas, sinCoordenadas } from './coordenadas.js';

// Base "FV_..._CRED_EMP" del sistema core de Caja Huancayo: una fila por crédito, 262 columnas
// con nombres técnicos. Este módulo la convierte al modelo del sistema:
//   · columnas propias del expediente (para filtrar y asignar),
//   · cinco bloques JSON que alimentan la ficha (cliente, negocio, crédito, evaluación, deuda).
//
// Convención de la evaluación financiera en la base: cada valor viene en dos periodos.
//   sufijo 2 = reevaluación (la más reciente)   sufijo 1 = evaluación anterior
// Si no hubo reevaluación, el sufijo 2 viene en 0/NULL y el periodo se descarta.

export const FORMATO_CORE = 'CORE_262';
const COLUMNAS_FIRMA = ['ccodctacre', 'cnomcliente', 'docide'];

export function esFormatoCore(encabezados) {
  const claves = new Set(encabezados.map((h) => String(h).trim().toLowerCase()));
  return COLUMNAS_FIRMA.every((c) => claves.has(c));
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

function periodo(v, n) {
  const numeroEvaluacion = texto(v(`numeva${n}`));
  const fechaEvaluacion = fecha(v(`fechaeva${n}`));
  const sinEvaluacion = (!numeroEvaluacion || numeroEvaluacion === '0') && !fechaEvaluacion;
  if (sinEvaluacion) return null;
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

// Acceso a una fila sin distinguir mayúsculas en el nombre de la columna.
function accesoFila(fila, usadas) {
  const porClave = new Map(Object.entries(fila).map(([k, val]) => [k.trim().toLowerCase(), val]));
  return (nombre) => { usadas.add(nombre.toLowerCase()); return porClave.get(nombre.toLowerCase()); };
}

const huella = (objeto) => crypto.createHash('sha256').update(JSON.stringify(objeto)).digest('hex');

/**
 * @returns {{ expediente?: object, advertencias: string[], error?: string }}
 */
export function mapearFilaCore(fila, { hoja }) {
  const usadas = new Set();
  const v = accesoFila(fila, usadas);
  const advertencias = [];

  const codigo = texto(v('ccodctacre'), 50);
  const nombre = texto(v('cnomcliente'), 200);
  const documento = deducirDocumento(v('DocIde'));
  const asesor = texto(v('nombreAsesorActual'), 150) || texto(v('nombreAsesorOrigen'), 150);
  const faltantes = [];
  if (!codigo) faltantes.push('ccodctacre (N° de crédito)');
  if (!nombre) faltantes.push('cnomcliente');
  if (!documento.numero) faltantes.push('DocIde');
  if (!asesor) faltantes.push('nombreAsesorActual');
  if (faltantes.length) return { advertencias, error: `Faltan datos obligatorios: ${faltantes.join(', ')}` };

  const tipoCredito = deducirTipoCredito(hoja, v('cDesCortaTipCre'));
  if (!tipoCredito) return { advertencias, error: 'No se pudo determinar el tipo de crédito (la hoja debe llamarse OTROS o CONSUMO).' };

  const referenciaOriginal = texto(v('cRefDomCli'));
  const coordenadas = extraerCoordenadas(referenciaOriginal);
  if (!coordenadas) advertencias.push('SIN_COORDENADAS');
  if (documento.atipico) advertencias.push('DOCUMENTO_ATIPICO');

  const oficina = texto(v('Oficina'), 100);
  const distrito = texto(v('DisDOM'), 100);
  if (distrito && oficina && normalizarClave(oficina).replace(/^(AG\.?|AGENCIA|OF\.? ESP\.?)\s*/, '') === normalizarClave(distrito)) {
    advertencias.push('DISTRITO_IGUAL_A_AGENCIA');
  }

  const reevaluacion = periodo(v, 2);
  const anterior = periodo(v, 1);
  if (!reevaluacion && !anterior) advertencias.push('SIN_EVALUACION');

  const monedaCodigo = moneda(v('Moneda'), v('cCodTipMon'));
  const celular = telefono(v('TELFCLIENTE'));
  const fijo = telefono(v('TelefijoDom'));

  const negocios = [1, 2]
    .map((n) => ({
      direccion: texto(v(`DirEmp_${n}`)),
      distrito: texto(v(`DISTNEG_${n}`)),
      departamento: texto(v(`DEPNEG_${n}`)),
      referencia: texto(v(`RefEmp_${n}`)),
      contacto: texto(v(`NomEmp_${n}`)),
      telefono: telefono(v(`TelEmp_${n}`)),
    }))
    .filter((negocio) => negocio.direccion || negocio.referencia || negocio.telefono);

  const datosCliente = {
    fuente: texto(v('Fuente')),
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
    dias_atraso: entero(v('diasatraso')),
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
  // La base trae solo el crédito vigente; el historial se modela como lista para poder
  // sumar más créditos del cliente cuando el origen los entregue.
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
  }];

  const evaluacionFinanciera = { moneda: monedaCodigo, reevaluacion, anterior, ingresos: ingresos(v) };
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
  usadas.add('nro'); usadas.add('ubidom');
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

  return { expediente, advertencias, camposDanados: dañados.slice(0, 8), huella: huella(expediente), columnasUsadas: usadas };
}
