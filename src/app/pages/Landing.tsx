import { Shield } from 'lucide-react';
import { Link } from 'react-router';
import { useOptionalPublicChannel } from '../layouts/PublicChannelLayout';

export function Landing() {
  const channel = useOptionalPublicChannel();
  const empresa = channel?.empresa;
  const channelBase = empresa ? `/canal/${empresa.codigo}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      {empresa?.banner && (
        <img
          src={empresa.banner}
          alt={`Banner de ${empresa.nombre}`}
          className="h-48 w-full object-cover md:h-64"
        />
      )}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          {empresa?.logo ? (
            <img
              src={empresa.logo}
              alt={`Logo de ${empresa.nombre}`}
              className="mb-8 max-h-32 max-w-64 object-contain"
            />
          ) : (
            <div className="mb-8 rounded-full bg-primary p-6 shadow-lg">
              <Shield className="h-16 w-16 text-primary-foreground" />
            </div>
          )}

          <h1 className="mb-3 text-5xl text-primary">Canal Ético</h1>
          {empresa && <h2 className="mb-6 text-2xl">{empresa.nombre}</h2>}

          <p className="mb-4 max-w-2xl text-xl leading-relaxed text-foreground">
            Canal seguro y confidencial para reportar conductas inapropiadas,
            irregularidades o situaciones que comprometan la ética de la empresa.
          </p>
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Tu reporte será tratado de manera <strong>confidencial</strong>.
            La denuncia general permite omitir tus datos personales. Para Ley Karin se requiere identificación.
          </p>

          <div className="flex w-full max-w-lg flex-col gap-4">
            {empresa && (
              <Link
                to={`${channelBase}/denuncia`}
                className="rounded-lg bg-primary px-8 py-4 text-center text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Enviar denuncia general
              </Link>
            )}
            {empresa && (
              <Link to={`${channelBase}/denuncia-ley-karin`}
                className="rounded-lg border-2 border-primary bg-secondary px-8 py-4 text-center text-primary shadow-md transition-colors hover:bg-accent">
                Enviar denuncia por Ley Karin
              </Link>
            )}
            <Link
              to="/tracking"
              className="rounded-lg border-2 border-primary bg-white px-8 py-4 text-center text-primary shadow-md transition-colors hover:bg-secondary"
            >
              Consultar denuncia
            </Link>
          </div>

          <div className="mt-12 text-sm text-muted-foreground">
            <Link
              to="/admin"
              className="underline transition-colors hover:text-primary"
            >
              Acceso administrativo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
