import { createBrowserRouter } from 'react-router';
import { Landing } from './pages/Landing';
import { SubmitReport, SubmitLeyKarinReport } from './pages/SubmitReport';
import { Tracking } from './pages/Tracking';
import { ReportStatus } from './pages/ReportStatus';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { PublicChannelLayout } from './layouts/PublicChannelLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/tracking',
    Component: Tracking,
  },
  {
    path: '/status/:code',
    Component: ReportStatus,
  },
  {
    path: '/admin',
    Component: AdminLogin,
  },
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
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
