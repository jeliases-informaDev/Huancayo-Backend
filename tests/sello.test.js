import test from 'node:test';
import assert from 'node:assert/strict';
import { GENESIS, CAMPOS_SELLADOS, canonico, calcularSello, verificarCadena } from '../src/modules/sistema/sello.core.js';

const fila = (n, extra = {}) => ({
  secuencia: n, sello_previo: null, id_auditoria: `id-${n}`, empresa_id: 'e1', fecha: new Date(Date.UTC(2026, 9, 25, 12, 0, n)), request_id: `r${n}`,
  actor_id: 'u1', actor: 'ana', rol: 'ADMINISTRADOR', metodo: 'POST', ruta: '/api/usuarios', estado_http: 201, ip_address: '10.0.0.1', ip_hash: 'h', user_agent: 'ua',
  device_id: null, mock_location: null, entidad: 'Usuario', entidad_id: 'x', valor_anterior: null, valor_nuevo: { rol: 'AUDITOR', nombres: 'Ana', b: { z: 1, a: 2 } },
  accion: 'USUARIO_CREAR', categoria: 'USUARIOS', severidad: 'INFO', plataforma: 'WEB', con_cambios: true, ...extra,
});
// Arma una cadena válida de n anotaciones.
const cadena = (n) => {
  const filas = []; let previo = GENESIS;
  for (let i = 1; i <= n; i += 1) { const f = fila(i, { sello_previo: previo }); f.sello = calcularSello(f); filas.push(f); previo = f.sello; }
  return filas;
};

test('la forma canónica no depende del orden de las claves ni de cómo vengan null, undefined o las fechas', () => {
  assert.equal(canonico({ b: 1, a: { d: null, c: [1, 'x'] } }), canonico({ a: { c: [1, 'x'], d: undefined }, b: 1 }));
  assert.equal(canonico(undefined), canonico(null));
  assert.equal(canonico(new Date('2026-10-25T12:00:00.123Z')), '"2026-10-25T12:00:00.123Z"');
  assert.equal(canonico('a"b'), '"a\\"b"');
  assert.equal(canonico(NaN), 'null');
});

test('el sello cambia con cualquier campo sellado y no con el propio sello', () => {
  const base = fila(1, { sello_previo: GENESIS });
  const s = calcularSello(base);
  assert.match(s, /^[0-9a-f]{64}$/);
  assert.equal(calcularSello({ ...base, sello: 'lo que sea' }), s, 'el sello no entra en su propio cálculo');
  for (const campo of CAMPOS_SELLADOS) {
    const cambiada = { ...base, [campo]: campo === 'fecha' ? new Date(0) : campo === 'secuencia' || campo === 'estado_http' ? 999 : campo === 'con_cambios' || campo === 'mock_location' ? !base[campo] : 'otro' };
    assert.notEqual(calcularSello(cambiada), s, `cambiar ${campo} debía cambiar el sello`);
  }
  assert.equal(calcularSello({ ...base, valor_nuevo: { b: { a: 2, z: 1 }, nombres: 'Ana', rol: 'AUDITOR' } }), s, 'el mismo JSON con otro orden de claves da el mismo sello');
});

test('una cadena intacta verifica bien, por lotes y de corrido', () => {
  const filas = cadena(10);
  const r = verificarCadena(filas);
  assert.deepEqual(r, { ok: true, sello: filas[9].sello, secuencia: 10 });
  const a = verificarCadena(filas.slice(0, 4)); const b = verificarCadena(filas.slice(4), a);
  assert.equal(b.ok, true); assert.equal(b.secuencia, 10);
  assert.deepEqual(verificarCadena([]), { ok: true, sello: GENESIS, secuencia: null });
});

test('modificar, borrar, insertar o reemplazar una anotación rompe la cadena y se dice cuál y por qué', () => {
  const intacta = cadena(6);
  const modificada = intacta.map((f) => (f.secuencia === 3 ? { ...f, ruta: '/api/otra' } : f));
  assert.deepEqual(verificarCadena(modificada), { ok: false, secuencia: 3, motivo: 'CONTENIDO', detalle: 'su contenido no coincide con su sello: fue modificada' });
  const borrada = intacta.filter((f) => f.secuencia !== 4);
  assert.equal(verificarCadena(borrada).secuencia, 5); assert.equal(verificarCadena(borrada).motivo, 'SALTO');
  // Reemplazo «perfecto»: alguien recalcula el sello de la n.° 3 después de cambiarla. La n.° 4 ya no enlaza.
  const reemplazada = intacta.map((f) => { if (f.secuencia !== 3) return f; const g = { ...f, ruta: '/api/otra' }; g.sello = calcularSello(g); return g; });
  assert.deepEqual(verificarCadena(reemplazada).motivo, 'ENLACE'); assert.equal(verificarCadena(reemplazada).secuencia, 4);
  // Empezar a verificar desde la mitad sin el sello correcto de la anterior también se nota.
  assert.equal(verificarCadena(intacta.slice(2), { sello: 'x'.repeat(64), secuencia: 2 }).motivo, 'ENLACE');
});
