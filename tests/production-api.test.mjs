import assert from 'node:assert/strict';
import { test } from 'node:test';
import { productionApiOrigin, DEFAULT_PRODUCTION_API_ORIGIN } from '../deployment/production-api.mjs';

test('Vercel sin variable canónica conserva la API pública vigente', () => {
  assert.equal(productionApiOrigin({}), DEFAULT_PRODUCTION_API_ORIGIN);
});
test('la configuración antigua de Oracle no vuelve a dirigir el canal a esa IP', () => {
  assert.equal(productionApiOrigin({ VITE_API_URL: 'https://146.181.52.233' }), DEFAULT_PRODUCTION_API_ORIGIN);
});
test('variable canónica vacía no activa el alias retirado', () => {
  assert.equal(productionApiOrigin({VITE_CANAL_API_URL:'  ',VITE_API_URL:'https://146.181.52.233'}), DEFAULT_PRODUCTION_API_ORIGIN);
});
test('un destino canónico explícito y seguro permite una migración revisada', () => {
  assert.equal(productionApiOrigin({VITE_CANAL_API_URL:' https://api.example.invalid/ ',VITE_API_URL:'https://146.181.52.233'}), 'https://api.example.invalid');
});
test('impide compilar con el destino retirado incluso como variable canónica', () => {
  assert.throws(()=>productionApiOrigin({VITE_CANAL_API_URL:'https://146.181.52.233'}));
});
test('rechaza localhost, HTTP, rutas, credenciales y parámetros', () => {
  for(const value of ['http://api.example.invalid','https://localhost','https://127.0.0.1','https://[::1]','https://api.example.invalid/api','https://user:secret@api.example.invalid','https://api.example.invalid?key=synthetic','not-a-url']) {
    assert.throws(()=>productionApiOrigin({VITE_CANAL_API_URL:value}));
  }
});
