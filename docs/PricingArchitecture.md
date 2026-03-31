# TradePortal — Arquitectura de Precios

Modelo de precios completo: tiers, métricas de valor, conversión y optimización. Complementa `MonetizationMap.md`.

## Tier Architecture

### Evolución de Planes

```
Free ──► Pro ──► Elite
$0     $9/mo  $29/mo
              │
              └──► Team ($50/mo)
              │
              └──► Creator ($15/mo)
```

### Free Tier — $0

**Propósito:** Adquisición y trial infinito.

| Incluido | Limitado |
|---|---|
| Feed principal | 3 señales/día |
| 1 comunidad | Ads en feed |
| Perfil básico | Sin IA |
| Exploración de comunidades | Sin analytics |
| Marketplace browsing | Sin badges premium |

**Conversión trigger:** 
-wall" suave en señales (upgrade CTA a los 3)
-Ads no intrusivos con CTA constante
-Social proof de Pro users

### Pro Tier — $9/mes

**Propósito:** Power user activo.

| Incluido | Valor percibido |
|---|---|
| Señales unlimited | Never miss an opportunity |
| 10 comunidades | Build your network |
| IA assistant | Personalized insights |
| Sin ads | Clean experience |
| Analytics básicos | Track your growth |
| Badges premium | Social credibility |
| Early access features | Feel special |

**Precio psicológico:** $9 vs $10 — el ".99" de competidores. Anchoring con Elite ($29).

### Elite Tier — $29/mes

**Propósito:** Professional trader.

| Incluido | Diferenciador vs Pro |
|---|---|
| Todo de Pro | IA avanzada (análisis profundo) |
| Unlimited comunidades | Full analytics + export |
| Priority support | SLA de respuesta |
| API access (beta) | Automation-ready |
| Custom alerts | Pro-level alerts |
| Verified badge | Authority signal |

**Precio:** $29 = 3x Pro. Ratio 3:1 intencional para empujar a Pro.

### Creator Tier — $15/mes

**Propósito:** Creator que monetiza su audiencia.

| Incluido | Diferenciador vs Elite |
|---|---|
| Todo de Elite | Creator dashboard |
| Revenue share 30% | Earn from signals |
| Community Pro builder | Build paid communities |
| Analytics avançado | Audience insights |
| Monetization tools | Unlock revenue |

### Team Tier — $50/mes

**Propósito:** Teams y organizaciones.

| Incluido | Diferenciador |
|---|---|
| 5 seats included | Share resources |
| Admin console | Manage team |
| Shared watchlists | Coordinate trades |
| Team analytics | Aggregate performance |
| SSO | Enterprise auth |
| Billing centralizado | One invoice |

**Seat adicional:** $8/seat/mes

---

## Metric-driven Pricing

### Value Metrics por Tier

| Tier | Primary VM | Secondary VM | Goal |
|---|---|---|---|
| Free → Pro | Signals viewed | Communities joined | Conv. ≥ 3% |
| Pro → Elite | Signals created | XP level | Conv. ≥ 5% |
| Free → Creator | Posts published | Followers | Conv. ≥ 1% |
| Pro → Team | Members invited | Shared activity | Conv. ≥ 2% |

### Pricing Elasticity

```
Precio: $7  → Conversion: 5.2%   → MRR: $52/unit
Precio: $9  → Conversion: 3.8%   → MRR: $68/unit  ← optimal
Precio: $11 → Conversion: 3.1%   → MRR: $68/unit
Precio: $15 → Conversion: 2.0%   → MRR: $60/unit
```

**Optimal encontrado en $9/mes para Pro tier.**

---

## Conversión Hooks

### Free → Pro

**Entry points:**
1. **Signal wall** — "3 señales vistas hoy. Upgrade to Pro for unlimited."
2. **Ad frequency bump** — después de 5 ads en una sesión
3. **Social comparison** — "See what Pro traders see →"
4. **Onboarding CTA** — paso 4 del onboarding muestra Pro benefits

**Copy que funciona:**
- "Unlock unlimited signals"
- "Trade without limits"
- "Join 10,000+ Pro traders"
- "14-day free trial"

### Free → Creator

**Entry points:**
1. **First post published** — "¿Want to earn from your analysis?"
2. **Follow milestone** — "You've reached 100 followers. Monetize them."
3. **Community creation** — "¿Ready to build a paid community?"

### Pro → Elite

**Entry points:**
1. **Analytics feature gate** — "Unlock full analytics"
2. **AI comparison** — "Compare Basic vs Advanced AI"
3. **Support speed** — "Elite members get priority support"

---

## Free Trial Strategy

### 7-Day Free Trial (Pro)

**Conditions:**
- Solo para usuarios que completaron onboarding
- Solo para usuarios con >3 sesiones
- Un trial por cuenta lifetime
- Trial activa se muestra en UI

**During trial:**
- Full Pro access
- No credit card required initially
-Reminder emails: día 2, día 5
- Upgrade CTA en dashboard

**Conversion rate objetivo:** 15-25% de trial users

### Annual Discount

- **Pro Annual:** $90/año ($7.50/mo, 17% off)
- **Elite Annual:** $276/año ($23/mo, 21% off)
- **Show savings:** "Save $18/year"

---

## Win-Back & Churn

### Churn Triggers

| Señal | Acción |
|---|---|
| 0 sesiones en 14 días | Re-engagement email |
| No signals viewed en 7 días | "We miss you" email |
| Trial ended sin upgrade | Exit survey + discount offer |
| Payment failed | Retry automático + email |

### Win-Back Offers

- **Churn 7-14 días:** "Come back — 50% off first month"
- **Churn 14-30 días:** "We fixed [feature you asked about]"
- **Churn 30+ días:** "New in Pro: [feature] — try free for 7 days"

---

## Dynamic Pricing (Futuro)

### Geography-based

| Region | Pro Price | Elite Price |
|---|---|---|
| US/UK | $9/$29 | $9/$29 |
| LATAM | $5/$15 | $5/$15 |
| SEA | $4/$12 | $4/$12 |
| Africa | $3/$10 | $3/$10 |

### Cohort-based

- Early adopters: 20% lifetime discount
- Beta users: 1 mes gratis en upgrade

---

## Metadata

- **Creado:** 2026-03-22
- **Revisión:** Mensual basada en conversión data
- **Dependencias:** MonetizationMap.md, CreatorProgram.md
