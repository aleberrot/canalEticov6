import { trackingRoute, adminRoute } from '../services/navigation';
import { ClientLogo } from '../components/ClientLogo';
import { CHANNEL_INTRO } from '../data/terms';
import { TermsDisclosure } from '../components/TermsDisclosure';
import { WebetikoBrand } from '../components/WebetikoBrand';
import { ArrowRight, FileText, LockKeyhole, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useOptionalPublicChannel } from '../layouts/PublicChannelLayout';

export function Landing() {
  const empresa = useOptionalPublicChannel()?.empresa;
  const base = empresa ? '/canal/' + empresa.codigo : '';
  return <div className="app-surface">
    <header className="channel-header"><div className="channel-header-inner">
      {empresa?.logo ? <ClientLogo empresa={empresa} compact /> : <span className="platform-label">WEBETIKO</span>}
      <WebetikoBrand compact />
    </div></header>
    {empresa?.banner && <img src={empresa.banner} alt={'Banner de ' + empresa.nombre} className="channel-banner" />}
    <main className="channel-main">
      <div className="channel-title">
        <span className="privacy-badge"><ShieldCheck size={16} aria-hidden="true" /> Comunicación confidencial</span>
        <h1>WEBETIKO</h1><p>Canal de Denuncias</p>{empresa && <p className="text-sm">{empresa.nombre}</p>}
      </div>
      <div className="channel-grid">
        <section className="app-card channel-intro" aria-label="Acerca del canal">
          <h2>Un espacio para informar</h2>
          <p className="legal-intro">{empresa ? CHANNEL_INTRO.replaceAll('{empresa}', empresa.nombre) : 'Canal seguro y confidencial para reportar conductas inapropiadas e irregularidades.'}</p>
          <TermsDisclosure />
          <p className="browser-note">Para un óptimo funcionamiento de la plataforma, se recomienda la utilización del navegador Google Chrome</p>
        </section>
        <nav className="app-card channel-actions" aria-label="Acciones del canal">
          <h2>¿Qué necesitas hacer?</h2>
          <p className="actions-description">Tu reporte será tratado de manera <strong>confidencial</strong>.</p>
          {empresa && <>
            <Link to={base + '/denuncia'} className="channel-action channel-action-primary">
              <FileText size={21} aria-hidden="true" /><span><strong>Enviar denuncia general</strong><small>Permite omitir tus datos personales</small></span><ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to={base + '/denuncia-ley-karin'} className="channel-action">
              <ShieldCheck size={21} aria-hidden="true" /><span><strong>Enviar denuncia por Ley Karin</strong><small>Requiere identificación del denunciante</small></span><ArrowRight size={18} aria-hidden="true" />
            </Link>
          </>}
          <Link to={trackingRoute(empresa?.codigo)} className="channel-action channel-action-tracking"><Search size={21} aria-hidden="true" /><span><strong>Consultar denuncia</strong><small>Usa tu código y contraseña de seguimiento</small></span><ArrowRight size={18} aria-hidden="true" /></Link>
          <p className="privacy-note"><LockKeyhole size={16} aria-hidden="true" /> Guarda tu código y contraseña para consultar el estado.</p>
        </nav>
      </div>
      <footer className="channel-footer"><span>WEBETIKO · Canal de Denuncias</span><Link to={adminRoute(empresa?.codigo)}>Acceso administrativo</Link></footer>
    </main>
  </div>;
}
