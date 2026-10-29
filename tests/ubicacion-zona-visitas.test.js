import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { evaluarSenales, zonaDe } from '../src/modules/auditorias/visitas.service.js';
import { REGLAS_POR_DEFECTO } from '../src/modules/empresas/empresas.service.js';
import { cuestionarioSchema } from '../src/validation/schemas.js';
import { generarPlantilla, COLUMNAS_SIMPLE } from '../src/modules/expedientes/plantillas.service.js';
import { renderizarFicha } from '../src/modules/reportes/ficha-word.js';
import { COLUMNAS_CORE } from '../src/modules/expedientes/importador/columnas-core.js';
import { COLUMNAS_CONSUMO_BANCO } from '../src/modules/expedientes/importador/columnas-consumo.js';

// Primera visita sin referencia: control contra la zona conocida. Plantilla de Excel con ayudas. Ficha Word de Consumo con «NO APLICA» y sin microseguros.

const reglas = { ...REGLAS_POR_DEFECTO(), geocerca_radio_m: 100, zona_radio_m: 500 };
const ahora = new Date('2026-10-29T15:00:00Z');
// Un grado de latitud ≈ 111 km: 0.001° ≈ 111 m; 0.01° ≈ 1.1 km.
const payloadEn = (lat, lng) => ({ latitud: lat, longitud: lng, precision_metros: 10, fecha_hora_checkin: ahora.toISOString() });

describe('primera visita — control de zona', () => {
  const sinReferencia = { destino: 'DOMICILIO', indice: 0, latitud: null, longitud: null };

  test('la regla nueva existe por defecto (1 km) y la empresa puede cambiarla', () => {
    assert.equal(REGLAS_POR_DEFECTO().zona_radio_m, 1000);
  });

  test('sin referencia ni zona conocida, la visita pasa sin alertas (como siempre)', () => {
    const r = evaluarSenales({ punto: sinReferencia, zona: null, payload: payloadEn(-12.06, -75.2), serverNow: ahora, reglas });
    assert.deepEqual(r.alertas, []);
    assert.equal(r.distancia, null);
  });

  test('con zona conocida, una visita dentro del radio de zona pasa y una lejana recibe FUERA_DE_ZONA', () => {
    const zona = { latitud: -12.06, longitud: -75.2 };
    assert.deepEqual(evaluarSenales({ punto: sinReferencia, zona, payload: payloadEn(-12.062, -75.2), serverNow: ahora, reglas }).alertas, [], '~220 m: dentro de los 500 m de zona');
    assert.deepEqual(evaluarSenales({ punto: sinReferencia, zona, payload: payloadEn(-12.08, -75.2), serverNow: ahora, reglas }).alertas, ['FUERA_DE_ZONA'], '~2.2 km: fuera');
    assert.equal(evaluarSenales({ punto: sinReferencia, zona, payload: payloadEn(-12.08, -75.2), serverNow: ahora, reglas }).distancia, null, 'la zona no es una referencia: no se guarda como distancia al domicilio');
  });

  test('con referencia, manda la geocerca de 100 m y la zona no interviene', () => {
    const punto = { ...sinReferencia, latitud: -12.06, longitud: -75.2 };
    const r = evaluarSenales({ punto, zona: { latitud: -12.5, longitud: -75.9 }, payload: payloadEn(-12.0605, -75.2), serverNow: ahora, reglas });
    assert.deepEqual(r.alertas, []);
    assert.ok(r.distancia > 40 && r.distancia < 70);
    assert.deepEqual(evaluarSenales({ punto, zona: null, payload: payloadEn(-12.062, -75.2), serverNow: ahora, reglas }).alertas, ['GEOCERCA_EXCEDIDA']);
  });

  test('zonaDe toma la sugerencia del domicilio o la del negocio visitado, y nada si ya hay referencia', () => {
    const e = { geo_latitud: '-12.0600000', geo_longitud: '-75.2000000', datos_negocio: { negocios: [{ direccion: 'X', geo: { latitud: -12.1, longitud: -75.3 } }, { direccion: 'Y' }] } };
    assert.deepEqual(zonaDe(e, { destino: 'DOMICILIO', indice: 0, latitud: null }), { latitud: -12.06, longitud: -75.2 });
    assert.deepEqual(zonaDe(e, { destino: 'NEGOCIO', indice: 0, latitud: null }), { latitud: -12.1, longitud: -75.3 });
    assert.equal(zonaDe(e, { destino: 'NEGOCIO', indice: 1, latitud: null }), null);
    assert.equal(zonaDe(e, { destino: 'DOMICILIO', indice: 0, latitud: -12.06 }), null);
    assert.equal(zonaDe({ geo_latitud: null }, { destino: 'DOMICILIO', indice: 0, latitud: null }), null);
  });

  test('el cuestionario acepta «No aplica» para el cónyuge (Consumo)', () => {
    assert.ok(cuestionarioSchema.safeParse({ conyuge_no_aplica: true, entrego_dinero_asesor: false }).success);
    assert.equal(cuestionarioSchema.safeParse({ conyuge_no_aplica: 'si' }).success, false);
  });
});

describe('plantilla de Excel — ayudas para quien carga', () => {
  async function libroDe(formato, opciones) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await generarPlantilla(formato, { ejemplos: 1, ...opciones }));
    return wb;
  }
  const nota = (ws, columnas, nombre) => ws.getCell(1, columnas.indexOf(nombre) + 1).note;
  const textoNota = (n) => (typeof n === 'string' ? n : (n?.texts || []).map((t) => t.text).join(''));
  const amarillo = (ws, columnas, nombre) => ws.getCell(1, columnas.indexOf(nombre) + 1).fill?.fgColor?.argb === 'FFFFE699';

  test('MYPE (OTROS): obligatorias en amarillo, Nro explicado, fechas con formato y la ubicación por zona en las instrucciones', async () => {
    const wb = await libroDe('CORE_262', { tipo: 'OTROS' });
    const ws = wb.getWorksheet('OTROS');
    for (const c of ['ccodctacre', 'cnomcliente', 'DocIde', 'nombreAsesorActual']) assert.ok(amarillo(ws, COLUMNAS_CORE, c), `${c} debe ir en amarillo`);
    assert.equal(amarillo(ws, COLUMNAS_CORE, 'Nro'), false);
    assert.match(textoNota(nota(ws, COLUMNAS_CORE, 'Nro')), /lo ignora/);
    assert.match(textoNota(nota(ws, COLUMNAS_CORE, 'ccodctacre')), /OBLIGATORIA.*llave/);
    assert.equal(ws.getColumn(COLUMNAS_CORE.indexOf('dfecdescre') + 1).numFmt, 'dd-mm-yyyy');
    assert.equal(ws.getColumn(COLUMNAS_CORE.indexOf('cnomcliente') + 1).numFmt, undefined);
    const instrucciones = wb.getWorksheet('Instrucciones').getColumn(1).values.filter(Boolean).join('\n');
    assert.match(instrucciones, /La columna Nro es el correlativo del archivo: GeoMatrix la ignora/);
    assert.match(instrucciones, /ubica la zona .*misma manzana/);
  });

  test('Consumo: cNum y cTipFic explicados, obligatorias del banco en amarillo, fechas con formato', async () => {
    const wb = await libroDe('CORE_262', { tipo: 'CONSUMO' });
    const ws = wb.getWorksheet('CONSUMO');
    for (const c of ['cCodCtaCre', 'cNomCliente', 'cDocIde', 'cNomAseAct']) assert.ok(amarillo(ws, COLUMNAS_CONSUMO_BANCO, c), `${c} debe ir en amarillo`);
    assert.match(textoNota(nota(ws, COLUMNAS_CONSUMO_BANCO, 'cNum')), /lo ignora/);
    assert.match(textoNota(nota(ws, COLUMNAS_CONSUMO_BANCO, 'cRefDomCli')), /coordenadas/);
    assert.equal(ws.getColumn(COLUMNAS_CONSUMO_BANCO.indexOf('dFecNacCli') + 1).numFmt, 'dd-mm-yyyy');
    const instrucciones = wb.getWorksheet('Instrucciones').getColumn(1).values.filter(Boolean).join('\n');
    assert.match(instrucciones, /cNum y cTipFic .* GeoMatrix las ignora/);
  });

  test('SIMPLE: listas desplegables en tipo de crédito, tipo de documento y moneda', async () => {
    const wb = await libroDe('SIMPLE', {});
    const ws = wb.getWorksheet('Expedientes');
    const letra = (nombre) => String.fromCharCode(65 + COLUMNAS_SIMPLE.indexOf(nombre));
    const validaciones = ws.dataValidations.model;
    const de = (nombre) => Object.entries(validaciones).find(([rango]) => rango.startsWith(`${letra(nombre)}2`))?.[1];
    assert.equal(de('tipo_credito')?.type, 'list');
    assert.match(de('tipo_credito').formulae[0], /CONSUMO,MYPE/);
    assert.match(de('tipo_documento_cliente').formulae[0], /DNI,CE,PASAPORTE,RUC/);
    assert.match(de('moneda').formulae[0], /PEN,USD/);
    assert.equal(de('nombres_cliente'), undefined, 'texto libre: sin lista');
    for (const c of COLUMNAS_SIMPLE.slice(0, 5)) assert.ok(amarillo(ws, COLUMNAS_SIMPLE, c), `${c} debe ir en amarillo`);
  });
});

describe('ficha Word — cuestionario según la ficha del banco', () => {
  async function textoDe(documento) {
    const zip = await JSZip.loadAsync(await Packer.toBuffer(documento));
    return (await zip.file('word/document.xml').async('string')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  }
  const visita = {
    id_visita: 7, fecha_hora_checkin: '2026-10-29T15:00:00.000Z', server_received_at: '2026-10-29T15:00:05.000Z', resultado: 'CONFORME',
    auditor: { nombres: 'Ana', apellidos: 'Prueba', username: 'ana' }, mock_location: false, device_integrity_ok: true, firmante_documento: '12345678',
    respuestas_cuestionario: { conyuge_no_aplica: true, entrego_dinero_asesor: false, tiene_microseguro: true }, estado_negocio: 'EN_FUNCIONAMIENTO',
  };
  const e = { codigo_expediente: 'C-1', tipo_credito: 'CONSUMO', nombres_cliente: 'CLIENTE DE PRUEBA', numero_documento_cliente: '12345678', datos_cliente: {}, datos_negocio: { negocios: [] }, datos_credito: { historial: [] }, evaluacion_financiera: { ingresos: [] }, endeudamiento: { entidades: [] } };

  test('Consumo: el cónyuge lleva «NO APLICA» marcable y no se imprime el bloque de microseguros', async () => {
    const texto = await textoDe(renderizarFicha({ visita: { ...visita, plantilla: 'CONSUMO_V1' }, e, plantilla: 'CONSUMO_V1', huella: 'abc' }));
    assert.match(texto, /¿Cónyuge tiene conocimiento del préstamo\?: SI \( \) NO \( \) NO APLICA \(X\)/);
    assert.doesNotMatch(texto, /MICROSEGUROS/);
    assert.match(texto, /¿Titular administra el negocio\?/);
  });

  test('MYPE: sigue como siempre, con microseguros y sin la opción «NO APLICA»', async () => {
    const texto = await textoDe(renderizarFicha({ visita: { ...visita, plantilla: 'MYPE_V1', propiedad_local: 'PROPIO' }, e: { ...e, tipo_credito: 'OTROS' }, plantilla: 'MYPE_V1', huella: 'abc' }));
    assert.match(texto, /MICROSEGUROS/);
    assert.match(texto, /¿Ud\. tiene microseguro\?: SI \(X\) NO \( \)/);
    assert.doesNotMatch(texto, /NO APLICA/);
  });
});
