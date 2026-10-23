// Visitas de demostración: 24 visitas ficticias (13 conformes, 4 observadas, 2 no ubicadas y 5 rechazadas) para ver las pantallas con información sin esperar a
// que los asesores salgan a campo. Los nombres, documentos y direcciones son inventados. Todo lo que se crea lleva una marca (código DEMO-LIM-… en el
// expediente y client_sync_id demo-… en la visita) para poder quitarlo después sin tocar nada real. Piezas puras, sin base de datos, para probarlas solas.

export const PREFIJO_CODIGO = 'DEMO-LIM-';
export const PREFIJO_SINCRONIZACION = 'demo-';

const DIA_MS = 24 * 60 * 60 * 1000;
const LIMA_MS = 5 * 60 * 60 * 1000; // Lima va 5 horas detrás de UTC

// Centro aproximado de cada distrito de Lima donde «viven» los clientes de ejemplo.
const DISTRITOS = {
  'La Victoria': [-12.065, -77.015], Lince: [-12.084, -77.0335], Surquillo: [-12.111, -77.014], 'San Borja': [-12.096, -77.0035], 'Jesús María': [-12.076, -77.051],
  'San Isidro': [-12.097, -77.037], Miraflores: [-12.1219, -77.0297], 'Cercado de Lima': [-12.0464, -77.0428], Barranco: [-12.146, -77.021], 'Santiago de Surco': [-12.145, -76.991],
  Chorrillos: [-12.17, -77.01], 'San Miguel': [-12.078, -77.09], 'Pueblo Libre': [-12.072, -77.063], Breña: [-12.058, -77.051], 'La Molina': [-12.085, -76.94], Ate: [-12.03, -76.925],
  'Magdalena del Mar': [-12.09, -77.072], 'San Luis': [-12.075, -76.995], 'El Agustino': [-12.045, -77.007], Rímac: [-12.03, -77.03], 'San Martín de Porres': [-12.0, -77.07],
  Independencia: [-11.99, -77.055], 'Los Olivos': [-11.97, -77.07],
};
const VIAS = ['Av. Arequipa', 'Jr. Huancavelica', 'Av. Javier Prado', 'Jr. Junín', 'Av. Brasil', 'Av. Venezuela', 'Calle Los Pinos', 'Av. Petit Thouars', 'Jr. Cusco', 'Av. Angamos'];
const ASESORES = ['Pedro Mendoza Paucar', 'Carla Rivas Soto', 'Luis Torres Vega', 'Marlene Quispe Ramos', 'Jorge Huanca Lazo'];

// n = número del crédito (DEMO-LIM-n). hace = [días atrás, hora de Lima, minuto]. metros = a qué distancia del domicilio se tomó la visita.
// auditor = posición entre los asesores activos (si hay menos, se reparte con el resto). fotos = cuántas fotografías trae (0 = «Sin fotografías»).
export const CASOS = Object.freeze([
  { n: 214, cliente: 'Harold Quiroz Benites', ficha: 'CONSUMO', distrito: 'La Victoria', resultado: 'OBSERVADO', auditor: 0, hace: [0, 11, 20], metros: 620, precision: 18, fotos: 2, comentario: 'El cliente indica que se mudó hace dos meses a una dirección cercana; la entrevista se hizo en el nuevo domicilio.' },
  { n: 213, cliente: 'Gladys Aranda Colonia', ficha: 'OTROS', distrito: 'Lince', resultado: 'CONFORME', auditor: 0, hace: [0, 9, 45], metros: 18, precision: 8, fotos: 2 },
  { n: 212, cliente: 'Marco Antonio Villar Renzo', ficha: 'CONSUMO', distrito: 'Surquillo', resultado: 'CONFORME', auditor: 0, hace: [1, 17, 10], metros: 25, precision: 11, fotos: 2 },
  { n: 211, cliente: 'Cinthia Rocio Vega Fuentes', ficha: 'CONSUMO', distrito: 'San Borja', resultado: 'CONFORME', auditor: 0, hace: [1, 15, 30], metros: 12, precision: 7, fotos: 1 },
  { n: 209, cliente: 'Andrea Rios Bazan', ficha: 'CONSUMO', distrito: 'Jesús María', resultado: 'OBSERVADO', auditor: 1, hace: [2, 18, 5], metros: 45, precision: 130, fotos: 2, comentario: 'Precisión GPS baja por interferencia dentro del local; se repite la validación en la próxima visita.' },
  { n: 208, cliente: 'Fabian Guerra Leon', ficha: 'CONSUMO', distrito: 'San Isidro', resultado: 'RECHAZADO', auditor: 1, hace: [2, 16, 20], metros: 40, precision: 15, fotos: 1, dispositivoIntegro: false, comentario: 'El dispositivo del auditor marcó indicios de manipulación (posible root). Se reprograma la visita con otro equipo.' },
  { n: 207, cliente: 'Diana Carolina Diaz Villanueva', ficha: 'OTROS', distrito: 'Miraflores', resultado: 'NO_UBICADO', auditor: 1, hace: [3, 14, 15], metros: 850, precision: 22, fotos: 1, comentario: 'No se ubicó al cliente en la dirección registrada. Los vecinos indican que el negocio cerró hace un mes.' },
  { n: 206, cliente: 'Jose Luis Salas Quinto', ficha: 'CONSUMO', distrito: 'Cercado de Lima', resultado: 'CONFORME', auditor: 1, hace: [3, 10, 40], metros: 22, precision: 10, fotos: 2 },
  { n: 204, cliente: 'Ruben Del Pino Nunja', ficha: 'OTROS', distrito: 'Barranco', resultado: 'RECHAZADO', auditor: 2, hace: [4, 19, 0], metros: 35, precision: 14, fotos: 1, gpsSimulado: true, comentario: 'Se detectó ubicación simulada (Fake GPS) en el dispositivo. Visita marcada para reprogramar con verificación presencial.' },
  { n: 203, cliente: 'Doris Ychpas Poma', ficha: 'CONSUMO', distrito: 'Santiago de Surco', resultado: 'CONFORME', auditor: 2, hace: [5, 20, 35], metros: 13, precision: 9, fotos: 0 },
  { n: 210, cliente: 'Kevin Alexis Nunia Sanchez', ficha: 'CONSUMO', distrito: 'Chorrillos', resultado: 'CONFORME', auditor: 2, hace: [5, 18, 15], metros: 30, precision: 12, fotos: 2 },
  { n: 205, cliente: 'Lucia Mendoza Ramos', ficha: 'OTROS', distrito: 'San Miguel', resultado: 'CONFORME', auditor: 2, hace: [6, 11, 50], metros: 16, precision: 8, fotos: 2 },
  { n: 202, cliente: 'Pedro Castillo Mayta', ficha: 'CONSUMO', distrito: 'Pueblo Libre', resultado: 'CONFORME', auditor: 0, hace: [6, 16, 25], metros: 21, precision: 10, fotos: 1 },
  { n: 201, cliente: 'Rosa Elena Paredes Quispe', ficha: 'OTROS', distrito: 'Breña', resultado: 'OBSERVADO', auditor: 0, hace: [7, 12, 10], metros: 70, precision: 16, fotos: 2, comentario: 'El negocio está en el segundo piso; se entró por la puerta lateral, a 70 m del punto registrado.' },
  { n: 200, cliente: 'Wilfredo Huaman Torres', ficha: 'CONSUMO', distrito: 'La Molina', resultado: 'CONFORME', auditor: 1, hace: [7, 9, 30], metros: 9, precision: 6, fotos: 2 },
  { n: 199, cliente: 'Teresa Cardenas Luna', ficha: 'OTROS', distrito: 'Ate', resultado: 'RECHAZADO', auditor: 1, hace: [8, 15, 40], metros: 38, precision: 13, fotos: 1, dispositivoIntegro: false, comentario: 'El dispositivo reportó observaciones de integridad; se pide repetir la visita desde otro equipo.' },
  { n: 198, cliente: 'Jorge Eliseo Vargas Rios', ficha: 'CONSUMO', distrito: 'Santiago de Surco', resultado: 'CONFORME', auditor: 2, hace: [8, 10, 5], metros: 27, precision: 9, fotos: 2 },
  { n: 197, cliente: 'Marleny Gutierrez Soto', ficha: 'CONSUMO', distrito: 'Magdalena del Mar', resultado: 'NO_UBICADO', auditor: 2, hace: [9, 17, 55], metros: 910, precision: 20, fotos: 1, comentario: 'La dirección no existe en la manzana indicada; el cliente no contesta el teléfono registrado.' },
  { n: 196, cliente: 'Cesar Augusto Rojas Meza', ficha: 'OTROS', distrito: 'San Luis', resultado: 'CONFORME', auditor: 0, hace: [9, 13, 20], metros: 19, precision: 8, fotos: 2 },
  { n: 195, cliente: 'Yesenia Flores Cardenas', ficha: 'CONSUMO', distrito: 'El Agustino', resultado: 'RECHAZADO', auditor: 0, hace: [10, 18, 30], metros: 55, precision: 17, fotos: 1, gpsSimulado: true, comentario: 'La ubicación del celular saltó 4 km en un minuto (posible GPS simulado). Se reprograma con verificación presencial.' },
  { n: 194, cliente: 'Nilton Ccahuana Poma', ficha: 'CONSUMO', distrito: 'Rímac', resultado: 'RECHAZADO', auditor: 1, hace: [10, 9, 10], metros: 14, precision: 9, fotos: 1, comentario: 'El cliente se negó a responder el cuestionario y a firmar el acta; se registra el rechazo.' },
  { n: 193, cliente: 'Elizabeth Chavez Ramos', ficha: 'OTROS', distrito: 'San Martín de Porres', resultado: 'CONFORME', auditor: 1, hace: [11, 14, 50], metros: 33, precision: 12, fotos: 2 },
  { n: 192, cliente: 'Julio Cesar Mamani Lopez', ficha: 'CONSUMO', distrito: 'Independencia', resultado: 'OBSERVADO', auditor: 2, hace: [11, 11, 15], metros: 28, precision: 11, fotos: 2, comentario: 'El cliente no estaba; atendió su cónyuge con poder y se deja constancia en la ficha.' },
  { n: 191, cliente: 'Sandra Vilca Huaman', ficha: 'OTROS', distrito: 'Los Olivos', resultado: 'CONFORME', auditor: 0, hace: [12, 16, 0], metros: 24, precision: 10, fotos: 2 },
]);

// Cuántas hay de cada resultado y de cada ficha (para comprobar el conjunto).
export function distribucion(casos = CASOS) {
  const porResultado = {}; const porFicha = {};
  for (const c of casos) { porResultado[c.resultado] = (porResultado[c.resultado] || 0) + 1; porFicha[c.ficha] = (porFicha[c.ficha] || 0) + 1; }
  return { total: casos.length, porResultado, porFicha };
}

const hash = (n, k) => (n * 2654435761 + k * 40503) >>> 0;

// Fecha y hora de una visita: «hace X días a las HH:MM» según el reloj de Lima. Si cayera en el futuro (hoy a una hora que todavía no llegó), se deja 10 min antes de ahora.
export function fechaDeVisita(ahoraMs, [dias, hora, minuto]) {
  const lima = new Date(ahoraMs - LIMA_MS - dias * DIA_MS); // el reloj de Lima leído como si fuera UTC
  const t = Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate(), hora, minuto) + LIMA_MS;
  return new Date(Math.min(t, ahoraMs - 10 * 60_000));
}

// Domicilio del cliente: el centro de su distrito con una pequeña variación fija por crédito (así no quedan todos amontonados).
export function domicilioDe(caso) {
  const [lat, lon] = DISTRITOS[caso.distrito] || DISTRITOS['Cercado de Lima'];
  const dLat = ((hash(caso.n, 1) % 11) - 5) * 0.0004; const dLon = ((hash(caso.n, 2) % 11) - 5) * 0.0004;
  const via = VIAS[hash(caso.n, 3) % VIAS.length]; const numero = 100 + (hash(caso.n, 4) % 1900);
  return { latitud: Number((lat + dLat).toFixed(6)), longitud: Number((lon + dLon).toFixed(6)), direccion: `${via} ${numero}, ${caso.distrito}` };
}

// Punto donde el asesor tomó la visita: `metros` hacia el norte del domicilio (la distancia que se guarda es exactamente esa).
export const puntoDeVisita = (latitud, longitud, metros) => ({ latitud: Number((latitud + metros / 111320).toFixed(6)), longitud });

const documentoDe = (n) => String(30000000 + ((n * 91337) % 69999999)).slice(0, 8);
const telefonoDe = (n) => `9${String(10000000 + ((n * 7919) % 89999999)).slice(0, 8)}`;

// Lo que lleva el expediente (los mismos bloques que trae una carga de Excel) para que la ficha y los «Datos de la base» no salgan vacíos.
export function datosDeExpediente(caso) {
  const n = caso.n; const mype = caso.ficha === 'OTROS'; const d = domicilioDe(caso);
  const monto = mype ? 8000 + (hash(n, 5) % 52) * 1000 : 3000 + (hash(n, 5) % 13) * 1000;
  const asesor = ASESORES[hash(n, 6) % ASESORES.length];
  return {
    codigo_expediente: `${PREFIJO_CODIGO}${n}`, tipo_credito: caso.ficha, oficina: `Agencia ${caso.distrito}`.slice(0, 100), numero_documento_cliente: documentoDe(n),
    nombres_cliente: caso.cliente, telefono_cliente: telefonoDe(n), direccion_domicilio: d.direccion, distrito: caso.distrito, provincia: 'Lima', departamento: 'Lima',
    latitud: d.latitud, longitud: d.longitud, asesor_responsable: asesor, monto_desembolso: monto, moneda: 'PEN', ubicacion_origen: 'REFERENCIA', autoasignable: false,
    datos_cliente: { fuente: 'Datos de demostración', fecha_nacimiento: `19${60 + (n % 35)}-0${1 + (n % 9)}-1${n % 9}`, edad: 60 - (n % 35) + 5, estado_civil: n % 2 ? 'CASADO' : 'SOLTERO', tipo_vivienda: n % 3 ? 'PROPIA' : 'ALQUILADA' },
    datos_negocio: { actividad: mype ? 'Comercio - bodega y venta de abarrotes' : 'Empleado dependiente', estado_negocio: 'EN_FUNCIONAMIENTO', antiguedad_negocio: `${1 + (n % 9)} años`, empleador: mype ? 'Independiente' : 'Empresa de servicios' },
    datos_credito: { asesor_solicitud: asesor, producto: mype ? 'Crédito MYPE' : 'Crédito Consumo Personal', fecha_vencimiento: '2027-12-15', estado: 'VIGENTE', calificacion_sbs: 'NORMAL' },
    evaluacion_financiera: { ingresos: [{ descripcion: mype ? 'Venta del negocio' : 'Sueldo mensual', relacion: 'TITULAR', moneda: 'PEN', monto: Math.round(monto / 4), tipo_ingreso: mype ? 'NEGOCIO' : 'DEPENDIENTE' }] },
    endeudamiento: { entidades: [{ entidad: 'Caja Huancayo', saldo: monto, calificacion: 'NORMAL', tipo_credito: mype ? 'MYPE' : 'CONSUMO' }] },
  };
}

// Respuestas del cuestionario de la ficha (las 3 primeras son las obligatorias contra el fraude interno).
export function respuestasDeCuestionario(n, resultado) {
  const llego = ['CONFORME', 'OBSERVADO'].includes(resultado);
  return {
    entrego_dinero_asesor: llego ? n % 11 === 0 : false, pago_comision_adicional: llego ? n % 13 === 0 : false, recibio_monto_total: llego ? n % 6 !== 0 : false,
    conyuge_conoce_prestamo: n % 2 === 0, creditos_paralelos: n % 4 === 0, comparte_dinero_credito: n % 3 === 0, titular_administra_negocio: n % 2 === 1, tiene_microseguro: n % 3 === 1,
    donde_realiza_pagos: n % 2 === 0 ? 'Agencia Caja Huancayo' : 'Agente autorizado',
  };
}

// Lo que se guarda de la visita (sin ids, que pone quien la crea). `domicilio` es el punto del expediente.
export function datosDeVisita(caso, ahoraMs, domicilio) {
  const punto = puntoDeVisita(domicilio.latitud, domicilio.longitud, caso.metros);
  const checkin = fechaDeVisita(ahoraMs, caso.hace);
  const llego = ['CONFORME', 'OBSERVADO'].includes(caso.resultado);
  return {
    client_sync_id: `${PREFIJO_SINCRONIZACION}${caso.n}`,
    fecha_hora_checkin: checkin, fecha_hora_checkout: new Date(checkin.getTime() + (18 + (caso.n % 20)) * 60_000), server_received_at: new Date(checkin.getTime() + 25 * 60_000),
    latitud: punto.latitud, longitud: punto.longitud, precision_metros: caso.precision, distancia_domicilio_m: caso.metros, ubicacion_visitada: 'DOMICILIO', direccion_visitada: domicilio.direccion,
    mock_location: Boolean(caso.gpsSimulado), device_integrity_ok: caso.dispositivoIntegro !== false, device_id: `demo-equipo-${caso.auditor}`,
    resultado: caso.resultado, respuestas_cuestionario: respuestasDeCuestionario(caso.n, caso.resultado),
    comentario_auditor: caso.comentario || null,
    comentario_negocio: llego && caso.ficha === 'OTROS' ? 'Negocio en funcionamiento, atendido por el titular al momento de la visita.' : null,
    plantilla: caso.ficha === 'OTROS' ? 'MYPE_V1' : 'CONSUMO_V1',
    estado_negocio: caso.ficha === 'OTROS' && llego ? 'EN_FUNCIONAMIENTO' : null, propiedad_local: caso.ficha === 'OTROS' && llego ? (caso.n % 2 ? 'ALQUILADO' : 'PROPIO') : null,
    estado: 'CERRADA',
  };
}
