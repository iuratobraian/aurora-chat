# 🛑 PLAN MAESTRO DE QA Y DEPLOY FINAL (ÓRDENES DEL TEAM LEAD) 🛑

> **PARA: Todos los agentes (OpenCode, Codex, Kimi)**
> **DE: Antigravity (Project Manager / Team Lead)**

El usuario nos ha dado indicaciones estrictas para finalizar el proyecto TradeShare 2.0. Yo como Project Manager he estructurado este plan. **Ustedes son los encargados de ejecutarlo.**

## NUEVAS REGLAS DE OPERACIÓN (OBLIGATORIAS)
1. **Regla de las 3 Tareas:** Cada vez que un agente busque trabajo, DEBE tomar **3 tareas** a la vez.
   - Poner **1** en `in_progress` y actuar sobre ella inmediatamente.
   - Poner las otras **2** en `claimed` (reservadas con su nombre).
2. **Doble Verificación (Doble Check):** Antes de marcar la tarea como `done`, el agente DEBE:
   - Revisar la tarea original.
   - Revisar todos los cambios implementados en el código.
   - Repetir este proceso de verificación **2 VECES** para asegurar que no se olvidó nada y que no hay bugs.
3. **Calidad Premium:** Mantengan el Glassmorphism, Modo Oscuro y las normativas de `AGENTS.md` estrictamente. Si algo se rompe, se arregla antes de avanzar.

## TAREAS A EJECUTAR (Ver `TASK_BOARD.md` -> FASE FINAL)

Hemos agregado 5 tareas críticas al `TASK_BOARD.md` bajo la "FASE FINAL":

*   **[QA-001] Auditoría General:** Repasar todas las tareas previas (Fase 0 a Sprint 4, integraciones de Admin). Su objetivo es cazar requerimientos a medias y asegurar que nada quedó por fuera. Apliquen arreglos directly.
*   **[QA-002] UI Polish:** Refinar toda la UI principal. Se exige diseño premium (Glassmorphism, Lottie, colores modernos). Si falta en algún componente (ej. ComunidadView, Settings), impleméntenlo.
*   **[QA-003] Server Sync:** Revisar scripts de build, actualizar dependencias en servidor, auditar Convex functions y Vercel config. Si encuentran discrepancias entre frontend y backend, arréglenlas.
*   **[QA-004] End-to-End Testing:** Simulen el flujo crítico del sistema. Registro -> Perfil -> Comunidad -> Suscripción (MercadoPago) -> Notificación (WhatsApp). Si algo falla en consola o network, corríjanlo inmediatamente.
*   **[PROTOCOL-01] Automatización de Protocolo:** Inserten comentarios o scripts locales si es necesario para recordar al sistema la doble verificación.

## INSTRUCCIONES DE INICIO
1. El primer agente que lea esto, vaya al `TASK_BOARD.md`, asigne **QA-001**, **QA-002** y **QA-003** a su nombre.
2. Ponga la primera en `in_progress`.
3. Atualice `CURRENT_FOCUS.md` indicando la tarea activa.
4. **¡EJECUTE!** No hagan preguntas, solo codifiquen y validen doblemente.

---
*Este documento es inmutable a menos que el Team Lead (Antigravity) indique lo contrario.*
