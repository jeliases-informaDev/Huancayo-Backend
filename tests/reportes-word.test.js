import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { renderizarFicha } from '../src/modules/reportes/ficha-word.js';

// La ficha Word se arma sin base de datos: aquí se renderiza con datos de prueba y se busca el texto en el documento.
async function textoDe(documento) {
  const buffer = await Packer.toBuffer(documento);
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file('word/document.xml').async('string');
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

const visitaBase = {
  id_visita: 7, fecha_hora_checkin: '2026-10-18T15:00:00.000Z', server_received_at: '2026-10-18T15:00:05.000Z', resultado: 'CONFORME',
  auditor: { nombres: 'Ana', apellidos: 'Prueba', username: 'ana.prueba' }, mock_location: false, device_integrity_ok: true, firmante_documento: '12345678',
  respuestas_cuestionario: { entrego_dinero_asesor: false, pago_comision_adicional: false, recibio_monto_total: true, titular_administra_negocio: true },
  estado_negocio: 'EN_FUNCIONAMIENTO',
};

// Como lo deja el importador: los datos laborales van en la lista "negocios" (hasta dos), más el sustento de ingreso.
const expedienteConsumo = {
  codigo_expediente: 'C-1', tipo_credito: 'CONSUMO', nombres_cliente: 'SOTO FLORES, GLADYS', tipo_documento_cliente: 'DNI', numero_documento_cliente: '31235480',
  direccion_domicilio: 'AV. 9 DE DICIEMBRE 841', distrito: 'CHILCA', provincia: 'HUANCAYO', departamento: 'JUNIN', telefono_cliente: '911297919',
  datos_cliente: { telefono_fijo: '0642837832', telefono_celular: '911297919' },
  datos_negocio: {
    actividad: 'FERRETERIA', antiguedad_texto: '10 AÑOS', antiguedad_meses: 120, sustento_ingreso: 'BOLETA DE PAGO',
    negocios: [
      { direccion: 'AV. 9 DE DICIEMBRE 841', distrito: 'CHILCA', referencia: 'Ref: FRENTE AL MERCADO', contacto: 'GLADYS SOTO / FERRETERIA', telefono: '911297919' },
      { direccion: 'AV. 9 DE DICIEMBRE 961', distrito: 'CHILCA', referencia: 'Ref: SEGUNDO LOCAL, PUESTO 18', contacto: 'VICTOR RAUL HUAMAN / FERRETERIA', telefono: '927717337' },
    ],
  },
  datos_credito: { historial: [] },
  evaluacion_financiera: { moneda: 'PEN', ingresos: [], ingresos_consumo: [{ descripcion: 'SUELDO DEPENDIENTE', relacion: 'TITULAR', moneda: 'S/', monto: 2500, tipo_ingreso: 'DEPENDIENTE' }] },
  endeudamiento: { fecha_corte: '2026-10-01', entidades: [] },
};

describe('ficha Word — Consumo', () => {
  test('imprime empleador, dirección, referencia, distrito y teléfono del trabajo, el sustento de ingreso y ambos teléfonos', async () => {
    const texto = await textoDe(renderizarFicha({ visita: { ...visitaBase, plantilla: 'CONSUMO_V1' }, e: expedienteConsumo, plantilla: 'CONSUMO_V1', empresa: { nombre_corto: 'Caja Prueba' }, huella: 'abc' }));
    assert.match(texto, /Empleador: GLADYS SOTO \/ FERRETERIA \/ VICTOR RAUL HUAMAN \/ FERRETERIA/);
    assert.match(texto, /Dirección del empleador: AV\. 9 DE DICIEMBRE 841 \/ AV\. 9 DE DICIEMBRE 961/);
    assert.match(texto, /Referencia: Ref: FRENTE AL MERCADO \/ Ref: SEGUNDO LOCAL, PUESTO 18/);
    assert.match(texto, /Distrito: CHILCA \/ CHILCA Teléfono y\/o celular: 911297919 \/ 927717337/);
    assert.match(texto, /Teléfono y\/o celular: 0642837832 - 911297919/);
    assert.match(texto, /Documento de ingreso: BOLETA DE PAGO/);
    assert.match(texto, /Antigüedad: 10 AÑOS/);
  });

  test('trae las casillas del negocio, la pregunta del titular, los ingresos de consumo y la fecha de corte en el historial', async () => {
    const texto = await textoDe(renderizarFicha({ visita: { ...visitaBase, plantilla: 'CONSUMO_V1' }, e: expedienteConsumo, plantilla: 'CONSUMO_V1', huella: 'abc' }));
    assert.match(texto, /En funcionamiento: \[X\] Inoperativo: \[ \] De terceros: \[ \]/);
    assert.match(texto, /¿Titular administra el negocio\?: SI \(X\) NO \( \)/);
    assert.match(texto, /SUELDO DEPENDIENTE TITULAR S\/ 2500\.00 DEPENDIENTE/);
    assert.match(texto, /SALDO DE CAPITAL AL 01-10-2026/);
  });

  test('si la base solo trajo la evaluación tipo MYPE, la imprime en vez de dejar la tabla vacía', async () => {
    const e = { ...expedienteConsumo, evaluacion_financiera: { moneda: 'PEN', ingresos: [{ descripcion: 'VENTA DE CLAVOS', frecuencia: 4, total_ventas: 1200 }] } };
    const texto = await textoDe(renderizarFicha({ visita: { ...visitaBase, plantilla: 'CONSUMO_V1' }, e, plantilla: 'CONSUMO_V1', huella: 'abc' }));
    assert.match(texto, /DÍAS BUENOS/);
    assert.match(texto, /VENTA DE CLAVOS/);
  });
});

describe('ficha Word — MYPE', () => {
  const expedienteMype = {
    ...expedienteConsumo, tipo_credito: 'OTROS',
    datos_negocio: { ...expedienteConsumo.datos_negocio, antiguedad_texto: '9 AÑOS', antiguedad_meses: 108 },
    evaluacion_financiera: { moneda: 'USD', ingresos: [], reevaluacion: null, anterior: null },
  };
  const visitaMype = { ...visitaBase, plantilla: 'MYPE_V1', propiedad_local: 'PROPIO', conformidad_financiera: { ingresos: { conforme: true }, balance: { conforme: false, comentario: 'Existencias menores' }, resultados: { conforme: true } } };

  test('antigüedad como la trae la base, moneda del balance y la observación del auditor', async () => {
    const texto = await textoDe(renderizarFicha({ visita: visitaMype, e: expedienteMype, plantilla: 'MYPE_V1', huella: 'abc' }));
    assert.match(texto, /Antigüedad del negocio: 9 AÑOS/);
    assert.match(texto, /BALANCE GENERAL EXPRESADO EN DÓLARES/);
    assert.match(texto, /OBSERVADO — Existencias menores/);
    assert.match(texto, /Propiedad de local: Propio/);
  });

  test('sin texto de antigüedad se usan los meses calculados', async () => {
    const e = { ...expedienteMype, datos_negocio: { ...expedienteMype.datos_negocio, antiguedad_texto: null } };
    const texto = await textoDe(renderizarFicha({ visita: visitaMype, e, plantilla: 'MYPE_V1', huella: 'abc' }));
    assert.match(texto, /Antigüedad del negocio: 108 meses/);
  });
});

describe('ficha Word — tablas que no se parten', () => {
  // Word solo mantiene una fila pegada a la siguiente si sus párrafos llevan «keepNext»: todas las filas menos la última, y el título de la sección.
  test('cada tabla va pegada a su título y la última fila no arrastra a lo que sigue', async () => {
    const buffer = await Packer.toBuffer(renderizarFicha({ visita: { ...visitaBase, plantilla: 'CONSUMO_V1' }, e: expedienteConsumo, plantilla: 'CONSUMO_V1', huella: 'abc' }));
    const xml = await (await JSZip.loadAsync(buffer)).file('word/document.xml').async('string');
    const tablas = xml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/g);
    assert.ok(tablas.length >= 8, 'se esperaban las tablas de la ficha');
    for (const tbl of tablas) {
      const filas = tbl.match(/<w:tr[ >][\s\S]*?<\/w:tr>/g);
      assert.ok(filas.every((f) => f.includes('<w:cantSplit')), 'una fila no debe partirse');
      filas.forEach((fila, i) => {
        const parrafos = fila.match(/<w:p[ >][\s\S]*?<\/w:p>/g);
        const pegados = parrafos.filter((pa) => pa.includes('<w:keepNext')).length;
        assert.equal(pegados, i < filas.length - 1 ? parrafos.length : 0, `fila ${i + 1} de ${filas.length}: debe ${i < filas.length - 1 ? '' : 'no '}ir pegada a la siguiente`);
      });
    }
    // el título azul de cada sección se queda con lo que sigue
    const titulos = xml.match(/<w:p[ >](?:(?!<\/w:p>)[\s\S])*?<w:shd [^>]*w:fill="[0-9A-Fa-f]{6}"[\s\S]*?<\/w:p>/g).filter((pa) => /OTROS CLIENTES|CUESTIONARIO|ENDEUDAMIENTO/.test(pa));
    assert.ok(titulos.length >= 3 && titulos.every((pa) => pa.includes('<w:keepNext')));
  });
});
