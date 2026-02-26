# Panel de promociones (emails + IA)

Frontend en **React** (Vite) que consume las APIs de autenticación, Excel, campañas e IA. Pensado para desplegar en **Dokploy** cuando el backend esté en producción.

## Requisitos

- Node.js 18+
- npm o pnpm

## Uso local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## APIs

Las peticiones van por defecto a **`https://osdemsventas.site`** (backend de las APIs). Para usar otro dominio, crea un `.env` en la raíz:

```env
VITE_API_BASE=https://osdemsventas.site
VITE_API_AI_BASE=https://osdemsventas.site
```

Luego ejecuta de nuevo `npm run dev` o `npm run build`.

## Resumen: qué es este proyecto

- **Este repo = solo el frontend** (React). Lo que el usuario ve: login, panel, Excel, campañas, IA.
- **Las APIs** están en **osdemsventas.site** (backend). El front ya está configurado para consumirlas desde ahí.
- **Para tener el panel en tu dominio osdemsventas.com** hay que desplegar este frontend en un servidor; **Dokploy** sirve para eso.

---

## Despliegue en Dokploy (osdemsventas.com)

Objetivo: que **osdemsventas.com** muestre este panel (el front) y el front siga llamando a las APIs en **osdemsventas.site**.

### 1. Build del frontend

En tu máquina, dentro del proyecto:

```bash
npm install
npm run build
```

Se genera la carpeta **`dist/`** con los archivos estáticos (HTML, JS, CSS).

### 2. Subir y desplegar en Dokploy

**Opción A — Sitio estático en Dokploy**  
Si Dokploy tiene tipo de proyecto "Static Site" o "Static":

- Crea un proyecto nuevo → elige **Static** (o similar).
- Conecta el repo de este frontend (Git) o sube la carpeta **`dist/`**.
- Si pide "build": puedes dejar vacío o un comando que solo copie; lo importante es que se sirva el contenido de **`dist/`** (index.html y la carpeta assets).

**Opción B — Contenedor con nginx (recomendado)**  
En el repo hay un **`Dockerfile`** que hace el build y sirve los archivos con nginx:

- En Dokploy: crea un proyecto tipo **Dockerfile** (o "Docker"), apunta al repo de este frontend y desplega. Dokploy construye la imagen y la ejecuta.
- No hace falta ejecutar `npm run build` a mano: el Dockerfile lo hace dentro del contenedor.

### 3. Dominio osdemsventas.com

En tu proveedor de DNS (donde está registrado osdemsventas.com):

- Crea un **registro A** (o **CNAME**) que apunte **osdemsventas.com** a la **IP (o hostname) del servidor donde corre Dokploy**.

Si Dokploy está en un VPS (por ejemplo 31.97.102.119):

- **A** → `osdemsventas.com` → `31.97.102.119`.

Dokploy suele permitir asignar dominios por proyecto: en la configuración del proyecto del frontend, pon **osdemsventas.com** como dominio; Dokploy se encargará del proxy y, si está configurado, del SSL (HTTPS).

### 4. Resumen de dominios

| Dónde        | Dominio            | Qué es                          |
|-------------|--------------------|----------------------------------|
| Frontend    | **osdemsventas.com**  | Este panel (React) desplegado en Dokploy |
| Backend/APIs| **osdemsventas.site** | Servidor de las APIs (auth, Excel, campañas, IA) |

El front ya está configurado para usar **osdemsventas.site** como base de las APIs; no hace falta cambiar nada más para que osdemsventas.com consuma esas APIs.

---

## Build local (sin Dokploy)

```bash
npm run build
```

La salida queda en **`dist/`**. Puedes servirla con cualquier servidor estático o contenedor (nginx, etc.).

## Estructura del proyecto

```
src/
  config/       # API_BASE, env
  context/      # AuthContext (token, login, logout)
  services/     # api.js, authService, excelService, campaignService, aiService
  components/   # Message, FormGroup, Panel, HeaderBar, ExcelImport, CampaignForm, AIAssistant, SendCampaign
  pages/        # LoginPage, PanelPage
  App.jsx
  main.jsx
  index.css
```

Flujo: **Login** → **Panel** (Excel, Campaña, IA, Enviar).
