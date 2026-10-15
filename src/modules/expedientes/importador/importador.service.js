import prisma from '#core/config/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';
import { esFormatoCore, FORMATO_CORE, mapearFilaCore } from './formato-core.js';

// Importación de expedientes por Excel. Reglas de trazabilidad:
//  · cada importación queda registrada (archivo, huella SHA-256, formato, resultados y avisos);
//  · cada expediente guarda de qué importación y fila viene, y la huella de su fila;
//  · reimportar la misma fila sin cambios no toca nada ("sin cambios");
//  · reimportar con cambios actualiza y deja el antes/después en expediente_cambios;
//  · un expediente ya visitado/cerrado NO se modifica (la ficha cerrada debe seguir igual);
//  · una ubicación fijada a mano o tomada en la primera visita no se pisa con la de la base.

const ESTADOS_CONGELADOS = new Set(['VISITADO', 'CERRADO']);
const BLOQUES = ['datos_cliente', 'datos_negocio', 'datos_credito', 'evaluacion_financiera', 'endeudamiento'];
const ESCALARES = [
  'tipo_credito', 'oficina', 'tipo_documento_cliente', 'numero_documento_cliente', 'nombres_cliente', 'telefono_cliente',
  'direccion_domicilio', 'distrito', 'provincia', 'departamento', 'latitud', 'longitud', 'ubicacion_origen',
  'asesor_responsable', 'monto_desembolso', 'moneda',
];
const MAX_DETALLE = 500;
const MAX_CAMBIOS_POR_EXPEDIENTE = 150;

function aplanar(valor, ruta = '', salida = {}) {
  if (Array.isArray(valor)) {
    if (!valor.length) salida[ruta] = '[]';
    valor.forEach((item, i) => aplanar(item, `${ruta}[${i}]`, salida));
  } else if (valor && typeof valor === 'object') {
    Object.entries(valor).forEach(([k, item]) => aplanar(item, ruta ? `${ruta}.${k}` : k, salida));
  } else {
    salida[ruta] = valor ?? null;
  }
  return salida;
}

const comparable = (valor) => (valor === undefined || valor === null ? null : typeof valor === 'object' ? Number(valor) : valor);

// Diferencias entre el expediente guardado y el que trae el archivo: { campo: { antes, despues } }.
function calcularCambios(actual, nuevo) {
  const cambios = {};
  for (const campo of ESCALARES) {
    const antes = comparable(actual[campo]);
    const despues = comparable(nuevo[campo]);
    if (String(antes) !== String(despues)) cambios[campo] = { antes, despues };
  }
  for (const bloque of BLOQUES) {
    const a = aplanar(actual[bloque] ?? {});
    const b = aplanar(nuevo[bloque] ?? {});
    for (const ruta of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (String(a[ruta] ?? null) !== String(b[ruta] ?? null)) cambios[`${bloque}.${ruta}`] = { antes: a[ruta] ?? null, despues: b[ruta] ?? null };
    }
  }
  const claves = Object.keys(cambios);
  if (claves.length > MAX_CAMBIOS_POR_EXPEDIENTE) {
    const recortado = Object.fromEntries(claves.slice(0, MAX_CAMBIOS_POR_EXPEDIENTE).map((k) => [k, cambios[k]]));
    recortado._truncado = { antes: null, despues: `${claves.length - MAX_CAMBIOS_POR_EXPEDIENTE} cambios más no listados` };
    return recortado;
  }
  return cambios;
}

function datosParaGuardar(expediente, meta) {
  return {
    ...expediente,
    id_importacion: meta.idImportacion, fila_origen: meta.fila, hash_origen: meta.huella,
    advertencias_origen: meta.advertencias.length ? meta.advertencias : Prisma.DbNull,
  };
}

async function precargarExistentes(codigos) {
  const mapa = new Map();
  for (let i = 0; i < codigos.length; i += 500) {
    const lote = codigos.slice(i, i + 500);
    const filas = await prisma.expediente.findMany({ where: { codigo_expediente: { in: lote } } });
    filas.forEach((f) => mapa.set(f.codigo_expediente, f));
  }
  return mapa;
}

async function procesarFilasCore(filas, hoja, contexto, numeros) {
  const mapeadas = filas.map((fila, i) => ({ numeroFila: numeros?.[i] ?? i + 2, resultado: mapearFilaCore(fila, { hoja }) }));
  const existentes = await precargarExistentes(mapeadas.map((m) => m.resultado.expediente?.codigo_expediente).filter(Boolean));
  const vistos = new Set();

  for (const { numeroFila, resultado } of mapeadas) {
    const { expediente, advertencias, error, huella, camposDanados } = resultado;
    const base = { hoja, fila: numeroFila, codigo: expediente?.codigo_expediente ?? null };
    try {
      if (error) { contexto.errores += 1; contexto.registrar({ ...base, resultado: 'ERROR', motivo: error }); continue; }
      if (vistos.has(expediente.codigo_expediente)) {
        contexto.omitidas += 1; contexto.registrar({ ...base, resultado: 'OMITIDA', motivo: 'DUPLICADO_EN_ARCHIVO' }); continue;
      }
      vistos.add(expediente.codigo_expediente);
      advertencias.forEach((a) => { contexto.advertencias[a] = (contexto.advertencias[a] || 0) + 1; });

      const meta = { idImportacion: contexto.idImportacion, fila: numeroFila, huella, advertencias };
      const existente = existentes.get(expediente.codigo_expediente);

      if (!existente) {
        const creado = await prisma.expediente.create({ data: datosParaGuardar(expediente, meta) });
        await prisma.expedienteCambio.create({
          data: { id_expediente: creado.id_expediente, id_importacion: contexto.idImportacion, actor_id: contexto.actorId, tipo: 'CREADO', cambios: { origen: { archivo: contexto.archivo, hoja, fila: numeroFila } } },
        });
        contexto.insertadas += 1;
        if (advertencias.length) contexto.registrar({ ...base, resultado: 'CREADO', advertencias, campos_danados: camposDanados });
        continue;
      }

      if (ESTADOS_CONGELADOS.has(existente.estado)) {
        contexto.omitidas += 1;
        contexto.registrar({ ...base, resultado: 'OMITIDA', motivo: existente.hash_origen === huella ? 'SIN_CAMBIOS' : 'YA_AUDITADO_NO_SE_MODIFICA' });
        continue;
      }
      if (existente.hash_origen === huella) { contexto.sinCambios += 1; continue; }

      const datos = datosParaGuardar(expediente, meta);
      // Ubicación fijada por una persona (panel o primera visita): la base no la pisa.
      if (['MANUAL', 'PRIMERA_VISITA'].includes(existente.ubicacion_origen) || (existente.latitud != null && expediente.latitud == null)) {
        datos.latitud = existente.latitud; datos.longitud = existente.longitud; datos.ubicacion_origen = existente.ubicacion_origen;
      }
      const cambios = calcularCambios(existente, datos);
      await prisma.expediente.update({ where: { id_expediente: existente.id_expediente }, data: datos });
      if (Object.keys(cambios).length) {
        await prisma.expedienteCambio.create({
          data: { id_expediente: existente.id_expediente, id_importacion: contexto.idImportacion, actor_id: contexto.actorId, tipo: 'ACTUALIZADO', cambios },
        });
      }
      contexto.actualizadas += 1;
      if (advertencias.length) contexto.registrar({ ...base, resultado: 'ACTUALIZADO', advertencias, campos_danados: camposDanados });
    } catch (e) {
      contexto.errores += 1;
      contexto.registrar({ ...base, resultado: 'ERROR', motivo: String(e.message || e).slice(0, 200) });
    }
  }
}

// --- Formato simple (plantilla de demostración con columnas legibles) ---
const REQUIRED_COLUMNS = ['codigo_expediente', 'tipo_credito', 'numero_documento_cliente', 'nombres_cliente', 'asesor_responsable'];

async function procesarFilasSimples(filas, hoja, contexto, numeros) {
  for (const [index, row] of filas.entries()) {
    const numeroFila = numeros?.[index] ?? index + 2;
    const base = { hoja, fila: numeroFila, codigo: row.codigo_expediente ? String(row.codigo_expediente).trim() : null };
    try {
      const faltantes = REQUIRED_COLUMNS.filter((column) => !row[column]);
      if (faltantes.length) { contexto.omitidas += 1; contexto.registrar({ ...base, resultado: 'OMITIDA', motivo: `Faltan columnas: ${faltantes.join(', ')}` }); continue; }
      const latitud = row.latitud !== undefined && row.latitud !== '' ? Number(row.latitud) : null;
      const longitud = row.longitud !== undefined && row.longitud !== '' ? Number(row.longitud) : null;
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
        latitud, longitud,
        ubicacion_origen: latitud != null && longitud != null ? 'REFERENCIA' : null,
        asesor_responsable: String(row.asesor_responsable).trim(),
        monto_desembolso: row.monto_desembolso !== undefined && row.monto_desembolso !== '' ? Number(row.monto_desembolso) : null,
        moneda: row.moneda ? String(row.moneda).trim() : 'PEN',
        id_importacion: contexto.idImportacion, fila_origen: numeroFila,
      };
      const existente = await prisma.expediente.findUnique({ where: { codigo_expediente: data.codigo_expediente } });
      if (existente) {
        if (ESTADOS_CONGELADOS.has(existente.estado)) { contexto.omitidas += 1; contexto.registrar({ ...base, resultado: 'OMITIDA', motivo: 'YA_AUDITADO_NO_SE_MODIFICA' }); continue; }
        const cambios = calcularCambios(existente, data);
        await prisma.expediente.update({ where: { id_expediente: existente.id_expediente }, data });
        if (Object.keys(cambios).length) await prisma.expedienteCambio.create({ data: { id_expediente: existente.id_expediente, id_importacion: contexto.idImportacion, actor_id: contexto.actorId, tipo: 'ACTUALIZADO', cambios } });
        contexto.actualizadas += 1;
      } else {
        const creado = await prisma.expediente.create({ data });
        await prisma.expedienteCambio.create({ data: { id_expediente: creado.id_expediente, id_importacion: contexto.idImportacion, actor_id: contexto.actorId, tipo: 'CREADO', cambios: { origen: { archivo: contexto.archivo, hoja, fila: numeroFila } } } });
        contexto.insertadas += 1;
      }
    } catch (e) {
      contexto.errores += 1;
      contexto.registrar({ ...base, resultado: 'ERROR', motivo: String(e.message || e).slice(0, 200) });
    }
  }
}

/**
 * @param {{ nombre: string, encabezados: string[], filas: object[] }[]} hojas
 */
async function importarHojas(hojas, { actorId, archivo, archivoSha256 }) {
  const totalFilas = hojas.reduce((suma, h) => suma + h.filas.length, 0);
  const formato = hojas.some((h) => esFormatoCore(h.encabezados)) ? FORMATO_CORE : 'SIMPLE';
  const importacion = await prisma.importacionMasiva.create({
    data: { tipo: 'EXPEDIENTES', estado: 'PROCESANDO', archivo, ruta_temporal: '', actor_id: actorId, total_filas: totalFilas, fecha_inicio: new Date(), archivo_sha256: archivoSha256 || null, formato },
  });
  const detalle = [];
  const contexto = {
    idImportacion: importacion.id_importacion, actorId, archivo,
    insertadas: 0, actualizadas: 0, sinCambios: 0, omitidas: 0, errores: 0, advertencias: {},
    registrar(item) { if (detalle.length < MAX_DETALLE) detalle.push(item); },
  };

  for (const hoja of hojas) {
    if (!hoja.filas.length) continue;
    if (esFormatoCore(hoja.encabezados)) await procesarFilasCore(hoja.filas, hoja.nombre, contexto, hoja.numeros);
    else await procesarFilasSimples(hoja.filas, hoja.nombre, contexto, hoja.numeros);
  }

  const resumen = {
    id_importacion: importacion.id_importacion, formato, archivo, total_filas: totalFilas,
    insertadas: contexto.insertadas, actualizadas: contexto.actualizadas, sin_cambios: contexto.sinCambios,
    omitidas: contexto.omitidas, errores: contexto.errores, advertencias: contexto.advertencias,
  };
  await prisma.importacionMasiva.update({
    where: { id_importacion: importacion.id_importacion },
    data: {
      estado: 'COMPLETADO', procesadas: totalFilas, insertadas: contexto.insertadas, actualizadas: contexto.actualizadas,
      omitidas: contexto.omitidas + contexto.sinCambios, errores: contexto.errores,
      detalle_error: detalle, advertencias: contexto.advertencias, fecha_fin: new Date(),
    },
  });
  return { ...resumen, detalle: detalle.slice(0, 60) };
}

async function listarImportaciones({ page = 1, limit = 20 } = {}) {
  const [data, total] = await Promise.all([
    prisma.importacionMasiva.findMany({
      where: { tipo: 'EXPEDIENTES' }, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit,
      select: { id_importacion: true, archivo: true, formato: true, estado: true, total_filas: true, insertadas: true, actualizadas: true, omitidas: true, errores: true, advertencias: true, actor_id: true, archivo_sha256: true, fecha_creacion: true, fecha_fin: true },
    }),
    prisma.importacionMasiva.count({ where: { tipo: 'EXPEDIENTES' } }),
  ]);
  const actores = [...new Set(data.map((d) => d.actor_id).filter(Boolean))];
  const usuarios = actores.length ? await prisma.usuario.findMany({ where: { id_usuario: { in: actores } }, select: { id_usuario: true, username: true } }) : [];
  const nombre = new Map(usuarios.map((u) => [u.id_usuario, u.username]));
  return { data: data.map((d) => ({ ...d, actor: nombre.get(d.actor_id) || null })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function obtenerImportacion(id) {
  const importacion = await prisma.importacionMasiva.findUnique({ where: { id_importacion: id } });
  if (!importacion) throw Object.assign(new Error('Importación no encontrada'), { statusCode: 404 });
  const { ruta_temporal: _ruta, ...resto } = importacion;
  return resto;
}

export default { importarHojas, listarImportaciones, obtenerImportacion, calcularCambios };
