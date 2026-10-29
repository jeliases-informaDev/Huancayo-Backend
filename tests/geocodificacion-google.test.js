import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluarResultado, mapearResultadoGoogle } from '../src/modules/geocodificacion/direcciones.js';
import { esProveedorTemporal, pausaEntreConsultasMs, proveedorActivo, PROVEEDORES_TEMPORALES, tamanoMaximoLote } from '../src/modules/geocodificacion/proveedores.js';
import { puedeConsultar, soloAsignados, topeMensual } from '../src/modules/geocodificacion/geocodificacion.service.js';

// Google como proveedor «temporal»: sus resultados se traducen al formato interno, nunca se vuelven referencia, se buscan solo los casos
// asignados y hay tope mensual de consultas. Respuestas inventadas con la forma de la Geocoding API.

const resultado = ({ location_type, types, componentes, lat = -12.06, lng = -75.2 }) => ({
  formatted_address: 'Dirección de prueba, Huancayo, Perú',
  geometry: { location: { lat, lng }, location_type },
  types,
  address_components: componentes.map(([valor, ...tipos]) => ({ long_name: valor, short_name: valor, types: tipos })),
});
const conEnv = (cambios, fn) => {
  const previos = Object.fromEntries(Object.keys(cambios).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(cambios)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  try { return fn(); } finally { for (const [k, v] of Object.entries(previos)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
};

describe('Google — traducción de resultados', () => {
  test('puerta exacta (ROOFTOP con número) → EXACTA y confianza ALTA si el distrito coincide', () => {
    const r = mapearResultadoGoogle(resultado({ location_type: 'ROOFTOP', types: ['street_address'], componentes: [['250', 'street_number'], ['Avenida Giráldez', 'route'], ['Huancayo', 'locality', 'political'], ['Huancayo', 'administrative_area_level_2'], ['Junín', 'administrative_area_level_1']] }));
    assert.equal(r.addresstype, 'building');
    assert.equal(r.address.house_number, '250');
    assert.equal(r.lat, '-12.06');
    const ev = evaluarResultado({ item: r, numeroSolicitado: '250', distritoEsperado: 'HUANCAYO' });
    assert.deepEqual([ev.precision, ev.confianza, ev.distritoCoincide], ['EXACTA', 'ALTA', true]);
  });

  test('número estimado (RANGE_INTERPOLATED) → aproximado, confianza MEDIA: sirve para llegar, no para los 100 m', () => {
    const r = mapearResultadoGoogle(resultado({ location_type: 'RANGE_INTERPOLATED', types: ['street_address'], componentes: [['1200', 'street_number'], ['Avenida Mariscal Castilla', 'route'], ['El Tambo', 'locality', 'political']] }));
    assert.equal(r.addresstype, 'place');
    const ev = evaluarResultado({ item: r, numeroSolicitado: '1200', distritoEsperado: 'EL TAMBO' });
    assert.deepEqual([ev.precision, ev.confianza], ['APROXIMADA', 'MEDIA']);
  });

  test('solo la calle → aproximado; la zona (AA.HH.) → DISTRITO; la ciudad → PROVINCIA (se descarta)', () => {
    const calle = mapearResultadoGoogle(resultado({ location_type: 'GEOMETRIC_CENTER', types: ['route'], componentes: [['Jirón Real', 'route'], ['Huancayo', 'locality', 'political']] }));
    assert.equal(evaluarResultado({ item: calle, distritoEsperado: 'HUANCAYO' }).precision, 'APROXIMADA');
    const zona = mapearResultadoGoogle(resultado({ location_type: 'APPROXIMATE', types: ['sublocality_level_1', 'sublocality', 'political'], componentes: [['Justicia Paz y Vida', 'sublocality_level_1', 'sublocality', 'political'], ['El Tambo', 'locality', 'political']] }));
    const evZona = evaluarResultado({ item: zona, distritoEsperado: 'EL TAMBO', esManzanaLote: true });
    assert.deepEqual([evZona.precision, evZona.confianza, evZona.distritoCoincide], ['DISTRITO', 'BAJA', true]);
    const ciudad = mapearResultadoGoogle(resultado({ location_type: 'APPROXIMATE', types: ['locality', 'political'], componentes: [['Huancayo', 'locality', 'political']] }));
    assert.equal(evaluarResultado({ item: ciudad, distritoEsperado: 'EL TAMBO' }).precision, 'PROVINCIA');
  });

  test('un distrito distinto al declarado se nota (REVISAR)', () => {
    const r = mapearResultadoGoogle(resultado({ location_type: 'ROOFTOP', types: ['street_address'], componentes: [['520', 'street_number'], ['Jirón Real', 'route'], ['Chilca', 'locality', 'political']] }));
    assert.equal(evaluarResultado({ item: r, numeroSolicitado: '520', distritoEsperado: 'EL TAMBO' }).distritoCoincide, false);
  });
});

describe('Google — reglas del proveedor temporal', () => {
  test('se elige con GEOCODING_PROVIDER=google y es temporal; Mapbox y OpenStreetMap no', () => {
    conEnv({ GEOCODING_PROVIDER: 'google' }, () => { assert.equal(proveedorActivo(), 'google'); assert.equal(pausaEntreConsultasMs('google'), 100); assert.equal(tamanoMaximoLote('google'), 500); });
    conEnv({ GEOCODING_PROVIDER: 'otro' }, () => assert.equal(proveedorActivo(), 'nominatim'));
    assert.deepEqual([...PROVEEDORES_TEMPORALES], ['google']);
    assert.equal(esProveedorTemporal('google'), true);
    assert.equal(esProveedorTemporal('mapbox'), false);
    assert.equal(esProveedorTemporal('nominatim'), false);
  });

  test('solo casos asignados: por defecto sí con proveedores de pago, no con OpenStreetMap; la variable manda', () => {
    conEnv({ GEOCODING_SOLO_ASIGNADOS: undefined }, () => {
      assert.equal(soloAsignados('google'), true);
      assert.equal(soloAsignados('mapbox'), true);
      assert.equal(soloAsignados('nominatim'), false);
    });
    conEnv({ GEOCODING_SOLO_ASIGNADOS: 'false' }, () => assert.equal(soloAsignados('google'), false));
    conEnv({ GEOCODING_SOLO_ASIGNADOS: 'true' }, () => assert.equal(soloAsignados('nominatim'), true));
  });

  test('tope mensual: 10 000 por defecto (la cuota gratis de Google), configurable, 0 = sin tope', () => {
    conEnv({ GEOCODING_MAX_MES: undefined }, () => { assert.equal(topeMensual(), 10000); assert.equal(puedeConsultar(9999), true); assert.equal(puedeConsultar(10000), false); });
    conEnv({ GEOCODING_MAX_MES: '500' }, () => { assert.equal(topeMensual(), 500); assert.equal(puedeConsultar(500), false); });
    conEnv({ GEOCODING_MAX_MES: '0' }, () => { assert.equal(topeMensual(), 0); assert.equal(puedeConsultar(1000000), true); });
  });
});
