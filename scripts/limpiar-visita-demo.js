// Deshace UNA visita de prueba en la base a la que apunte DATABASE_URL (pensado para la demo).
// Uso:   node scripts/limpiar-visita-demo.js --codigo CH-HYO-208            (solo muestra qué haría)
//        node scripts/limpiar-visita-demo.js --codigo CH-HYO-208 --aplicar  (lo hace)
// Desde una PC lejos del servidor MySQL conviene esperar más al conectar: $env:DATABASE_CONNECT_TIMEOUT_MS = "15000".
//
// Qué hace con --aplicar, todo en una transacción:
//   · borra las evidencias y la visita del expediente;
//   · devuelve el expediente a ASIGNADO y su asignación a ACTIVA (el caso vuelve a la muestra del auditor).
// Protecciones: el expediente debe tener UNA sola visita y su comentario del auditor debe decir «PRUEBA QA».
// Lo demás (registro de auditoría de seguridad, historial del expediente) NO se toca: el rastro de lo ocurrido se conserva.
// Las fotos se guardan en el disco del servidor (storage/evidencias): este script solo las borra si están en la
// máquina donde se ejecuta; en la demo de Render quedan como archivos sin visita (no se ven en ninguna pantalla).
import fs from 'node:fs/promises';
import prisma from '#core/config/prisma.js';
import storageService from '#modules/sistema/storage.service.js';

const args = process.argv.slice(2);
const valor = (nombre) => { const i = args.indexOf(nombre); return i >= 0 ? args[i + 1] : undefined; };
const codigo = valor('--codigo');
const aplicar = args.includes('--aplicar');

function salir(mensaje, codigoSalida = 1) { console.error(mensaje); process.exit(codigoSalida); }

if (!codigo) salir('Falta --codigo con el código del expediente (ej. --codigo CH-HYO-208).');

const expediente = await prisma.expediente.findUnique({ where: { codigo_expediente: codigo }, include: { visitas: { include: { evidencias: true } }, asignaciones: true } });
if (!expediente) salir(`No existe el expediente ${codigo} en esta base.`);
if (expediente.visitas.length !== 1) salir(`El expediente ${codigo} tiene ${expediente.visitas.length} visitas; este script solo deshace un caso con exactamente una.`);
const visita = expediente.visitas[0];
if (!/PRUEBA QA/i.test(visita.comentario_auditor || '')) {
  salir(`La visita ${visita.id_visita} de ${codigo} no está marcada como prueba (su comentario del auditor no dice «PRUEBA QA»). No se toca.`);
}
const asignacion = expediente.asignaciones.find((a) => a.id_asignacion === visita.id_asignacion);

console.log(`Base: ${new URL(process.env.DATABASE_URL || 'mysql://desconocida').host}`);
console.log(`Expediente ${codigo} (${expediente.nombres_cliente}), estado ${expediente.estado}`);
console.log(`Visita ${visita.id_visita}: ${visita.resultado}, comentario «${visita.comentario_auditor}», ${visita.evidencias.length} evidencia(s)`);
console.log(`Asignación ${asignacion ? `${asignacion.id_asignacion} (${asignacion.estado})` : 'no encontrada'}`);
if (!aplicar) { console.log('\nNo se cambió nada. Para deshacerla, repite el comando con --aplicar.'); await prisma.$disconnect(); process.exit(0); }

await prisma.$transaction(async (tx) => {
  await tx.evidencia.deleteMany({ where: { id_visita: visita.id_visita } });
  await tx.visitaAuditoria.delete({ where: { id_visita: visita.id_visita } });
  await tx.expediente.update({ where: { id_expediente: expediente.id_expediente }, data: { estado: 'ASIGNADO' } });
  if (asignacion) await tx.asignacionAuditoria.update({ where: { id_asignacion: asignacion.id_asignacion }, data: { estado: 'ACTIVA', fecha_fin: null } });
}, { maxWait: 30000, timeout: 120000 }); // desde una PC lejos del servidor cada sentencia tarda más; el límite por defecto (5 s) cancelaba la transacción

let archivos = 0;
for (const e of visita.evidencias) {
  try { await fs.unlink(storageService.absolutePath(e.object_key)); archivos += 1; } catch { /* la foto no está en esta máquina */ }
}
console.log(`\nListo: visita ${visita.id_visita} y sus evidencias borradas; ${codigo} volvió a ASIGNADO${asignacion ? ' y su asignación a ACTIVA' : ''}.`);
console.log(archivos ? `${archivos} foto(s) borradas de este disco.` : 'Las fotos no estaban en este disco (si es la demo de Render, quedan en su disco del servidor, sin visita asociada).');
await prisma.$disconnect();
