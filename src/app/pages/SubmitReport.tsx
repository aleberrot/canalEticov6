import { SucursalSelector, useSucursales } from '../components/SucursalSelector';
import { ClientLogo } from '../components/ClientLogo';
import { useEffect, useRef, useState } from 'react';
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
import { TermsGate } from '../components/TermsGate';
import { TERMS } from '../data/terms';
import { SimpleCaptcha } from '../components/SimpleCaptcha';
import { DELITOS_GENERALES, DELITOS_LEY_KARIN } from '../data/delitos';
import {
  EMPTY_REPORT_DRAFT,
  ReportDraft,
  usePublicChannel,
} from '../layouts/PublicChannelLayout';
import {
  crearDenuncia,
  CrearDenunciaRequest,
  RelacionEmpresa,
  MAX_ARCHIVO_BYTES,
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
  return <ReportEntry key="GENERAL" tipoDenuncia="GENERAL" />;
}

export function SubmitLeyKarinReport() {
  return <ReportEntry key="LEY_KARIN" tipoDenuncia="LEY_KARIN" />;
}

function ReportEntry({ tipoDenuncia }: { tipoDenuncia: 'GENERAL' | 'LEY_KARIN' }) {
  const [accepted, setAccepted] = useState(false);
  const { setReportDraft } = usePublicChannel();
  useEffect(() => {
    setReportDraft({ ...EMPTY_REPORT_DRAFT, tipoDenuncia });
  }, [tipoDenuncia, setReportDraft]);
  return accepted
    ? <ReportForm tipoDenuncia={tipoDenuncia} />
    : <TermsGate tipoDenuncia={tipoDenuncia} onAccept={() => setAccepted(true)} />;
}

export function ReportForm({ tipoDenuncia }: { tipoDenuncia: 'GENERAL' | 'LEY_KARIN' }) {

  const { empresa, reportDraft, setReportDraft } = usePublicChannel();
  const sucursales = useSucursales(empresa.codigo);
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [codigo, setCodigo] = useState('');
  const isKarin = tipoDenuncia === 'LEY_KARIN';
  const availableDelitos = isKarin ? DELITOS_LEY_KARIN : DELITOS_GENERALES;
  const delito = availableDelitos.find((option) => option.codigo === reportDraft.delitoCodigo);
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
    if (submitting.current) return;
    setError('');

    if (
      !captcha ||
      !reportDraft.aceptaVerdad
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

    if (!sucursales.ready || (sucursales.items.length > 0 && !sucursales.items.some(s=>s.codigo===reportDraft.codigoSucursal))) {
      setError('Selecciona una sucursal válida antes de enviar.'); return;
    }
    const request: CrearDenunciaRequest = {
      codigoEmpresa: empresa.codigo,
      codigoSucursal: reportDraft.codigoSucursal || undefined,
      tipoDenuncia,
      terminosAceptados: true,
      versionTerminos: TERMS.version,
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
      submitting.current = true;
      setLoading(true);
      const response = await crearDenuncia(request, reportDraft.archivo);
      if (!mounted.current) return;
      setCodigo(response.codigo);
      setReportDraft(EMPTY_REPORT_DRAFT);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo enviar la denuncia.',
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  if (codigo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <ClientLogo empresa={empresa} className="mx-auto mb-6" />
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
            <ClientLogo empresa={empresa} compact />
            <div>
              <h1 className="text-primary">{isKarin ? 'Enviar denuncia por Ley Karin' : 'Enviar denuncia general'}</h1>
              <p className="text-muted-foreground">{empresa.nombre}</p>
            </div>
          </div>
          <form onSubmit={submit} autoComplete="off" className="space-y-6">
            {error && (
              <div className="flex gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-600" /> {error}
              </div>
            )}
            <div>
              <p>Tipo de denuncia</p>
              <p className={INPUT_CLASS}>{isKarin ? 'Denuncia por Ley Karin' : 'Denuncia general'}</p>
            </div>
            {!sucursales.ready && <div role="status">{sucursales.error || 'Cargando sucursales...'}
              {sucursales.error && <button type="button" onClick={sucursales.retry}>Volver a intentar</button>}
            </div>}
            <SucursalSelector items={sucursales.items} value={reportDraft.codigoSucursal} onChange={v=>updateField('codigoSucursal',v)} />
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
              minLength={20}
              required
              value={reportDraft.descripcion}
              onChange={(value) => updateField('descripcion', value)}
            />
            <TextField
              label="Personas involucradas"
              maxLength={200}
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
                Información del denunciante ({isKarin ? 'obligatoria' : 'opcional'})
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <input
                  placeholder="Nombre completo"
                  aria-label="Nombre completo"
                  required={isKarin}
                  value={reportDraft.nombreDenunciante}
                  onChange={(event) =>
                    updateField('nombreDenunciante', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  aria-label="Correo electrónico"
                  required={isKarin}
                  value={reportDraft.emailDenunciante}
                  onChange={(event) =>
                    updateField('emailDenunciante', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
                <input
                  type="tel"
                  name="report-contact-phone"
                  autoComplete="off"
                  inputMode="tel"
                  placeholder="Teléfono"
                  aria-label="Teléfono"
                  required={isKarin}
                  value={reportDraft.telefonoDenunciante}
                  onChange={(event) =>
                    updateField('telefonoDenunciante', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block">Documentación de respaldo (máximo 50 MB)</span>
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
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > MAX_ARCHIVO_BYTES) {
                      setError('El archivo no puede superar 50 MB.');
                      event.target.value = '';
                      updateField('archivo', null);
                      return;
                    }
                    setError('');
                    updateField('archivo', file);
                  }}
                  className="sr-only"
                />
              </span>
            </label>
            <label className="block" htmlFor="passwordSeguimiento">
              Contraseña para seguimiento *
              <span className="relative mt-1 block">
                <input
                  id="passwordSeguimiento"
                  name="report-tracking-password"
                  autoComplete="new-password"
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
            <SimpleCaptcha onVerify={setCaptcha} />
            <button
              disabled={loading || !sucursales.ready}
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
  maxLength?: number;
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
  minLength?: number;
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
