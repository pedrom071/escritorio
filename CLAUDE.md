# Instrucciones para Claude en este repositorio

Este es el sitio personal de Pedro Maiz ("Escritorio de Pedro Maiz"), un sitio estático publicado con GitHub Pages desde `main`. Pedro escribe en español de Chile; responde en español.

## Estructura
- `contenido.json`: todo el texto. Las actualizaciones normales se hacen SOLO aquí.
- `assets/js/escritorio.js`: lee `contenido.json` (nombres de campo en español) y lo traduce a la estructura interna. Las zonas de cada objeto en las fotos (`WIDE`, `SEATED`, `SCREEN_QUAD`) están en el JS, en % de la foto de 1680×944.
- `assets/css/escritorio.css`, `index.html`: diseño. Cambiarlos solo si Pedro lo pide.
- `img/`: fotos de la habitación de pie (`fondo-*`, `silla-*`) y sentado (`pov-*`), día y noche, alineadas entre sí.
- `docs/COMO-ACTUALIZAR.md`: esquema del contenido.

## Al actualizar contenido
1. Edita `contenido.json` y valida que siga siendo JSON válido (`python3 -m json.tool contenido.json`).
2. Actualiza `actualizado` con la fecha del día (formato `dd · mm · aaaa`).
3. Prueba con `python3 -m http.server` y un navegador sin errores en consola.
4. Commit con mensaje claro en español, por ejemplo "Agrega columna del 28 oct sobre la EOP".

## Reglas
- Nunca publicar información privada de Pedro (dirección, sueldo, salud, inversiones, búsqueda laboral) ni de terceros.
- No inventar títulos, fechas ni enlaces: si falta un dato, pedirlo o dejar el pendiente entre corchetes.
- Mantener el tono: sobrio, cálido, frases cortas.
