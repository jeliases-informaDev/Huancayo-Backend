// Amplía el equipo de campo con más auditores (algunos deliberadamente sin
// asignar todavía, para simular una operación real con personal recién
// incorporado) y les asigna clientes SIEMPRE dentro de su propio departamento,
// usando la misma regla que ya valida el backend (auditor.departamento ===
// expediente.departamento). También agrega más expedientes: solo quedaban 11
// pendientes en todo el sistema, insuficiente para dar una muestra decente a
// varios auditores nuevos.
import bcrypt from 'bcryptjs';
import prisma from '#core/config/prisma.js';

const TEST_PASSWORD = 'CajaHuancayo2026!';

const NUEVOS_AUDITORES = [
  // Junín — se quedan SIN asignar (recién incorporados): rojas, machuca.
  { username: 'auditor.paredes', nombres: 'Rosa', apellidos: 'Paredes Quispe', departamento: 'Junín', sede: 'Agencia Huancayo', asignar: true },
  { username: 'auditor.vilcas', nombres: 'Miguel', apellidos: 'Vilcas Ñahui', departamento: 'Junín', sede: 'Agencia Huancayo', asignar: true },
  { username: 'auditor.rojas', nombres: 'Katia', apellidos: 'Rojas Espinoza', departamento: 'Junín', sede: 'Agencia Huancayo', asignar: false },
  { username: 'auditor.machuca', nombres: 'Andres', apellidos: 'Machuca Lopez', departamento: 'Junín', sede: 'Agencia Huancayo', asignar: false },
  // Lima — se queda SIN asignar: condori.
  { username: 'auditor.medina', nombres: 'Carla', apellidos: 'Medina Suarez', departamento: 'Lima', sede: 'Agencia Lima', asignar: true },
  { username: 'auditor.torres', nombres: 'Brayan', apellidos: 'Torres Aquino', departamento: 'Lima', sede: 'Agencia Lima', asignar: true },
  { username: 'auditor.paz', nombres: 'Milagros', apellidos: 'Paz Rivera', departamento: 'Lima', sede: 'Agencia Lima', asignar: true },
  { username: 'auditor.condori', nombres: 'Josue', apellidos: 'Condori Mamani', departamento: 'Lima', sede: 'Agencia Lima', asignar: false },
];

const JUNIN_BASE = { lat: -12.0653, lng: -75.2049 };
const LIMA_BASE = { lat: -12.0464, lng: -77.0428 };
function jitter(base, seed) {
  const a = Math.sin(seed * 12.9898) * 43758.5453;
  const b = Math.sin(seed * 78.233) * 21456.1234;
  return { lat: base.lat + ((a - Math.floor(a)) - 0.5) * 0.09, lng: base.lng + ((b - Math.floor(b)) - 0.5) * 0.09 };
}

const NUEVOS_JUNIN = [
  { d: 'El Tambo', p: 'Huancayo', nombre: 'Nilton Cesar Quispe Alania', doc: '60123456', tel: '974112233' },
  { d: 'Chilca', p: 'Huancayo', nombre: 'Flor de Maria Berrocal Nuñez', doc: '60234567', tel: '974223344' },
  { d: 'Huancayo', p: 'Huancayo', nombre: 'Segundo Rene Palacios Ore', doc: '60345678', tel: '974334455' },
  { d: 'Pilcomayo', p: 'Huancayo', nombre: 'Yolanda Espinoza Tacunan', doc: '60456789', tel: '974445566' },
  { d: 'Sicaya', p: 'Huancayo', nombre: 'Wilder Curi Camarena', doc: '60567890', tel: '974556677' },
  { d: 'Hualhuas', p: 'Huancayo', nombre: 'Rocio del Pilar Lazo Meza', doc: '60678901', tel: '974667788' },
  { d: 'Chupaca', p: 'Chupaca', nombre: 'Elmer Huaynate Rosales', doc: '60789012', tel: '974778899' },
  { d: 'Concepción', p: 'Concepción', nombre: 'Betty Carbajal Astoray', doc: '60890123', tel: '974889900' },
  { d: 'El Tambo', p: 'Huancayo', nombre: 'Jhony Pomachagua Ricse', doc: '60901234', tel: '974990011' },
  { d: 'Chilca', p: 'Huancayo', nombre: 'Ana Maribel Cangalaya Soto', doc: '61012345', tel: '975001122' },
  { d: 'Huancan', p: 'Huancayo', nombre: 'Ricardo Manrique Solis', doc: '61123456', tel: '975112233' },
  { d: 'Huancayo', p: 'Huancayo', nombre: 'Zoila Inga Baldeon', doc: '61234567', tel: '975223344' },
  { d: 'Pilcomayo', p: 'Huancayo', nombre: 'Freddy Curipaco Landa', doc: '61345678', tel: '975334455' },
  { d: 'Chupaca', p: 'Chupaca', nombre: 'Marisol Beraun Villar', doc: '61456789', tel: '975445566' },
  { d: 'Concepción', p: 'Concepción', nombre: 'Ever Meza Carbajal', doc: '61567890', tel: '975556677' },
].map((c, i) => ({ ...c, dept: 'Junín', base: JUNIN_BASE, seed: i + 101, codigo: `CH-HYO-${String(201 + i)}` }));

const NUEVOS_LIMA = [
  { d: 'Comas', p: 'Lima', nombre: 'Luz Marina Tello Rengifo', doc: '62123456', tel: '976112233' },
  { d: 'Los Olivos', p: 'Lima', nombre: 'Kevin Alexis Nunja Sanchez', doc: '62234567', tel: '976223344' },
  { d: 'Ate', p: 'Lima', nombre: 'Doris Ychpas Poma', doc: '62345678', tel: '976334455' },
  { d: 'Santa Anita', p: 'Lima', nombre: 'Ruben Del Pino Nunja', doc: '62456789', tel: '976445566' },
  { d: 'San Juan de Lurigancho', p: 'Lima', nombre: 'Katherine Cerron Huaman', doc: '62567890', tel: '976556677' },
  { d: 'Villa El Salvador', p: 'Lima', nombre: 'Jose Luis Salas Quinto', doc: '62678901', tel: '976667788' },
  { d: 'Miraflores', p: 'Lima', nombre: 'Diana Carolina Diaz Villanueva', doc: '62789012', tel: '976778899' },
  { d: 'San Isidro', p: 'Lima', nombre: 'Fabian Guerra Leon', doc: '62890123', tel: '976889900' },
  { d: 'Surco', p: 'Lima', nombre: 'Andrea Rios Bazan', doc: '62901234', tel: '976990011' },
  { d: 'Independencia', p: 'Lima', nombre: 'Wilmer Cotrina Saavedra', doc: '63012345', tel: '977001122' },
  { d: 'Puente Piedra', p: 'Lima', nombre: 'Cinthia Rocio Vega Fuentes', doc: '63123456', tel: '977112233' },
  { d: 'El Agustino', p: 'Lima', nombre: 'Marco Antonio Villar Renzo', doc: '63234567', tel: '977223344' },
  { d: 'Comas', p: 'Lima', nombre: 'Gladys Aranda Colonia', doc: '63345678', tel: '977334455' },
  { d: 'Los Olivos', p: 'Lima', nombre: 'Harold Quiroz Benites', doc: '63456789', tel: '977445566' },
  { d: 'Ate', p: 'Lima', nombre: 'Pilar Loo Diestra', doc: '63567890', tel: '977556677' },
].map((c, i) => ({ ...c, dept: 'Lima', base: LIMA_BASE, seed: i + 121, codigo: `CH-LIM-${String(201 + i)}` }));

function expedienteDesde(c, index) {
  const punto = jitter(c.base, c.seed);
  const tipo = index % 3 === 0 ? 'OTROS' : 'CONSUMO';
  const monto = tipo === 'OTROS' ? 11000 + (index % 5) * 2200 : 3800 + (index % 6) * 850;
  return {
    codigo_expediente: c.codigo, tipo_credito: tipo,
    oficina: c.dept === 'Junín' ? 'Agencia Huancayo' : 'Agencia Lima',
    numero_documento_cliente: c.doc, nombres_cliente: c.nombre, telefono_cliente: c.tel,
    direccion_domicilio: `Jr. Los Pinos ${200 + index}, ${c.d}`,
    distrito: c.d, provincia: c.p, departamento: c.dept,
    latitud: punto.lat, longitud: punto.lng,
    asesor_responsable: c.dept === 'Junín' ? 'Carlos Mendoza Paucar' : 'Ana Cecilia Rios Guzman',
    monto_desembolso: monto, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', tipo_vivienda: index % 2 === 0 ? 'PROPIA' : 'ALQUILADA' },
    datos_negocio: { actividad: tipo === 'OTROS' ? 'Comercio minorista' : 'Empleado dependiente', estado_negocio: 'EN_FUNCIONAMIENTO' },
    datos_credito: { producto: tipo === 'OTROS' ? 'Credito MYPE' : 'Credito Consumo Personal', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: {}, endeudamiento: {},
  };
}

try {
  // 1) Crear los expedientes nuevos (idempotente por codigo_expediente).
  const nuevosExpedientes = [...NUEVOS_JUNIN, ...NUEVOS_LIMA];
  let expedientesCreados = 0;
  for (const [index, c] of nuevosExpedientes.entries()) {
    const datos = expedienteDesde(c, index);
    const existente = await prisma.expediente.findUnique({ where: { codigo_expediente: datos.codigo_expediente } });
    if (!existente) { await prisma.expediente.create({ data: datos }); expedientesCreados += 1; }
  }
  process.stdout.write(`Expedientes nuevos creados: ${expedientesCreados} (${NUEVOS_JUNIN.length} Junín, ${NUEVOS_LIMA.length} Lima).\n`);

  // 2) Crear los auditores nuevos (idempotente por username).
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  const auditoresCreados = [];
  for (const a of NUEVOS_AUDITORES) {
    const usuario = await prisma.usuario.upsert({
      where: { username: a.username },
      update: { departamento: a.departamento, sede: a.sede },
      create: {
        username: a.username, nombres: a.nombres, apellidos: a.apellidos, rol: 'AUDITOR',
        password_hash: passwordHash, estado: 'ACTIVO', departamento: a.departamento, sede: a.sede,
      },
    });
    auditoresCreados.push({ ...a, id: usuario.id_usuario });
  }
  process.stdout.write(`Auditores nuevos: ${auditoresCreados.length} (${auditoresCreados.filter(a => a.asignar).length} con muestra, ${auditoresCreados.filter(a => !a.asignar).length} sin asignar todavía).\n`);

  // 3) Asignar: cada auditor "asignar:true" recibe varios clientes PENDIENTES de
  // su propio departamento (misma regla que ya exige asignaciones.service.js).
  async function asignarClientes(auditorId, departamento, cantidad) {
    const pendientes = await prisma.expediente.findMany({
      where: { departamento, estado: 'PENDIENTE' }, take: cantidad, orderBy: { id_expediente: 'asc' },
    });
    for (const [i, exp] of pendientes.entries()) {
      await prisma.$transaction([
        prisma.asignacionAuditoria.create({ data: { id_expediente: exp.id_expediente, id_usuario_auditor: auditorId, prioridad: i % 4 === 0 ? 'ALTA' : i % 4 === 1 ? 'BAJA' : 'MEDIA' } }),
        prisma.expediente.update({ where: { id_expediente: exp.id_expediente }, data: { estado: 'ASIGNADO' } }),
      ]);
    }
    return pendientes.length;
  }

  for (const a of auditoresCreados) {
    if (!a.asignar) continue;
    const yaTiene = await prisma.asignacionAuditoria.count({ where: { id_usuario_auditor: a.id, estado: 'ACTIVA' } });
    if (yaTiene >= 3) { process.stdout.write(`${a.username} ya tiene ${yaTiene} cliente(s) asignado(s), no se agregan más.\n`); continue; }
    const cantidad = a.departamento === 'Junín' ? 4 : 5;
    const asignados = await asignarClientes(a.id, a.departamento, cantidad);
    process.stdout.write(`${a.username} (${a.departamento}) -> ${asignados} cliente(s) asignado(s).\n`);
  }

  process.stdout.write(`\nContraseña de todos los auditores nuevos: ${TEST_PASSWORD}\n`);
} finally {
  await prisma.$disconnect();
}
