// Solo GET públicos; nunca crea denuncias ni consulta datos privados.
import { performance } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
const origin = process.env.BENCH_API_URL;
if (!origin || new URL(origin).protocol !== 'https:') throw new Error('Configura BENCH_API_URL con el origen HTTPS del backend.');
const results = [];
for (const code of ['emp-01', 'emp-02']) {
  for (let sample = 1; sample <= 3; sample++) {
    const start = performance.now();
    try {
      const response = await fetch(new URL('/api/empresas/' + code, origin), { signal: AbortSignal.timeout(15000), redirect: 'error', credentials: 'omit' });
      const bytes = (await response.arrayBuffer()).byteLength;
      results.push({ code, sample, status: response.status, ms: Math.round(performance.now() - start), bytes });
    } catch (error) {
      results.push({ code, sample, status: null, ms: Math.round(performance.now() - start), error: error.name });
    }
  }
}
const output = { date: new Date().toISOString(), results, note: 'Tiempo total de respuesta del endpoint público; no mide LCP ni garantiza una muestra fría.' };
console.log(JSON.stringify(output, null, 2));
if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(output, null, 2));
