// Despues de convertir varias asignaciones en visitas (y cancelar otras), a cada
// auditor le puede haber quedado muy poco (o nada) pendiente en su muestra. Este
// script genera clientes nuevos y le asegura a cada auditor de campo al menos 4
// asignaciones ACTIVA, respetando su departamento (misma regla que ya valida
// asignaciones.service.js).
import prisma from '#core/config/prisma.js';

const JUNIN_BASE = { lat: -12.0653, lng: -75.2049 };
const LIMA_BASE = { lat: -12.0464, lng: -77.0428 };
function jitter(base, seed) {
  const a = Math.sin(seed * 12.9898) * 43758.5453;
  const b = Math.sin(seed * 78.233) * 21456.1234;
  return { lat: base.lat + ((a - Math.floor(a)) - 0.5) * 0.09, lng: base.lng + ((b - Math.floor(b)) - 0.5) * 0.09 };
}

const NUEVOS_JUNIN = [
  { d: 'El Tambo', p: 'Huancayo', nombre: 'Aurora Ninanya Huaynate', doc: '71100001', tel: '974100001' },
  { d: 'Chilca', p: 'Huancayo', nombre: 'Herminio Baldeon Curi', doc: '71100002', tel: '974100002' },
  { d: 'Sicaya', p: 'Huancayo', nombre: 'Lisbeth Astoray Meza', doc: '71100003', tel: '974100003' },
  { d: 'Pilcomayo', p: 'Huancayo', nombre: 'Ruben Carbajal Rosales', doc: '71100004', tel: '974100004' },
  { d: 'Huancan', p: 'Huancayo', nombre: 'Doris Beraun Villar', doc: '71100005', tel: '974100005' },
  { d: 'Hualhuas', p: 'Huancayo', nombre: 'Genaro Landa Curipaco', doc: '71100006', tel: '974100006' },
  { d: 'Chupaca', p: 'Chupaca', nombre: 'Marleny Solis Manrique', doc: '71100007', tel: '974100007' },
  { d: 'Concepción', p: 'Concepción', nombre: 'Wilder Ore Salcedo', doc: '71100008', tel: '974100008' },
  { d: 'Huancayo', p: 'Huancayo', nombre: 'Yasmin Palacios Berrocal', doc: '71100009', tel: '974100009' },
  { d: 'El Tambo', p: 'Huancayo', nombre: 'Cesar Alania Quispe', doc: '71100010', tel: '974100010' },
  { d: 'Chilca', p: 'Huancayo', nombre: 'Norma Tacunan Espinoza', doc: '71100011', tel: '974100011' },
  { d: 'Pilcomayo', p: 'Huancayo', nombre: 'Percy Camarena Ninanya', doc: '71100012', tel: '974100012' },
].map((c, i) => ({ ...c, dept: 'Junín', base: JUNIN_BASE, seed: i + 201, codigo: `CH-HYO-${String(401 + i)}` }));

const NUEVOS_LIMA = [
  { d: 'Comas', p: 'Lima', nombre: 'Hugo Rengifo Tello', doc: '71200001', tel: '976200001' },
  { d: 'Los Olivos', p: 'Lima', nombre: 'Ines Sanchez Nunja', doc: '71200002', tel: '976200002' },
  { d: 'Ate', p: 'Lima', nombre: 'Walter Poma Ychpas', doc: '71200003', tel: '976200003' },
  { d: 'Santa Anita', p: 'Lima', nombre: 'Karina Nunja Del Pino', doc: '71200004', tel: '976200004' },
  { d: 'San Juan de Lurigancho', p: 'Lima', nombre: 'Oscar Cerron Huaman', doc: '71200005', tel: '976200005' },
  { d: 'Villa El Salvador', p: 'Lima', nombre: 'Rosa Salas Quinto', doc: '71200006', tel: '976200006' },
  { d: 'Miraflores', p: 'Lima', nombre: 'Sandra Villanueva Diaz', doc: '71200007', tel: '976200007' },
  { d: 'San Isidro', p: 'Lima', nombre: 'Martin Guerra Leon', doc: '71200008', tel: '976200008' },
  { d: 'Surco', p: 'Lima', nombre: 'Yesenia Bazan Rios', doc: '71200009', tel: '976200009' },
  { d: 'Independencia', p: 'Lima', nombre: 'Franklin Cotrina Saavedra', doc: '71200010', tel: '976200010' },
  { d: 'Puente Piedra', p: 'Lima', nombre: 'Vanessa Vega Fuentes', doc: '71200011', tel: '976200011' },
  { d: 'El Agustino', p: 'Lima', nombre: 'Jorge Villar Renzo', doc: '71200012', tel: '976200012' },
].map((c, i) => ({ ...c, dept: 'Lima', base: LIMA_BASE, seed: i + 221, codigo: `CH-LIM-${String(401 + i)}` }));

function expedienteDesde(c, index) {
  const punto = jitter(c.base, c.seed);
  const tipo = index % 3 === 0 ? 'OTROS' : 'CONSUMO';
  const monto = tipo === 'OTROS' ? 10000 + (index % 5) * 2000 : 3500 + (index % 6) * 800;
  return {
    codigo_expediente: c.codigo, tipo_credito: tipo,
    oficina: c.dept === 'Junín' ? 'Agencia Huancayo' : 'Agencia Lima',
    numero_documento_cliente: c.doc, nombres_cliente: c.nombre, telefono_cliente: c.tel,
    direccion_domicilio: `Jr. Las Flores ${300 + index}, ${c.d}`,
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
  const nuevos = [...NUEVOS_JUNIN, ...NUEVOS_LIMA];
  let creados = 0;
  for (const [index, c] of nuevos.entries()) {
    const datos = expedienteDesde(c, index);
    const existente = await prisma.expediente.findUnique({ where: { codigo_expediente: datos.codigo_expediente } });
    if (!existente) { await prisma.expediente.create({ data: datos }); creados += 1; }
  }
  process.stdout.write(`Expedientes nuevos: ${creados}\n`);

  const auditores = await prisma.usuario.findMany({ where: { rol: 'AUDITOR', estado: 'ACTIVO' } });
  const META_MINIMA = 4;
  let asignadas = 0;
  for (const auditor of auditores) {
    if (!auditor.departamento) continue;
    const actuales = await prisma.asignacionAuditoria.count({ where: { id_usuario_auditor: auditor.id_usuario, estado: 'ACTIVA' } });
    if (actuales >= META_MINIMA) { process.stdout.write(`${auditor.username}: ya tiene ${actuales}, no se toca.\n`); continue; }
    const faltan = META_MINIMA - actuales;
    const pendientes = await prisma.expediente.findMany({ where: { departamento: auditor.departamento, estado: 'PENDIENTE' }, take: faltan, orderBy: { id_expediente: 'asc' } });
    for (const [i, exp] of pendientes.entries()) {
      await prisma.$transaction([
        prisma.asignacionAuditoria.create({ data: { id_expediente: exp.id_expediente, id_usuario_auditor: auditor.id_usuario, prioridad: i % 3 === 0 ? 'ALTA' : i % 3 === 1 ? 'MEDIA' : 'BAJA' } }),
        prisma.expediente.update({ where: { id_expediente: exp.id_expediente }, data: { estado: 'ASIGNADO' } }),
      ]);
      asignadas += 1;
    }
    process.stdout.write(`${auditor.username} (${auditor.departamento}): ${actuales} -> ${actuales + pendientes.length}\n`);
  }
  process.stdout.write(`Asignaciones nuevas: ${asignadas}\n`);
} finally {
  await prisma.$disconnect();
}
