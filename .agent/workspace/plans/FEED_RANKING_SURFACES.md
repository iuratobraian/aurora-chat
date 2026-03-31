# Feed Ranking Surfaces & Contracts

## Objetivo

Definir todas las superficies de ranking del producto con sus objetivos, señales y estrategias de fallback. Cada superficie tiene un contrato claro que permite implementación, testeo y evolución independiente.

## Surfaces Identificadas

| Surface | View | Ranker | Estado |
|---------|------|--------|--------|
| `feed` | ComunidadView | FeedRanker | ✅ Implementado |
| `comments` | CommentSection | CommentsRanker | ✅ Implementado |
| `signals` | SignalsView | SignalsRanker | ⚠️ Deshabilitado |
| `academia` | DashboardView | LearningPathService | ✅ Implementado |
| `discover` | DiscoverView | DiscoverRanker | ✅ Implementado |
| `profile` | PerfilView | ProfileRanker | ✅ Implementado |
| `notifications` | Notificaciones | NotificationRanker | ✅ Implementado |
| `search` | SearchView | SearchRanker | ✅ Implementado |

---

## Surface: `feed`

**Vista:** `views/ComunidadView.tsx`
**Ranker:** `services/feed/feedRanker.ts`
**Contrato:** `FeedSurface`

### Objetivo
Mostrar el contenido más relevante para el usuario en el feed principal de la comunidad, balanceando engagement, recencia y calidad del autor.

### Señales Explícitas
- Likes dados (`POST_LIKE`, `POST_UNLIKE`)
- Comentarios creados (`POST_COMMENT`)
- Posts guardados (`POST_SAVE`)
- Reportes (`POST_REPORT`)

### Señales Implícitas
- Tiempo de lectura (scroll depth)
- Tiempo en post
- Reacciones (hover, pause)
- Pares de trading seguidos
- Categorías de interés

### Señales de Ranking (Actuales)
| Factor | Peso | Descripción |
|--------|------|-------------|
| Engagement | 30% | likes + comentarios |
| Recencia | 20% | Antigüedad del post |
| Trust del autor | 15% | Score del TrustLayer |
| Interés del usuario | 10% | Match con pares/tags |
| IA Content | 5% | Boost para isAiAgent |

### Configuración
```typescript
interface FeedRankingConfig {
  includeSignals: boolean;      // default: true
  maxSignalsPerPage: number;    // default: 3
  signalMinWinRate: number;    // default: 50
  userXp: number;
  userInterests: string[];
}
```

### Fallback
1. Si `posts.length === 0`: mostrar estado vacío con CTA
2. Si `signal === 'error'`: deshabilitar signals, usar solo posts
3. Si `signal === 'disabled'`: no incluir signals en merge

### Contrato de Respuesta
```typescript
interface FeedSurface {
  items: RankedItem[];      // Posts y signals mezclados
  surface: 'feed';
  total: number;
  hasMore: boolean;
  signal: 'live' | 'cached' | 'fallback';
}
```

---

## Surface: `comments`

**Vista:** `components/CommentSection.tsx`
**Ranker:** `services/ranking/commentsRanker.ts`
**Contrato:** `CommentsSurface`

### Objetivo
Ordenar comentarios para facilitar conversación de calidad, priorizando engagement y relevance.

### Señales Explícitas
- Like en comentario (`COMMENT_LIKE`, `COMMENT_UNLIKE`)
- Respuestas creadas (`COMMENT_REPLY`)

### Señales Implícitas
- Tiempo de lectura del comentario
- Scroll en thread

### Modos de Ordenamiento
| Modo | Prioridad | Descripción |
|------|-----------|-------------|
| `engagement` | default | Likes + replies + recencia |
| `recency` | alternativo | Más reciente primero |
| `quality` | alternativo | Calidad del texto + imágenes |

### Configuración
```typescript
interface CommentsRankingConfig {
  sortBy: 'engagement' | 'recency' | 'quality';
  userId?: string;
  includeReplies: boolean;
  maxDepth: number;  // default: 3
}
```

### Fallback
1. Si `comments.length === 0`: retornar surface con signal: 'empty'
2. Si `sortBy` no existe: usar 'engagement'
3. Si `maxDepth` no especificado: usar 3 niveles

### Contrato de Respuesta
```typescript
interface CommentsSurface {
  items: RankedComment[];
  surface: 'comments';
  postId: string;
  total: number;
  sortedBy: CommentSortOption;
  signal: 'computed' | 'empty';
}
```

---

## Surface: `signals`

**Vista:** `views/SignalsView.tsx`
**Ranker:** `services/ranking/signalsRanker.ts`
**Contrato:** `SignalsSurface`

### Objetivo
Mostrar señales de trading rankeadas por win rate y experiencia del proveedor.

### Estado Actual
⚠️ **Deshabilitado** - `VITE_FEATURE_SIGNALS=off`

### Señales Explícitas
- Signal vista (`SIGNAL_VIEW`)
- Signal copiada (`SIGNAL_COPY`)
- Proveedor seguido (`PROVIDER_FOLLOW`)

### Señales de Ranking
| Factor | Peso | Descripción |
|--------|------|-------------|
| Win Rate | 50% | Diferencia de 50% base |
| Provider XP | 20% | Experiencia del proveedor |
| Recencia | 15% | Señales frescas boost |
| Interés | 10% | Match con pares seguidos |
| Dirección | 5% | Buy signals boosted |

### Configuración
```typescript
interface SignalsRankingConfig {
  minWinRate: number;       // default: 50
  maxSignals: number;       // default: 20
  userXp: number;
  userInterests: string[];
  includeClosed: boolean;   // default: false
}
```

### Fallback
1. Si feature flag off: usar `SignalsRanker.disabled()`
2. Si fetch falla: `signal: 'error'` con array vacío
3. Si no hay signals: `signal: 'disabled'`

### Contrato de Respuesta
```typescript
interface SignalsSurface {
  items: RankedSignal[];
  surface: 'signals';
  total: number;
  minWinRate: number;
  signal: 'live' | 'disabled' | 'error';
  error?: string;
}
```

---

## Surface: `academia`

**Vista:** `views/DashboardView.tsx`
**Ranker:** `services/ranking/learningPath.ts`
**Contrato:** `AcademiaSurface`

### Objetivo
Personalizar recomendaciones de cursos y estrategias basado en nivel del usuario y progreso.

### Señales Explícitas
- Curso iniciado (`COURSE_START`)
- Curso completado (`COURSE_COMPLETE`)
- Estrategia vista (`STRATEGY_VIEW`)
- Quiz tomado (`QUIZ_TAKE`)

### Señales de Ranking
| Factor | Peso | Descripción |
|--------|------|-------------|
| Level Match | 30% | Adecuación nivel contenido/usuario |
| Completion Gap | 25% | Priorizar no iniciados |
| Valor por esfuerzo | 20% | Tiempo estimado vs XP |
| Popularidad | 15% | Lecciones/views |

### Configuración
```typescript
interface AcademiaRankingConfig {
  userXp: number;
  userRole: number;
  completedCourses: string[];
  sortBy: 'recommended' | 'level' | 'popular';
}
```

### Fallback
1. Si `courses.length === 0`: surface con signal: 'empty'
2. Si no hay match: mostrar contenido popular
3. Si usuario nuevo (XP < 100): priorizar principiante

### Contrato de Respuesta
```typescript
interface AcademiaSurface {
  items: RecommendedItem[];
  surface: 'academia';
  userLevel: number;
  sortedBy: 'recommended' | 'level' | 'popular';
  signal: 'computed' | 'empty';
}
```

---

## Surface: `discover` (Pendiente)

**Vista:** Por definir
**Ranker:** Por crear

### Objetivo
Ayudar a usuarios a encontrar contenido nuevo fuera de su burbuja de intereses.

### Señales de Ranking (Propuestas)
| Factor | Peso | Descripción |
|--------|------|-------------|
| Diversidad | 25% | Introducir variedad |
| Calidad | 25% | Trust score del autor |
| Tendencia | 20% | Crecimiento de engagement |
| Novedad | 20% | Contenido nuevo |
| Serendipia | 10% | Contenido aleatorio de alta calidad |

---

## Surface: `profile` (Pendiente)

**Vista:** `views/PerfilView.tsx`
**Ranker:** Por crear

### Objetivo
Mostrar la mejor versión del perfil del usuario y contenido de usuarios visitados.

### Señales de Ranking (Propuestas)
| Factor | Peso | Descripción |
|--------|------|-------------|
| Engagement | 30% | Posts más populares del usuario |
| Recencia | 25% | Contenido reciente |
| Trust | 20% | Calidad del contenido |
| Progreso | 15% | Logros y badges |
| IA Content | 10% | Contenido generado por IA |

---

## Surface: `notifications` (Pendiente)

**Vista:** Dropdown de notificaciones
**Ranker:** Por crear

### Objetivo
Priorizar notificaciones relevantes, reducir ruido.

### Señales de Ranking (Propuestas)
| Factor | Peso | Descripción |
|--------|------|-------------|
| Urgencia | 30% | Tiempo敏感性 |
| Relación | 25% |followers, likes, comments |
| Engagement potencial | 25% | Notificaciones accionables |
| IA Relevance | 20% | Contenido personalizado |

### Tipos de Notificación
- `mention` - Alta prioridad
- `comment` - Media prioridad
- `like` - Baja prioridad
- `follow` - Baja prioridad
- `signal` - Variable (basado en provider trust)

---

## Surface: `search` (Pendiente)

**Vista:** Resultados de búsqueda
**Ranker:** Por crear

### Objetivo
Ordenar resultados de búsqueda para máxima relevancia.

### Señales de Ranking (Propuestas)
| Factor | Peso | Descripción |
|--------|------|-------------|
| Match textual | 35% | Relevancia de keywords |
| Engagement | 25% | Popularidad del resultado |
| Recencia | 20% | Contenido reciente |
| Trust | 20% | Calidad del autor |

---

## Contratos Comunes

### Tipos Compartidos
```typescript
type SurfaceName = 'feed' | 'comments' | 'signals' | 'academia' | 'discover' | 'profile' | 'notifications' | 'search';
type DataSignal = 'live' | 'cached' | 'fallback' | 'error' | 'disabled' | 'empty';
type SignalStrength = 'strong' | 'medium' | 'weak';
```

### Interfaz Base
```typescript
interface Surface {
  surface: SurfaceName;
  signal: DataSignal;
  error?: string;
}
```

---

## Implementación Sugerida

### Fase 1: Completar Existentes
- [x] feed - FeedRanker
- [x] comments - CommentsRanker
- [ ] signals - Rehabilitar con feature flag
- [x] academia - LearningPathService

### Fase 2: Nuevas Superficies
- [ ] discover - Crear DiscoverRanker
- [ ] profile - Integrar en PerfilView
- [ ] notifications - Crear NotificationRanker
- [ ] search - Crear SearchRanker

### Fase 3: Optimización
- [ ] Personalización por usuario (ML simple)
- [ ] A/B testing de weights
- [ ] Métricas de ranking (CTRs, time on content)

---

## Métricas de Éxito

| Surface | Métrica | Target |
|---------|---------|--------|
| feed | CTR en posts | > 15% |
| feed | Tiempo en feed | > 2 min/sesión |
| comments | Participación | > 10% usuarios |
| signals | Copy rate | > 5% |
| academia | Course starts | > 20% usuarios |

---

## Referencias

- Servicios existentes: `services/feed/`, `services/ranking/`
- Signals: `VITE_FEATURE_SIGNALS` en `.env`
- Trust: `TrustLayer` en `services/ranking/trustLayer.ts`
- Analytics: `services/analytics/userSignals.ts`
