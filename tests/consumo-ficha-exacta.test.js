import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Packer } from 'docx';
import JSZip from 'jszip';
import { COLUMNAS_CONSUMO_BANCO } from '../src/modules/expedientes/importador/columnas-consumo.js';
import { mapearFilaCore } from '../src/modules/expedientes/importador/formato-core.js';
import { renderizarFicha } from '../src/modules/reportes/ficha-word.js';

// Prueba exacta de la ficha Word de Consumo con «valores de rastreo»: cada columna de la base lleva un valor distinto y reconocible (todo inventado, sin datos de clientes),
// y se comprueba que cada dato sale bajo la etiqueta de la ficha del banco y que las tablas traen sus columnas en el orden del banco, celda por celda.

const ENTEROS = new Set(['cEdad', 'nNumCuoApr', 'nNroEnt', 'nNumCuoApr1', 'nNumCuoApr2', 'nNumCuoApr3', 'nNumCuoApr4']);
const TELEFONOS = new Set(['cTelFijCli', 'cTelPerCli', 'cTelEmp1', 'cTelEmp2']);
const dmy = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

/** La fila de la base de Consumo con un valor distinto por columna, con el formato que cada una pide. */
function filaDeRastreo() {
  const fila = {};
  COLUMNAS_CONSUMO_BANCO.forEach((col, idx) => {
    if (/^d[A-Z]/.test(col)) fila[col] = dmy(new Date(1995, 0, 1 + idx * 41));
    else if (ENTEROS.has(col)) fila[col] = String(100 + idx);
    else if (TELEFONOS.has(col)) fila[col] = String(70000000 + idx);
    else if (col === 'cDocIde') fila[col] = String(71000000 + idx);
    else if (/^n[A-Z]/.test(col)) fila[col] = `${100 + ((idx * 3) % 800)}.${10 + ((idx * 7) % 89)}`;
    else if (col === 'cDesCorMon' || /^cMoneda[1-4]$/.test(col)) fila[col] = 'S/';
    else if (col === 'cCuoDiaMasAtr' || /^cCuoMasAtr[1-4]$/.test(col)) fila[col] = `0${(idx % 90) + 10} - ${(idx % 80) + 10} día(s)`;
    else fila[col] = `Z${col.toUpperCase()}`;
  });
  return fila;
}

const normalizar = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
const entidades = (t) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

/** Tablas del document.xml de Word: tablas → filas → celdas (texto). */
function tablasDeWord(xml) {
  const textoDe = (frag) => entidades([...frag.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(' ')).replace(/\s+/g, ' ').trim();
  return [...xml.matchAll(/<w:tbl>([\s\S]*?)<\/w:tbl>/g)].map((t) => [...t[1].matchAll(/<w:tr[ >][\s\S]*?<\/w:tr>/g)].map((tr) => [...tr[0].matchAll(/<w:tc>([\s\S]*?)<\/w:tc>/g)].map((tc) => textoDe(tc[1]))));
}

const visita = {
  id_visita: 7, fecha_hora_checkin: '2026-10-28T15:00:00.000Z', server_received_at: '2026-10-28T15:00:05.000Z', resultado: 'CONFORME',
  auditor: { nombres: 'Ana', apellidos: 'Prueba', username: 'ana' }, mock_location: false, device_integrity_ok: true, firmante_documento: '12345678',
  respuestas_cuestionario: {}, estado_negocio: 'EN_FUNCIONAMIENTO', plantilla: 'CONSUMO_V1',
};

async function tablasDeLaFicha(e) {
  const documento = renderizarFicha({ visita, e, plantilla: 'CONSUMO_V1', empresa: { nombre_corto: 'Caja Prueba' }, huella: 'abc', generadaEl: new Date('2026-10-28T20:00:00-05:00') });
  const zip = await JSZip.loadAsync(await Packer.toBuffer(documento));
  return tablasDeWord(await zip.file('word/document.xml').async('string'));
}

/** Lo que la ficha debe mostrar de la fila de rastreo; devuelve una lista con cada dato que no salió como el banco lo pide. */
function comprobar(fila, tablas) {
  const t = (c) => fila[c];
  const celdas = tablas.flat(2).map(normalizar);
  const fallos = [];
  const SEP = ' / ';

  // 1) Datos con etiqueta («Etiqueta: valor»), tal como la ficha impresa del banco los pone.
  const PARES = [
    ['Fecha de Nac.', t('dFecNacCli')], ['Edad', t('cEdad')], ['Actividad', t('cDesActivi')], ['Nombres y apellidos', t('cNomCliente')],
    ['Estado civil', t('cDesEstCiv')], ['DNI', t('cDocIde')], ['Antigüedad', t('cAspExpAct')],
    ['Dirección del domicilio', t('cDirDomCli')], ['Dirección del empleador', t('cDirEmp1') + SEP + t('cDirEmp2')],
    ['Distrito', t('cDisDom')], ['Provincia', t('cNomProvCli')], ['Referencia', t('cRefEmp1') + SEP + t('cRefEmp2')],
    ['Referencia del domicilio', t('cRefDomCli')], ['Empleador', t('cNomEmp1') + SEP + t('cNomEmp2')], ['Distrito', t('cDisNeg1') + SEP + t('cDisNeg2')],
    ['Tipo de vivienda', t('cConDomCli')], ['N.º de suministro', t('cSuministr')], ['Documento de ingreso', t('SustIngres')],
    ['Teléfono y/o celular', `${t('cTelFijCli')} - ${t('cTelPerCli')}`], ['Teléfono y/o celular', `${t('cTelEmp1')}${SEP}${t('cTelEmp2')}`],
    ['Asesor solicitud', t('cNomAseOri')], ['Cónyuge', t('cNomConyug')], ['Nivel aprobador', `${t('NomAprobador')} - ${t('cCarPerApr')}`], ['Aval', t('cFiadores')],
    ['Producto', t('cDesProdu')], ['Rep. legal', t('cRepresent')], ['Fecha de vencimiento', t('dFecVenci')], ['Estado', t('cDesCorEst')],
    ['Monto de la cuota', t('nMonCuota')], ['Fecha últ. pago', t('dFecUltPag')], ['Destino', t('cDestin')], ['Asesor responsable a la fecha', t('cNomAseAct')],
    ['Calificación SBS', t('cCalSbs')], ['N.º de entidades', t('nNroEnt')], ['N.º de expediente', t('cCodExpCli')], ['Fuente', `ANA/${t('cFuente')}`],
    ['AGENCIA/OF. ESP.', t('cOficin')],
  ];
  for (const [etiqueta, valor] of PARES) {
    if (!celdas.some((c) => c.includes(`${normalizar(etiqueta)}: ${normalizar(valor)}`))) fallos.push(`«${etiqueta}» no muestra el valor de su columna (esperaba «${etiqueta}: ${valor}»)`);
  }

  // 2) Tablas: cada fila trae las columnas en el orden de la ficha del banco, cada una con su dato exacto.
  const FILAS = {
    'historial: crédito vigente': [t('cCodLinCre'), t('cDesCreTip'), t('dFecDesCre'), t('nCapDes'), 'S/', t('cCodSolCre'), t('cCodCtaCre'), t('nNumCuoApr'), t('nMonCuota'), t('cDesCorta'), t('nSalCapSol'), t('cNomAseAct'), t('cCuoDiaMasAtr')],
  };
  for (let k = 1; k <= 4; k += 1) {
    FILAS[`historial: crédito anterior ${k}`] = [t(`cLinCre${k}`), t(`cTipCredit${k}`), t(`dFecDesemb${k}`), t(`nMonDesemb${k}`), 'S/', t(`cSolCre${k}`), t(`cCodCtaCre${k}`), t(`nNumCuoApr${k}`), t(`nMontCuota${k}`), t(`cCondContab${k}`), t(`nSalCap${k}`), t(`cNomAsesor${k}`), t(`cCuoMasAtr${k}`)];
  }
  for (let n = 1; n <= 3; n += 1) {
    FILAS[`ingreso ${n}`] = [t(`cDesConsum${n}`), t(`cRelaci${n}`), t(['cMoneda12', 'cMoneda23', 'cMoneda34'][n - 1]), t(`nMonIngDeu${n}`), t(`cTipIng${n}`)];
  }
  for (let n = 1; n <= 5; n += 1) {
    FILAS[`deuda del cliente ${n}`] = [t(`cNomIfi${n}`), t(`nSaldo${n}`), t(`cCalEmpDes${n}`), t(`cDesTipCre${n}`)];
    FILAS[`deuda del cónyuge ${n}`] = [t(`cNomIfiConyu${n}`), t(`nSalConyu${n}`), t(`cCalEmpConyu${n}`), t(`cTipCreConyu${n}`)];
  }
  for (const [nombre, esperado] of Object.entries(FILAS)) {
    const buscada = esperado.map(normalizar);
    if (tablas.flat().some((fila2) => fila2.length === buscada.length && fila2.every((c, i) => normalizar(c) === buscada[i]))) continue;
    // La fila con más celdas iguales dice cuál columna falla.
    let mejor = { ok: -1, fila: null };
    for (const fila2 of tablas.flat()) {
      if (fila2.length !== buscada.length) continue;
      const ok = fila2.filter((c, i) => normalizar(c) === buscada[i]).length;
      if (ok > mejor.ok) mejor = { ok, fila: fila2 };
    }
    const malas = mejor.fila ? buscada.map((b, i) => (normalizar(mejor.fila[i]) === b ? null : i + 1)).filter(Boolean) : [];
    fallos.push(`tabla «${nombre}»: ${mejor.fila ? `columnas que no coinciden: ${malas.join(', ')}` : 'no se encontró una fila con ese número de columnas'}`);
  }

  // 3) El saldo del historial lleva la fecha del día en que se genera la ficha.
  if (!celdas.some((c) => c === 'SALDO DE CAPITAL AL 28-10-2026')) fallos.push('el encabezado del saldo no lleva la fecha del día de generación');
  return fallos;
}

describe('Consumo del banco — la ficha Word muestra cada dato de su columna', () => {
  const fila = filaDeRastreo();
  const expediente = () => JSON.parse(JSON.stringify(mapearFilaCore(fila, { hoja: 'CONSUMO' }).expediente));

  test('con un valor distinto por columna, cada dato sale bajo su etiqueta y las tablas en el orden del banco', async () => {
    assert.equal(mapearFilaCore(fila, { hoja: 'CONSUMO' }).error, undefined);
    assert.deepEqual(comprobar(fila, await tablasDeLaFicha(expediente())), []);
  });

  test('la prueba no es vacía: detecta un dato en la etiqueta equivocada y una columna cambiada de lugar en una tabla', async () => {
    const e = expediente();
    e.datos_credito.destino = 'OTRO DESTINO';
    [e.datos_credito.historial[1].plazo_cuotas, e.datos_credito.historial[1].cuota] = [e.datos_credito.historial[1].cuota, e.datos_credito.historial[1].plazo_cuotas];
    const fallos = comprobar(fila, await tablasDeLaFicha(e));
    assert.ok(fallos.some((f) => f.startsWith('«Destino»')), fallos.join('\n'));
    assert.ok(fallos.some((f) => f.includes('crédito anterior 1') && f.includes('8, 9')), fallos.join('\n'));
  });
});
