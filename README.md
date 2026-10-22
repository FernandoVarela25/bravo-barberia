# BRAVO — Barbería

Aplicación Node.js con SQLite centralizado y panel autenticado. Requiere Node.js 24. No necesita instalar paquetes.

## Ejecutar

`node server.cjs` y abrir http://127.0.0.1:4173/admin.

En el primer acceso, crear usuario y contraseña (mínimo 12 caracteres) en el formulario. El alta inicial solo está habilitada con el servidor ligado a 127.0.0.1, sin APP_ORIGIN, y se desactiva al existir la primera cuenta. No hay contraseñas por defecto ni recuperación por email todavía.

## Datos y acceso

- Base de datos: `data/bravo.sqlite` (excluida de Git).
- Contraseñas derivadas con scrypt y sal aleatoria. Sesiones de 8 horas en cookies HttpOnly, SameSite=Strict; Secure bajo HTTPS.
- Datos de clientes y escrituras administrativas protegidos en el servidor.
- La disponibilidad pública solo devuelve horas y duraciones.
- Reservas comprobadas dentro de transacciones para evitar solapamientos. Precio y duración se fijan en el servidor y se conservan en cada cita.
- Ediciones de catálogo usan versiones para evitar sobrescribir cambios hechos desde otro dispositivo.
- Fotografías subidas optimizadas por el navegador y guardadas en SQLite. URLs externas también admitidas; requieren acceso al proveedor original.
- Horarios en America/Mexico_City, agenda de un barbero, inicio entre 10:00 y 18:00 y fin máximo 19:00.
- Botón Actualizar datos para traer cambios de otro dispositivo. No hay actualización en tiempo real.
- El catálogo del prototipo puede recuperarse con Importar catálogo anterior después de iniciar sesión. Los datos originales del navegador no se borran y las citas de prueba no se importan automáticamente.

## Acceso desde otros dispositivos: publicación pendiente

La base ya está centralizada, pero 127.0.0.1 solo es accesible en esta computadora. Para acceso por internet se necesita un servidor Node.js persistente con HTTPS y disco persistente. Este backend SQLite no funciona como alojamiento estático ni con discos efímeros de funciones serverless.

Variables: PORT (4173 por defecto), HOST (127.0.0.1), APP_ORIGIN (URL HTTPS pública exacta, sin barra final), DATA_DIR (directorio persistente de SQLite). En hosting usar HOST=0.0.0.0, APP_ORIGIN=https://dominio-del-negocio y DATA_DIR en el volumen persistente. Crear la cuenta local antes de desplegar y transferir la base de datos de forma segura. Ejecutar una sola instancia con su disco persistente; programar respaldos. Nunca publicar data/ ni archivos de entorno. No abrir el servidor local directamente a internet.

Para respaldar sin herramientas adicionales: detener Node, copiar el directorio data completo y reiniciar. Guardar los respaldos en almacenamiento privado. Para restaurar, detener Node y reemplazar el directorio con el respaldo completo.

## Pruebas

`node --test server.test.cjs`

Prueba una base aislada: alta, login, logout, autorización, origen de escrituras, conflictos concurrentes de reservas, privacidad de disponibilidad, cambios de catálogo y persistencia después de reiniciar.

## Pendiente

Publicación HTTPS, respaldo automático, recuperación de contraseña, datos/fotos reales y aviso de privacidad del negocio. WhatsApp y asistente virtual aún no conectados.

## Identidad visual — Fuera del molde

Rediseño editorial con negro tinta, marfil y naranja, tipografía Barlow Condensed y Space Grotesk, portada asimétrica, carta de servicios en filas y galería de alturas alternadas. Imagen conceptual de portada creada con la herramienta integrada de generación de imágenes, ubicada en assets/bravo-editorial.png. No representa un servicio real documentado. El prompt de generación está guardado en assets/hero-prompt.txt.

## Edición azul del estudio

La pestaña Contenido del panel permite editar titular, introducción, presentación, dirección, teléfono y hasta 6 videos. Los videos se agregan mediante enlaces HTTPS directos a MP4/WebM alojados externamente; no se suben archivos de video al disco temporal de Render. La sección se oculta cuando no hay videos. Reproducción manual, sin autoplay, y animaciones que respetan la preferencia de movimiento reducido.

Verificación: `node --test schedule.test.cjs server.test.cjs site-content.test.cjs`.
