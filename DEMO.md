# Demostración gratuita en Render

Crear manualmente un Web Service conectado al repositorio. No utilizar el Blueprint render.yaml: corresponde a la versión de pago.

- Runtime: Node
- Instance type: Free
- Build command: `node --check server.cjs && node --check app.js`
- Start command: `node server.cjs`
- Sin disco persistente.

Variables de entorno en Render:

- `NODE_VERSION`: `24.19.0`
- `HOST`: `0.0.0.0`
- `DEMO_MODE`: `true`
- `DATA_DIR`: `/tmp/bravo-demo`
- `DEMO_ADMIN_USER`: un nombre de administrador de 3 a 80 caracteres (letras, números, guion, punto, arroba o guion bajo).
- `DEMO_ADMIN_PASSWORD`: contraseña privada de 12 a 128 caracteres; introducirla únicamente en Render, nunca en GitHub o el chat.
- `APP_ORIGIN`: URL HTTPS exacta asignada al servicio, sin barra final. Guardar y volver a desplegar cuando se conozca esa URL.

El administrador de demostración se crea automáticamente al arrancar una base vacía. Acceso en `/admin`. Cambiar las variables no reemplaza una cuenta ya existente.

No se transfieren la base local ni sus cuentas o citas. Usar únicamente datos ficticios. Los datos de esta demostración son temporales y se perderán cuando Render suspenda, reinicie o despliegue el servicio. Tras 15 minutos inactivo, Render puede suspenderlo; la siguiente visita puede tardar aproximadamente un minuto.

Antes de compartir el enlace, comprobar inicio de sesión, aviso de demostración, reserva ficticia y bloqueo de horarios. No usar esta modalidad para recibir clientes reales.
