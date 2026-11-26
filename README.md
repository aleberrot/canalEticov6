# WEBETIKO — frontend

React 18, TypeScript y Vite. Esta candidata implementa las observaciones del cliente del 23/11/2026. No autoriza un despliegue.

## Requisitos y ejecución

Node 24 o superior y npm. `package-lock.json` es el bloqueo canónico de esta entrega.

```sh
npm ci
# Copiar .env.example a .env.local y establecer la API de desarrollo.
npm run dev
npm run check
npm test
npm run build
```

Vite expone las variables `VITE_*` al navegador: nunca poner secretos en ellas. En Vercel configurar `VITE_CANAL_API_URL` con el endpoint HTTPS del backend antes de compilar. La SPA necesita la reescritura de `vercel.json`.

## Prueba funcional aislada

Arrancar el arnés `AuditBrowserPreviewTest` del backend en 18081, con H2, correo y archivos simulados. Arrancar Vite en `localhost:5173` apuntando a esa API. Instalar el Chromium de Playwright con `npx playwright install chromium` o definir `CHROME_EXECUTABLE` hacia un Chrome local. Ejecutar:

```sh
npm run test:browser
```

El ensayo usa datos sintéticos, acepta términos únicamente locales y no llama a producción. Evidencias en `test-artifacts/`, excluidas de Git. El arnés fija el reloj UTC para verificar la presentación de Chile, incluso con el navegador en UTC.

## Entrega

- `docs/WEBETIKO_REPORTE_CAMBIOS_2026-11-23.md`: matriz de las 20 láminas, pruebas, pendientes y rollback.
- `docs/WEBETIKO_DOCUMENTACION_TECNICA.md`: arquitectura, configuración, operación y transferencia.
- `src/app/services/businessTime.ts`: zona de negocio y tratamiento de fechas históricas.
- `src/app/services/navigation.ts`: retorno contextual a cada empresa.
- `public/marca/webetiko-2026.webp`: logo original de la PPT, optimizado conservando transparencia.

La rama `fix-observaciones-20261123` tiene desactivada la publicación automática de previews. La aprobación de la PR no debe confundirse con autorización para ejecutar migraciones o publicar en producción.
