import fs from 'node:fs/promises';
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, ImageRun, WidthType } from 'docx';
import prisma from '#core/config/prisma.js';
import storageService from '#modules/sistema/storage.service.js';

const TABLE_WIDTH_DXA = 9000;
const LABEL_WIDTH_DXA = 2700;
const VALUE_WIDTH_DXA = TABLE_WIDTH_DXA - LABEL_WIDTH_DXA;

function fila(label, value) {
  return new TableRow({
    children: [
      new TableCell({ width: { size: LABEL_WIDTH_DXA, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }),
      new TableCell({ width: { size: VALUE_WIDTH_DXA, type: WidthType.DXA }, children: [new Paragraph(String(value ?? '-'))] }),
    ],
  });
}

function tabla(rows) {
  return new Table({ width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA }, columnWidths: [LABEL_WIDTH_DXA, VALUE_WIDTH_DXA], rows });
}

const ETIQUETAS_CUESTIONARIO = {
  donde_realiza_pagos: '¿Dónde realiza sus pagos?',
  conyuge_conoce_prestamo: '¿Cónyuge tiene conocimiento del préstamo?',
  entrego_dinero_asesor: '¿Alguna vez entregó dinero al asesor por alguna razón?',
  creditos_paralelos: '¿Tiene créditos paralelos?',
  pago_comision_adicional: '¿Pagó alguna comisión adicional por el desembolso?',
  recibio_monto_total: '¿Recibió el total del monto solicitado?',
  comparte_dinero_credito: '¿Comparte el dinero del crédito con otra persona?',
  titular_administra_negocio: '¿Titular administra el negocio?',
  tiene_microseguro: '¿Tiene microseguro?',
  recibio_info_microseguro: '¿Recibió información antes de comprar el microseguro?',
  conforme_microseguro: '¿Está conforme con el microseguro?',
  comentario_microseguro: 'Comentario sobre microseguro',
};

async function generarWordVisita(idVisita) {
  const visita = await prisma.visitaAuditoria.findUnique({
    where: { id_visita: idVisita },
    include: { expediente: true, auditor: true, evidencias: true },
  });
  if (!visita) throw Object.assign(new Error('Visita no encontrada'), { statusCode: 404 });

  const respuestas = visita.respuestas_cuestionario || {};
  const children = [
    new Paragraph({ text: 'FICHA DE ENTREVISTA — AUDITORÍA DE VISITA', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `Caja Huancayo${visita.expediente.oficina ? ' — ' + visita.expediente.oficina : ''}` }),
    tabla([
      fila('N° de expediente', visita.expediente.codigo_expediente),
      fila('Tipo de crédito', visita.expediente.tipo_credito),
      fila('Cliente', visita.expediente.nombres_cliente),
      fila('Documento', `${visita.expediente.tipo_documento_cliente} ${visita.expediente.numero_documento_cliente}`),
      fila('Dirección', visita.expediente.direccion_domicilio),
      fila('Distrito / Provincia', `${visita.expediente.distrito || ''} / ${visita.expediente.provincia || ''}`),
      fila('Asesor responsable', visita.expediente.asesor_responsable),
      fila('Auditor', `${visita.auditor.nombres || ''} ${visita.auditor.apellidos || ''} (${visita.auditor.username})`.trim()),
      fila('Fecha y hora de visita', visita.fecha_hora_checkin.toISOString()),
      fila('Coordenadas registradas', `${visita.latitud}, ${visita.longitud} (±${visita.precision_metros ?? '?'} m)`),
      fila('Distancia al domicilio registrado', visita.distancia_domicilio_m != null ? `${Number(visita.distancia_domicilio_m).toFixed(0)} m` : 'N/D'),
      fila('Resultado', visita.resultado),
    ]),
    new Paragraph({ text: 'Cuestionario al cliente', heading: HeadingLevel.HEADING_2 }),
    tabla(Object.entries(respuestas).map(([key, value]) => fila(
      ETIQUETAS_CUESTIONARIO[key] || key,
      typeof value === 'boolean' ? (value ? 'SI' : 'NO') : (value ?? '-'),
    ))),
    new Paragraph({ text: 'Comentario del negocio', heading: HeadingLevel.HEADING_2 }),
    new Paragraph(visita.comentario_negocio || '-'),
    new Paragraph({ text: 'Comentarios finales del auditor', heading: HeadingLevel.HEADING_2 }),
    new Paragraph(visita.comentario_auditor || '-'),
  ];

  if (visita.evidencias.length) {
    children.push(new Paragraph({ text: 'Evidencia fotográfica', heading: HeadingLevel.HEADING_2 }));
    for (const evidencia of visita.evidencias) {
      try {
        const buffer = await fs.readFile(storageService.absolutePath(evidencia.object_key));
        children.push(new Paragraph({ children: [new ImageRun({ data: buffer, type: 'jpg', transformation: { width: 400, height: 300 } })] }));
        children.push(new Paragraph({ text: `${evidencia.tipo} — capturada ${evidencia.capturado_en.toISOString()}` }));
      } catch {
        children.push(new Paragraph(`(No se pudo cargar la evidencia ${evidencia.tipo})`));
      }
    }
  }

  const documento = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBuffer(documento);
}

export default { generarWordVisita };
