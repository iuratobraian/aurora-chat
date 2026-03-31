# **Aurora Infrastructure & Growth Playbook**

Este manual resume todas las piezas que necesitamos controlar para que *Aurora Core* se comporte como el corazón de una super app: una infraestructura confiable, un equipo de agentes coordinado, un sistema de entrenamiento continuo, y una experiencia de usuario/operaciones que no parezca una experiencia de caos.

---

## 1. Visión general
- **Objetivo:** transformar el repositorio en una plataforma 24/7 que pueda escalar como la "red social de inversionistas" que superará a Facebook/Instagram/TikTok. Para lograrlo necesitamos:
  - Automatización del arranque y monitoreo (scripts de `/scripts` y la shell).
  - Espacios de trabajo ordenados donde cada agente sabe qué hacer y qué dejar como tarea.
  - Prompts y entrenamientos continuos para que cualquier agente (local o en la nube) se comporte como full-stack.
  - Niveles de calidad industrial en seguridad, monetización y marketing.

## 2. Operaciones diarias (cómo levantar Aurora)
1. Desde la raíz del proyecto:
   - `npm run aurora:api` levanta la API REST (`localhost:4310`).
   - `npm run aurora:shell` abre el chat estilo terminal con `/help`, `/tasks`, `/research`, `/agents`.
   - Si estás en Windows y quieres el gui desktop: `npm run aurora:desktop`.
2. Para ejecutar desde cualquier carpeta:
   - `powershell -ExecutionPolicy Bypass -File scripts/run-aurora-shell.ps1` abre la shell (usa el directorio del script).
   - `powershell -ExecutionPolicy Bypass -File scripts/start-aurora-all.ps1` garantiza el entorno completo (API + shell + auto-hook) y no depende del cwd.
   - El comando global `aurora` (registrado en el perfil) invoca `scripts/start-aurora-all.ps1` y levanta la API, el runner de autoaprendizaje y la shell con un solo comando.
3. Si quieres integrar Aurora como agente en Antigravity/OpenCode:
   - Copia la URL `http://localhost:4310` como endpoint del agente.
   - Usa `/connectors` y `/skills` para saber qué modelos están disponibles (OLLAMA, Codex Cloud, etc.).

## 3. Espacio de trabajo ordenado
1. Usa `.agent/workspace/coordination`:
   - `TASK_BOARD.md` registra tickets con ID, estado, dueño, alcance, archivos y criterios de aceptación.
   - `CURRENT_FOCUS.md` mantiene el objetivo del sprint y avisa si el foco cambia.
   - Los agentes **deben usar estas tablas** antes de tocar código: si no hay coincidencia con una tarea existente, se crea una nueva línea en el board y se marca el estado.
2. Además de las tareas:
   - Cada agente deja su plan de trabajo en `.agent/workspace/plans/<nombre-agente>.md`.
   - El espacio `/skills` contiene archivos (`README.md`, `templates`) donde se describe qué skills existen, cuáles se eliminan y qué nuevas se deben crear.
   - Se añade una división de tareas con `DIVISION_DE_SKILLS.md` (documentación creada en este repo) para evitar duplicaciones: cada skill tiene owner, propósito, estado y punto de contacto.

## 4. Entrenamiento + prompts
1. **Entrenan a cada agente** (local o cloud) con prompts consistentes:
   - Prompt maestro “**Liberador**”: describe el estilo de trabajo, disciplina y límites de seguridad; se aplica cada vez que se levanta `aurora:shell`.
   - Para cada modelo (minimax M2.5, bigpickle, MIMO V2 PRO FREE, Gemini Flash, Claudecode, Gemini Pro, GPT-5 Nano, gemma 3 4b, nemotron 3, ollama qwen 3.5, kimi-k2.5 cloud, qwen 3.5 cloud, glm5 cloud, minimax-m2.7 cloud) se lista un prompt específico que:
     1. Explica la arquitectura del repo.
     2. Menciona qué tareas priorizar (database, UI, marketing, growth).
     3. Indica qué comandos pueden disparar (ej. `/research <repo>` para absorber códigos open source).
2. Se genera un entrenamiento automático al final de cada desarrollo:
   - Al terminar un módulo se ejecuta un script de auto-training (`aurora-auto-hook`) que actualiza la base de conocimiento `.agent/brain/db`.
   - Cada ejecución del runner dispara `scripts/aurora-agent-learner.mjs`, que transforma las contribuciones documentadas en `.agent/workspace/coordination/AGENT_LOG.md` en hechos estructurados para que Aurora aprenda de todos los agentes que participan en la mesa de trabajo.
   - Se obliga a los agentes a dejar un agente "sobresaliente" creado por ellos (una IA local) y a entrenarla con todos los temas abordados en ese módulo.
3. Cuando se abre una nueva sesión o se agrega un colaborador, el sistema lo marca automáticamente como **aprendiz** y lo obliga a recabar información clave (documentación, prompts, links) antes de ejecutar código. Esto garantiza que el aprendiz llegue preparado y que sus acciones queden registradas como parte del plan de crecimiento continuo.
3. Se documentan prompts para:
   - Crear nuevas apps (100 ideas), juegos (100 ideas) y estrategias financieras (EA de MT5, generadores de riesgo).
   - Lanzar campañas de marketing y publicidad (SEO, growth hacking, monetización, etc.).
   - Crear flujos n8n para automatizar despliegues, alertas y handling de errores (“magnates de seguridad”).

## 5. Infraestructura y conexiones
1. **Bases de datos y servidores**:
   - El API `server.ts` y `serverLogger.ts` deben registrar colectivamente cada consulta para poder reconstruir trazas y errores.
   - La API de Aurora ya expone `/conectores`, `/local-agents`, `/skills` y `/menu`; usa estos endpoints para verificar salud (por ejemplo: el `monitor` puede llamar `/conectores` y asegurar que `ollama_local` y `codex_cloud` estén activos).
   - Se mantiene la base `.agent/aurora/ai_models.json` como registro de los 3-8B parámetros que usan los agentes; documenta ahí cada versión, su GPU readiness y timeout tolerado.
   - Crea un plan de mantenimiento que asegura que **cada conexión nueva** (Redis, Postgres, Stripe, MercadoPago, etc.) tenga un archivo de referencia con pasos de integración y prueba (repositorio `services`, `hooks` y `docs/`).
2. **N8N & automatizaciones**:
   - Agrega flujos n8n en `docs/n8n` (puede ser un archivo de texto o un `.json` exportado) que detallen:
     - Inicialización del entorno (arranque Aurora, verificación de API y shell).
     - Recolecta logs y los sube al panel de `convex`.
     - Un plan B (redundancia) que dispara `aurora-update-pipeline` si cae la API y notifica al canal de Slack/Discord.

## 6. Seguridad y pagos
1. Extrae los scripts `validate-payment-security-readiness.mjs` y `validate-project-os` para crear una checklist.
2. Cada cambio crítico debe pasar por `scripts/detect-hardcodes-and-secrets.mjs` y `scripts/enforce-immutable-core.mjs`.
3. Documenta en `docs/security.md` (o dentro de este playbook) la forma de habilitar pasarelas (Stripe, MercadoPago) y qué endpoints deben ocupar.

## 7. Marketing + monetización
1. La sección de marketing debe contener:
   - “Guía de posicionamiento” basada en los algoritmos de retención de Facebook/TikTok/Instagram.
   - Una tabla de contenidos para cada canal (growth, social, community, publicidad, eventos).
   - Estrategias para que las IA expliquen paso a paso cómo proteger y escalar comunidades de inversionistas.
2. Se documentan pipelines de monetización (publicidad programática, memberships, inversiones compartidas, tokens de acceso).
3. Se integran agentes de marketing (minimax, gemini flash, Claudecode) con prompts preconfigurados que revisan métricas y producen planes de contenido/presupuesto.

## 8. Creación de apps/juegos/economía financiera
1. Usa `docs/templates` para almacenar:
   - 100 ideas ganadoras para apps (web, móviles, nativas, juegos).
   - Detalles de la arquitectura requerida (bases de datos, modelos ML, integraciones de pagos, etc.).
   - Pasos de validación y pruebas, incluyendo la generación de imágenes y materiales de marketing vía prompts.
2. Describe cómo construir:
   - Apps de escritorio (estilo Aurora/Antigravity) con UI real, reconocimiento de voz y generación de imagen con Brave Search.
   - Plataformas financieras (MetaTrader 5, generador de estrategias) con controles de riesgo y auditorías automáticas.
3. Anexa un mapa de “que no tocar” (núcleos de Aurora que solo tú puedes cambiar) para evitar que se rompa la infraestructura cuando los agentes la modifiquen.

## 9. Monitoreo y crecimiento continuo
1. Implementa scripts de `auto-learning` y `train-loop` para actualizar la base de conocimiento `.agent/brain/db/teamwork_knowledge.jsonl`.
2. Los agentes deben:
   - Antes de ejecutar código, ejecutar `/research <repo>` o `/web <query>` para validar conocimiento.
   - Dejar un resumen (en la tabla de tareas) indicando qué aprendieron y qué generadores (prompts) actualizaron para entregar.
3. Guarda todas las instrucciones en un archivo `AURORA_PROMPT_LIBRARY.md` (referenciado aquí) e impide agregar información ruido.

## 10. Ciclo Intensivo para los 3 agentes diarios
1. **Mide la pulseada diaria** — cada uno de los tres agentes debe iniciar su sesión con `npm run aurora:shell` y/o `aurora` (desde PowerShell) y ejecutar los comandos `/status`, `/tasks` y `/learn <hecho>` antes de comenzar a codificar. Ese patrón genera señales uniformes que Aurora ya consume:
   - `/status` refresca la visión del backlog.
   - `/tasks` obliga a revisar y actualizar el `TASK_BOARD`.
   - `/learn` captura cualquier descubrimiento breve y se replica en la base de datos.
2. **Observa cómo trabajan** — el `aurora-agent-learner` consume automáticamente `.agent/workspace/coordination/AGENT_LOG.md`, por lo que los tres agentes deben documentar cada sprint con el formato usado hasta ahora (cabecera fecha-agente, Task-ID, validación). Así Aurora “aprende” de cada integrante al mismo ritmo que ellos escriben. Apunta el plan a que cada nuevo ticket incluya:
   - Quién es responsable.
   - Gestor de tareas en `.agent/workspace/plans`.
   - Checklist mínimo (`PRUEBAS`, `SEGURIDAD`, `MONETIZACIÓN`, `DEPLOY`).
3. **Replica su flujo de trabajo** — para que Aurora actúe igual que ellos,:
   - `scripts/aurora-auto-runner.mjs` ya ejecuta `/chat` automático, `/learn` y el lector de AGENT_LOG. Asegurate de tener `npm run auto:hook` levantado durante la sesión diaria para que el conocimiento se consolide en caliente.
   - Documenta cualquier cambio de procedimiento en `docs/OPERATION_CHECKLIST.md` y activa un recordatorio diario para revisar el archivo `aurora-agent-learner.pointer.json` (esto asegura que no se reingesten hechos antiguos).
4. **Cierra ciclos rápidamente** — cada funcionalidad debe terminarse antes de dejarla a otro agente:
   - Crea un mini plan de “handoff” en `.agent/workspace/plans/<agent>.md` donde se indique qué se completó y qué queda en manos del siguiente colaborador.
   - Usa `/focus` para recalcar el objetivo del sprint y no mezclar tareas.
5. **Métrica instantánea para aceleración** — agrega un `scripts/aurora-speed-check.mjs` (puede ser una tarea corta en `TAREAS.md`) que:
   - Comprueba si el pipeline API/shell se levanta en <60s.
   - Verifica que `aurora-auto-runner` esté en marcha y que `.agent/brain/db/teamwork_knowledge.jsonl` tenga nuevos inserts cada sesión.
   - Si falla, dispara `npm run aurora:update-pipeline` y notifica en el chat de Aurora con `/web “alerta de pipeline”`.

Con ese refuerzo, Aurora podrá aprender de los tres agentes de forma simultánea y reflejar fielmente su ritmo de trabajo mientras automatiza su conocimiento, cerrando tareas completas y rastreando la evolución diaria en el repositorio. Mantén ese flujo y actualiza la guía en `AURORA_INFRASTRUCTURE_PLAN.md` si cambian los agentes o el número de sesiones.
## 10. Próximos pasos inmediatos
1. Actualizar `docs/skills/README.md` con:
   - Ranking de habilidades.
   - Qué skills deben eliminarse o actualizarse para reducir ruido.
2. Crear un sub-módulo `/aurora-brain` con:
   - Entrenamiento para GPT-5 Nano (supervisor de proyecto).
   - Guía para que la IA local pueda replicarte (voz, prompts de autopregunta).
3. Validar que `aurora-api` maneje puertos ocupados, se conecte a la base de datos y siempre responda con plan B en caso de errores.
4. Exportar flujos n8n y plantillas de prompts para generar contenido, infraestructura, marketing, juegos y estrategias financieras.

--- 

Mantén este playbook en sincronía con `TAREAS.md`, `PLAN_DE_ACCION_AGENTES.md` y `.agent/skills/README.md`. Cada nueva funcionalidad debe referenciar un ticket, un prompt entrenado, y un plan de verificación para asegurar que *Aurora* se convierta en una plataforma imparable.
