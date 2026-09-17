import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test, afterEach } from 'node:test';

// Node 24: tests the actual API module without adding a test framework.
const source = await readFile(new URL('../src/app/services/api.ts', import.meta.url), 'utf8');
const code = stripTypeScriptTypes(source.replaceAll('import.meta.env',
  '({ VITE_API_URL: "https://api.example.test/" })'));
const { crearDenuncia, ApiError, MAX_ARCHIVO_BYTES } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});
const request = {
  codigoEmpresa: 'test', tipoDenuncia: 'LEY_KARIN', delitoCodigo: 'DEL-001',
  delitoTipificacion: 'Fraude', relacionEmpresa: 'TRABAJADOR',
  descripcion: 'Contenido confidencial sintético', password: 'clave-sintetica',
};
const success = { codigo: 'DEN-TEST', estado: 'RECIBIDA' };

for (const withFile of [false, true]) {
  test(`multipart real y GENERAL obligatorio ${withFile ? 'con' : 'sin'} archivo`, async () => {
    const file = withFile ? new File(['evidencia sintética'], 'evidencia.txt', { type: 'text/plain' }) : null;
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.example.test/api/denuncias');
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers, undefined);
      // Serialize and parse the multipart using Fetch, verifying its generated boundary.
      const wireRequest = new Request(url, options);
      assert.match(wireRequest.headers.get('content-type'), /^multipart\/form-data; boundary=.+/);
      const form = await wireRequest.formData();
      const data = form.get('data');
      assert.equal(data.type, 'application/json');
      assert.equal(data.name, 'data.json');
      assert.deepEqual(JSON.parse(await data.text()), { ...request, tipoDenuncia: 'GENERAL' });
      if (withFile) assert.equal(await form.get('archivo').text(), 'evidencia sintética');
      else assert.equal(form.get('archivo'), null);
      return Response.json(success, { status: 201 });
    };
    assert.deepEqual(await crearDenuncia(request, file), success);
  });
}

test('rechaza archivo demasiado grande antes de usar la red', async () => {
  globalThis.fetch = () => assert.fail('No debe enviar un archivo mayor al límite');
  const file = new File([new Uint8Array(MAX_ARCHIVO_BYTES + 1)], 'grande.bin');
  await assert.rejects(crearDenuncia(request, file), e => e.kind === 'validation' && e.status === 413);
});

for (const status of [400, 413, 422, 500, 502, 504]) {
  test(`distingue HTTP ${status} y no registra contenido confidencial`, async () => {
    const logs = [];
    console.error = (...args) => logs.push(args);
    globalThis.fetch = async () => Response.json({
      status, message: request.descripcion, password: request.password,
    }, { status, headers: { 'X-Request-ID': 'abc-123' } });
    await assert.rejects(crearDenuncia(request), e => e instanceof ApiError && e.status === status &&
      e.kind === ([400, 413, 422].includes(status) ? 'validation' : 'http'));
    assert.equal(logs[0][1].requestId, 'abc-123');
    assert.equal(logs[0][1].responseBody.status, status);
    assert.ok(!JSON.stringify(logs).includes(request.password));
    assert.ok(!JSON.stringify(logs).includes(request.descripcion));
  });
}

for (const message of ['Failed to fetch', 'Load failed', request.password]) {
  test(`error de red preserva causa y sanitiza el diagnóstico (${message === request.password ? 'sensible' : message})`, async () => {
    let log;
    console.error = (_message, detail) => { log = detail; };
    const original = new TypeError(message);
    globalThis.fetch = async () => { throw original; };
    await assert.rejects(crearDenuncia(request), e => e.kind === 'network' && e.cause === original &&
      e.message === 'No fue posible comunicarse con el servidor. Por favor intenta nuevamente.');
    assert.equal(log.status, null);
    assert.equal(log.url, 'https://api.example.test/api/denuncias');
    assert.equal(log.method, 'POST');
    assert.ok(!JSON.stringify(log).includes(request.password));
  });
}

test('HTML 413 de un proxy sigue siendo error HTTP de tamaño', async () => {
  console.error = () => {};
  globalThis.fetch = async () => new Response('<html>413 Request Entity Too Large</html>', { status: 413 });
  await assert.rejects(crearDenuncia(request), e => e.status === 413 && e.kind === 'validation');
});

test('respuesta 200 inesperada no se confunde con creación exitosa', async () => {
  console.error = () => {};
  globalThis.fetch = async () => new Response('<html>inicio de sesión</html>');
  await assert.rejects(crearDenuncia(request), e => e.status === 200 && e.kind === 'response');
});

test('no reintenta POST automáticamente si pierde la conexión', async () => {
  let calls = 0;
  console.error = () => {};
  globalThis.fetch = async () => { calls++; throw new TypeError('Failed to fetch'); };
  await assert.rejects(crearDenuncia(request));
  assert.equal(calls, 1);
});
