---
name: herramientas
description: Catálogo completo de componentes UI, utilidades y herramientas del proyecto TradeShare. Incluye los 21 componentes del UI Kit, hooks personalizados, servicios de sesión, y el sistema Aurora Swarm Heartbeat.
---

# Herramientas - TradeShare UI Kit & Utilities

## UI Kit Components (21 componentes)

Todos los componentes están en `src/components/ui/` y siguen el design system TradeShare: glassmorphism, gradientes primary/violet, animaciones suaves.

### Componentes de Datos

| Componente | Archivo | Props Clave | Uso |
|-----------|---------|-------------|-----|
| TransactionCard | `TransactionCard.tsx` | type, amount, currency, status | Pagos, depósitos, retiros |
| ProductCard | `ProductCard.tsx` | title, price, image, rating, onAddToCart | Marketplace, estrategias |
| NotificationCard | `NotificationCard.tsx` | title, message, type, read, timestamp | Panel notificaciones |
| AlertCard | `AlertCard.tsx` | type (info/success/warning/error), title, message | Alertas inline |

### Componentes de Interacción

| Componente | Archivo | Props Clave | Uso |
|-----------|---------|-------------|-----|
| GalaxyButton | `GalaxyButton.tsx` | variant (primary/outline), glow | Botones principales |
| GoldButton | `GoldButton.tsx` | variant (solid/outline), size | CTAs premium, pagos |
| PlayButton | `PlayButton.tsx` | size, isPlaying | TV Live, streams |
| DeleteButton | `DeleteButton.tsx` | onConfirm, variant | Eliminar con confirmación inline |
| ConfirmCard | `ConfirmCard.tsx` | title, message, onConfirm, onCancel, variant | Modales de confirmación |
| CustomCheckbox | `CustomCheckbox.tsx` | checked, onChange, label | Formularios, términos |
| ShoppingCart | `ShoppingCart.tsx` | items, onRemove, onUpdateQuantity, onCheckout | Carrito marketplace |

### Componentes de Display

| Componente | Archivo | Props Clave | Uso |
|-----------|---------|-------------|-----|
| GlowCard | `GlowCard.tsx` | glowColor | Cards con glow personalizado |
| ShineCard | `ShineCard.tsx` | intensity (low/medium/high) | Cards con efecto shine |
| PremiumCard | `PremiumCard.tsx` | title, badge | Secciones premium |
| NeonLoader | `NeonLoader.tsx` | size, color, text | Loading states |
| StarRating | `StarRating.tsx` | rating, maxRating, interactive | Reviews, calificaciones |
| DotPattern | `DotPattern.tsx` | color, size, spacing, opacity | Fondos decorativos |
| Starfield | `Starfield.tsx` | count, speed | Fondos animados |

### Componentes de Auth

| Componente | Archivo | Props Clave | Uso |
|-----------|---------|-------------|-----|
| LoginForm | `LoginForm.tsx` | onSubmit, onGoogleSignIn, loading, error | Login modal |
| RegisterForm | `RegisterForm.tsx` | onSubmit, onGoogleSignIn, loading, error | Registro modal |

### Componentes Existentes (pre-UI Kit)

| Componente | Archivo | Uso |
|-----------|---------|-----|
| LottieAnimation | `LottieAnimation.tsx` | Animaciones Lottie |
| PremiumBackgrounds | `PremiumBackgrounds.tsx` | Fondos premium (Starfield, DotPattern) |
| TradingComponents | `TradingComponents.tsx` | Componentes trading |
| VirtualList | `VirtualList.tsx` | Listas virtualizadas |

## Hooks Personalizados

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useConvexSession | `src/hooks/useConvexSession.tsx` | Sesión reactiva con Convex como source of truth |
| useFallback | `src/hooks/useFallback.ts` | Fallback automático para errores |
| usePostsFeed | `src/hooks/usePostsFeed.ts` | Feed de posts con paginación |
| useNotifications | `src/hooks/useNotifications.ts` | Notificaciones en tiempo real |
| useMercadoPago | `src/hooks/useMercadoPago.ts` | Integración MercadoPago |
| useSignalWebSocket | `src/hooks/useSignalWebSocket.ts` | WebSocket señales trading |
| useResilientData | `src/hooks/useResilientData.ts` | Datos resilientes con cache |
| useMemoizedCallbacks | `src/hooks/useMemoizedCallbacks.ts` | Optimización rendimiento |

## Servicios de Sesión (Refactorizado)

### sessionManager.ts
- **Fuente de verdad:** Convex (queries/mutations)
- **localStorage:** Solo caché de respaldo (no source of truth)
- **Funciones clave:**
  - `saveSession(token, userId)` - Guarda sesión + cache
  - `getSession()` - Lee desde cache, valida con Convex
  - `clearSession()` - Limpia sesión + cache
  - `validateSessionWithConvex()` - Valida sesión contra Convex
  - `syncSessionToConvex(userData)` - Sincroniza datos a Convex

### useConvexSession.tsx
- Provider React para sesión global
- Auto-validación con Convex al montar
- Refresh y clear methods
- Estado: isAuthenticated, isLoading, error

## Scripts de Automatización

| Script | Descripción |
|--------|-------------|
| `aurora-swarm-heartbeat.mjs` | Coordinación en tiempo real de agentes |
| `aurora-notion-sync.mjs` | Sincronización con Notion |
| `aurora-auto-learn.mjs` | Aprendizaje automático |
| `aurora-system-health.mjs` | Monitoreo de salud del sistema |
| `aurora-agent-bridge.mjs` | Puente con agentes externos |

## Design System

### Colores
```
Primary: #3b82f6 (Azul)
Signal Green: #10b981
Card Dark: #1a1a2e
Background: #0f1115
```

### Clases Comunes
```
glass = backdrop-blur-xl + border-white/10
card = rounded-2xl + bg-card-dark
button = rounded-xl + bg-gradient + shadow
input = bg-white/5 + border-white/10 + rounded-xl
```

## Integraciones Actuales

| Componente | Vista | Estado |
|-----------|-------|--------|
| NotificationCard | NotificationPanel | ✅ Integrado |
| ProductCard | MarketplaceView | ✅ Integrado |
| StarRating | MarketplaceView | ✅ Integrado |
| DeleteButton | MarketplaceView | ✅ Integrado |
| CustomCheckbox | MarketplaceView | ✅ Integrado |
| ConfirmCard | MarketplaceView | ✅ Integrado |
| NeonLoader | AuthModal | ✅ Integrado |
| Starfield/DotPattern | AuthModal | ✅ Integrado |
| GlowCard | AuthModal | ✅ Integrado |
| GalaxyButton | AuthModal | ✅ Integrado |

## Cómo Usar

```tsx
// Importar componente
import { ProductCard } from '../components/ui/ProductCard';
import { StarRating } from '../components/ui/StarRating';
import { NeonLoader } from '../components/ui/NeonLoader';

// Usar en vista
<ProductCard
  id="123"
  title="Estrategia Pro"
  description="Descripción..."
  price={29.99}
  currency="USD"
  category="swing"
  rating={4.5}
  reviews={120}
  onView={() => handleView()}
/>

<StarRating rating={4} interactive onChange={setRating} />
<NeonLoader size="md" text="Cargando..." />
```
