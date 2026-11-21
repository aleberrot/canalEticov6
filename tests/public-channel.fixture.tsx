import { ChannelLoading, UnavailableChannel } from '../src/app/layouts/PublicChannelLayout';
import { ReportDetails } from '../src/app/pages/ReportStatus';
import { AdminDashboard } from '../src/app/pages/AdminDashboard';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { Landing } from '../src/app/pages/Landing';
import { SubmitReport, SubmitLeyKarinReport, ReportForm } from '../src/app/pages/SubmitReport';
import { AportesHistory } from '../src/app/components/AportesHistory';
import { EMPTY_REPORT_DRAFT } from '../src/app/layouts/PublicChannelLayout';

export function renderPage(path: string) {
  const context = {
    empresa: { codigo: 'emp-test', nombre: 'Empresa de prueba', activa: true },
    reportDraft: EMPTY_REPORT_DRAFT,
    setReportDraft: () => {},
  };
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route element={<Outlet context={context} />}>
        <Route path="/" element={<Landing />} />
        <Route path="/denuncia" element={<SubmitReport />} />
        <Route path="/denuncia-ley-karin" element={<SubmitLeyKarinReport />} />
        <Route path="/accepted-general" element={<ReportForm tipoDenuncia="GENERAL" />} />
        <Route path="/accepted-karin" element={<ReportForm tipoDenuncia="LEY_KARIN" />} />
      </Route>
    </Routes></MemoryRouter>,
  );
}

export function renderHistory(aportes, legacyInfo) {
  return renderToStaticMarkup(<AportesHistory aportes={aportes} legacyInfo={legacyInfo} onDownload={async () => {}} />);
}


export function renderReportDetails(report) {
  return renderToStaticMarkup(<ReportDetails report={report} password="synthetic-test-password" />);
}

export function renderChannelLoading(slow) {
  return renderToStaticMarkup(<ChannelLoading slow={slow} />);
}
export function renderChannelUnavailable(retry) {
  return renderToStaticMarkup(<UnavailableChannel message="No se pudo cargar el canal." onRetry={retry ? () => {} : undefined} />);
}
