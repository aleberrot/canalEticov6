import { createBrowserRouter } from 'react-router';
import { Landing } from './pages/Landing';
import { SubmitReport, SubmitLeyKarinReport } from './pages/SubmitReport';
import { PublicChannelLayout } from './layouts/PublicChannelLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/tracking',
    lazy: async () => ({ Component: (await import('./pages/Tracking')).Tracking }),
  },
  {
    path: '/status/:code',
    lazy: async () => ({ Component: (await import('./pages/ReportStatus')).ReportStatus }),
  },
  {
    path: '/admin',
    lazy: async () => ({ Component: (await import('./pages/AdminLogin')).AdminLogin }),
  },
  {
    path: '/admin/dashboard',
    lazy: async () => ({ Component: (await import('./pages/AdminDashboard')).AdminDashboard }),
  },
  {
    path: '/canal/:codigoEmpresa',
    Component: PublicChannelLayout,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: 'denuncia',
        Component: SubmitReport,
      },
      { path: 'denuncia-ley-karin', Component: SubmitLeyKarinReport },
    ],
  },
]);
