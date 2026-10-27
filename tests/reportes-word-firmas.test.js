import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { renderizarFicha } from '../src/modules/reportes/ficha-word.js';

// Firmas de la ficha Word: la del cliente y la del auditor de campo (el verificador), con la que cierra su trabajo.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const visitaBase = {
  id_visita: 7, fecha_hora_checkin: '2026-10-18T15:00:00.000Z', server_received_at: '2026-10-18T15:00:05.000Z', resultado: 'CONFORME',
  auditor: { nombres: 'Ana', apellidos: 'Prueba', username: 'ana.prueba' }, mock_location: false, device_integrity_ok: true, firmante_documento: '12345678',
  respuestas_cuestionario: { entrego_dinero_asesor: false, pago_comision_adicional: false, recibio_monto_total: true, titular_administra_negocio: true },
  estado_negocio: 'EN_FUNCIONAMIENTO', plantilla: 'CONSUMO_V1',
};

const expediente = {
  codigo_expediente: 'C-1', tipo_credito: 'CONSUMO', nombres_cliente: 'SOTO FLORES, GLADYS', tipo_documento_cliente: 'DNI', numero_documento_cliente: '31235480',
  direccion_domicilio: 'AV. 9 DE DICIEMBRE 841', distrito: 'CHILCA', provincia: 'HUANCAYO', departamento: 'JUNIN', telefono_cliente: '911297919',
  datos_cliente: {}, datos_negocio: { negocios: [] }, datos_credito: { historial: [] },
  evaluacion_financiera: { moneda: 'PEN', ingresos: [], ingresos_consumo: [] },
  endeudamiento: { fecha_corte: '2026-10-01', entidades: [] },
};

const xmlDe = async (visita) => {
  const buffer = await Packer.toBuffer(renderizarFicha({ visita: { ...visitaBase, ...visita }, e: expediente, plantilla: 'CONSUMO_V1', huella: 'abc' }));
  return (await JSZip.loadAsync(buffer)).file('word/document.xml').async('string');
};
const imagenes = (xml) => (xml.match(/<w:drawing>/g) || []).length;
const textoDe = (xml) => xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('ficha Word: firmas del cliente y del auditor de campo', () => {
  test('con las dos firmas la ficha lleva dos imágenes y el nombre del auditor de campo', async () => {
    const xml = await xmlDe({ firma_evidencia: PNG, firma_auditor: PNG });
    assert.equal(imagenes(xml), 2);
    const texto = textoDe(xml);
    assert.match(texto, /FIRMA DEL CLIENTE/);
    assert.match(texto, /FIRMA Y SELLO DEL AUDITOR DE CAMPO \(VERIFICADOR\)/);
    assert.match(texto, /Auditor de campo: Ana Prueba/);
  });

  test('si el auditor no firmó (visita de una app anterior) queda su recuadro en blanco y solo sale la firma del cliente', async () => {
    assert.equal(imagenes(await xmlDe({ firma_evidencia: PNG, firma_auditor: null })), 1);
  });

  test('en una visita sin cliente (no ubicado) sale solo la firma del auditor', async () => {
    assert.equal(imagenes(await xmlDe({ resultado: 'NO_UBICADO', firma_evidencia: null, firma_auditor: PNG })), 1);
  });

  test('sin ninguna firma no hay imágenes y la ficha se arma igual', async () => {
    assert.equal(imagenes(await xmlDe({ firma_evidencia: null, firma_auditor: null })), 0);
  });

  test('una firma que no es un PNG en data URL se ignora en vez de romper el documento', async () => {
    assert.equal(imagenes(await xmlDe({ firma_evidencia: 'no-es-una-firma', firma_auditor: 'tampoco' })), 0);
  });
});
