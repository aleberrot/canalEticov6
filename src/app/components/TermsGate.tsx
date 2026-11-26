import { WebetikoBrand } from './WebetikoBrand';
import { ClientLogo } from './ClientLogo';
import { useState } from 'react';
import { Link } from 'react-router';
import { CHANNEL_INTRO } from '../data/terms';
import { TermsDisclosure } from './TermsDisclosure';
import { usePublicChannel } from '../layouts/PublicChannelLayout';

export function TermsGate({ tipoDenuncia, onAccept }: {
  tipoDenuncia: 'GENERAL' | 'LEY_KARIN'; onAccept: () => void;
}) {
  const { empresa } = usePublicChannel();
  const [checked, setChecked] = useState(false);
  return (
    <div className="app-surface px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-6 app-card report-card">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
        <Link to={`/canal/${empresa.codigo}`} className="text-primary underline">Inicio</Link>
        <h1 className="text-2xl text-primary">{tipoDenuncia === 'GENERAL' ? 'Enviar denuncia general' : 'Enviar denuncia por Ley Karin'}</h1>
          </div>
          <WebetikoBrand compact className="mb-4" /><ClientLogo empresa={empresa} compact />
        </header>
        <p>{empresa.nombre}</p>
        <p className="legal-intro">{CHANNEL_INTRO.replaceAll('{empresa}', empresa.nombre)}</p>
        <p>Por favor coloque la mayor cantidad de datos posibles al realizar su reporte.</p>
        <TermsDisclosure />
        <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); if (checked) onAccept(); }}>
          <label className="flex items-start gap-3">
            <input type="checkbox" required checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1" />
            He leído y aceptado todos los términos y condiciones.
          </label>
          <button type="submit" disabled={!checked} className="w-full rounded-lg bg-primary p-4 text-primary-foreground disabled:opacity-50">
            Continuar al formulario
          </button>
        </form>
        <p className="text-sm text-muted-foreground">Para un óptimo funcionamiento de la plataforma, se recomienda la utilización del navegador Google Chrome</p>
      </div>
    </div>
  );
}
