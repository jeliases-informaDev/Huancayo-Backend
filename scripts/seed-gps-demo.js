// Simula GPS en vivo de varios auditores (para ver el mapa de Seguimiento con
// gente "En linea" sin necesidad de que todos tengan el celular prendido) y crea
// un expediente de prueba justo en una direccion real, para probar el chequeo de
// geocerca del check-in con el GPS real de un celular.
import prisma from '#core/config/prisma.js';

// Av. Petit Thouars 1113, Lince, Lima — geocodificado a nivel de tramo de calle
// (OpenStreetMap no tiene el numero de puerta exacto para esta direccion); si el
// primer check-in real marca una distancia grande, se ajustan estas coordenadas
// al punto real que reporte el celular.
const PUNTO_PRUEBA = { lat: -12.0850, lng: -77.0333 };

const expedientePrueba = {
  codigo_expediente: 'CH-TEST-GPS',
  tipo_credito: 'CONSUMO',
  oficina: 'Agencia Lima',
  numero_documento_cliente: '70000001',
  nombres_cliente: 'Cliente de Prueba (GPS real)',
  telefono_cliente: '900000001',
  direccion_domicilio: 'Av. Petit Thouars 1113, Lince',
  distrito: 'Lince', provincia: 'Lima', departamento: 'Lima',
  latitud: PUNTO_PRUEBA.lat, longitud: PUNTO_PRUEBA.lng,
  asesor_responsable: 'Ana Cecilia Rios Guzman',
  monto_desembolso: 5000, moneda: 'PEN',
  datos_cliente: { fuente: 'Prueba manual', tipo_vivienda: 'ALQUILADA' },
  datos_negocio: { actividad: 'Prueba de check-in con GPS real', estado_negocio: 'EN_FUNCIONAMIENTO' },
  datos_credito: { producto: 'Credito Consumo Personal', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
  evaluacion_financiera: {}, endeudamiento: {},
};

// Auditores a los que se les simula ubicacion en vivo ahora mismo (cerca de su
// propia zona), para que aparezcan "En linea" en Seguimiento sin abrir la app.
const GPS_EN_VIVO = [
  { username: 'auditor.huaman', lat: -12.0653, lng: -75.2049 },
  { username: 'auditor.ramos', lat: -12.0700, lng: -75.2100 },
  { username: 'auditor.paredes', lat: -12.0600, lng: -75.2000 },
  { username: 'auditor.medina', lat: -12.0464, lng: -77.0428 },
  { username: 'auditor.torres', lat: -12.0600, lng: -77.0300 },
  { username: 'auditor.paz', lat: PUNTO_PRUEBA.lat + 0.003, lng: PUNTO_PRUEBA.lng - 0.002 },
];

try {
  const existente = await prisma.expediente.findUnique({ where: { codigo_expediente: expedientePrueba.codigo_expediente } });
  const expediente = existente || await prisma.expediente.create({ data: expedientePrueba });
  process.stdout.write(`Expediente de prueba ${existente ? '(ya existia)' : 'creado'}: ${expediente.codigo_expediente} (id ${expediente.id_expediente}) en ${PUNTO_PRUEBA.lat}, ${PUNTO_PRUEBA.lng}\n`);

  // Se asigna a auditor.paz (Lima) si todavia no tiene una asignacion activa.
  const auditorPrueba = await prisma.usuario.findUnique({ where: { username: 'auditor.paz' } });
  const yaAsignado = await prisma.asignacionAuditoria.findFirst({ where: { id_expediente: expediente.id_expediente, estado: 'ACTIVA' } });
  if (auditorPrueba && !yaAsignado) {
    await prisma.asignacionAuditoria.create({ data: { id_expediente: expediente.id_expediente, id_usuario_auditor: auditorPrueba.id_usuario, prioridad: 'ALTA' } });
    await prisma.expediente.update({ where: { id_expediente: expediente.id_expediente }, data: { estado: 'ASIGNADO' } });
    process.stdout.write('Asignado a auditor.paz (Lima) con prioridad ALTA.\n');
  } else {
    process.stdout.write('Ya tenia una asignacion activa, no se toco.\n');
  }

  for (const a of GPS_EN_VIVO) {
    const usuario = await prisma.usuario.findUnique({ where: { username: a.username } });
    if (!usuario) { process.stdout.write(`(omitido, no existe: ${a.username})\n`); continue; }
    await prisma.$transaction([
      prisma.usuario.update({ where: { id_usuario: usuario.id_usuario }, data: { latitud: a.lat, longitud: a.lng } }),
      prisma.trackingUbicacion.create({ data: { id_usuario: usuario.id_usuario, latitud: a.lat, longitud: a.lng, precision_metros: 12 } }),
    ]);
    process.stdout.write(`GPS en vivo simulado: ${a.username} -> ${a.lat}, ${a.lng}\n`);
  }
} finally {
  await prisma.$disconnect();
}
