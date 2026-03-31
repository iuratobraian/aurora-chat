# Aurora Chat Stitch Brief

## Objetivo
Diseñar el chat local de Aurora como una interfaz desktop-first premium, moderna y útil para trabajo fullstack real sobre el repo.

## Dirección Visual
- Dark mode técnico, no gamer.
- Accent principal: teal/aqua Aurora.
- Sensación: terminal premium + copiloto de ingeniería + control room.
- Referencia de base en Stitch: proyecto `2984742732221673460`.

## Layout
- Sidebar izquierda con identidad, salud del runtime, tareas abiertas y accesos rápidos.
- Columna principal con hero liviano, alertas, conversación y composer fijo.
- Paneles de contexto en formato cards, sin saturar el chat.
- Mobile: stack vertical con prioridad absoluta al composer y mensajes.

## Componentes Clave
- Loading screen con `AURORA` grande y estado de preparación.
- Estado del runtime visible sin entrar al chat.
- Tarjetas de brief operativo y métricas rápidas.
- Starter prompts para tareas típicas de programación.
- Mensajes de Aurora diferenciados de usuario con jerarquía clara.
- Composer amplio, cómodo y listo para prompts largos.

## Utilidad Operativa
- La UI debe sentirse lista para pedir:
  - implementar features
  - revisar bugs
  - priorizar board
  - consultar runtime y health
- Los quick actions deben verse como herramientas reales, no como botones decorativos.

## Restricciones
- Mantener compatibilidad con los IDs y endpoints actuales del runtime.
- No depender de frameworks nuevos.
- Desktop y mobile deben seguir funcionando con HTML/CSS/JS actual.

## Prompt Recomendado para Stitch
```text
Design a desktop-first dark AI engineering chat called Aurora.
It should feel like a premium local coding copilot and runtime control room.

Use a refined technical dark theme with teal/aqua accents, soft glass panels,
calm gradients, large Aurora branding, and clear information hierarchy.

Include:
- left sidebar with identity, runtime health, quick metrics and actions
- main conversation area with welcome hero, alert strip, message list and sticky composer
- starter prompts for coding tasks
- cards for session brief and task context
- loading state with large AURORA headline and readiness feedback

Avoid generic SaaS purple gradients.
Make it modern, useful, breathable and serious enough for fullstack work.
Prefer subtle depth, layered surfaces and strong typography.
Desktop first, but responsive for mobile.
```
