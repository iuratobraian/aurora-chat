# Aurora Windows Native App System

## Objetivo

Enseñar cómo construir una app nativa de Windows para Aurora Core, estilo workstation operativa, sin forzar nada sobre el repo y manteniendo el trabajo guiado sobre repos de desarrollo.

## Principio

Aurora para Windows no debe reemplazar el repositorio.
Debe ser una consola nativa para:

- ver estado
- coordinar agentes
- lanzar acciones seguras
- consultar conocimiento
- navegar backlog
- abrir creaciones y playbooks

## Opciones tecnológicas recomendadas

### Opción 1: Tauri + frontend web

Ideal para:

- app liviana
- bajo consumo
- integración con Windows
- empaquetado serio

### Opción 2: Electron + frontend web

Ideal para:

- velocidad de desarrollo
- tooling abundante
- integración madura

### Opción 3: .NET + WinUI / WPF

Ideal para:

- experiencia nativa fuerte en Windows
- integración profunda con sistema
- equipos centrados en ecosistema Microsoft

## Recomendación

Para Aurora Core:

- primero `Tauri` si se prioriza liviandad y panel operativo
- `Electron` si se prioriza ecosistema y rapidez
- `WinUI/WPF` si el objetivo es una consola Windows institucional

## Arquitectura sugerida

### Capa 1: Aurora API

La app nativa no debe reimplementar lógica.
Debe conectarse a:

- `aurora-api`
- estado del repo
- catálogo de creaciones
- tasks
- skills

### Capa 2: Shell nativo

Pantallas:

- dashboard
- tasks
- focus
- blockers
- knowledge
- creations
- operations

### Capa 3: Workflows

- ver tareas abiertas
- filtrar por scope
- abrir playbooks
- sugerir siguiente lote
- disparar validaciones locales

### Capa 4: Safe Actions

- nunca modificar el repo sin pasar por Project OS
- nunca inventar trabajo no reclamado
- nunca ejecutar destructive actions por defecto

## Menú nativo ideal

1. estado general
2. tareas críticas
3. catálogo de creaciones
4. skills canónicas
5. Aurora knowledge db
6. validaciones
7. roadmap always-on
8. futuras apps

## Módulos recomendados

### Dashboard

- salud del sistema
- total tasks
- open tasks
- critical tasks
- focus actual

### Tasks

- tabla de tasks
- filtros por estado
- filtros por scope
- acceso a archivos

### Knowledge

- heurísticas
- anti-patrones
- referencias
- noise blacklist

### Creations

- webs
- apps
- juegos
- IA systems
- future lab

### Operations

- correr `validate:ops`
- correr `aurora:status`
- ver release blockers
- ver scorecard

## Plan de implementación

### Fase 1

- app shell
- conexión con `aurora-api`
- dashboard
- tasks
- creations

### Fase 2

- knowledge browser
- launchers de validación
- shortcuts a archivos clave

### Fase 3

- panel de lotes multiagente
- health checks
- vista de aprendizaje

## Regla final

La app nativa de Aurora debe ser una mesa de control profesional, no una capa decorativa.
