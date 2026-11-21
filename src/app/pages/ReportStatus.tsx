import { WebetikoBrand } from '../components/WebetikoBrand';
import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  agregarInformacionAdicional,
  descargarAporte,
  MAX_ARCHIVO_BYTES,
  consultarDenuncia,
  SeguimientoDenunciaResponse,
} from '../services/api';

import { AportesHistory } from '../components/AportesHistory';

interface TrackingLocationState {
  password?: string;
}

export function ReportStatus() {
  const { code } = useParams();
  const location = useLocation();
  return <ReportStatusSession key={code + ':' + location.key} />;
}

function ReportStatusSession() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const password = (location.state as TrackingLocationState | null)?.password;
  const [report, setReport] =
    useState<SeguimientoDenunciaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [sendingAdditional, setSendingAdditional] = useState(false);
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  useEffect(() => {
    let active = true;
    if (!code || !password) {
      navigate('/tracking', { replace: true });
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await consultarDenuncia({ code, password });
        if (active) setReport(response);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar la información de la denuncia.',
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchReport();
    return () => { active = false; };
  }, [code, navigate, password]);

  const sendAdditionalInformation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sendingRef.current) return;

    if (!code || !password || (!additionalInfo.trim() && !additionalFile)) {
      setAdditionalFeedback(
        'Escribe información o selecciona un documento para continuar.',
      );
      return;
    }

    try {
      sendingRef.current = true;
      setSendingAdditional(true);
      setAdditionalFeedback('');
      const updatedReport = await agregarInformacionAdicional(
        code,
        password,
        additionalInfo.trim() || undefined,
        additionalFile,
      );
      setReport(updatedReport);
      setAdditionalInfo('');
      setAdditionalFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setAdditionalFeedback('Información adicional enviada correctamente.');
    } catch (requestError) {
      setAdditionalFeedback(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible enviar la información adicional.',
      );
    } finally {
      sendingRef.current = false;
      setSendingAdditional(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary to-white py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-start gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="mt-1 text-sm text-red-700">
                  {error || 'No se pudo cargar la información de la denuncia.'}
                </p>
              </div>
            </div>
            <Link
              to="/tracking"
              className="block w-full rounded-lg bg-primary px-6 py-3 text-center text-primary-foreground"
            >
              Volver a consulta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <Link
          to="/tracking"
          className="mb-8 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a consulta
        </Link>
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <ReportDetails report={report} password={password!} />
          {report.tipoDenuncia === 'GENERAL' && (
            <form
              onSubmit={sendAdditionalInformation}
              className="mt-8 space-y-4 border-t border-border pt-8"
            >
              <div>
                <h2 className="text-primary">Agregar información</h2>
                <p className="text-sm text-muted-foreground">
                  Puedes complementar tu denuncia con antecedentes o documentos.
                </p>
              </div>
              <label className="block">
                Información adicional
                <textarea
                  rows={5}
                  value={additionalInfo}
                  onChange={(event) => setAdditionalInfo(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-input-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="block cursor-pointer rounded-lg border-2 border-dashed border-primary/40 bg-secondary/50 p-5 text-center">
                <Upload className="mx-auto mb-2 h-6 w-6 text-primary" />
                <span className="block font-medium text-primary">
                  Adjuntar documento adicional (máximo 50 MB)
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {additionalFile?.name ?? 'Seleccionar archivo'}
                </span>
                <input
                  type="file"
                  ref={fileInput}
                  disabled={sendingAdditional}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > MAX_ARCHIVO_BYTES) {
                      setAdditionalFeedback('El archivo no puede superar 50 MB.');
                      event.target.value = '';
                      setAdditionalFile(null);
                      return;
                    }
                    setAdditionalFeedback('');
                    setAdditionalFile(file);
                  }}
                  className="sr-only"
                />
              </label>
              {additionalFeedback && (
                <p className="rounded-lg bg-secondary p-3 text-sm">
                  {additionalFeedback}
                </p>
              )}
              <button
                type="submit"
                disabled={sendingAdditional}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-primary-foreground disabled:opacity-60"
              >
                {sendingAdditional && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                Enviar información adicional
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'RECIBIDA':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'EN_REVISION':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CERRADA':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  );
}

interface ContentBlockProps {
  title: string;
  content: string;
  emphasized?: boolean;
}

function ContentBlock({ title, content, emphasized }: ContentBlockProps) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="mb-3 text-lg text-primary">{title}</h2>
      <div
        className={`rounded-lg p-5 ${
          emphasized ? 'border border-primary/30 bg-accent' : 'bg-secondary'
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </section>
  );
}

// Render the authenticated report separately so its complete loaded view is tested.
export function ReportDetails({ report, password }: {
  report: SeguimientoDenunciaResponse; password: string;
}) {
  return (
    <>
      <WebetikoBrand />
      {report.empresa?.logo && (
        <img src={report.empresa.logo} alt={`Logo de ${report.empresa.nombre}`}
          className="mx-auto mb-6 max-h-24 max-w-56 object-contain" />
      )}
          <header className="mb-6 flex items-start justify-between border-b border-border pb-6">
            <div>
              <h1 className="mb-2 text-primary">Estado de Denuncia</h1>
              <p className="text-muted-foreground">
                Código: {report.codigoUnico}
              </p>
            </div>
            <span
              className={`rounded-full border px-4 py-2 ${getStatusColor(report.estado)}`}
            >
              {report.estado}
            </span>
          </header>
          <div className="space-y-6">
            <InfoRow
              icon={<Calendar className="mt-1 h-5 w-5 text-primary" />}
              label="Fecha de creación"
              value={new Date(`${report.createdAt}T00:00:00`).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            <InfoRow
              icon={<FileText className="mt-1 h-5 w-5 text-primary" />}
              label="Tipo de denuncia"
              value={report.tipoDenuncia}
            />
            <ContentBlock title="Descripción enviada" content={report.descripcion} />
            <AportesHistory aportes={report.aportes} legacyInfo={report.informacionAdicional}
              onDownload={(aporte) => descargarAporte(report.codigoUnico, aporte, { password })} />
            {report.conclusionesMedidas && (
              <ContentBlock
                title="Conclusiones y medidas"
                content={report.conclusionesMedidas}
                emphasized
              />
            )}
          </div>
    </>
  );
}
