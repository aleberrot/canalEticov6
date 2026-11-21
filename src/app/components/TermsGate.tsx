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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <Link to={`/canal/${empresa.codigo}`} className="text-primary underline">Volver al inicio</Link>
        <h1 className="text-2xl text-primary">{tipoDenuncia === 'GENERAL' ? 'Enviar denuncia general' : 'Enviar denuncia por Ley Karin'}</h1>
        <p>{empresa.nombre}</p>
        <p>{CHANNEL_INTRO.replaceAll('{empresa}', empresa.nombre)}</p>
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
