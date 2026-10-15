import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { antiguedadEnMeses, esVacio, fecha, numero, texto, tieneTextoDanado } from '../src/modules/expedientes/importador/limpieza.js';
import { extraerCoordenadas, sinCoordenadas } from '../src/modules/expedientes/importador/coordenadas.js';
import { esFormatoCore, mapearFilaCore } from '../src/modules/expedientes/importador/formato-core.js';

describe('importador — limpieza de valores', () => {
  test('NULL, -.- y vacíos se tratan como sin dato', () => {
    for (const v of ['NULL', 'null', '-.-', '', '   ', null, undefined]) assert.equal(esVacio(v), true, String(v));
    assert.equal(texto('NULL'), null);
    assert.equal(numero('NULL'), null);
  });

  test('texto recorta rellenos y colapsa espacios', () => {
    assert.equal(texto('  VENCIDO      '), 'VENCIDO');
    assert.equal(texto('ASOC.  VIV.   MZ. D'), 'ASOC. VIV. MZ. D');
  });

  test('numero convierte cadenas y descarta basura', () => {
    assert.equal(numero('28103.51'), 28103.51);
    assert.equal(numero('1,5'), 1.5);
    assert.equal(numero('abc'), null);
  });

  test('fecha convierte dd-mm-aaaa a ISO y rechaza fechas imposibles', () => {
    assert.equal(fecha('30-12-2025'), '2025-12-30');
    assert.equal(fecha('2025-01-05'), '2025-01-05');
    assert.equal(fecha('31-02-2025'), null);
    assert.equal(fecha('NULL'), null);
  });

  test('antiguedadEnMeses entiende meses, años y número suelto', () => {
    assert.equal(antiguedadEnMeses('120'), 120);
    assert.equal(antiguedadEnMeses('48 MESES'), 48);
    assert.equal(antiguedadEnMeses('3 AÑOS'), 36);
    assert.equal(antiguedadEnMeses('varios'), null);
  });

  test('tieneTextoDanado detecta el carácter de reemplazo', () => {
    assert.equal(tieneTextoDanado('MU�OZ'), true);
    assert.equal(tieneTextoDanado('MUÑOZ'), false);
  });
});

describe('importador — coordenadas escritas en la referencia', () => {
  test('decimal con signo', () => {
    const r = extraerCoordenadas('Ref: -12.119400,-77.029500 FRENTE AL PARQUE');
    assert.deepEqual([r.latitud, r.longitud], [-12.1194, -77.0295]);
  });

  test('decimal con hemisferio', () => {
    const r = extraerCoordenadas('Ref: 12.12034510S 77.03120045W LINEA 9');
    assert.ok(Math.abs(r.latitud + 12.1203451) < 1e-9);
    assert.ok(Math.abs(r.longitud + 77.03120045) < 1e-9);
  });

  test('grados, minutos y segundos', () => {
    const r = extraerCoordenadas(`Ref: 12°07'12.5"S 77°01'48.2"W`);
    assert.ok(Math.abs(r.latitud - -12.12014) < 1e-4);
    assert.ok(Math.abs(r.longitud - -77.03006) < 1e-4);
  });

  test('pareja invertida (lng, lat) se corrige', () => {
    const r = extraerCoordenadas('Ref: -77.029500,-12.119400 casa azul');
    assert.deepEqual([r.latitud, r.longitud], [-12.1194, -77.0295]);
  });

  test('números que no son coordenadas del Perú se descartan', () => {
    assert.equal(extraerCoordenadas('Ref: 40.416775,-3.703790 Madrid'), null);
    assert.equal(extraerCoordenadas('Ref: ALT. DEL COLEGIO MI DULCE JESUS'), null);
    assert.equal(extraerCoordenadas(null), null);
  });

  test('sinCoordenadas deja solo la referencia legible', () => {
    assert.equal(sinCoordenadas('Ref: -12.119400,-77.029500 FRENTE AL PARQUE'), 'Ref: FRENTE AL PARQUE');
  });
});

function filaBase(extra = {}) {
  return {
    ccodctacre: '107163105551995432', cnomcliente: 'PRUEBA UNO, CLIENTE        ', DocIde: '90000137            ',
    nombreAsesorActual: 'ASESOR/PRUEBA,ASESOR 1', cDesCortaTipCre: 'PEQ.EMP    ', Moneda: 'S/', desembolsado: '28103.51',
    Oficina: 'AG. MIRAFLORES', DisDOM: 'MIRAFLORES', depDom: 'LIMA', ProvDom: 'LIMA',
    cRefDomCli: 'Ref: -12.119400,-77.029500 FRENTE AL PARQUE', cAspExpAct: '48 MESES',
    numeva1: '7000001', fechaeva1: '29-12-2025', numeva2: '7100001', fechaeva2: '30-12-2025',
    ACTCTE1: '30600.00', activonocorriente: '54744.00', TOTALACTIVO: '85344.00',
    ACTCTE2: '31000.00', activonocorriente2: '55000.00', TOTALACTIVO2: '86000.00',
    nMonVentas1: '15000.00', nMonVentas2: '16000.00', ntotporepg1: '90.00',
    descripcion1: 'CONFECCION', Frecuencia1: '1.00', nTotVenFin1: '15000.00', descripcion2: 'NULL', Frecuencia2: '0.00',
    cnomifi1: 'CAJA HUANCAYO', nsaldo1: '26994.85', ccalempdes1: 'NORMAL', cdestipcre1: 'PEQ.EMP',
    cnomifiConyu1: 'NULL', nsaldoConyu1: '0.00',
    ...extra,
  };
}

describe('importador — formato core (MYPE, 262 columnas)', () => {
  test('detecta el formato por sus columnas firma', () => {
    assert.equal(esFormatoCore(['Nro', 'ccodctacre', 'cnomcliente', 'DocIde']), true);
    assert.equal(esFormatoCore(['codigo_expediente', 'nombres_cliente']), false);
  });

  test('mapea columnas del expediente y deduce tipo y documento', () => {
    const { expediente, error } = mapearFilaCore(filaBase(), { hoja: 'OTROS' });
    assert.equal(error, undefined);
    assert.equal(expediente.codigo_expediente, '107163105551995432');
    assert.equal(expediente.tipo_credito, 'OTROS');
    assert.equal(expediente.tipo_documento_cliente, 'DNI');
    assert.equal(expediente.nombres_cliente, 'PRUEBA UNO, CLIENTE');
    assert.equal(expediente.moneda, 'PEN');
    assert.equal(expediente.monto_desembolso, 28103.51);
    assert.equal(expediente.latitud, -12.1194);
    assert.equal(expediente.ubicacion_origen, 'REFERENCIA');
    assert.equal(expediente.datos_cliente.referencia_domicilio, 'Ref: FRENTE AL PARQUE');
    assert.equal(expediente.datos_negocio.antiguedad_meses, 48);
  });

  test('sufijo 2 es la reevaluación y sufijo 1 la anterior; el activo corriente sale de ACTCTE', () => {
    const { expediente } = mapearFilaCore(filaBase(), { hoja: 'OTROS' });
    const ev = expediente.evaluacion_financiera;
    assert.equal(ev.reevaluacion.fecha, '2025-12-30');
    assert.equal(ev.anterior.fecha, '2025-12-29');
    assert.equal(ev.anterior.balance.activo_corriente, 30600);
    assert.equal(ev.anterior.balance.activo_no_corriente, 54744);
    assert.equal(ev.anterior.balance.activo_corriente + ev.anterior.balance.activo_no_corriente, ev.anterior.balance.total_activo);
    assert.equal(ev.reevaluacion.resultados.ventas_netas, 16000);
  });

  test('sin reevaluación el periodo 2 queda vacío', () => {
    const { expediente } = mapearFilaCore(filaBase({ numeva2: '0', fechaeva2: 'NULL' }), { hoja: 'OTROS' });
    assert.equal(expediente.evaluacion_financiera.reevaluacion, null);
    assert.ok(expediente.evaluacion_financiera.anterior);
  });

  test('solo se guardan las líneas de ingreso y las entidades con contenido', () => {
    const { expediente } = mapearFilaCore(filaBase(), { hoja: 'OTROS' });
    assert.equal(expediente.evaluacion_financiera.ingresos.length, 1);
    assert.equal(expediente.endeudamiento.entidades.length, 1);
    assert.equal(expediente.endeudamiento.entidades_conyuge.length, 0);
  });

  test('avisa de calidad: sin coordenadas, distrito igual a la agencia, texto dañado', () => {
    const { advertencias } = mapearFilaCore(filaBase({ cRefDomCli: 'Ref: CERCA DEL COLEGIO', cnomcliente: 'MU�OZ, JUAN' }), { hoja: 'OTROS' });
    assert.ok(advertencias.includes('SIN_COORDENADAS'));
    assert.ok(advertencias.includes('DISTRITO_IGUAL_A_AGENCIA'));
    assert.ok(advertencias.includes('TEXTO_DANADO'));
  });

  test('rechaza filas sin datos obligatorios o sin tipo de crédito deducible', () => {
    assert.match(mapearFilaCore(filaBase({ ccodctacre: 'NULL' }), { hoja: 'OTROS' }).error, /Faltan datos obligatorios/);
    assert.match(mapearFilaCore(filaBase({ cDesCortaTipCre: 'NULL' }), { hoja: 'Hoja1' }).error, /tipo de crédito/);
  });

  test('la huella cambia cuando cambia un dato y se mantiene si no', () => {
    const a = mapearFilaCore(filaBase(), { hoja: 'OTROS' }).huella;
    const b = mapearFilaCore(filaBase(), { hoja: 'OTROS' }).huella;
    const c = mapearFilaCore(filaBase({ desembolsado: '30000.00' }), { hoja: 'OTROS' }).huella;
    assert.equal(a, b);
    assert.notEqual(a, c);
  });
});
