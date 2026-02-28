# Lista de APIs y qué se puede hacer

Base del backend: **`https://osdemsventas.site`** (configurable con `VITE_API_BASE` y `VITE_API_AI_BASE` en `.env`).

---

## 1. Autenticación

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/auth/register` | **Crear cuenta.** Body: `FormData` con `email`, `password`, `first_name`, `last_name`. No requiere token. |
| POST | `/api/v1/auth/login` | **Iniciar sesión.** Body: `{ "email", "password" }`. Devuelve un token (Bearer) que el front guarda y envía en el resto de peticiones. Si la cuenta no está verificada, devuelve error y el front muestra el formulario para ingresar el código. |
| POST | `/api/v1/auth/verify` | **Verificar cuenta.** Body: `{ "email", "code" }` (código de 6 dígitos enviado por correo). Si el backend usa otra ruta, configurar `VITE_AUTH_VERIFY_PATH` en .env. |
| POST | `/api/v1/auth/forgot-password` | **Solicitar restablecimiento de contraseña.** Envía un correo con enlace a `/reset-password?token=...`. |
| POST | `/api/v1/auth/reset-password` | **Restablecer contraseña.** El front envía `{ "token", "password" }` usando el token recibido por correo. |
| GET | `/api/v1/auth/verify-reset-token/{token}` | Verificar si un token de restablecimiento es válido o ha expirado. |

**En el panel:** Login con correo/contraseña; botón "Crear cuenta" abre el modal de registro.

---

## 2. Excel / Base de datos

| Método | Endpoint | Qué hace |
|--------|----------|----------|
| POST | `/api/v1/excel/import` | **Importar contactos.** Body: `FormData` con campo `file` (archivo .xlsx). Requiere token. Las columnas deben coincidir con lo que documente el backend (ej. email, nombre). Respuesta puede incluir `insertedCount`, `duplicateCount`, `internalDuplicateCount`, `errorCount`. Si 0 insertados y hay duplicados, esos contactos ya están en la BD y se pueden usar para enviar en el Paso 3. |
| GET | `/api/v1/excel/campaigns` | **Listar campañas** con paginación. Query: `page`, `limit`, `search`. Requiere token. |

**En el panel:** Paso 1 — subir Excel e importar; el desplegable de campañas se rellena con esta lista.

---

## 3. Campañas (CRUD y envío)

Todas requieren token. Documentación completa: **https://osdemsventas.site/api-docs**

| Método | Endpoint | Qué hace | Uso en el panel |
|--------|----------|----------|------------------|
| POST | `/api/v1/excel/campaigns` | **Crear campaña.** Body: `{ "name", "subject", "body" }`. | Paso 2 — botón "Crear campaña" cuando no hay ninguna seleccionada. |
| GET | `/api/v1/excel/campaigns` | **Listar campañas** (paginación, búsqueda). | Rellena el desplegable "Usar campaña existente". |
| GET | `/api/v1/excel/campaigns/{id}` | **Obtener una campaña** por ID. | Al elegir una campaña en el desplegable, se cargan asunto y cuerpo. |
| PUT | `/api/v1/excel/campaigns/{id}` | **Actualizar campaña.** Body: `{ "name", "subject", "body" }`. | Paso 2 — botón "Actualizar campaña" cuando hay una seleccionada. |
| DELETE | `/api/v1/excel/campaigns/{id}` | **Eliminar campaña.** | Paso 2 — botón "Eliminar campaña" (solo si hay campaña seleccionada). |
| POST | `/api/v1/campaigns/send` | **Enviar campaña.** Body: `{ "subject", "message" }`. Envía a todos los contactos activos (importados en Paso 1). | Paso 3 — botón "Enviar campaña". |

**Nota:** Si al crear/actualizar campaña el backend devuelve "Email, nombre y compañía son campos requeridos", el backend puede estar esperando otro contrato o contactos importados primero. Revisar la documentación del backend (api-docs).

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
