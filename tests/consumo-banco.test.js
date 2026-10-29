import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { ALIAS_CONSUMO_BANCO, COLUMNAS_CONSUMO_BANCO } from '../src/modules/expedientes/importador/columnas-consumo.js';
import { COLUMNAS_CONSUMO } from '../src/modules/expedientes/importador/columnas-core.js';
import { esFormatoCore, mapearFilaCore } from '../src/modules/expedientes/importador/formato-core.js';
import { construirFilaConsumo, construirFilaCore } from '../src/modules/expedientes/importador/muestra-core.js';
import { construirFilaConsumoBanco, filaConsumoBancoComoArreglo } from '../src/modules/expedientes/importador/muestra-consumo.js';
import { extraerCoordenadas, sinCoordenadas } from '../src/modules/expedientes/importador/coordenadas.js';
import { renderizarFicha } from '../src/modules/reportes/ficha-word.js';

// La base de Consumo que entrega Caja Huancayo (297 columnas, hoja CONSUMO). Todo con datos inventados: la muestra real del banco tiene datos de clientes y no se sube.
const HOY = { hoy: '2026-10-27' };
const mapear = (fila) => mapearFilaCore(fila, { hoja: 'CONSUMO' });

describe('Consumo del banco — estructura', () => {
  test('tiene 297 columnas sin repetidas, en el orden de la muestra del banco', () => {
    assert.equal(COLUMNAS_CONSUMO_BANCO.length, 297);
    assert.equal(new Set(COLUMNAS_CONSUMO_BANCO.map((c) => c.toLowerCase())).size, 297);
    assert.deepEqual([COLUMNAS_CONSUMO_BANCO[0], COLUMNAS_CONSUMO_BANCO[2], COLUMNAS_CONSUMO_BANCO[6], COLUMNAS_CONSUMO_BANCO[296]], ['cNum', 'cCodCtaCre', 'cNomCliente', 'nSalConyu5']);
  });

  test('cada equivalente con el nombre del core apunta a una columna que existe', () => {
    const existentes = new Set(COLUMNAS_CONSUMO_BANCO.map((c) => c.toLowerCase()));
    for (const [core, nuevos] of Object.entries(ALIAS_CONSUMO_BANCO)) {
      for (const nuevo of nuevos) assert.ok(existentes.has(nuevo), `${core} → ${nuevo} no es una columna de Consumo`);
    }
  });

  test('se reconoce por sus encabezados, igual que la base anterior de Consumo; una tabla cualquiera no', () => {
    assert.equal(esFormatoCore(COLUMNAS_CONSUMO_BANCO), true);
    assert.equal(esFormatoCore(COLUMNAS_CONSUMO), true, 'los nombres anteriores de Consumo se siguen leyendo');
    assert.equal(esFormatoCore(['codigo_expediente', 'nombres_cliente']), false);
    assert.equal(esFormatoCore(COLUMNAS_CONSUMO_BANCO.filter((c) => c !== 'cDocIde')), false, 'sin el documento no es la base');
  });
});

describe('Consumo del banco — las filas de ejemplo', () => {
  test('se importan sin errores ni avisos, con todo leído y nada sobrante', () => {
    for (let i = 0; i < 12; i += 1) {
      const fila = construirFilaConsumoBanco(i, HOY);
      assert.deepEqual(COLUMNAS_CONSUMO_BANCO.filter((c) => fila[c] === undefined), [], `fila ${i} con columnas sin valor`);
      const r = mapear(fila);
      assert.equal(r.error, undefined, `fila ${i}: ${r.error}`);
      assert.deepEqual(r.advertencias, [], `fila ${i} con avisos: ${r.advertencias.join(',')}`);
      assert.deepEqual(COLUMNAS_CONSUMO_BANCO.filter((c) => !r.columnasUsadas.has(c.toLowerCase())), [], `fila ${i}: columnas que el mapeo no lee`);
      assert.deepEqual(r.expediente.datos_credito.campos_adicionales, {}, `fila ${i}: sobran campos`);
      const e = r.expediente;
      assert.equal(e.tipo_credito, 'CONSUMO');
      assert.ok(e.latitud && e.longitud, 'coordenadas desde la referencia');
      assert.ok(e.datos_negocio.negocios.length >= 1, 'el empleador llega a los datos del negocio');
      assert.ok(['NUEVO', 'RECURRENTE', 'VIG. CON ATRASO'].includes(e.datos_cliente.fuente), e.datos_cliente.fuente);
      assert.ok(e.evaluacion_financiera.ingresos_consumo.every((x) => x.descripcion && x.monto > 0 && x.fuente_ingreso), 'cada ingreso trae su fuente');
    }
  });

  test('son deterministas y la plantilla las escribe en el orden de las columnas', () => {
    assert.deepEqual(construirFilaConsumoBanco(3, HOY), construirFilaConsumoBanco(3, HOY));
    const fila = construirFilaConsumoBanco(0, HOY);
    assert.deepEqual(filaConsumoBancoComoArreglo(fila), COLUMNAS_CONSUMO_BANCO.map((c) => fila[c]));
  });
});

describe('Consumo del banco — cada dato llega a su lugar', () => {
  // Una fila con valores inventados que se pueden reconocer uno por uno.
  const fila = {
    ...construirFilaConsumoBanco(1, HOY),
    cCodCtaCre: '9990001', cCodSolCre: '8880001', cCodExpCli: '7770001', cNomCliente: 'PEREZ GOMEZ, ANA LUCIA', cDocIde: '12345678', cTipClient: 'RECURRENTE', cFuente: 'VIG. CON ATRASO',
    cDesCorMon: 'US$', nCapDes: '5000', cDesCorta: 'VENCIDO', cConDomCli: 'ALQUILADA', cNomProvCli: 'PROVINCIA PRUEBA', cDisDom: 'DISTRITO PRUEBA', cDirDomCli: 'JR. PRUEBA 123',
    cTelPerCli: '987654321', cNomAseAct: 'ASESOR/ACTUAL,UNO', cNomAseOri: 'ASESOR/ORIGEN,DOS', cOficin: 'AG. OTRA', nNumCuoApr: '24', cDesCreTip: 'CONSUMO NO REV', cDestin: 'CONSUMO-COMPRA DE DEUDA', cDesProdu: 'NO REVOLVENTES',
    cNomEmp1: 'EMPLEADOR UNO SAC', cDirEmp1: 'AV. TRABAJO 456', cDisNeg1: 'DISTRITO TRABAJO', cTelEmp1: '012345678', cDesActivi: 'ACTIVIDAD PRUEBA',
    cNomConyug: 'LOPEZ RIOS, JUAN', cFiadores: 'AVAL PRUEBA, UNO', cRepresent: 'REP PRUEBA', cCuoDiaMasAtr: '012 - 73 día(s)', dFecVenci: '15-02-2031', nMonCuota: '1283.57',
    dFecUltPag: '01-08-2026', cCarPerApr: 'ADMINISTRADOR', NomAprobador: 'APROBADOR/PRUEBA,UNO', nSalCapSol: '4700.50', SustIngres: 'BOLETAS DE PAGO',
    cCalSbs: 'CPP', nNroEnt: '3', cDesCorEst: 'VIGENTE', cCodLinCre: '6660001', cCodCliente: '5550001', cAspExpAct: '3 AÑOS', cEdad: '54', cDesEstCiv: 'CASADO',
    cDesConsum1: 'BOLETAS DE PAGO', cRelaci1: 'CONYUGE TITULAR', cMoneda12: 'SOLES', cTipIng1: 'FIJOS', cFueIng1: 'FIJOS', nMonIngDeu1: '3100.00',
    cNomIfi1: 'ENTIDAD UNO', cCalEmpDes1: 'NORMAL', cDesTipCre1: 'CONSUMO', nSaldo1: '1500.25',
    cNomIfiConyu1: 'ENTIDAD CONYUGE', cCalEmpConyu1: 'CPP', cTipCreConyu1: 'MICROEMPRESAS', nSalConyu1: '900.10',
    nNumEva1: '4440001', dFecEva1: '01-02-2026', dFecDesCre: '23-02-2026',
  };
  const { expediente: e, advertencias } = mapear(fila);

  test('cliente, documento, asesor, monto y moneda', () => {
    assert.equal(e.codigo_expediente, '9990001');
    assert.equal(e.nombres_cliente, 'PEREZ GOMEZ, ANA LUCIA');
    assert.deepEqual([e.tipo_documento_cliente, e.numero_documento_cliente], ['DNI', '12345678']);
    assert.equal(e.asesor_responsable, 'ASESOR/ACTUAL,UNO');
    assert.deepEqual([e.monto_desembolso, e.moneda], [5000, 'USD']);
    assert.deepEqual([e.oficina, e.provincia, e.distrito, e.direccion_domicilio, e.telefono_cliente], ['AG. OTRA', 'PROVINCIA PRUEBA', 'DISTRITO PRUEBA', 'JR. PRUEBA 123', '987654321']);
  });

  test('datos del cliente: fuente tal como viene, tipo, expediente del core, vivienda y estado civil', () => {
    const c = e.datos_cliente;
    assert.deepEqual([c.fuente, c.tipo_cliente, c.codigo_expediente_core, c.codigo_cliente], ['VIG. CON ATRASO', 'RECURRENTE', '7770001', '5550001']);
    assert.deepEqual([c.tipo_vivienda, c.estado_civil, c.edad], ['ALQUILADA', 'CASADO', 54]);
  });

  test('empleador: nombre, dirección, distrito y teléfono van a la lista de negocios; la actividad y el sustento de ingreso, a los datos laborales', () => {
    // El negocio trae además su dirección descompuesta (direccion_normalizada, componentes): aquí se comparan los datos que vienen del banco.
    const { direccion_normalizada: _dn, componentes: _comp, ...negocioUno } = e.datos_negocio.negocios[0];
    assert.deepEqual(negocioUno, { direccion: 'AV. TRABAJO 456', distrito: 'DISTRITO TRABAJO', departamento: null, referencia: e.datos_negocio.negocios[0].referencia, contacto: 'EMPLEADOR UNO SAC', telefono: '012345678', latitud: e.datos_negocio.negocios[0].latitud, longitud: e.datos_negocio.negocios[0].longitud, ubicacion_origen: e.datos_negocio.negocios[0].ubicacion_origen });
    assert.deepEqual([e.datos_negocio.actividad, e.datos_negocio.sustento_ingreso, e.datos_negocio.antiguedad_meses], ['ACTIVIDAD PRUEBA', 'BOLETAS DE PAGO', 36]);
  });

  test('crédito y participantes', () => {
    const cr = e.datos_credito;
    assert.deepEqual([cr.solicitud, cr.linea_credito, cr.producto, cr.tipo_credito_desc, cr.destino], ['8880001', '6660001', 'NO REVOLVENTES', 'CONSUMO NO REV', 'CONSUMO-COMPRA DE DEUDA']);
    assert.deepEqual([cr.condicion_contable, cr.estado, cr.plazo_cuotas, cr.monto_cuota, cr.fecha_vencimiento, cr.fecha_ultimo_pago], ['VENCIDO', 'VIGENTE', 24, 1283.57, '2031-02-15', '2026-08-01']);
    assert.deepEqual([cr.cuota_mas_atrasada, cr.dias_atraso, cr.saldo_capital_soles, cr.calificacion_sbs, cr.numero_entidades], ['012 - 73 día(s)', 73, 4700.5, 'CPP', 3]);
    assert.deepEqual([cr.asesor_solicitud, cr.asesor_actual, cr.conyuge, cr.aval, cr.rep_legal], ['ASESOR/ORIGEN,DOS', 'ASESOR/ACTUAL,UNO', 'LOPEZ RIOS, JUAN', 'AVAL PRUEBA, UNO', 'REP PRUEBA']);
    assert.deepEqual(cr.nivel_aprobador, { nombre: 'APROBADOR/PRUEBA,UNO', cargo: 'ADMINISTRADOR', usuario: null });
  });

  test('ingresos y endeudamiento del cliente y del cónyuge', () => {
    assert.deepEqual(e.evaluacion_financiera.ingresos_consumo[0], { descripcion: 'BOLETAS DE PAGO', relacion: 'CONYUGE TITULAR', moneda: 'SOLES', monto: 3100, tipo_ingreso: 'FIJOS', fuente_ingreso: 'FIJOS' });
    assert.deepEqual(e.endeudamiento.entidades[0], { entidad: 'ENTIDAD UNO', saldo: 1500.25, calificacion: 'NORMAL', tipo_credito: 'CONSUMO' });
    assert.deepEqual(e.endeudamiento.entidades_conyuge[0], { entidad: 'ENTIDAD CONYUGE', saldo: 900.1, calificacion: 'CPP', tipo_credito: 'MICROEMPRESAS' });
    assert.equal(e.evaluacion_financiera.anterior.fecha, '2026-02-01');
    assert.equal(e.evaluacion_financiera.anterior.numero_evaluacion, '4440001');
  });

  test('esta fila es coherente: ningún aviso de datos de otro cliente', () => {
    assert.ok(!advertencias.includes('EVALUACION_POSTERIOR_AL_DESEMBOLSO'));
  });
});

describe('Consumo del banco — historial de créditos', () => {
  test('el crédito vigente va primero y después los anteriores (hasta 4), cada uno con sus 13 datos', () => {
    const conAnteriores = mapear(construirFilaConsumoBanco(0, HOY)).expediente;
    const historial = conAnteriores.datos_credito.historial;
    assert.equal(historial.length, 3, 'el vigente y 2 anteriores');
    assert.equal(historial[0].numero_credito, conAnteriores.codigo_expediente);
    for (const anterior of historial.slice(1)) {
      assert.ok(anterior.fecha_desembolso < historial[0].fecha_desembolso, 'los anteriores son más antiguos que el vigente');
      assert.deepEqual(Object.keys(anterior), Object.keys(historial[0]), 'mismas claves que el vigente');
      assert.ok(anterior.numero_credito && anterior.solicitud && anterior.linea && anterior.monto > 0 && anterior.plazo_cuotas > 0 && anterior.condicion && anterior.asesor);
      assert.equal(anterior.moneda, 'PEN');
    }
    assert.equal(mapear(construirFilaConsumoBanco(1, HOY)).expediente.datos_credito.historial.length, 1, 'sin créditos anteriores');
    assert.equal(mapear(construirFilaConsumoBanco(2, HOY)).expediente.datos_credito.historial.length, 2);
  });

  test('con los cuatro lugares llenos salen 5 créditos; los lugares vacíos (NULL, «-» o en blanco) no cuentan', () => {
    const base = construirFilaConsumoBanco(0, HOY);
    const todos = { ...base };
    for (let k = 3; k <= 4; k += 1) {
      for (const col of ['cLinCre', 'cTipCredit', 'dFecDesemb', 'nMonDesemb', 'cMoneda', 'cSolCre', 'cCodCtaCre', 'nNumCuoApr', 'nMontCuota', 'cCondContab', 'nSalCap', 'cNomAsesor', 'cCuoMasAtr']) todos[`${col}${k}`] = base[`${col}${2}`];
    }
    assert.equal(mapear(todos).expediente.datos_credito.historial.length, 5);
    const vacios = { ...base };
    for (const col of COLUMNAS_CONSUMO_BANCO.filter((c) => /[1-4]$/.test(c) && /^(cLinCre|cTipCredit|dFecDesemb|nMonDesemb|cMoneda|cSolCre|cCodCtaCre|nNumCuoApr|nMontCuota|cCondContab|nSalCap|cNomAsesor|cCuoMasAtr)\d$/.test(c))) vacios[col] = '-';
    assert.equal(mapear(vacios).expediente.datos_credito.historial.length, 1);
  });
});

describe('Consumo del banco — avisos de calidad del dato', () => {
  test('una evaluación posterior al desembolso avisa que los datos pueden ser de otro cliente; la del mismo día no', () => {
    const base = construirFilaConsumoBanco(0, HOY);
    assert.ok(mapear({ ...base, dFecEva1: '01-01-2099' }).advertencias.includes('EVALUACION_POSTERIOR_AL_DESEMBOLSO'));
    assert.ok(!mapear({ ...base, dFecEva1: base.dFecDesCre }).advertencias.includes('EVALUACION_POSTERIOR_AL_DESEMBOLSO'));
    assert.ok(!mapear({ ...base, dFecEva1: '-' }).advertencias.includes('EVALUACION_POSTERIOR_AL_DESEMBOLSO'), 'sin fecha no hay qué comparar');
    // En la base MYPE una reevaluación posterior al desembolso es normal: no avisa.
    const mype = construirFilaCore(0, HOY);
    assert.ok(!mapearFilaCore({ ...mype, fechaeva2: '01-01-2099' }, { hoja: 'OTROS' }).advertencias.includes('EVALUACION_POSTERIOR_AL_DESEMBOLSO'));
  });

  test('los días de atraso salen del texto de la cuota más atrasada, también con la tilde dañada', () => {
    const base = construirFilaConsumoBanco(0, HOY);
    assert.equal(mapear({ ...base, cCuoDiaMasAtr: '006 - 55 día(s)' }).expediente.datos_credito.dias_atraso, 55);
    assert.equal(mapear({ ...base, cCuoDiaMasAtr: '004 - 1 d�a(s)' }).expediente.datos_credito.dias_atraso, 1);
    assert.equal(mapear({ ...base, cCuoDiaMasAtr: '-.-' }).expediente.datos_credito.dias_atraso, null);
  });

  test('la fuente se guarda tal como viene en la base, sin agregarle nada', () => {
    const base = construirFilaConsumoBanco(0, HOY);
    assert.equal(mapear({ ...base, cFuente: 'NUEVO' }).expediente.datos_cliente.fuente, 'NUEVO');
    assert.equal(mapear({ ...base, cFuente: 'OTRO CODIGO/NUEVO' }).expediente.datos_cliente.fuente, 'OTRO CODIGO/NUEVO');
  });
});

describe('Consumo del banco — lo anterior no cambia', () => {
  test('una fila con los nombres anteriores de Consumo da lo mismo que antes: sin prefijo, sin fuente de ingreso y con un solo crédito en el historial', () => {
    const r = mapear(construirFilaConsumo(0, { hoy: '2026-10-18' }));
    assert.equal(r.error, undefined);
    assert.deepEqual(r.advertencias, []);
    assert.equal(r.expediente.datos_cliente.fuente, 'BASE CORE CONSUMO');
    assert.equal(r.expediente.datos_credito.historial.length, 1);
    assert.ok(r.expediente.evaluacion_financiera.ingresos_consumo.every((x) => !('fuente_ingreso' in x)));
  });

  test('la base MYPE sigue igual: un solo crédito y los días de atraso salen de su columna', () => {
    const fila = construirFilaCore(5, { hoy: '2026-10-18' });
    const r = mapearFilaCore(fila, { hoja: 'OTROS' });
    assert.equal(r.error, undefined);
    assert.equal(r.expediente.datos_credito.historial.length, 1);
    assert.ok(Number(fila.diasatraso) > 0, 'la fila de prueba tiene atraso');
    assert.equal(r.expediente.datos_credito.dias_atraso, Number(fila.diasatraso));
    assert.ok(!r.advertencias.includes('EVALUACION_POSTERIOR_AL_DESEMBOLSO'));
  });
});

describe('Consumo del banco — coordenadas en la referencia', () => {
  test('con signo separadas por un espacio y la orientación al final (como las escribe el banco)', () => {
    const r = extraerCoordenadas('Ref: -12.119400 -77.029500°NW FRENTE AL PARQUE');
    assert.deepEqual([r.latitud, r.longitud], [-12.1194, -77.0295]);
    assert.equal(sinCoordenadas('Ref: -12.119400 -77.029500°NW FRENTE AL PARQUE'), 'Ref: FRENTE AL PARQUE');
  });

  test('dos números cualquiera o sin signo no se toman por coordenadas', () => {
    assert.equal(extraerCoordenadas('Ref: 2.500 3.500 FRENTE AL COLEGIO'), null);
    assert.equal(extraerCoordenadas('Ref: 12.119400 77.029500'), null);
    assert.equal(extraerCoordenadas('Ref: -2.500 -3.500 CERCA DEL MERCADO'), null, 'fuera del Perú');
  });
});

describe('Consumo del banco — la ficha de Word', () => {
  async function textoDe(documento) {
    const zip = await JSZip.loadAsync(await Packer.toBuffer(documento));
    return (await zip.file('word/document.xml').async('string')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  }
  const visita = {
    id_visita: 7, fecha_hora_checkin: '2026-10-27T15:00:00.000Z', server_received_at: '2026-10-27T15:00:05.000Z', resultado: 'CONFORME',
    auditor: { nombres: 'Ana', apellidos: 'Prueba', username: 'ana.prueba' }, mock_location: false, device_integrity_ok: true, firmante_documento: '12345678',
    respuestas_cuestionario: {}, estado_negocio: 'EN_FUNCIONAMIENTO', plantilla: 'CONSUMO_V1',
  };

  const generar = (e, extra = {}) => textoDe(renderizarFicha({ visita, e, plantilla: 'CONSUMO_V1', empresa: { nombre_corto: 'Caja Prueba' }, huella: 'abc', generadaEl: new Date('2026-10-28T20:00:00-05:00'), ...extra }));

  test('imprime el N.º de expediente y la fuente con el usuario que hizo la ficha (como el banco: usuario/fuente), todos los créditos del historial y el saldo del crédito', async () => {
    const e = mapear(construirFilaConsumoBanco(0, HOY)).expediente;
    assert.equal(e.datos_cliente.fuente, 'NUEVO', 'en los datos la fuente queda como llegó');
    const texto = await generar(e);
    assert.match(texto, new RegExp(`N\\.º de expediente: ${e.datos_cliente.codigo_expediente_core} Fuente: ANA.PRUEBA/NUEVO`));
    for (const credito of e.datos_credito.historial) assert.ok(texto.includes(credito.numero_credito), `falta el crédito ${credito.numero_credito} en el historial`);
    assert.match(texto, /Saldo capital: \d/, 'el saldo sale aunque la base solo traiga el saldo en soles');
  });

  test('si la base ya trae «usuario/fuente» se respeta; sin fuente sale solo el usuario; sin usuario sale solo la fuente', async () => {
    const e = mapear(construirFilaConsumoBanco(0, HOY)).expediente;
    const texto = await generar({ ...e, datos_cliente: { ...e.datos_cliente, fuente: 'MPAUCC/RECURRENTE' } });
    assert.match(texto, /Fuente: MPAUCC\/RECURRENTE/);
    assert.ok(!texto.includes('ANA.PRUEBA/MPAUCC'), 'no se antepone otro usuario al que ya trae la base');
    assert.match(await generar({ ...e, datos_cliente: { ...e.datos_cliente, fuente: null } }), /Fuente: ANA\.PRUEBA(?!\/)/);
    assert.match(await generar(e, { visita: { ...visita, auditor: null } }), /Fuente: NUEVO/);
  });

  test('«Saldo de capital al» lleva el día en que se genera la ficha (hora de Lima) cuando la base no trae fecha de corte, y la de la base cuando sí', async () => {
    const e = mapear(construirFilaConsumoBanco(0, HOY)).expediente;
    assert.equal(e.endeudamiento.fecha_corte, null, 'la base de Consumo no trae fecha de corte');
    assert.match(await generar(e), /SALDO DE CAPITAL AL 28-10-2026/);
    // 22:00 del 28 en Lima ya es el 29 en UTC: el día que cuenta es el de Lima.
    assert.match(await generar(e, { generadaEl: new Date('2026-10-29T03:00:00Z') }), /SALDO DE CAPITAL AL 28-10-2026/);
    assert.match(await generar(e, { generadaEl: new Date('2026-11-02T14:00:00Z') }), /SALDO DE CAPITAL AL 02-11-2026/);
    assert.match(await generar({ ...e, endeudamiento: { ...e.endeudamiento, fecha_corte: '2026-10-01' } }), /SALDO DE CAPITAL AL 01-10-2026/);
  });
});
