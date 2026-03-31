# Game Creator App — Spec Ejecutable

App que permite crear juegos mobile playable a partir de templates y configuración. Producto meta que usa la game factory.

## Concepto

**"Elige un género. Configura tu juego. Publícalo."**

Un creador de juegos donde el usuario selecciona un género (idle, puzzle, runner), configura parámetros (dificultad, monetización, temática) y recibe un juego playable completo.

### Diferenciadores

- **LATAM-native**: templates contextualizados
- **Templates curados**: genres probados en top charts
- **Publish-ready**: no es mockup, es un juego real
- **TradeStack-compatible**: usa la infraestructura existente

---

## Producto

### Job-to-be-done

> "Quiero crear un juego simple para mi comunidad o marca, pero no tengo developers ni presupuesto."

### Propuesta de valor

| Para quién | Quiere | Damos | Sin |
|---|---|---|---|
| Creator / Brand | Juego para su audiencia | App playable en 10 min | Código |
| Educator | Gamificar su contenido | Quiz game template | Desarrollo |
| Community manager | Engagement tool | Trivia/competition game | Complicación |
| Entrepreneur | Producto digital rápido | Mobile game mínimo | Inversion alta |

---

## Géneros Soportados

| Género | Complejidad | Dev Time | IAP Potential | Ejemplo |
|---|---|---|---|---|
| Idle Tycoon | Baja | 2-3 sem | Alto | IdleForge, CryptoTycoon |
| Quiz / Trivia | Baja | 1-2 sem | Medio | DuelWords |
| Word Game | Media | 2-3 sem | Medio | WordClash |
| Endless Runner | Media | 3-4 sem | Alto | GravityFlip |
| Merge Puzzle | Media | 3-4 sem | Alto | MergeMystic |
| Card Battler | Alta | 4-5 sem | Alto | DarkDeck |

---

## UX / Flujo

### Flujo Principal

```
┌──────────────────────────┐
│  Elige tu género         │
│                           │
│  [Idle] [Quiz] [Runner]  │
│  [Merge] [Word] [Card]   │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│  Configura tu juego       │
│                           │
│  Nombre: [___________]   │
│  Tema: [Deportes/...]    │
│  Dificultad: [ Fácil ]   │
│  Monetización: [ IAP ]   │
│  Logo: [Upload]          │
│                           │
│  [Vista previa]          │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│  ⚙️ Generando juego...   │
│  ▓▓▓▓▓░░ 70%            │
│                           │
│  Construyendo assets...   │
│  Configurando mecánicas..│
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│  ✅ ¡Tu juego está listo! │
│                           │
│  [Jugar] [Personalizar]  │
│  [Publicar]              │
└──────────────────────────┘
```

### Configuración por Género

#### Idle Tycoon

```typescript
interface IdleConfig {
  name: string;
  theme: 'space' | 'cafe' | 'factory' | 'crypto' | 'farm';
  currency: string;       // "coins", "gems", "credits"
  initialResource: number;
  offlineProgress: boolean;
  iapEnabled: boolean;
  adsEnabled: boolean;
  customLogo?: string;
  brandColor?: string;
}
```

#### Quiz / Trivia

```typescript
interface QuizConfig {
  name: string;
  category: 'trading' | 'sports' | 'general' | 'custom';
  questions: number;      // 10, 20, 50
  difficulty: 'easy' | 'medium' | 'hard';
  timePerQuestion: number; // seconds
  lives: number;          // 1, 3, unlimited
  iapEnabled: boolean;
  customQuestions?: Question[];
}
```

#### Endless Runner

```typescript
interface RunnerConfig {
  name: string;
  theme: 'city' | 'space' | 'underwater' | 'forest';
  character: string;
  obstacles: 'minimal' | 'normal' | 'intense';
  collectibles: string;
  iapEnabled: boolean;
  adsEnabled: boolean;
  customLogo?: string;
}
```

---

## Pantallas de la App

### P0 — MVP

1. **Landing** (`/`) — Explicar + CTA "Crear juego"
2. **Selector de género** (`/create`) — Grid de géneros
3. **Configurador** (`/configure`) — Form por género
4. **Preview** (`/preview`) — Ver el juego generado
5. **Dashboard** (`/dashboard`) — Mis juegos
6. **Play** (`/[game-id]`) — El juego generado

### P1

- Editor de preguntas (para quiz)
- Cambio de assets (imágenes, colores)
- Analytics básico del juego generado
- Custom domain / branded link

### P2

- Multiplayer para quiz
- Leaderboard global
- API de integración
- Marketplace de templates premium

---

## Modelo de Negocio

| Tier | Precio | Juegos | Features |
|---|---|---|---|
| Free | $0 | 1 juego | Ads, watermark |
| Pro | $9/mes | 5 juegos | Sin ads, sin watermark |
| Agency | $49/mes | 50 juegos | White label, analytics |

### Revenue Streams

1. **Subscriptions** (principal): Pro + Agency
2. **Custom branding**: $5/mes por juego extra en Pro
3. **Template packs**: $2-5 por template premium
4. **White label**: $199/setup para Agency

---

## Arquitectura Técnica

### Stack

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React)                                 │
│  - Creator interface (select, configure, preview)      │
│  - Game renderer (playable game)                          │
│  - Dashboard                                              │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  GENERATION ENGINE (Express)                              │
│  - Template selector                                       │
│  - Config parser                                           │
│  - Game generator (React components)                     │
│  - Asset bundler                                           │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  STORAGE                                                   │
│  - Games metadata: Convex                                  │
│  - Game configs: Convex                                    │
│  - Generated code: GitHub / filesystem                     │
│  - Assets: Cloudflare R2 / Vercel Blob                   │
└─────────────────────────────────────────────────────────┘
```

### Game Renderer

Cada juego generado es un React component bundle:

```typescript
interface GeneratedGame {
  id: string;
  genre: Genre;
  config: GameConfig;
  component: React.ComponentType;
  assets: Asset[];
  metadata: GameMetadata;
}

function renderGame(game: GeneratedGame): JSX.Element {
  return <game.component {...game.config} />;
}
```

### Templates como Components

```typescript
// templates/idle/IdleGame.tsx
export function IdleGame({ config }: IdleConfig) {
  return (
    <div className="idle-game">
      <ResourceDisplay {...config} />
      <BuildingGrid onUpgrade={handleUpgrade} />
      <OfflineProgressModal />
    </div>
  );
}
```

### API Endpoints

```typescript
// Express relay
POST /api/generate    // Genera juego desde config
GET  /api/game/:id    // Obtiene game data
GET  /api/preview/:id // Preview URL
POST /api/deploy/:id   // Build y deploy

// Convex
games.list           // Dashboard
games.get            // Get game
games.update         // Update config
games.delete         // Delete
games.play           // Get playable component
```

---

## Roadmap

### Fase 1 — MVP (3 semanas)
- [ ] Landing + selector de género
- [ ] Templates: Idle Tycoon + Quiz
- [ ] Configuración funcional
- [ ] Preview en iframe
- [ ] Dashboard básico
- [ ] Deploy a Vercel
- [ ] Free tier (1 juego, ads, watermark)

### Fase 2 — Coverage (3 semanas)
- [ ] Templates: Word Game + Endless Runner + Merge
- [ ] Editor de preguntas (para quiz)
- [ ] Cambio de logo y colores
- [ ] Analytics básico (DAU, sessions)
- [ ] Pro tier

### Fase 3 — Polish (3 semanas)
- [ ] Templates: Card Battler + más variaciones
- [ ] Custom questions upload (CSV)
- [ ] Leaderboard compartido
- [ ] Share to community
- [ ] Agency tier

### Fase 4 — Scale (4 semanas)
- [ ] Template marketplace
- [ ] API access
- [ ] Multiplayer para quiz
- [ ] White label para Agency

---

## Métricas

| Métrica | Target | Descripción |
|---|---|---|
| Games generated | 50/week | Juegos creados |
| Games published | 15/week | Juegos públicos |
| Conversion to Pro | 5% | Free → Pro |
| Avg generation time | <60s | Tiempo de generación |
| NPS | >50 | Satisfacción |

---

## Riesgo y Mitigación

| Riesgo | Prob | Impacto | Mitigación |
|---|---|---|---|
| Quality variable por genre | Alta | Alto | Templates bien testeados antes de expose |
| Maintenance de múltiples templates | Media | Medio | Comunes componentes compartidos |
| Storage/bandwidth costs | Media | Medio | Lazy load assets + CDN |
| Competencia con no-code builders | Alta | Medio | Foco en mobile gaming, no general |

---

## Competitors

| Competidor | Lo bueno | Lo que falta | Diferenciador |
|---|---|---|---|
| Buildbox | No-code | Complex UI | Mobile gaming focus |
| GameMaker | Powerful | Requires learning | Instant generation |
| GDevelop | Open source | Desktop focus | Mobile-first |
| Our product | Instant + templates | Less flexibility | Speed + LATAM |

---

## Metadata

- **Creado:** 2026-03-22
- **Tipo:** future_products (GAME-002)
- **Dependencias:** GAME-001 (game specs), TradeStack spec
- **Stack:** Vite + React + Convex + Express + Vercel
