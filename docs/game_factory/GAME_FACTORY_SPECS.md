# Game Factory — Top 10 Vertical Slices

Specs ejecutables de los 10 conceptos priorizados de `HUNDRED_WINNING_GAME_CONCEPTS.md`. Cada slice: core loop, monetización, risk y why now.

## Selección

| # | Concepto | Score | Justificación |
|---|---|---|---|
| 1 | TradeSim — Stock Market Simulator | ⭐⭐⭐⭐⭐ | Alineamiento total con core business |
| 2 | WordClash — Word Game Competitivo | ⭐⭐⭐⭐⭐ | Viral social, retention daily |
| 3 | Saboteador Invisible | ⭐⭐⭐⭐⭐ | Ya en desarrollo, offline-first |
| 4 | IdleForge — Idle Tycoon (Café/Space) | ⭐⭐⭐⭐ | Idle mechanics probados |
| 5 | StackZen — Stacker de Precisión | ⭐⭐⭐⭐ | Casual profundo, zen market |
| 6 | MergeMystic — Merge Puzzle Alquimia | ⭐⭐⭐⭐ | Merge top grossing globally |
| 7 | CryptoTycoon — Crypto Miner Idle | ⭐⭐⭐⭐ | Niche actual, parodia + educación |
| 8 | DarkDeck — Card Battler Casual | ⭐⭐⭐⭐ | Card games = high engagement |
| 9 | DuelWords — Trivia Inversión Social | ⭐⭐⭐⭐ | Combina trivia + social + trading |
| 10 | GravityFlip — Runner Cambia Gravedad | ⭐⭐⭐ | Arcade, one-hand, corto dev cycle |

---

## GAME-01: TradeSim — Simulador de Trading

### Concepto

"Aprende a invertir jugando. Simula operaciones en mercados reales sin riesgo real."

### Core Loop

```
START → Seleccionar mercado (forex/crypto/acciones)
  → Analizar gráfico (simplificado)
  → Tomar decisión (compra/venta/hold)
  → Ver resultado en tiempo acelerado
  → Earn coins + unlock markets
  → Mejora tu portfolio
```

**Sesión:** 3-5 minutos. Sesiones cortas = high frequency.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Coin pack S | $0.99 | 1,000 coins |
| Coin pack M | $4.99 | 6,000 coins (20% bonus) |
| Coin pack L | $9.99 | 15,000 coins (50% bonus) |
| No-ads | $2.99 | Elimina ads |

**Ads:** Rewarded video para coins extra.

**Battle Pass:** $4.99/season — cosmetics + exclusive markets.

### Progression

```
Mercados:
  Forex (free)
  Crypto (Level 5)
  Acciones (Level 10)
  Commodities (Level 15)

Decisiones por nivel:
  L1: Solo compra/venta
  L5: Stop loss disponible
  L10: Short selling
  L15: Margen y leverage
```

### Vertical Slice (MVP)

- 3 mercados: Forex, Crypto, Acciones
- 1 timeframe: 1 minuto simulado = 1 hora real
- Decisiones: compra/venta
- Scoring: P&L acumulado
- 1 nivel de progression

### Riesgo

- **Alto**: Regulación (no es gambling si es simulación clara)
- **Medio**: Complejidad de datos de mercado

### Why Now

- Trading es el core del negocio — sinergia directa
- Gamification de educación financiera = diferenciador
- LATAM market underserved para simulators de trading

---

## GAME-02: WordClash — Word Game Competitivo Diario

### Concepto

"5 letras. 6 intentos. Compite contra tus amigos y la comunidad."

### Core Loop

```
Daily puzzle (como Wordle)
  → Resolver palabra
  → Ver stats personales
  → Comparar con amigos
  → Share resultado (viral)
  → Esperar mañana (retention)
```

**Diferenciador vs Wordle:**
- Multiplayer en tiempo real (arena mode)
- Torneos diarios con prizes
- Temas por categoría (trading words, crypto slang)
- Leaderboard global y por comunidad

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Hint pack | $0.99 | 5 hints |
| Pro Pass | $4.99/mes | Sin ads, stats avanzadas, tournaments |
| Tournament entry | $0.99 | Entry fee con prize pool |

**Battle Pass:** $3.99/season — badges, avatars, themes.

**Pro Tip:** Word games son los #1 en share orgânico.

### Vertical Slice (MVP)

- Daily puzzle estándar (5 letras, 6 intentos)
- Hard mode
- Estadísticas personales
- Share to image (customizable)
- Leaderboard básico

### Riesgo

- **Alto**: Competencia intensa (Wordle, NYT games)
- **Medio**: Palabras en español requieren curation

### Why Now

- Viral network effects (compartir resultados)
- Alta retention diaria por diseño
- Integración social directa con comunidades

---

## GAME-03: Saboteador Invisible

Ya definido en `.agent/skills/creador_de_apps/plans/saboteador_invisible_plan.md`.

### Estado

- Plan: ✅ completo (SAB-000 + SAB-001)
- UI/UX: ✅ (SAB-002 — BIG-PICKLE)
- MVP Offline: ✅ (SAB-003 — BIG-PICKLE)

### Monetización (propuesta)

| IAP | Precio | Función |
|---|---|---|
| Unlock roles | $0.99 | Accede a todos los roles |
| Expansion pack | $1.99 | 20 misiones extra |
| No-ads | $1.99 | Elimina ads |

**Battle Pass:** $2.99/season — new mission packs + cosmetics.

### Why Now

- Offline-first = no server costs
- Social en persona = spread orgánico
- Demo-able = fácil de adquirir usuarios

---

## GAME-04: IdleForge — Idle Tycoon (Space Colony)

### Concepto

"Construye tu colonia espacial. Minería, investigación, expansión. Even when you're away."

### Core Loop

```
Recolecta recursos automáticamente
  → Upgrade buildings
  → Unlock new technologies
  → Expand colony
  → Research new resources
  → Prestige (reset con bonus permanente)
```

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Speed boost | $0.99 | 2x speed por 1 hora |
| Resource pack | $2.99 | 10K de cada recurso |
| Prestige pack | $4.99 | +50% bonus de prestige |
| No-ads | $2.99 | Elimina ads |

**Battle Pass:** $4.99/season — exclusive buildings + themes.

**Subscription:** $2.99/mes — 10% bonus en todos los recursos.

### Vertical Slice (MVP)

- 5 buildings básicos
- 3 recursos (minerals, energy, food)
- Offline progress (genera mientras no juegas)
- 1 prestige tier
- Auto-save every 30s

### Riesgo

- **Medio**: Idle games saturation
- **Bajo**: Low maintenance post-launch

### Why Now

- Idle = high LTV (jugadores activos por meses)
- Offline progress = retention aunque no jueguen
- Space theme = broad appeal

---

## GAME-05: StackZen — Stacker de Precisión Zen

### Concepto

"Apila bloques. Perfecciona tu concentración. Encuentra tu flow."

### Core Loop

```
Apilar bloque
  → ¿Cae dentro de la zona?
    → Sí: +1 stack, zona se achica
    → No: Perder bloque, contador se reinicia
  → Ver high score
  → Share resultado
```

**Zen Mode:** Sin presión, solo apilar. Solo high score.
**Challenge Mode:** Con timer, multipliers, obstacles.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Theme pack | $0.99 | Nuevos temas visuales |
| Skip ads | $1.99 | Elimina interstitials |
| Premium themes | $2.99 | Pack de 10 themes |

**Battle Pass:** $2.99/season — themes + effects.

**Key selling point:** No IAP que afecte gameplay — cosmetics only.

### Vertical Slice (MVP)

- 1 theme base
- Modo Zen (infinite stacking)
- High score local
- Share as image
- Haptic feedback

### Riesgo

- **Alto**: Juegos de precisión (Stack, 101!) ya existen
- **Medio**: Differenciación requiere themes únicos

### Why Now

- One-hand gameplay = mobile-native
- Short sessions = high frequency
- Zen market growing (meditation apps)

---

## GAME-06: MergeMystic — Merge Puzzle de Alquimia

### Concepto

"Combina elementos. Descubre nuevos. Construye tu laboratorio de alquimia."

### Core Loop

```
Combinar 2 elementos iguales
  → Resultado: nuevo elemento
  → Descubrir todos los elementos
  → Completar categories
  → Eventos semanales con elementos únicos
```

**Merge:** Combinar 2 → 1 mejor.
**Discovery:** Cada merge puede revelar algo nuevo.
**Events:** Limited-time elements para FOMO.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Energy refill | $0.99 | +50 energy |
| Gacha element | $0.99 | Random rare element |
| Expansion | $1.99 | Unlock new board |
| No-ads | $1.99 | Elimina ads |

**Battle Pass:** $3.99/season — exclusive elements + board skins.

### Vertical Slice (MVP)

- 50 elementos base
- 1 board principal
- Merge mechanics funcionando
- Discovery tracking
- Save/load

### Riesgo

- **Medio**: Merge games saturation (Merge Mansion, etc.)
- **Medio**: Content creation cost (muchos assets)

### Why Now

- Merge = top grossing genre globally
- Low skill floor = broad audience
- Events = retention y re-engagement

---

## GAME-07: CryptoTycoon — Crypto Miner Idle

### Concepto

"Mina crypto sin hardware. Even when you're sleeping."

### Core Loop

```
Mine crypto passively
  → Upgrade miners
  → Unlock new cryptocurrencies
  → Research crypto facts (educational)
  → Passive income generator
  → Trade mined crypto (minigame)
```

**Educational twist:** Cada crypto tiene un fact asociado.
**Trading minigame:** Vendé tu crypto mined al mejor precio.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Speed boost | $0.99 | 2x mining por 4 horas |
| Lucky chest | $1.99 | Random upgrade |
| No-ads | $1.99 | Elimina ads |

**Subscription:** $2.99/mes — passive boost + exclusive coins.

### Vertical Slice (MVP)

- 5 cryptocurrencies (BTC, ETH, SOL, DOGE, ADA)
- 10 miners por crypto
- 1 research tree
- Passive mining
- Trade screen básico

### Riesgo

- **Medio**: Crypto sentiment volatility
- **Medio**: Education = less gamification

### Why Now

- Crypto audience = highly engaged
- Educational value = parents approve
- Trending sector = acquisition

---

## GAME-08: DarkDeck — Card Battler Casual

### Concepto

"Crea tu mazo. Combina cartas. Derrota a tus oponentes."

### Core Loop

```
Build deck (5 cards)
  → Auto-battle contra opponent
  → Cards attack in order
  → Win = progress, Lose = retry
  → Earn new cards
  → Improve deck
```

**Auto-battler:** No skill required — strategy en deck building.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Card pack | $0.99 | 3 random cards |
| Premium deck | $2.99 | Pre-built competitive deck |
| No-ads | $1.99 | Elimina ads |

**Battle Pass:** $4.99/season — new cards + cosmetic borders.

**Subscription:** $3.99/mes — daily card pack + bonus gold.

### Vertical Slice (MVP)

- 30 cards (10 commons, 10 rares, 10 epics)
- 3 pre-built decks para start
- AI opponent
- 20 levels de progression
- Deck editor básico

### Riesgo

- **Alto**: Card battlers son complejos (balance, meta)
- **Medio**: CCG market dominated por Hearthstone, Marvel Snap

### Why Now

- Marvel Snap proved mobile CCG works
- Shorter sessions than traditional CCG
- Deck building = deep engagement

---

## GAME-09: DuelWords — Trivia Inversión Social

### Concepto

"Trivia de inversión y finanzas. Compite contra amigos. Aprende mientras juegas."

### Core Loop

```
Daily trivia (10 preguntas)
  → Respuesta rápida
  → Live leaderboard
  → ¿Aciertas?
    → Sí: +points + streak
    → No: Explanation shown
  → End of round: rankings
  → Unlock new categories
```

**Categories:** Forex, Crypto, Stocks, Economics, Trading strategies.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Skip | $0.99 | Skip question (1x) |
| Streak freeze | $0.99 | Salva tu streak |
| Pro subscription | $3.99/mes | Daily challenges, categories, stats |

**Ads:** Rewarded video para retry en failed round.

### Vertical Slice (MVP)

- 50 preguntas base (10 categories)
- Daily + Practice mode
- Leaderboard local
- Streak system
- Explanation post-round

### Riesgo

- **Medio**: Content creation cost (questions need updating)
- **Bajo**: Simple mechanics, easy to maintain

### Why Now

- Combina: trivia + social + education + trading
- Social competition = viral
- Educational = parents/schools as buyers

---

## GAME-10: GravityFlip — Runner Cambia Gravedad

### Concepto

"Corre. Salta entre gravedad normal e invertida. Sobrevive el mayor tiempo posible."

### Core Loop

```
Run endless
  → Tap = flip gravity
  → Avoid obstacles
  → Collect coins
  → Unlock new characters
  → Beat your high score
```

**Mechanics:** 1 button = gravity flip. Easy to learn, hard to master.

### Monetización

| IAP | Precio | Función |
|---|---|---|
| Coin pack | $0.99 | 500 coins |
| Character unlock | $1.99 | New character |
| No-ads | $1.99 | Elimina ads |

**Battle Pass:** $2.99/season — characters + trails + effects.

**Key selling point:** Simple IAP — cosmetics y convenience.

### Vertical Slice (MVP)

- 1 character
- 3 themes (city, space, underwater)
- Procedurally generated obstacles
- High score global
- Share as GIF

### Riesgo

- **Alto**: Endless runners saturados (Subway Surfers, Temple Run)
- **Medio**: Requires polished feel para competir

### Why Now

- 1-button gameplay = broadest audience
- Short sessions = high frequency
- Quick to build = fast iteration

---

## Priorización de Builds

| Orden | Game | Complexity | Time | Revenue Model | Score Final |
|---|---|---|---|---|---|
| 1 | TradeSim | Alta | 6-8 sem | IAP + Battle Pass | ⭐⭐⭐⭐⭐ |
| 2 | WordClash | Media | 4-6 sem | Battle Pass + Pro | ⭐⭐⭐⭐⭐ |
| 3 | Saboteador | Media | 4-6 sem | IAP + Expansion | ⭐⭐⭐⭐⭐ |
| 4 | IdleForge | Baja | 3-5 sem | IAP + Sub | ⭐⭐⭐⭐ |
| 5 | StackZen | Baja | 2-4 sem | Cosmetics only | ⭐⭐⭐⭐ |
| 6 | MergeMystic | Media | 4-6 sem | IAP + Battle Pass | ⭐⭐⭐⭐ |
| 7 | CryptoTycoon | Baja | 3-5 sem | IAP + Sub | ⭐⭐⭐⭐ |
| 8 | DuelWords | Baja | 3-4 sem | Pro + Ads | ⭐⭐⭐⭐ |
| 9 | DarkDeck | Alta | 6-8 sem | Battle Pass + IAP | ⭐⭐⭐ |
| 10 | GravityFlip | Media | 4-5 sem | Battle Pass + IAP | ⭐⭐⭐ |

---

## Revenue Potential por Game

| Game | Target DAU | ARPU | MRR |
|---|---|---|---|
| TradeSim | 10K | $0.15 | $4,500 |
| WordClash | 50K | $0.05 | $7,500 |
| Saboteador | 5K | $0.20 | $3,000 |
| IdleForge | 20K | $0.10 | $6,000 |
| StackZen | 15K | $0.05 | $2,250 |
| MergeMystic | 30K | $0.08 | $7,200 |
| CryptoTycoon | 10K | $0.10 | $3,000 |
| DuelWords | 8K | $0.06 | $1,440 |
| DarkDeck | 15K | $0.12 | $5,400 |
| GravityFlip | 20K | $0.08 | $4,800 |
| **Total** | **183K DAU** | | **$45,090/mo** |

---

## Technical Notes

**Stack para todos:**
- React + Vite (web)
- Capacitor (mobile native)
- Convex (backend, leaderboards, save)
- LocalStorage (offline save)
- React Native (si se requiere performance nativa)

**Shared systems:**
- Leaderboard service (reusable)
- IAP abstraction (reusable)
- Save/load (Convex persistence)
- Notification scheduler (reusable)

---

## Metadata

- **Creado:** 2026-03-22
- **Specs:** 10 vertical slices
- **Formato:** core loop + monetización + progression + slice MVP + riesgo + why now
- **Revenue potential:** $45K/mo
- **Revisión:** Pre-build
