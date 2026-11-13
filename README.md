# MINU IA · Parlamento de los Gemelos Digitales — V4

## Nuevo en V4 · Identidad visual argentina

Esta versión mantiene las funciones de la V3 (gemelos, foto, voz, descarga JSON, simulación docente y acceso protegido) y suma una estética inspirada en la bandera nacional argentina:

- Paleta celeste y blanca, azul institucional y pequeños detalles dorados.
- Ilustración vectorial **original** del Palacio del Congreso de la Nación en la portada.
- Ilustración vectorial **original** de las bancas del recinto, como fondo de los hemiciclos interactivos.
- Tarjetas claras, mejor contraste de lectura y ajustes para celulares.

Las ilustraciones son representaciones artísticas, **no fotografías**. Están incluidas en el proyecto para que funcionen sin depender de imágenes ni permisos de terceros. No se modifica la lógica del servidor ni se habilita Gemini en modo alumno.

**Actualización rápida desde V3:** si ya tenés la versión anterior publicada, subí únicamente los cuatro archivos del ZIP `MINU_IA_V4_SOLO_ARCHIVOS_MODIFICADOS.zip`, respetando su ubicación dentro de `public/`:

1. `public/index.html` (incorpora la hoja de tema).
2. `public/theme-argentina.css` (nuevo).
3. `public/assets/congreso-hero.svg` (nuevo).
4. `public/assets/recinto-bancas.svg` (nuevo).

También se entrega un ZIP de **proyecto completo** para instalaciones nuevas. Las instrucciones de uso de alumnos, docente y Cloudflare continúan debajo.


## Nuevo en V3 · Foto y voz del gemelo

En modo alumno, dentro de la ficha política aparece **Identidad visual y sonora**:

- **Foto:** se admite JPG, PNG o WebP; la app recorta el retrato a formato cuadrado y lo comprime a JPEG antes de guardarlo. Puede ser una ilustración de un personaje ficticio (preferible a una foto real de un menor). No llama a ningún generador de imágenes ni consume Gemini.
- **Voz:** el alumno puede grabar una presentación con el micrófono (hasta 25 segundos) o adjuntar un audio propio breve (máximo 450 KB; duración máxima 30 segundos cuando el navegador permite verificarla). Recomendamos WebM/Opus o MP3, idealmente de 10–20 segundos. La grabación requiere permiso de micrófono y HTTPS, que el sitio workers.dev ya tiene.
- **Descargar:** la foto y la voz están **embebidas como datos base64 en el mismo `MINU-IA-LEG-XX.json`**, por lo que el estudiante sigue entregando un solo archivo a Moodle. No debe enviar la foto ni el audio por separado.
- **Importar:** el docente selecciona todos los JSON desde **Importar perfiles**. Las fotos se muestran en la lista de gemelos y junto a las intervenciones; el audio puede reproducirse mediante **Escuchar presentación**.
- **Leer discursos:** un botón aparte, **Leer discurso (voz del navegador)**, usa la síntesis de voz integrada del navegador, sin costo de API. Esta voz genérica **no es una clonación de la muestra** subida por el alumno.

Para evitar sobrepasar el límite de `localStorage`, los medios se guardan en **IndexedDB**, por separado del texto. El sistema no los envía al servidor ni a Gemini. Es imprescindible descargar el JSON antes de cerrar la actividad: navegar en incógnito, borrar los datos del navegador o usar otro dispositivo puede hacer que desaparezcan los borradores. El profesor debe conservar los archivos recibidos por Moodle y, preferentemente, exportar también un respaldo de todos los perfiles una vez importados.

**Protección de menores:** no exigir fotos ni voces reales. El estudiante puede usar un retrato ilustrado y una voz de personaje, o dejar la multimedia vacía cuando no haya consentimiento suficiente. Nunca se debe subir la voz ni la imagen de otras personas sin autorización. Los JSON se entregan mediante la tarea privada de Moodle, no mediante foros públicos.

**Límites:** una muestra de voz no convierte automáticamente cada discurso de Gemini en audio con la misma voz. Implementar voces sintéticas personalizadas requeriría un servicio adicional y consentimiento explícito.

## Qué cambió

**Primera clase: modo alumno, completamente sin Gemini.** Al entrar a la URL pública, la app inicia en modo alumno. El estudiante elige una banca, completa su perfil, pulsa Guardar perfil y luego Descargar mi agente. La ficha `.json` se entrega por Moodle. Toda la actividad se guarda localmente en ese navegador (no se envía al servidor); no se hacen llamadas a Google.

**Segunda clase: modo docente.** La opción **Acceso docente** solicita tu contraseña, que debe existir como secreto `ADMIN_PASSWORD` en Cloudflare. Solo entonces aparecen Sesión legislativa, Acta, importar perfiles y el panel para introducir una API Key de Google AI Studio. Los estudiantes no pueden llamar al endpoint Gemini porque el Worker exige esa contraseña para cada consulta.

La API Key **no se configura como secreto ni variable** de Cloudflare en esta versión. El docente la ingresa desde su PC al iniciar la sesión, marca expresamente «Autorizar consumo de API» y el navegador la transmite por HTTPS a su Worker, que realiza la llamada a Google. No se agrega a código fuente, URL, JSON exportados, localStorage ni a la base de datos. **Se borra cuando se recarga o cierra la página**. Aun así, para una publicación institucional permanente es más seguro utilizar un secreto de servidor: esta modalidad depende de mantener protegidos el navegador y la contraseña docente.

## Actualizar tu GitHub y Cloudflare

1. Descomprimí el ZIP de esta versión.
2. Copiá **el contenido** de la carpeta del proyecto a la **raíz** del repositorio `claseseth/minuia` en GitHub, reemplazando los archivos de la versión anterior (`public/index.html`, `public/app.js`, `public/styles.css`, `src/worker.js`, `README.md`, etc.). No subas la carpeta adicional como subcarpeta ni el archivo `.dev.vars`.
3. Confirmá los cambios (commit) en la rama `main`. Cloudflare Workers Builds debería detectar el commit y publicar una nueva versión.
4. En Cloudflare → tu Worker → Settings → Variables and Secrets, **conservá** el secreto `ADMIN_PASSWORD` con una contraseña fuerte. `GEMINI_API_KEY` ya no es necesario: este código **no lo utiliza** y podés eliminar el secreto antiguo después de confirmar el despliegue.
5. Entrá en la misma URL desde una ventana incógnita: debe mostrar `Taller de gemelos · sin IA`, y no mostrar las secciones Sesión legislativa ni Acta.

## Primera clase · consigna para alumnos

1. Abrí la URL del MINU IA compartida por el profesor.
2. Entrá en «Gemelos políticos» y seleccioná la banca asignada por cámara, provincia y bloque.
3. Escribí una postura argumentada sobre el proyecto, prioridades políticas, límites de negociación y estilo parlamentario (todo desde el rol ficticio, no como opinión personal).
4. Hacé clic en «Guardar perfil», y luego en «Descargar mi agente ↓».
5. Entregá el archivo `MINU-IA-LEG-xx.json` en Moodle. No entregues capturas ni pegues el texto de la API.

La banca queda seleccionada en ese navegador. Para cambiar por error, usá «Cambiar de banca»; si usás una ventana privada o borrás datos del navegador, se perderá el borrador. **Siempre descargá el JSON**. La identificación de banca es organizativa, no una cuenta autenticada; el docente debe cotejarla con el reparto original.

## Segunda clase · procedimiento docente

1. Abrí la plataforma desde tu PC y tocá **Acceso docente**.
2. Ingresá `ADMIN_PASSWORD`. Esto comprueba el acceso sin consumir créditos de Google.
3. Entrá en Gemelos políticos → Importar perfiles y seleccioná en conjunto todos los archivos JSON recibidos por Moodle. La importación **solo acepta IDs existentes y evita cambiar la cámara, provincia o bloque**.
4. Entrá en Sesión legislativa; elegí cámara y tema.
5. Pegá tu API Key de Google AI Studio **en el campo docente** y marcá «Autorizar consumo de API».
6. Elegí «Gemini real» y comenzá con 4 oradores para comprobar cuota y funcionamiento.
7. Realizá la votación y descargá el acta. Al cerrar el navegador, la clave desaparece. Borrá la clave desde el botón si dejás la pantalla desatendida.

## Servidor local

`npm install` y `npm run dev`. Para probar la contraseña localmente, creá `.dev.vars` a partir de `.dev.vars.example` (nunca se sube al repositorio). No hace falta definir ninguna clave de Google; se pega después de entrar como docente.

## Seguridad y límites

- **No hay llamadas a Gemini por el alumno**, ni botón de sesión visible en su modo. El Worker comprueba la contraseña docente antes de procesar cualquier llamada que pudiera gastar créditos.
- La clave de Google permanece en la memoria del navegador del profesor mientras está cargada; la transmite temporalmente al Worker y luego Google. No se conserva en el servidor.
- El código no escribe claves en logs. Evitá extensiones de navegador no confiables, sesiones docentes en equipos compartidos y publicar capturas que muestren claves.
- Se usa la cuota del proyecto de Google asociado a la clave ingresada; el servicio puede rechazar solicitudes por límite gratuito o disponibilidad del modelo.
- No hay sincronización entre los alumnos: cada estudiante descarga su JSON y lo entrega mediante Moodle.
- La lista precargada contiene roles ficticios, no nombres reales de menores; no cargues nombres reales innecesariamente.
- Un usuario con la contraseña docente podría gastar cuota si también accede a una API key. Usá una contraseña larga y privada y no la compartas con los alumnos.
- La API Key introducida directamente en el navegador es un **compromiso práctico de seguridad**. Para instalaciones institucionales de largo plazo, Google recomienda que las claves no se expongan al frontend; el almacenamiento como secreto de servidor es la opción preferible.
