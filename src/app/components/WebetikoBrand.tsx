import { useState } from 'react';

export function WebetikoBrand({ inverse = false }: { inverse?: boolean }) {
  const [failed, setFailed] = useState(false);
  const logo = import.meta.env.VITE_WEBETIKO_LOGO_URL?.trim();
  return logo && !failed ? <img src={logo} alt="WEBETIKO" onError={() => setFailed(true)} className="mx-auto mb-6 max-h-16 max-w-56 object-contain" /> : <p className={`mb-6 text-center text-2xl font-bold ${inverse ? 'text-white' : 'text-primary'}`}>WEBETIKO</p>;
}
