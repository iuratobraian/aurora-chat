# Source of Truth (SoT)

## Arquitectura de Datos

| Dato | Source of Truth | Cache Local | Notas |
|------|-----------------|-------------|-------|
| Posts | Convex | localStorage | Sync en background |
| Usuarios | Convex | localStorage | Session en storage |
| Comentarios | Convex | localStorage | Sync en background |
| Notificaciones | Convex | localStorage (TTL 30s) | Cache con expiración |
| Señales/Alertas | Convex | - | Solo lectura |
| Planes/Suscripciones | Convex | - | Solo lectura |
| Posts realtime | server.ts (WS) | - | Temporal, no persiste |
| Ads realtime | server.ts (WS) | - | Temporal, no persiste |
| Usuarios realtime | server.ts (WS) | - | Temporal, no persiste |

## Reglas

1. **Convex es la verdad** para datos persistentes
2. **localStorage es cache** con TTL de 24h para posts/users, 30s para notificaciones
3. **server.ts es temporal** para datos realtime via WebSocket (se pierde en restart)
4. **Nunca escribir a localStorage y asumir que es verdad**
5. **Nunca asumir que los datos del WebSocket persisten**

## Sync Strategy

- App boot → Leer de Convex → Guardar en localStorage
- Offline → Leer de localStorage
- Online → Background sync con Convex via `SyncManager`
- Conflictos → Convex gana siempre
- WebSocket → Actualizaciones realtime (UI update inmediata), no persiste

## Glosario

- `StorageService.getXxx()` → Cache local (úsalo para UI inmediata)
- `api.xxx.query()` → Convex (úsalo para datos frescos)
- `api.xxx.mutation()` → Convex (escribe datos persistentes)
- WebSocket events → Actualizaciones realtime (UI update inmediata)
- `SyncManager.addToQueue()` → Cola offline cuando Convex falla

## Servicios

| Servicio | SoT | Propósito |
|----------|-----|-----------|
| `services/storage/posts.ts` | Convex + localStorage | CRUD posts con sync offline |
| `services/storage/users.ts` | Convex + localStorage | CRUD usuarios con sync offline |
| `services/backup/syncService.ts` | Convex | Cola de sync offline |
| `server.ts` (WebSocket) | In-memory | Realtime broadcast (temporal) |

## Keys de localStorage

| Key | TTL | Propósito |
|-----|-----|-----------|
| `local_posts_db` | 24h | Cache de posts |
| `local_users_db` | 24h | Cache de usuarios |
| `local_session_user` | session | Usuario logueado (cache) |
| `pending_sync_queue` | until sync | Cola offline |
| `local_backup_*` | 30 días | Backups de operaciones |
| `notif_cache_*` | 30s | Cache de notificaciones |
| `theme` | persist | Preferencias UI |

## Datos Problemáticos (migrar)

| Key | Problema | Prioridad |
|-----|----------|-----------|
| `user_watchlist` | Debería estar en Convex | Media |
| `adminPlatformConfig` | Debería estar en Convex | Media |
| `coursePromoEnabled` | Debería estar en Convex | Media |

## Referencia

Ver `docs/DATA_SOT.md` para documentación detallada con inventarios completos.
