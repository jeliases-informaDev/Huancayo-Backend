// Corrige la asignación auditor↔cliente para que sea geográficamente coherente
// (un auditor solo debe llevar clientes de su propia sede/departamento) y agrega
// más expedientes de prueba, repartidos entre Huancayo (Junín) y Lima.
// Idempotente: se puede correr más de una vez sin duplicar expedientes.
import prisma from '#core/config/prisma.js';

// Sede (departamento base) de cada auditor de campo. Un auditor solo debería
// llevar visitas dentro de su propia ciudad — no tiene sentido operativo que le
// asignen un cliente a 200 km de donde trabaja.
const SEDE_POR_USERNAME = {
  'auditor.huaman': { sede: 'Agencia Huancayo', departamento: 'Junín' },
  'auditor.ramos': { sede: 'Agencia Huancayo', departamento: 'Junín' },
  'auditor.cuba': { sede: 'Agencia Huancayo', departamento: 'Junín' },
  'auditor.flores': { sede: 'Agencia Lima', departamento: 'Lima' },
  'auditor.salazar': { sede: 'Agencia Lima', departamento: 'Lima' },
};

const JUNIN_BASE = { lat: -12.0653, lng: -75.2049 };
const LIMA_BASE = { lat: -12.0464, lng: -77.0428 };
function jitter(base, seed) {
  const a = Math.sin(seed * 12.9898) * 43758.5453;
  const b = Math.sin(seed * 78.233) * 21456.1234;
  return {
    lat: base.lat + ((a - Math.floor(a)) - 0.5) * 0.09,
    lng: base.lng + ((b - Math.floor(b)) - 0.5) * 0.09,
  };
}

// Expedientes nuevos: 10 en Huancayo/Junín (incluye 2 provincias vecinas, Chupaca
// y Concepción, para poder probar de verdad el filtro Departamento->Provincia) y
// 10 en Lima (con 3 distritos nuevos), todos con nombres/datos de prueba.
const NUEVOS_JUNIN = [
  { d: 'El Tambo', p: 'Huancayo', nombre: 'Fredy Alanya Rojas', doc: '41567823', tel: '964112233' },
  { d: 'Chilca', p: 'Huancayo', nombre: 'Yesenia Camarena Ore', doc: '42678934', tel: '964223344' },
  { d: 'Huancayo', p: 'Huancayo', nombre: 'Ruben Dario Salcedo Inga', doc: '43789045', tel: '964334455' },
  { d: 'Pilcomayo', p: 'Huancayo', nombre: 'Katherine Quispe Baldeon', doc: '44890156', tel: '964445566' },
  { d: 'Sicaya', p: 'Huancayo', nombre: 'Marco Antonio Landa Curi', doc: '45901267', tel: '964556677' },
  { d: 'Hualhuas', p: 'Huancayo', nombre: 'Soledad Villar Espinoza', doc: '46012378', tel: '964667788' },
  { d: 'Chupaca', p: 'Chupaca', nombre: 'Percy Huaynate Manrique', doc: '47123489', tel: '964778899' },
  { d: 'Chupaca', p: 'Chupaca', nombre: 'Ines Marcelo Rosales', doc: '48234590', tel: '964889900' },
  { d: 'Concepción', p: 'Concepción', nombre: 'Willy Astoray Beraun', doc: '49345601', tel: '964990011' },
  { d: 'Concepción', p: 'Concepción', nombre: 'Diana Carbajal Meza', doc: '40456712', tel: '965001122' },
].map((c, i) => ({ ...c, dept: 'Junín', base: JUNIN_BASE, seed: i + 1, codigo: `CH-HYO-${String(101 + i)}` }));

const NUEVOS_LIMA = [
  { d: 'Comas', p: 'Lima', nombre: 'Rosa Amelia Tacunan Vega', doc: '50567823', tel: '966112233' },
  { d: 'Los Olivos', p: 'Lima', nombre: 'Edwin Chumpitaz Rivas', doc: '51678934', tel: '966223344' },
  { d: 'Ate', p: 'Lima', nombre: 'Grimaldina Poma Ychpas', doc: '52789045', tel: '966334455' },
  { d: 'Santa Anita', p: 'Lima', nombre: 'Julio Cesar Nunja Del Pino', doc: '53890156', tel: '966445566' },
  { d: 'San Juan de Lurigancho', p: 'Lima', nombre: 'Maritza Huaman Cerron', doc: '54901267', tel: '966556677' },
  { d: 'Villa El Salvador', p: 'Lima', nombre: 'Anthony Beto Quinto Salas', doc: '55012378', tel: '966667788' },
  { d: 'Miraflores', p: 'Lima', nombre: 'Carmen Rosa Villanueva Diaz', doc: '56123489', tel: '966778899' },
  { d: 'San Isidro', p: 'Lima', nombre: 'Hector Fabian León Guerra', doc: '57234590', tel: '966889900' },
  { d: 'Surco', p: 'Lima', nombre: 'Pamela Andrea Bazan Rios', doc: '58345601', tel: '966990011' },
  { d: 'Independencia', p: 'Lima', nombre: 'Wilmer Saavedra Cotrina', doc: '59456712', tel: '967001122' },
].map((c, i) => ({ ...c, dept: 'Lima', base: LIMA_BASE, seed: i + 21, codigo: `CH-LIM-${String(101 + i)}` }));

function expedienteDesde(c, index) {
  const punto = jitter(c.base, c.seed);
  const tipo = index % 3 === 0 ? 'OTROS' : 'CONSUMO';
  const monto = tipo === 'OTROS' ? 12000 + (index % 5) * 2500 : 4000 + (index % 6) * 900;
  return {
    codigo_expediente: c.codigo,
    tipo_credito: tipo,
    oficina: c.dept === 'Junín' ? 'Agencia Huancayo' : 'Agencia Lima',
    numero_documento_cliente: c.doc,
    nombres_cliente: c.nombre,
    telefono_cliente: c.tel,
    direccion_domicilio: `Jr. Las Américas ${100 + index}, ${c.d}`,
    distrito: c.d,
    provincia: c.p,
    departamento: c.dept,
    latitud: punto.lat,
    longitud: punto.lng,
    asesor_responsable: c.dept === 'Junín' ? 'Carlos Mendoza Paucar' : 'Ana Cecilia Rios Guzman',
    monto_desembolso: monto,
    moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', tipo_vivienda: index % 2 === 0 ? 'PROPIA' : 'ALQUILADA' },
    datos_negocio: { actividad: tipo === 'OTROS' ? 'Comercio minorista' : 'Empleado dependiente', estado_negocio: 'EN_FUNCIONAMIENTO' },
    datos_credito: { producto: tipo === 'OTROS' ? 'Credito MYPE' : 'Credito Consumo Personal', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: {},
    endeudamiento: {},
  };
}

try {
  // 1) Fijar la sede/departamento base de cada auditor.
  for (const [username, info] of Object.entries(SEDE_POR_USERNAME)) {
    await prisma.usuario.updateMany({ where: { username }, data: { sede: info.sede } });
  }
  const auditores = await prisma.usuario.findMany({ where: { username: { in: Object.keys(SEDE_POR_USERNAME) } } });
  const auditorPorUsername = new Map(auditores.map((u) => [u.username, u]));
  const auditoresPorDepartamento = { Junín: [], Lima: [] };
  for (const [username, info] of Object.entries(SEDE_POR_USERNAME)) {
    const usuario = auditorPorUsername.get(username);
    if (usuario) auditoresPorDepartamento[info.departamento].push(usuario);
  }

  // 2) Reasignar las asignaciones activas que hoy cruzan de departamento: el
  // expediente se queda donde está, pero pasa a un auditor de su misma zona.
  const activas = await prisma.asignacionAuditoria.findMany({
    where: { estado: 'ACTIVA' },
    include: { expediente: { select: { departamento: true, codigo_expediente: true } }, auditor: { select: { username: true } } },
  });
  const contador = { Junín: 0, Lima: 0 };
  let reasignadas = 0;
  for (const asignacion of activas) {
    const deptoCliente = asignacion.expediente.departamento;
    const sedeAuditor = SEDE_POR_USERNAME[asignacion.auditor.username]?.departamento;
    if (!deptoCliente || !auditoresPorDepartamento[deptoCliente]?.length) continue;
    if (sedeAuditor === deptoCliente) continue;
    const disponibles = auditoresPorDepartamento[deptoCliente];
    const nuevo = disponibles[contador[deptoCliente] % disponibles.length];
    contador[deptoCliente] += 1;
    await prisma.asignacionAuditoria.update({ where: { id_asignacion: asignacion.id_asignacion }, data: { id_usuario_auditor: nuevo.id_usuario } });
    reasignadas += 1;
  }

  // 3) Agregar más expedientes de prueba (10 en Huancayo/Junín, 10 en Lima) y
  // asignarlos, ya de entrada, a un auditor de su misma zona.
  const nuevos = [...NUEVOS_JUNIN, ...NUEVOS_LIMA];
  let creados = 0;
  let asignadosNuevos = 0;
  const contadorAsig = { Junín: 0, Lima: 0 };
  for (const [index, c] of nuevos.entries()) {
    const datos = expedienteDesde(c, index);
    const existente = await prisma.expediente.findUnique({ where: { codigo_expediente: datos.codigo_expediente } });
    const expediente = existente || await prisma.expediente.create({ data: datos });
    if (!existente) creados += 1;

    const disponibles = auditoresPorDepartamento[c.dept];
    const auditor = disponibles[contadorAsig[c.dept] % disponibles.length];
    contadorAsig[c.dept] += 1;
    const yaAsignado = await prisma.asignacionAuditoria.findFirst({ where: { id_expediente: expediente.id_expediente, estado: 'ACTIVA' } });
    if (!yaAsignado) {
      await prisma.asignacionAuditoria.create({
        data: { id_expediente: expediente.id_expediente, id_usuario_auditor: auditor.id_usuario, prioridad: index % 4 === 0 ? 'ALTA' : index % 4 === 1 ? 'BAJA' : 'MEDIA' },
      });
      await prisma.expediente.update({ where: { id_expediente: expediente.id_expediente }, data: { estado: 'ASIGNADO' } });
      asignadosNuevos += 1;
    }
  }

  process.stdout.write('\nCorrección geográfica aplicada.\n');
  process.stdout.write(`Sedes fijadas: ${Object.keys(SEDE_POR_USERNAME).length} auditores (3 en Huancayo/Junín, 2 en Lima).\n`);
  process.stdout.write(`Asignaciones activas reasignadas por cruzar de departamento: ${reasignadas}.\n`);
  process.stdout.write(`Expedientes nuevos creados: ${creados} (de ${nuevos.length} definidos; el resto ya existía de una corrida previa).\n`);
  process.stdout.write(`Asignaciones nuevas creadas para expedientes nuevos: ${asignadosNuevos}.\n`);
} finally {
  await prisma.$disconnect();
}
