// Public deployment configuration. Never put credentials in this file.
export const DEFAULT_PRODUCTION_API_ORIGIN = 'https://canal-etico-api-w9dm.onrender.com';

export function productionApiOrigin(env = {}) {
  // VITE_API_URL is a historical alias in the application, but this Vercel
  // project still has the retired Oracle value. Do not inherit it at build time.
  const value = env.VITE_CANAL_API_URL?.trim() || DEFAULT_PRODUCTION_API_ORIGIN;
  let url;
  try { url = new URL(value); }
  catch { throw new Error('VITE_CANAL_API_URL debe indicar un origen HTTPS válido.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/' || ['localhost','127.0.0.1','[::1]','146.181.52.233'].includes(url.hostname)) {
    throw new Error('La API de producción debe ser un origen HTTPS autorizado; no se admite el destino Oracle retirado ni localhost.');
  }
  return url.origin;
}
