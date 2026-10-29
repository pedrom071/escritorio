# Escritorio de Pedro Maiz

Mi sitio personal, pensado como una habitación: abres la página y estás sentado frente a mi escritorio en Valparaíso. Cada objeto abre una parte de lo que hago.

| Objeto | Abre |
|---|---|
| El computador | Proyectos hechos con Claude |
| Los papeles | Columnas y cartas |
| El cuaderno | En qué ando |
| El mapa | Mi recorrido |
| La ventana | Observatorio Regional |
| El café | Contacto y redes |
| Los libros | Sobre mí |
| Los lápices | Herramientas |
| La lámpara | Prende y apaga la luz |

La luz sigue la hora real de Valparaíso, hay sonido ambiente (se apaga en la esquina inferior derecha) y en las esquinas hay indicadores mínimos: hora, luz, explorado, sonido y postura.

## Cómo está armado

```
index.html              estructura de la página
contenido.json          TODO el texto del sitio (lo que se actualiza)
assets/css/             diseño
assets/js/              comportamiento: cámara, luz, sonido, objetos
assets/fonts/           tipografías (licencia OFL)
img/                    fotos de la habitación (de pie y sentado, día y noche) e imagen para compartir
docs/                   guías: cómo actualizar, prompts usados
herramientas/           scripts con que se prepararon las fotos
extras/pasillo/         la entrada con puerta (guardada, no se usa hoy)
```

El diseño y el contenido están separados: para actualizar el sitio se edita solo `contenido.json`. Ver [docs/COMO-ACTUALIZAR.md](docs/COMO-ACTUALIZAR.md).

## Verlo en tu computador

El sitio carga `contenido.json`, así que necesita un servidor local (abrir el archivo con doble clic no basta):

```
python3 -m http.server 8000
```

y abrir http://localhost:8000

## Publicación

GitHub Pages publica la rama `main` automáticamente. Cada cambio que se sube queda en línea en uno o dos minutos.

---

Sitio construido con Claude.
