# NOW

## Estado: P0 COMPLETADO ✅

Todas las tareas P0 del backlog original están en estado `done` o `blocked`.

| ID | Tarea | Estado | Owner |
|---|---|---|---|
| INF-001 | Runtime oficial /api y /webhooks | ✅ done | OPENCODE |
| INF-002 | Consolidar config y eliminar hardcodes | ✅ done | OPENCODE |
| INF-003 | Source of truth y auditar localStorage | ✅ done | OPENCODE |
| INF-004 | Endurecer pagos y webhooks | ✅ done (doc) | OPENCODE |
| INF-005 | Auth server-side en endpoints | ✅ done (doc) | OPENCODE |
| TP-001 | Unificar marca | ✅ done | AGENT-2 |
| TP-002 | Simplificar navegación | ✅ done | AGENT-2 |
| TP-003 | Rediseñar home | ✅ done | AGENT-2 |
| TP-004 | Reordenar ComunidadView | ✅ done | AGENT-2 |
| TP-005 | Rehacer pricing | ✅ done | BIG-PICKLE |
| TP-006 | SEO base y metadata | ✅ done | OPENCODE |
| TP-007 | Design system operativo | ✅ done | OPENCODE |

## Roadmap 30D — Progreso

| Semana | Meta | Estado |
|---|---|---|
| 1 | Marca, navegación, cleanup, task board, auditorías | ✅ COMPLETADA |
| 2 | Home, community, CTAs, reducir ruido | ✅ COMPLETADA |
| 3 | Pricing, onboarding, trust signals, SEO | ✅ COMPLETADA |
| 4 | Refactor shell, smoke tests, release checklist | ✅ COMPLETADA |

## P1 — Siguiente ola (documentado, falta implementación)

| ID | Tarea | Prioridad | Bloqueado por |
|---|---|---|---|
| INF-006 | Observabilidad + QA | ✅ done | — |
| SEC-001 | Arquitectura hardening | ✅ done (doc) | — |
| SEC-002 | Env vars separadas | ✅ done | — |
| SEC-003 | Blindar pasarelas (idempotencia) | Alta | Deploy del Express server |
| SEC-004 | Auth server-side real | Alta | Deploy del Express server |
| PAY-001 | Runtime backend pagos | Alta | Railway/Render deploy |
| PAY-002 | Firma + idempotencia + event log | Alta | PAY-001 |
| AI-001 | Endurecer relay IA | Alta | — |

## P2 — Features y growth

| ID | Tarea | Scope |
|---|---|---|
| AI-002 | Sala IA admin completa | ai_platform |
| AI-003 | IA en flujos comunidad | ai_platform |
| CORE-001A a CORE-006A | Product core features | product_core |
| GROW-001 a GROW-005 | Growth engine | growth |
| MKT-001 a MKT-008 | Marketing completo | marketing |
| SALE-001 a SALE-003 | Sales system | community_growth |

## Regla

No meter nuevas P0 hasta que el Express server esté deployed y los webhooks funcionen.
