# Game Teardown Playbooks

## Propósito

Playbooks derivados de teardowns de juegos mobile y sistemas live service. Extraer patrones de gameplay, monetización, retención, meta loops y live ops transferibles a la game factory del proyecto.

## Metodología

- Análisis: gameplay loop, progression system, meta, monetización, live ops, retention
- Validación: sensores de Sensor Tower, blog de ingeniería, análisis de mercado
- Formato: anatomy → meta loop → monetización → live ops → transferencia

## Índice de Playbooks

1. [Battle Arena Anatomy](#1-battle-arena-anatomy) — Clash Royale, Brawl Stars
2. [Gacha & RPG Anatomy](#2-gacha--rpg-anatomy) — Genshin Impact, Honkai, Fate/GO
3. [Battle Royale Anatomy](#3-battle-royale-anatomy) — PUBG Mobile, Free Fire
4. [Meta Loop & Progression Patterns](#4-meta-loop--progression-patterns) — Loops de juego, retención
5. [Live Ops & Seasonal Content](#5-live-ops--seasonal-content) — Eventos, battle pass, seasons
6. [Monetización Mobile](#6-monetización-mobile) — IAP, ads, battle pass, gacha

---

## 1. Battle Arena Anatomy

### Clash Royale

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  BATTLE ARENA  │  TROOPS  │  SPELLS         │
│  3min match    │  deck 8  │  4 cards        │
├──────────────────────────────────────────────┤
│  CLAN WARS   │  TOURNAMENTS  │  CHESTS       │
│  2v2 / 1v1   │  competitive  │  progression │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- 3 minutos por partida — sesiones cortas, repetibles
- Deck building como personalización — 8 cartas, 4 slots de spells
- Elixir como recurso estratégico — gestión de recursos en tiempo real
- Clasificatoria visible — trofeos, arenas
- Clan Wars como sistema social — cooperativo competitivo

**Meta Loop:**
```
Daily: 3-5 partidas → 1 chest → unlock cards → upgrade
Weekly: Clan Wars → collect rewards → upgrade
Monthly: Season → reset → new cards → fresh meta
```

**Progression:**
- Arenas unlock por trofeos
- Chests unlock cards y gold
- Card levels: 1-14, upgrade con gold + cards
- Max level = aspiración de largo plazo

**Monetización:**
- Pass Royale ($6.99/mes): bonus chests, emotes, tower skins
- Direct IAP: gems para chests especiales
- Gems: ~$1-100 por pack

**Live Ops:**
- Season every month: new card + rebalance
- Challenge modes: draft, 2v2, touchdown
- Clan Wars 2: boat battles entre clanes
- Tournaments: brackets competitivos

**Transferencia al proyecto:**
- Sistema de ranked con trofeos para signals/communities
- Card upgrades → "Badge upgrades" para reputation
- Clan Wars → "Community Wars" entre subcomunidades
- Chests → "Reward boxes" por streaks

---

### Brawl Stars

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  MODES  │  MAPS  │  BRAWLERS               │
│  3v3/5v5│ rotate │ unlock + upgrade        │
├──────────────────────────────────────────────┤
│  POWER LEAGUE  │  TROPHY ROAD  │  CLUB      │
│  ranked 3v3    │  progression   │  social   │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Modos rotan cada 2 horas — siempre hay algo nuevo
- Brawlers como personajes (40+) con habilidades únicas
- Power League como ranked competitivo
- Club system como comunidad

**Progression:**
- Brawlers unlock por trophy count
- Gears + Gadgets + Star Powers como深度
- Pin system para social + cosmetics

**Monetización:**
- Brawl Pass ($9.99): 40 tiers, brawler unlock, skins
- Star Drops: gacha-lite para cosmetics y power points
- Direct IAP

---

## 2. Gacha & RPG Anatomy

### Genshin Impact

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  OPEN WORLD  │  DOMAINS  │  RESIN          │
│  exploration │  daily    │  stamina limit   │
├──────────────────────────────────────────────┤
│  WISH (GACHA) │  BANNER ROTATION │ TEAMS    │
│  primo-based  │  limited chars    │ 4 chars  │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Open world como entrada — exploración > combate
- Resin como gate energético — limita farming, genera urgencia
- Wish system como monetización principal — 50/50 pity
- 4-character teams como puzzle — elemental reactions
- Historia como retention — cada región tiene arco narrativo

**Meta Loop:**
```
Daily: 160 resin → 4 domains → materials → upgrade
Weekly: Abyss floors → primogems → wish
Patch (6 weeks): New region/content → exploration
```

**Monetización:**
- Welkin Moon ($4.99/mes): daily primos por 30 días
- Battle Pass ($9.99): weapons + materials + primos
- Genesis Crystals: IAP directo
- **Gacha Wish**: ~$15-30 por wish, pity system 90 pulls
- Cosmetics: skins, namecards, hangout stories

**Pity System (estándar gacha):**
- Soft pity: 75+ pulls la chance sube
- Hard pity: 90 pulls garantía 5-star
- 50/50: si no toca el banner char, próximo es garantizado
- Garantía: pity carry entre banners

**Transferencia al proyecto:**
- Resin → energía diaria para acceder a contenido premium
- Wish → "daily spin" para cosmetics/badges
- Pity → streak-based rewards que escalan
- Constellations → "Badge fusion" para upgrades

---

### Fate/GO

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  MAIN STORY  │  FREE QUESTS  │  EVENTS      │
│  chapters     │  daily farm   │  seasonal   │
├──────────────────────────────────────────────┤
│  SUMMON  │  STRONGHOLDS  │  COMPANION      │
│  gacha   │  servant rooms │  social bonds  │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Historia como principal driver — narrativa deep
- Events limitados como FOMO — colaboración con anime/franchise
- Bond system — relación con servants
- Strengthening quests — upgrade gratuito de servants viejo

**Monetización:**
- Saint Quartz (SQ): ~$1 per SQ, IAP
- Guaranteed SSR banner (paid): $30 por multi-roll garantizado
- Gacha

**Transferencia:**
- Bond system → engagement con signal providers
- Events limitados → "Seasonal signals" por período
- Strengthening → refresh de contenido viejo

---

## 3. Battle Royale Anatomy

### PUBG Mobile

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  MATCH  │  LOOT  │  ZONE                    │
│  60 min │ drops │ shrinking map            │
├──────────────────────────────────────────────┤
│  RANKED  │  ERANGEL / SANHOK  │  CLANS      │
│  rating  │  map rotation      │  social     │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- 1 partida = 1 sesión completa — 30 minutos
- Loot como randomness controlada — drops, air drops
- Zone como presión constante — shrink mechanic
- Map rotation — Erangel vs Sanhok vs otros
- Ranked como progreso competitivo

**Monetización:**
- Royal Pass ($9.99): seasons, skins, emotes
- UC (Unknown Cash): IAP para skins y cosmetics
- Event skins: colaboración limitada
- Loot boxes:crate system para armas

**Transferencia:**
- Map rotation → "Market rotation" de signals por período
- Zone → "Relevance zone" que prioriza contenido fresco
- Loot → "Discovery drops" para engagement

---

### Free Fire

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  BATTLE ROYALE  │  CS  │  SQUAD              │
│  10 min matches │ ranked│  4 players        │
├──────────────────────────────────────────────┤
│  BOOYAH PASS  │  CHARACTERS  │  PETS        │
│  seasonal     │  unique skill │  companion  │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Partidas de 10 minutos — el más corto del género
- Booyah Pass (similar a Battle Pass)
- Characters con habilidades únicas
- Pets como cosmetic companion
- Custom rooms para social play

**Monetización:**
- Booyah Pass ($5-8): ~50 tiers
- Diamonds: IAP
- Characters: $5-15 por skin/character
- Loot boxes: weapon/character skins

**Diferenciador vs PUBG:**
- Más accesible (celulares low-end)
- Más casual pero still competitivo
- Emotes y dances como social proof
- Influencer collaborations masivas

---

## 4. Meta Loop & Progression Patterns

### Loop Framework (Universal)

```
┌──────────────────────────────────────────────────────────┐
│                    CORE LOOP                             │
│  PLAY → REWARD → PROGRESS → UNLOCK → PLAY (repite)       │
└──────────────────────────────────────────────────────────┘
         ↑                                          │
         └────────────── SOCIAL LOOP ───────────────┘
```

**Tipos de Loop:**

| Tipo | Ejemplo | Descripción |
|------|---------|-------------|
| Session | Clash Royale | 3 min → chest → upgrade |
| Daily | Genshin | Resin → materials → upgrades |
| Weekly | Clan Wars | Collection → rewards → ranking |
| Seasonal | Battle Pass | 30 días → tiers → unlock |
| Long-term | Max level | Aspiración de 1-2 años |

### Progression Curve

```
Novato: 0-20% → tutorial + handholding + quick wins
Intermedio: 20-60% → challenge + mastery + social
Avanzado: 60-85% → optimization + ranked + competition  
Élite: 85-100% → mastery total + content creation + teaching
```

**Design Patterns:**
- Early win rate alto: primeras partidas se gana fácil
- Soft walls: el progreso se frena gradualmente
- Side-grades: no solo power, también variety
- Seasonal reset: nivelación del campo de juego

### Retention Triggers

| Trigger | Mecánica | Ejemplo |
|---------|---------|---------|
| Daily streak | Día consecutivo = reward bonus | Duolingo, Clash |
| Fear of missing out | Contenido temporal | Genshin events |
| Social pressure | Depende de amigos | Clan Wars |
| Completionism | Colecciones incompletas | Cards, stickers |
| Random surprise | Drops inesperados | Star Drops |
| Loss aversion | Perder progreso duele más | Trophy reset |

---

## 5. Live Ops & Seasonal Content

### Battle Pass Anatomy

```
┌──────────────────────────────────────────────────────────┐
│  SEASON 8: "FROST ARENA"         │  30 DÍAS           │
├──────────────────────────────────────────────────────────┤
│  FREE TIER  │  1 → 2 → 3 → ... → 100                   │
│  basic rewards                                        │
├──────────────────────────────────────────────────────────┤
│  PREMIUM PASS ($9.99) │  bonus tiers + exclusive       │
│  [SKIN] [EMOTE] [CURRENCY]                             │
└──────────────────────────────────────────────────────────┘
```

**Key Metrics:**
- Tiers: 50-100
- Daily engagement requirement: ~30-60 min/day
- Free-to-paid conversion: 3-10%
- Completion rate: 20-40% llegan al final
- Average spend: $5-15 por season

**Design:**
- Tier 1-10: easy, te engancha
- Tier 25 (mid-point): bonus milestone
- Tier 50-60: wall, necesitas más engagement
- Tier 99-100: aspiracional, pocos llegan
- Expiry: crea urgencia, 4-6 semanas

### Event Types

| Tipo | Duración | Frecuencia | Ejemplo |
|------|:---:|:---:|---------|
| Mini-event | 1-3 días | semanal | Clash Royale challenges |
| Major event | 1-2 semanas | mensual | Genshin versión |
| Crossover | 2-3 semanas | trimestral | PUBG x anime |
| Season | 4-12 semanas | - | Battle Pass |
| Anniversary | 2-4 semanas | anual | Todos |

### Content Calendar Mobile

```
ENE: New Year Event → Season Start
FEB: Valentine → Crossover
MAR: Anniversary → Major Update
ABR: Spring Event → Season
MAY: Summer Preview
JUN-JUL: Summer Event → Season + Crossover
AGO: Summer Peak
SEP: Back to School
OCT: Halloween → Spooky Event
NOV: Thanksgiving → Season
DIC: Christmas → Anniversary → Year End
```

---

## 6. Monetización Mobile

### Revenue Breakdown (Industry)

| Source | % de revenue | Who usa esto |
|--------|:---:|---------|
| IAP (In-App Purchase) | 70-80% | Todos |
| IAA (In-App Ads) | 15-20% | Free-to-play con ads |
| Battle Pass | 5-15% | Clash, PUBG, Genshin |
| Subscription | 3-8% | Genshin (Welkin), Apple Arcade |

### IAP Price Points

```
$0.99 → $1.99 → $4.99 → $9.99 → $19.99 → $49.99 → $99.99
  │        │        │        │        │         │        │
Starter   Small    Medium   Large   Big      Whale    Mega-whale
```

**Anchoring:** el precio del medio parece barato después del grande.

### Gacha Economics

**Typical Rates:**
| Rarity | Chance公示 | Hard pity |
|--------|:---:|:---:|
| ★★★ (3-star) | 70-80% | N/A |
| ★★★★ (4-star) | 20-25% | 10 |
| ★★★★★ (5-star) | 0.3-0.6% | 90 |
| ★★★★★★ (6-star) | 0.01-0.05% | 180+ |

**Pity carry:** cuando no toca el rate-up, se acumula para el siguiente.

### Ads Monetization (IAA)

| Formato | eCPM (USD) | UX Impact |
|---------|:---:|---------|
| Rewarded Video | $15-30 | Positivo (opt-in) |
| Interstitial | $5-15 | Negativo si frecuente |
| Playable Ad | $10-20 | Neutral |
| Banner | $1-3 | Muy negativo |
| Offerwall | $5-20 | Neutral |

**Best practice:**
- Rewarded video para power-ups y continue
- Interstitial solo en breakpoints naturales
- Nunca banners
- Offerwall para jugadores free-to-play hardcore

### Free-to-Paid Funnel

```
DOWNLOAD
    ↓
ONBOARDING (Day 1) → 60% retention
    ↓
SESSION 7 (Day 7) → 25% retention
    ↓
FIRST PURCHASE (Day 14-30) → 3-10% conversion
    ↓
WHALE (Day 60+) → 0.5-2% → 50-80% de revenue
```

**Primer Purchase Triggers:**
-限时优惠 (first pack, 50% off)
- Bundle con bonus visual claro
- Gacha pull exitoso (psicología del refuerzo)
- Subscription trial ($0.99 por 7 días)

---

## Metadata

- **Creado:** 2026-03-22
- **Fuentes:** Sensor Tower, App Annie, blog de ingeniería (MiHoYo, Supercell), аналитика рынка
- **Validación:** RSRCH-001 (RESEARCH_BENCHMARKS.md), RSRCH-002 (APP_TEARDOWN_PLAYBOOKS.md)
- **Próximo:** GAME-001 (convertir conceptos en vertical slices)
