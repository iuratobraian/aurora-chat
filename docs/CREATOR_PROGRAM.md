# Creator & Ambassador Program - TradePortal

## Overview

Programa de creadores y embajadores para expandir el alcance de TradePortal a través de influencers del nicho trading/finance en LATAM y global.

## Objetivos

1. **Crecimiento**: Adquirir usuarios de calidad vía creators
2. **Credibilidad**: Posicionar la marca con voces de autoridad
3. **Contenido**: Generar contenido auténtico sobre la plataforma
4. **Community**: Construir red de embajadores

---

## Programa de Creadores

### Tiers

| Tier | Seguidores | Beneficios | Requirements |
|------|------------|------------|--------------|
| **Bronze** | 1K-10K | Early access, badge, 10% referral | 1 post/mes |
| **Silver** | 10K-50K | Todo + exclusive content, 15% referral | 2 posts/mes |
| **Gold** | 50K-200K | Todo + beta features, swag, 20% referral | 4 posts/mes |
| **Platinum** | 200K+ | Todo + dedicated support, events, 25% referral | 8 posts/mes |

### Beneficios por Tier

**Bronze:**
- Early access a features
- Creator badge en profile
- 10% revenue share en referrals
- Invitación a community Discord

**Silver:**
- Todos los beneficios Bronze
- Contenido exclusivo para creators
- 15% revenue share
- Monthly newsletter
- Acceso a webinars

**Gold:**
- Todos los beneficios Silver
- Merchandise (stickers, swag)
- 20% revenue share
- Early access a launches
- Invitación a eventos exclusivos

**Platinum:**
- Todos los beneficios Gold
- Dedicated account manager
- 25% revenue share
- Custom content (co-created)
- Invitación a TradePortal Summit
- Revenue mínimo garantizado (negociable)

---

## Programa de Embajadores

### Definición
Embajadores son miembros activos de la comunidad que:
- Promueven TradePortal orgánicamente
- Ayudan a nuevos usuarios
- Generan contenido educativo
- Participan en feedback de producto

### Niveles

| Nivel | XP | Beneficios |
|-------|-----|------------|
| **Rookie** | 0-1000 | Badge básico |
| **Advocate** | 1000-5000 | + early access, swag |
| **Champion** | 5000-20000 | + dedicated support, events |
| **Legend** | 20000+ | + personalizada, revenue share |

### Actividades Recompensadas

| Actividad | XP | Descripción |
|-----------|-----|-------------|
| Referral exitoso | 500 | Usuario que se registra y activa |
| Post sobre TradePortal | 200 | Contenido auténtico |
| Help en comunidad | 50 | Responder preguntas |
| Bug report validado | 300 | Reporte que resulta en fix |
| Feature request | 100 | Sugerencia implementada |
| Webinar como speaker | 500 | Participar como invitado |

---

## Proceso de Onboarding

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  APLICACIÓN │────▶│  EVALUACIÓN  │────▶│  ONBOARDING │────▶│  ACTIVO  │
│  (form)     │     │  (review)    │     │  (welcome)  │     │  (tiers) │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

### 1. Aplicación
- Formulario con info de contacto
- Perfiles sociales
- Canal de audience principal
- Niche/market
- Por qué quiere ser creator

### 2. Evaluación
- Review de engagement real
- Fit con marca
- Historial de contenido
- Audience demographics

### 3. Onboarding
- Welcome email
- Access a creator portal
- Introduction a assigned manager
- Kit de marca (logos, guidelines)
- Orientation call (Silver+)

### 4. Activo
- Acceso a dashboard de performance
- Comisiones tracking
- Contenido suggestions
- Feedback loops

---

## Dashboard de Creator

### Métricas Disponibles

```typescript
interface CreatorDashboard {
  profile: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: number;
    pendingPayout: number;
  };
  performance: {
    postsCreated: number;
    engagementRate: number;
    clicksGenerated: number;
    conversions: number;
  };
  commissions: {
    total: number;
    thisMonth: number;
    pending: number;
    history: Transaction[];
  };
  leaderboard: {
    rank: number;
    tierRank: number;
  };
}
```

### API Endpoints

```typescript
// Get creator profile
GET /api/creator/profile

// Get referral stats
GET /api/creator/referrals

// Get commissions
GET /api/creator/commissions

// Get leaderboard
GET /api/creator/leaderboard
```

---

## Sistema de Comisiones

### Modelo

```
Revenue Share = Base (tier) + Bonus (performance)

Ejemplo:
- Bronze: 10% base
- Silver: 15% base
- Gold: 20% base
- Platinum: 25% base
```

### Bonus Trimestral

| Condición | Bonus |
|-----------|-------|
| Top 10% referrals | +5% |
| >50% engagement growth | +3% |
| Content contest winner | +2% |

### Payout Schedule

| Método | Mínimo | Frecuencia |
|--------|--------|------------|
| PayPal | $25 | Mensual |
| Wire | $500 | Mensual |
| Crypto | $50 | Quincenal |
| Store Credit | $10 | Inmediato |

---

## Content Requirements

### Posting Guidelines

| Tier | Posts/Mes | Min Engagement | Formato |
|------|-----------|----------------|---------|
| Bronze | 1 | 100 likes | Stories o post |
| Silver | 2 | 500 likes | 1 Reel/Video |
| Gold | 4 | 2000 likes | 2 Reels + 2 posts |
| Platinum | 8 | 5000 likes | Mix de formatos |

### Content Types Aceptados

- Tutoriales de trading
- Reviews honestos
- Lifestyle trading
- Market analysis
- Success stories
- Behind the scenes

### Content NO Permitido

- Promesas de ganancias garantizadas
- Contenido engañoso
- Ataques a competidores
- Contenido político/controversial
- Spam o contenido irrelevante

### Hashtags Recomendados

```
#TradePortal
#TradingCommunity
#[Niche] e.g., #ForexLatam
#TradingTips
#DayTrading
```

---

## Programas de Embajadores - Rewards

### Achievement Badges

| Badge | Descripción | XP Requerido |
|-------|-------------|--------------|
| 🏅 Rookie | Nuevo miembro | 0 |
| 🎖️ Bronze Advocate | Apoyo consistente | 1,000 |
| ⚔️ Silver Champion | Activo y helpful | 5,000 |
| 👑 Gold Legend | Top contributor | 20,000 |
| 💎 Diamond | El mejor de la comunidad | 50,000 |

### Leaderboards

- **Weekly**: Top 10 referrers
- **Monthly**: Top 5 content creators
- **Quarterly**: Legends dinner (Platinum)

---

## Scripts Disponibles

```typescript
// Creator evaluation
import { qualifyCreator, calculateCommission } from './scripts/marketing/creatorProgram';
```

---

## Métricas de Éxito

| Métrica | Target | Medición |
|---------|--------|----------|
| Creators activos | >50/mes | Dashboard |
| Revenue share payout | >$10K/mes | P&L |
| New users from creators | >20% | Analytics |
| Engagement rate | >3% | Social |
| Retention 30d creators | >70% | Cohort |

---

## Casos de Éxito

### Creator: @TradingLatam
- Seguidores: 45K
- Tier: Silver
- Posts/mes: 3
- Conversiones: 120
- Earnings: $450/mes

### Creator: @CryptoJuan
- Seguidores: 180K
- Tier: Gold
- Posts/mes: 6
- Conversiones: 450
- Earnings: $1,800/mes

---

## Tools

- [ ] Creator portal (en desarrollo)
- [ ] Referral tracking link generator
- [ ] Content calendar template
- [ ] Brand assets kit
- [ ] Affiliate dashboard

---

## Contacto

- Email: creators@tradeportal.app
- Discord: #creators-channel
- Support: creators-support@tradeportal.app
