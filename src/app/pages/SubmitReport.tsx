import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router';
import { SimpleCaptcha } from '../components/SimpleCaptcha';
import {
  DELITOS,
  DELITOS_LEY_KARIN,
  obtenerDelitoPorCodigo,
} from '../data/delitos';
import {
  EMPTY_REPORT_DRAFT,
  ReportDraft,
  usePublicChannel,
} from '../layouts/PublicChannelLayout';
import {
  crearDenuncia,
  CrearDenunciaRequest,
  RelacionEmpresa,
  TipoDenuncia,
} from '../services/api';

const INPUT_CLASS =
  'w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';

const RELATIONSHIPS: RelacionEmpresa[] = [
  'TRABAJADOR',
  'CLIENTE',
  'PROVEEDOR',
  'CONTRATISTA',
  'SUBCONTRATISTA',
  'OTRO',
];


export function SubmitReport() {

  const { empresa, reportDraft, setReportDraft } = usePublicChannel();
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [codigo, setCodigo] = useState('');
  const delito = obtenerDelitoPorCodigo(reportDraft.delitoCodigo);
  const isLeyKarin = reportDraft.tipoDenuncia === 'LEY_KARIN';
  const availableDelitos = isLeyKarin ? DELITOS_LEY_KARIN : DELITOS;
  const channelBase = `/canal/${empresa.codigo}`;

  useEffect(() => {
    const selectedIsAvailable = availableDelitos.some(
      (option) => option.codigo === reportDraft.delitoCodigo,
    );

    if (reportDraft.delitoCodigo && !selectedIsAvailable) {
      setReportDraft((currentDraft) => ({
        ...currentDraft,
        delitoCodigo: '',
      }));
    }
  }, [availableDelitos, reportDraft.delitoCodigo, setReportDraft]);

  const updateField = <Key extends keyof ReportDraft>(
    field: Key,
    value: ReportDraft[Key],
  ) => {
    setReportDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (
      !captcha ||
      !reportDraft.aceptaVerdad ||
      (isLeyKarin && !reportDraft.aceptaLeyKarin)
    ) {
      setError(
        'Completa las declaraciones y la verificación de seguridad.',
      );
      return;
    }

    if (!delito || !reportDraft.relacionEmpresa) {
      setError('Selecciona delito y relación con la empresa.');
      return;
    }

    if (
      isLeyKarin &&
      (!reportDraft.nombreDenunciante ||
        !reportDraft.emailDenunciante ||
        !reportDraft.telefonoDenunciante)
    ) {
      setError(
        'Nombre, correo y teléfono son obligatorios para Ley Karin.',
      );
      return;
    }

    const request: CrearDenunciaRequest = {
      codigoEmpresa: empresa.codigo,
      tipoDenuncia: reportDraft.tipoDenuncia,
      delitoCodigo: delito.codigo,
      delitoTipificacion: delito.tipificacion,
      delitoDescripcion: delito.descripcion,
      relacionEmpresa: reportDraft.relacionEmpresa,
      descripcion: reportDraft.descripcion,
      personasInvolucradas: reportDraft.personasInvolucradas || undefined,
      fechaIncidente: reportDraft.fechaIncidente || undefined,
      nombreDenunciante: reportDraft.nombreDenunciante || undefined,
      emailDenunciante: reportDraft.emailDenunciante || undefined,
      telefonoDenunciante: reportDraft.telefonoDenunciante || undefined,
      testigos: reportDraft.testigos || undefined,
      password: reportDraft.password,
    };

    try {
      setLoading(true);
      const response = await crearDenuncia(request, reportDraft.archivo);
      setCodigo(response.codigo);
      setReportDraft(EMPTY_REPORT_DRAFT);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo enviar la denuncia.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (codigo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            {empresa.logo && (
              <img
                src={empresa.logo}
                alt={`Logo de ${empresa.nombre}`}
                className="mx-auto mb-6 max-h-24 max-w-56 object-contain"
              />
            )}
            <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-600" />
            <h1 className="mb-2 text-primary">
              Denuncia enviada correctamente
            </h1>
            <p className="mb-4 text-muted-foreground">{empresa.nombre}</p>
            <p className="text-muted-foreground">Código de seguimiento</p>
            <p className="my-5 text-4xl text-primary">{codigo}</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={channelBase}
                className="rounded border border-primary px-4 py-3 text-primary"
              >
                Volver al canal
              </Link>
              <Link
                to="/tracking"
                className="rounded bg-primary p-3 text-primary-foreground"
              >
                Consultar estado
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <Link
          to={channelBase}
          className="mb-8 inline-flex items-center gap-2 text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-4">
            {empresa.logo && (
              <img
                src={empresa.logo}
                alt={`Logo de ${empresa.nombre}`}
                className="max-h-16 max-w-40 object-contain"
              />
            )}
            <div>
              <h1 className="text-primary">Enviar Denuncia</h1>
              <p className="text-muted-foreground">{empresa.nombre}</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="flex gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-600" /> {error}
              </div>
            )}
            <label className="block">
              Tipo de denuncia *
              <select
                value={reportDraft.tipoDenuncia}
                onChange={(event) =>
                  updateField(
                    'tipoDenuncia',
                    event.target.value as TipoDenuncia,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="GENERAL">Denuncia general</option>
                <option value="LEY_KARIN">Ley Karin</option>
              </select>
            </label>
            <label className="block">
              Relación con la empresa *
              <select
                required
                value={reportDraft.relacionEmpresa}
                onChange={(event) =>
                  updateField(
                    'relacionEmpresa',
                    event.target.value as RelacionEmpresa,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="">Selecciona una relación</option>
                {RELATIONSHIPS.map((relationship) => (
                  <option key={relationship} value={relationship}>
                    {relationship.charAt(0) +
                      relationship.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Tipificación del delito *
              <select
                required
                value={reportDraft.delitoCodigo}
                onChange={(event) =>
                  updateField('delitoCodigo', event.target.value)
                }
                className={INPUT_CLASS}
              >
                <option value="">Selecciona una tipificación</option>
                {availableDelitos.map((option) => (
                  <option key={option.codigo} value={option.codigo}>
                    {option.tipificacion}
                  </option>
                ))}
              </select>
            </label>
            {delito && (
              <div className="rounded-lg border bg-secondary p-4">
                <b>{delito.tipificacion}</b>
                <p className="mt-2 text-sm">{delito.descripcion}</p>
              </div>
            )}
            <TextAreaField
              label="Descripción detallada *"
              required
              value={reportDraft.descripcion}
              onChange={(value) => updateField('descripcion', value)}
            />
            <TextField
              label="Personas involucradas"
              value={reportDraft.personasInvolucradas}
              onChange={(value) => updateField('personasInvolucradas', value)}
            />
            <TextField
              label="Testigos"
              value={reportDraft.testigos}
              onChange={(value) => updateField('testigos', value)}
            />
            <TextField
              label="Fecha del incidente"
              type="date"
              value={reportDraft.fechaIncidente}
              onChange={(value) => updateField('fechaIncidente', value)}
            />
            <div className="border-t pt-6">
              <h3 className="text-primary">
                Información del denunciante{' '}
                {isLeyKarin ? '(obligatoria para Ley Karin)' : '(opcional)'}
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <input
                  required={isLeyKarin}
                  placeholder="Nombre completo"
                  value={reportDraft.nombreDenunciante}
                  onChange={(event) =>
                    updateField('nombreDenunciante', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
                <input
                  required={isLeyKarin}
                  type="email"
                  placeholder="Correo electrónico"
                  value={reportDraft.emailDenunciante}
                  onChange={(event) =>
                    updateField('emailDenunciante', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
                <input
                  required={isLeyKarin}
                  placeholder="Teléfono"
                  value={reportDraft.telefonoDenunciante}
                  onChange={(event) =>
                    updateField('telefonoDenunciante', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block">Documentación de respaldo</span>
              <span className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-secondary/50 p-6 text-center hover:border-primary">
                <Upload className="h-7 w-7 text-primary" />
                <span className="font-medium text-primary">
                  Adjuntar documentación de respaldo
                </span>
                <span className="text-sm text-muted-foreground">
                  {reportDraft.archivo?.name ?? 'Seleccionar archivo'}
                </span>
                <input
                  type="file"
                  onChange={(event) =>
                    updateField('archivo', event.target.files?.[0] ?? null)
                  }
                  className="sr-only"
                />
              </span>
            </label>
            <label className="block" htmlFor="passwordSeguimiento">
              Contraseña para seguimiento *
              <span className="relative mt-1 block">
                <input
                  id="passwordSeguimiento"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={reportDraft.password}
                  onChange={(event) =>
                    updateField('password', event.target.value)
                  }
                  className={`${INPUT_CLASS} pr-12`}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </span>
            </label>

            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={reportDraft.aceptaVerdad}
                onChange={(event) =>
                  updateField('aceptaVerdad', event.target.checked)
                }
              />
              Declaro que la información es verídica.
            </label>
            {isLeyKarin && (
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={reportDraft.aceptaLeyKarin}
                  onChange={(event) =>
                    updateField('aceptaLeyKarin', event.target.checked)
                  }
                />
                He leído la información de Ley Karin.
              </label>
            )}
            {isLeyKarin && (
              <Link
                to={`${channelBase}/informacion`}
                className="inline-block text-primary underline"
              >
                Ver información sobre Ley Karin
              </Link>
            )}
            <SimpleCaptcha onVerify={setCaptcha} />
            <button
              disabled={loading}
              className="flex w-full justify-center gap-2 rounded bg-primary p-4 text-primary-foreground"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              Enviar denuncia
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
}

function TextField({ label, onChange, ...inputProps }: TextFieldProps) {
  return (
    <label className="block">
      {label}
      <input
        {...inputProps}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function TextAreaField({
  label,
  onChange,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <label className="block">
      {label}
      <textarea
        {...textareaProps}
        rows={6}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}
