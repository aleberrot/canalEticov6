export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

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
}

export interface CrearDenunciaResponse {
  codigo: string;
  estado: EstadoDenuncia;
}

export interface SeguimientoRequest {
  code: string;
  password: string;
}

export interface SeguimientoDenunciaResponse {
  codigoUnico: string;
  tipoDenuncia: TipoDenuncia;
  delitoTipificacion: string;
  estado: EstadoDenuncia;
  descripcion: string;
  informacionAdicional?: string;
  conclusionesMedidas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DenunciaAdminResponse {
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

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  );

  if (archivo) {
    form.append('archivo', archivo);
  }

  const response = await fetch(`${API_URL}/api/denuncias`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    return handleError(response);
  }

  return response.json() as Promise<CrearDenunciaResponse>;
}

export async function consultarDenuncia(
  data: SeguimientoRequest,
): Promise<SeguimientoDenunciaResponse> {
  const response = await fetch(`${API_URL}/api/denuncias/seguimiento`, {
    method: 'POST',
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
  const form = new FormData();
  form.append('password', password);

  if (informacion) {
    form.append('informacion', informacion);
  }

  if (archivo) {
    form.append('archivo', archivo);
  }

  const response = await fetch(
    `${API_URL}/api/denuncias/${codigo}/informacion-adicional`,
    {
      method: 'POST',
      body: form,
    },
  );

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
): Promise<EmpresaPublicResponse> {
  const response = await fetch(
    `${API_URL}/api/empresas/${encodeURIComponent(codigo)}`,
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
  anchor.download = `denuncia-${codigo}`;
  anchor.click();
  URL.revokeObjectURL(url);
}
