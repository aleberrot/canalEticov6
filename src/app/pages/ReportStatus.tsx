import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, FileText, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { consultarDenuncia, Report as ApiReport } from '../services/api';

export function ReportStatus() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!code) {
        navigate('/tracking');
        return;
      }

      // Get password from location state (passed from Tracking component)
      const password = (location.state as any)?.password;
      if (!password) {
        navigate('/tracking');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const reportData = await consultarDenuncia({code,password});

        setReport(reportData);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la información de la denuncia.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [code, navigate, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">
                  {error || 'No se pudo cargar la información de la denuncia.'}
                </p>
              </div>
            </div>
            <Link
              to="/tracking"
              className="block w-full text-center bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Volver a consulta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
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
  };
 console.log(report)
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link 
          to="/tracking"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a consulta
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
            <div>
              <h1 className="text-primary mb-2">Estado de Denuncia</h1>
              <p className="text-muted-foreground">Código: {report.codigoUnico}</p>
            </div>
            
            <span className={`px-4 py-2 rounded-full border ${getStatusColor(report.estado)}`}>
              {report.estado}
            </span>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de creación</p>
                <p className="text-foreground">
                  {new Date(report.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo de denuncia</p>
                <p className="text-foreground">{report.tipoDenuncia}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha del incidente</p>
                <p className="text-foreground">
                  {report.fechaIncidente}
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Descripción enviada</p>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{report.descripcion}</p>
              </div>
            </div>
            
            {report.involved && (
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Personas involucradas</p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-foreground">{report.involved}</p>
                </div>
              </div>
            )}
            
            {report.fileName && (
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Archivo adjunto</p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-foreground">{report.fileName}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-accent border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Información:</strong> Tu denuncia está siendo procesada. 
              Recibirás actualizaciones sobre el estado de tu caso. 
              Puedes consultar el estado en cualquier momento con tu código y contraseña.
            </p>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/"
              className="block w-full text-center bg-white text-primary py-3 px-6 rounded-lg border-2 border-primary hover:bg-secondary transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
