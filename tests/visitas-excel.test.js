import test from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNAS, COLOR_GRUPO, PREGUNTAS, alertasDeVisita, filaVisitaXlsx, descripcionDeFiltros, idx } from '../src/modules/auditorias/visitas.excel.js';

// Una visita con todo en orden: sirve de base y cada prueba le cambia lo que quiere probar.
const visita = (cambios = {}) => ({
  fecha_hora_checkin: '2026-10-24T21:20:00.000Z', resultado: 'CONFORME', latitud: '-12.058630', longitud: '-77.013800', precision_metros: '18.4', distancia_domicilio_m: '25.3',
  ubicacion_visitada: 'DOMICILIO', direccion_visitada: 'Jr. Cusco 421', mock_location: false, device_integrity_ok: true, estado_negocio: 'EN_FUNCIONAMIENTO', propiedad_local: 'ALQUILADO',
  respuestas_cuestionario: { donde_realiza_pagos: 'Agente autorizado', conyuge_conoce_prestamo: true, entrego_dinero_asesor: false, creditos_paralelos: false, pago_comision_adicional: false, recibio_monto_total: true },
  comentario_auditor: 'Todo bien', comentario_negocio: null, evidencias: [{ id_evidencia: 1 }, { id_evidencia: 2 }],
  expediente: { codigo_expediente: 'CR-1', nombres_cliente: 'RAMOS PAZ, ANA', numero_documento_cliente: '45678912', tipo_credito: 'OTROS', oficina: 'AG. COMAS', asesor_responsable: 'RIVAS, LORENA', distrito: 'COMAS', direccion_domicilio: 'Av. San Martin 840', latitud: '-12.0586', longitud: '-77.0137', ubicacion_origen: 'GEOCODIFICADA' },
  auditor: { username: 'abel', nombres: 'Abel', apellidos: 'Chavez' },
  ...cambios,
});
const respuestas = (cambios) => ({ ...visita().respuestas_cuestionario, ...cambios });

test('la fila trae un valor por cada columna, con la fecha como fecha real y la hora del usuario', () => {
  const { valores } = filaVisitaXlsx(visita(), { desfase: 300, radioM: 100 });
  assert.equal(valores.length, COLUMNAS.length);
  assert.ok(valores[idx('Fecha')] instanceof Date);
  assert.equal(valores[idx('Fecha')].toISOString().slice(0, 10), '2026-10-24');
  assert.equal(valores[idx('Hora')], '16:20', '21:20 UTC con 300 minutos de desfase (Perú) son las 16:20');
  assert.equal(valores[idx('Resultado')], 'Conforme');
  assert.equal(valores[idx('Tipo de ficha')], 'MYPE');
  assert.equal(valores[idx('Auditor')], 'Abel Chavez');
  assert.equal(valores[idx('Latitud de la visita')], -12.05863);
  assert.equal(valores[idx('Precisión del GPS (m)')], 18);
  assert.equal(valores[idx('Distancia al punto (m)')], 25);
  assert.equal(valores[idx('Dentro de la geocerca')], 'Sí');
  assert.equal(valores[idx('De dónde salió el punto')], 'Ubicada por el mapa');
  assert.equal(valores[idx('Fotografías')], 2);
  assert.equal(valores[idx('Estado del negocio')], 'En funcionamiento');
});

test('las respuestas del cuestionario salen como Sí / No y lo no preguntado queda vacío', () => {
  const { valores } = filaVisitaXlsx(visita());
  const respuesta = (clave) => valores[idx(PREGUNTAS.find((p) => p.clave === clave).titulo)];
  assert.equal(respuesta('conyuge_conoce_prestamo'), 'Sí');
  assert.equal(respuesta('entrego_dinero_asesor'), 'No');
  assert.equal(respuesta('tiene_microseguro'), '', 'no se preguntó');
  assert.equal(valores[idx('¿Dónde realiza sus pagos?')], 'Agente autorizado');
});

test('una visita sin problemas no trae alertas; cada problema se dice en palabras', () => {
  assert.deepEqual(alertasDeVisita(visita()), []);
  assert.deepEqual(alertasDeVisita(visita({ mock_location: true })), ['GPS simulado']);
  assert.deepEqual(alertasDeVisita(visita({ device_integrity_ok: false })), ['Dispositivo no íntegro']);
  assert.deepEqual(alertasDeVisita(visita({ distancia_domicilio_m: '620.4' })), ['Fuera de la geocerca (620 m)']);
  assert.deepEqual(alertasDeVisita(visita({ distancia_domicilio_m: '100' })), [], 'justo en el borde de 100 m todavía está dentro');
  assert.deepEqual(alertasDeVisita(visita({ distancia_domicilio_m: '150' }), { radioM: 200 }), [], 'usa la geocerca de la empresa');
  assert.deepEqual(alertasDeVisita(visita({ evidencias: [] })), ['Sin fotografías']);
  assert.deepEqual(alertasDeVisita(visita({ respuestas_cuestionario: respuestas({ entrego_dinero_asesor: true }) })), ['Entregó dinero al asesor']);
  assert.deepEqual(alertasDeVisita(visita({ respuestas_cuestionario: respuestas({ pago_comision_adicional: true }) })), ['Pagó una comisión adicional']);
  assert.deepEqual(alertasDeVisita(visita({ respuestas_cuestionario: respuestas({ recibio_monto_total: false }) })), ['No recibió el monto completo']);
  assert.deepEqual(alertasDeVisita(visita({ respuestas_cuestionario: respuestas({ recibio_monto_total: undefined }) })), [], 'sin respuesta no es alerta');
});

test('las celdas malas y buenas se marcan donde corresponde y la columna Alertas junta todo', () => {
  const ok = filaVisitaXlsx(visita());
  assert.equal(ok.malas.size, 0);
  for (const t of ['Dentro de la geocerca', 'GPS real', 'Dispositivo íntegro']) assert.ok(ok.buenas.has(idx(t)), t);
  const mal = filaVisitaXlsx(visita({ mock_location: true, device_integrity_ok: false, distancia_domicilio_m: '900', evidencias: [], respuestas_cuestionario: { entrego_dinero_asesor: true } }));
  for (const t of ['Dentro de la geocerca', 'GPS real', 'Dispositivo íntegro', 'Fotografías', 'Alertas', PREGUNTAS[1].titulo]) assert.ok(mal.malas.has(idx(t)), `${t} debía ir en rojo`);
  assert.equal(mal.valores[idx('GPS real')], 'No (simulado)');
  assert.match(mal.valores[idx('Alertas')], /GPS simulado · Dispositivo no íntegro · Fuera de la geocerca \(900 m\)/);
});

test('sin distancia no se inventa nada y las coordenadas ausentes quedan vacías', () => {
  const { valores } = filaVisitaXlsx(visita({ distancia_domicilio_m: null, precision_metros: null, expediente: { ...visita().expediente, latitud: null, longitud: null, ubicacion_origen: null } }));
  assert.equal(valores[idx('Dentro de la geocerca')], 'Sin dato');
  assert.equal(valores[idx('Distancia al punto (m)')], null);
  assert.equal(valores[idx('Latitud del cliente')], null);
  assert.equal(valores[idx('De dónde salió el punto')], '');
});

test('los filtros del reporte se dicen en palabras', () => {
  assert.deepEqual(descripcionDeFiltros({}), [['Sin filtros', 'Ninguno: se incluyen todas las visitas']]);
  const texto = Object.fromEntries(descripcionDeFiltros({ desde: '2026-10-01', hasta: '2026-10-24', resultado: ['RECHAZADO', 'OBSERVADO'], tipo_credito: ['OTROS'], id_usuario_auditor: 'u1', con_alertas: 'true', q: 'ramos' }, { nombreAuditor: 'Abel Chavez' }));
  assert.equal(texto.Periodo, 'Del 2026-10-01 al 2026-10-24');
  assert.equal(texto.Resultado, 'Rechazado, Observado');
  assert.equal(texto['Tipo de ficha'], 'MYPE');
  assert.equal(texto.Auditor, 'Abel Chavez');
  assert.equal(texto['Solo visitas'], 'con alertas');
  assert.equal(texto['Búsqueda'], 'ramos');
});

test('no hay dos columnas con el mismo título y cada grupo tiene color', () => {
  assert.equal(new Set(COLUMNAS.map((c) => c.t)).size, COLUMNAS.length);
  for (const c of COLUMNAS) assert.ok(COLOR_GRUPO[c.g], `grupo sin color: ${c.g}`);
});
