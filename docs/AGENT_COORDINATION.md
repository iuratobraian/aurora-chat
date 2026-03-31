AGENT COORDINATION
==================

Propósito
--------
Este documento anuncia los roles que he asumido y el plan inicial para coordinar el trabajo entre agentes. Sirve como guía viva: los agentes deben actualizar `tasks/state.json` cuando una tarea cambia de estado.

Roles asumidos
---------------
- Coordinador de equipo: orquesto tareas, prioridades y dependencias.
- Implementador de cambios: realizo y pruebo cambios en el código cuando corresponda.
- Code reviewer: reviso diffs, propongo mejoras y aplico checklist de PR.
- Ingeniero de CI: configuro y mantengo pipelines de integración continua.
- Probador automatizado: ejecuto suites de test y reviso fallos reportados por CI/localmente.

Plan inicial (tareas principales)
---------------------------------
1. Anunciar roles y crear esta documentación (hecho).
2. Revisar y confirmar convenciones de coordinación (naming, ramas, etiquetado) — pendiente.
3. Dividir espacio de trabajo creando carpetas de soporte (`agents/`, `ci/`, `tasks/`, `docs/`) — estructura inicial creada.
4. Configurar CI básico (lint, build, test, notificaciones) — archivo de workflow agregado.
5. Ejecutar pruebas/correcciones detectadas por CI — pendiente.
6. Definir plantilla de PR y checklist de revisión — archivo de plantilla agregado.

Convenciones recomendadas
-------------------------
- Branches: `feature/<ticket>-short-desc`, `fix/<ticket>-short-desc`, `chore/<desc>`.
- Commits: prefijo tipo: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- PRs: usar plantilla en `.github/PULL_REQUEST_TEMPLATE.md` y asignar reviewers.
- Labels sugeridos: `area/ci`, `area/frontend`, `area/backend`, `priority/high`, `status/in-progress`, `status/done`.

Cómo actualizar el estado de una tarea
-------------------------------------
- Editar `tasks/state.json` y actualizar el campo `status` (pending, in_progress, completed, cancelled).
- Añadir una entrada en el PR que refiera la tarea y el cambio de estado.

Contacto del coordinador
------------------------
Cuando necesiten que ejecute una acción (crear branch, aplicar un patch, ejecutar CI local), indíquenmelo aquí en el repo o por el canal del equipo; aplicaré las convenciones y documentaré cada paso.
