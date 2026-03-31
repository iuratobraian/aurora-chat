# Guía para integrar Aurora como agente en Antigravity/OpenCode

1. **Registrar la función global**
   - Ejecutá `powershell -ExecutionPolicy Bypass -File scripts/register-aurora-function.ps1` una sola vez por máquina para que `Start-Aurora` exista en todos los PowerShell del equipo.

2. **Arrancar Aurora completo**
   - Llamá `Start-Aurora` o `powershell -ExecutionPolicy Bypass -File scripts/start-aurora-all.ps1`. Eso:
     - asegura el puerto 4310 (`aurora-ensure-port`)
     - permite seleccionar el repo activo (`aurora-choose-repo`)
     - levanta la API (`npm run aurora:api`)
     - abre la shell terminal simple (`npm run aurora:shell`)

3. **Comandos principales**
   - No necesitás `/`; ingresá prompts naturales. Algunos comandos especiales son:
     - `/research owner/repo` → busca en GitHub y guarda insights.
     - `/learn <hecho>` → guarda aprendizajes en `teamwork_knowledge`.
     - `/web <consulta>` → dispara búsqueda activa (requiere TAVILY/SERPAPI/BRAVE).
     - `/codex <prompt>` y `/ollama <prompt>` → ejecutan agentes locales.
     - `/agent add <nombre> <tipo>` → incorpora otro agente externo (ej. minimax M2.5).
     - “Ejecutar actualizaciones” (botón) o `curl /updates` → pipeline completo (`ops:activity`, `auto:runner`, `train:loop`).

4. **Automatización continua**
   - El hook (`npm run auto:hook`) chequea `activity_log` cada minuto y ejecuta automáticamente el runner (`npm run auto:runner`), de modo que Aurora detecta comandos faltantes sin que lo solicites.
   - Programá `npm run ops:activity` + `npm run auto:runner` + `npm run train:loop` como parte del ciclo semanal de Antigravity/OpenCode para que siempre esté aprendiendo.

5. **Verificación rápida**
   - `npm run team:check` → muestra conectores activos y número de registros en `jsonl`.
   - `npm run models:status` → lista modelos GPU-ready (DeepSeek, Qwen, Codex, etc.).
   - `npm run gpu:check` → revisa drivers y VRAM antes de tareas pesadas.

6. **Integrar con otros agentes**
   - En cada terminal podés correr `npm run aurora:shell` y abrir otra para `OpenCode`, `minimax`, etc.; todos comparten la misma base knowledge en `.agent/brain/db/*`.
   - Para sumar Aurora como agente remoto dentro de Antigravity/OpenCode, referenciá esta guía, los planes (`PARAMETER_SCALE_PLAN.md`, `OSS_AI_GROWTH_PLAN.md`) y asegurá que el equipo corra `Start-Aurora` + `auto:hook`.
   - Si Aurora va a trabajar sobre esta app como agente programador o creador de apps, primero corré `npm run aurora:seed-app-learning` y tomá como protocolo base `.agent/skills/AURORA_ANTIGRAVITY_PROGRAMMER_MODE.md`.

7. **Mantener el conocimiento**
   - Cada comando/log entra en `activity_log.jsonl`. Usa `scripts/aurora-auto-learn.mjs` y `/autolearn` para convertir esos registros en hechos curados.  
   - El botón “Ejecutar actualizaciones” o `npm run updates` dispara `scripts/aurora-update-pipeline.mjs` que ejecuta checks + entrenamiento y loguea todo en `.agent/aurora/model-train.log`.
   - `npm run aurora:seed-app-learning` agrega contexto curado sobre la app de comunidades, sus superficies prioritarias y el modo Antigravity.

Con esta guía, Aurora se comporta como cualquier agente de código abierto en tu workspace Antigravity/OpenCode, con auto-entrenamiento, múltiples terminales y plan de crecimiento documentado.
