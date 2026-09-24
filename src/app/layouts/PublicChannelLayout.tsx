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

function UnavailableChannel({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary to-white px-4">
      <div className="max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-primary">Canal no disponible</h1>
        <p className="text-muted-foreground">{message}</p>
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

  useEffect(() => {
    let active = true;

    const loadEmpresa = async () => {
      setLoading(true);
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
        const response = await obtenerEmpresaPublica(codigoEmpresa);
        if (!active) return;

        if (!response.activa) {
          setUnavailableMessage(
            'Este canal ético no se encuentra disponible actualmente.',
          );
          return;
        }

        setEmpresa(response);
      } catch (requestError) {
        if (!active) return;
        const inactive =
          requestError instanceof ApiError && requestError.status === 409;
        setUnavailableMessage(
          inactive
            ? 'Este canal ético no se encuentra disponible actualmente.'
            : 'El enlace utilizado no corresponde a un canal ético válido.',
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadEmpresa();
    return () => {
      active = false;
    };
  }, [codigoEmpresa]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-gradient-to-b from-secondary to-white">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando canal...
      </div>
    );
  }

  if (!empresa) {
    return <UnavailableChannel message={unavailableMessage} />;
  }

  return <Outlet context={{ empresa, reportDraft, setReportDraft }} />;
}

export function usePublicChannel() {
  return useOutletContext<PublicChannelContextValue>();
}

export function useOptionalPublicChannel() {
  return useOutletContext<PublicChannelContextValue | null>();
}
