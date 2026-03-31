# Ranking Architecture - TradePortal

## Overview

Sistema de ranking unificado que sirve contenido personalizado para cada superficie del producto, balanceando relevancia, calidad y engagement.

## Surfaces del Producto

| Surface | Objetivo | Señales Principales | Fallback |
|---------|----------|---------------------|----------|
| `feed` | Engagement diario | likes, comments, shares, tiempo | Populares recentes |
| `signals` | Trading signals | winRate, xp, intereses | Top winRate |
| `comments` | Conversación | likes, threads, calidad | Recentes |
| `discovery` | Nuevos contenidos | follows, categorías | Tendencias |
| `academia` | Aprendizaje | progreso, completitud | Paths populares |
| `creators` | Descubrimiento | followers, engagement | XP score |

## Interfaces Comunes

### SurfaceResult (base)

```typescript
interface SurfaceResult<T> {
  items: T[];
  surface: SurfaceId;
  total: number;
  signal: 'live' | 'disabled' | 'error';
  error?: string;
}
```

### RankingConfig

```typescript
interface RankingConfig {
  limit: number;
  offset?: number;
  userId?: string;
  signals: UserSignal[];
  interests: string[];
  xp: number;
}
```

### SignalType

```typescript
type SignalType =
  | 'like_given'
  | 'comment_given'
  | 'post_created'
  | 'post_viewed'
  | 'post_shared'
  | 'follow_given'
  | 'signal_viewed'
  | 'signal_tapped'
  | 'search_query'
  | 'watchlist_added'
  | 'scroll_depth'
  | 'time_on_page'
  | 'cta_clicked';
```

## Ranking Services

### 1. FeedRanker (`services/feed/feedRanker.ts`)

**Objetivo**: Feed principal personalizado.

**Señales**:
- Engagement del post (likes, comments, shares)
- Recencia
- Intereses del usuario
- Trust del autor
- Popularidad global

**Contrato**:
```typescript
interface FeedItem {
  id: string;
  type: 'post' | 'signal' | 'ad';
  score: number;
  boosted: boolean;
  reason: string;
}

interface FeedSurface extends SurfaceResult<FeedItem> {}
```

**Fallback**: Posts más recientes si < 5 items.

### 2. SignalsRanker (`services/ranking/signalsRanker.ts`)

**Objetivo**: Trading signals relevantes.

**Señales**:
- Win rate del provider
- XP del provider
- Intereses del usuario (pairs)
- Recencia

**Contrato**:
```typescript
interface RankedSignal {
  item: SignalItem;
  score: number;
  boosted: boolean;
  reason: string;
}

interface SignalsSurface extends SurfaceResult<RankedSignal> {}
```

**Config por defecto**:
```typescript
{
  minWinRate: 50,
  maxSignals: 20,
  userXp: 0,
  userInterests: [],
  includeClosed: false
}
```

### 3. CommentsRanker (`services/ranking/commentsRanker.ts`)

**Objetivo**: Comentarios útiles y de calidad.

**Señales**:
- Likes en comentarios
- Thread depth
- Trust del comentarista
- Recencia

**Contrato**:
```typescript
interface RankedComment {
  id: string;
  score: number;
  boosted: boolean;
  reason: string;
}
```

### 4. TrustLayer (`services/ranking/trustLayer.ts`)

**Objetivo**: Calcular trust score de autores y contenido.

**Componentes**:
- Autor XP
- Histórico de contenido
- Reports/reclamaciones
- Engagement score

```typescript
interface TrustScore {
  userId: string;
  score: number;
  level: 'new' | 'regular' | 'trusted' | 'expert';
  factors: {
    xp: number;
    contentQuality: number;
    engagement: number;
  };
}
```

### 5. LearningPath (`services/ranking/learningPath.ts`)

**Objetivo**: Personalizar recorrido de aprendizaje.

**Señales**:
- Progreso completado
- Tiempo en módulos
- Quizzes completados
- Interacciones con IA

```typescript
interface LearningPathItem {
  moduleId: string;
  priority: number;
  reason: string;
  estimatedTime: number;
}
```

## UserSignalsService (`services/analytics/userSignals.ts`)

Sistema de tracking de señales explícitas e implícitas.

### Tracking API

```typescript
UserSignalsService.track(type: SignalType, userId: string, targetId?: string, metadata?: Record<string, unknown>): void
UserSignalsService.trackPageView(userId: string, targetId: string, targetType: string, scrollDepth?: number): void
UserSignalsService.trackSearch(userId: string, query: string): void
UserSignalsService.trackSignalView(userId: string, signalId: string, pair: string): void
```

### Interest Profile

```typescript
interface UserInterestProfile {
  userId: string;
  pairs: Record<string, number>;      // intereses por par de trading
  categories: Record<string, number>; // intereses por categoría
  authors: Record<string, number>;     // follows/interacciones
  signals: Record<string, number>;     // signals vistas
  lastUpdated: number;
}
```

### Engagement Metrics

```typescript
interface UserEngagementMetrics {
  userId: string;
  totalLikesGiven: number;
  totalCommentsGiven: number;
  totalPostsCreated: number;
  totalSignalsViewed: number;
  avgTimeOnFeed: number;
  avgScrollDepth: number;
  lastSeen: number;
  streak: number;
  activeDays: number;
}
```

## Hooks Disponibles

### useUserSignals (`hooks/useUserSignals.ts`)

```typescript
const signals = useUserSignals({ userId, enabled: true });

signals.trackLike(targetId);
signals.trackComment(targetId);
signals.trackPostView(targetId, targetType);
signals.trackSignalView(signalId, pair);
signals.trackSearch(query);
signals.getTopInterests(limit);
signals.getEngagementMetrics();
```

### useEngagementTracker (`hooks/useEngagementTracker.ts`)

```typescript
const engagement = useEngagementTracker({
  userId,
  trackScrollDepth: true,
  trackTimeOnPage: true,
  trackIdleTime: false,
  onEngagementChange: (state) => { ... }
});

engagement.scrollDepth;  // 0-100
engagement.timeOnPage;    // segundos
engagement.isIdle;        // boolean
```

## Flujo de Ranking

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Signals  │ ◄── userId, interests
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Trust Filter   │ ◄── TrustLayer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Score Items    │ ◄── Señales ponderadas
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sort & Limit   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Add Metadata   │ ◄── reason, boosted
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SurfaceResult  │
└─────────────────┘
```

## Algoritmo de Score Base

```typescript
function calculateScore(item: Item, config: RankingConfig): number {
  let score = BASE_SCORE;

  // Recencia (0-25 puntos)
  score += getRecencyScore(item.createdAt);

  // Engagement (0-30 puntos)
  score += getEngagementScore(item);

  // Trust del autor (0-20 puntos)
  score += getTrustScore(item.authorId);

  // Intereses del usuario (0-25 puntos)
  score += getInterestBoost(item, config.interests);

  return Math.max(0, Math.min(100, score));
}
```

## Estados de Error

Cada surface maneja errores de forma consistente:

| Signal | Causa | Fallback |
|--------|-------|----------|
| `disabled` | Feature apagado por flag | Array vacío |
| `error` | Query falló | Error loggeado, retry con backoff |
| `live` | Normal | Contenido rankingado |

## Testing

```typescript
// Unit tests
npx vitest run __tests__/unit/rateLimiter.test.ts

// Integration tests
npx vitest run __tests__/unit/paymentFactory.test.ts
```

## Métricas a Monitorear

- Click-through rate por surface
- Tiempo de scroll en feed
- Señales vistas/clicadas
- Comentarios generados
- Posts creados
- Retorno diario (DAU/MAU)
