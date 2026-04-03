# Aurora Session Memory

## Propósito

Dar contexto corto y reutilizable para nuevas sesiones donde Aurora, Antigravity o el panel admin sean parte del trabajo.

Leer esto cuando:
- el usuario pida continuar el crecimiento de Aurora
- el usuario mencione Antigravity/OpenCode
- el usuario quiera usar Aurora como agente programador
- el trabajo toque `Aurora Support` en admin
- haya que decidir si Aurora ya puede entender peticiones o escribir código

## Estado real de Aurora

Aurora ya no es solo documentación. Tiene runtime local, shell, API, aprendizaje estructurado, reasoning local, scorecard, prueba visible de aprendizaje y panel admin de soporte.

Capas ya operativas:
- arranque por comando `aurora`
- modo Antigravity por defecto
- shell con quick actions y contexto del repo
- API local de Aurora en `http://localhost:4310`
- knowledge curado en `.agent/brain/db/teamwork_knowledge.jsonl`
- reasoning operativo local sin depender de APIs pagas
- plan pre-tarea, cierre con handoff y quick checks
- catálogo ejecutable de funciones de agente
- prueba visible de aprendizaje real

## Comandos clave

- `aurora`
- `npm run aurora:scorecard`
- `npm run aurora:seed-app-learning`
- `npm run aurora:seed-community-loops`
- `npm run aurora:seed-app-tech`
- `npm run aurora:antigravity-sync`
- `npm run aurora:functions`
- `npm run aurora:knowledge -- engineering`

En shell de Aurora:
- `/reason <tarea>`
- `/plan <tarea>`
- `/close-task <TASK-ID> <notas>`
- `/handoff <TASK-ID>`
- `/antigravity-sync`
- `/functions`
- `/fn <nombre> <input>`

## Antigravity

Aurora fue preparada para operar dentro de Antigravity/OpenCode como:
- agente programador de esta app
- creadora de apps en incubadores separados
- agente con aprendizaje continuo del repo

Documentos base:
- `.agent/skills/AURORA_AGENT_GUIDE.md`
- `.agent/skills/AURORA_ANTIGRAVITY_PROGRAMMER_MODE.md`

Regla práctica:
- primero entender board, focus, stack y superficies
- luego hacer cambios pequeños, verificables y con handoff
- no mezclar ideas nuevas de producto con fixes del core

## Lo que Aurora sabe de la app

Stack sembrado:
- React 19 + Vite 6 + Tailwind 4
- Convex como source of truth principal
- Express 5 + WebSocket server en `server.ts`
- Vitest para tests
- i18next, Sentry y pasarelas Stripe/MercadoPago/Zenobank

Superficies de producto sembradas:
- dashboard/home
- comunidad/feed
- onboarding
- creators/monetización
- perfil/reputación
- admin

Archivos/manifiestos base:
- `.agent/aurora/product-surfaces.json`
- `.agent/aurora/app-stack.json`
- `.agent/workspace/plans/AURORA_APP_ENGINEERING_ENABLEMENT.md`

## Aurora Support en admin

Aurora Support es un agente interno de soporte.
No es la IA pública del producto.

Sirve para:
- auditar superficies de la webapp
- detectar fallas o mejoras
- dejar hallazgos como `pending`
- reportar esos hallazgos a la mesa de trabajo
- sugerir owner, patch y plan de mejora

Rutas/archivos clave:
- `components/admin/AuroraSupportSection.tsx`
- `views/AdminView.tsx`
- `components/admin/AdminDashboard.tsx`
- `server.ts`

Flujo actual:
1. audita una superficie
2. guarda hallazgo en panel
3. intenta reportarlo al workspace
4. crea task `AUS-*` y handoff
5. deja owner sugerido, patch sugerido y plan de mejora

Corrección importante:
- el botón `Lanzar auditoría` ya no usa el relay interno protegido
- ahora usa `POST /api/admin/aurora/chat`
- el frontend parsea respuestas de forma segura y ya no rompe por `Unexpected end of JSON input`

## Cómo saber si Aurora está aprendiendo

Señales reales:
- `npm run aurora:scorecard`
- `aurora-learning-proof`
- crecimiento de registros estructurados y validados
- reutilización de conocimiento por dominio/tarea
- hallazgos y runs acumulados en Aurora Support

Aurora aprende de:
- task board
- current focus
- agent log
- activity logs
- seeds de producto, loops y stack técnico

## Nivel actual de capacidad

Aurora ya está usable para este repo.

Puede:
- entender tareas operativas normales
- clasificar scope y riesgo
- proponer siguiente paso y validación
- recuperar contexto técnico de la app
- ayudar a programar junto al equipo

Todavía no debe:
- autoeditar producción sin revisión
- autoaplicar patches amplios
- actuar como si fuera 100% confiable

Política actual:
- detectar
- reportar
- priorizar
- sugerir
- aprender
- solo después pensar en auto-fixes acotados y reversibles

## Límites reales

- la investigación OSS en vivo depende de red/proveedores
- varias funciones son útiles pero aún heurísticas
- la confiabilidad total depende de más tareas reales cerradas con buena curación

## Regla de continuidad

Si una nueva sesión toca Aurora:
1. leer esta memoria
2. leer `AURORA_AGENT_GUIDE.md`
3. leer `AURORA_ANTIGRAVITY_PROGRAMMER_MODE.md` si el frente es código
4. revisar `TASK_BOARD.md`, `CURRENT_FOCUS.md` y `AGENT_LOG.md`
5. validar si hace falta resembrar:
   - `aurora:seed-app-learning`
   - `aurora:seed-community-loops`
   - `aurora:seed-app-tech`

## Resultado esperado

Una nueva conversación no arranca ciega.
Arranca sabiendo qué es Aurora, cómo se usa, qué ya existe, qué puede hacer y cuáles son sus límites actuales.
