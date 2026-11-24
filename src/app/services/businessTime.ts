export const BUSINESS_TIME_ZONE = 'America/Santiago';

// Calendar dates are not instants: keep old DATEs/incident dates literal.
export function formatBusinessDate(calendar?: string | null, instant?: string | null): string {
  if (instant) return formatBusinessInstant(instant);
  if (!calendar) return 'No disponible';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(calendar);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : 'Fecha no disponible';
}

export function formatBusinessInstant(instant?: string | null): string {
  if (!instant || !/(Z|[+-]\d{2}:\d{2})$/.test(instant)) return 'Fecha y hora no disponibles';
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return 'Fecha y hora no disponibles';
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(date) + ' (America/Santiago)';
}
