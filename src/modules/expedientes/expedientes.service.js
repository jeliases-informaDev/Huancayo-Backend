import prisma from '#core/config/prisma.js';

function serialize(value) { return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'object' && item?.constructor?.name === 'Decimal' ? Number(item) : item)); }

const listSelect = {
  id_expediente: true, codigo_expediente: true, tipo_credito: true, oficina: true,
  numero_documento_cliente: true, nombres_cliente: true, distrito: true, provincia: true, departamento: true,
  latitud: true, longitud: true, asesor_responsable: true, monto_desembolso: true, moneda: true,
  estado: true, fecha_creacion: true,
};

async function listar({ page = 1, limit = 25, search, estado, distrito, departamento, tipo_credito } = {}) {
  const where = {
    ...(estado ? { estado } : {}),
    ...(distrito ? { distrito: { contains: distrito } } : {}),
    ...(departamento ? { departamento: { contains: departamento } } : {}),
    ...(tipo_credito ? { tipo_credito } : {}),
    ...(search ? {
      OR: [
        { codigo_expediente: { contains: search } },
        { nombres_cliente: { contains: search } },
        { numero_documento_cliente: { contains: search } },
        { asesor_responsable: { contains: search } },
      ],
    } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.expediente.findMany({ where, select: listSelect, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.expediente.count({ where }),
  ]);
  return { data: serialize(data), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function obtener(id) {
  const expediente = await prisma.expediente.findUnique({ where: { id_expediente: id } });
  if (!expediente) { const error = new Error('Expediente no encontrado'); error.statusCode = 404; throw error; }
  return serialize(expediente);
}

async function crear(datos) {
  const expediente = await prisma.expediente.create({ data: datos });
  return serialize(expediente);
}

async function actualizar(id, datos) {
  const expediente = await prisma.expediente.update({ where: { id_expediente: id }, data: datos });
  return serialize(expediente);
}

async function eliminar(id) {
  await prisma.expediente.delete({ where: { id_expediente: id } });
}

// Importación por Excel: procesamiento síncrono (lotes moderados). Se registra en
// ImportacionMasiva para trazabilidad, aunque no corre en background en esta fase.
const REQUIRED_COLUMNS = ['codigo_expediente', 'tipo_credito', 'numero_documento_cliente', 'nombres_cliente', 'asesor_responsable'];

async function importarExcel(rows, actorId, archivo) {
  const importacion = await prisma.importacionMasiva.create({
    data: { tipo: 'EXPEDIENTES', estado: 'PROCESANDO', archivo, ruta_temporal: '', actor_id: actorId, total_filas: rows.length, fecha_inicio: new Date() },
  });
  let insertadas = 0, actualizadas = 0, omitidas = 0, errores = 0;
  const detalleError = [];
  for (const [index, row] of rows.entries()) {
    try {
      const faltantes = REQUIRED_COLUMNS.filter(column => !row[column]);
      if (faltantes.length) { omitidas++; detalleError.push({ fila: index + 2, error: `Faltan columnas: ${faltantes.join(', ')}` }); continue; }
      const data = {
        codigo_expediente: String(row.codigo_expediente).trim(),
        tipo_credito: String(row.tipo_credito).trim().toUpperCase() === 'OTROS' ? 'OTROS' : 'CONSUMO',
        oficina: row.oficina ? String(row.oficina).trim() : null,
        tipo_documento_cliente: ['DNI', 'CE', 'PASAPORTE', 'RUC'].includes(String(row.tipo_documento_cliente).toUpperCase()) ? String(row.tipo_documento_cliente).toUpperCase() : 'DNI',
        numero_documento_cliente: String(row.numero_documento_cliente).trim(),
        nombres_cliente: String(row.nombres_cliente).trim(),
        telefono_cliente: row.telefono_cliente ? String(row.telefono_cliente).trim() : null,
        direccion_domicilio: row.direccion_domicilio ? String(row.direccion_domicilio).trim() : null,
        distrito: row.distrito ? String(row.distrito).trim() : null,
        provincia: row.provincia ? String(row.provincia).trim() : null,
        departamento: row.departamento ? String(row.departamento).trim() : null,
        latitud: row.latitud !== undefined && row.latitud !== '' ? Number(row.latitud) : null,
        longitud: row.longitud !== undefined && row.longitud !== '' ? Number(row.longitud) : null,
        asesor_responsable: String(row.asesor_responsable).trim(),
        monto_desembolso: row.monto_desembolso !== undefined && row.monto_desembolso !== '' ? Number(row.monto_desembolso) : null,
        moneda: row.moneda ? String(row.moneda).trim() : 'PEN',
      };
      const existing = await prisma.expediente.findUnique({ where: { codigo_expediente: data.codigo_expediente } });
      if (existing) { await prisma.expediente.update({ where: { id_expediente: existing.id_expediente }, data }); actualizadas++; }
      else { await prisma.expediente.create({ data }); insertadas++; }
    } catch (error) {
      errores++; detalleError.push({ fila: index + 2, error: error.message?.slice(0, 200) });
    }
  }
  await prisma.importacionMasiva.update({
    where: { id_importacion: importacion.id_importacion },
    data: { estado: 'COMPLETADO', procesadas: rows.length, insertadas, actualizadas, omitidas, errores, detalle_error: detalleError.slice(0, 100), fecha_fin: new Date() },
  });
  return { id_importacion: importacion.id_importacion, total_filas: rows.length, insertadas, actualizadas, omitidas, errores, detalle_error: detalleError.slice(0, 20) };
}

export default { listar, obtener, crear, actualizar, eliminar, importarExcel };
