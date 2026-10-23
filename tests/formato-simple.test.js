import test from 'node:test';
import assert from 'node:assert/strict';
import { validarFilaSimple } from '../src/modules/expedientes/importador/formato-simple.js';
import { resultadoDeCarga } from '../src/modules/expedientes/importador/importador.service.js';

const buena = (extra = {}) => ({
  codigo_expediente: 'CR-2026-000101', tipo_credito: 'Consumo', numero_documento_cliente: '45678912', nombres_cliente: 'QUISPE HUAMAN, MARIA ELENA',
  asesor_responsable: 'RIVAS/LAUREANO,LORENA MEDALI', distrito: 'COMAS', direccion_domicilio: 'AV. SAN MARTIN 840', ...extra,
});
const problemas = (fila) => validarFilaSimple(fila).errores.map((e) => `${e.campo}: ${e.problema}`);

test('una fila completa pasa y queda lista para guardar, con la dirección ya descompuesta', () => {
  const r = validarFilaSimple(buena());
  assert.deepEqual(r.errores, []);
  assert.equal(r.codigo, 'CR-2026-000101');
  assert.equal(r.data.tipo_credito, 'CONSUMO');
  assert.equal(r.data.tipo_documento_cliente, 'DNI');
  assert.equal(r.data.moneda, 'PEN');
  assert.ok(r.data.direccion_normalizada, 'la dirección se normaliza para el mapa');
  assert.equal(r.data.geo_estado, 'PENDIENTE', 'sin coordenadas la dirección entra a la cola del mapa');
});

test('cada dato obligatorio vacío es un problema con su campo y qué corregir (como en «Qué debes corregir»)', () => {
  const r = validarFilaSimple(buena({ codigo_expediente: '', nombres_cliente: 'NULL', numero_documento_cliente: null, asesor_responsable: '   ' }));
  assert.deepEqual(r.errores.map((e) => [e.campo, e.problema]), [['Crédito', 'Crédito vacío'], ['Cliente', 'Nombre del cliente vacío'], ['Documento', 'Documento vacío'], ['Asesor', 'Asesor vacío']]);
  assert.ok(r.errores.every((e) => /^Completa /.test(e.corregir)), 'todos dicen qué completar');
  assert.equal(r.data, null, 'una fila con errores no entrega datos para guardar');
  assert.equal(r.codigo, null);
});

test('el tipo de crédito acepta Consumo y MYPE (MYPE se guarda como OTROS) y rechaza lo demás diciendo qué valor llegó', () => {
  assert.equal(validarFilaSimple(buena({ tipo_credito: 'mype' })).data.tipo_credito, 'OTROS');
  assert.equal(validarFilaSimple(buena({ tipo_credito: 'OTROS' })).data.tipo_credito, 'OTROS');
  assert.equal(validarFilaSimple(buena({ tipo_credito: ' consumo ' })).data.tipo_credito, 'CONSUMO');
  const r = validarFilaSimple(buena({ tipo_credito: 'Personal' }));
  assert.deepEqual(r.errores, [{ campo: 'Tipo', problema: 'Valor «Personal» no admitido', corregir: 'Selecciona Consumo o MYPE.' }]);
  assert.deepEqual(problemas(buena({ tipo_credito: '' })), ['Tipo: Tipo vacío']);
});

test('el tipo de documento se deduce del largo si no viene, y si viene debe ser uno conocido', () => {
  assert.equal(validarFilaSimple(buena({ numero_documento_cliente: '20123456789' })).data.tipo_documento_cliente, 'RUC');
  assert.equal(validarFilaSimple(buena({ numero_documento_cliente: '123456789' })).data.tipo_documento_cliente, 'CE');
  assert.equal(validarFilaSimple(buena({ tipo_documento_cliente: 'pasaporte', numero_documento_cliente: 'X123456' })).data.tipo_documento_cliente, 'PASAPORTE');
  assert.deepEqual(problemas(buena({ tipo_documento_cliente: 'LIBRETA' })), ['Tipo de documento: Valor «LIBRETA» no admitido']);
});

test('las coordenadas van las dos juntas, en grados decimales y dentro de rango', () => {
  const ok = validarFilaSimple(buena({ latitud: -11.9332, longitud: '-77.0541' }));
  assert.deepEqual([ok.data.latitud, ok.data.longitud, ok.data.ubicacion_origen, ok.data.geo_estado], [-11.9332, -77.0541, 'REFERENCIA', null]);
  assert.deepEqual(problemas(buena({ latitud: -11.9332 })), ['Ubicación: Falta la longitud']);
  assert.deepEqual(problemas(buena({ longitud: -77.05 })), ['Ubicación: Falta la latitud']);
  assert.deepEqual(problemas(buena({ latitud: 'abc', longitud: -77.05 })), ['Ubicación: Latitud no válida']);
  assert.deepEqual(problemas(buena({ latitud: 123, longitud: -77.05 })), ['Ubicación: Latitud fuera de rango']);
  assert.deepEqual(problemas(buena({ latitud: -11.9, longitud: 400 })), ['Ubicación: Longitud fuera de rango']);
});

test('monto y moneda: números con punto, sin negativos, y PEN o USD (también soles / dólares)', () => {
  assert.equal(validarFilaSimple(buena({ monto_desembolso: '12500.50' })).data.monto_desembolso, 12500.5);
  assert.equal(validarFilaSimple(buena({ moneda: 'soles' })).data.moneda, 'PEN');
  assert.equal(validarFilaSimple(buena({ moneda: 'US$' })).data.moneda, 'USD');
  assert.deepEqual(problemas(buena({ monto_desembolso: 'mucho' })), ['Monto: Monto no válido']);
  assert.deepEqual(problemas(buena({ monto_desembolso: -5 })), ['Monto: Monto negativo']);
  assert.deepEqual(problemas(buena({ moneda: 'EUR' })), ['Moneda: Valor «EUR» no admitido']);
});

test('lo que no cabe en la base se avisa antes de guardar, con el largo máximo', () => {
  const r = validarFilaSimple(buena({ codigo_expediente: 'C'.repeat(51), telefono_cliente: '9'.repeat(21), direccion_domicilio: 'D'.repeat(256) }));
  assert.deepEqual(r.errores.map((e) => e.campo), ['Crédito', 'Teléfono', 'Dirección']);
  assert.ok(r.errores.every((e) => /hasta \d+ caracteres/.test(e.corregir)));
});

test('un número en la celda del crédito o del documento (Excel los guarda así) se lee como texto', () => {
  const r = validarFilaSimple(buena({ codigo_expediente: 10256321894521, numero_documento_cliente: 45678912 }));
  assert.deepEqual(r.errores, []);
  assert.equal(r.data.codigo_expediente, '10256321894521');
  assert.equal(r.data.numero_documento_cliente, '45678912');
});

test('distrito vacío no bloquea: es un aviso de calidad de la dirección', () => {
  const r = validarFilaSimple(buena({ distrito: '' }));
  assert.deepEqual(r.errores, []);
  assert.ok(r.advertencias.includes('DIRECCION_SIN_DISTRITO'), 'avisos: ' + r.advertencias.join(','));
});

test('el resultado de una carga se lee igual en el historial: importada, con errores, validada, error o en proceso', () => {
  const r = (extra) => resultadoDeCarga({ simulacion: false, estado: 'COMPLETADO', errores: 0, insertadas: 0, actualizadas: 0, ...extra });
  assert.equal(r({ insertadas: 80 }), 'IMPORTADA');
  assert.equal(r({ estado: 'BLOQUEADA', errores: 4 }), 'CON_ERRORES');
  assert.equal(r({ errores: 4, insertadas: 0, actualizadas: 0 }), 'CON_ERRORES');
  assert.equal(r({ errores: 3, insertadas: 50 }), 'IMPORTADA', 'una carga antigua que guardó lo válido sigue contando como importada');
  assert.equal(r({ simulacion: true }), 'VALIDADA');
  assert.equal(r({ simulacion: true, errores: 2 }), 'CON_ERRORES');
  assert.equal(r({ estado: 'ERROR' }), 'ERROR');
  assert.equal(r({ estado: 'PROCESANDO' }), 'EN_PROCESO');
  assert.equal(r({ estado: 'INTERRUMPIDA' }), 'INTERRUMPIDA');
});
