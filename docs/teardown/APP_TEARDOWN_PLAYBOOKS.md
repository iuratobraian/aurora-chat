# App Teardown Playbooks

## Propósito

Playbooks accionables derivados de teardowns de apps/plataformas de referencia. Cada playbook extrae arquitectura, patrones de engagement, monetización y lessons learned transferibles a TradePortal.

## Metodología

- Análisis: UI/UX, arquitectura, modelo de negocio, loops de engagement, stack técnico
- Validación: benchmarks públicos, docs oficiales, blog de ingeniería
- Formato: anatomy → hooks → loops → monetización → transferencia

## Índice de Playbooks

1. [Social Trading Anatomy](#1-social-trading-anatomy) — TradingView, eToro, Public.com
2. [Community Platform Anatomy](#2-community-platform-anatomy) — Discord, Circle, Mighty Networks
3. [Creator Economy Anatomy](#3-creator-economy-anatomy) — Patreon, Ghost, Substack
4. [Engagement Loop Patterns](#4-engagement-loop-patterns) — Streaks, challenges, leaderboards
5. [Monetization Architecture](#5-monetization-architecture) — Tiers, subscriptions, transaction fees

---

## 1. Social Trading Anatomy

> **Nota:** TradePortal no tiene copy trading automático. Signals son contenido editorial generado por proveedores, no réplicas automáticas de operaciones.

### TradingView

**Anatomy:**
```
┌─────────────────────────────────────────┐
│  CHART (hero) │  SOCIAL SIDEBAR         │
│  Pine Script  │  Ideas / Followers       │
│  Real-time    │  Comments / Likes        │
├─────────────────────────────────────────┤
│  SCREENER │ ALERTS │ NEWS FEED           │
└─────────────────────────────────────────┘
```

**Core Hooks:**
- Chart como entrada principal — no feed, no perfil. El chart es el producto.
- Ideas públicas como contenido — cualquier usuario puede publicar una idea
- Scoring visual: verde/rojo inmediato, P&L prominente
- Reputation por accuracy — los traders top tienen más visibilidad

**Engagement Loops:**
1. Usuario abre chart → ve ticker → sigue traders que publican sobre ese ticker
2. Trader publica idea → obtiene followers → más engagement → más ideas
3. Usuario configura alerta → recibe push → abre app → ve más contenido
4. Screener filtra → encuentra setup → opera → registra trade → comparte resultado

**Monetización:**
- Freemium: 1 chart por tab, sin indicadores avanzados
- Essential ($14.99/mo): 2 charts, indicadores básicos
- Plus ($29.99/mo): 4 charts, más indicadores, alerts ilimitados
- Premium ($59.95/mo): 8 charts, múltiples layouts, Pine Script

**Stack Técnico:**
- Charts: custom WebGL renderer
- Real-time: WebSocket para quotes
- Social: Redis + PostgreSQL
- CDN: Cloudflare para assets estáticos

**Transferencia a TradePortal:**
- Signals como "ideas" — formato corto, P&L visible, scoring por winRate
- Trust layer como reputation de TradingView
- Chart embebido para señales con link al análisis completo
- Screener de comunidades: filtrar por asset class, tamaño, régimen

---

### eToro

**Anatomy:**
```
┌──────────────────────────────────────┐
│  PORTFOLIO HERO  │  SOCIAL FEED     │
│  P&L live        │  Watchfeed        │
│  Stats del trader│  News             │
├──────────────────────────────────────┤
│  MARKETWATCH │ PEOPLE │ PORTFOLIO    │
└──────────────────────────────────────┘
```

**Core Hooks:**
- Stats públicas de cada trader: win rate, drawdown, risk score
- Popular Investor program — influencers reconocidos por la comunidad
- News feed personalizado por activos seguidos
- Follow/unfollow de traders por stats

**Engagement Loops:**
1. Usuario browsea traders → ve stats → decide seguir a uno
2. Trader compartido → comunidad ve resultado → más engagement
3. Popular Investor gana followers → sube de tier → reconocimiento
4. Trade genera profit → comunidad celebra → más engagement

**Monetización:**
- Spreads sobre transacciones (principal)
- Premium subscriptions
- CFD trading con leverage

**Transferencia a TradePortal:**
- Signals como contenido — formato corto, P&L visible, scoring por winRate
- Signal providers reconocidos por stats y engagement
- Watchlist compartida: comunidad crea watchlist colectiva por ticker
- Social proof en cada signal: historial del proveedor, engagement

---

## 2. Community Platform Anatomy

### Discord

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  SERVER LIST  │  CHANNEL TREE  │  CHAT AREA   │
│  + New Server │ Categories      │  Messages   │
│  Joined       │ #general        │  Threads     │
│               │ #announcements  │  Reactions   │
│               │ #voice          │  Embeds      │
├──────────────────────────────────────────────┤
│  MEMBER LIST  │  VOICE CHANNELS               │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Server como unidad social — cada server es una mini-comunidad
- Roles como sistema de gamificación y permisos
- Threads para discusiones extendidas dentro de un canal
- Voice channels para real-time — sin necesidad de teléfono
- Bots para automatización: mod, music, integrations

**Engagement Loops:**
1. Usuario se une a server → ve canales → participa en uno
2. Participation genera XP/roles → sube de nivel en el server
3. Server tiene Nitro boosters → perks exclusivos → más engagement
4. Evento en voice channel → real-time connection → retention

**Monetización:**
- Nitro: $9.99/mes — avatars animados, emojis animados, upload 100MB
- Server Boosting: $4.99/mes por boost — 30 boosts para perks
- SDK para games: integración con game servers

**Stack Técnico:**
- Realtime: WebSocket para mensajes
- Voice: SFU (Selective Forwarding Unit) para multi-party
- Media: CDN para uploads
- Gateway: balanceador de servidores distribuidos

**Transferencia a TradePortal:**
- Subcomunidades como "servers" temáticos
- Roles por expertise (trader, analyst, beginner) con badges visibles
- Voice rooms para debates en vivo
- Bots: alerts automáticos cuando una signal se actualiza

---

### Circle

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  SPACE FEED   │  POST AREA  │  MEMBERS       │
│  Topics list  │  Rich posts │  Online count   │
│  Recent       │  Comments   │  Role badges    │
│  Pinned       │  Reactions  │  Invite         │
├──────────────────────────────────────────────┤
│  EVENTS  │  COURSES  │  MEMBERSHIPS         │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Spaces como topics — organizan contenido por tema
- Events live como engagement real — webinars, AMAs
- Courses integrados — no es necesario salir a otra plataforma
- Membership tiers — contenido exclusivo por tier
- Analytics detallados para hosts

**Engagement Loops:**
1. Member explora space → ve post → reacciona/comenta
2. Host crea evento → miembros registran → attendance tracking
3. Member sube de tier → accede a contenido exclusivo → más value
4. Course completion → certificate/badge → gamification

**Monetización:**
- $99/mes por space (unlimited members)
- Events paid: ticketing integrado
- Courses: one-time o subscription
- Enterprise: custom branding, API

**Transferencia a TradePortal:**
- Spaces = comunidades con topic principal
- Events: sesiones semanales de trading en vivo
- Memberships: tiers de acceso (free/paid/exclusive)
- Courses: academia de trading integrada

---

## 3. Creator Economy Anatomy

### Patreon

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  CREATOR PAGE   │  TIER SELECTOR             │
│  Bio + Media    │  Benefits per tier         │
│  Posts feed     │  Pledge button              │
├──────────────────────────────────────────────┤
│  POST EDITOR  │  ANALYTICS  │  MEMBER MGMT   │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Tiers con benefits claros — cada tier tiene valor diferenciador
- Posts exclusivos como retention — no están en ningún otro lugar
- Milestones de Pledge — "Help [Creator] reach 1000 patrons"
- Member community: los patrons ven el progreso del creator
- Post reactions y comments — engagement bidireccional

**Engagement Loops:**
1. Fan explora creator → ve posts públicos → quiere más → pledge
2. Creator postea exclusivo → patrons engaged → más pledges
3. Milestone reach → reward unlock → todos celebran
4. Creator hace poll → patrons votan → sense de ownership

**Monetización:**
- Platform fee: 5-12% según plan
- Payment processing: 3-5%
- Creator keep: 85-92%

**Pricing Tiers (estándar):**
| Tier | Precio | Benefits típicos |
|------|--------|-----------------|
| Free | $0 | Public posts, follow |
| $1-5 | Basic | Behind-the-scenes |
| $5-15 | Mid | Exclusive posts, polls |
| $15-50 | High | Early access, Discord |
| $50+ | Premium | 1:1, custom perks |

**Transferencia a TradePortal:**
- Signal providers como creators con tiers
- Exclusive signals = contenido "patron-only"
- Milestone de engagement: "Ayuda a tu signal provider a alcanzar 100 seguidores"
- Community goals: colectivamente alcanzan threshold → reward para todos

---

### Ghost

**Anatomy:**
```
┌──────────────────────────────────────────────┐
│  PUBLIC SITE     │  MEMBER DASHBOARD         │
│  Posts / Paywall │  Subscribers               │
│  Landing         │  MRR, churn, engagement   │
│  Newsletter      │  Email automation          │
└──────────────────────────────────────────────┘
```

**Core Hooks:**
- Zero platform fee — el creator se queda con 100%
- Paid memberships con paywall granular: teaser + full post
- Newsletter integrada — email como retention
- Zapier + API — automatización extensiva
- Analytics de engagement: who opened, who clicked

**Monetización:**
- Software: $9-199/mes según features
- Transaction fee: 0% (usa Stripe)
- Creator keep: 100%

**Transferencia a TradePortal:**
- Análisis de newsletter: "quién abrió la signal"
- Content gating: free signals vs premium (Pro)
- Email automation: nurture sequence para nuevos miembros
- Zapier integrations: conectar signals con otros servicios

---

## 4. Engagement Loop Patterns

### Streak System (Duolingo, Snapchat, TradingView)

**Anatomy de Streak:**
```
START → action → streak +1 → reward (unlock) → next action
         ↓
    streak breaks
         ↓
    reminder / penalty
```

**Variantes:**

| App | Streak Mechanic | Reward | Penalty |
|-----|-----------------|--------|---------|
| Duolingo | Daily lesson | XP, leagues, gems | Streak freeze (paga) |
| Snapchat | Daily snap | Streak counter, trophies | Streak dies, friend can freeze |
| TradingView | Daily idea published | Badge, visibility | None (soft) |
| Reddit | Daily login | None | Lose flair, visible to others |

**TradePortal Transfer:**
- Daily login streak: 7 días = badge visible en perfil
- Streak freeze: 1 gratis por semana (Pro = unlimited)
- Collective streak: comunidad mantiene streak si 50%+ members daily active
- Prizes por streak: a mayor streak, mayor reward (early access a features)

---

### Leaderboard System

**Anatomy:**
```
┌──────────────────────────────────────┐
│  🏆 LEADERBOARD    │  PERIOD: WEEK  │
├──────────────────────────────────────┤
│  1. @trader_pro    │  +45.2%  ★★★  │
│  2. @crypto_king   │  +38.1%  ★★   │
│  3. @forex_wizard  │  +31.7%  ★    │
├──────────────────────────────────────┤
│  YOU: #127         │  +12.3%        │
│  ▓▓▓▓░░░░░░░░░░░  │  Next: #100   │
└──────────────────────────────────────┘
```

**Design Patterns:**
- Position + delta: no solo ranking, también cambio
- Visible tier: top 3 con badges especiales
- Self-anchoring: siempre muestro "tú estás aquí"
- Progress to next: cuánto falta para superar al de arriba
- Period flexibility: daily, weekly, monthly, all-time

**TradePortal Transfer:**
- Signals leaderboard: top signal providers por winRate
- Communities leaderboard: top comunidades por engagement
- Referral leaderboard: top referrers por nuevos miembros
- Reward: top 10 obtienen "Pro" gratis por período

---

### Challenge System

**Anatomy:**
```
┌──────────────────────────────────────┐
│  ⚡ CHALLENGE: 7-Day Trading Streak │
│  ▓▓▓▓▓░░░░ 5/7 días                 │
├──────────────────────────────────────┤
│  Reward: 🎖️ 7-Day Warrior Badge     │
│  Reward: 💎 100 XP Bonus             │
└──────────────────────────────────────┘
```

**Variantes por Tipo:**

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| Volume | Haz X operaciones | "Trade 10x esta semana" |
| Streak | X días consecutivos | "7 días de login" |
| Quality | Completa acción específica | "Publica 3 signals con análisis" |
| Social | Interactúa con otros | "Comenta en 5 posts" |
| Referral | Trae nuevos usuarios | "Refer 3 amigos" |

**TradePortal Transfer:**
- Newcomer challenge: 3 signals vistas, 1 comentario, 1 share
- Engagement challenge: 7 días seguidos de actividad
- Creator challenge: "Ayuda a tu comunidad a crecer"
- Trading challenge: "Cierra la semana en verde"

---

## 5. Monetization Architecture

### Subscription Tiers (estándar)

**Anatomy:**
```
┌─────────────────────────────────────────────────────┐
│  TIER    │  FREE    │  PRO ($9)  │ ELITE ($29)     │
├─────────────────────────────────────────────────────┤
│  Signals │  3/day   │  Unlimited │ Unlimited + AI   │
│  Posts   │  View    │  Create   │ Create + Pin     │
│  Comms   │  Join    │  Create  │ Private          │
│  Charts  │  Basic   │  Advanced │ Full + Alerts    │
│  Support │  Community│ Priority │ 1:1              │
└─────────────────────────────────────────────────────┘
```

**Diseño de Tiers:**
- Free: "try before you buy" — suficiente para ver valor
- Pro: "power user" — todo lo que un trader activo necesita
- Elite: "professional" — herramientas de análisis avanzado, soporte directo
- Enterprise: (B2B) — white label, API, SLA

**Key Principles:**
- Anchor pricing: el plan del medio parece mejor (Anchoring Bias)
- Annual discount: 20-30% off por prepago anual
- Trial: 7-14 días gratis para Pro/Elite
- Feature gating, no content gating: siempre se ve el contenido, no se bloquea

---

### Transaction-Based Revenue

**Modelos:**

| Modelo | Ejemplo | Fee | Ventaja |
|--------|---------|-----|---------|
| Spread | eToro | 0.1-0.5% | Volumen alto = ingreso alto |
| Commission | Binance | 0.1% | Predecible |
| Subscription | TradingView | fixed | predecible, escalable |

**TradePortal Model:**
- Signals free: 3/día, ads included
- Signals Pro: unlimited, $9/mes — subscription predecible
- Referral: $5 por amigo que hace upgrade — acquisition de bajo costo

---

### Freemium Conversion Hooks

**Anatomy de Funnel:**
```
VISITOR → Free tier → Aha moment → Conversion
    ↓
  87% churn
    ↓
  13% upgrade
```

**Aha Moments identificados:**

| App | Aha Moment | Tiempo |
|-----|-----------|--------|
| Spotify | 10 songs liked | ~1 día |
| Notion | First block created | ~5 min |
| Duolingo | First streak | ~1 día |
| TradingView | First idea published | ~1 semana |
| Patreon | First exclusive post seen | ~1 semana |

**TradePortal Aha Moments:**
1. Primera signal vista con análisis completo → "wow, esto es útil"
2. Primera comunidad seguida → "hay gente这么想 como yo"
3. Primera interacción (comentario/seguimiento) → "esto es social"
4. Primera alerta configurada → "puedo monitorear sin estar pegado"

---

## Metadata

- **Creado:** 2026-03-21
- **Fuentes:** TradingView, eToro, Discord, Circle, Patreon, Ghost, análisis propios
- **Validación:** benchmarks públicos, RSRCH-001 (RESEARCH_BENCHMARKS.md)
- **Próximo:** RSRCH-003 (Game Teardown)
