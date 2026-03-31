# Feed Ranking Spec

## Objetivo

Definir surfaces, contratos y signals de ranking para cada superficie del producto (feed, signals, comments, discovery, academia) con fallback, weights documentados y contracts claros entre capas.

## Arquitectura actual

```
sources:
  posts:    Convex (api.posts.getPosts) + localStorage fallback
  signals:  Convex (signals:getActiveSignals) — actualmente disabled por env flag
  comments: embebidos en post.comentarios (unknown[])
  users:    localStorage + UserService
```

## Surface: Feed (ComunidadView)

### Objetivo
Mostrar contenido relevante y reciente que maximice retention y engagement.

### Señales (orden de prioridad)

| Signal | Weight | Source | Fallback |
|---|---|---|---|
| recency | 0.30 | post.ultimaInteraccion | mostrar por createdAt |
| engagement | 0.30 | likes + comentarios | 0 si no existen |
| provider_quality | 0.20 | authorFollowers, accuracy, esVerificado | 0 si no existen |
| relevance | 0.15 | userInterests vs par/tags | ignore si no hay intereses |
| type_boost | 0.05 | esAnuncio=true → top; esAiAgent=true → boost | sin boost |

### Contrato

```typescript
interface FeedSurface {
  items: RankedItem[];
  surface: 'feed';
  total: number;
  hasMore: boolean;
  signal: 'fresh' | 'cached' | 'fallback';
}
```

### Implementación actual

- `services/feed/feedRanker.ts` → `FeedRanker.rankPosts()` ✅
- `services/feed/feedRanker.ts` → `FeedRanker.getFeedWithSignals()` ✅ parcial (signals disabled)
- **Gap**: no pagination contract, no `hasMore`, no `signal` metadata

### Acciones pendientes

- [ ] Agregar `surface` metadata al output de ranking (fresh/cached/fallback)
- [ ] Agregar soporte de paginación con cursor o offset
- [ ] Endurecer `comentarios: unknown[]` → `comentarios: Comentario[]` en types.ts y mappings

---

## Surface: Signals

### Objetivo
Mostrar señales trade accionables priorizadas por calidad del proveedor y timing.

### Señales (orden de prioridad)

| Signal | Weight | Source | Fallback |
|---|---|---|---|
| provider_xp | 0.35 | signal.providerXp | 0 |
| win_rate | 0.30 | signal.winRate | 50 |
| recency | 0.20 | signal.createdAt | older → decay |
| direction_bonus | 0.10 | buy=+5, sell=+5 | neutral |
| user_relevance | 0.05 | userInterests vs signal.pair | ignore |

### Contrato

```typescript
interface SignalsSurface {
  items: FeedSignal[];
  surface: 'signals';
  total: number;
  minWinRate: number;
  signal: 'live' | 'disabled' | 'error';
  error?: string;
}
```

### Implementación actual

- `convex/signals.ts` → `getActiveSignals` ✅ (deshabilitado por env flag)
- `services/feed/feedRanker.ts` → `mergeSignalsIntoFeed()` ✅
- **Gap**: no Surface wrapper con metadata, no graceful error

### Acciones pendientes

- [ ] Crear `services/ranking/signalsRanker.ts` con Surface wrapper
- [ ] Implementar graceful fallback: si Convex falla → logs + empty array (no crash)
- [ ] Exponer flag `VITE_FEATURE_SIGNALS` para controlar disponibilidad

---

## Surface: Comments

### Objetivo
Ordenar comentarios dentro de un post por relevancia y engagement.

### Señales (orden de prioridad)

| Signal | Weight | Source | Fallback |
|---|---|---|---|
| likes | 0.40 | comment.likes.length | 0 |
| replies_count | 0.25 | comment.respuestas.length | 0 |
| recency | 0.20 | comment.tiempo | oldest first |
| author_quality | 0.15 | authorFollowers, accuracy | 0 |

### Contrato

```typescript
interface CommentsSurface {
  items: Comentario[];
  surface: 'comments';
  postId: string;
  total: number;
  sortedBy: 'engagement' | 'recency' | 'quality';
}
```

### Implementación actual

- **Gap**: no hay servicio dedicado para ranking de comentarios
- **Gap**: `comentarios: unknown[]` en Publicacion → tipo débil

### Acciones pendientes

- [ ] Crear `services/ranking/commentsRanker.ts`
- [ ] Tipar `comentarios: Comentario[]` en types.ts
- [ ] Soportar sort options: engagement (default), recency, quality

---

## Surface: Discovery

### Objetivo
Recomendar contenido, usuarios y comunidades que el usuario no sigue aún.

### Señales

| Signal | Weight | Source | Fallback |
|---|---|---|---|
| trending_score | 0.35 | likes + comments en ventana 24h | static score |
| mutual_followers | 0.25 | overlap con seguidos del usuario | 0 |
| category_match | 0.25 | favorito del usuario vs categoria | 0 |
| freshness | 0.15 | creado en ultimos 7 dias | older = 0 |

### Contrato

```typescript
interface DiscoverySurface {
  users: RankedUser[];
  communities: RankedCommunity[];
  posts: RankedItem[];
  surface: 'discovery';
  signal: 'computed' | 'empty';
}
```

### Implementación actual

- **Gap**: no hay servicio de discovery
- **Gap**: `DiscoverCommunities.tsx` existe pero sin ranking

### Acciones pendientes

- [ ] Crear `services/ranking/discoveryRanker.ts`
- [ ] Definir `RankedUser` y `RankedCommunity` types
- [ ] Integrar con UserService y comunidades existentes

---

## Surface: Academia

### Objetivo
Recomendar cursos/estrategias basándose en nivel del usuario, progreso y patrones de uso.

### Señales

| Signal | Weight | Source | Fallback |
|---|---|---|---|
| level_match | 0.35 | curso.nivel vs user.level | ignore |
| completion_gap | 0.30 | curso no completado + relevante | 0 |
| engagement_signal | 0.20 | cursos similares completados | 0 |
| recency_of_update | 0.15 | curso actualizado recientemente | 0 |

### Contrato

```typescript
interface AcademiaSurface {
  items: (Curso | Estrategia)[];
  surface: 'academia';
  userLevel: number;
  sortedBy: 'recommended' | 'level' | 'popular';
}
```

### Implementación actual

- **Gap**: no hay servicio de ranking para academia
- **Gap**: cursos se muestran en orden estático

### Acciones pendientes

- [ ] Crear `services/ranking/academiaRanker.ts`
- [ ] Definir `RankedLearningItem` type
- [ ] Integrar con DashboardView y curricula existentes

---

## RankingEngine (capa unificada)

Se propone una interfaz unificada para todas las surfaces:

```typescript
export interface RankingRequest<T> {
  items: T[];
  surface: 'feed' | 'signals' | 'comments' | 'discovery' | 'academia';
  userId?: string;
  userXp?: number;
  userInterests?: string[];
  sortBy?: 'score' | 'recency' | 'engagement';
  limit?: number;
  offset?: number;
}

export interface RankingResponse<T> {
  items: T[];
  surface: string;
  total: number;
  hasMore: boolean;
  signal: 'live' | 'cached' | 'fallback';
  error?: string;
}

export interface RankingEngine {
  rank: <T>(req: RankingRequest<T>) => RankingResponse<T>;
  surfaces: () => string[];
}
```

## Contrato transversal de datos

| Campo | Tipo | Validación |
|---|---|---|
| `likes` | `string[]` | siempre array, nunca null |
| `comentarios` | `Comentario[]` | tipado, no unknown[] |
| `ultimaInteraccion` | `number` | timestamp ms, required |
| `providerXp` | `number` | 0 si falta |
| `winRate` | `number` | 0-100, default 50 |

## Dependencias de la spec

| Archivo | Cambio requerido | Prioridad |
|---|---|---|
| `types.ts` | `Publicacion.comentarios: unknown[]` → `Comentario[]` | alta |
| `services/feed/feedRanker.ts` | agregar Surface metadata | media |
| `services/ranking/commentsRanker.ts` | crear archivo nuevo | media |
| `services/ranking/signalsRanker.ts` | crear archivo nuevo | media |
| `services/ranking/discoveryRanker.ts` | crear archivo nuevo | baja |
| `services/ranking/academiaRanker.ts` | crear archivo nuevo | baja |
| `views/ComunidadView.tsx` | consumir surface metadata | baja |
| `views/DiscoverCommunities.tsx` | consumir discovery ranker | baja |

## Aceptación

- [ ] Cada surface tiene `RankingResponse` wrapper con metadata de signal
- [ ] `comentarios` es `Comentario[]` en types.ts y mappings
- [ ] Signals tiene graceful fallback cuando Convex falla
- [ ] Comments tienen ranking por engagement, recency y quality
- [ ] Discovery surface definida con types `RankedUser` y `RankedCommunity`
- [ ] Academia surface definida con ranking por nivel y progreso
- [ ] `npm run lint` pasa sin errores
