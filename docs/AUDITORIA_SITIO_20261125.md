# Auditoría de WEBETIKO en producción

Fecha local: 25/11/2026, America/Santiago. Referencias: PPT de 23/11 (20 láminas), PPT previa de términos aprobados e instrucciones del usuario. Frontend observado: main `bde945faa11a5bfdb44fe0958039343b22e5b309`, bundle `index-BHK16XEj.js`. Backend remoto: versión exacta no confirmada.

## Dictamen

**No corresponde declarar entrega íntegramente aceptada.** La interfaz pública carga en Chrome aislado y existe el catálogo real de sucursales. El contrato publicado por el backend todavía carece de los nuevos campos de instante. Las pruebas locales previas no acreditan despliegue, migración ni entrega SMTP real.

| Requerimiento | Evidencia actual | Resultado |
| --- | --- | --- |
| Mathiesen como cliente separado | GET público activo; ambos logos cargados; ejemplos independientes | Confirmado en producción |
| Marca WEBETIKO | Dos textos de portada mostraban WEBETICO | Corregidos en esta candidata; instrucción del usuario prevalece sobre la C de lámina 6 |
| General y Ley Karin; términos aprobados | Ambos enlaces abren su aceptación obligatoria; continuar deshabilitado; textos conservados en código y tests | Accesos confirmados; envíos completos probados previamente en local aislado |
| Inicio, consulta y administración | Links conservan empresa; seguimiento y login abren con contraseña vacía | Navegación pública confirmada; sesión administrativa real no utilizada |
| No reutilizar datos ni credenciales | 66 tests frontend incluyen envíos independientes y reset; pruebas locales previas de ambos tipos | Probado en candidata; no se generan denuncias reales para auditar |
| 17 sucursales de Mathiesen | GET remoto retorna 17 activas, coincidentes con catálogo aprobado; selector General/Karin probado en navegador local | Catálogo confirmado; escritura administrativa y persistencia de una denuncia real no ejercidas |
| Fecha correcta General/Karin | Nuevo DTO en master contiene `createdAtInstant`/`updatedAtInstant`; `/v3/api-docs` productivo no los contiene | Bloqueante: verificar versión activa y migración antes de cerrar |
| Aportes sucesivos en ambos tipos, adjuntos e historial | Pruebas locales previas de dos aportes por tipo y descargas; servicio corregido en repositorio | Requiere validar backend actualizado; no acreditado en producción |
| Cuatro asuntos, tres destinatarios, HTML y avisos de cada evento | Cola transaccional y correo simulado probados en backend local | Pendiente verificar despliegue, configuración y entrega SMTP real autorizada |
| Carga emp-01/emp-02 | Ambos metadatos públicos HTTP 200 activos; 7,9 s en esta medición | Disponibles; rendimiento aún no aceptable como cierre sin mediciones representativas |
| Logo por cliente | Mathiesen y plataforma visibles; emp-02 devuelve logo y banner nulos | Falta recurso de emp-02 si se exige identidad propia para el ejemplo |
| Estética y móvil | Portada y aceptación General/Karin sin desborde horizontal a 375 px | Confirmado en las pantallas públicas recorridas; no cubre todos los dispositivos |

## Fallos corregidos en esta revisión

1. `Landing.tsx`: título y alternativa de cabecera WEBETIKO. Regresión SSR y expectativas de navegador actualizadas.
2. Empresa, sucursales, consulta y edición de sucursales dependían de `AbortSignal.any/timeout`. Al retirar esas funciones en una prueba, la empresa fallaba antes de iniciar red. Se sustituyen por AbortController y temporizador con limpieza, propagación de cancelación y espera que cubre lectura JSON. No se agregan reintentos de POST. Los límites siguen siendo 90 s para catálogos, 15 s para consulta y 30 s para guardar sucursal. **Es un defecto reproducido, no la causa confirmada del fallo del navegador particular del usuario.**

## Validación

- 66 tests frontend aprobados, TypeScript estricto y build Vercel correctos.
- `tests/channel-loading.browser.cjs`: build local servido de forma aislada, API simulada; escritorio 1280 px y móvil 375 px sin métodos nativos estáticos AbortSignal. En ambos: nombre, términos, General/Karin, sucursal seleccionable, contraseña vacía, ausencia de desborde y recuperación manual tras 503. Sin enviar denuncias.
- Producción observada con Chrome nuevo usando la conectividad configurada del entorno: portada 9,34 s, logos cargados, términos de ambos tipos, consulta y login. Sin errores JavaScript, sin aceptación de términos ni POST de denuncias. Una muestra no mide SLA ni permite atribuir toda la demora al proveedor.
- `/v3/api-docs` 200; esquema de seguimiento sin campos nuevos de instante. Catálogo remoto 17/17 activo. Esta diferencia prueba un contrato anterior; no permite conocer por sí sola el SHA exacto del servidor ni el estado de la migración.
- La evidencia pública reproducible está en `docs/evidence/20261125_public_audit.json`. Para reproducir navegador local: build, `CHROME_EXECUTABLE` opcional y `node tests/channel-loading.browser.cjs`.

## Pendientes para cierre

Verificar la versión y configuración del backend en Render, comprobar y aplicar de forma controlada la migración aditiva pendiente si aún corresponde, y validar en staging fechas, aportes y avisos con el código actualizado. Después confirmar SMTP, remitente/destinatarios y acceso privado R2, respaldo y rotación de credenciales históricas. Cualquier prueba real de denuncias/correos requiere coordinación; no se realizó en esta auditoría.

Las sucursales siguen siendo ampliación separada del proyecto original; el diagnóstico/cotización de alojamiento tampoco se integra al alcance original. Se mantienen pendientes los $150.000 CLP de V3 y el saldo original. No se enviaron mensajes a Christian.
