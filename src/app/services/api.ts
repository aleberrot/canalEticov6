export const API_URL = (import.meta.env.VITE_CANAL_API_URL?.trim() || import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8080').replace(/\/+$/, '');
export const MAX_ARCHIVO_BYTES = 50 * 1024 * 1024;

export type TipoDenuncia = 'GENERAL' | 'LEY_KARIN';
export type RelacionEmpresa =
  | 'TRABAJADOR'
  | 'CLIENTE'
  | 'PROVEEDOR'
  | 'CONTRATISTA'
  | 'SUBCONTRATISTA'
  | 'OTRO';
export type EstadoDenuncia = 'RECIBIDA' | 'EN_REVISION' | 'CERRADA';

export interface CrearDenunciaRequest {
  codigoEmpresa: string;
  tipoDenuncia: TipoDenuncia;
  delitoCodigo: string;
  delitoTipificacion: string;
  delitoDescripcion: string;
  relacionEmpresa: RelacionEmpresa;
  descripcion: string;
  personasInvolucradas?: string;
  fechaIncidente?: string;
  nombreDenunciante?: string;
  emailDenunciante?: string;
  telefonoDenunciante?: string;
  testigos?: string;
  password: string;
  terminosAceptados?: boolean;
  versionTerminos?: string;
}

export interface CrearDenunciaResponse {
  codigo: string;
  estado: EstadoDenuncia;
}

export interface SeguimientoRequest {
  code: string;
  password: string;
}

export interface AporteDenunciaResponse {
  id: string;
  informacion?: string;
  nombreArchivo?: string;
  tieneArchivo: boolean;
  createdAt?: string;
  legacy: boolean;
}

export interface SeguimientoDenunciaResponse {
  empresa?: EmpresaPublicResponse;
  codigoUnico: string;
  tipoDenuncia: TipoDenuncia;
  delitoTipificacion: string;
  estado: EstadoDenuncia;
  descripcion: string;
  informacionAdicional?: string;
  aportes?: AporteDenunciaResponse[];
  conclusionesMedidas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DenunciaAdminResponse {
  tieneArchivo?: boolean;
  nombreArchivo?: string;
  codigoUnico: string;
  tipoDenuncia: TipoDenuncia;
  delitoCodigo: string;
  delitoTipificacion: string;
  delitoDescripcion?: string;
  relacionEmpresa: RelacionEmpresa;
  descripcion: string;
  personasInvolucradas?: string;
  fechaIncidente?: string;
  estado: EstadoDenuncia;
  nombreDenunciante?: string;
  emailDenunciante?: string;
  telefonoDenunciante?: string;
  testigos?: string;
  nombreDenunciado?: string;
  fechaDescargo?: string;
  descargo?: string;
  conclusionesMedidas?: string;
  informacionAdicional?: string;
  aportes?: AporteDenunciaResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ActualizarDetalleAdminRequest {
  nombreDenunciado?: string;
  fechaDescargo?: string;
  descargo?: string;
  conclusionesMedidas?: string;
}

export interface EmpresaAdminResponse {
  codigo: string;
  nombre: string;
  logo?: string;
  banner?: string;
  correoNotificacion?: string;
  activa: boolean;
}

export interface EmpresaPublicResponse {
  codigo: string;
  nombre: string;
  logo?: string | null;
  banner?: string | null;
  activa: boolean;
}

export interface EstadisticasEmpresaResponse {
  total: number;
  generales: number;
  leyKarin: number;
  recibidas: number;
  enRevision: number;
  cerradas: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly kind: 'http' | 'validation' | 'network' | 'response';
  readonly cause?: unknown;

  constructor(
    message: string,
    status: number,
    kind: ApiError['kind'] = [400, 413, 422].includes(status) ? 'validation' : 'http',
    cause?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.cause = cause;
  }
}

interface ErrorResponse {
  message?: string;
}

async function handleError(response: Response): Promise<never> {
  const body = (await response.json().catch(() => null)) as ErrorResponse | null;
  throw new ApiError(body?.message ?? `Error HTTP ${response.status}`, response.status);
}

function basicAuth(credentials: string): HeadersInit {
  return {
    Authorization: `Basic ${credentials}`,
  };
}

export function esErrorNoAutorizado(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export const etiquetaEstado = (estado: EstadoDenuncia) =>
  ({
    RECIBIDA: 'Recibida',
    EN_REVISION: 'En revisión',
    CERRADA: 'Cerrada',
  })[estado];

export async function crearDenuncia(
  data: CrearDenunciaRequest,
  archivo?: File | null,
): Promise<CrearDenunciaResponse> {
  if (archivo && archivo.size > MAX_ARCHIVO_BYTES) {
    throw new ApiError('El archivo no puede superar 50 MB.', 413);
  }
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
    'data.json',
  );

  if (archivo) {
    form.append('archivo', archivo);
  }

  const url = `${API_URL}/api/denuncias`;
  let response: Response | undefined;
  let responseBody: unknown;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: form,
      credentials: 'omit',
      // A redirect could change the method or resend confidential data to another host.
      redirect: 'error',
    });

    const text = await response.text();
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = null;
    }
    if (!response.ok) {
      const body = responseBody as ErrorResponse | null;
      const message = response.status === 413
        ? 'El archivo o la solicitud supera el tamaño permitido.'
        : typeof body?.message === 'string'
          ? body.message
          : `No se pudo enviar la denuncia (HTTP ${response.status}).`;
      throw new ApiError(message, response.status);
    }
    const result = responseBody as CrearDenunciaResponse | null;
    if (!result || typeof result.codigo !== 'string' || !result.codigo ||
        !['RECIBIDA', 'EN_REVISION', 'CERRADA'].includes(result.estado)) {
      throw new ApiError(
        'El servidor devolvió una respuesta inesperada. Contacta al administrador antes de reenviar la denuncia.',
        response.status,
        'response',
      );
    }
    return result;
  } catch (originalError) {
    const error = originalError instanceof ApiError
      ? originalError
      : new ApiError(
          'No fue posible comunicarse con el servidor. Por favor intenta nuevamente.',
          response?.status ?? 0,
          'network',
          originalError,
        );
    // Never log the request, headers, raw response or arbitrary exception messages:
    // validation/proxy errors can echo passwords, filenames and personal data.
    const body = responseBody as { status?: unknown } | null;
    const originalMessage = originalError instanceof Error ? originalError.message : '';
    const safeFetchMessages = ['Failed to fetch', 'Load failed', 'NetworkError when attempting to fetch resource.'];
    const requestId = response?.headers.get('X-Request-ID');
    console.error('Error al crear denuncia', {
      url,
      method: 'POST',
      kind: error.kind,
      status: response?.status ?? null,
      requestId: requestId && /^[a-zA-Z0-9-]{1,64}$/.test(requestId) ? requestId : null,
      contentType: response?.headers.get('Content-Type')?.split(';')[0],
      responseBody: response ? {
        status: typeof body?.status === 'number' ? body.status : undefined,
        content: '[omitido para proteger datos confidenciales]',
      } : null,
      originalError: {
        name: originalError instanceof TypeError ? 'TypeError' :
          originalError instanceof ApiError ? 'ApiError' : 'Error',
        message: safeFetchMessages.includes(originalMessage) ? originalMessage : '[omitido]',
      },
    });
    throw error;
  }
}

export async function consultarDenuncia(
  data: SeguimientoRequest,
): Promise<SeguimientoDenunciaResponse> {
  const response = await fetch(`${API_URL}/api/denuncias/seguimiento`, {
    method: 'POST',
    credentials: 'omit',
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<SeguimientoDenunciaResponse>;
}

export async function agregarInformacionAdicional(
  codigo: string,
  password: string,
  informacion?: string,
  archivo?: File | null,
): Promise<SeguimientoDenunciaResponse> {
  if (archivo && archivo.size > MAX_ARCHIVO_BYTES) {
    throw new ApiError('El archivo no puede superar 50 MB.', 413);
  }
  if (!informacion?.trim() && (!archivo || archivo.size === 0)) {
    throw new ApiError('Escribe información o selecciona un documento para continuar.', 400);
  }
  const form = new FormData();
  form.append('password', password);

  if (informacion) {
    form.append('informacion', informacion);
  }

  if (archivo) {
    form.append('archivo', archivo);
  }

  let response: Response;
  try {
    response = await fetch(
    `${API_URL}/api/denuncias/${codigo}/informacion-adicional`,
    {
      method: 'POST',
      body: form,
      credentials: 'omit',
      redirect: 'error',
    },
  );
  } catch (cause) {
    throw new ApiError('No se pudo confirmar el envío. Consulta el historial antes de reenviar para evitar duplicados.', 0, 'network', cause);
  }

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<SeguimientoDenunciaResponse>;
}

export async function obtenerEmpresas(
  credentials: string,
): Promise<EmpresaAdminResponse[]> {
  const response = await fetch(`${API_URL}/api/admin/empresas`, {
    headers: basicAuth(credentials),
  });

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<EmpresaAdminResponse[]>;
}

export async function obtenerEmpresaPublica(
  codigo: string,
  signal?: AbortSignal,
): Promise<EmpresaPublicResponse> {
  const response = await fetch(
    `${API_URL}/api/empresas/${encodeURIComponent(codigo)}`,
    { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(90000)]) : AbortSignal.timeout(90000), credentials: 'omit', redirect: 'error' },
  );

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<EmpresaPublicResponse>;
}

export async function obtenerDenunciasPorEmpresa(
  codigoEmpresa: string,
  credentials: string,
): Promise<DenunciaAdminResponse[]> {
  const response = await fetch(
    `${API_URL}/api/admin/empresas/${encodeURIComponent(codigoEmpresa)}/denuncias`,
    { headers: basicAuth(credentials) },
  );

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<DenunciaAdminResponse[]>;
}

export async function obtenerEstadisticasEmpresa(
  codigoEmpresa: string,
  credentials: string,
): Promise<EstadisticasEmpresaResponse> {
  const response = await fetch(
    `${API_URL}/api/admin/empresas/${encodeURIComponent(codigoEmpresa)}/estadisticas`,
    { headers: basicAuth(credentials) },
  );

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<EstadisticasEmpresaResponse>;
}

export async function obtenerDenuncias(
  credentials: string,
): Promise<DenunciaAdminResponse[]> {
  const response = await fetch(`${API_URL}/api/admin/denuncias`, {
    headers: basicAuth(credentials),
  });

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<DenunciaAdminResponse[]>;
}

export async function actualizarEstadoDenuncia(
  codigo: string,
  estado: EstadoDenuncia,
  credentials: string,
): Promise<DenunciaAdminResponse> {
  const response = await fetch(
    `${API_URL}/api/admin/denuncias/${codigo}/estado?estado=${estado}`,
    {
      method: 'PATCH',
      headers: basicAuth(credentials),
    },
  );

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<DenunciaAdminResponse>;
}

export async function actualizarDetalleAdmin(
  codigo: string,
  data: ActualizarDetalleAdminRequest,
  credentials: string,
): Promise<DenunciaAdminResponse> {
  const response = await fetch(
    `${API_URL}/api/admin/denuncias/${codigo}/detalle`,
    {
      method: 'PATCH',
      headers: {
        ...basicAuth(credentials),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<DenunciaAdminResponse>;
}

export async function descargarArchivo(
  codigo: string,
  credentials: string,
  nombreArchivo?: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/admin/denuncias/${codigo}/archivo`,
    { headers: basicAuth(credentials) },
  );

  if (!response.ok) {
    return handleError(response);
  }

  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = nombreArchivo || `denuncia-${codigo}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function descargarAporte(
  codigo: string,
  aporte: AporteDenunciaResponse,
  auth: { password: string } | { credentials: string },
): Promise<void> {
  const admin = 'credentials' in auth;
  const path = `/api/${admin ? 'admin/' : ''}denuncias/${encodeURIComponent(codigo)}/aportes/${encodeURIComponent(aporte.id)}/archivo`;
  const response = await fetch(`${API_URL}${path}`, admin ? {
    headers: basicAuth(auth.credentials), redirect: 'error', credentials: 'omit',
  } : {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: auth.password }), redirect: 'error', credentials: 'omit',
  });
  if (!response.ok) return handleError(response);
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = aporte.nombreArchivo || 'documento';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
