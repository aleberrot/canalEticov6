import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test, afterEach } from 'node:test';
const source = await readFile(new URL('../src/app/services/api.ts', import.meta.url), 'utf8');
const code = stripTypeScriptTypes(source.replaceAll('import.meta.env', '({ VITE_API_URL: "https://api.example.test" })'));
const { agregarInformacionAdicional, crearDenuncia, descargarAporte, MAX_ARCHIVO_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('límite compartido de 50 MB', () => assert.equal(MAX_ARCHIVO_BYTES, 50 * 1024 * 1024));
for (const size of [0, 2 * 1024 * 1024, MAX_ARCHIVO_BYTES - 1, MAX_ARCHIVO_BYTES]) {
  test(`aporte de ${size} bytes: multipart sin Content-Type manual`, async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(options.method, 'POST'); assert.equal(options.headers, undefined);
      assert.equal(options.redirect, 'error'); assert.equal(options.credentials, 'omit');
      assert.equal(options.body.get('password'), 'clave');
      assert.equal(options.body.get('archivo')?.size ?? 0, size);
      return Response.json({ aportes: [{ id: '1' }] });
    };
    const result = await agregarInformacionAdicional('TEST', 'clave', 'Texto', size ? new File([new Uint8Array(size)], 'test.bin') : null);
    assert.equal(result.aportes.length, 1);
  });
}
test('rechaza >50 MB y aporte vacío antes de enviar', async () => {
  globalThis.fetch = () => assert.fail('No debe enviar');
  await assert.rejects(agregarInformacionAdicional('TEST', 'clave', 'Texto', new File([new Uint8Array(MAX_ARCHIVO_BYTES + 1)], 'grande')), e => e.status === 413);
  await assert.rejects(agregarInformacionAdicional('TEST', 'clave', '  '), e => e.status === 400);
});
test('dos aportes sucesivos generan dos envíos separados sin reutilizar texto anterior', async () => {
  const texts = [];
  globalThis.fetch = async (_url, options) => { texts.push(options.body.get('informacion')); return Response.json({ aportes: [...texts] }); };
  await agregarInformacionAdicional('TEST', 'clave', 'Primero');
  const result = await agregarInformacionAdicional('TEST', 'clave', 'Segundo');
  assert.deepEqual(result.aportes, ['Primero', 'Segundo']);
});
test('no reintenta aportes ante errores de red', async () => {
  let calls = 0; globalThis.fetch = async () => { calls++; throw new TypeError('Failed to fetch'); };
  await assert.rejects(agregarInformacionAdicional('TEST', 'clave', 'Texto')); assert.equal(calls, 1);
});
test('descarga pública usa contraseña en cuerpo, nunca URL', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.example.test/api/denuncias/TEST/aportes/1/archivo');
    assert.equal(options.method, 'POST'); assert.deepEqual(JSON.parse(options.body), { password: 'clave' });
    return Response.json({ message: 'Acceso denegado' }, { status: 401 });
  };
  await assert.rejects(descargarAporte('TEST', { id: '1' }, { password: 'clave' }), e => e.status === 401);
});
test('creación GENERAL conserva tipo y metadatos de consentimiento', async () => {
  const data = { tipoDenuncia: 'GENERAL', terminosAceptados: true, versionTerminos: 'temporal-v3' };
  globalThis.fetch = async (_url, options) => {
    assert.deepEqual(JSON.parse(await options.body.get('data').text()), data);
    return Response.json({ codigo: 'TEST', estado: 'RECIBIDA' });
  };
  await crearDenuncia(data);
});
