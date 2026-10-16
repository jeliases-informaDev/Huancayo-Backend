import fs from 'node:fs/promises';
import ExcelJS from 'exceljs';
import prisma from '#core/config/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';
import { esFormatoCore, FORMATO_CORE, mapearFilaCore } from './formato-core.js';

// Importación de expedientes por Excel, pensada para cargas reales (miles de filas).
//  · El archivo se lee por flujo (no se carga entero en memoria) y se procesa por lotes.
//  · Corre en segundo plano: el POST responde de inmediato y el panel consulta el avance.
//  · "Validar sin guardar" (simular) hace todo el análisis y devuelve el reporte sin escribir nada.
//  · Solo una importación a la vez (evita dos cargas pisándose).
// Reglas de trazabilidad:
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
const TIPO_REAL = 'EXPEDIENTES';
const TIPO_SIMULACION = 'EXPEDIENTES_SIM';
const LOTE = 200;
const MAX_DETALLE = 500;
const MAX_CAMBIOS_POR_EXPEDIENTE = 150;

let importacionEnCurso = null;

// ---------- utilidades ----------
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

// Valor de una celda de ExcelJS: primitivo, fecha, texto enriquecido o resultado cacheado de una fórmula.
function valorCelda(cell) {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) return cell;
  if (typeof cell === 'object') {
    if (Array.isArray(cell.richText)) return cell.richText.map((part) => part.text).join('');
    if (cell.text !== undefined) return cell.text;
    if (cell.result !== undefined) return cell.result;
  }
  return cell;
}

const vacia = (fila) => Object.values(fila).every((v) => v === '' || v === null || v === undefined);

async function precargarExistentes(codigos) {
  const mapa = new Map();
  for (let i = 0; i < codigos.length; i += 500) {
    const filas = await prisma.expediente.findMany({ where: { codigo_expediente: { in: codigos.slice(i, i + 500) } } });
    filas.forEach((f) => mapa.set(f.codigo_expediente, f));
  }
  return mapa;
}

function metaDe(ctx, fila, huella, advertencias) {
  return { id_importacion: ctx.idImportacion, fila_origen: fila, hash_origen: huella, advertencias_origen: advertencias.length ? advertencias : Prisma.DbNull };
}

// ---------- creación por lote ----------
async function crearNuevos(nuevos, ctx) {
  if (!nuevos.length) return;
  const registrarAvisos = (n) => { if (n.advertencias.length) ctx.registrar({ ...n.base, resultado: 'CREADO', advertencias: n.advertencias, campos_danados: n.camposDanados }); };
  if (ctx.simular) { nuevos.forEach((n) => { ctx.insertadas += 1; registrarAvisos(n); }); return; }

  const datos = nuevos.map((n) => ({ ...n.data, autoasignable: ctx.autoasignable }));
  let creadas = nuevos;
  try {
    await prisma.expediente.createMany({ data: datos });
  } catch {
    // Algún registro del lote es inválido: se insertan uno por uno para aislar el culpable.
    creadas = [];
    for (const [i, n] of nuevos.entries()) {
      try { await prisma.expediente.create({ data: datos[i] }); creadas.push(n); }
      catch (e) { ctx.errores += 1; ctx.registrar({ ...n.base, resultado: 'ERROR', motivo: String(e.message || e).split('\n').pop().slice(0, 200) }); }
    }
  }
  if (!creadas.length) return;
  const ids = await prisma.expediente.findMany({ where: { codigo_expediente: { in: creadas.map((n) => n.data.codigo_expediente) } }, select: { id_expediente: true, codigo_expediente: true } });
  const idPorCodigo = new Map(ids.map((r) => [r.codigo_expediente, r.id_expediente]));
  await prisma.expedienteCambio.createMany({
    data: creadas.map((n) => ({ id_expediente: idPorCodigo.get(n.data.codigo_expediente), id_importacion: ctx.idImportacion, actor_id: ctx.actorId, tipo: 'CREADO', cambios: { origen: { archivo: ctx.archivo, hoja: n.base.hoja, fila: n.base.fila } } })).filter((c) => c.id_expediente),
  });
  ctx.insertadas += creadas.length;
  creadas.forEach(registrarAvisos);
}

// ---------- lote formato core ----------
async function procesarLoteCore({ hoja, filas, numeros }, ctx) {
  const mapeadas = filas.map((fila, i) => ({ numeroFila: numeros[i], resultado: mapearFilaCore(fila, { hoja }) }));
  const existentes = await precargarExistentes(mapeadas.map((m) => m.resultado.expediente?.codigo_expediente).filter(Boolean));
  const nuevos = [];

  for (const { numeroFila, resultado } of mapeadas) {
    const { expediente, advertencias, error, huella, camposDanados } = resultado;
    const base = { hoja, fila: numeroFila, codigo: expediente?.codigo_expediente ?? null };
    try {
      if (error) { ctx.errores += 1; ctx.registrar({ ...base, resultado: 'ERROR', motivo: error }); continue; }
      if (ctx.vistos.has(expediente.codigo_expediente)) { ctx.omitidas += 1; ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: 'DUPLICADO_EN_ARCHIVO' }); continue; }
      ctx.vistos.add(expediente.codigo_expediente);
      advertencias.forEach((a) => { ctx.advertencias[a] = (ctx.advertencias[a] || 0) + 1; });

      const existente = existentes.get(expediente.codigo_expediente);
      const datos = { ...expediente, ...metaDe(ctx, numeroFila, huella, advertencias) };

      if (!existente) { nuevos.push({ base, data: datos, advertencias, camposDanados }); continue; }

      if (ESTADOS_CONGELADOS.has(existente.estado)) {
        ctx.omitidas += 1;
        ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: existente.hash_origen === huella ? 'SIN_CAMBIOS' : 'YA_AUDITADO_NO_SE_MODIFICA' });
        continue;
      }
      if (existente.hash_origen === huella) { ctx.sinCambios += 1; continue; }

      // Ubicación fijada por una persona (panel o primera visita): la base no la pisa.
      if (['MANUAL', 'PRIMERA_VISITA'].includes(existente.ubicacion_origen) || (existente.latitud != null && expediente.latitud == null)) {
        datos.latitud = existente.latitud; datos.longitud = existente.longitud; datos.ubicacion_origen = existente.ubicacion_origen;
      }
      const cambios = calcularCambios(existente, datos);
      if (!ctx.simular) {
        await prisma.expediente.update({ where: { id_expediente: existente.id_expediente }, data: datos });
        if (Object.keys(cambios).length) {
          await prisma.expedienteCambio.create({ data: { id_expediente: existente.id_expediente, id_importacion: ctx.idImportacion, actor_id: ctx.actorId, tipo: 'ACTUALIZADO', cambios } });
        }
      }
      ctx.actualizadas += 1;
      if (advertencias.length) ctx.registrar({ ...base, resultado: 'ACTUALIZADO', advertencias, campos_danados: camposDanados });
    } catch (e) {
      ctx.errores += 1;
      ctx.registrar({ ...base, resultado: 'ERROR', motivo: String(e.message || e).slice(0, 200) });
    }
  }
  await crearNuevos(nuevos, ctx);
}

// ---------- lote formato simple (plantilla de demostración) ----------
const REQUIRED_COLUMNS = ['codigo_expediente', 'tipo_credito', 'numero_documento_cliente', 'nombres_cliente', 'asesor_responsable'];

async function procesarLoteSimple({ hoja, filas, numeros }, ctx) {
  for (const [index, row] of filas.entries()) {
    const numeroFila = numeros[index];
    const base = { hoja, fila: numeroFila, codigo: row.codigo_expediente ? String(row.codigo_expediente).trim() : null };
    try {
      const faltantes = REQUIRED_COLUMNS.filter((column) => !row[column]);
      if (faltantes.length) { ctx.omitidas += 1; ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: `Faltan columnas: ${faltantes.join(', ')}` }); continue; }
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
        id_importacion: ctx.idImportacion, fila_origen: numeroFila,
      };
      const existente = await prisma.expediente.findUnique({ where: { codigo_expediente: data.codigo_expediente } });
      if (existente) {
        if (ESTADOS_CONGELADOS.has(existente.estado)) { ctx.omitidas += 1; ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: 'YA_AUDITADO_NO_SE_MODIFICA' }); continue; }
        const cambios = calcularCambios(existente, data);
        if (!ctx.simular) {
          await prisma.expediente.update({ where: { id_expediente: existente.id_expediente }, data });
          if (Object.keys(cambios).length) await prisma.expedienteCambio.create({ data: { id_expediente: existente.id_expediente, id_importacion: ctx.idImportacion, actor_id: ctx.actorId, tipo: 'ACTUALIZADO', cambios } });
        }
        ctx.actualizadas += 1;
      } else {
        if (!ctx.simular) {
          const creado = await prisma.expediente.create({ data: { ...data, autoasignable: ctx.autoasignable } });
          await prisma.expedienteCambio.create({ data: { id_expediente: creado.id_expediente, id_importacion: ctx.idImportacion, actor_id: ctx.actorId, tipo: 'CREADO', cambios: { origen: { archivo: ctx.archivo, hoja, fila: numeroFila } } } });
        }
        ctx.insertadas += 1;
      }
    } catch (e) {
      ctx.errores += 1;
      ctx.registrar({ ...base, resultado: 'ERROR', motivo: String(e.message || e).slice(0, 200) });
    }
  }
}

// ---------- ejecución en segundo plano ----------
async function guardarAvance(ctx, extra = {}) {
  await prisma.importacionMasiva.update({
    where: { id_importacion: ctx.idImportacion },
    data: { procesadas: ctx.procesadas, total_filas: ctx.procesadas, insertadas: ctx.insertadas, actualizadas: ctx.actualizadas, omitidas: ctx.omitidas + ctx.sinCambios, errores: ctx.errores, ...extra },
  });
}

// Procesa las filas de una hoja (iterable de { number, values }) por lotes.
async function procesarHoja(nombre, filasHoja, ctx) {
  let encabezados = null;
  let ignorar = false;
  let filas = [];
  let numeros = [];
  const vaciarLote = async () => {
    if (!filas.length) return;
    const lote = { hoja: nombre, filas, numeros };
    filas = []; numeros = [];
    if (esFormatoCore(encabezados)) { ctx.formato = FORMATO_CORE; await procesarLoteCore(lote, ctx); } else { ctx.formato ||= 'SIMPLE'; await procesarLoteSimple(lote, ctx); }
    ctx.procesadas += lote.filas.length;
    await guardarAvance(ctx);
  };
  for await (const fila of filasHoja) {
    if (fila.number === 1) {
      encabezados = fila.values.slice(1).map((h) => String(valorCelda(h)).trim());
      // Hojas de instrucciones u otras sin columnas de un formato conocido: se ignoran (y se deja constancia).
      if (!esFormatoCore(encabezados) && !encabezados.includes('codigo_expediente')) {
        ignorar = true;
        ctx.registrar({ hoja: nombre, resultado: 'HOJA_IGNORADA', motivo: 'No tiene las columnas de ningún formato conocido' });
      }
      continue;
    }
    if (!encabezados || ignorar) continue;
    const objeto = {};
    encabezados.forEach((h, i) => { if (h) objeto[h] = valorCelda(fila.values[i + 1]); });
    if (vacia(objeto)) continue;
    filas.push(objeto); numeros.push(fila.number);
    if (filas.length >= LOTE) await vaciarLote();
  }
  await vaciarLote();
}

// Lectura por flujo (poca memoria). Algunos .xlsx (los que guardan sus partes en otro orden) no
// se pueden leer así: en ese caso, y solo si todavía no se procesó nada, se carga el libro completo.
async function leerArchivo(ctx, ruta) {
  try {
    const lector = new ExcelJS.stream.xlsx.WorkbookReader(ruta, { sharedStrings: 'cache', hyperlinks: 'ignore', styles: 'ignore', worksheets: 'emit' });
    for await (const hoja of lector) await procesarHoja(hoja.name, hoja, ctx);
  } catch (error) {
    if (ctx.procesadas > 0) throw error;
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.readFile(ruta);
    for (const hoja of libro.worksheets) {
      const filas = [];
      hoja.eachRow((row, number) => filas.push({ number, values: row.values }));
      await procesarHoja(hoja.name, filas, ctx);
    }
  }
}

async function ejecutar(ctx, ruta) {
  try {
    await leerArchivo(ctx, ruta);
    if (!ctx.procesadas) ctx.registrar({ resultado: 'ERROR', motivo: 'El archivo no tiene filas de datos.' });
    await guardarAvance(ctx, { estado: ctx.procesadas ? 'COMPLETADO' : 'ERROR', formato: ctx.formato, detalle_error: ctx.detalle, advertencias: ctx.advertencias, fecha_fin: new Date() });
  } catch (error) {
    ctx.registrar({ resultado: 'ERROR', motivo: `No se pudo leer el archivo: ${String(error.message || error).slice(0, 200)}` });
    await guardarAvance(ctx, { estado: 'ERROR', formato: ctx.formato, detalle_error: ctx.detalle, advertencias: ctx.advertencias, fecha_fin: new Date() }).catch(() => {});
  } finally {
    // El archivo trae datos personales de clientes: no debe quedar en el disco del servidor.
    await fs.rm(ruta, { force: true }).catch(() => {});
    importacionEnCurso = null;
  }
}

/**
 * Registra la importación y la procesa en segundo plano. Responde de inmediato.
 * El archivo (ruta) pasa a ser responsabilidad de este módulo: se borra al terminar.
 */
async function iniciarImportacion({ ruta, actorId, archivo, archivoSha256, simular = false, autoasignable = false }) {
  if (importacionEnCurso) {
    throw Object.assign(new Error('Ya hay una importación en curso. Espera a que termine para iniciar otra.'), { statusCode: 409, code: 'IMPORT_IN_PROGRESS' });
  }
  const repetido = archivoSha256
    ? await prisma.importacionMasiva.findFirst({
        where: { archivo_sha256: archivoSha256, estado: 'COMPLETADO', tipo: TIPO_REAL }, orderBy: { fecha_creacion: 'desc' },
        select: { id_importacion: true, archivo: true, fecha_creacion: true },
      })
    : null;
  const importacion = await prisma.importacionMasiva.create({
    data: { tipo: simular ? TIPO_SIMULACION : TIPO_REAL, estado: 'PROCESANDO', archivo, ruta_temporal: '', actor_id: actorId, fecha_inicio: new Date(), archivo_sha256: archivoSha256 || null },
  });
  importacionEnCurso = importacion.id_importacion;
  const detalle = [];
  const ctx = {
    idImportacion: importacion.id_importacion, actorId, archivo, simular, autoasignable, formato: null,
    procesadas: 0, insertadas: 0, actualizadas: 0, sinCambios: 0, omitidas: 0, errores: 0, advertencias: {}, vistos: new Set(), detalle,
    registrar(item) { if (detalle.length < MAX_DETALLE) detalle.push(item); },
  };
  ejecutar(ctx, ruta).catch(() => { importacionEnCurso = null; });
  return { id_importacion: importacion.id_importacion, estado: 'PROCESANDO', simulacion: simular, archivo_repetido: repetido };
}

// Al arrancar el servidor: lo que quedó "procesando" por un reinicio no va a terminar nunca.
async function marcarInterrumpidas() {
  const r = await prisma.importacionMasiva.updateMany({ where: { estado: 'PROCESANDO' }, data: { estado: 'INTERRUMPIDA', fecha_fin: new Date() } });
  return r.count;
}

// ---------- consulta ----------
async function listarImportaciones({ page = 1, limit = 20 } = {}) {
  const where = { tipo: { in: [TIPO_REAL, TIPO_SIMULACION] } };
  const [data, total] = await Promise.all([
    prisma.importacionMasiva.findMany({
      where, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit,
      select: { id_importacion: true, tipo: true, archivo: true, formato: true, estado: true, total_filas: true, insertadas: true, actualizadas: true, omitidas: true, errores: true, advertencias: true, actor_id: true, archivo_sha256: true, fecha_creacion: true, fecha_fin: true },
    }),
    prisma.importacionMasiva.count({ where }),
  ]);
  const actores = [...new Set(data.map((d) => d.actor_id).filter(Boolean))];
  const usuarios = actores.length ? await prisma.usuario.findMany({ where: { id_usuario: { in: actores } }, select: { id_usuario: true, username: true } }) : [];
  const nombre = new Map(usuarios.map((u) => [u.id_usuario, u.username]));
  return { data: data.map(({ tipo, ...d }) => ({ ...d, simulacion: tipo === TIPO_SIMULACION, actor: nombre.get(d.actor_id) || null })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function obtenerImportacion(id) {
  const importacion = await prisma.importacionMasiva.findUnique({ where: { id_importacion: id } });
  if (!importacion) throw Object.assign(new Error('Importación no encontrada'), { statusCode: 404 });
  const { ruta_temporal: _ruta, tipo, ...resto } = importacion;
  return { ...resto, simulacion: tipo === TIPO_SIMULACION };
}

// Libera para autoasignación los expedientes (aún pendientes) de una carga.
async function liberarImportacion(id) {
  const r = await prisma.expediente.updateMany({ where: { id_importacion: id, estado: 'PENDIENTE', autoasignable: false }, data: { autoasignable: true } });
  return { liberados: r.count };
}

export default { iniciarImportacion, marcarInterrumpidas, listarImportaciones, obtenerImportacion, liberarImportacion, calcularCambios };
