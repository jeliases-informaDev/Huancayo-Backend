// Datos de prueba para testing de punta a punta (NO usar en producción).
// Crea usuarios (1 supervisor, 3 auditores) y expedientes de muestra (Consumo y Otros)
// con asignaciones activas, para poder probar la app móvil sin un feed real de Caja Huancayo.
import bcrypt from 'bcryptjs';
import prisma from '#core/config/prisma.js';

const TEST_PASSWORD = 'CajaHuancayo2026!';

const usuarios = [
  { username: 'supervisor.test', nombres: 'Rosa', apellidos: 'Quispe Mendoza', rol: 'SUPERVISOR' },
  { username: 'auditor1.test', nombres: 'Luis', apellidos: 'Ramos Torres', rol: 'AUDITOR' },
  { username: 'auditor2.test', nombres: 'Milagros', apellidos: 'Cuba Espinoza', rol: 'AUDITOR' },
  { username: 'auditor3.test', nombres: 'Jhon', apellidos: 'Huaman Rojas', rol: 'AUDITOR' },
];

// Coordenadas de referencia en Huancayo, Junín, con variación pequeña entre expedientes.
const BASE_LAT = -12.0653;
const BASE_LNG = -75.2049;
function jitter(base, index) { return base + (index % 5) * 0.004 - 0.008; }

const expedientes = [
  {
    codigo_expediente: 'CH-CONS-0001', tipo_credito: 'CONSUMO', oficina: 'Agencia El Tambo',
    numero_documento_cliente: '41234567', nombres_cliente: 'Maria Elena Torres Vidal',
    telefono_cliente: '964123456', direccion_domicilio: 'Jr. Junin 456, El Tambo',
    distrito: 'El Tambo', provincia: 'Huancayo', asesor_responsable: 'Carlos Mendoza Paucar',
    monto_desembolso: 8500, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', fecha_nacimiento: '1985-03-12', edad: 41, estado_civil: 'CASADO', tipo_vivienda: 'PROPIA', numero_suministro: '10234567' },
    datos_negocio: { actividad: 'Comercio - venta de abarrotes', estado_negocio: 'EN_FUNCIONAMIENTO', antiguedad_negocio: '5 años', empleador: 'Independiente' },
    datos_credito: { asesor_solicitud: 'Carlos Mendoza Paucar', producto: 'Credito Consumo Personal', fecha_vencimiento: '2027-08-15', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: { ingresos: [{ descripcion: 'Venta de abarrotes', relacion: 'TITULAR', moneda: 'PEN', monto: 2400, tipo_ingreso: 'NEGOCIO' }] },
    endeudamiento: { entidades: [{ entidad: 'Caja Huancayo', saldo: 8500, calificacion: 'NORMAL', tipo_credito: 'CONSUMO' }] },
  },
  {
    codigo_expediente: 'CH-CONS-0002', tipo_credito: 'CONSUMO', oficina: 'Agencia Chilca',
    numero_documento_cliente: '45678912', nombres_cliente: 'Jose Antonio Flores Camayo',
    telefono_cliente: '965234567', direccion_domicilio: 'Av. Ferrocarril 789, Chilca',
    distrito: 'Chilca', provincia: 'Huancayo', asesor_responsable: 'Ana Cecilia Rios Guzman',
    monto_desembolso: 5200, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', fecha_nacimiento: '1990-07-22', edad: 36, estado_civil: 'SOLTERO', tipo_vivienda: 'ALQUILADA' },
    datos_negocio: { actividad: 'Transporte', estado_negocio: 'EN_FUNCIONAMIENTO', antiguedad_negocio: '2 años' },
    datos_credito: { producto: 'Credito Consumo Personal', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: { ingresos: [{ descripcion: 'Servicio de taxi', relacion: 'TITULAR', moneda: 'PEN', monto: 1800, tipo_ingreso: 'NEGOCIO' }] },
    endeudamiento: {},
  },
  {
    codigo_expediente: 'CH-OTR-0001', tipo_credito: 'OTROS', oficina: 'Agencia El Tambo',
    numero_documento_cliente: '43219876', nombres_cliente: 'Rosario Huaman Salvatierra',
    telefono_cliente: '966345678', direccion_domicilio: 'Jr. Real 1023, Huancayo',
    distrito: 'Huancayo', provincia: 'Huancayo', asesor_responsable: 'Carlos Mendoza Paucar',
    monto_desembolso: 15000, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', fecha_nacimiento: '1978-11-05', edad: 47, estado_civil: 'CASADO', tipo_vivienda: 'PROPIA' },
    datos_negocio: { actividad: 'Ferreteria', estado_negocio: 'EN_FUNCIONAMIENTO', antiguedad_negocio: '10 años', tipo_cliente_negocio: 'MICROEMPRESA' },
    datos_credito: { producto: 'Credito MYPE', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: {
      balance_general: { activo_corriente: 22000, pasivo_corriente: 9000, patrimonio: 13000 },
      estado_resultados: { ventas_netas: 18000, costo_mercaderia: 11000, utilidad_bruta: 7000, gastos_operativos: 3000, utilidad_operativa: 4000 },
    },
    endeudamiento: { entidades: [{ entidad: 'Caja Huancayo', saldo: 15000, calificacion: 'NORMAL', tipo_credito: 'MYPE' }] },
  },
  {
    codigo_expediente: 'CH-OTR-0002', tipo_credito: 'OTROS', oficina: 'Agencia Chilca',
    numero_documento_cliente: '47891234', nombres_cliente: 'Victor Raul Cordova Lazo',
    telefono_cliente: '967456789', direccion_domicilio: 'Calle Lima 234, Chilca',
    distrito: 'Chilca', provincia: 'Huancayo', asesor_responsable: 'Ana Cecilia Rios Guzman',
    monto_desembolso: 22000, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', fecha_nacimiento: '1982-01-30', edad: 44, estado_civil: 'CASADO', tipo_vivienda: 'PROPIA' },
    datos_negocio: { actividad: 'Carpinteria', estado_negocio: 'EN_FUNCIONAMIENTO', antiguedad_negocio: '8 años', tipo_cliente_negocio: 'MICROEMPRESA' },
    datos_credito: { producto: 'Credito MYPE', estado: 'VIGENTE', calificacion_sbs: 'CPP' },
    evaluacion_financiera: {
      balance_general: { activo_corriente: 30000, pasivo_corriente: 14000, patrimonio: 16000 },
      estado_resultados: { ventas_netas: 25000, costo_mercaderia: 15000, utilidad_bruta: 10000, gastos_operativos: 4500, utilidad_operativa: 5500 },
    },
    endeudamiento: {},
  },
  {
    codigo_expediente: 'CH-CONS-0003', tipo_credito: 'CONSUMO', oficina: 'Agencia Huancan',
    numero_documento_cliente: '48765432', nombres_cliente: 'Elizabeth Poma Curipaco',
    telefono_cliente: '968567890', direccion_domicilio: 'Jr. Amazonas 567, Huancan',
    distrito: 'Huancan', provincia: 'Huancayo', asesor_responsable: 'Jorge Luis Camarena Solis',
    monto_desembolso: 6800, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', fecha_nacimiento: '1995-05-18', edad: 31, estado_civil: 'CONVIVIENTE', tipo_vivienda: 'FAMILIAR' },
    datos_negocio: { actividad: 'Peluqueria', estado_negocio: 'EN_FUNCIONAMIENTO', antiguedad_negocio: '3 años' },
    datos_credito: { producto: 'Credito Consumo Personal', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: { ingresos: [{ descripcion: 'Servicios de peluqueria', relacion: 'TITULAR', moneda: 'PEN', monto: 1500, tipo_ingreso: 'NEGOCIO' }] },
    endeudamiento: {},
  },
  {
    codigo_expediente: 'CH-CONS-0004', tipo_credito: 'CONSUMO', oficina: 'Agencia El Tambo',
    numero_documento_cliente: '49876543', nombres_cliente: 'Walter Enrique Bendezu Ore',
    telefono_cliente: '969678901', direccion_domicilio: 'Av. Mariscal Castilla 890, El Tambo',
    distrito: 'El Tambo', provincia: 'Huancayo', asesor_responsable: 'Jorge Luis Camarena Solis',
    monto_desembolso: 9500, moneda: 'PEN',
    datos_cliente: { fuente: 'Central de riesgo', fecha_nacimiento: '1988-09-09', edad: 38, estado_civil: 'CASADO', tipo_vivienda: 'PROPIA' },
    datos_negocio: { actividad: 'Empleado dependiente', estado_negocio: 'DE_TERCEROS', antiguedad_negocio: '6 años en el empleo' },
    datos_credito: { producto: 'Credito Consumo Personal', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: { ingresos: [{ descripcion: 'Sueldo dependiente', relacion: 'TITULAR', moneda: 'PEN', monto: 2200, tipo_ingreso: 'DEPENDIENTE' }] },
    endeudamiento: {},
  },
];

try {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  const creados = [];
  for (const datos of usuarios) {
    const usuario = await prisma.usuario.upsert({
      where: { username: datos.username },
      update: {},
      create: { username: datos.username, nombres: datos.nombres, apellidos: datos.apellidos, rol: datos.rol, password_hash: passwordHash, estado: 'ACTIVO' },
    });
    creados.push(usuario);
  }

  const expedientesCreados = [];
  for (const [index, datos] of expedientes.entries()) {
    const expediente = await prisma.expediente.upsert({
      where: { codigo_expediente: datos.codigo_expediente },
      update: {},
      create: { ...datos, latitud: jitter(BASE_LAT, index), longitud: jitter(BASE_LNG, index) },
    });
    expedientesCreados.push(expediente);
  }

  const auditores = creados.filter(usuario => usuario.rol === 'AUDITOR');
  for (const [index, expediente] of expedientesCreados.entries()) {
    const auditor = auditores[index % auditores.length];
    const yaAsignado = await prisma.asignacionAuditoria.findFirst({ where: { id_expediente: expediente.id_expediente, id_usuario_auditor: auditor.id_usuario, estado: 'ACTIVA' } });
    if (!yaAsignado) {
      await prisma.asignacionAuditoria.create({ data: { id_expediente: expediente.id_expediente, id_usuario_auditor: auditor.id_usuario, prioridad: index % 3 === 0 ? 'ALTA' : 'MEDIA' } });
      await prisma.expediente.update({ where: { id_expediente: expediente.id_expediente }, data: { estado: 'ASIGNADO' } });
    }
  }

  process.stdout.write('\nDatos de prueba creados.\n');
  process.stdout.write(`Contraseña para todos los usuarios de prueba: ${TEST_PASSWORD}\n\n`);
  for (const usuario of creados) process.stdout.write(`  ${usuario.rol.padEnd(11)} usuario="${usuario.username}"\n`);
  process.stdout.write(`\nExpedientes creados: ${expedientesCreados.length} (mezcla CONSUMO / OTROS), asignados de forma rotativa entre los auditores.\n`);
} finally {
  await prisma.$disconnect();
}
