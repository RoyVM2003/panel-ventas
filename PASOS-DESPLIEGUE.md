# Pasos siguientes: tener el panel en vivo en osdemsventas.com

Objetivo: que cualquier persona entre a **https://osdemsventas.com** y vea el panel de promociones (login, Excel, campañas, IA). Las APIs siguen en **osdemsventas.site**.

---

## ✅ Ya tienes hecho

- Código del frontend en GitHub: **https://github.com/RoyVM2003/panel-ventas**
- DNS en Hostinger: **osdemsventas.com** (registro A) → **31.97.102.119**

---

## ¿Cómo saber si Dokploy está instalado en el servidor?

**Forma 1 — Desde el navegador (la más fácil)**  
- Abre en el navegador: **http://31.97.102.119:3000** (o prueba también el puerto **80** o **443** si no es 3000).  
- Si ves la **pantalla de login de Dokploy** (logo de Dokploy, “Sign in”, campos de email y contraseña), entonces **sí está instalado** y corriendo en ese servidor.  
- Si no carga nada o sale “no se puede acceder”, puede que Dokploy no esté instalado o que use otro puerto.

**Forma 2 — Desde el servidor por SSH**  
1. Conéctate al servidor por SSH (necesitas usuario y contraseña o llave del VPS):  
   ```bash
   ssh root@31.97.102.119
   ```  
   (o `ssh usuario@31.97.102.119` si usas otro usuario).  
2. Una vez dentro, ejecuta:  
   ```bash
   docker ps
   ```  
3. En la lista busca un contenedor cuyo **nombre o imagen** contenga **dokploy**.  
   - Si aparece una fila con “dokploy” (por ejemplo `dokploy` o `dokploy-api`), **Dokploy está instalado** y está corriendo en ese servidor.  
   - Si no ves nada con “dokploy”, puede que no esté instalado o que esté parado (prueba `docker ps -a` para ver también los contenedores parados).

**Resumen:** Si al abrir **http://31.97.102.119:3000** ves el login de Dokploy, ya sabes que está instalado. Si además entras por SSH y en `docker ps` ves un contenedor de Dokploy, lo confirmas al 100%.

---

## 🎯 Qué sigue (en orden)

1. ~~Entrar al servidor y comprobar Dokploy~~ → **Hecho: Dokploy ya se abre.**
2. **En Dokploy:** conectar GitHub (repo panel-ventas), crear proyecto tipo Dockerfile, desplegar.
3. **En Dokploy:** en ese proyecto, añadir el dominio **osdemsventas.com**.
4. **Probar:** abrir https://osdemsventas.com en el navegador.

Detalle de cada parte abajo.

---

## Qué necesitas tener antes

- **Repositorio en GitHub:** ya está → https://github.com/RoyVM2003/panel-ventas  
- **Un servidor (VPS)** donde esté instalado **Dokploy** (o donde vayas a instalarlo). Por ejemplo un VPS en DigitalOcean, Hetzner, OVH, etc., con una IP fija.  
- **El dominio osdemsventas.com** en tu poder (acceso al panel de DNS donde lo gestionas).

Si aún no tienes Dokploy en un servidor, el primer bloque de pasos es instalarlo. Si ya lo tienes, pasa al bloque “Desplegar el panel”.

---

## Parte A — Tener Dokploy en un servidor (si aún no lo tienes)

### A.1. Servidor (VPS)

1. Contrata un VPS (Ubuntu 22.04 recomendado) con al menos 1 GB RAM y anota la **IP pública** (ej: `31.97.102.119`).  
2. Conéctate por SSH:  
   `ssh root@TU_IP`  
   (o el usuario que uses).

### A.2. Instalar Dokploy en el servidor

1. En el servidor, ejecuta el instalador oficial de Dokploy (revisa la doc actual en https://dokploy.com o su GitHub por el comando exacto). Suele ser algo como:  
   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```  
   o seguir las instrucciones de instalación con Docker que indiquen.  
2. Cuando termine, Dokploy suele quedar escuchando en el puerto **3000** o en el **80**.  
3. Abre en el navegador: `http://TU_IP:3000` (o el puerto que indique la instalación).  
4. Crea un usuario administrador y guarda la contraseña.

Cuando puedas entrar al panel de Dokploy con esa IP, sigue con la Parte B.

---

## Parte B — Desplegar el panel en Dokploy

### B.1. Entrar a Dokploy

1. Abre en el navegador la URL de tu Dokploy (ej: `http://TU_IP:3000`).  
2. Inicia sesión con el usuario que creaste.

### B.2. Conectar GitHub (si Dokploy lo pide)

1. En Dokploy suele haber una sección de **“Source”**, **“Git”** o **“Repositories”**.  
2. Conecta tu cuenta de **GitHub** (OAuth o token) para que Dokploy pueda leer el repo **RoyVM2003/panel-ventas**.  
3. Si usas token: en GitHub → Settings → Developer settings → Personal access tokens, crea un token con permiso `repo` y pégalo donde Dokploy lo pida.

### B.3. Crear el proyecto del frontend

1. En Dokploy, pulsa **“New Project”** o **“Create Project”**.  
2. Nombre sugerido: **panel-ventas** o **osdemsventas-front**.  
3. Tipo de proyecto: elige **“Dockerfile”** o **“Docker”** (el repo tiene un `Dockerfile` que hace el build y sirve con nginx).  
4. Repositorio: selecciona **RoyVM2003/panel-ventas** (o pega la URL `https://github.com/RoyVM2003/panel-ventas`).  
5. Rama: **main**.  
6. Ruta del Dockerfile: deja por defecto **`Dockerfile`** (está en la raíz del repo).  
7. Guarda o “Create”.

### B.4. Desplegar (build + run)

1. En el proyecto que acabas de crear, pulsa **“Deploy”** o **“Build & Deploy”**.  
2. Dokploy clonará el repo, construirá la imagen con el Dockerfile (npm install + npm run build + nginx) y levantará el contenedor.  
3. Espera a que el estado pase a **“Running”** o **“Healthy”**.  
4. Dokploy suele asignar una URL interna o por puerto (ej: `http://TU_IP:PUERTO`). Anota esa URL para probar.

### B.5. Probar que el panel responde

1. Abre en el navegador la URL que te dio Dokploy (ej: `http://TU_IP:8080` o la que sea).  
2. Deberías ver la pantalla de **“Paso 0 · Iniciar sesión”** del panel.  
3. Si la ves, el despliegue está bien; lo siguiente es ponerle el dominio.

---

## Parte C — Poner el dominio osdemsventas.com

### C.1. Dominio en Dokploy

1. Dentro del proyecto **panel-ventas** en Dokploy, busca **“Domains”**, **“Settings”** o **“Environment”**.  
2. Añade el dominio: **osdemsventas.com** (y si quieres también **www.osdemsventas.com**).  
3. Guarda. Dokploy suele encargarse del proxy inverso y, si está configurado, de solicitar el certificado SSL (HTTPS).

### C.2. DNS del dominio

1. Entra al sitio donde gestionas el DNS de **osdemsventas.com** (donde compraste el dominio: GoDaddy, Namecheap, Cloudflare, etc.).  
2. Crea o edita registros para que el dominio apunte al servidor donde está Dokploy:  
   - Tipo **A**:  
     - Nombre/host: **@** (o vacío, significa “osdemsventas.com”).  
     - Valor/destino: **LA_IP_DE_TU_SERVIDOR** (ej: `31.97.102.119`).  
   - Si quieres **www**:  
     - Tipo **A** o **CNAME**:  
     - Nombre: **www**.  
     - Valor: la misma IP o el dominio que Dokploy te indique para www.  
3. Guarda los cambios. La propagación DNS puede tardar de 5 minutos a 24 horas.

### C.3. Comprobar que todo funciona

1. Cuando el DNS haya propagado, abre **https://osdemsventas.com** en el navegador.  
2. Deberías ver el panel (pantalla de login).  
3. Prueba “Crear cuenta” o “Iniciar sesión”; el front llamará a **osdemsventas.site** para las APIs. Si el backend está activo, login y el resto deberían funcionar.

---

## Resumen rápido

| Paso | Dónde | Qué haces |
|------|--------|-----------|
| A | Servidor | Tener un VPS e instalar Dokploy. |
| B.1–B.4 | Dokploy | Conectar GitHub, crear proyecto Dockerfile del repo panel-ventas, desplegar. |
| B.5 | Navegador | Probar por IP:puerto que se vea el login. |
| C.1 | Dokploy | Añadir dominio osdemsventas.com al proyecto. |
| C.2 | DNS | A @ apuntar a la IP del servidor. |
| C.3 | Navegador | Abrir https://osdemsventas.com y probar login/APIs. |

---

## Restablecer contraseña y 2FA de Dokploy

Si no recuerdas la contraseña de Dokploy o tienes 2FA activado y no puedes entrar, haz lo siguiente **desde el VPS** (por SSH).

### Restablecer contraseña

1. Conéctate al VPS por SSH (ej: `ssh root@31.97.102.119`).
2. Obtén el ID del contenedor de Dokploy:
   ```bash
   docker ps
   ```
   Busca el contenedor de Dokploy y anota su **CONTAINER ID** (o nombre).
3. Abre una shell dentro del contenedor y ejecuta el reset de contraseña:
   ```bash
   docker exec -it <container-id> bash -c "pnpm run reset-password"
   ```
   Sustituye `<container-id>` por el ID o nombre del contenedor (ej: `abc123def456`).
4. En la salida aparecerá una **contraseña aleatoria**. Cópiala.
5. Entra de nuevo al panel de Dokploy (ej: `http://31.97.102.119:3000`) e inicia sesión con tu **email** y esa **contraseña nueva**. Luego cámbiala desde la configuración de Dokploy si quieres.

### Desactivar 2FA

Si no puedes entrar porque pide código 2FA y no lo tienes:

1. Conéctate al VPS por SSH.
2. Lista contenedores: `docker ps` y anota el ID del contenedor de Dokploy.
3. Ejecuta:
   ```bash
   docker exec -it <container-id> bash -c "pnpm run reset-2fa"
   ```
4. Vuelve a la pantalla de login de Dokploy; podrás entrar **sin** código 2FA (solo email y contraseña).

---

Si en algún paso te pide opciones concretas (puerto, variables de entorno, etc.), dime en cuál estás y lo detallamos.
