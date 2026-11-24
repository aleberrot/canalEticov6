import { formatBusinessInstant } from '../services/businessTime';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { AporteDenunciaResponse } from '../services/api';

export function AportesHistory({ aportes, legacyInfo, onDownload }: {
  aportes?: AporteDenunciaResponse[];
  legacyInfo?: string;
  onDownload: (aporte: AporteDenunciaResponse) => Promise<void>;
}) {
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const items: AporteDenunciaResponse[] = aportes ?? (legacyInfo ? [{ id: 'legacy', informacion: legacyInfo, legacy: true, tieneArchivo: false }] : []);
  async function download(aporte: AporteDenunciaResponse) {
    setError(''); setDownloading(aporte.id);
    try { await onDownload(aporte); }
    catch (err) { setError(err instanceof Error ? err.message : 'No fue posible descargar el archivo.'); }
    finally { setDownloading(null); }
  }
  return <section className="space-y-4 border-t border-border pt-6">
    <h2 className="text-lg text-primary">Información adicional / Trazabilidad</h2>
    {items.length === 0 && <p className="text-muted-foreground">No se han enviado aportes adicionales.</p>}
    {items.map((aporte, index) => <article key={aporte.id} className="space-y-3 rounded-lg border border-border bg-secondary/40 p-5">
      <h3 className="font-medium">{aporte.legacy ? 'Registro anterior' : `Aporte #${index + (items[0]?.legacy ? 0 : 1)}`}</h3>
      <p className="text-sm text-muted-foreground">{aporte.createdAt
        ? formatBusinessInstant(aporte.createdAt)
        : 'Fecha y hora no disponibles (registro anterior)'}</p>
      {aporte.informacion && <p className="whitespace-pre-wrap break-words">{aporte.informacion}</p>}
      {aporte.tieneArchivo && <button type="button" disabled={downloading !== null} onClick={() => void download(aporte)}
        className="flex items-center gap-2 break-all text-primary underline disabled:opacity-50">
        <Download className="h-4 w-4 shrink-0" /> {aporte.nombreArchivo || 'Descargar adjunto'}
      </button>}
    </article>)}
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </section>;
}
