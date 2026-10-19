import crypto from 'node:crypto';
import { Packer } from 'docx';
import prisma from '#core/config/prisma.js';
import { publica as empresaPublica } from '#modules/empresas/empresas.service.js';
import { renderizarFicha } from './ficha-word.js';

// Ficha de entrevista en Word de una visita cerrada. El armado del documento está en ficha-word.js (sin base de datos);
// aquí solo se reúnen los datos: la visita con su auditor, el snapshot del expediente, el archivo de origen y la empresa.

const serializar = (valor) => JSON.parse(JSON.stringify(valor, (_k, item) => (typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)));

function huellaDeFicha(visita, e) {
  return crypto.createHash('sha256').update(JSON.stringify({
    id: visita.id_visita, exp: e.codigo_expediente, base: e.hash_origen ?? null, resultado: visita.resultado, checkin: visita.fecha_hora_checkin,
    lat: visita.latitud, lng: visita.longitud, cuestionario: visita.respuestas_cuestionario, negocio: visita.estado_negocio,
    local: visita.propiedad_local, conformidad: visita.conformidad_financiera, comentario: visita.comentario_auditor,
  })).digest('hex').slice(0, 32);
}

async function generarWordVisita(idVisita) {
  const visita = await prisma.visitaAuditoria.findUnique({
    where: { id_visita: idVisita },
    include: { expediente: true, auditor: true },
  });
  if (!visita) throw Object.assign(new Error('Visita no encontrada'), { statusCode: 404 });

  const e = visita.expediente_snapshot || serializar(visita.expediente);
  const plantilla = visita.plantilla || (e.tipo_credito === 'OTROS' ? 'MYPE_V1' : 'CONSUMO_V1');
  const idImportacion = e.id_importacion || visita.expediente.id_importacion;
  const importacion = idImportacion
    ? await prisma.importacionMasiva.findUnique({ where: { id_importacion: idImportacion }, select: { archivo: true, fecha_creacion: true, archivo_sha256: true } })
    : null;
  const huella = huellaDeFicha(visita, e);
  const empresa = await empresaPublica(); // la ficha lleva el nombre de la empresa de la petición

  return Packer.toBuffer(renderizarFicha({ visita, e, plantilla, empresa, importacion, huella }));
}

export default { generarWordVisita };
