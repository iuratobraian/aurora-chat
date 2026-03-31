# Social Growth Suite — Master Spec

Spec ejecutable para la app de gestión de cuentas de redes sociales con growth, automatización y monetización. Derivado de `SOCIAL_ACCOUNT_GROWTH_APP_PLATFORM.md`.

## Concepto

**"Gestiona todas tus redes. Crece sin ser banned. Monetiza sin perder tiempo."**

### Disclaimer

> Automation debe cumplir con Terms of Service de cada plataforma. La app proporciona herramientas de gestión, no hacking o bot abuse. El usuario es responsable del uso.

---

## Producto

### Job-to-be-done

> "Tengo 5 cuentas de redes y perder horas publicando, respondiendo y analizando. Quiero una sola app que maneje todo y me diga qué está funcionando."

### Propuesta de valor

| Para quién | Quiere | Damos | Sin |
|---|---|---|---|
| Creator LATAM | Gestionar cuentas trading | 1 app para todo | Multi-tab chaos |
| Social media manager | Escalabilidad | Multi-cuenta | Baneo |
| Brand | Consistency | Calendar + automation | Errores manuales |
| Agency | Control total | Dashboard + analytics | Sobrecosto |

---

## Módulos

### 1. Account Workspace

Gestión centralizada de cuentas conectadas:

```typescript
interface SocialAccount {
  id: string;
  platform: 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';
  username: string;
  profilePicture: string;
  
  // Stats
  followers: number;
  following: number;
  posts: number;
  engagementRate: number;
  
  // Health
  status: 'active' | 'suspended' | 'needs_attention';
  lastPostDate: number;
  healthScore: number;          // 0-100
  
  // Credentials (encrypted)
  accessToken: string;           // nunca expuesta al frontend
  tokenExpiresAt: number;
  
  // Connection
  connectedAt: number;
  lastSyncAt: number;
}
```

### 2. Content Factory

Generación de contenido asistida por IA:

```typescript
interface ContentBrief {
  id: string;
  accountId: string;
  
  topic: string;
  hook: string;
  body: string;
  cta?: string;
  
  media: {
    type: 'image' | 'video' | 'carousel';
    assets: string[];
  };
  
  hashtags: string[];
  
  scheduledFor?: number;
  publishedAt?: number;
  
  status: 'idea' | 'draft' | 'scheduled' | 'published' | 'failed';
}

interface ContentTemplate {
  id: string;
  name: string;
  platform: SocialAccount['platform'];
  structure: {
    hook: string;    // "3 errores con [tema]"
    body: string;    // "[contenido]"
    cta?: string;
    hashtags: string[];
  };
  variables: string[];  // [tema, resultado]
}
```

**AI Features:**
- Generate hook + body desde topic
- Suggest hashtags
- Generate variations A/B
- Adaptar copy por platform
- Generate hashtags por trending topics

### 3. Calendar & Publishing

Calendario visual + scheduling:

```typescript
interface ScheduledPost {
  id: string;
  accountId: string;
  content: ContentBrief;
  
  scheduledFor: number;
  publishedAt?: number;
  
  platformOptimized: {
    [platform: string]: {
      hook: string;
      body: string;
      hashtags: string[];
    };
  };
  
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  
  // Cross-post
  crossPostGroup?: string;
}

interface CalendarView {
  date: string;
  posts: ScheduledPost[];
  totalPosts: number;
  topPerformers: string[];
}
```

### 4. Automation Engine

Automatizaciones que no rompen TOS:

```typescript
type AutomationType = 
  | 'auto_comment'    // Responder a comentarios con keywords
  | 'auto_dm'         // DM a nuevos followers
  | 'auto_like'       // Dar like a posts con keywords
  | 'auto_follow'     // Seguir cuentas target
  | 'content_recycle' // Re-publicar contenido top
  | 'dm_sequence';    // Secuencia de DMs por trigger

interface Automation {
  id: string;
  accountId: string;
  
  type: AutomationType;
  enabled: boolean;
  
  config: AutomationConfig;
  
  // Safety
  dailyLimit: number;
  currentCount: number;
  pausedUntil?: number;
  
  // Stats
  runs: number;
  lastRunAt: number;
  successRate: number;
}

interface DMConfig extends AutomationConfig {
  trigger: 'new_follower' | 'dm_received' | 'keyword' | 'scheduled';
  template: string;
  delayMinutes: number;
  maxPerDay: number;
}

interface AutoCommentConfig extends AutomationConfig {
  keywords: string[];
  responseTemplates: string[];
  maxPerDay: number;
  avoidDuplicates: boolean;
}
```

**Safety features:**
- Daily limits configurables por automation
- Randomized delays
- Natural language variation
- Pause on warning from platform
- Never proxy-like behavior

### 5. Analytics

Métricas de growth y engagement:

```typescript
interface AccountAnalytics {
  accountId: string;
  period: { start: string; end: string };
  
  followers: {
    start: number;
    end: number;
    gained: number;
    lost: number;
    netGrowth: number;
    growthRate: number;
  };
  
  engagement: {
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    avgSave: number;
    engagementRate: number;
  };
  
  content: {
    totalPosts: number;
    topPost: PostStats;
    worstPost: PostStats;
    bestTime: string;
    bestDay: string;
  };
  
  reach: {
    impressions: number;
    accountsReached: number;
    impressionsRate: number;
  };
  
  leads: {
    bioLinkClicks: number;
    dmsReceived: number;
    profileVisits: number;
  };
}

interface PostStats {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  engagementRate: number;
}
```

### 6. Monetization Layer

Tracking de revenue desde redes:

```typescript
interface MonetizationSource {
  accountId: string;
  platform: string;
  
  type: 'affiliate' | 'sponsored' | 'product' | 'service' | 'subscription';
  
  // Tracking
  link: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  
  // Earnings
  totalEarned: number;
  pendingPayout: number;
}

interface EarningsDashboard {
  period: { start: string; end: string };
  
  totalRevenue: number;
  totalClicks: number;
  totalConversions: number;
  avgConversionRate: number;
  
  bySource: MonetizationSource[];
  byAccount: Record<string, number>;
  
  projections: {
    thisMonth: number;
    thisYear: number;
  };
}
```

---

## Pantallas

### P0 — MVP

1. **Dashboard** (`/`) — Overview: accounts, today's posts, alerts
2. **Accounts** (`/accounts`) — Lista + conectar nueva
3. **Calendar** (`/calendar`) — Vista semanal/mensual de posts
4. **Content Factory** (`/create`) — Generar + schedule
5. **Analytics** (`/analytics`) — Métricas por account
6. **Automations** (`/automation`) — Config de automatizaciones
7. **Settings** (`/settings`) — Cuenta, billing, integrations

### P1

- Monetization tracking
- Team collaboration
- CRM de leads
- Advanced analytics

### P2

- AI content generation completo
- A/B testing
- White label para agencies

---

## Modelo de Negocio

| Tier | Precio | Accounts | Automations | AI Credits |
|---|---|---|---|---|
| **Starter** | $0 | 1 | 0 | 10/month |
| **Creator** | $9/mes | 3 | 5 | 100/month |
| **Pro** | $29/mes | 10 | 20 | 500/month |
| **Agency** | $79/mes | 50 | 100 | 2000/month |

### Revenue adicional

- AI content packs: $5/mes
- Extra accounts: $3/cuenta/mes
- Team seats: $5/seat/mes

---

## Arquitectura

### Stack

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React)                                 │
│  - Dashboard, Calendar, Analytics, Content Factory       │
│  - Vercel deployment                                      │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  CONVEX (Backend)                                        │
│  - Accounts & credentials (encrypted)                    │
│  - Content drafts & calendar                             │
│  - Analytics storage                                      │
│  - Automation state                                       │
│  - Earnings tracking                                       │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  PUBLISHING RELAY (Express)                               │
│  - Platform API integrations (Instagram, Twitter, etc.)   │
│  - OAuth flows                                            │
│  - Scheduling queue                                       │
│  - Rate limiting & proxy rotation                         │
│  - Railway deployment                                      │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  PLATFORM APIs                                            │
│  - Instagram Graph API                                    │
│  - Twitter API v2                                        │
│  - TikTok API                                            │
│  - LinkedIn API                                          │
└─────────────────────────────────────────────────────────┘
```

### Platform Integration

**Instagram:** Instagram Graph API + Basic Display API
**Twitter/X:** Twitter API v2 (Basic tier minimum)
**TikTok:** TikTok API (if available) / unofficial with risks
**LinkedIn:** LinkedIn Marketing API

> **Nota:** La app usa APIs oficiales de cada plataforma. Las credenciales se almacenan encriptadas. OAuth tokens se refresh automáticamente.

---

## Seguridad y Compliance

- OAuth 2.0 para todas las conexiones
- Tokens encriptados en storage
- Nunca se almacenan passwords de usuario
- Rate limiting por platform API limits
- Audit log de todas las acciones
- GDPR compliance para data

---

## Roadmap

### Fase 1 — Core (4-6 semanas)
- [ ] OAuth connections (Instagram + Twitter)
- [ ] Content Factory con AI
- [ ] Calendar básico
- [ ] Analytics básico
- [ ] Starter + Creator tiers

### Fase 2 — Automation (3-4 semanas)
- [ ] DM automation
- [ ] Comment automation
- [ ] Safety limits
- [ ] Pro tier

### Fase 3 — Monetization (3-4 semanas)
- [ ] Link tracking
- [ ] Earnings dashboard
- [ ] Revenue projections
- [ ] Agency tier

### Fase 4 — Scale (4-6 semanas)
- [ ] TikTok + LinkedIn
- [ ] Team collaboration
- [ ] White label
- [ ] API access

---

## Métricas

| Métrica | Target | Descripción |
|---|---|---|
| Accounts connected | 500/month | Cuentas conectadas |
| Posts scheduled | 5,000/month | Posts programados |
| Automations active | 1,000 | Automatizaciones corriendo |
| Revenue per user | $15 ARPU | Revenue promedio |
| Retention (Pro+) | >75% | Suscriptores activos |

---

## Diferenciación vs Competidores

| Competidor | Lo que les falta | Ventaja nuestra |
|---|---|---|
| Buffer | Sin AI, analytics basic | AI content + mejor analytics |
| Later | Solo scheduling | Automation + monetization |
| Hootsuite | Caro, complejo | Más simple, LATAM focus |
| Metricool | Sin automation | Automation + AI |

---

## Metadata

- **Creado:** 2026-03-22
- **Basado en:** `.agent/skills/apps/SOCIAL_ACCOUNT_GROWTH_APP_PLATFORM.md`
- **Stack:** Vite + React + Convex + Express + Platform APIs
- **Revisión:** Pre-alpha
