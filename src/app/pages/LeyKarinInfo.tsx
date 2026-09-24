import { Link } from 'react-router';
import { ArrowLeft, Shield, AlertTriangle, Lock, FileText, Users } from 'lucide-react';
import { usePublicChannel } from '../layouts/PublicChannelLayout';

export function LeyKarinInfo() {
  const { empresa } = usePublicChannel();
  const channelBase = `/canal/${empresa.codigo}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          to={channelBase}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary rounded-lg p-4">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-primary">Ley Karin – Información sobre denuncias</h1>
              <p className="text-muted-foreground">
                {empresa.nombre} · Conoce tus derechos y cómo reportar
              </p>
            </div>
          </div>
          
          {/* What is Ley Karin */}
          <section className="mb-10">
            <h2 className="mb-4 text-primary flex items-center gap-2">
              <FileText className="w-6 h-6" />
              ¿Qué es la Ley Karin?
            </h2>
            <div className="bg-secondary p-6 rounded-lg">
              <p className="text-foreground leading-relaxed mb-4">
                La <strong>Ley Karin</strong> (Ley N° 21.643) es una normativa chilena que establece 
                medidas de prevención, investigación y sanción del acoso laboral, sexual y la violencia 
                en el trabajo.
              </p>
              <p className="text-foreground leading-relaxed">
                Esta ley obliga a los empleadores a implementar protocolos de prevención y 
                canales seguros para denunciar este tipo de conductas, garantizando la 
                confidencialidad y protección de quien denuncia.
              </p>
            </div>
          </section>
          
          {/* Types of situations */}
          <section className="mb-10">
            <h2 className="mb-4 text-primary flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Situaciones que puedes reportar
            </h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-5 hover:border-primary transition-colors">
                <h3 className="text-primary mb-2">Acoso laboral</h3>
                <p className="text-muted-foreground">
                  Conductas hostiles, humillantes o intimidatorias dirigidas de manera repetida 
                  contra un trabajador, que afectan su dignidad o crean un ambiente laboral hostil.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-5 hover:border-primary transition-colors">
                <h3 className="text-primary mb-2">Acoso sexual</h3>
                <p className="text-muted-foreground">
                  Requerimientos de carácter sexual no consentidos que provoquen amenaza, 
                  ofensa, humillación o un ambiente intimidatorio, hostil u ofensivo.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-5 hover:border-primary transition-colors">
                <h3 className="text-primary mb-2">Violencia en el trabajo</h3>
                <p className="text-muted-foreground">
                  Agresiones físicas o psicológicas, amenazas o actos que atenten contra 
                  la integridad física o psíquica de los trabajadores.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-5 hover:border-primary transition-colors">
                <h3 className="text-primary mb-2">Discriminación</h3>
                <p className="text-muted-foreground">
                  Tratos diferenciados arbitrarios por raza, género, edad, orientación sexual, 
                  religión, discapacidad u otra condición protegida por ley.
                </p>
              </div>
            </div>
          </section>
          
          {/* Confidentiality */}
          <section className="mb-10">
            <h2 className="mb-4 text-primary flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Política de confidencialidad
            </h2>
            <div className="bg-accent border border-primary/30 p-6 rounded-lg">
              <ul className="space-y-3 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Tu identidad será protegida en todo momento del proceso</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Solo el personal autorizado tendrá acceso a la información</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Todas las denuncias son investigadas de manera imparcial</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>No se permitirán represalias contra quien reporte de buena fe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Los datos serán almacenados de forma segura y confidencial</span>
                </li>
              </ul>
            </div>
          </section>
          
          {/* Responsible use */}
          <section className="mb-10">
            <h2 className="mb-4 text-primary flex items-center gap-2">
              <Users className="w-6 h-6" />
              Uso responsable del canal
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <p className="text-foreground leading-relaxed mb-4">
                <strong className="text-yellow-900">Importante:</strong> Este canal está diseñado 
                para reportar situaciones reales de acoso, violencia o discriminación en el trabajo.
              </p>
              <p className="text-foreground leading-relaxed mb-4">
                El uso malintencionado o la presentación de denuncias falsas puede:
              </p>
              <ul className="space-y-2 text-foreground ml-6">
                <li className="list-disc">Dañar la reputación de personas inocentes</li>
                <li className="list-disc">Obstaculizar investigaciones legítimas</li>
                <li className="list-disc">Resultar en sanciones legales o laborales</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-4">
                Por favor, utiliza este canal de manera responsable y proporciona 
                información veraz y completa.
              </p>
            </div>
          </section>
          
          {/* Call to action */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={channelBase}
                className="flex-1 bg-white text-primary py-4 px-6 rounded-lg border-2 border-primary hover:bg-secondary transition-colors text-center"
              >
                Volver al inicio
              </Link>
              
              <Link 
                to={`${channelBase}/denuncia-ley-karin`}
                className="flex-1 bg-primary text-primary-foreground py-4 px-6 rounded-lg hover:bg-primary/90 transition-colors shadow-md text-center"
              >
                Continuar para enviar denuncia
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
