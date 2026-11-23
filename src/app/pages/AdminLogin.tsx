import { WebetikoBrand } from '../components/WebetikoBrand';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { esErrorNoAutorizado, obtenerEmpresas } from '../services/api';

interface AdminLoginLocationState {
  sessionExpired?: boolean;
}

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as AdminLoginLocationState | null;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    locationState?.sessionExpired
      ? 'Tu sesión administrativa ya no es válida.'
      : '',
  );
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const credentials = btoa(`${username}:${password}`);

    try {
      await obtenerEmpresas(credentials);
      localStorage.setItem('adminCredentials', credentials);
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      localStorage.removeItem('adminCredentials');
      setError(
        esErrorNoAutorizado(requestError)
          ? 'Usuario o contraseña incorrectos'
          : 'No fue posible validar las credenciales. Inténtalo nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-surface py-8 sm:py-12">
      <div className="container mx-auto max-w-md px-4">
        <Link to="/">Volver al inicio</Link>
        <div className="mt-6 app-card report-card">
          <WebetikoBrand layout="vertical" className="mb-4" />
          <h1 className="text-primary">Panel Administrativo</h1>
          <form onSubmit={submit} className="mt-6 space-y-5">
            {error && (
              <p className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}
            <label className="block">
              Usuario
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="block w-full rounded border p-3"
              />
            </label>
            <label className="block">
              Contraseña
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full rounded border p-3"
              />
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded bg-primary p-3 text-primary-foreground disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? 'Validando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
