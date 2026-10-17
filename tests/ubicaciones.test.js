import test from 'node:test';
import assert from 'node:assert/strict';
import { puntoDeReferencia, conUbicacionNegocio, conservarUbicacionesNegocio, negociosDe } from '../src/modules/expedientes/ubicaciones.js';
import { visitaCreateBody, negocioUbicacionBody } from '../src/validation/schemas.js';

const mype = {
  tipo_credito: 'OTROS', direccion_domicilio: 'Jr. Lima 100', distrito: 'Huancayo', latitud: '-12.0650', longitud: -75.2100, ubicacion_origen: 'REFERENCIA',
  datos_negocio: { actividad: 'Bodega', negocios: [{ direccion: 'Av. Real 500', distrito: 'Chilca', latitud: -12.0700, longitud: -75.2000, ubicacion_origen: 'MANUAL' }, { direccion: 'Mercado 3', distrito: 'El Tambo' }] },
};

test('puntoDeReferencia: el domicilio es el punto por defecto', () => {
  const p = puntoDeReferencia(mype);
  assert.equal(p.destino, 'DOMICILIO');
  assert.equal(p.latitud, -12.065);
  assert.equal(p.direccion, 'Jr. Lima 100, Huancayo');
});

test('puntoDeReferencia: un negocio usa SUS coordenadas, no las del domicilio', () => {
  const p = puntoDeReferencia(mype, 'NEGOCIO', 0);
  assert.equal(p.destino, 'NEGOCIO');
  assert.equal(p.latitud, -12.07);
  assert.equal(p.longitud, -75.2);
  assert.equal(p.direccion, 'Av. Real 500, Chilca');
});

test('puntoDeReferencia: un negocio sin coordenadas devuelve el punto con latitud nula', () => {
  const p = puntoDeReferencia(mype, 'NEGOCIO', 1);
  assert.equal(p.latitud, null);
  assert.equal(p.direccion, 'Mercado 3, El Tambo');
});

test('puntoDeReferencia: negocio inexistente o crédito de consumo no tienen negocio', () => {
  assert.equal(puntoDeReferencia(mype, 'NEGOCIO', 5), null);
  assert.equal(puntoDeReferencia({ ...mype, tipo_credito: 'CONSUMO' }, 'NEGOCIO', 0), null);
});

test('conUbicacionNegocio: cambia solo el negocio pedido y no toca el original', () => {
  const nuevo = conUbicacionNegocio(mype.datos_negocio, 1, -12.1, -75.3, 'PRIMERA_VISITA');
  assert.equal(nuevo.negocios[1].latitud, -12.1);
  assert.equal(nuevo.negocios[1].ubicacion_origen, 'PRIMERA_VISITA');
  assert.equal(nuevo.negocios[0].latitud, -12.07);
  assert.equal(nuevo.actividad, 'Bodega');
  assert.equal(mype.datos_negocio.negocios[1].latitud, undefined);
});

test('conservarUbicacionesNegocio: la base no pisa una ubicación fijada a mano si la dirección no cambió', () => {
  const baseNueva = { actividad: 'Bodega', negocios: [{ direccion: 'AV. REAL 500', distrito: 'Chilca', latitud: null }, { direccion: 'Otra dirección', distrito: 'El Tambo', latitud: null }] };
  const r = conservarUbicacionesNegocio(mype.datos_negocio, baseNueva);
  assert.equal(r.negocios[0].latitud, -12.07);
  assert.equal(r.negocios[0].ubicacion_origen, 'MANUAL');
  assert.equal(r.negocios[1].latitud, null);
  assert.equal(negociosDe({ datos_negocio: null }).length, 0);
});

test('visitaCreateBody acepta la dirección visitada y rechaza valores inválidos', () => {
  const base = {
    id_expediente: 1, fecha_hora_checkin: new Date().toISOString(), latitud: -12.06, longitud: -75.2, resultado: 'OBSERVADO',
    respuestas_cuestionario: {}, evidencia_principal_key: 'k/1.jpg',
  };
  assert.equal(visitaCreateBody.safeParse({ ...base, ubicacion_visitada: 'NEGOCIO', indice_negocio: 1 }).success, true);
  assert.equal(visitaCreateBody.safeParse(base).success, true);
  assert.equal(visitaCreateBody.safeParse({ ...base, ubicacion_visitada: 'OFICINA' }).success, false);
  assert.equal(visitaCreateBody.safeParse({ ...base, indice_negocio: 9 }).success, false);
});

test('negocioUbicacionBody exige latitud y longitud válidas', () => {
  assert.equal(negocioUbicacionBody.safeParse({ latitud: -12.07, longitud: -75.2 }).success, true);
  assert.equal(negocioUbicacionBody.safeParse({ latitud: 95, longitud: -75.2 }).success, false);
  assert.equal(negocioUbicacionBody.safeParse({ latitud: -12.07 }).success, false);
});
