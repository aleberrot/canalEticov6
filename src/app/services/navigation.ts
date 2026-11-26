const validCode = (value?: string | null) => value && /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value) ? value : null;
export function channelHome(code?: string | null): string {
  const fallback = validCode(import.meta.env.VITE_DEFAULT_EMPRESA_CODE) || 'mathiesen';
  return '/canal/' + encodeURIComponent(validCode(code) || fallback);
}
export function trackingRoute(code?: string | null): string {
  const home = channelHome(code);
  return '/tracking?empresa=' + home.slice('/canal/'.length);
}
export function adminRoute(code?: string | null): string {
  const home = channelHome(code);
  return '/admin?empresa=' + home.slice('/canal/'.length);
}
