import { useState } from 'react';
import type { EmpresaPublicResponse } from '../services/api';

export function ClientLogo({ empresa, compact = false, className = '' }: {
  empresa: Pick<EmpresaPublicResponse, 'codigo' | 'nombre' | 'logo'>;
  compact?: boolean; className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!empresa.logo) return null;
  return (
    <div data-company-brand={empresa.codigo} className={`${compact ? 'max-w-44' : 'max-w-80'} w-full ${className}`}>
      {failedUrl === empresa.logo
        ? <p className="font-semibold text-primary">{empresa.nombre}</p>
        : <img src={empresa.logo} alt={`Logo de ${empresa.nombre}`} onError={() => setFailedUrl(empresa.logo!)}
            className={`${compact ? 'max-h-16' : 'max-h-24'} h-auto max-w-full object-contain`} />}
    </div>
  );
}
