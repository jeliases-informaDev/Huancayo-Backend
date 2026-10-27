import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ventanas, sumarRango, armarSerie, resultadosDe, nivelDe, armarRanking } from '../src/modules/reportes/tablero.js';
import { tableroQuery } from '../src/validation/schemas.js';

const DIA_MS = 24 * 60 * 60 * 1000;
const dias = (desde, hasta) => Math.round((new Date(`${hasta}T00:00:00Z`) - new Date(`${desde}T00:00:00Z`)) / DIA_MS) + 1;

describe('tablero: ventana del tramo y la anterior', () => {
  test('diario: 7 días y la víspera hacia atrás otros 7', () => {
    const v = ventanas('diario', '2026-10-27');
    assert.equal(v.desde, '2026-10-21');
    assert.equal(v.dias, 7);
    assert.equal(v.desdeAnterior, '2026-10-14');
    assert.equal(v.hastaAnterior, '2026-10-20');
  });

  test('semanal: 8 bloques de 7 días son 56 días, y el tramo anterior tiene también 56', () => {
    const v = ventanas('semanal', '2026-10-27');
    assert.equal(v.dias, 56);
    assert.equal(v.desde, '2026-09-02');
    assert.equal(dias(v.desdeAnterior, v.hastaAnterior), 56);
    assert.equal(v.hastaAnterior, '2026-09-01'); // la víspera del primer día del tramo
  });

  test('mensual: 6 meses de calendario (el último a medias) y un tramo anterior con los mismos días', () => {
    const v = ventanas('mensual', '2026-10-27');
    assert.equal(v.desde, '2026-05-01');
    assert.equal(v.dias, 180); // mayo 31 + junio 30 + julio 31 + agosto 31 + septiembre 30 + 27 de octubre
    assert.equal(v.hastaAnterior, '2026-04-30');
    assert.equal(dias(v.desdeAnterior, v.hastaAnterior), 180);
  });
});

describe('tablero: las tarjetas coinciden con el gráfico', () => {
  // Visitas por día: 3 el 21, 5 el 25, 2 el 27 (dentro del tramo) y 4 el 15 y 1 el 20 (tramo anterior); 9 el día 1 (fuera de las dos ventanas).
  const porDia = new Map([['2026-10-21', 3], ['2026-10-25', 5], ['2026-10-27', 2], ['2026-10-15', 4], ['2026-10-20', 1], ['2026-10-01', 9]]);

  test('el total de la serie es la suma de sus puntos y la del tramo anterior solo cuenta sus días', () => {
    const v = ventanas('diario', '2026-10-27');
    const s = armarSerie(v, porDia);
    assert.equal(s.total, 10);
    assert.equal(s.puntos.length, 7);
    assert.equal(s.total, s.puntos.reduce((n, p) => n + p.total, 0));
    assert.equal(s.total, sumarRango(porDia, v.desde, v.hasta));
    assert.equal(s.anterior, 5);
  });

  test('en semanal y mensual el total sigue siendo la suma de los puntos del gráfico', () => {
    for (const periodo of ['semanal', 'mensual']) {
      const v = ventanas(periodo, '2026-10-27');
      const s = armarSerie(v, porDia);
      assert.equal(s.total, s.puntos.reduce((n, p) => n + p.total, 0), periodo);
      assert.equal(s.total, sumarRango(porDia, v.desde, v.hasta), periodo);
    }
    // las 8 semanas empiezan el 2 de septiembre y los 6 meses el 1 de mayo: los seis días con datos caen dentro de los dos tramos
    assert.equal(armarSerie(ventanas('semanal', '2026-10-27'), porDia).total, 24);
    assert.equal(armarSerie(ventanas('mensual', '2026-10-27'), porDia).total, 24);
  });
});

describe('tablero: ranking de auditores', () => {
  const auditores = [
    { id: 'a', nombre: 'Ana Rojas', usuario: 'ana', zona: 'Huancayo' },
    { id: 'b', nombre: 'Beto Mendoza', usuario: 'beto', zona: null },
    { id: 'c', nombre: 'Carla Vega', usuario: 'carla', zona: 'Chilca' },
    { id: 'd', nombre: 'Diego Salas', usuario: 'diego', zona: null },
    { id: 'x', nombre: 'Ex Auditor', usuario: 'ex', zona: null, activo: false },
  ];
  const conteos = [
    { id: 'a', resultado: 'CONFORME', plantilla: 'MYPE_V1', n: 6 },
    { id: 'a', resultado: 'OBSERVADO', plantilla: 'CONSUMO_V1', n: 2 },
    { id: 'a', resultado: 'NO_UBICADO', plantilla: 'CONSUMO_V1', n: 1 },
    { id: 'b', resultado: 'CONFORME', plantilla: 'CONSUMO_V1', n: 4 },
    { id: 'b', resultado: 'RECHAZADO', plantilla: null, n: 1 },
    { id: 'c', resultado: 'CONFORME', plantilla: 'CONSUMO_V1', n: 5 },
    { id: 'x', resultado: 'CONFORME', plantilla: 'MYPE_V1', n: 1 },
  ];
  const anteriores = new Map([['a', 6], ['b', 5]]);
  const r = armarRanking({ conteos, anteriores, auditores });

  test('ordena por visitas, luego por conformes y luego por nombre', () => {
    assert.deepEqual(r.auditores.map((f) => f.id), ['a', 'c', 'b', 'x', 'd']);
    assert.deepEqual(r.auditores.map((f) => f.posicion), [1, 2, 3, 4, 5]);
    // b y c empatan con 5 visitas: gana quien tiene más conformes (c: 5, b: 4)
    assert.equal(r.auditores[1].id, 'c');
  });

  test('cada auditor trae sus categorías: resultado y tipo de ficha', () => {
    const ana = r.auditores[0];
    assert.equal(ana.visitas, 9);
    assert.deepEqual(ana.resultados, { CONFORME: 6, OBSERVADO: 2, NO_UBICADO: 1, RECHAZADO: 0 });
    assert.deepEqual(ana.tipos, { MYPE: 6, CONSUMO: 3 });
    assert.equal(ana.anterior, 6);
  });

  test('la efectividad es el porcentaje de visitas conformes y queda en null si no hubo visitas', () => {
    assert.equal(r.auditores[0].efectividad, 66.7);
    assert.equal(r.auditores.find((f) => f.id === 'd').efectividad, null);
  });

  test('un auditor sin visitas aparece igual, y uno inactivo que sí visitó también (marcado)', () => {
    const d = r.auditores.find((f) => f.id === 'd');
    assert.equal(d.visitas, 0);
    assert.equal(d.nivel, 'SIN_VISITAS');
    assert.equal(r.auditores.find((f) => f.id === 'x').activo, false);
    assert.equal(r.total_auditores, 5);
    assert.equal(r.con_visitas, 4);
  });

  test('el nivel compara con el promedio del equipo (destacado desde 125 %, bajo por debajo de 75 %)', () => {
    assert.equal(nivelDe(10, 8), 'DESTACADO');
    assert.equal(nivelDe(8, 8), 'PROMEDIO');
    assert.equal(nivelDe(5, 8), 'BAJO');
    assert.equal(nivelDe(0, 8), 'SIN_VISITAS');
    assert.equal(nivelDe(3, 0), 'PROMEDIO');
    assert.equal(r.promedio, 4); // 20 visitas (9 + 5 + 5 + 1 + 0) entre los 5 auditores de la lista
  });

  test('el límite del ranking no cambia los resultados del tramo, que cuentan a todos', () => {
    const corto = armarRanking({ conteos, anteriores, auditores, max: 2 });
    assert.equal(corto.auditores.length, 2);
    assert.equal(corto.total_auditores, 5);
    assert.deepEqual(resultadosDe(conteos), { CONFORME: 16, OBSERVADO: 2, NO_UBICADO: 1, RECHAZADO: 1 });
    assert.equal(Object.values(resultadosDe(conteos)).reduce((a, b) => a + b, 0), r.auditores.reduce((a, f) => a + f.visitas, 0));
  });

  test('conteos de un auditor que no está en la lista se ignoran sin romper', () => {
    const solo = armarRanking({ conteos: [{ id: 'zzz', resultado: 'CONFORME', plantilla: null, n: 3 }], auditores: [{ id: 'a', nombre: 'Ana' }] });
    assert.equal(solo.auditores[0].visitas, 0);
  });
});

describe('tableroQuery', () => {
  test('sin nada es válido: el servidor usa 7 días hasta hoy', () => {
    assert.equal(tableroQuery.safeParse({}).success, true);
  });
  test('acepta período, fecha y desfase, y rechaza lo demás', () => {
    assert.equal(tableroQuery.safeParse({ periodo: 'mensual', hasta: '2026-10-27', desfase: '300' }).success, true);
    assert.equal(tableroQuery.safeParse({ periodo: 'anual' }).success, false);
    assert.equal(tableroQuery.safeParse({ hasta: '27/10/2026' }).success, false);
    assert.equal(tableroQuery.safeParse({ desfase: 9999 }).success, false);
    assert.equal(tableroQuery.safeParse({ metrica: 'visitas' }).success, false);
  });
});
