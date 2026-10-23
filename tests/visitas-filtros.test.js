import test from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNAS_CSV, RESULTADOS, TIPOS_FICHA, conteosPorResultado, construirDonde, fechaYHora, filaVisitaCsv, listaDe, rangoDeFechas } from '../src/modules/auditorias/visitas.filtros.js';
import { visitasExportarQuery, visitasListQuery } from '../src/validation/schemas.js';

test('una lista separada por comas se lee sin repetidos y solo con valores permitidos', () => {
  assert.deepEqual(listaDe('CONFORME,OBSERVADO', RESULTADOS), ['CONFORME', 'OBSERVADO']);
  assert.deepEqual(listaDe(' CONFORME , CONFORME ', RESULTADOS), ['CONFORME']);
  assert.equal(listaDe('CONFORME,INVENTADO', RESULTADOS), null);
  assert.equal(listaDe('', RESULTADOS), null);
  assert.equal(listaDe(undefined, RESULTADOS), null);
});

test('los días «desde» y «hasta» son los del usuario: se corren por su desfase y «hasta» incluye todo ese día', () => {
  // Perú: 300 min detrás de UTC. El día 2026-10-20 de Lima empieza a las 05:00 UTC y termina a las 05:00 UTC del 21.
  const r = rangoDeFechas({ desde: '2026-10-20', hasta: '2026-10-20', desfase: 300 });
  assert.equal(r.gte.toISOString(), '2026-10-20T05:00:00.000Z');
  assert.equal(r.lt.toISOString(), '2026-10-21T05:00:00.000Z');
  assert.equal(rangoDeFechas({ desde: '2026-10-20' }).lt, undefined);
  assert.equal(rangoDeFechas({ hasta: '2026-10-20' }).gte, undefined);
  assert.equal(rangoDeFechas({}), null);
  assert.equal(rangoDeFechas({ desde: '2026-10-20' }).gte.toISOString(), '2026-10-20T00:00:00.000Z'); // sin desfase: día UTC
});

test('los grupos de filtros se suman y dentro de un grupo se elige uno o varios', () => {
  assert.deepEqual(construirDonde({}), {});
  assert.deepEqual(construirDonde({ resultado: ['CONFORME'] }), { AND: [{ resultado: 'CONFORME' }] });
  assert.deepEqual(construirDonde({ resultado: ['CONFORME', 'OBSERVADO'] }), { AND: [{ resultado: { in: ['CONFORME', 'OBSERVADO'] } }] });
  // las dos fichas marcadas equivalen a no filtrar por ficha
  assert.deepEqual(construirDonde({ tipo_credito: [...TIPOS_FICHA] }), {});
  assert.deepEqual(construirDonde({ tipo_credito: ['OTROS'] }), { AND: [{ expediente: { AND: [{ tipo_credito: 'OTROS' }] } }] });
  const todo = construirDonde({ id_usuario_auditor: 'u1', resultado: ['RECHAZADO'], tipo_credito: ['CONSUMO'], q: 'perez', con_alertas: 'true', desde: '2026-10-01', hasta: '2026-10-31', desfase: 300 });
  assert.equal(todo.AND.length, 5); // auditor, resultado, expediente (ficha y búsqueda juntas), alertas, fechas
  const exp = todo.AND.find((c) => c.expediente).expediente.AND;
  assert.equal(exp.length, 2); assert.deepEqual(exp[0], { tipo_credito: 'CONSUMO' }); assert.equal(exp[1].OR.length, 3);
});

test('para contar cuántas hay de cada resultado se deja fuera el filtro de resultado y se respetan los demás', () => {
  const f = { resultado: ['CONFORME'], tipo_credito: ['OTROS'] };
  assert.deepEqual(construirDonde(f, { sinResultado: true }), { AND: [{ expediente: { AND: [{ tipo_credito: 'OTROS' }] } }] });
});

test('los conteos por resultado salen con ceros y con el total', () => {
  assert.deepEqual(conteosPorResultado([{ resultado: 'CONFORME', _count: { _all: 13 } }, { resultado: 'RECHAZADO', _count: { _all: 5n } }, { resultado: 'RARO', _count: { _all: 9 } }]),
    { CONFORME: 13, OBSERVADO: 0, NO_UBICADO: 0, RECHAZADO: 5, total: 18 });
  assert.deepEqual(conteosPorResultado(), { CONFORME: 0, OBSERVADO: 0, NO_UBICADO: 0, RECHAZADO: 0, total: 0 });
});

test('la fecha y la hora del archivo son las del usuario', () => {
  assert.deepEqual(fechaYHora('2026-09-19T01:35:00Z', 300), ['2026-09-18', '20:35']); // 18 set. 08:35 p. m. en Lima
  assert.deepEqual(fechaYHora('2026-09-19T01:35:00Z'), ['2026-09-19', '01:35']);
});

test('una fila del CSV trae lo de la pantalla en palabras, escapa lo peligroso y cuadra con las columnas', () => {
  const v = {
    fecha_hora_checkin: '2026-09-19T01:35:00Z', resultado: 'OBSERVADO', distancia_domicilio_m: '620.4', mock_location: false, device_integrity_ok: true, ubicacion_visitada: 'DOMICILIO',
    comentario_auditor: 'Dijo "ya no vive aquí", pero\nsigue en la zona', evidencias: [{ id_evidencia: 'a' }, { id_evidencia: 'b' }],
    expediente: { codigo_expediente: 'CH-LIM-214', nombres_cliente: '=HYPERLINK("x")', numero_documento_cliente: '41234567', tipo_credito: 'OTROS', oficina: 'Ag. Arenales', asesor_responsable: 'Pedro' },
    auditor: { nombres: 'Milagros', apellidos: 'Cuba', username: 'mcuba' },
  };
  const fila = filaVisitaCsv(v, { desfase: 300, radioM: 100 });
  assert.ok(fila.endsWith('\r\n'));
  assert.ok(fila.startsWith('2026-09-18,20:35,CH-LIM-214,'));
  assert.ok(fila.includes("'=HYPERLINK"), 'una celda que empieza con = se neutraliza');
  assert.ok(fila.includes('MYPE') && fila.includes('Milagros Cuba') && fila.includes('Observado') && fila.includes(',620,Domicilio,Sí,Sí,2,No,'));
  assert.ok(fila.includes('"Dijo ""ya no vive aquí"", pero\nsigue en la zona"'), 'las comillas y los saltos de línea se entrecomillan');
  const sinDato = filaVisitaCsv({ ...v, distancia_domicilio_m: null, mock_location: true, device_integrity_ok: false, evidencias: [] });
  assert.ok(sinDato.includes(',,Domicilio,No (GPS simulado),No,0,Sin dato,'));
  assert.equal(COLUMNAS_CSV.length, 17);
});

test('el esquema acepta uno o varios resultados y fichas, fechas y búsqueda; rechaza lo demás', () => {
  const ok = visitasListQuery.safeParse({ page: '2', limit: '10', resultado: 'CONFORME,OBSERVADO', tipo_credito: 'OTROS', desde: '2026-10-01', hasta: '2026-10-31', desfase: '300', q: 'qui', con_alertas: 'true' });
  assert.equal(ok.success, true);
  assert.deepEqual(ok.data.resultado, ['CONFORME', 'OBSERVADO']); assert.deepEqual(ok.data.tipo_credito, ['OTROS']); assert.equal(ok.data.desfase, 300);
  assert.equal(visitasListQuery.safeParse({ resultado: 'CONFORME' }).success, true); // una sola: como las pantallas anteriores
  for (const mala of [{ resultado: 'CONFORME,INVENTADO' }, { resultado: '' }, { tipo_credito: 'OTRO' }, { desde: '01-10-2026' }, { desde: '2026-02-31' }, { hasta: 'ayer' }, { desfase: '9999' }, { q: 'a' }, { empresa_id: 'x' }]) {
    assert.equal(visitasListQuery.safeParse(mala).success, false, JSON.stringify(mala));
  }
  assert.equal(visitasExportarQuery.safeParse({ resultado: 'RECHAZADO', desde: '2026-10-01', desfase: '300' }).success, true);
  assert.equal(visitasExportarQuery.safeParse({ page: '2' }).success, false); // exportar no se pagina
});
