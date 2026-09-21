import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  loginBody, userCreateBody, userUpdateBody, listQuery, visitasListQuery,
  expedienteCreateBody, asignacionCreateBody, asignacionBulkBody,
  cuestionarioSchema, ubicacionBody, evidenciaPresignBody, visitaCreateBody,
} from '../src/validation/schemas.js';

describe('loginBody', () => {
  test('acepta usuario y contraseña validos', () => {
    assert.equal(loginBody.safeParse({ username: 'auditor.ramos', password: 'x' }).success, true);
  });
  test('rechaza si falta la contraseña', () => {
    assert.equal(loginBody.safeParse({ username: 'auditor.ramos' }).success, false);
  });
  test('rechaza campos extra (.strict())', () => {
    assert.equal(loginBody.safeParse({ username: 'a', password: 'b', rol: 'ADMINISTRADOR' }).success, false);
  });
  test('rechaza username vacio', () => {
    assert.equal(loginBody.safeParse({ username: '', password: 'b' }).success, false);
  });
});

describe('userCreateBody', () => {
  const base = { username: 'auditor.test', password: 'PruebaQA2026Segura', rol: 'AUDITOR' };

  test('acepta el minimo requerido', () => {
    assert.equal(userCreateBody.safeParse(base).success, true);
  });
  test('rechaza contraseña de menos de 12 caracteres', () => {
    const r = userCreateBody.safeParse({ ...base, password: 'corta123' });
    assert.equal(r.success, false);
  });
  test('rechaza un rol que no existe', () => {
    assert.equal(userCreateBody.safeParse({ ...base, rol: 'ASESOR' }).success, false);
  });
  test('rechaza username con espacios o simbolos no permitidos', () => {
    assert.equal(userCreateBody.safeParse({ ...base, username: 'auditor ramos' }).success, false);
    assert.equal(userCreateBody.safeParse({ ...base, username: 'auditor@ramos' }).success, false);
  });
  test('acepta email vacio (string vacio explicitamente permitido)', () => {
    assert.equal(userCreateBody.safeParse({ ...base, email: '' }).success, true);
  });
  test('rechaza un email con formato invalido', () => {
    assert.equal(userCreateBody.safeParse({ ...base, email: 'no-es-un-correo' }).success, false);
  });
  test('userUpdateBody exige al menos un campo', () => {
    assert.equal(userUpdateBody.safeParse({}).success, false);
  });
  test('userUpdateBody acepta actualizar un solo campo', () => {
    assert.equal(userUpdateBody.safeParse({ estado: 'INACTIVO' }).success, true);
  });
});

describe('expedienteCreateBody', () => {
  const base = {
    codigo_expediente: 'CH-TEST-0001', tipo_credito: 'CONSUMO',
    numero_documento_cliente: '12345678', nombres_cliente: 'Cliente de Prueba',
    asesor_responsable: 'Asesor de Prueba',
  };

  test('acepta el minimo requerido (sin distrito/provincia/departamento/coordenadas)', () => {
    assert.equal(expedienteCreateBody.safeParse(base).success, true);
  });
  test('acepta departamento, provincia y distrito juntos', () => {
    const r = expedienteCreateBody.safeParse({ ...base, distrito: 'El Tambo', provincia: 'Huancayo', departamento: 'Junín' });
    assert.equal(r.success, true);
  });
  test('rechaza latitud fuera de rango', () => {
    assert.equal(expedienteCreateBody.safeParse({ ...base, latitud: 200, longitud: -75 }).success, false);
  });
  test('rechaza tipo_credito que no sea CONSUMO/OTROS', () => {
    assert.equal(expedienteCreateBody.safeParse({ ...base, tipo_credito: 'HIPOTECARIO' }).success, false);
  });
  test('tipo_documento_cliente por defecto es DNI si no se envia', () => {
    const r = expedienteCreateBody.safeParse(base);
    assert.equal(r.success, true);
    assert.equal(r.data.tipo_documento_cliente, 'DNI');
  });
  test('rechaza monto_desembolso negativo', () => {
    assert.equal(expedienteCreateBody.safeParse({ ...base, monto_desembolso: -100 }).success, false);
  });
});

describe('asignacionBulkBody', () => {
  const uuid = '215e7214-1da8-4768-a1ed-c05ebf97a525';
  test('acepta una lista de expedientes valida', () => {
    const r = asignacionBulkBody.safeParse({ id_usuario_auditor: uuid, id_expedientes: [1, 2, 3] });
    assert.equal(r.success, true);
  });
  test('rechaza una lista vacia de expedientes', () => {
    assert.equal(asignacionBulkBody.safeParse({ id_usuario_auditor: uuid, id_expedientes: [] }).success, false);
  });
  test('rechaza mas de 500 expedientes de una vez', () => {
    const muchos = Array.from({ length: 501 }, (_, i) => i + 1);
    assert.equal(asignacionBulkBody.safeParse({ id_usuario_auditor: uuid, id_expedientes: muchos }).success, false);
  });
  test('rechaza un id_usuario_auditor que no es UUID', () => {
    assert.equal(asignacionBulkBody.safeParse({ id_usuario_auditor: 'no-es-uuid', id_expedientes: [1] }).success, false);
  });
});
test('asignacionCreateBody: prioridad es opcional pero si se envia debe ser ALTA/MEDIA/BAJA', () => {
  const uuid = '215e7214-1da8-4768-a1ed-c05ebf97a525';
  assert.equal(asignacionCreateBody.safeParse({ id_expediente: 1, id_usuario_auditor: uuid }).success, true);
  assert.equal(asignacionCreateBody.safeParse({ id_expediente: 1, id_usuario_auditor: uuid, prioridad: 'URGENTE' }).success, false);
});

describe('ubicacionBody', () => {
  test('acepta coordenadas validas de Peru', () => {
    assert.equal(ubicacionBody.safeParse({ latitud: -12.0653, longitud: -75.2049 }).success, true);
  });
  test('rechaza longitud fuera de rango', () => {
    assert.equal(ubicacionBody.safeParse({ latitud: -12, longitud: 200 }).success, false);
  });
});

describe('cuestionarioSchema — preguntas obligatorias de la ficha', () => {
  const completo = {
    entrego_dinero_asesor: false, pago_comision_adicional: false, recibio_monto_total: true,
  };
  test('acepta las 3 preguntas obligatorias sin las opcionales', () => {
    assert.equal(cuestionarioSchema.safeParse(completo).success, true);
  });
  test('rechaza si falta una pregunta obligatoria (recibio_monto_total)', () => {
    const { recibio_monto_total, ...incompleto } = completo;
    assert.equal(cuestionarioSchema.safeParse(incompleto).success, false);
  });
});

describe('evidenciaPresignBody', () => {
  test('solo acepta image/jpeg como content_type', () => {
    const base = { id_expediente: 1, tipo: 'FOTO_PRINCIPAL', size: 100000 };
    assert.equal(evidenciaPresignBody.safeParse({ ...base, content_type: 'image/jpeg' }).success, true);
    assert.equal(evidenciaPresignBody.safeParse({ ...base, content_type: 'image/png' }).success, false);
  });
});

describe('visitaCreateBody — payload completo de cierre de visita', () => {
  const firmaValida = `data:image/png;base64,${Buffer.from('firma-de-prueba').toString('base64')}`;
  const base = {
    id_expediente: 1,
    fecha_hora_checkin: new Date().toISOString(),
    latitud: -12.0653, longitud: -75.2049,
    resultado: 'CONFORME',
    respuestas_cuestionario: { entrego_dinero_asesor: false, pago_comision_adicional: false, recibio_monto_total: true },
    firma_evidencia: firmaValida,
    evidencia_principal_key: 'evidencias/1/foto.jpg',
  };

  test('acepta un payload minimo valido', () => {
    const r = visitaCreateBody.safeParse(base);
    assert.equal(r.success, true, JSON.stringify(r.success ? null : r.error.issues));
  });
  test('mock_location y device_integrity_ok tienen valores por defecto seguros', () => {
    const r = visitaCreateBody.safeParse(base);
    assert.equal(r.data.mock_location, false);
    assert.equal(r.data.device_integrity_ok, true);
  });
  test('rechaza un resultado que no es uno de los 4 validos', () => {
    assert.equal(visitaCreateBody.safeParse({ ...base, resultado: 'PENDIENTE' }).success, false);
  });
  test('rechaza firma_evidencia que no sea un PNG en base64 con el prefijo data URI correcto', () => {
    assert.equal(visitaCreateBody.safeParse({ ...base, firma_evidencia: 'no-es-una-firma' }).success, false);
  });
  test('rechaza una fecha de checkin con formato invalido', () => {
    assert.equal(visitaCreateBody.safeParse({ ...base, fecha_hora_checkin: '18/09/2026' }).success, false);
  });
  test('acepta hasta 10 "otros clientes en el domicilio" pero rechaza 11', () => {
    const otros = Array.from({ length: 10 }, () => ({ nombre: 'X' }));
    assert.equal(visitaCreateBody.safeParse({ ...base, otros_clientes_domicilio: otros }).success, true);
    assert.equal(visitaCreateBody.safeParse({ ...base, otros_clientes_domicilio: [...otros, { nombre: 'Y' }] }).success, false);
  });
});
