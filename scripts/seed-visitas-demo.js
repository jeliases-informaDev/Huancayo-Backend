// Genera visitas completadas (con variedad real de resultados y señales) sobre
// asignaciones activas existentes, y cancela un par de asignaciones — para que la
// demo muestre el ciclo completo (no solo "clientes asignados sin trabajar todavía").
// Idempotente en la práctica: solo toca asignaciones que sigan ACTIVA.
import prisma from '#core/config/prisma.js';

// PNG transparente de 1x1 — placeholder de firma/evidencia visual (no hay fotos
// reales de campo en datos de demo, pero sí algo válido para que la UI renderice).
const FIRMA_DEMO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function jitterMetros(lat, lng, metros) {
  const dLat = (metros / 111320) * (Math.random() < 0.5 ? -1 : 1) * Math.random();
  const dLng = (metros / (111320 * Math.cos(lat * Math.PI / 180))) * (Math.random() < 0.5 ? -1 : 1) * Math.random();
  return { lat: lat + dLat, lng: lng + dLng };
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Patron ciclico de escenarios para que la muestra de visitas cubra los 4
// resultados posibles y las distintas senales (geocerca excedida, precision baja,
// dispositivo con observaciones) que se ven en Visitas/Seguridad.
const ESCENARIOS = [
  { resultado: 'CONFORME', distanciaM: 15, precision: 8, deviceOk: true, comentarioAuditor: null },
  { resultado: 'CONFORME', distanciaM: 30, precision: 12, deviceOk: true, comentarioAuditor: null },
  { resultado: 'CONFORME', distanciaM: 20, precision: 10, deviceOk: true, comentarioAuditor: null },
  { resultado: 'OBSERVADO', distanciaM: 620, precision: 18, deviceOk: true, comentarioAuditor: 'Cliente indica que se mudo hace dos meses a una direccion cercana; se realizo la entrevista en el nuevo domicilio.' },
  { resultado: 'CONFORME', distanciaM: 25, precision: 9, deviceOk: true, comentarioAuditor: null },
  { resultado: 'RECHAZADO', distanciaM: 40, precision: 15, deviceOk: false, comentarioAuditor: 'El dispositivo del auditor marco indicios de manipulacion (posible root). Se reprograma la visita con otro equipo.' },
  { resultado: 'CONFORME', distanciaM: 18, precision: 7, deviceOk: true, comentarioAuditor: null },
  { resultado: 'NO_UBICADO', distanciaM: 850, precision: 22, deviceOk: true, comentarioAuditor: 'No se ubico al cliente en la direccion registrada. Vecinos indican que el negocio cerro hace un mes.' },
  { resultado: 'CONFORME', distanciaM: 22, precision: 11, deviceOk: true, comentarioAuditor: null },
  { resultado: 'OBSERVADO', distanciaM: 45, precision: 130, deviceOk: true, comentarioAuditor: 'Precision GPS baja por interferencia dentro del local; se repite la validacion en la proxima visita.' },
];

function cuestionario(idx) {
  return {
    entrego_dinero_asesor: idx % 7 === 0,
    pago_comision_adicional: idx % 5 === 0,
    recibio_monto_total: idx % 6 !== 0,
    conyuge_conoce_prestamo: idx % 2 === 0,
    creditos_paralelos: idx % 4 === 0,
    comparte_dinero_credito: idx % 3 === 0,
    titular_administra_negocio: idx % 2 === 1,
    tiene_microseguro: idx % 3 === 1,
    donde_realiza_pagos: idx % 2 === 0 ? 'Agencia Caja Huancayo' : 'Agente autorizado',
  };
}

try {
  const activas = await prisma.asignacionAuditoria.findMany({
    where: { estado: 'ACTIVA' },
    include: { expediente: true },
    orderBy: { id_asignacion: 'asc' },
  });

  // Se completan ~2 de cada 3 asignaciones activas por auditor (deja trabajo
  // pendiente real tambien, no todo resuelto) — el resto de esa cola se
  // reserva y, de ahi, 3 se cancelan para mostrar tambien ese flujo.
  const porAuditor = new Map();
  for (const a of activas) {
    if (!porAuditor.has(a.id_usuario_auditor)) porAuditor.set(a.id_usuario_auditor, []);
    porAuditor.get(a.id_usuario_auditor).push(a);
  }

  const aVisitar = [];
  const reservaParaCancelar = [];
  for (const lista of porAuditor.values()) {
    const cantidadVisitar = Math.max(1, Math.ceil(lista.length * 0.65));
    aVisitar.push(...lista.slice(0, cantidadVisitar));
    reservaParaCancelar.push(...lista.slice(cantidadVisitar));
  }

  let creadas = 0;
  const ahora = Date.now();
  for (const [i, asignacion] of aVisitar.entries()) {
    const exp = asignacion.expediente;
    if (exp.latitud == null || exp.longitud == null) continue;
    const escenario = ESCENARIOS[i % ESCENARIOS.length];
    const baseLat = Number(exp.latitud), baseLng = Number(exp.longitud);
    const punto = jitterMetros(baseLat, baseLng, escenario.distanciaM);
    const distanciaReal = haversine(baseLat, baseLng, punto.lat, punto.lng);
    // Un par de casos, ademas, con mock_location detectado — puramente para
    // que la demo muestre como se ve una alerta de ubicacion simulada en
    // Visitas/Seguridad (en la app real esto bloquea el envio antes de llegar
    // a la base; aqui se inserta directo solo para fines de demostracion).
    const mockLocation = i % 9 === 0;
    const checkin = new Date(ahora - (aVisitar.length - i) * 6 * 60 * 60 * 1000 - Math.floor(Math.random() * 3 * 60 * 60 * 1000));

    await prisma.$transaction([
      prisma.visitaAuditoria.create({
        data: {
          id_asignacion: asignacion.id_asignacion,
          id_expediente: exp.id_expediente,
          id_usuario_auditor: asignacion.id_usuario_auditor,
          fecha_hora_checkin: checkin,
          fecha_hora_checkout: new Date(checkin.getTime() + 25 * 60 * 1000),
          latitud: punto.lat,
          longitud: punto.lng,
          precision_metros: escenario.precision,
          distancia_domicilio_m: distanciaReal,
          mock_location: mockLocation,
          device_integrity_ok: escenario.deviceOk,
          device_id: `demo-device-${asignacion.id_usuario_auditor.slice(0, 8)}`,
          server_received_at: new Date(checkin.getTime() + 26 * 60 * 1000),
          resultado: mockLocation ? 'RECHAZADO' : escenario.resultado,
          respuestas_cuestionario: cuestionario(i),
          comentario_negocio: 'Negocio en funcionamiento, atendido por el titular al momento de la visita.',
          comentario_auditor: mockLocation
            ? 'Se detecto ubicacion simulada (Fake GPS) en el dispositivo. Visita marcada para reprogramar con verificacion presencial.'
            : escenario.comentarioAuditor,
          firma_evidencia: FIRMA_DEMO,
          estado: 'CERRADA',
        },
      }),
      prisma.asignacionAuditoria.update({ where: { id_asignacion: asignacion.id_asignacion }, data: { estado: 'FINALIZADA', fecha_fin: checkin } }),
      prisma.expediente.update({ where: { id_expediente: exp.id_expediente }, data: { estado: 'VISITADO' } }),
    ]);
    creadas += 1;
  }
  process.stdout.write(`Visitas creadas: ${creadas}\n`);

  // Cancela 3 asignaciones reales (de la reserva) para mostrar tambien ese flujo,
  // liberando el expediente de vuelta a PENDIENTE.
  let canceladas = 0;
  for (const asignacion of reservaParaCancelar.slice(0, 3)) {
    await prisma.asignacionAuditoria.update({ where: { id_asignacion: asignacion.id_asignacion }, data: { estado: 'CANCELADA', fecha_fin: new Date() } });
    const otraActiva = await prisma.asignacionAuditoria.findFirst({ where: { id_expediente: asignacion.id_expediente, estado: 'ACTIVA' } });
    if (!otraActiva) await prisma.expediente.update({ where: { id_expediente: asignacion.id_expediente }, data: { estado: 'PENDIENTE' } });
    canceladas += 1;
  }
  process.stdout.write(`Asignaciones canceladas (liberadas de vuelta a PENDIENTE): ${canceladas}\n`);

  const resumenResultados = await prisma.visitaAuditoria.groupBy({ by: ['resultado'], _count: true });
  process.stdout.write('Resultados: ' + JSON.stringify(resumenResultados.map(r => `${r.resultado}=${r._count}`)) + '\n');
} finally {
  await prisma.$disconnect();
}
