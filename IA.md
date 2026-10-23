# Activar Encuentra tu estilo

La interfaz y la integración están preparadas. No se ha ejecutado un análisis real sin una API key. No se generan recomendaciones de muestra cuando falta la conexión.

En Render → Environment, añadir:

- OPENAI_API_KEY: clave privada de un proyecto de OpenAI, con acceso a Responses y facturación API habilitada. Nunca pegarla en el chat, GitHub o frontend.
- OPENAI_STYLE_MODEL: gpt-4.1-mini (entrada de imagen y salida estructurada; configurable).
- AI_STYLE_ENABLED: true. Usar false para desactivar.
- AI_DAILY_LIMIT: 20 para comenzar. Límite global de intentos diarios, incluyendo fallos, no por cliente.

Guardar y desplegar. La cuenta debe tener acceso al modelo. La facturación del proveedor es adicional al hosting; configurar alertas y revisar consumo. El contador se guarda en SQLite: en la demo gratuita puede reiniciarse cuando se pierda la base. No es un límite monetario ni reemplaza controles del proveedor. El límite de frecuencia usa la conexión al servidor y puede compartirse entre visitantes detrás del proxy de Render.

Cada análisis envía una fotografía JPEG reducida a 1024 píxeles y las preferencias a OpenAI. BRAVO no guarda foto ni respuesta en su base; store:false evita guardar la respuesta como estado recuperable, pero no garantiza cero retención en el proveedor. Ver https://developers.openai.com/api/docs/guides/your-data.

Catálogo inicial configurable por desarrollo en style-ai.cjs: seis referencias que debe revisar el barbero antes de activar. El asesor propone tres, no genera imágenes ni garantiza resultados. Solo el nombre del corte elegido se guarda en la cita.

Validar con fotos consentidas: iluminación insuficiente, ausencia de rostro, varios rostros, distintas texturas y preferencias. Revisar con un barbero la utilidad de las respuestas. Ejecutar primero una prueba controlada antes de compartir públicamente.

Comprobaciones locales: node --test schedule.test.cjs server.test.cjs site-content.test.cjs style-ai.test.cjs
