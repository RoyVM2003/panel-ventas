# Lista de APIs y qué se puede hacer

Base del backend: **`https://osdemsventas.site`** (configurable con `VITE_API_BASE` y `VITE_API_AI_BASE` en `.env`).

---

## 1. Autenticación

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/auth/register` | **Crear cuenta.** Body: `FormData` con `email`, `password`, `first_name`, `last_name`. No requiere token. |
| POST | `/api/v1/auth/login` | **Iniciar sesión.** Body: `{ "email", "password" }`. Devuelve un token (Bearer) que el front guarda y envía en el resto de peticiones. Si la cuenta no está verificada, devuelve error y el front muestra el formulario para ingresar el código. |
| POST | `/api/v1/auth/verify-email` | **Verificar cuenta.** Body: `{ "email", "code" }` (código de 6 dígitos enviado por correo). |
| POST | `/api/v1/auth/forgot-password` | **Solicitar restablecimiento de contraseña.** Envía un correo con enlace a `/reset-password?token=...`. |
| POST | `/api/v1/auth/reset-password` | **Restablecer contraseña.** El front envía `{ "token", "password" }` usando el token recibido por correo. |
| GET | `/api/v1/auth/verify-reset-token/{token}` | Verificar si un token de restablecimiento es válido o ha expirado. |

**En el panel:** Login con correo/contraseña; botón "Crear cuenta" abre el modal de registro.

---

## 2. Excel / Base de datos

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/excel/import` | **Importar contactos.** Body: `FormData` con campo `file` (archivo .xlsx). Requiere token. Las columnas deben coincidir con lo que documente el backend (ej. email, nombre). |
| GET | `/api/v1/excel/campaigns` | **Listar campañas/contactos** con paginación. Query: `page`, `limit`, `search`. Requiere token. Respuesta: `{ success, data: [...] }`. |

**En el panel:** Paso 1 — subir Excel e importar; el desplegable de campañas se rellena con esta lista.

---

## 3. Campañas (crear y enviar)

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/excel/campaigns` | **Crear campaña.** Body: `{ "name", "subject", "body" }`. Requiere token. Devuelve la campaña creada (con `id` o `campaign_id`). |
| POST | `/api/v1/campaigns/send` | **Enviar campaña.** Body: `{ "subject", "message" }` (asunto y cuerpo del correo). Envía a todos los registros activos en `email_campaigns`. Requiere token. |

**En el panel:** Paso 2 — elegir campaña existente o crear una (asunto + cuerpo); Paso 3 — botón "Enviar campaña" con la campaña seleccionada.

---

## 4. IA (generar texto)

- **POST `/api/v1/ai/campaign-suggestion`**  
  - Body básico: `{ "prompt": "..." }` (según esquema `CampaignSuggestionRequest` se pueden añadir más campos opcionales cuando el backend los exponga).  
  - Respuesta tipo `CampaignSuggestionResponse` (normalmente asunto + cuerpo sugeridos).  
  - Requiere token.

**En el panel:** Paso 2B — describes la promoción o público; el front llama a `/api/v1/ai/campaign-suggestion` y la respuesta se agrega al cuerpo del correo (puedes editarlo antes de guardar/enviar).

---

## Resumen rápido

| Área | Acciones en el panel |
|------|----------------------|
| **Auth** | Iniciar sesión, crear cuenta (modal). |
| **Excel** | Importar .xlsx (contactos), listar campañas. |
| **Campañas** | Crear campaña (asunto + cuerpo), seleccionar una, enviar. |
| **IA** | Sugerir texto para el correo (varios modelos). |

Documentación detallada del backend: **https://osdemsventas.site/api-docs/** (si está publicada).
