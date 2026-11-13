# MINU IA — Parlamento de los Gemelos Digitales

**Versión inicial para Escuela Técnica Henry Ford · Política y Ciudadanía**

## Qué incluye
- Interfaz docente, perfiles de legisladores, hemisiclos de Diputados y Senado.
- 33 bancas **anónimas**, basadas en cámara/provincia/bloque del documento de roles del MINU 2026. Los nombres reales de alumnos **no se incluyen**.
- Edición y exportación de perfil individual como JSON: cada estudiante entrega su archivo y el docente lo importa.
- Modo demostración **sin IA** (reglas locales, claramente identificado).
- Modo Gemini real: intervenciones por rol, debate escalonado y votación nominal por lotes de 5.
- Guardado automático local en el navegador, detener sesión, exportar acta y datos JSON.

## Abrir para ver (sin API)
Opción A: ejecutar un servidor estático en la carpeta `public`:

```
cd public
python -m http.server 8000
```

Abrí `http://localhost:8000` en la PC. No funciona al abrir el `index.html` desde `file://` porque carga roles.json.

## Instalar para usar Gemini en la PC
Requiere **Node.js** instalado y una API key de **Google AI Studio**.

1. Abrí una terminal en la carpeta raíz del proyecto.
2. Ejecutá `npm install`.
3. Copiá `.dev.vars.example` a `.dev.vars`.
4. Reemplazá los valores de `GEMINI_API_KEY` y `ADMIN_PASSWORD`. **No compartas estos secretos.**
5. Ejecutá `npm run dev`.
6. Abrí la dirección local que indique Wrangler (usualmente `http://localhost:8787`).
7. Desde *Sesión legislativa*, elegí «Gemini real» e ingresá la contraseña docente.

## Publicar en Cloudflare
1. `npx wrangler login`
2. `npx wrangler secret put GEMINI_API_KEY`
3. `npx wrangler secret put ADMIN_PASSWORD`
4. `npm run deploy`
5. Opcional: editá `GEMINI_MODEL` en `wrangler.jsonc` si tu cuenta no tiene acceso al modelo predeterminado. Consultá el panel de modelos y límites de Google AI Studio.

La clave API **solo se utiliza desde el Worker** y nunca se envía al navegador. La contraseña docente sí se escribe en el navegador, por lo que debe mantenerse privada. Para un despliegue público o institucional es recomendable incorporar autenticación robusta, rate limiting y almacenamiento compartido; este MVP no los incluye.

## Procedimiento en el aula
1. Cada estudiante abre la plataforma y edita **una banca** asignada (postura, argumentos, límites y estilo).
2. Descarga `MINU-IA-LEG-xx.json` y entrega ese archivo al docente.
3. El docente importa los archivos con «Importar perfiles», cámara por cámara.
4. En «Sesión legislativa» configura proyecto, oradores y modo (demo o Gemini).
5. Inicia el debate, supervisa intervenciones y, después, habilita la votación.
6. Descarga el acta; cada estudiante compara su decisión en el MINU con la de su agente.

## Alcances y límites
- **No hay sincronización en vivo de perfiles entre computadoras**: se intercambian archivos JSON y se importa en el equipo docente.
- **No hay agentes persistentes desplegados como procesos**: cada intervención es una solicitud contextualizada a Gemini; las votaciones se consultan en lotes de 5 perfiles para disminuir consumo de API. Los perfiles no se «reúnen» autónomamente fuera de la sesión.
- Los votos de IA no son predicciones de políticos reales ni reflejan las opiniones políticas de alumnos.
- En el **modo gratuito de Gemini**, los datos enviados pueden utilizarse para mejorar servicios de Google según sus condiciones. Evitá nombres, contactos, datos personales o posturas políticas reales de menores.
- El navegador guarda avances mediante `localStorage`, que puede perderse si se borran los datos del sitio. Exportá JSON tras cada sesión.
- El proyecto es una herramienta didáctica, no un sistema electoral real ni una investigación validada.
- Las cuotas gratuitas y la disponibilidad de modelos varían por cuenta. Consultá los límites en https://aistudio.google.com/usage y https://ai.google.dev/gemini-api/docs/rate-limits.

## Archivos
- `public/index.html`, `styles.css`, `app.js`, `roles.json`: interfaz.
- `src/worker.js`: proxy seguro para la API Gemini.
- `wrangler.jsonc`: configuración Cloudflare.
