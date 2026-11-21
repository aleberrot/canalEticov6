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

Validación: 43 pruebas frontend aprobadas, TypeScript estricto y compilación Vite aprobados. Las cuatro regresiones nuevas comprueban el presupuesto de arranque, la cancelación, el aviso de demora y la acción de reintento.

Se prepara en fix-emp01-startup-20261121, con despliegue automático Vercel deshabilitado para esa rama y PR en borrador. Esta corrección no migra el alojamiento ni elimina los arranques en frío del servidor; tolera su demora y permite recuperar la carga. El diagnóstico/cotización de alojamiento continúa separado.
