import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { test, afterEach } from 'node:test';
const source = await readFile(new URL('../src/app/services/api.ts', import.meta.url), 'utf8');
const code = stripTypeScriptTypes(source.replaceAll('import.meta.env', '({ VITE_API_URL: "https://api.example.test/" })'));
const api = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
test('branding: canal correcto, tiempo máximo y credenciales omitidas', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.example.test/api/empresas/emp-02');
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    return Response.json({ codigo: 'emp-02', nombre: 'Empresa 2', activa: true });
  };
  assert.equal((await api.obtenerEmpresaPublica('emp-02')).codigo, 'emp-02');
});
test('branding: canal inactivo conserva error y no reutiliza una empresa anterior', async () => {
  globalThis.fetch = async () => Response.json({ message: 'Canal inactivo' }, { status: 409 });
  await assert.rejects(api.obtenerEmpresaPublica('emp-02'), e => e.status === 409);
});
test('seguimiento conserva código, contraseña y branding propio', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.example.test/api/denuncias/seguimiento');
    assert.deepEqual(JSON.parse(options.body), { code: 'DEN-SINTETICO', password: 'clave-prueba' });
    return Response.json({ codigoUnico: 'DEN-SINTETICO', empresa: { codigo: 'emp-02', logo: '/cliente-2.png' } });
  };
  assert.equal((await api.consultarDenuncia({ code: 'DEN-SINTETICO', password: 'clave-prueba' })).empresa.codigo, 'emp-02');
});
test('dos denuncias independientes no reutilizan datos ni adjuntos en el transporte', async () => {
  const sent = [];
  globalThis.fetch = async (_url, options) => {
    const form = await new Request('https://api.example.test', options).formData();
    sent.push({ data: JSON.parse(await form.get('data').text()), file: form.get('archivo') });
    return Response.json({ codigo: 'DEN-' + sent.length, estado: 'RECIBIDA' });
  };
  await api.crearDenuncia({ codigoEmpresa: 'emp-01', tipoDenuncia: 'GENERAL', password: 'primera-clave', telefonoDenunciante: 'telefono-sintetico' }, new File(['primero'], 'prueba.txt'));
  await api.crearDenuncia({ codigoEmpresa: 'emp-02', tipoDenuncia: 'LEY_KARIN', password: 'segunda-clave', telefonoDenunciante: '' });
  assert.equal(sent[1].data.password, 'segunda-clave');
  assert.equal(sent[1].data.telefonoDenunciante, '');
  assert.equal(sent[1].data.codigoEmpresa, 'emp-02');
  assert.equal(sent[1].file, null);
});

test('la espera de empresa tolera arranque en frío sin superar dos minutos', async () => {
  const originalTimeout = globalThis.setTimeout;
  let requestedTimeout;
  globalThis.setTimeout = (callback, ms) => {
    requestedTimeout = ms;
    return originalTimeout(callback, ms);
  };
  try {
    globalThis.fetch = async () => Response.json({ codigo: 'emp-01', nombre: 'Empresa 1', activa: true });
    await api.obtenerEmpresaPublica('emp-01');
    assert.ok(requestedTimeout >= 60000, '15 s interrumpe un arranque en frío');
    assert.ok(requestedTimeout <= 120000, 'la espera debe permanecer acotada');
  } finally {
    globalThis.setTimeout = originalTimeout;
  }
});
test('abandonar un canal cancela su consulta pendiente sin reintentos automáticos', async () => {
  const controller = new AbortController();
  let calls = 0;
  globalThis.fetch = (_url, options) => {
    calls++;
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
    });
  };
  const result = assert.rejects(api.obtenerEmpresaPublica('emp-01', controller.signal),
    error => error.name === 'AbortError');
  controller.abort();
  await result;
  assert.equal(calls, 1);
});

test('empresa, sucursales y seguimiento funcionan sin AbortSignal.any ni timeout', async () => {
  const any = AbortSignal.any;
  const timeout = AbortSignal.timeout;
  AbortSignal.any = undefined;
  AbortSignal.timeout = undefined;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json(calls === 2 ? [] : { codigo: 'mathiesen' });
  };
  try {
    await api.obtenerEmpresaPublica('mathiesen', new AbortController().signal);
    await api.obtenerSucursales('mathiesen', undefined, new AbortController().signal);
    await api.consultarDenuncia({ code: 'DEN-SINTETICO', password: 'clave-prueba' });
    await api.guardarSucursal('mathiesen', {codigo:'test',nombre:'Sintética',activa:true}, 'synthetic', true);
    assert.equal(calls, 4);
  } finally {
    AbortSignal.any = any;
    AbortSignal.timeout = timeout;
  }
});

test('la espera cancela también lectura JSON lenta y libera el temporizador', async () => {
  const originalSet = globalThis.setTimeout;
  const originalClear = globalThis.clearTimeout;
  let expire;
  let cleared = false;
  let calls = 0;
  const timer = {};
  globalThis.setTimeout = callback => { expire = callback; return timer; };
  globalThis.clearTimeout = value => { assert.equal(value, timer); cleared = true; };
  globalThis.fetch = async (_url, options) => {
    calls++;
    return { ok: true, json: () => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason), {once:true});
    }) };
  };
  try {
    const pending = api.obtenerEmpresaPublica('mathiesen');
    await Promise.resolve();
    expire();
    await assert.rejects(pending, error => error.name === 'TimeoutError');
    assert.equal(calls, 1);
    assert.equal(cleared, true);
  } finally {
    globalThis.setTimeout = originalSet;
    globalThis.clearTimeout = originalClear;
  }
});

test('completar o fallar la carga libera temporizador y escucha de navegación', async () => {
  const originalClear = globalThis.clearTimeout;
  let cleared = 0;
  globalThis.clearTimeout = timer => { cleared++; originalClear(timer); };
  const controller = new AbortController();
  const originalRemove = controller.signal.removeEventListener.bind(controller.signal);
  let removed = 0;
  controller.signal.removeEventListener = (...args) => { removed++; originalRemove(...args); };
  try {
    globalThis.fetch = async () => Response.json({codigo:'mathiesen'});
    await api.obtenerEmpresaPublica('mathiesen', controller.signal);
    globalThis.fetch = async () => { throw new TypeError('synthetic network failure'); };
    await assert.rejects(api.obtenerEmpresaPublica('mathiesen', controller.signal), /synthetic network failure/);
    assert.equal(cleared, 2);
    assert.equal(removed, 2);
  } finally { globalThis.clearTimeout = originalClear; }
});
