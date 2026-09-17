import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { Landing } from '../src/app/pages/Landing';
import { SubmitReport } from '../src/app/pages/SubmitReport';
import { EMPTY_REPORT_DRAFT } from '../src/app/layouts/PublicChannelLayout';

export function renderPage(path: string) {
  // Even a stale draft cannot reactivate the former public type selector.
  const context = {
    empresa: { codigo: 'emp-test', nombre: 'Empresa de prueba', activa: true },
    reportDraft: { ...EMPTY_REPORT_DRAFT, tipoDenuncia: 'LEY_KARIN', delitoCodigo: 'DEL-045' },
    setReportDraft: () => {},
  };
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Outlet context={context} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/denuncia" element={<SubmitReport />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}
