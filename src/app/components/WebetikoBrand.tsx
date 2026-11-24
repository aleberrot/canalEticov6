import { useState } from 'react';

export function WebetikoBrand({ inverse = false, layout = 'horizontal', compact = false, className = '' }: {
  inverse?: boolean; layout?: 'horizontal' | 'vertical'; compact?: boolean; className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const localLogo = '/marca/webetiko-2026.webp';
  const override = import.meta.env.VITE_WEBETIKO_LOGO_URL?.trim();
  const src = override && override !== failedUrl ? override : localLogo;
  const size = layout === 'vertical' ? 'max-w-56' : compact ? 'max-w-48' : 'max-w-80';
  if (failedUrl === localLogo) {
    return <p className={`text-center font-bold ${inverse ? 'text-white' : 'text-primary'}`}>WEBETIKO.COM</p>;
  }
  return (
    <div className={`webetiko-brand ${layout === 'horizontal' ? 'webetiko-horizontal' : ''} mx-auto w-full ${size} ${inverse ? 'rounded-lg bg-white' : ''} ${className}`}>
      <img src={src} alt="WEBETIKO — Grupo Conthrol Tech" width={2172}
        height={724} onError={() => setFailedUrl(src)}
        className="block h-auto w-full object-contain" />
    </div>
  );
}
