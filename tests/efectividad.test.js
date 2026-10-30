import test from 'node:test';
import assert from 'node:assert/strict';
import { armarEfectividad, diasDelPeriodo, minutosDelDia, horaDeMinutos, diaDe } from '../src/modules/reportes/efectividad.js';

const DESFASE = 300; // Perú: 5 h detrás de UTC
const lima = (texto) => new Date(`${texto}-05:00`); // hora de Lima a Date

const auditores = [
  { id: 'a1', nombre: 'Ana Auditora', usuario: 'ch.ana', zona: 'Comas, Lima', activo: true },
  { id: 'a2', nombre: 'Beto Campo', usuario: 'ch.beto', zona: null, activo: true },
  { id: 'a3', nombre: 'Carla Retirada', usuario: 'ch.carla', zona: null, activo: false },
];

test('los días y las horas se cuentan con el huso del usuario, no con UTC', () => {
  assert.equal(diaDe(lima('2026-10-29T23:30:00'), DESFASE), '2026-10-29'); // en UTC ya es el 30
  assert.equal(horaDeMinutos(minutosDelDia(lima('2026-10-29T08:05:00'), DESFASE)), '08:05');
  assert.equal(diasDelPeriodo('2026-10-01', '2026-10-31'), 31);
});

test('armarEfectividad junta visitas, casos, jornadas, recorrido y llegadas por auditor y por día', () => {
  const r = armarEfectividad({
    desde: '2026-10-01', hasta: '2026-10-31', desfase: DESFASE, geocercaM: 100, auditores,
    visitas: [
      { id_usuario: 'a1', fecha: lima('2026-10-29T09:10:00'), checkout: lima('2026-10-29T09:40:00'), resultado: 'CONFORME', distancia_m: 20, precision: 10, simulada: false },
      { id_usuario: 'a1', fecha: lima('2026-10-29T11:00:00'), checkout: null, resultado: 'OBSERVADO', distancia_m: 350, precision: 30, simulada: false },
      { id_usuario: 'a1', fecha: lima('2026-10-30T10:00:00'), checkout: lima('2026-10-30T10:20:00'), resultado: 'NO_UBICADO', distancia_m: null, precision: null, simulada: true },
      { id_usuario: 'a2', fecha: lima('2026-10-29T15:00:00'), checkout: null, resultado: 'RECHAZADO', distancia_m: 10, precision: 8, simulada: false },
    ],
    casos: new Map([['a1', { pendientes_inicio: 4, asignados: 6, finalizados: 3 }], ['a2', { pendientes_inicio: 0, asignados: 2, finalizados: 1 }]]),
    cierres: [{ id_usuario: 'a1', fecha: lima('2026-10-29T09:41:00') }, { id_usuario: 'a1', fecha: lima('2026-10-29T11:05:00') }, { id_usuario: 'a1', fecha: lima('2026-10-30T10:21:00') }, { id_usuario: 'a2', fecha: lima('2026-10-29T15:30:00') }],
    jornadas: [
      { id_usuario: 'a1', inicio: lima('2026-10-29T08:00:00'), fin: lima('2026-10-29T17:30:00'), cierre: 'NORMAL' },
      { id_usuario: 'a1', inicio: lima('2026-10-30T08:30:00'), fin: null, cierre: null },
    ],
    llegadas: [{ id_usuario: 'a1', id_expediente: 7, fecha: lima('2026-10-29T09:05:00') }, { id_usuario: 'a1', id_expediente: 7, fecha: lima('2026-10-29T10:55:00') }],
    recorridos: [{ id_usuario: 'a1', dia: '2026-10-29', metros: 15163, puntos: 1054, primero: lima('2026-10-29T08:02:00'), ultimo: lima('2026-10-29T17:25:00') }],
  });
  assert.equal(r.dias_del_periodo, 31);
  assert.deepEqual(r.auditores.map((a) => a.id), ['a1', 'a2']); // la inactiva sin nada no sale
  const ana = r.auditores[0];
  assert.deepEqual(ana.visitas, {
    total: 3, conforme: 1, observado: 1, no_ubicado: 1, rechazado: 0, conformidad: 0.333, por_dia_en_campo: 1.5, duracion_promedio_min: 25, precision_promedio_m: 20,
    llegadas: 2, clientes_con_llegada: 1, fuera_geocerca: 1, gps_simulado: 1,
  });
  assert.deepEqual(ana.casos, { pendientes_inicio: 4, asignados: 6, finalizados: 3, pendientes_cierre: 7, cumplimiento: 0.3 });
  assert.equal(ana.campo.dias_en_campo, 2);
  assert.equal(ana.campo.dias_con_jornada, 2);
  assert.equal(ana.campo.horas_jornada, 9.5);
  assert.equal(ana.campo.jornadas_sin_cierre, 1);
  assert.equal(ana.campo.km, 15.2);
  assert.equal(ana.campo.inicio_promedio, '08:16'); // (08:02 del recorrido + 08:30 de la jornada sin puntos) / 2
  assert.equal(ana.campo.fin_promedio, '17:25');
  const beto = r.auditores[1];
  assert.equal(beto.campo.km, null); // sin puntos de seguimiento: no se inventa un cero
  assert.equal(beto.casos.cumplimiento, 0.5);
  const dia29 = r.dias.find((d) => d.id_usuario === 'a1' && d.dia === '2026-10-29');
  assert.deepEqual(dia29, {
    id_usuario: 'a1', dia: '2026-10-29', jornada_inicio: '08:00', jornada_fin: '17:30', horas_jornada: 9.5, jornadas_sin_cierre: 0,
    primera_posicion: '08:02', ultima_posicion: '17:25', km: 15.2, puntos_gps: 1054,
    visitas: 2, conforme: 1, observado: 1, no_ubicado: 0, rechazado: 0, casos_cerrados: 2, llegadas: 2, fuera_geocerca: 1, gps_simulado: 0,
  });
  assert.equal(r.totales.visitas, 4);
  assert.equal(r.totales.cumplimiento, 0.333);
  assert.equal(r.totales.km, 15.2);
});

test('un auditor activo sin nada en el periodo sale en cero, para que se note', () => {
  const r = armarEfectividad({ desde: '2026-10-01', hasta: '2026-10-02', desfase: 0, auditores: [auditores[1]] });
  assert.equal(r.auditores.length, 1);
  assert.equal(r.auditores[0].visitas.total, 0);
  assert.equal(r.auditores[0].casos.cumplimiento, null);
  assert.equal(r.auditores[0].campo.inicio_promedio, null);
});

test('efectividadQuery exige un periodo cerrado, ordenado y de hasta un año', async () => {
  const { efectividadQuery } = await import('../src/validation/schemas.js');
  assert.equal(efectividadQuery.safeParse({ desde: '2026-10-01', hasta: '2026-10-31', desfase: '300' }).success, true);
  assert.equal(efectividadQuery.safeParse({ desde: '2026-10-31', hasta: '2026-10-01' }).success, false);
  assert.equal(efectividadQuery.safeParse({ desde: '2025-01-01', hasta: '2026-10-31' }).success, false);
  assert.equal(efectividadQuery.safeParse({ hasta: '2026-10-31' }).success, false);
  assert.equal(efectividadQuery.safeParse({ desde: '2026-10-01', hasta: '2026-10-31', extra: 1 }).success, false);
});
