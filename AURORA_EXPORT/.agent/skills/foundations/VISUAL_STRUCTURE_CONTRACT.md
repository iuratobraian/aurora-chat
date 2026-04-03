# Visual Structure Contract

## Objetivo

Establecer un lenguaje repetible para crear nuevas secciones y pantallas con consistencia visual.

## Estructura base de cualquier sección nueva

Toda sección nueva debe tener:

1. `SectionShell`
   - contenedor principal
   - ancho máximo definido
   - padding horizontal consistente
   - spacing vertical consistente

2. `SectionHeader`
   - eyebrow opcional
   - título
   - soporte o descripción breve
   - acción principal opcional

3. `SectionBody`
   - layout principal
   - una jerarquía dominante
   - side content solo si agrega contexto real

4. `SectionFooter`
   - CTA secundaria o navegación contextual
   - nunca ruido decorativo

## Jerarquía visual obligatoria

- una acción principal por viewport
- un título dominante
- máximo dos niveles de información prominente
- elementos secundarios no pueden competir con el CTA principal

## Densidad

- evitar apilar más de 3 bloques pesados sin separación clara
- evitar más de 2 colores de énfasis por sección
- evitar más de 1 patrón animado dominante por viewport

## Responsive

Toda estructura nueva debe definir:

- comportamiento mobile
- comportamiento tablet
- comportamiento desktop
- safe areas si aplica

## Estados visuales obligatorios

Toda sección funcional debe tener:

- loading
- empty state
- error state
- success state si aplica

## Componentes base que deben reutilizarse o emularse

- shell
- header
- card
- metric card
- action button
- badge
- empty state
- loading skeleton
- modal shell

## Regla de diseño

Si una nueva sección necesita romper este contrato, debe quedar documentado por qué.
