import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { productionApiOrigin } from '../deployment/production-api.mjs';

const origin = productionApiOrigin(process.env);
console.log(`API pública de esta compilación: ${origin}`);
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)),
  'build', '--configLoader', 'runner',
], {
  cwd: fileURLToPath(new URL('../', import.meta.url)),
  // Normalize both aliases so the retired value cannot remain in the bundle.
  env: { ...process.env, VITE_CANAL_API_URL: origin, VITE_API_URL: origin },
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
