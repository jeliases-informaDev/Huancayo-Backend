import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ZodError } from 'zod';
import { errorHandler, notFoundHandler } from '#core/middlewares/error.middleware.js';

function fakeRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return res;
}

function fakeReq() {
  return { id: 'req-test-id', method: 'GET', originalUrl: '/api/test' };
}

describe('errorHandler', () => {
  test('un error de restricción única de Prisma (P2002) se traduce a 409 con mensaje legible', () => {
    const res = fakeRes();
    const error = Object.assign(new Error('Unique constraint failed'), { code: 'P2002', meta: { target: ['username'] } });
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.code, 'DUPLICATE_KEY');
    assert.match(res.body.error, /username/);
  });

  test('P2002 sin meta.target usa un mensaje generico pero igual de legible', () => {
    const res = fakeRes();
    const error = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 409);
    assert.equal(res.body.error, 'Ya existe un registro con ese valor único');
  });

  test('un JSON roto no devuelve el texto interno del interprete', () => {
    const res = fakeRes();
    const error = Object.assign(new SyntaxError("Expected property name or '}' in JSON at position 1 (line 1 column 2)"), { type: 'entity.parse.failed', statusCode: 400, status: 400 });
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, 'INVALID_JSON');
    assert.equal(res.body.error, 'El cuerpo de la petición no es un JSON válido');
    assert.doesNotMatch(JSON.stringify(res.body), /position|column|Expected/);
  });

  test('un cuerpo demasiado grande responde 413 con un mensaje propio', () => {
    const res = fakeRes();
    const error = Object.assign(new Error('request entity too large'), { type: 'entity.too.large', statusCode: 413, status: 413 });
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 413);
    assert.equal(res.body.code, 'PAYLOAD_TOO_LARGE');
    assert.doesNotMatch(res.body.error, /entity/);
  });

  test('un error operacional (con statusCode < 500) conserva su propio mensaje', () => {
    const res = fakeRes();
    const error = Object.assign(new Error('Expediente no encontrado'), { statusCode: 404 });
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Expediente no encontrado');
  });

  test('un error sin statusCode (bug inesperado) se enmascara como 500 generico, sin filtrar detalles internos', () => {
    const res = fakeRes();
    const error = new Error('cannot read property of undefined at some/internal/path.js:42');
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, 'Error interno del servidor');
    assert.equal(res.body.code, 'INTERNAL_ERROR');
    assert.equal(res.body.details, undefined);
  });

  test('un ZodError se traduce a 400 con el detalle de los campos invalidos', () => {
    const res = fakeRes();
    const zodResult = ZodError.prototype;
    const error = new ZodError([{ code: 'invalid_type', path: ['username'], message: 'Requerido', expected: 'string' }]);
    errorHandler(error, fakeReq(), res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Los datos enviados no son válidos');
    assert.deepEqual(res.body.details, [{ field: 'username', message: 'Requerido' }]);
  });

  test('notFoundHandler responde 404 con codigo NOT_FOUND', () => {
    const res = fakeRes();
    notFoundHandler(fakeReq(), res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.code, 'NOT_FOUND');
  });
});
