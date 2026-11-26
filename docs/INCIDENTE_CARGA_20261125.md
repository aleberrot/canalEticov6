# Incidente: Canal no disponible — 25/11/2026

## Resultado comprobado

La interfaz productiva responde HTTP 200, pero el bundle publicado consulta `https://146.181.52.233`. Ese destino no completó el handshake TLS en la comprobación. El usuario confirma que la pantalla termina en **Canal no disponible**.

La URL de la API usada en la última versión verificada era `https://canal-etico-api-w9dm.onrender.com`. El archivo eliminado `.env.production` fijaba ese origen con `VITE_CANAL_API_URL`. Al desaparecer, la compilación quedó expuesta a configuración histórica de Vercel. El bundle actual confirma la IP; determinar cuál variable exacta está configurada en el dashboard requiere consultar Vercel, no inferirlo del código minificado.

Esta es una regresión de configuración de publicación. Las pruebas anteriores compilaban con la variable canónica correcta y no reprodujeron una publicación heredando el alias antiguo. No se atribuye el problema solo al navegador, a React o al arranque frío.

## Evidencia, sin denuncias ni credenciales

| Comprobación | Resultado |
| --- | --- |
| PR frontend #6 | Fusionada; main `4b01dfc157c3c7cf67ed6dff039cec70079564d8` |
| Vercel de ese commit | Deployment has completed |
| HTML `/canal/mathiesen` | HTTP 200, 544 bytes, 4,43 s de solicitud |
| JS productivo | `/assets/index-B0vZ6Z-k.js`, 295.110 bytes |
| Expresión efectiva de API | IP `https://146.181.52.233`, seguida del fallback localhost |
| API configurada en esa IP | Handshake TLS agotado en 22,38 s; no se eludieron certificados |
| API Render de referencia | La comprobación agotó 105,81 s; falta revisar registros del servicio |
| PR backend #5 | Fusionada; master `91bdfac9d784e3219e61a41becc2a7ff54109e1e` |

Los tiempos son observaciones del cliente de diagnóstico, no percentiles ni una confirmación del estado interno de Render. La prueba Chrome fue bloqueada por acceso de red de este entorno y no se presenta como una prueba visual aprobada de producción. Se obtuvo el HTML y su bundle por solicitudes HTTP de lectura.

## Corrección preparada

- `deployment/production-api.mjs` contiene el origen público por defecto de esta instalación. No contiene secretos.
- `scripts/build-vercel.mjs` normaliza ambas variables Vite a un origen aprobado antes de compilar. Vercel no hereda `VITE_API_URL` histórico cuando falta la variable canónica.
- Una `VITE_CANAL_API_URL` explícita segura conserva prioridad, permitiendo una migración revisada. Si apunta a la IP retirada, HTTP, localhost o contiene rutas/credenciales, la compilación falla en lugar de publicar otro cliente roto.
- `vercel.json` utiliza ese comando de build. Se mantiene el rewrite de SPA y se desactivan previews en la rama de corrección.
- No se restaura un `.env.production` ni se guardan contraseñas en Git. El desarrollo local y su alias de API no cambian.

## Validación efectuada

63 pruebas frontend aprobadas y TypeScript estricto aprobado. La compilación se ejecutó reproduciendo `VITE_API_URL=https://146.181.52.233` sin variable canónica. El bundle corregido contiene Render y **no contiene la IP retirada**. Build Vite aprobado; JS inicial 295,54 kB / 96,22 kB gzip. No hubo cambios en formularios, denuncias, archivos, notificaciones o base de datos.

Se cubren el entorno vacío, alias antiguo, variable canónica vacía, prioridad de un origen explícito seguro, rechazo del destino retirado y rechazo de orígenes inseguros.

## Pendiente antes de declarar restauración

1. Revisar y autorizar la publicación de la PR de corrección. No se fusionó ni desplegó automáticamente.
2. No usar la IP antigua ni desactivar TLS, CORS o autenticación para ocultar el fallo. No enviar claves de seguimiento a un destino alternativo.
3. Confirmar `VITE_CANAL_API_URL` efectiva en Vercel. Si está configurada con la IP retirada, reemplazarla por el origen correcto antes del redeploy; no confiar solo en el alias histórico.
4. Revisar los logs y el commit activo de Render. El backend fusionado requiere la migración aditiva `operations/20261124_observaciones.sql`; no se da por aplicada ni se ejecuta automáticamente. Un error de esquema sería una segunda incidencia, todavía no confirmada por logs.
5. Comprobar respuesta JSON de Mathiesen y sus 17 sucursales, CORS y apertura del canal real, sin enviar denuncias ni correos de prueba.

No se cambió el plan de Render, no se migró alojamiento ni se modificó producción durante este diagnóstico. Una compilación corregida no demuestra por sí sola que la API ya responda. Acceso a registros de Render pendiente de instalar/conectar la integración autorizada.

Referencia de configuración: https://vercel.com/docs/project-configuration/vercel-json#buildcommand
