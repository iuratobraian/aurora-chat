# AGENT TRAINING: Operaciones de Convex y QA Real

## Propósito
Este documento debe leerse **antes de reclamar** cualquier tarea. Resume las soluciones aplicadas, errores prohibidos y pasos obligatorios que permiten mantener el sistema sincronizado con Convex en producción.

## Soluciones clave implementadas
- Se desplegaron todas las funciones nuevas a `notable-sandpiper-279` con `npx convex deploy --cmd "npm run build"`.
- Se estableció un modelo `api.*`/paginated queries para reemplazar el uso de `StorageService`, `window.convex` y caches locales como fuente de verdad.
- Se identificaron los puntos sensibles: `AdminView`, `PerfilView`, `MarketplaceView`, `ComunidadView`, `CreatorDashboard`, `SignalsView` y el backend de pagos/Instagram.
- Se agregó `TSK-072/073/074` en `TASK_BOARD.md` para guiar auditorías, checklist UI y un entrenamiento obligatorio.

## Errores prohibidos
No vuelvas a introducir ninguno de estos patrones sin justificación explícita:
1. **Caches locales como fuente principal** (`localStorage`, `StorageService`, `window.sessionStorage`). Solo deben usarse para fallback offline y siempre sincronizarse con Convex.
2. **`window.convex` o cliente global** en componentes: usar siempre los hooks `useQuery`, `useMutation`, `usePaginatedQuery` de `convex/react` y el cliente generado en `convex/_generated/api`.
3. **Faltas de validación de ownership** en queries/mutations de Convex (`ctx.auth` / `assertOwnershipOrAdmin`). Todas las mutaciones sensibles deben verificar `identity.subject` o roles (`requireAdmin`).
4. **Desincronización entre dev y prod**: cualquier función que se agregue en `convex` debe desplegarse con `npx convex deploy --cmd "npm run build"` antes de su uso.
5. **Comunicaciones cross-browser sin doble check**: una sola publicación o query que aparece en un navegador y no en otro indica inconsistencia en fuentes de datos. La auditoría en `TSK-072` debe identificar estas brechas.

## Checklist obligatorio antes de marcar `done`
1. Validar que la sección revisada (admin, perfil, marketplace o comunidad) no llame directamente a `StorageService` ni use caches locales como fuente principal sin una ruta de sincronización evidente.
2. Confirmar que la vista depende de una query de Convex y que la consulta paginada/compound no causa N+1.
3. Verificar logs de producción (sentry, `GlobalErrorHandler`) para detectar errores del tipo `Convex Q(...): Server Error`.
4. Ejecutar `npx convex deploy --cmd "npm run build"` cuando se agreguen o modifiquen funciones `convex`; si no se puede desplegar, documentar por qué y alertar al equipo.
5. Registrar los pasos de verificación en el checklist visual definido en `TSK-073`.

## Entrenamiento obligatorio
1. Antes de `claim` cualquier tarea, abrir y leer este documento y `FINAL_QA_PLAN.md`. Confirmar con una nota en `AGENT_LOG.md`.
2. Registrar el entrenamiento como un skill: cualquier agente nuevo debe añadir `skills_required: [AGENT_TRAINING.md]` en su anotación de `CURRENT_FOCUS.md` y actualizar su estado cuando lo complete.

## Consejos de despliegue
- Asegurarse de que `convex.json` apunta a `notable-sandpiper-279` para producción; usar `npx convex env --help` si hay dudas.
- Validar la base de datos con `convex db inspect` si hay dudas de índices/composite keys.
- Documentar los errores graves y pasos de fix en `AGENT_LOG.md` y `HEALTH_SNAPSHOT.md` para que no se pierda la trazabilidad.

## Lectura y habilidades
- Lectura obligatoria: `AGENT_TRAINING.md`, `FINAL_QA_PLAN.md`, `TSK-072` y `TSK-073` antes de empezar.
- Skills sugeridos: `convex-react`, `convex-best-practices`, `web-design-guidelines`.
