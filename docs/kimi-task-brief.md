# Kimi Task Brief

Este script convierte a Kimi en el consultor remoto que cada agente escucha antes de tocar código.

## ¿Qué hace?

- Lee el `TASK_BOARD.md` (o recibe `--task <ID>`).
- Recopila contexto del task, plan propuesto y los últimos fragmentos de `AGENT_LOG.md`.
- Llama a `askKimiWithContext` para obtener un briefing con riesgos, pasos críticos y validaciones.
- Guarda la respuesta en `.agent/kimi/briefs/<TASK-ID>-<timestamp>.md` y la registra como una entrada de log identificada como *KIMI-BRIEF*.
- Imprime la respuesta y la ruta del archivo para que el agente la comparta con el equipo.

## Uso manual

```bash
node scripts/kimi-task-brief.mjs --task PROY-123 --plan "Revisar el flujo de pagos y validar hooks antes de lanzar la actualización"
```

También acepta `--plan="..."` para describir qué piensas hacer y `--auto` para dejar claro que el sistema lo invocó.

## Automatización

- `scripts/aurora-inicio.mjs` ejecuta el brief automático (`--auto --task <id>`) si hay una tarea pendiente o foco, para que siempre haya una respuesta de Kimi antes de reclamar o editar.
- El resultado se muestra bajo el bloque `--- Kimi brief ---` en la salida del protocolo INICIO.
- Las respuestas se loguean como:

  ```
  ### 2026-03-27 - KIMI-BRIEF TASK-ID
  - Plan: ...
  - Brief: .agent/kimi/briefs/TASK-ID-...
  - Fuente: Kimi (moonshotai/kimi-k2.5)
  - Validación: recibido
  ```

## ¿Qué necesita?

- `NVIDIA_API_KEY` (usa `.env.nvidia`)
- Conexión a Internet para que Kimi pueda responder.
- Si el prompt falla aparece una advertencia en consola y el log no se modifica; el equipo debe revisar la razón antes de continuar.
