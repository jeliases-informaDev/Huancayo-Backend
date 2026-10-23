import test from 'node:test';
import assert from 'node:assert/strict';
import { haversineMeters } from '../src/core/security/geofence.js';
import { CASOS, PREFIJO_CODIGO, PREFIJO_SINCRONIZACION, datosDeExpediente, datosDeVisita, distribucion, domicilioDe, fechaDeVisita, puntoDeVisita, respuestasDeCuestionario } from '../src/modules/limpieza/demo.core.js';
import { fotoDemo } from '../src/modules/limpieza/demo.fotos.js';

test('el conjunto de ejemplo son 24 visitas: 13 conformes, 4 observadas, 2 no ubicadas y 5 rechazadas', () => {
  const d = distribucion();
  assert.equal(d.total, 24);
  assert.deepEqual(d.porResultado, { CONFORME: 13, OBSERVADO: 4, NO_UBICADO: 2, RECHAZADO: 5 });
  assert.ok(d.porFicha.CONSUMO > 0 && d.porFicha.OTROS > 0, 'debe haber de las dos fichas');
});

test('las diez primeras son las del diseño de Figma (cliente, código, ficha y resultado)', () => {
  const esperado = [
    ['Harold Quiroz Benites', 214, 'CONSUMO', 'OBSERVADO'], ['Gladys Aranda Colonia', 213, 'OTROS', 'CONFORME'], ['Marco Antonio Villar Renzo', 212, 'CONSUMO', 'CONFORME'],
    ['Cinthia Rocio Vega Fuentes', 211, 'CONSUMO', 'CONFORME'], ['Andrea Rios Bazan', 209, 'CONSUMO', 'OBSERVADO'], ['Fabian Guerra Leon', 208, 'CONSUMO', 'RECHAZADO'],
    ['Diana Carolina Diaz Villanueva', 207, 'OTROS', 'NO_UBICADO'], ['Jose Luis Salas Quinto', 206, 'CONSUMO', 'CONFORME'], ['Ruben Del Pino Nunja', 204, 'OTROS', 'RECHAZADO'],
    ['Doris Ychpas Poma', 203, 'CONSUMO', 'CONFORME'],
  ];
  esperado.forEach(([cliente, n, ficha, resultado], i) => assert.deepEqual([CASOS[i].cliente, CASOS[i].n, CASOS[i].ficha, CASOS[i].resultado], [cliente, n, ficha, resultado]));
  assert.equal(CASOS[9].metros, 13); assert.equal(CASOS[9].fotos, 0); // «13 m» y «3/4»: la última no trae fotos
});

test('códigos y documentos son únicos y llevan la marca de demostración', () => {
  const datos = CASOS.map(datosDeExpediente);
  assert.equal(new Set(datos.map((d) => d.codigo_expediente)).size, 24);
  assert.equal(new Set(datos.map((d) => d.numero_documento_cliente)).size, 24);
  assert.ok(datos.every((d) => d.codigo_expediente.startsWith(PREFIJO_CODIGO) && /^\d{8}$/.test(d.numero_documento_cliente) && /^9\d{8}$/.test(d.telefono_cliente)));
  assert.ok(datos.every((d) => d.latitud < -11.9 && d.latitud > -12.2 && d.longitud < -76.9 && d.longitud > -77.2), 'todos en Lima');
  const visitas = CASOS.map((c) => datosDeVisita(c, Date.now(), domicilioDe(c)));
  assert.ok(visitas.every((v) => v.client_sync_id.startsWith(PREFIJO_SINCRONIZACION)));
  assert.equal(new Set(visitas.map((v) => v.client_sync_id)).size, 24);
});

test('lo que el sistema real no deja pasar no aparece como conforme: dentro de la geocerca, GPS real y dispositivo íntegro', () => {
  for (const c of CASOS.filter((x) => x.resultado === 'CONFORME')) {
    assert.ok(c.metros <= 100, `${c.cliente}: conforme a ${c.metros} m`);
    assert.ok(c.precision <= 100, `${c.cliente}: conforme con precisión ${c.precision}`);
    assert.ok(!c.gpsSimulado && c.dispositivoIntegro !== false, `${c.cliente}: conforme con alertas`);
  }
  for (const c of CASOS.filter((x) => x.resultado === 'NO_UBICADO')) assert.ok(c.metros > 500, 'un no ubicado está lejos del domicilio');
  // las que no son conformes y tienen una señal en rojo explican por qué en el comentario del auditor
  for (const c of CASOS.filter((x) => x.resultado !== 'CONFORME')) assert.ok(c.comentario && c.comentario.length >= 10, `${c.cliente}: falta el comentario`);
});

test('el punto de la visita queda exactamente a los metros dichos del domicilio', () => {
  for (const c of CASOS) {
    const d = domicilioDe(c); const p = puntoDeVisita(d.latitud, d.longitud, c.metros);
    assert.ok(Math.abs(haversineMeters(d.latitud, d.longitud, p.latitud, p.longitud) - c.metros) < 1.5, `${c.cliente}: ${c.metros} m`);
  }
});

test('la fecha de la visita sigue el reloj de Lima y nunca cae en el futuro', () => {
  const ahora = Date.parse('2026-10-23T22:00:00Z'); // 17:00 en Lima
  assert.equal(fechaDeVisita(ahora, [5, 20, 35]).toISOString(), '2026-10-19T01:35:00.000Z'); // hace 5 días 8:35 p. m. de Lima
  assert.equal(fechaDeVisita(ahora, [0, 9, 45]).toISOString(), '2026-10-23T14:45:00.000Z'); // hoy 9:45 a. m.
  assert.equal(fechaDeVisita(ahora, [0, 23, 0]).getTime(), ahora - 10 * 60_000); // hoy a una hora que aún no llega: se deja 10 min antes de ahora
});

test('la ficha de cada visita sale completa y coherente con su ficha y su resultado', () => {
  for (const c of CASOS) {
    const e = datosDeExpediente(c); const v = datosDeVisita(c, Date.now(), e);
    assert.equal(v.plantilla, c.ficha === 'OTROS' ? 'MYPE_V1' : 'CONSUMO_V1');
    assert.equal(v.estado, 'CERRADA'); assert.equal(v.mock_location, Boolean(c.gpsSimulado)); assert.equal(v.device_integrity_ok, c.dispositivoIntegro !== false);
    assert.equal(v.distancia_domicilio_m, c.metros);
    assert.ok(v.fecha_hora_checkout > v.fecha_hora_checkin);
    for (const bloque of ['datos_cliente', 'datos_negocio', 'datos_credito', 'evaluacion_financiera', 'endeudamiento']) assert.ok(e[bloque] && typeof e[bloque] === 'object', `${c.cliente}: falta ${bloque}`);
    const r = respuestasDeCuestionario(c.n, c.resultado);
    assert.ok(['entrego_dinero_asesor', 'pago_comision_adicional', 'recibio_monto_total'].every((k) => typeof r[k] === 'boolean'), 'las 3 preguntas obligatorias van como sí/no');
    if (['NO_UBICADO', 'RECHAZADO'].includes(c.resultado)) assert.equal(r.entrego_dinero_asesor || r.pago_comision_adicional || r.recibio_monto_total, false); // no llegó al cliente: nada que declarar
  }
});

test('cada foto de ejemplo es un JPEG válido y distinto de las demás (el sistema no admite la misma foto en dos visitas)', () => {
  const fotos = Array.from({ length: 40 }, (_, i) => fotoDemo(i, 'prueba'));
  assert.ok(fotos.every((f) => f[0] === 0xff && f[1] === 0xd8 && f[2] === 0xff && f.at(-2) === 0xff && f.at(-1) === 0xd9 && f.length < 8000));
  assert.equal(new Set(fotos.map((f) => f.toString('base64'))).size, 40);
  assert.notDeepEqual(fotoDemo(1, 'empresa-a'), fotoDemo(1, 'empresa-b')); // empresas distintas: huellas distintas
});
