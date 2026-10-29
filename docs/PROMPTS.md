# Cómo se hicieron las fotos

Las imágenes se generaron con IA (Canva, a pedido de Claude) y luego se procesaron con los scripts de `herramientas/`. Sirven de base para quien quiera armar su propio escritorio.

## 1. La habitación, de pie (noche)
> Photorealistic interior photograph of a cozy home study at dusk, viewed straight on from a seated eye-level. A large solid walnut desk in the center with a warm brass desk lamp switched on casting a golden pool of light, an open silver laptop, a stack of printed papers and a newspaper column clipping, a leather notebook with a pencil, a ceramic coffee mug, a small stack of books, and a framed map on the wall behind. A leather office chair slightly pulled out at the left. Bookshelves with plants on the right, a window showing a deep blue evening sky with distant city lights of a hillside port city. Soft cinematic lighting, shallow depth of field, rich warm shadows, no people, no readable text, no logos.

## 2. La misma habitación, de día
Con la foto anterior como referencia:
> The exact same room, same camera angle, same composition and every object in the identical position, but in late-morning daylight: bright natural sunlight entering through the window, the window shows a colorful hillside port city by day under a clear blue sky with the sea, the desk lamp is switched off, soft warm daylight shadows across the desk, photorealistic, no people, no readable text.

## 3. Sentado frente al escritorio (noche y día)
> First-person point of view of a person seated in the leather chair at this exact same desk, eye level, looking straight ahead across the desk. The open silver laptop now faces the viewer directly in the center of the frame, its screen switched on but completely blank and dark with no content. […] Same room, same objects, same evening mood, photorealistic, cinematic warm lighting, no people, no hands, no readable text.

La versión de día se pidió con la vista sentada de noche y la habitación de día como referencias.

## 4. El pasillo (guardado en `extras/pasillo/`)
> Photorealistic interior photograph of a dim, quiet hallway at night, straight-on symmetric view, centered: a closed solid dark walnut wooden door with two recessed panels, a small blank polished brass name plate on the upper panel with no text, a brass lever handle on the right, warm golden lamplight leaking through the gap under the door onto a worn wooden plank floor. […] No people, no text, no signs, no logos.

## 5. Más mío (29 oct 2026)
Sobre la foto sentado de noche que ya estaba en el sitio, con cambios mínimos:
> Edit the reference photograph with minimal changes. Keep everything else exactly identical […] Make only these four changes, all photorealistic: (1) a pair of large black over-ear headphones hangs naturally from the arm of the brass desk lamp; (2) a small white plate with toasted bread spread with mashed green avocado and topped with soft scrambled eggs; (3) the window now shows the night view from Concón, Chile, looking south across the bay toward Reñaca and Viña del Mar; (4) the framed map becomes an old, realistic printed map of the central Chilean coast around Valparaíso, Viña del Mar and Concón, no readable text.

Las otras tres fotos (sentado de día, de pie de noche y de día) se pidieron con la foto antigua correspondiente y esta nueva como referencias. En la de pie de día, el tazón, el plato y los audífonos se trasplantaron desde la de noche para que no aparezcan dobles al cambiar la luz.

## Procesamiento
- `herramientas/alinear-dia-noche.py`: alinea la foto de día sobre la de noche para que el cambio de luz no salte.
- `herramientas/recortar-silla.py`: separa la silla del fondo para darle profundidad al moverse.
- `herramientas/recortar-puerta.py`: recorta la hoja de la puerta y deja el hueco en el pasillo.
- La pantalla del laptop se ubicó midiendo sus cuatro esquinas en la foto; el sitio proyecta ahí una interfaz real en perspectiva.
