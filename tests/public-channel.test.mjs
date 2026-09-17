import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';

test('portada y formulario renderizan el canal GENERAL sin contenido exclusivo', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' });
  try {
    const { renderPage } = await server.ssrLoadModule('/tests/public-channel.fixture.tsx');
    const landing = renderPage('/');
    const form = renderPage('/denuncia');
    assert.doesNotMatch(landing + form, /Ley Karin|LEY_KARIN|\/informacion/);
    assert.match(form, /Denuncia general/);
    assert.doesNotMatch(form, /DEL-045/);
    assert.match(form, /DEL-044/);
    assert.equal((form.match(/<select\b/g) ?? []).length, 2);
    assert.match(form, /Relación con la empresa \*<select required=""/);
    for (const field of ['Descripción detallada', 'Personas involucradas', 'Testigos',
      'Fecha del incidente', 'Documentación de respaldo', 'Contraseña para seguimiento']) {
      assert.ok(form.includes(field), field);
    }
    assert.match(form, /Información del denunciante \(opcional\)/);
  } finally {
    await server.close();
  }
});
