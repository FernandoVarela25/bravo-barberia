# Publicar BRAVO en Render

Preparación local completada; no se ha creado ni contratado un servicio externo.

## Requisitos

- Cuenta GitHub con un repositorio privado para esta aplicación.
- Cuenta Render conectada solo al repositorio necesario.
- Servicio web Starter y disco persistente de 1 GB. Referencia al 21 de octubre de 2026: 7 USD/mes + 0.25 USD/mes, antes de impuestos, excesos y posibles cargos del workspace elegido. Revisar el total que Render muestre antes de contratar.
- Una cuenta administradora creada localmente y la base de datos que se quiera conservar.

## Procedimiento

1. Crear la cuenta de Render. La persona titular debe completar registro, aceptación de términos y facturación.
2. Subir el código a un repositorio privado de GitHub. Excluir `data/`, archivos `.env`, contraseñas y respaldos. No subir la base de datos a GitHub.
3. En Render crear un **Web Service**, conectar ese repositorio, elegir Node y el tamaño Starter. Build: `node --check server.cjs && node --check app.js`. Start: `node server.cjs`.
4. Configurar NODE_VERSION=24.19.0, HOST=0.0.0.0, DATA_DIR=/var/data/bravo. Añadir disco persistente de 1 GB en `/var/data`. Mantener una sola instancia.
5. Tras conocer la URL exacta asignada por Render, establecer APP_ORIGIN a esa URL HTTPS, sin barra final. Volver a desplegar. Por ejemplo, si Render asigna `https://nombre-unico.onrender.com`, usar exactamente ese valor, no un nombre supuesto. El formulario no podrá guardar hasta que coincida.
6. Transferir la base local mediante un canal privado al disco persistente. Detener el servidor local antes de respaldar SQLite. En el servidor remoto, detener o poner en mantenimiento el servicio durante la restauración. No reemplazar una base remota que ya tenga citas nuevas. No exponer respaldos mediante URLs públicas.
7. Verificar desde un navegador distinto: inicio de sesión, reserva de prueba, visualización en agenda, edición del catálogo y persistencia tras un reinicio. Cancelar la cita usada para la prueba.
8. Establecer respaldos privados externos de SQLite y comprobar una restauración antes de recibir clientes. Los snapshots del disco no sustituyen una estrategia de respaldo consistente de la base de datos.
9. Sustituir datos de muestra por nombre, servicios, horarios, contacto y fotografías reales, y añadir el aviso de privacidad del negocio.

`render.yaml` ofrece la misma configuración como Blueprint. APP_ORIGIN se solicita en la creación y se debe corregir con la URL real asignada antes de usar formularios. El procedimiento manual permite conocer primero esa URL.

## Dominio y costos

Se puede empezar con el subdominio onrender.com y HTTPS incluidos. El dominio propio es opcional y se paga por separado. WhatsApp e IA no están incluidos ni conectados.

Esta arquitectura usa SQLite en un disco persistente: no crear un Static Site ni escoger el servicio gratuito sin disco. Un despliegue con disco puede producir una interrupción breve al actualizar. Para escalar a varias instancias habrá que migrar a una base de datos externa.

Documentación oficial:
- https://render.com/pricing
- https://render.com/docs/web-services
- https://render.com/docs/disks
- https://render.com/docs/blueprint-spec
