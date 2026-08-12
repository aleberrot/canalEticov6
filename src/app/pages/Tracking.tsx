import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Search, Loader2, AlertCircle } from 'lucide-react';
import { consultarDenuncia } from '../services/api';

export function Tracking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call API to verify and get report
      await consultarDenuncia({
        codigo: formData.codigo,
        password: formData.password
      });

      // If successful, navigate to status page
      navigate(`/status/${formData.codigo}`, {
        state: { password: formData.password }
      });
    } catch (err) {
      console.error('Error tracking report:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo consultar la denuncia. Verifica tus datos e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-primary">Consultar Denuncia</h1>
              <p className="text-muted-foreground">Verifica el estado de tu reporte</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block mb-2 text-foreground">
                Código de denuncia
              </label>
              <input
                id="code"
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                placeholder="DEN-XXXXXXXXX"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-2 text-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                'Consultar estado'
              )}
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-accent border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Nota:</strong> Necesitas el código de seguimiento que recibiste al enviar tu denuncia 
              y la contraseña que creaste en ese momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
