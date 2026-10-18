import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { configuracion, redirectUriPermitida, verificarIdToken, elegirUsuarioLocal } from '../src/modules/auth/sso.service.js';

const cfg = { activo: true, issuer: 'https://cuenta.sulotec.com/realms/sulotec', clientId: 'auditoria' };

test('el inicio con Sulotec solo se activa con emisor (https) y cliente configurados', () => {
  assert.deepEqual(configuracion({}), { activo: false });
  assert.deepEqual(configuracion({ SSO_ISSUER: 'cuenta.sulotec.com', SSO_CLIENT_ID: 'auditoria' }), { activo: false });
  assert.deepEqual(configuracion({ SSO_ISSUER: 'https://cuenta.sulotec.com/realms/sulotec/', SSO_CLIENT_ID: 'auditoria' }), cfg);
});

test('el panel solo puede volver a una dirección propia terminada en /sso', () => {
  const origenes = ['https://auditoria.sulotec.com', 'http://localhost:5173'];
  assert.equal(redirectUriPermitida('https://auditoria.sulotec.com/sso', origenes), true);
  assert.equal(redirectUriPermitida('http://localhost:5173/sso', origenes), true);
  assert.equal(redirectUriPermitida('https://sitio-ajeno.example/sso', origenes), false);
  assert.equal(redirectUriPermitida('https://auditoria.sulotec.com/otra', origenes), false);
});

test('el id_token se acepta solo con la firma del emisor, su emisor y su audiencia', async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const otra = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const llaves = { 'kid-1': publicKey };
  const obtener = async (kid) => { if (!llaves[kid]) throw new Error('desconocida'); return llaves[kid]; };
  const firmar = (claims, llave = privateKey, extra = {}) => jwt.sign(claims, llave, { algorithm: 'RS256', keyid: 'kid-1', issuer: cfg.issuer, audience: cfg.clientId, expiresIn: '5m', ...extra });

  const claims = await verificarIdToken(firmar({ email: 'ana@caja.pe', email_verified: true, roles: [] }), cfg, obtener);
  assert.equal(claims.email, 'ana@caja.pe');
  await assert.rejects(() => verificarIdToken(firmar({ email: 'x' }, otra.privateKey), cfg, obtener), /inválido/);
  await assert.rejects(() => verificarIdToken(firmar({ email: 'x' }, privateKey, { issuer: 'https://otro.example' }), cfg, obtener), /inválido/);
  await assert.rejects(() => verificarIdToken(firmar({ email: 'x' }, privateKey, { audience: 'portal' }), cfg, obtener), /inválido/);
  await assert.rejects(() => verificarIdToken(firmar({ email: 'x' }, privateKey, { keyid: 'kid-9' }), cfg, obtener), /desconocida/);
});

test('la cuenta Sulotec se vincula a UN usuario local activo por correo; los auditores de campo y los universales sin rol no entran', () => {
  const admin = { id_usuario: 'u1', rol: 'ADMINISTRADOR', email: 'ana@caja.pe' };
  assert.equal(elegirUsuarioLocal({ email: 'Ana@caja.pe', email_verified: true }, [admin]), admin);
  assert.throws(() => elegirUsuarioLocal({ email: 'ana@caja.pe' }, []), /no está vinculada/);
  assert.throws(() => elegirUsuarioLocal({ email: 'ana@caja.pe' }, [admin, { ...admin, id_usuario: 'u2' }]), /más de un usuario/);
  assert.throws(() => elegirUsuarioLocal({ email: 'ana@caja.pe', email_verified: false }, [admin]), /Confirma tu correo/);
  assert.throws(() => elegirUsuarioLocal({}, [admin]), /no tiene correo/);
  assert.throws(() => elegirUsuarioLocal({ email: 'ana@caja.pe' }, [{ ...admin, rol: 'AUDITOR' }]), /aplicativo móvil/);
  assert.throws(() => elegirUsuarioLocal({ email: 'ana@caja.pe', roles: [] }, [{ ...admin, rol: 'UNIVERSAL' }]), /administrador general/);
  assert.equal(elegirUsuarioLocal({ email: 'ana@caja.pe', roles: ['administrador-general'] }, [{ ...admin, rol: 'UNIVERSAL' }]).rol, 'UNIVERSAL');
});
