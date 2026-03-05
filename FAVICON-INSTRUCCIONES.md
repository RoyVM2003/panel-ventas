# Cómo hacer que se actualice el icono (favicon) en Google y en el navegador

El texto del resultado de búsqueda ya se actualizó, pero el **icono** (favicon) tarda más porque Google y los navegadores lo guardan en caché. Sigue estos pasos en orden.

---

## 1. Comprobar que el HTML está bien (ya está hecho)

En **`panel-promociones/index.html`** deben estar estas líneas en el `<head>`:

```html
<link rel="icon" type="image/png" href="https://osdemsdigital.com/wp-content/uploads/2026/03/loogo-app.png?v=2" />
<link rel="apple-touch-icon" href="https://osdemsdigital.com/wp-content/uploads/2026/03/loogo-app.png?v=2" />
```

La URL del icono debe ser exactamente:  
**https://osdemsdigital.com/wp-content/uploads/2026/03/loogo-app.png**  
(el `?v=2` sirve para forzar que se cargue la versión nueva y no la antigua en caché).

---

## 2. Subir los cambios y desplegar

- Guarda el `index.html` con los enlaces al favicon (y el `?v=2`).
- Sube los cambios a tu servidor / hosting donde está **osdemsventas.com** (Git, FTP, panel del hosting, etc.).
- Asegúrate de que la web en vivo está sirviendo ese `index.html` (por ejemplo, que la raíz del sitio use la carpeta/build de `panel-promociones`).

---

## 3. Comprobar que el icono se ve en el navegador

- Abre **https://osdemsventas.com** en una ventana de **incógnito** (Ctrl+Shift+N en Chrome).
- Mira la pestaña: debería aparecer el icono de **loogo-app.png**.
- Si no se ve, pega en la barra de direcciones:  
  `https://osdemsdigital.com/wp-content/uploads/2026/03/loogo-app.png`  
  y confirma que la imagen carga bien (que la URL no da 404).

Si en incógnito ya ves el icono correcto en la pestaña, el sitio está bien configurado; lo que falta es que Google actualice.

---

## 4. Hacer que Google actualice el icono en los resultados de búsqueda

Google puede tardar **días o semanas** en cambiar el favicon. Puedes acelerarlo así:

1. Entra en **Google Search Console**:  
   https://search.google.com/search-console  
   (con la cuenta que tenga la propiedad del sitio **osdemsventas.com**).

2. Elige la propiedad **osdemsventas.com** (no otra URL ni subdominio).

3. En el menú izquierdo: **“Inspección de URLs”** (o “URL Inspection”).

4. Escribe en la barra:  
   `https://osdemsventas.com`  
   y pulsa Enter.

5. Si Google dice “La URL no está en Google”, usa **“Solicitar indexación”**.  
   Si ya está indexada, usa **“Solicitar indexación”** igualmente (así Google vuelve a pasar y puede actualizar título, descripción y favicon).

6. Espera: la actualización del **favicon** suele tardar más que la del texto. Pueden ser varios días. No hay forma de forzar solo el icono; se actualiza cuando Google reindexa la página.

---

## 5. Si más adelante cambias otra vez el icono

- Cambia la versión en la URL del favicon en `index.html`, por ejemplo:  
  `loogo-app.png?v=3`  
  Así navegadores y CDN cargarán el nuevo icono en lugar del que tenían en caché.

---

## Resumen rápido

| Paso | Qué hacer |
|------|-----------|
| 1 | Favicon en el HTML apuntando a `loogo-app.png` (con `?v=2`) — ya está. |
| 2 | Subir y desplegar los cambios en osdemsventas.com. |
| 3 | Probar en ventana de incógnito que el icono se ve en la pestaña. |
| 4 | En Search Console, inspeccionar `https://osdemsventas.com` y pulsar “Solicitar indexación”. |
| 5 | Esperar unos días a que Google actualice el icono en los resultados. |

Si el texto ya cambió y el icono no, es **caché de Google**: el código está bien, solo hay que desplegar, pedir indexación y esperar.
