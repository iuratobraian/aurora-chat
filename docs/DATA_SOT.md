# Data Source of Truth

## Regla principal

**Convex es la fuente de verdad para todos los datos de usuario.** localStorage solo se usa para cache con TTL, preferencias de UI y cola de sync offline.

## Clasificación de datos

### CRÍTICO — Source of truth: Convex

| Dato | Convex table | localStorage key(s) | Problema actual | Acción |
|---|---|---|---|---|
| Posts | `posts` | `pending_sync_queue`, `local_backup_*` | syncService mantiene cola offline — correcto | Mantener. Cola offline es feature, no bug. |
| Usuarios | `users` | `local_session_user`, cache en services | userService.cacheUsuario es cache local — aceptable | Mantener como cache read-through. |
| Comentarios | `comments` | ninguno directo | OK | Sin acción. |
| Notificaciones | `notifications` | `notif_cache_*` | Cache con TTL 30s — correcto | Mantener. Cache es funcional. |
| Señales/Alertas | `signals` | ninguno directo | OK | Sin acción. |
| Planes/Suscripciones | `subscriptions` | ninguno directo | OK | Sin acción. |

### CACHE — localStorage con TTL (aceptable)

| Key | TTL | Usado en | Propósito | Estado |
|---|---|---|---|---|
| `notif_cache_lastFetch_{userId}` | 30s | utils/notificationCache.ts | Evitar refetch excesivo | ✅ OK |
| `notif_cache_unread_{userId}` | 30s | utils/notificationCache.ts | Contador unread cacheado | ✅ OK |
| `notif_cache_items_{userId}` | 30s | utils/notificationCache.ts | Lista notificaciones cacheada | ✅ OK |
| `pending_sync_queue` | Sin TTL | services/backup/syncService.ts | Cola de operaciones offline | ✅ OK (feature offline) |
| `local_backup_*` | Sin TTL | services/backup/syncService.ts | Backup de datos antes de operación | ✅ OK (safety net) |
| `briefing_cache_{userId}` | 1h | lib/ai/briefing.ts | Cache de briefing matutino | ✅ OK |

### UI PREFERENCIAS — localStorage sin server (aceptable)

| Key | Usado en | Propósito | Estado |
|---|---|---|---|
| `theme` | App.tsx, Navigation.tsx, AppearancePanel.tsx | Tema dark/light | ✅ OK |
| `appearance_settings` | components/AppearancePanel.tsx | Configuración visual | ✅ OK |
| `onboarding_completed` | App.tsx, services/storage.ts | Flag de onboarding visto | ✅ OK |
| `pwa-install-dismissed` | components/mobile/MobileInstallPrompt.tsx | No mostrar prompt de instalación | ✅ OK |
| `pwa-install-dismissed-date` | components/mobile/MobileInstallPrompt.tsx | Fecha de dismiss | ✅ OK |
| `last_stable_tab` | App.tsx | Última pestaña activa para recovery | ✅ OK |
| `daily_poll_{asset}` | views/comunidad/DailyPollWidget.tsx | Respuesta a poll diaria | ⚠️ Bajo — debería ser por usuario |
| `user_watchlist` | components/Ticker.tsx | Watchlist del usuario | ⚠️ Medio — debería estar en Convex |

### PROBLEMÁTICO — Debería migrar a Convex

| Key | Usado en | Problema | Prioridad | Acción sugerida |
|---|---|---|---|---|
| `local_session` | utils/sessionManager.ts | Token de auth en localStorage (XSS vulnerable) | Alta | Migrar a httpOnly cookie o JWT en memoria |
| `local_session_user` | utils/sessionManager.ts, services/storage/auth.ts | Datos de usuario logueado en localStorage | Alta | Solo cache, source of truth debe ser Convex |
| `adminPlatformConfig` | components/admin/SettingsPanel.tsx | Config de admin en localStorage, no server | Media | Migrar a tabla `platform_config` en Convex |
| `coursePromoEnabled` | components/admin/SettingsPanel.tsx | Config de promoción en localStorage | Media | Migrar a `platform_config` en Convex |
| `coursePromoInterval` | components/admin/SettingsPanel.tsx | Intervalo de promo en localStorage | Media | Migrar a `platform_config` en Convex |
| `coursePromoClosed` | App.tsx | Estado de promo cerrada por usuario | Baja | Aceptar como UI state local |
| `coursePromoLastShown` | App.tsx | Última vez que se mostró promo | Baja | Aceptar como UI state local |

### LEGACY — Eliminar o reemplazar

| Key | Usado en | Problema | Acción |
|---|---|---|---|
| `dev_admin_session` | services/auth/authService.ts | Session de dev hardcodeada | Eliminar en producción |

## Servicios y su relación con Convex

### services/storage.ts
- **Función actual**: Wrapper gigante sobre localStorage + Convex + mocks
- **Problema**: Mezcla datos reales (Convex) con mocks (EVENTOS_MOCK, NOTICIAS_MOCK) y localStorage
- **Source of truth**: Confusa — a veces Convex, a veces localStorage, a veces mocks
- **Acción**: No migrar ahora (scope grande). Documentar para INF-001 o refactor futuro.

### services/backup/syncService.ts
- **Función**: Cola de sync offline + backups
- **Source of truth**: Convex (cola es temporal)
- **Estado**: ✅ Correctamente diseñado

### services/posts/postService.ts
- **Función**: CRUD de posts con fallback localStorage
- **Source of truth**: Convex
- **Estado**: ✅ Correcto (cache local aceptable)

### services/users/userService.ts
- **Función**: CRUD de usuarios con fallback localStorage
- **Source of truth**: Convex
- **Estado**: ✅ Correcto (cache local aceptable)

### services/notifications/notificationService.ts
- **Función**: Notificaciones con cache
- **Source of truth**: Convex
- **Estado**: ✅ Correcto (cache con TTL)

## Plan de acción por prioridad

### P0 — Hacer ahora
1. **Ninguna**. Los datos críticos ya usan Convex como source of truth.

### P1 — Próximo sprint
1. Migrar `adminPlatformConfig`, `coursePromoEnabled`, `coursePromoInterval` a tabla `platform_config` en Convex.
2. Migrar `user_watchlist` a Convex (tabla `watchlists` o campo en `users`).

### P2 — Cuando haya tiempo
1. Evaluar migración de auth de localStorage a httpOnly cookies.
2. Eliminar `dev_admin_session` de producción.
3. Refactorizar `services/storage.ts` para separar concerns.

## Reglas para nuevos datos

1. **Si el dato pertenece al usuario** → Convex como source of truth, localStorage como cache opcional con TTL.
2. **Si el dato es preferencia de UI** → localStorage está bien, no necesita Convex.
3. **Si el dato es temporal/offline** → localStorage con cola de sync a Convex.
4. **Nunca** usar localStorage como source of truth para datos que otros usuarios deben ver.
5. **Nunca** almacenar tokens de auth en localStorage si se puede evitar.
