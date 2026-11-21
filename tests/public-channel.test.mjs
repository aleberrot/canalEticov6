import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';

test('flujos separados, términos obligatorios y trazabilidad pública', async (t) => {
  const server = await createServer({ configFile: false, esbuild: { jsx: 'automatic' }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null }, appType: 'custom' });
  try {
    const { renderPage, renderHistory, renderReportDetails, renderAdminLogin, renderChannelLoading, renderChannelUnavailable } = await server.ssrLoadModule('/tests/public-channel.fixture.tsx');
    await t.test('arranque lento informa espera acotada sin declarar inválida la empresa', () => {
      const loading = renderChannelLoading(true);
      assert.match(loading, /90 segundos/);
      assert.doesNotMatch(loading, /Canal no disponible|enlace.*válido/);
      assert.doesNotMatch(renderChannelLoading(false), /90 segundos/);
    });
    await t.test('error transitorio permite reintentar y empresa inactiva no propone reintento', () => {
      assert.match(renderChannelUnavailable(true), /Volver a intentar/);
      assert.doesNotMatch(renderChannelUnavailable(false), /Volver a intentar/);
    });
    await t.test('landing muestra general y luego Ley Karin', () => {
      const landing = renderPage('/');
      assert.ok(landing.indexOf('Enviar denuncia general') < landing.indexOf('Enviar denuncia por Ley Karin'));
      assert.match(landing, /\/canal\/emp-test\/denuncia-ley-karin/);
    });
    await t.test('inicio incorpora introducción aprobada y acceso a términos', () => {
      const landing = renderPage('/');
      assert.ok(landing.includes('La empresa Empresa de prueba ha implementado'));
      assert.ok(landing.includes('Términos y condiciones'));
      assert.ok(landing.includes('soporte@conthrol.com'));
    });
    await t.test('WEBETIKO aparece en cabecera administrativa sin abrir un detalle', () => {
      assert.match(renderPage('/admin'), /<header[^>]*>[\s\S]*?WEBETIKO[\s\S]*?<\/header>/);
    });
    await t.test('seguimiento cargado renderiza descripción, conclusión y un único logo por cliente', () => {
      for (const code of ['emp-01', 'emp-02']) {
        const detail = renderReportDetails({
          codigoUnico: 'DEN-PRUEBA', tipoDenuncia: 'GENERAL', estado: 'RECIBIDA',
          descripcion: 'Descripción sintética', conclusionesMedidas: 'Conclusión sintética',
          createdAt: '2026-11-21', updatedAt: '2026-11-21', aportes: [],
          empresa: { codigo: code, nombre: code, logo: '/' + code + '.webp', activa: true },
        });
        assert.ok(detail.includes('Descripción sintética'));
        assert.ok(detail.includes('Conclusión sintética'));
        assert.equal((detail.match(new RegExp('src="/' + code + '.webp"', 'g')) ?? []).length, 1);
        const other = code === 'emp-01' ? 'emp-02' : 'emp-01';
        assert.ok(!detail.includes('/' + other + '.webp'));
        assert.doesNotMatch(detail, /alt="WEBETIKO/);
      }
    });
    await t.test('Mathiesen usa canal propio y logos oficiales en inicio, términos y formularios', () => {
      const empresa = { codigo: 'mathiesen', nombre: 'Grupo Mathiesen', logo: '/empresas/mathiesen/logo.png', activa: true };
      const landing = renderPage('/', empresa);
      assert.match(landing, /src="\/empresas\/mathiesen\/logo.png"/);
      assert.match(landing, /src="\/marca\/webetiko-horizontal.png"/);
      assert.match(landing, /\/canal\/mathiesen\/denuncia/);
      for (const path of ['/denuncia', '/denuncia-ley-karin', '/accepted-general', '/accepted-karin']) {
        assert.match(renderPage(path, empresa), /src="\/empresas\/mathiesen\/logo.png"/);
      }
    });
    await t.test('el logo real de Mathiesen no se asigna a los ejemplos', () => {
      for (const codigo of ['emp-01', 'emp-02']) {
        const example = renderPage('/', { codigo, nombre: 'Ejemplo', logo: '/empresas/' + codigo + '/logo.webp', activa: true });
        assert.ok(example.includes('/empresas/' + codigo + '/logo.webp'));
        assert.ok(!example.includes('/empresas/mathiesen/'));
      }
    });
    await t.test('administración usa WEBETIKO vertical en login y horizontal en cabecera', () => {
      assert.match(renderAdminLogin(), /src="\/marca\/webetiko-vertical.png"/);
      assert.match(renderPage('/admin'), /src="\/marca\/webetiko-horizontal.png"/);
      assert.doesNotMatch(renderAdminLogin(), /\/empresas\/mathiesen/);
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
