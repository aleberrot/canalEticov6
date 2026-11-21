# Acceso a emp-01 durante el arranque del servicio

Se comprobó el enlace https://canaletico.absoftwareworks.com/canal/emp-01 .

## Evidencia observada

1. El frontend pasó de Cargando canal a Canal no disponible.
2. El endpoint público de emp-01 mostró la pantalla de arranque de Render.
3. Al terminar ese arranque, el endpoint devolvió codigo=emp-01 y activa=true.
4. Al recargar el dominio del canal con el servidor activo se mostró Empresa 1 y los enlaces de denuncia GENERAL y LEY_KARIN.

La empresa existe y está activa. El código publicado limitaba la consulta a 15 segundos, lo que puede interrumpir la carga durante un arranque en frío. No se observó un problema de permisos de la empresa ni de CORS al completar el arranque.

## Corrección preparada

- Espera acotada de hasta 90 segundos para obtener la empresa; no se amplía la espera de POST de denuncias.
- Aviso de demora a partir de 10 segundos.
- Botón Volver a intentar para fallos transitorios; no se presenta en el canal inexistente/inactivo.
- Cancelación de la consulta al abandonar el canal y descarte de respuestas antiguas.
- No se inventan empresas, no se omite la comprobación de actividad y no se muestra contenido de otro cliente.
- No hay reintentos automáticos ni envíos de denuncias de prueba a producción.

Validación de integración: 46 pruebas frontend, TypeScript estricto y compilación Vite. Se conservaron los logos oficiales de WEBETIKO y Mathiesen y las pruebas de separación entre clientes.

La publicación de las correcciones fue autorizada por el usuario el 21/11/2026. Se integra con main mediante la PR #2 antes del despliegue. Esta corrección tolera la demora del servidor y permite recuperar la carga; el diagnóstico/cotización de alojamiento continúa separado.
