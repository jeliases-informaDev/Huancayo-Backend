import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { claveManzana, claveZona, descomponerDireccion } from '../src/modules/geocodificacion/direcciones.js';
import { centroide } from '../src/modules/geocodificacion/vecinos.js';
import { conDireccionesDescompuestas, conservarUbicacionesNegocio, estadoGeoNegocios } from '../src/modules/expedientes/ubicaciones.js';
import { contarFilasDesplazadas, mapearFilaCore } from '../src/modules/expedientes/importador/formato-core.js';
import { construirFilaCore } from '../src/modules/expedientes/importador/muestra-core.js';

// Ubicar con la dirección tal como la manda el banco (manzana y lote, AA.HH., asociaciones): zonas reconocidas, claves de vecinos, negocios
// descompuestos, cola del mapa para negocios y archivos con las filas corridas. Todo con direcciones inventadas.

describe('direcciones — zonas que escribe el banco', () => {
  test('reconoce «ASENT. HUMANO» y «ANEXO» como zona (antes se perdían)', () => {
    assert.equal(descomponerDireccion('ASENT. HUMANO LA VICTORIA MZ. B LT. 7', { distrito: 'EL TAMBO', provincia: 'HUANCAYO' }).componentes.urbanizacion, 'AA.HH. La Victoria');
    assert.equal(descomponerDireccion('ASENTAMIENTO HUMANO SAN MARTIN MZ. C LT. 2', { distrito: 'EL TAMBO', provincia: 'HUANCAYO' }).componentes.urbanizacion, 'AA.HH. San Martin');
    assert.equal(descomponerDireccion('ANEXO DE HUARI MZ. B LT. 2', { distrito: 'HUANCAYO', provincia: 'HUANCAYO' }).componentes.urbanizacion, 'Anexo De Huari');
  });

  test('la clave de zona y de manzana es la misma aunque la zona y el distrito se escriban distinto', () => {
    const a = descomponerDireccion('A.H. SANTA ROSA MZ C LOTE 12', { distrito: 'EL TAMBO', provincia: 'HUANCAYO' }).componentes;
    const b = descomponerDireccion('AA.HH. SANTA ROSA MZ. C LT. 1', { distrito: 'El Tambo', provincia: 'HUANCAYO' }).componentes;
    const c = descomponerDireccion('AA.HH. SANTA ROSA MZ. D LT. 1', { distrito: 'EL TAMBO', provincia: 'HUANCAYO' }).componentes;
    assert.ok(claveZona(a, 'EL TAMBO'));
    assert.equal(claveZona(a, 'EL TAMBO'), claveZona(b, 'El Tambo'));
    assert.equal(claveManzana(a, 'EL TAMBO'), claveManzana(b, 'El Tambo'));
    assert.notEqual(claveManzana(a, 'EL TAMBO'), claveManzana(c, 'EL TAMBO'), 'otra manzana es otra clave');
    assert.notEqual(claveZona(a, 'EL TAMBO'), claveZona(a, 'CHILCA'), 'la misma zona en otro distrito es otra clave');
  });

  test('sin zona, sin distrito o sin manzana no hay clave (no se inventan vecinos)', () => {
    const calle = descomponerDireccion('AV. LEONCIO PRADO 341', { distrito: 'HUANCAYO', provincia: 'HUANCAYO' }).componentes;
    const soloMz = descomponerDireccion('MZ. K LT. 20', { distrito: 'HUANCAYO', provincia: 'HUANCAYO' }).componentes;
    const zona = descomponerDireccion('URB. SAN CARLOS MZ. B LT. 3', { distrito: 'HUANCAYO', provincia: 'HUANCAYO' }).componentes;
    assert.equal(claveZona(calle, 'HUANCAYO'), null);
    assert.equal(claveManzana(soloMz, 'HUANCAYO'), null);
    assert.equal(claveZona(zona, ''), null);
    assert.equal(claveManzana(descomponerDireccion('URB. SAN CARLOS', { distrito: 'HUANCAYO', provincia: 'HUANCAYO' }).componentes, 'HUANCAYO'), null);
  });
});

describe('vecinos — punto medio', () => {
  test('promedia las ubicaciones verificadas y descarta las que no son números', () => {
    const c = centroide([{ latitud: '-12.0600', longitud: '-75.2000' }, { latitud: -12.0700, longitud: -75.2100 }, { latitud: null, longitud: null }]);
    assert.equal(c.puntos, 2);
    assert.ok(Math.abs(c.latitud - -12.065) < 1e-6 && Math.abs(c.longitud - -75.205) < 1e-6);
    assert.equal(centroide([]), null);
  });
});

describe('negocios — direcciones descompuestas y cola del mapa', () => {
  const datos = { negocios: [{ direccion: 'AA.HH. JUSTICIA PAZ Y VIDA MZ. C LT. 12', distrito: 'EL TAMBO' }, { direccion: 'JR. REAL 520', distrito: 'HUANCAYO', latitud: -12.06, longitud: -75.2, ubicacion_origen: 'REFERENCIA' }] };

  test('cada negocio con dirección queda con sus partes (zona, manzana, lote) y su dirección normalizada', () => {
    const d = conDireccionesDescompuestas(datos, { distrito: 'HUANCAYO', provincia: 'HUANCAYO' });
    assert.equal(d.negocios[0].componentes.urbanizacion, 'AA.HH. Justicia Paz y Vida');
    assert.equal(d.negocios[0].componentes.manzana, 'C');
    assert.equal(d.negocios[0].componentes.lote, '12');
    assert.ok(d.negocios[0].componentes.calidad.includes('MANZANA_LOTE'));
    assert.equal(d.negocios[1].componentes.numero, '520');
    assert.ok(d.negocios[1].direccion_normalizada.startsWith('Jirón Real 520'));
    assert.equal(conDireccionesDescompuestas(null, {}), null, 'sin bloque de negocio no pasa nada');
  });

  test('la cola de negocios: PENDIENTE si alguno con dirección sigue sin coordenadas ni sugerencia; LISTO si no queda nada; null sin negocios', () => {
    assert.equal(estadoGeoNegocios(datos), 'PENDIENTE');
    assert.equal(estadoGeoNegocios({ negocios: [datos.negocios[1]] }), 'LISTO');
    assert.equal(estadoGeoNegocios({ negocios: [{ ...datos.negocios[0], geo: { estado: 'LOCALIZADO', precision: 'ZONA' } }] }), 'LISTO');
    assert.equal(estadoGeoNegocios({ negocios: [] }), null);
    assert.equal(estadoGeoNegocios(null), null);
  });

  test('al reimportar se conserva lo que el mapa ya averiguó del negocio (sugerencia y punto exacto) mientras la dirección no cambie', () => {
    const antes = { negocios: [{ direccion: 'JR. REAL 520', latitud: -12.06, longitud: -75.2, ubicacion_origen: 'GEOCODIFICADA', geo: { estado: 'LOCALIZADO', confianza: 'ALTA' } }, { direccion: 'MZ. C LT. 12 AA.HH. X', geo: { estado: 'LOCALIZADO', precision: 'ZONA', latitud: -12.1, longitud: -75.3 } }] };
    const nuevos = { negocios: [{ direccion: 'JR. REAL 520' }, { direccion: 'MZ. C LT. 12 AA.HH. X' }] };
    const r = conservarUbicacionesNegocio(antes, nuevos);
    assert.equal(r.negocios[0].ubicacion_origen, 'GEOCODIFICADA');
    assert.equal(r.negocios[0].latitud, -12.06);
    assert.deepEqual(r.negocios[1].geo, antes.negocios[1].geo);
    assert.equal(r.negocios[1].latitud, undefined, 'la sugerencia de zona no se vuelve referencia');
    const cambiada = conservarUbicacionesNegocio(antes, { negocios: [{ direccion: 'JR. REAL 999' }, { direccion: 'MZ. D LT. 1 AA.HH. X' }] });
    assert.equal(cambiada.negocios[0].latitud, undefined);
    assert.equal(cambiada.negocios[1].geo, undefined);
  });

  test('la carga masiva deja los negocios descompuestos y la cola marcada, sin cambiar la huella de la fila', () => {
    const fila = construirFilaCore(2);
    const a = mapearFilaCore(fila, { hoja: 'OTROS' });
    const b = mapearFilaCore(fila, { hoja: 'OTROS' });
    assert.equal(a.huella, b.huella);
    const negocios = a.expediente.datos_negocio.negocios;
    assert.ok(negocios.length >= 1);
    for (const n of negocios.filter((x) => x.direccion)) assert.ok(n.componentes && n.direccion_normalizada, 'cada negocio con dirección trae sus partes');
    assert.equal(a.expediente.geo_negocios_estado, estadoGeoNegocios(a.expediente.datos_negocio));
    assert.ok(['PENDIENTE', 'LISTO'].includes(a.expediente.geo_negocios_estado));
  });
});

describe('carga masiva — filas corridas', () => {
  const fila = (desembolso, evaluacion) => ({ datos_credito: { fecha_desembolso: desembolso }, evaluacion_financiera: { anterior: evaluacion ? { fecha: evaluacion } : null, reevaluacion: null } });

  test('detecta el archivo en que la evaluación de cada fila es la del cliente de la fila siguiente', () => {
    const corrido = [fila('2026-01-10', '2026-02-05'), fila('2026-02-05', '2026-03-09'), fila('2026-03-09', '2026-04-01'), fila('2026-04-01', '2026-01-02')];
    const r = contarFilasDesplazadas(corrido);
    assert.deepEqual([r.desplazadas, r.comparables, r.sospechoso], [3, 3, true]);
  });

  test('un archivo normal no se marca, ni con una sola coincidencia casual', () => {
    const normal = [fila('2026-01-10', '2026-01-02'), fila('2026-02-05', '2026-01-28'), fila('2026-03-09', '2026-03-01')];
    assert.equal(contarFilasDesplazadas(normal).sospechoso, false);
    const casual = [fila('2026-01-10', '2026-02-05'), fila('2026-02-05', '2026-02-01'), fila('2026-03-09', '2026-03-01'), fila('2026-04-01', '2026-03-20')];
    assert.equal(contarFilasDesplazadas(casual).sospechoso, false, 'una coincidencia entre cuatro no alcanza');
    assert.equal(contarFilasDesplazadas([fila('2026-01-10', null), fila('2026-02-05', null)]).comparables, 0, 'sin fechas no hay nada que comparar');
  });
});
