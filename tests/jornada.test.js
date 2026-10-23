import test from 'node:test';
import assert from 'node:assert/strict';
import { HORAS_MAXIMAS_DE_REINICIO, cierreAlReiniciar, codificarCursorJornada, decodificarCursorJornada, duracionMin, textoZona, zonaDeJornada } from '../src/modules/auditorias/jornada.core.js';
import { clasificar } from '../src/modules/sistema/seguridad.catalogo.js';
import { jornadaBody, jornadasQuery } from '../src/validation/schemas.js';

test('la zona se dice de lo más cercano a lo más amplio y sin repetir nombres seguidos', () => {
  assert.equal(textoZona({ distrito: 'Chilca', provincia: 'Huancayo', departamento: 'Junín' }), 'Chilca, Huancayo, Junín');
  assert.equal(textoZona({ distrito: 'Huancayo', provincia: 'Huancayo', departamento: 'Junín' }), 'Huancayo, Junín'); // distrito y provincia se llaman igual
  assert.equal(textoZona({ distrito: 'HUANCAYO', provincia: 'huancayo', departamento: 'Junín' }), 'HUANCAYO, Junín');
  assert.equal(textoZona({ departamento: 'Lima' }), 'Lima');
  assert.equal(textoZona({ distrito: '  ', provincia: null }), '');
  assert.equal(textoZona(), '');
});

test('sin posición no hay zona y no se toca la del usuario', () => {
  const z = zonaDeJornada({});
  assert.equal(z.tienePosicion, false); assert.equal(z.actualizaZona, false); assert.equal(z.latitud, null); assert.equal(z.texto, '');
  // los nombres sin posición se ignoran (no se confía en una zona que no se puede ubicar)
  assert.equal(zonaDeJornada({ distrito: 'Chilca', departamento: 'Junín' }).distrito, null);
});

test('con posición real la zona de trabajo se reemplaza; con GPS simulado, no', () => {
  const real = zonaDeJornada({ latitud: -12.07, longitud: -75.21, precision: 12.5, distrito: ' Chilca ', provincia: 'Huancayo', departamento: 'Junín' });
  assert.equal(real.tienePosicion, true); assert.equal(real.actualizaZona, true); assert.equal(real.distrito, 'Chilca'); assert.equal(real.texto, 'Chilca, Huancayo, Junín'); assert.equal(real.precision_metros, 12.5); assert.equal(real.simulada, false);
  const falsa = zonaDeJornada({ latitud: -12.07, longitud: -75.21, simulada: true, distrito: 'Miraflores', departamento: 'Lima' });
  assert.equal(falsa.simulada, true); assert.equal(falsa.actualizaZona, false); assert.equal(falsa.latitud, -12.07); // queda anotada en la jornada, pero no manda en la zona
});

test('con posición pero sin nombres, la zona del usuario se vacía en vez de dejar la de ayer', () => {
  const z = zonaDeJornada({ latitud: -12.07, longitud: -75.21 });
  assert.equal(z.actualizaZona, true); assert.equal(z.distrito, null); assert.equal(z.texto, '');
});

test('los nombres de zona se limpian: espacios de más y largo máximo', () => {
  const z = zonaDeJornada({ latitud: 1, longitud: 1, distrito: '  El   Tambo  ', provincia: 'x'.repeat(300) });
  assert.equal(z.distrito, 'El Tambo'); assert.equal(z.provincia.length, 100);
});

test('al iniciar otra jornada la anterior se reinicia si es del mismo día; si es vieja queda sin cierre', () => {
  const ahora = new Date('2026-10-23T15:00:00Z');
  const hace = (h) => new Date(ahora.getTime() - h * 3_600_000);
  const reciente = cierreAlReiniciar({ inicio: hace(3), ahora });
  assert.equal(reciente.cierre, 'REINICIADA'); assert.equal(reciente.fin.toISOString(), ahora.toISOString());
  assert.equal(cierreAlReiniciar({ inicio: hace(HORAS_MAXIMAS_DE_REINICIO), ahora }).cierre, 'REINICIADA'); // justo en el límite todavía cuenta
  const vieja = cierreAlReiniciar({ inicio: hace(30), ahora });
  assert.equal(vieja.cierre, 'SIN_CIERRE'); assert.equal(vieja.fin, null); // no se inventa una hora de fin
});

test('la duración se da en minutos y solo si la jornada terminó', () => {
  assert.equal(duracionMin({ inicio: '2026-10-23T08:00:00Z', fin: '2026-10-23T17:30:00Z' }), 570);
  assert.equal(duracionMin({ inicio: '2026-10-23T08:00:00Z', fin: null }), null);
  assert.equal(duracionMin({ inicio: '2026-10-23T08:00:00Z', fin: '2026-10-23T07:00:00Z' }), 0);
});

test('el cursor del historial guarda inicio e id y rechaza lo que no es suyo', () => {
  const inicio = new Date('2026-10-23T13:05:00.250Z');
  assert.deepEqual(decodificarCursorJornada(codificarCursorJornada(inicio, 42)), { inicio, id: 42 });
  assert.equal(decodificarCursorJornada('basura'), null);
  assert.equal(decodificarCursorJornada(Buffer.from('2026-10-23T13:05:00.000Z|abc').toString('base64url')), null);
  assert.equal(decodificarCursorJornada(Buffer.from('no-fecha|7').toString('base64url')), null);
});

test('esquema de la jornada: las apps anteriores (solo la acción) siguen valiendo y la posición va completa', () => {
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR' }).success, true);
  assert.equal(jornadaBody.safeParse({ accion: 'TERMINAR' }).success, true);
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', latitud: -12.07, longitud: -75.21, precision: 9.8, simulada: false, distrito: 'Chilca', provincia: 'Huancayo', departamento: 'Junín' }).success, true);
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', latitud: -12.07 }).success, false); // latitud sin longitud
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', latitud: 95, longitud: 0 }).success, false);
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', latitud: 0, longitud: -181 }).success, false);
  assert.equal(jornadaBody.safeParse({ accion: 'PAUSAR' }).success, false);
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', distrito: 'x'.repeat(101) }).success, false);
  assert.equal(jornadaBody.safeParse({ accion: 'INICIAR', empresa_id: 'otra' }).success, false);
  assert.equal(jornadasQuery.safeParse({ limit: '30' }).success, true); assert.equal(jornadasQuery.safeParse({ limit: '101' }).success, false); assert.equal(jornadasQuery.safeParse({ page: '2' }).success, false);
});

test('en el registro de seguridad la jornada se lee con su zona', () => {
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/visitas/jornada', nuevo: { accion: 'INICIAR', zona: 'Chilca, Huancayo, Junín' } }).titulo, 'Inició su jornada de campo en Chilca, Huancayo, Junín');
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/visitas/jornada', nuevo: { accion: 'INICIAR', zona: null } }).titulo, 'Inició su jornada de campo');
  assert.match(clasificar({ metodo: 'POST', ruta: '/api/visitas/jornada', nuevo: { accion: 'INICIAR', zona: 'Lima', simulada: true } }).titulo, /GPS simulado/);
  assert.equal(clasificar({ metodo: 'POST', ruta: '/api/visitas/jornada', nuevo: { accion: 'TERMINAR' } }).titulo, 'Terminó su jornada de campo');
});
