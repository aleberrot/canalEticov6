import { channelHome, adminRoute } from '../services/navigation';
import { formatBusinessDate } from '../services/businessTime';
import { SucursalAdmin } from '../components/SucursalAdmin';
import { WebetikoBrand } from '../components/WebetikoBrand';
import { AportesHistory } from '../components/AportesHistory';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  actualizarDetalleAdmin,
  actualizarEstadoDenuncia,
  DenunciaAdminResponse,
  descargarArchivo,
  descargarAporte,
  EmpresaAdminResponse,
  esErrorNoAutorizado,
  EstadisticasEmpresaResponse,
  EstadoDenuncia,
  etiquetaEstado,
  obtenerDenunciasPorEmpresa,
  obtenerEmpresas,
  obtenerEstadisticasEmpresa,
} from '../services/api';

const EMPTY_STATISTICS: EstadisticasEmpresaResponse = {
  total: 0,
  generales: 0,
  leyKarin: 0,
  recibidas: 0,
  enRevision: 0,
  cerradas: 0,
};

const STATISTICS: Array<{
  key: keyof EstadisticasEmpresaResponse;
  label: string;
}> = [
  { key: 'total', label: 'Total' },
  { key: 'generales', label: 'Denuncias generales' },
  { key: 'leyKarin', label: 'Ley Karin' },
  { key: 'recibidas', label: 'Recibidas' },
  { key: 'enRevision', label: 'En revisión' },
  { key: 'cerradas', label: 'Cerradas' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const preferredCompany = search.get('empresa');
  const requestId = useRef(0);
  const [credentials, setCredentials] = useState('');
  const [empresas, setEmpresas] = useState<EmpresaAdminResponse[]>([]);
  const [selectedEmpresaCodigo, setSelectedEmpresaCodigo] = useState('');
  const [reports, setReports] = useState<DenunciaAdminResponse[]>([]);
  const [statistics, setStatistics] =
    useState<EstadisticasEmpresaResponse>(EMPTY_STATISTICS);
  const [selected, setSelected] = useState<DenunciaAdminResponse | null>(null);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const closeInvalidSession = useCallback(() => {
    localStorage.removeItem('adminCredentials');
    navigate(adminRoute(preferredCompany), { replace: true, state: { sessionExpired: true } });
  }, [navigate, preferredCompany]);

  const handleRequestError = useCallback(
    (requestError: unknown, message: string) => {
      if (esErrorNoAutorizado(requestError)) {
        closeInvalidSession();
      } else {
        setError(message);
      }
    },
    [closeInvalidSession],
  );

  const loadEmpresaData = useCallback(
    async (codigoEmpresa: string, auth: string) => {
      const currentRequestId = ++requestId.current;
      setLoadingData(true);
      setError('');
      setSuccess('');
      setReports([]);
      setStatistics(EMPTY_STATISTICS);
      setSelected(null);

      try {
        const [newReports, newStatistics] = await Promise.all([
          obtenerDenunciasPorEmpresa(codigoEmpresa, auth),
          obtenerEstadisticasEmpresa(codigoEmpresa, auth),
        ]);

        if (requestId.current === currentRequestId) {
          setReports(newReports);
          setStatistics({
            ...newStatistics,
            recibidas: newReports.filter(
              (report) => report.estado === 'RECIBIDA',
            ).length,
            enRevision: newReports.filter(
              (report) => report.estado === 'EN_REVISION',
            ).length,
          });
        }
      } catch (requestError) {
        if (requestId.current === currentRequestId) {
          handleRequestError(
            requestError,
            'No fue posible cargar la información de la empresa.',
          );
        }
      } finally {
        if (requestId.current === currentRequestId) {
          setLoadingData(false);
        }
      }
    },
    [handleRequestError],
  );

  useEffect(() => {
    const auth = localStorage.getItem('adminCredentials');

    if (!auth) {
      navigate(adminRoute(preferredCompany), { replace: true });
      return;
    }

    setCredentials(auth);

    const loadEmpresas = async () => {
      try {
        const availableEmpresas = await obtenerEmpresas(auth);
        setEmpresas(availableEmpresas);

        if (availableEmpresas.length > 0) {
          const firstCodigo = availableEmpresas.find(e => e.codigo === preferredCompany)?.codigo || availableEmpresas[0].codigo;
          setSelectedEmpresaCodigo(firstCodigo);
          await loadEmpresaData(firstCodigo, auth);
        }
      } catch (requestError) {
        handleRequestError(
          requestError,
          'No fue posible cargar las empresas disponibles.',
        );
      } finally {
        setLoadingEmpresas(false);
      }
    };

    void loadEmpresas();
  }, [handleRequestError, loadEmpresaData, navigate, preferredCompany]);

  const selectedEmpresa = empresas.find(
    (empresa) => empresa.codigo === selectedEmpresaCodigo,
  );

  const selectEmpresa = (codigoEmpresa: string) => {
    setSelectedEmpresaCodigo(codigoEmpresa);
    void loadEmpresaData(codigoEmpresa, credentials);
  };

  const updateReport = (updated: DenunciaAdminResponse) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.codigoUnico === updated.codigoUnico ? updated : report,
      ),
    );
    setSelected(updated);
  };

  const changeStatus = async (
    report: DenunciaAdminResponse,
    estado: EstadoDenuncia,
  ) => {
    const operationId = requestId.current;
    try {
      const updated = await actualizarEstadoDenuncia(
        report.codigoUnico,
        estado,
        credentials,
      );
      if (requestId.current !== operationId) return;
      updateReport(updated);
      void loadEmpresaData(selectedEmpresaCodigo, credentials);
    } catch (requestError) {
      handleRequestError(requestError, 'No fue posible actualizar el estado.');
    }
  };

  const saveDetails = async () => {
    if (!selected) return;
    const operationId = requestId.current;

    try {
      const updated = await actualizarDetalleAdmin(
        selected.codigoUnico,
        {
          nombreDenunciado: selected.nombreDenunciado,
          fechaDescargo: selected.fechaDescargo,
          descargo: selected.descargo,
          conclusionesMedidas: selected.conclusionesMedidas,
        },
        credentials,
      );
      if (requestId.current !== operationId) return;
      updateReport(updated);
      setSelected(null);
      await loadEmpresaData(selectedEmpresaCodigo, credentials);
      setSuccess('Detalle guardado correctamente.');
    } catch (requestError) {
      handleRequestError(requestError, 'No fue posible guardar el detalle.');
    }
  };

  const download = async (codigo: string) => {
    try {
      await descargarArchivo(codigo, credentials, reports.find((report) => report.codigoUnico === codigo)?.nombreArchivo);
    } catch (requestError) {
      handleRequestError(requestError, 'No fue posible descargar el archivo.');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminCredentials');
    navigate(adminRoute(selectedEmpresaCodigo), { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <header className="admin-header bg-primary p-6 text-primary-foreground">
        <div className="admin-header-inner">
          <WebetikoBrand inverse compact />
          <h1>Panel Administrativo</h1>
          <Link to={channelHome(selectedEmpresaCodigo)} className="underline">Inicio</Link>
          <button onClick={logout}>Salir</button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {loadingEmpresas ? (
          <LoadingMessage message="Cargando empresas..." />
        ) : empresas.length === 0 && !error ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            No existen empresas disponibles.
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-lg bg-white p-5 shadow">
              <label className="block max-w-md">
                <span className="mb-2 block font-medium">Empresa</span>
                <select
                  value={selectedEmpresaCodigo}
                  onChange={(event) => selectEmpresa(event.target.value)}
                  className="w-full rounded border p-3"
                  disabled={loadingData}
                >
                  {empresas.map((empresa) => (
                    <option key={empresa.codigo} value={empresa.codigo}>
                      {empresa.nombre} ({empresa.codigo})
                    </option>
                  ))}
                </select>
              </label>
              {selectedEmpresa && (
                <div className="mt-4">
                  <h2 className="text-primary">{selectedEmpresa.nombre}</h2>
                  <p className="text-sm text-gray-600">
                    Código: {selectedEmpresa.codigo}
                  </p>
                </div>
              )}
            </section>
            {error && (
              <p role="alert" className="mb-5 rounded border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="mb-5 rounded border border-green-200 bg-green-50 p-4 text-green-700">
                {success}
              </p>
            )}
            {selectedEmpresaCodigo && <SucursalAdmin key={selectedEmpresaCodigo} empresa={selectedEmpresaCodigo} credentials={credentials} />}
            {loadingData ? (
              <LoadingMessage message="Cargando información de la empresa..." />
            ) : (
              <>
                <StatisticsCards statistics={statistics} />
                <div className="mb-5 flex justify-end">
                  <button
                    onClick={() =>
                      void loadEmpresaData(selectedEmpresaCodigo, credentials)
                    }
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" /> Actualizar
                  </button>
                </div>
                <ReportsTable
                  reports={reports}
                  onSelect={setSelected}
                  onDownload={download}
                />
              </>
            )}
          </>
        )}
      </main>
      {selected && (
        <ReportModal
          report={selected}
          credentials={credentials}
          onDownload={download}
          onChange={setSelected}
          onClose={() => setSelected(null)}
          onChangeStatus={changeStatus}
          onSave={saveDetails}
        />
      )}
    </div>
  );
}

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16">
      <Loader2 className="h-5 w-5 animate-spin" /> {message}
    </div>
  );
}

function StatisticsCards({
  statistics,
}: {
  statistics: EstadisticasEmpresaResponse;
}) {
  return (
    <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {STATISTICS.map(({ key, label }) => (
        <div key={key} className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-primary">
            {statistics[key]}
          </p>
        </div>
      ))}
    </section>
  );
}

interface ReportsTableProps {
  reports: DenunciaAdminResponse[];
  onSelect: (report: DenunciaAdminResponse) => void;
  onDownload: (codigo: string) => Promise<void>;
}

export function ReportsTable({ reports, onSelect, onDownload }: ReportsTableProps) {
  return (
    <section className="overflow-x-auto rounded-lg bg-white shadow">
      {reports.length === 0 ? (
        <p className="p-8 text-center text-gray-600">
          No existen denuncias registradas para esta empresa.
        </p>
      ) : (
        <table className="w-full">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="p-4 text-left">Código</th>
              <th className="p-4 text-left">Sucursal</th>
              <th className="p-4 text-left">Tipo</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.codigoUnico} className="border-b">
                <td className="p-4">{report.codigoUnico}</td>
                <td className="p-4">{report.sucursalNombre || 'No informada'}</td>
                <td className="p-4">{report.tipoDenuncia}</td>
                <td className="p-4">{etiquetaEstado(report.estado)}</td>
                <td className="p-4">{formatBusinessDate(report.createdAt, report.createdAtInstant)}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button
                      className="grid min-h-11 min-w-11 place-items-center rounded hover:bg-secondary"
                      aria-label={`Ver denuncia ${report.codigoUnico}`}
                      onClick={() => onSelect(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="grid min-h-11 min-w-11 place-items-center rounded hover:bg-secondary"
                      aria-label={`Descargar archivo de ${report.codigoUnico}`}
                      disabled={!report.tieneArchivo}
                      title={report.tieneArchivo ? 'Descargar respaldo inicial' : 'Sin respaldo inicial'}
                      onClick={() => void onDownload(report.codigoUnico)}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

interface ReportModalProps {
  credentials: string;
  onDownload: (codigo: string) => Promise<void>;
  report: DenunciaAdminResponse;
  onChange: (report: DenunciaAdminResponse) => void;
  onClose: () => void;
  onChangeStatus: (
    report: DenunciaAdminResponse,
    estado: EstadoDenuncia,
  ) => Promise<void>;
  onSave: () => Promise<void>;
}

function ReportModal({
  report, credentials, onDownload, onChange, onClose, onChangeStatus, onSave,
}: ReportModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]'))
        .filter(element => element.getClientRects().length > 0);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    dialog?.addEventListener('keydown', handleKey);
    return () => { dialog?.removeEventListener('keydown', handleKey); if (previous?.isConnected) previous.focus(); };
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Detalle ${report.codigoUnico}`} className="max-h-[90vh] w-full max-w-3xl space-y-6 overflow-y-auto rounded-lg bg-white p-6">
        <button onClick={onClose} aria-label="Cerrar detalle" className="float-right min-h-11 min-w-11">×</button>
        <h2 className="text-xl text-primary">{report.codigoUnico} · {report.tipoDenuncia}</h2>
        <label className="block">Estado actual
          <select value={report.estado} onChange={(event) => void onChangeStatus(report, event.target.value as EstadoDenuncia)} className="ml-3 rounded border p-2">
            <option value="RECIBIDA">Recibida</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="CERRADA">Cerrada</option>
          </select>
        </label>
        <section className="space-y-3 border-t pt-5">
          <h3 className="text-lg text-primary">1. Información inicial</h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            {([
              ['Sucursal', report.sucursalNombre], ['Tipificación', report.delitoTipificacion], ['Código del delito', report.delitoCodigo],
              ['Detalle del delito', report.delitoDescripcion], ['Descripción', report.descripcion],
              ['Personas involucradas', report.personasInvolucradas], ['Testigos', report.testigos],
              ['Fecha del incidente', report.fechaIncidente], ['Relación con empresa', report.relacionEmpresa],
              ['Nombre del denunciante', report.nombreDenunciante], ['Correo', report.emailDenunciante],
              ['Teléfono', report.telefonoDenunciante], ['Fecha de creación', formatBusinessDate(report.createdAt, report.createdAtInstant)],
              ['Última actualización', report.updatedAt],
            ] as const).map(([label, value]) => <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="whitespace-pre-wrap break-words">{value || 'No informado'}</dd>
            </div>)}
          </dl>
          <h4 className="pt-3 font-medium">Respaldo inicial</h4>
          {report.tieneArchivo ? <button type="button" onClick={() => void onDownload(report.codigoUnico)} className="flex items-center gap-2 text-primary underline">
            <Download className="h-4 w-4" /> {report.nombreArchivo || 'Descargar respaldo inicial'}
          </button> : <p className="text-muted-foreground">Sin archivo inicial.</p>}
        </section>
        <AportesHistory aportes={report.aportes} legacyInfo={report.informacionAdicional}
          onDownload={(aporte) => descargarAporte(report.codigoUnico, aporte, { credentials })} />
        <section className="space-y-4 border-t pt-5">
          <h3 className="text-lg text-primary">3. Descargo</h3>
          <label className="block">Nombre denunciado
            <input value={report.nombreDenunciado ?? ''} onChange={(event) => onChange({ ...report, nombreDenunciado: event.target.value })} className="block w-full rounded border p-2" />
          </label>
          <label className="block">Fecha descargo
            <input type="date" value={report.fechaDescargo ?? ''} onChange={(event) => onChange({ ...report, fechaDescargo: event.target.value })} className="block w-full rounded border p-2" />
          </label>
          <label className="block">Descargo
            <textarea rows={5} value={report.descargo ?? ''} onChange={(event) => onChange({ ...report, descargo: event.target.value })} className="block w-full rounded border p-2" />
          </label>
        </section>
        <section className="space-y-3 border-t pt-5">
          <h3 className="text-lg text-primary">4. Conclusiones y medidas</h3>
          <p className="text-sm text-muted-foreground">Este contenido estará visible para el denunciante en su seguimiento.</p>
          <textarea aria-label="Conclusiones y medidas" rows={5} value={report.conclusionesMedidas ?? ''} onChange={(event) => onChange({ ...report, conclusionesMedidas: event.target.value })} className="block w-full rounded border p-2" />
        </section>
        <button onClick={() => void onSave()} className="rounded bg-primary p-3 text-primary-foreground">Guardar detalle</button>
      </div>
    </div>
  );
}
