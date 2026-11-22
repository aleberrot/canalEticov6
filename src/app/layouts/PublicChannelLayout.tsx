import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Outlet, useOutletContext, useParams } from 'react-router';
import {
  ApiError,
  EmpresaPublicResponse,
  obtenerEmpresaPublica,
  RelacionEmpresa,
} from '../services/api';

export interface ReportDraft {
  codigoSucursal: string;
  tipoDenuncia: 'GENERAL' | 'LEY_KARIN';
  delitoCodigo: string;
  relacionEmpresa: RelacionEmpresa | '';
  descripcion: string;
  personasInvolucradas: string;
  fechaIncidente: string;
  nombreDenunciante: string;
  emailDenunciante: string;
  telefonoDenunciante: string;
  testigos: string;
  password: string;
  archivo: File | null;
  aceptaVerdad: boolean;
}

export const EMPTY_REPORT_DRAFT: ReportDraft = {
  codigoSucursal: '',
  tipoDenuncia: 'GENERAL',
  delitoCodigo: '',
  relacionEmpresa: '',
  descripcion: '',
  personasInvolucradas: '',
  fechaIncidente: '',
  nombreDenunciante: '',
  emailDenunciante: '',
  telefonoDenunciante: '',
  testigos: '',
  password: '',
  archivo: null,
  aceptaVerdad: false,
};

export interface PublicChannelContextValue {
  empresa: EmpresaPublicResponse;
  reportDraft: ReportDraft;
  setReportDraft: React.Dispatch<React.SetStateAction<ReportDraft>>;
}

export function UnavailableChannel({ message, onRetry }: {
  message: string; onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary to-white px-4">
      <div className="max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-primary">Canal no disponible</h1>
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-6 rounded bg-primary px-5 py-3 text-primary-foreground">
            Volver a intentar
          </button>
        )}
      </div>
    </div>
  );
}

export function PublicChannelLayout() {
  const { codigoEmpresa } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaPublicResponse | null>(null);
  const [reportDraft, setReportDraft] =
    useState<ReportDraft>(EMPTY_REPORT_DRAFT);
  const [loading, setLoading] = useState(true);
  const [unavailableMessage, setUnavailableMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [slowLoading, setSlowLoading] = useState(false);
  const [retryAllowed, setRetryAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const slowTimer = setTimeout(() => { if (active) setSlowLoading(true); }, 10000);

    const loadEmpresa = async () => {
      setLoading(true);
      setSlowLoading(false);
      setRetryAllowed(false);
      setEmpresa(null);
      setReportDraft(EMPTY_REPORT_DRAFT);
      setUnavailableMessage('');

      if (!codigoEmpresa) {
        setUnavailableMessage(
          'El enlace utilizado no corresponde a un canal ético válido.',
        );
        setLoading(false);
        return;
      }

      try {
        const response = await obtenerEmpresaPublica(codigoEmpresa, controller.signal);
        if (!active) return;

        if (response.codigo !== codigoEmpresa) {
          throw new Error('Respuesta de empresa inconsistente');
        }

        if (!response.activa) {
          setUnavailableMessage(
            'Este canal ético no se encuentra disponible actualmente.',
          );
          return;
        }

        setEmpresa(response);
      } catch (requestError) {
        if (!active) return;
        setRetryAllowed(!(requestError instanceof ApiError && [404, 409].includes(requestError.status)));
        const inactive =
          requestError instanceof ApiError && requestError.status === 409;
        setUnavailableMessage(
          inactive
            ? 'Este canal ético no se encuentra disponible actualmente.'
            : requestError instanceof ApiError && requestError.status === 404
              ? 'El enlace utilizado no corresponde a un canal ético válido.'
              : 'No se pudo cargar el canal. Intenta nuevamente en unos momentos.',
        );
      } finally {
        clearTimeout(slowTimer);
        if (active) setLoading(false);
      }
    };

    void loadEmpresa();
    return () => {
      active = false;
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [codigoEmpresa, retryCount]);

  if (loading || (empresa && empresa.codigo !== codigoEmpresa)) {
    return <ChannelLoading slow={slowLoading} />;
  }

  if (!empresa) {
    return <UnavailableChannel message={unavailableMessage} onRetry={retryAllowed ? () => setRetryCount((count) => count + 1) : undefined} />;
  }

  return <Outlet key={empresa.codigo} context={{ empresa, reportDraft, setReportDraft }} />;
}

export function usePublicChannel() {
  return useOutletContext<PublicChannelContextValue>();
}

export function useOptionalPublicChannel() {
  return useOutletContext<PublicChannelContextValue | null>();
}

export function ChannelLoading({ slow }: { slow: boolean }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary to-white px-4 text-center" role="status">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p>Cargando canal...</p>
      {slow && <p className="max-w-md text-muted-foreground">El servicio está tardando en responder. El inicio puede demorar hasta 90 segundos. Mantén esta página abierta.</p>}
    </div>
  );
}
