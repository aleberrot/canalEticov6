import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';

test('flujos separados, términos obligatorios y trazabilidad pública', async (t) => {
  const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' });
  try {
    const { renderPage, renderHistory } = await server.ssrLoadModule('/tests/public-channel.fixture.tsx');
    await t.test('landing muestra general y luego Ley Karin', () => {
      const landing = renderPage('/');
      assert.ok(landing.indexOf('Enviar denuncia general') < landing.indexOf('Enviar denuncia por Ley Karin'));
      assert.match(landing, /\/canal\/emp-test\/denuncia-ley-karin/);
    });
    for (const path of ['/denuncia', '/denuncia-ley-karin']) {
      await t.test(`acceso directo ${path} exige términos antes del formulario`, () => {
        const gate = renderPage(path);
        assert.match(gate, /Términos y condiciones/);
        assert.match(gate, /He leído y aceptado todos los términos y condiciones\./);
        assert.match(gate, /Por favor coloque la mayor cantidad de datos posibles al realizar su reporte\./);
        assert.match(gate, /type="checkbox" required=""/);
        assert.match(gate, /type="submit" disabled=""/);
        assert.doesNotMatch(gate, /Descripción detallada|passwordSeguimiento/);
      });
    }
    await t.test('GENERAL mantiene campos y no incluye catálogo exclusivo Karin', () => {
      const form = renderPage('/accepted-general');
      assert.match(form, /Denuncia general/);
      assert.doesNotMatch(form, /Ley Karin|LEY_KARIN|DEL-045|Acoso Laboral|Discriminación/);
      assert.match(form, /DEL-044/);
      assert.equal((form.match(/<select\b/g) ?? []).length, 2);
      for (const field of ['Descripción detallada', 'Personas involucradas', 'Testigos', 'Fecha del incidente', 'Documentación de respaldo', 'Contraseña para seguimiento', '50 MB']) assert.ok(form.includes(field), field);
      assert.match(form, /Información del denunciante \(opcional\)/);
    });
    await t.test('LEY_KARIN solo muestra sus cuatro opciones e identidad obligatoria', () => {
      const form = renderPage('/accepted-karin');
      for (const name of ['Acoso Laboral', 'Acoso Sexual', 'Violencia en el trabajo', 'Discriminación']) assert.ok(form.includes(name), name);
      assert.doesNotMatch(form, /DEL-001|DEL-044/);
      assert.match(form, /Información del denunciante \(obligatoria\)/);
      for (const label of ['Nombre completo', 'Correo electrónico', 'Teléfono']) assert.ok(form.includes(`aria-label="${label}" required=""`));
    });
    await t.test('historial vacío, legacy y múltiples aportes con adjunto', () => {
      assert.match(renderHistory([], undefined), /No se han enviado aportes/);
      const history = renderHistory([
        { id: 'legacy', informacion: 'Dato previo', legacy: true, tieneArchivo: false },
        { id: '1', informacion: 'Primer aporte', createdAt: '2026-09-18T10:32:00Z', tieneArchivo: true, nombreArchivo: 'documento1.pdf' },
        { id: '2', informacion: 'Segundo aporte', createdAt: '2026-09-20T15:45:00Z', tieneArchivo: false },
      ]);
      assert.match(history, /Fecha y hora no disponibles/);
      assert.match(history, /documento1.pdf/);
      assert.ok(history.indexOf('Primer aporte') < history.indexOf('Segundo aporte'));
      assert.match(history, /Aporte #1/); assert.match(history, /Aporte #2/);
    });
  } finally { await server.close(); }
});
