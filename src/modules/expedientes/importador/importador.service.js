import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import ExcelJS from 'exceljs';
import prisma from '#core/config/prisma.js';
import { conEmpresa, empresaActual } from '#core/tenant/contexto.js';
import { reglas as reglasEmpresa } from '#modules/empresas/empresas.service.js';
import { Prisma } from '../../../generated/prisma/index.js';
import { esFormatoCore, FORMATO_CORE, mapearFilaCore } from './formato-core.js';
import { validarFilaSimple } from './formato-simple.js';
import { conservarUbicacionesNegocio } from '../ubicaciones.js';
import { SIN_SUGERENCIA } from '../../geocodificacion/direcciones.js';

// Importación de expedientes por Excel, pensada para cargas reales (miles de filas).
//  · El archivo se lee por flujo (no se carga entero en memoria) y se procesa por lotes.
//  · Corre en segundo plano: el POST responde de inmediato y el panel consulta el avance.
//  · "Validar sin guardar" (simular) hace todo el análisis y devuelve el reporte sin escribir nada.
//  · TODO O NADA: si el archivo trae aunque sea una fila con error no se guarda ninguna fila (ni las válidas). Lo garantiza el servidor: antes de
//    escribir, una importación real revisa el archivo completo; si algo falla queda registrada como BLOQUEADA, con la lista de lo que hay que corregir.
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
// Detalle que se guarda en la importación: los problemas (hasta 2 000 líneas; el total de filas con error se cuenta siempre completo) y, aparte,
// las filas omitidas o con aviso (hasta 500). Lo que se corta se avisa en pantalla y en el reporte, no se oculta.
export const MAX_ERRORES_DETALLE = 2000;
const MAX_DETALLE = 500;
const MAX_CAMBIOS_POR_EXPEDIENTE = 150;
// Mientras corre, el estado sigue siendo PROCESANDO (los clientes que consultan el avance esperan a que deje de serlo). En qué va se dice aparte, en `fase`:
// REVISANDO (mirando todo el archivo antes de guardar) o GUARDANDO. Vive en memoria, igual que «solo una carga a la vez».
const ENCURSO = ['PROCESANDO'];

let importacionEnCurso = null;
let faseEnCurso = null;

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
// Un bloque que el archivo no trae (la plantilla simple no tiene fichas) no se compara: al guardar tampoco se toca.
function calcularCambios(actual, nuevo) {
  const cambios = {};
  for (const campo of ESCALARES) {
    const antes = comparable(actual[campo]);
    const despues = comparable(nuevo[campo]);
    if (String(antes) !== String(despues)) cambios[campo] = { antes, despues };
  }
  for (const bloque of BLOQUES) {
    if (nuevo[bloque] === undefined) continue;
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

const huellaDe = (objeto) => crypto.createHash('sha256').update(JSON.stringify(objeto)).digest('hex');

// ---------- el contexto de una pasada (contadores y detalle) ----------
// Un problema siempre sale con campo, qué pasa y qué corregir. Los que vienen sin eso (un fallo inesperado al guardar) se redactan aquí.
function problemaCompleto(item) {
  const problema = item.problema || item.motivo || 'Fila no válida';
  return {
    ...item, motivo: problema, problema,
    campo: item.campo || (item.fila ? 'Fila' : 'Archivo'),
    corregir: item.corregir || (item.fila ? 'Revisa los datos de esta fila y vuelve a validar el archivo.' : 'Revisa el archivo y vuelve a validarlo.'),
  };
}

function crearCtx({ idImportacion, actorId, archivo, simular, autoasignable, formatosPermitidos }) {
  const errores = [];
  const otros = [];
  return {
    idImportacion, actorId, archivo, simular, autoasignable, formatosPermitidos, formato: null,
    procesadas: 0, insertadas: 0, actualizadas: 0, sinCambios: 0, omitidas: 0, errores: 0, advertencias: {}, vistos: new Set(),
    detalleErrores: errores, detalleOtros: otros,
    registrar(item) {
      if (item.resultado === 'ERROR') { if (errores.length < MAX_ERRORES_DETALLE) errores.push(problemaCompleto(item)); } else if (otros.length < MAX_DETALLE) otros.push(item);
    },
    // Una fila con varios problemas cuenta como UNA fila con error, pero deja una línea por problema.
    filaConError(base, problemas) { this.errores += 1; problemas.forEach((p) => this.registrar({ ...base, resultado: 'ERROR', ...p })); },
  };
}
const detalleDe = (ctx) => [...ctx.detalleErrores, ...ctx.detalleOtros];

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
      catch (e) { ctx.filaConError(n.base, [{ problema: 'No se pudo guardar esta fila', detalle_tecnico: String(e.message || e).split('\n').pop().slice(0, 200) }]); }
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

// Qué hacer con la ubicación de un expediente que ya existe cuando el archivo trae otra versión. Ubicación fijada por una persona (panel o primera visita):
// la base no la pisa. La que puso el mapa (GEOCODIFICADA) solo se conserva mientras la dirección siga siendo la misma; si cambió, se descarta y la
// dirección vuelve a la cola. Lo que se averiguó de una dirección que no cambió (sugerencia del mapa, verificación) también se conserva.
function aplicarReglasDeUbicacion(existente, datos, expedienteNuevo) {
  const direccionCambio = existente.direccion_normalizada !== datos.direccion_normalizada;
  if (existente.ubicacion_origen === 'GEOCODIFICADA' && direccionCambio && expedienteNuevo.latitud == null) {
    datos.latitud = null; datos.longitud = null; datos.ubicacion_origen = null;
  } else if (['MANUAL', 'PRIMERA_VISITA', 'GEOCODIFICADA'].includes(existente.ubicacion_origen) || (existente.latitud != null && expedienteNuevo.latitud == null)) {
    datos.latitud = existente.latitud; datos.longitud = existente.longitud; datos.ubicacion_origen = existente.ubicacion_origen;
  }
  if (direccionCambio) Object.assign(datos, SIN_SUGERENCIA);
  else delete datos.geo_estado;
}

// Lo que pasa con una fila válida cuyo expediente ya existe: se omite, no cambia, o se actualiza (deja el antes/después). Devuelve true si la fila quedó resuelta.
async function actualizarExistente({ existente, datos, expediente, huella, base, advertencias, camposDanados }, ctx) {
  if (ESTADOS_CONGELADOS.has(existente.estado)) {
    ctx.omitidas += 1;
    ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: existente.hash_origen === huella ? 'SIN_CAMBIOS' : 'YA_AUDITADO_NO_SE_MODIFICA' });
    return;
  }
  if (existente.hash_origen === huella) { ctx.sinCambios += 1; return; }
  aplicarReglasDeUbicacion(existente, datos, expediente);
  // Lo mismo con la ubicación de los negocios (MYPE) que fijó una persona.
  if (datos.datos_negocio) datos.datos_negocio = conservarUbicacionesNegocio(existente.datos_negocio, datos.datos_negocio);
  const cambios = calcularCambios(existente, datos);
  if (!ctx.simular) {
    await prisma.expediente.update({ where: { id_expediente: existente.id_expediente }, data: datos });
    if (Object.keys(cambios).length) {
      await prisma.expedienteCambio.create({ data: { id_expediente: existente.id_expediente, id_importacion: ctx.idImportacion, actor_id: ctx.actorId, tipo: 'ACTUALIZADO', cambios } });
    }
  }
  ctx.actualizadas += 1;
  if (advertencias.length) ctx.registrar({ ...base, resultado: 'ACTUALIZADO', advertencias, campos_danados: camposDanados });
}

// ---------- lote formato core ----------
async function procesarLoteCore({ hoja, filas, numeros }, ctx) {
  const mapeadas = filas.map((fila, i) => ({ numeroFila: numeros[i], resultado: mapearFilaCore(fila, { hoja }) }));
  const existentes = await precargarExistentes(mapeadas.map((m) => m.resultado.expediente?.codigo_expediente).filter(Boolean));
  const nuevos = [];

  for (const { numeroFila, resultado } of mapeadas) {
    const { expediente, advertencias, error, errores, huella, camposDanados } = resultado;
    const base = { hoja, fila: numeroFila, codigo: expediente?.codigo_expediente ?? null };
    try {
      if (error) { ctx.filaConError(base, errores?.length ? errores : [{ problema: error }]); continue; }
      if (ctx.vistos.has(expediente.codigo_expediente)) { ctx.omitidas += 1; ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: 'DUPLICADO_EN_ARCHIVO' }); continue; }
      ctx.vistos.add(expediente.codigo_expediente);
      advertencias.forEach((a) => { ctx.advertencias[a] = (ctx.advertencias[a] || 0) + 1; });

      const existente = existentes.get(expediente.codigo_expediente);
      const datos = { ...expediente, ...metaDe(ctx, numeroFila, huella, advertencias) };
      if (!existente) { nuevos.push({ base, data: datos, advertencias, camposDanados }); continue; }
      await actualizarExistente({ existente, datos, expediente, huella, base, advertencias, camposDanados }, ctx);
    } catch (e) {
      ctx.filaConError(base, [{ problema: 'No se pudo guardar esta fila', detalle_tecnico: String(e.message || e).slice(0, 200) }]);
    }
  }
  await crearNuevos(nuevos, ctx);
}

// ---------- lote formato simple (plantilla de columnas mínimas) ----------
async function procesarLoteSimple({ hoja, filas, numeros }, ctx) {
  const revisadas = filas.map((fila, i) => ({ numeroFila: numeros[i], ...validarFilaSimple(fila) }));
  const existentes = await precargarExistentes(revisadas.filter((r) => r.data).map((r) => r.data.codigo_expediente));
  const nuevos = [];

  for (const r of revisadas) {
    const base = { hoja, fila: r.numeroFila, codigo: r.codigo };
    try {
      if (r.errores.length) { ctx.filaConError(base, r.errores); continue; }
      const { data, advertencias } = r;
      if (ctx.vistos.has(data.codigo_expediente)) { ctx.omitidas += 1; ctx.registrar({ ...base, resultado: 'OMITIDA', motivo: 'DUPLICADO_EN_ARCHIVO' }); continue; }
      ctx.vistos.add(data.codigo_expediente);
      advertencias.forEach((a) => { ctx.advertencias[a] = (ctx.advertencias[a] || 0) + 1; });

      const huella = huellaDe(data);
      const datos = { ...data, ...metaDe(ctx, r.numeroFila, huella, advertencias) };
      const existente = existentes.get(data.codigo_expediente);
      if (!existente) { nuevos.push({ base, data: datos, advertencias, camposDanados: [] }); continue; }
      await actualizarExistente({ existente, datos, expediente: data, huella, base, advertencias, camposDanados: [] }, ctx);
    } catch (e) {
      ctx.filaConError(base, [{ problema: 'No se pudo guardar esta fila', detalle_tecnico: String(e.message || e).slice(0, 200) }]);
    }
  }
  await crearNuevos(nuevos, ctx);
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
    if (esFormatoCore(encabezados)) { ctx.formato = FORMATO_CORE; await procesarLoteCore(lote, ctx); } else { ctx.formato = 'SIMPLE'; await procesarLoteSimple(lote, ctx); }
    ctx.procesadas += lote.filas.length;
    await guardarAvance(ctx);
  };
  for await (const fila of filasHoja) {
    if (fila.number === 1) {
      encabezados = fila.values.slice(1).map((h) => String(valorCelda(h)).trim());
      // Hojas de instrucciones u otras sin columnas de un formato conocido: se ignoran (y se deja constancia).
      const formatoHoja = esFormatoCore(encabezados) ? FORMATO_CORE : encabezados.includes('codigo_expediente') ? 'SIMPLE' : null;
      if (!formatoHoja) {
        ignorar = true;
        ctx.registrar({ hoja: nombre, resultado: 'HOJA_IGNORADA', motivo: 'No tiene las columnas de ningún formato conocido' });
      } else if (ctx.formatosPermitidos && !ctx.formatosPermitidos.includes(formatoHoja)) {
        // La empresa no acepta este formato: no se mezcla la base de un cliente con la plantilla de otro.
        ignorar = true;
        ctx.registrar({ hoja: nombre, resultado: 'HOJA_IGNORADA', motivo: `La empresa no acepta el formato ${formatoHoja} (acepta: ${ctx.formatosPermitidos.join(', ')})` });
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

// Un archivo que no es un .xlsx real (o está dañado) falla con un texto técnico en inglés; se traduce a algo que el usuario pueda actuar.
function motivoDeLectura(error) {
  const texto = String(error?.message || error);
  if (/zip|central directory|corrupt|not a valid|invalid|unexpected token/i.test(texto)) {
    return 'El archivo no es un Excel (.xlsx) válido o está dañado. Ábrelo en Excel, guárdalo como «Libro de Excel (.xlsx)» y vuelve a subirlo.';
  }
  return `No se pudo leer el archivo: ${texto.slice(0, 200)}`;
}

const SIN_FILAS = { resultado: 'ERROR', campo: 'Archivo', problema: 'El archivo no tiene filas de datos', corregir: 'Revisa que la primera hoja tenga los encabezados en la fila 1 y los datos desde la fila 2.' };

async function ejecutar(ctx, ruta) {
  let actual = ctx;
  try {
    if (!ctx.simular) {
      // TODO O NADA. Primero se revisa el archivo completo sin escribir nada (con su propio contexto, en modo «simular»). Si hay una sola fila con
      // error, o no hay filas, no se guarda nada: la importación queda BLOQUEADA y con la lista de lo que hay que corregir.
      faseEnCurso = 'REVISANDO';
      const prueba = crearCtx({ ...ctx, simular: true });
      actual = prueba;
      await leerArchivo(prueba, ruta);
      if (!prueba.procesadas) { prueba.errores += 1; prueba.registrar(SIN_FILAS); }
      if (prueba.errores > 0) {
        prueba.insertadas = 0; prueba.actualizadas = 0; // lo que «habría» creado no cuenta: no se creó nada
        await guardarAvance(prueba, { estado: 'BLOQUEADA', formato: prueba.formato, detalle_error: detalleDe(prueba), advertencias: prueba.advertencias, fecha_fin: new Date() });
        return;
      }
      actual = ctx;
      faseEnCurso = 'GUARDANDO';
    }
    await leerArchivo(ctx, ruta);
    if (!ctx.procesadas) { ctx.errores += 1; ctx.registrar(SIN_FILAS); }
    await guardarAvance(ctx, { estado: ctx.procesadas ? 'COMPLETADO' : 'ERROR', formato: ctx.formato, detalle_error: detalleDe(ctx), advertencias: ctx.advertencias, fecha_fin: new Date() });
  } catch (error) {
    actual.registrar({ resultado: 'ERROR', campo: 'Archivo', problema: motivoDeLectura(error), corregir: 'Corrige el archivo y vuelve a validarlo.' });
    await guardarAvance(actual, { estado: 'ERROR', formato: actual.formato, detalle_error: detalleDe(actual), advertencias: actual.advertencias, fecha_fin: new Date() }).catch(() => {});
  } finally {
    // El archivo trae datos personales de clientes: no debe quedar en el disco del servidor.
    await fs.rm(ruta, { force: true }).catch(() => {});
    if (!ctx.simular) await superarValidaciones(ctx).catch(() => {});
    importacionEnCurso = null; faseEnCurso = null;
  }
}

// Al terminar una importación real, las validaciones previas del mismo archivo (mismo contenido, misma persona) dejan de aparecer en el historial:
// ya hay un registro que cuenta la historia completa (importada, o bloqueada y con qué errores).
async function superarValidaciones(ctx) {
  if (!ctx.archivoSha256) return;
  await prisma.importacionMasiva.updateMany({
    where: { tipo: TIPO_SIMULACION, estado: 'COMPLETADO', archivo_sha256: ctx.archivoSha256, actor_id: ctx.actorId, id_importacion: { not: ctx.idImportacion } },
    data: { estado: 'SUPERADA' },
  });
}

/**
 * Registra la importación y la procesa en segundo plano. Responde de inmediato.
 * El archivo (ruta) pasa a ser responsabilidad de este módulo: se borra al terminar.
 */
async function iniciarImportacion({ ruta, actorId, archivo, archivoSha256, simular = false, autoasignable = true }) {
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
  faseEnCurso = 'REVISANDO';
  const ctx = crearCtx({ idImportacion: importacion.id_importacion, actorId, archivo, simular, autoasignable, formatosPermitidos: (await reglasEmpresa()).formatos_importacion });
  ctx.archivoSha256 = archivoSha256 || null;
  const empresaId = empresaActual();
  conEmpresa(empresaId, () => ejecutar(ctx, ruta)).catch(() => { importacionEnCurso = null; faseEnCurso = null; });
  return { id_importacion: importacion.id_importacion, estado: 'PROCESANDO', simulacion: simular, archivo_repetido: repetido };
}

// Al arrancar el servidor: lo que quedó "procesando" por un reinicio no va a terminar nunca.
async function marcarInterrumpidas() {
  const r = await prisma.importacionMasiva.updateMany({ where: { estado: { in: ENCURSO } }, data: { estado: 'INTERRUMPIDA', fecha_fin: new Date() } });
  return r.count;
}

// ---------- consulta ----------
// Cómo se llama en pantalla lo que pasó con una carga: IMPORTADA, CON_ERRORES (no se guardó nada), VALIDADA (revisada sin guardar), ERROR (no se pudo leer),
// INTERRUMPIDA o EN_PROCESO. Una carga real con filas guardadas cuenta como importada aunque traiga errores de cargas antiguas (antes se importaba lo válido).
export function resultadoDeCarga({ simulacion, estado, errores = 0, insertadas = 0, actualizadas = 0 }) {
  if (ENCURSO.includes(estado)) return 'EN_PROCESO';
  if (estado === 'INTERRUMPIDA') return 'INTERRUMPIDA';
  if (estado === 'BLOQUEADA') return 'CON_ERRORES';
  if (estado === 'ERROR') return 'ERROR';
  if (simulacion) return errores > 0 ? 'CON_ERRORES' : 'VALIDADA';
  return errores > 0 && insertadas + actualizadas === 0 ? 'CON_ERRORES' : 'IMPORTADA';
}

async function nombresDe(ids) {
  const actores = [...new Set(ids.filter(Boolean))];
  const usuarios = actores.length ? await prisma.usuario.findMany({ where: { id_usuario: { in: actores } }, select: { id_usuario: true, username: true, nombres: true, apellidos: true } }) : [];
  return new Map(usuarios.map((u) => [u.id_usuario, [u.nombres, u.apellidos].filter(Boolean).join(' ').trim() || u.username]));
}

async function listarImportaciones({ page = 1, limit = 20 } = {}) {
  const where = { tipo: { in: [TIPO_REAL, TIPO_SIMULACION] }, estado: { not: 'SUPERADA' } };
  const [data, total] = await Promise.all([
    prisma.importacionMasiva.findMany({
      where, orderBy: { fecha_creacion: 'desc' }, skip: (page - 1) * limit, take: limit,
      select: { id_importacion: true, tipo: true, archivo: true, formato: true, estado: true, total_filas: true, insertadas: true, actualizadas: true, omitidas: true, errores: true, advertencias: true, actor_id: true, archivo_sha256: true, fecha_creacion: true, fecha_fin: true },
    }),
    prisma.importacionMasiva.count({ where }),
  ]);
  const nombre = await nombresDe(data.map((d) => d.actor_id));
  return {
    data: data.map(({ tipo, ...d }) => {
      const simulacion = tipo === TIPO_SIMULACION;
      return { ...d, simulacion, actor: nombre.get(d.actor_id) || null, resultado: resultadoDeCarga({ simulacion, ...d }) };
    }),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// Filas con error que están listadas (una fila con varios problemas cuenta una vez) frente al total que se contó.
const filasListadas = (detalle) => new Set((detalle || []).filter((d) => d.resultado === 'ERROR' && d.fila != null).map((d) => `${d.hoja}|${d.fila}`)).size;

async function obtenerImportacion(id) {
  const importacion = await prisma.importacionMasiva.findUnique({ where: { id_importacion: id } });
  if (!importacion) throw Object.assign(new Error('Importación no encontrada'), { statusCode: 404 });
  const { ruta_temporal: _ruta, tipo, ...resto } = importacion;
  const simulacion = tipo === TIPO_SIMULACION;
  const actor = (await nombresDe([importacion.actor_id])).get(importacion.actor_id) || null;
  const detalle = Array.isArray(importacion.detalle_error) ? importacion.detalle_error : [];
  const listadas = filasListadas(detalle);
  return {
    ...resto, simulacion, actor, resultado: resultadoDeCarga({ simulacion, ...importacion }), fase: importacionEnCurso === id ? faseEnCurso : null,
    // Si hay más filas con error que líneas guardadas, la pantalla y el reporte lo dicen.
    errores_listados: listadas, errores_truncados: importacion.errores > listadas && detalle.some((d) => d.resultado === 'ERROR' && d.fila != null),
  };
}

// Reporte de errores de una carga, listo para abrir en Excel: una línea por problema, con la fila del archivo, el campo y qué corregir.
const COLUMNAS_REPORTE = ['Hoja', 'Fila del archivo', 'Crédito', 'Campo', 'Problema', 'Qué corregir'];
async function reporteDeErrores(id) {
  const imp = await obtenerImportacion(id);
  const filas = (imp.detalle_error || []).filter((d) => d.resultado === 'ERROR').map((d) => [d.hoja ?? '', d.fila ?? '', d.codigo ?? '', d.campo ?? '', d.problema ?? d.motivo ?? '', d.corregir ?? '']);
  const nota = imp.errores_truncados ? `Se listan las primeras ${imp.errores_listados.toLocaleString('es-PE')} de ${imp.errores.toLocaleString('es-PE')} filas con error; corrige estas y vuelve a validar el archivo para ver las demás.` : null;
  return { archivo: imp.archivo, columnas: COLUMNAS_REPORTE, filas, nota };
}

// Libera para autoasignación los expedientes (aún pendientes) de una carga.
async function liberarImportacion(id) {
  const r = await prisma.expediente.updateMany({ where: { id_importacion: id, estado: 'PENDIENTE', autoasignable: false }, data: { autoasignable: true } });
  return { liberados: r.count };
}

export default { iniciarImportacion, marcarInterrumpidas, listarImportaciones, obtenerImportacion, reporteDeErrores, liberarImportacion, calcularCambios };
