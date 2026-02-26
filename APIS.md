# Lista de APIs y qué se puede hacer

Base del backend: **`https://osdemsventas.site`** (configurable con `VITE_API_BASE` y `VITE_API_AI_BASE` en `.env`).

---

## 1. Autenticación

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/auth/register` | **Crear cuenta.** Body: `FormData` con `email`, `password`, `first_name`, `last_name`. No requiere token. |
| POST | `/api/v1/auth/login` | **Iniciar sesión.** Body: `{ "email", "password" }`. Devuelve un token (Bearer) que el front guarda y envía en el resto de peticiones. |

**En el panel:** Login con correo/contraseña; botón "Crear cuenta" abre el modal de registro.

---

## 2. Excel / Base de datos

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/excel/import` | **Importar contactos.** Body: `FormData` con campo `file` (archivo .xlsx). Requiere token. Las columnas deben coincidir con lo que documente el backend (ej. email, nombre). |
| GET | `/api/v1/excel/campaigns` | **Listar campañas** del usuario. Requiere token. Devuelve array de campañas (con `id`/`campaign_id`, `name`/`subject`, etc.). |

**En el panel:** Paso 1 — subir Excel e importar; el desplegable de campañas se rellena con esta lista.

---

## 3. Campañas (crear y enviar)

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/excel/campaigns` | **Crear campaña.** Body: `{ "name", "subject", "body" }`. Requiere token. Devuelve la campaña creada (con `id` o `campaign_id`). |
| POST | `/api/v1/campaigns/send` | **Enviar campaña.** Body: `{ "campaign_id": number }`. Requiere token. Dispara el envío de la campaña a la base asociada. |

**En el panel:** Paso 2 — elegir campaña existente o crear una (asunto + cuerpo); Paso 3 — botón "Enviar campaña" con la campaña seleccionada.

---

## 4. IA (generar texto)

Todos **POST**, body: `{ "prompt": "..." }`. Requieren token (según backend).

| Endpoint | Qué hace |
|----------|----------|
| `/api/v1/generate` | Generación automática (modelo por defecto del backend). |
| `/api/v1/ollama/qwen2-5-0-5b` | Ollama — modelo qwen2.5 0.5B. |
| `/api/v1/ollama/qwen2-5-1-5b` | Ollama — modelo qwen2.5 1.5B. |
| `/api/v1/mistral/mistral-tiny` | Mistral — mistral-tiny. |
| `/api/v1/gemini/gemini-pro` | Google — Gemini Pro. |

**En el panel:** Paso 2B — describes la promoción o público; eliges proveedor/modelo; "Sugerir asunto y texto" rellena el cuerpo del correo (y puedes editarlo antes de guardar/enviar).

---

## Resumen rápido

| Área | Acciones en el panel |
|------|----------------------|
| **Auth** | Iniciar sesión, crear cuenta (modal). |
| **Excel** | Importar .xlsx (contactos), listar campañas. |
| **Campañas** | Crear campaña (asunto + cuerpo), seleccionar una, enviar. |
| **IA** | Sugerir texto para el correo (varios modelos). |

Documentación detallada del backend: **https://osdemsventas.site/api-docs/** (si está publicada).
