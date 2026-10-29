# Cómo actualizar el sitio

Todo el texto vive en `contenido.json`. El diseño no se toca.

## La forma más simple: pedírselo a Claude

En una conversación con Claude que tenga conectado este repositorio, basta con decir cosas como:

- "Agrega mi columna de hoy en El Mercurio: título X, enlace Y."
- "Cambia el estado de VOLTA a activo."
- "En 'Ahora' pon que estoy preparando LID-ERA-TE."
- "Agrega un proyecto nuevo: …"

Claude edita `contenido.json`, lo prueba y sube el cambio. En uno o dos minutos está en línea.

## Editarlo a mano (desde github.com, incluso desde el celular)

1. Abre `contenido.json` en GitHub y toca el lápiz (Edit).
2. Cambia el texto entre comillas. No borres comas ni llaves.
3. Abajo, "Commit changes". Listo.

## Qué es cada parte de `contenido.json`

| Campo | Qué controla |
|---|---|
| `actualizado` | La fecha "Actualizado …" de la esquina inferior izquierda |
| `ahora` | La línea "Ahora" (en qué estás en este momento) |
| `objetos` | El nombre y la etiqueta de cada objeto del escritorio |
| `proyectos` | Las tarjetas del computador |
| `secciones` | Lo que se abre al tocar cada objeto |
| `redes` | Enlaces de LinkedIn, Instagram y Beacons del pie de página |

### Un proyecto

```json
{ "id": "volta", "iniciales": "Vo", "color": "#E3B262", "nombre": "VOLTA",
  "area": "Emprendimiento", "estado": "desarrollo",
  "descripcion": "Comprar, remodelar y vender departamentos…",
  "ultimaVersion": "Marzo 2027" }
```

`estado` puede ser: `idea`, `desarrollo`, `validacion` o `activo`.

### Una entrada de una sección (columna, línea del cuaderno, hito del recorrido…)

```json
{ "destacado": true,
  "dato": "El Mercurio de Valparaíso · 28 oct 2026",
  "titulo": "Título de la columna",
  "texto": "Resumen corto.",
  "enlace": "https://…",
  "textoEnlace": "Leer en el medio →" }
```

Todos los campos son opcionales salvo `titulo`. `destacado` la marca como principal. `copiar` agrega un botón para copiar un texto (por ejemplo, el correo).

### Estilos de sección

`estilo` define cómo se ve lo que se abre: `papel`, `cuaderno`, `mapa`, `vidrio`, `tarjeta` o `pantalla`. `inclinacion` gira levemente la hoja (por ejemplo `".5deg"`).

## Antes de publicar algo

- Nada privado: ni dirección, ni teléfono personal, ni datos de terceros sin su permiso.
- Los textos entre corchetes `[así]` son pendientes; reemplázalos o bórralos.
