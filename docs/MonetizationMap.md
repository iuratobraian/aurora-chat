# TradePortal — Mapa de Monetización

Mapa ejecutable de todas las capas de ingreso de TradePortal, por superficie, formato y tier. Derivado de `APP_MONETIZATION_AND_ADS_COMMAND.md`.

## Superficies y Monetización

| Superficie | Free Tier | Pro Tier | Creator Tier | Business Tier |
|---|---|---|---|---|
| **Feed (ComunidadView)** | Ads nativos en scroll | Sin ads | Creator sponsors | — |
| **Signals (SignalsView)** | 3 señales/día | Unlimited | Señales propias | API signals |
| **Dashboard** | Ads + upsell | Sin ads | Analytics básico | Analytics avanzado |
| **Discover** | Feed + ads | Feed premium | Featured placement | — |
| **Academia** | Cursos free | Cursos Pro | Revenue share cursos | Team training |
| **Perfil** | Perfil básico | Perfil completo | Perfil Pro + stats | — |
| **Comunidades** | Comunidad free | Comunidad Pro | Creador de comunidad | Enterprise community |
| **Marketplace** | Browsing | Featured listings | Seller Pro | Marketplace B2B |
| **Juegos** | Juegos free | Juegos Pro | — | — |
| **Checkout** | — | — | — | Checkout fee |
| **PropFirms** | — | — | — | Affiliate rev share |
| **ExpertAdvisors** | — | — | EA marketplace | EA enterprise |

---

## Capa 1: Suscripciones

### Planes Actuales (PricingView)

| Plan | Precio | Señales | Comunidades | IA | Ads |
|---|---|---|---|---|---|
| Free | $0 | 3/día | 1 | No | Sí |
| Pro | $9/mes | Unlimited | 10 | Sí | Reducidos |
| Elite | $29/mes | Unlimited + AI | Unlimited | Sí + avanzada | No |

### Evolución de Tiers

```
Free ──$9/mes──► Pro ──$20/mes──► Elite
  │              │               │
  │              │               └── Team ($50/mes)
  │              │
  │              └── Creator ($15/mes)
  │
  └── Sponsored (cero para usuarios traídos por creators)
```

---

## Capa 2: Publicidad In-App

Ver `docs/AdsInventory.md` para formatos detallados.

### Principios

1. **Nunca romper flujos críticos**: signup, checkout, signals
2. **Frecuencia caps por formato**: máximo X anuncios por sesión
3. **Segmentación por contexto**: ads relevantes al contenido de la superficie
4. **Progresión**: menos ads conforme el usuario avanza en el funnel
5. **Medición**: eCPM, fill rate, CTR, conversion a paid por superficie

### Inventory por Superficie

| Superficie | Formato | Frecuencia | eCPM Esperado | Cap |
|---|---|---|---|---|
| Feed (ComunidadView) | Native In-Feed | Cada 5 posts | $4-8 | 3/sesión |
| Feed (ComunidadView) | Banner | Sticky bottom | $1-3 | Siempre visible |
| Signals (SignalsView) | Sponsored Signal | Cada 8 signals | $6-12 | 2/día |
| Discover Communities | Card ads | En grid | $3-6 | 2/sesión |
| Dashboard | Interstitial dismissible | Cada 3 scrolls | $8-15 | 1/día |
| Academia | Banner | Sticky | $2-4 | Siempre visible |
| Marketplace | Native listing | En browse | $5-10 | 5/día |
| Login/Onboarding | Rewarded video | — | $10-20 | Ilimitado (opt-in) |
| Checkout | NONE | — | — | Bloqueado |
| Profile | NONE | — | — | Bloqueado |

### Guardrails de Publicidad

- **Daily cap por usuario**: máximo 10 ads/usuario/día en free tier
- **Session cap**: máximo 3 ads por sesión de 30 minutos
- **Cool-down**: mismo advertiser no puede aparecer 2 veces en 2 horas
- **Blacklist surfaces**: checkout, profile, settings, payment screens
- **Frequency capping**: 1 impresión por usuario por creativo cada 24h
- **Anti-fraude**: Viewability mínimo 50%, verificar humanos

---

## Capa 3: Marketplace y Commisiones

### Marketplace (MarketplaceView)

| Tipo | Fee | Descripción |
|---|---|---|
| Listado de curso | $5/listado | Publicar curso en marketplace |
| Venta de curso | 15% comisión | TradePortal se queda 15% |
| Suscripción de servicio | 10% comisión | Mensual de creators |
|EA (Expert Advisors) | 20% comisión | Venta de robots de trading |

### Rev-Share con Prop Firms

- Commission share por usuario referido que abre cuenta
- **Rev share típico**: 10-30% del spread generado
- Estructura: CPA + rev share híbrido

---

## Capa 4: Creator Monetization

(Coincide con `docs/CREATOR_PROGRAM.md`)

| Revenue Stream | Split TradePortal | Split Creator |
|---|---|---|
| Señales Pro propias | 70% | 30% (creator) |
| Cursos propios | 85% | 15% |
| Comunidad privada Pro | 80% | 20% |
| Tips / propinas | 90% | 10% |
| Sponsored post | 50% | 50% |
| Affiliate links | Variable | 70-90% |

---

## Capa 5: B2B & Ad Solutions

### Sponsored Communities

- Marca paga por comunidad dedicada
- Contenido moderado por TradePortal
- Mínimo: $500/mes

### Performance Campaigns

- Paga por conversión (registro, upgrade)
- CPC: $0.50-2.00 según nicho
- CPA: $5-20 según calidad de usuario

### Sponsored Signals

- Broker paga por aparecer como signal top
- Formato: "Signal patrocinada por [Broker]"
- Mínimo: $1,000/mes

### Lead Generation

- Qualificación de leads para brokers/education platforms
- CPL: $10-50 según calidad

---

## Capa 6: Data & Intelligence

| Producto | Precio | Descripción |
|---|---|---|
| API de señales | $99/mes | Acceso programático a signals |
| Research reports | $29/mes | Análisis semanal de mercados |
| Benchmarking tools | $49/mes | Comparar performance |
| Custom data feeds | Custom | Según necesidad |

---

## Capa 7: Eventos y Educación

| Producto | Precio | Formato |
|---|---|---|
| Webinar individual | $50 | 1 hora con Q&A |
| Bootcamp semanal | $199/mes | 4 sesiones + materials |
| Mastermind mensual | $500/mes | Grupo de 20, 4 calls |
| Certificación | $299 | Examen + badge |

---

## Modelo de Capas — Revenue Mix Objetivo

| Fuente | % Objetivo | Etapa |
|---|---|---|
| Suscripciones (Pro/Elite) | 50% | Ahora |
| Creator monetization | 20% | 6 meses |
| Publicidad in-app | 15% | 3 meses |
| Marketplace & rev share | 10% | 12 meses |
| B2B & events | 5% | 18 meses |

**No depender de una sola fuente > 60%.**

---

## Métricas Clave por Capa

| Capa | KPI Principal | KPI Secundario |
|---|---|---|
| Suscripciones | MRR, conversion rate, churn | ARPPU, LTV |
| Publicidad | eCPM, fill rate, viewability | CTR, conversion a paid |
| Creator | GMV, # creators activos | ARPPU creator, retention |
| Marketplace | GMV, take rate | # sellers, repeat buyers |
| B2B | Pipeline, close rate | CAC, LTV B2B |

---

## Orden de Implementación

```
FASE 1 (mes 1-2): Suscripciones existentes + ads básicos
  └── Activar ads en feed, signals, discover
  └── Optimizar pricing tiers
  └── Medir eCPM por superficie

FASE 2 (mes 3-4): Creator monetization
  └── Activar creator tiers
  └── Revenue share de señales
  └── Marketplace básico

FASE 3 (mes 5-6): B2B y sponsors
  └── Sponsored communities
  └── Performance campaigns
  └── API tier

FASE 4 (mes 7-12): Expansión
  └── Marketplace completo
  └── Data products
  └── Eventos
```

---

## Guardrails Generales

1. **Retención primero**: no monetizar antes de D7 retention ≥ 30%
2. **Surface test**: validar ad format en superficie 1 semana antes de escalar
3. **Churn watch**: si ads impactan churn > 5%, revert immediately
4. **Diversificación**: ninguna fuente > 60% del revenue total
5. **Clean room**: no mezclar datos de pago con datos de ads
6. **Opt-in rewarded**: solo rewarded video como ads invasivo, siempre opt-in

---

## Metadata

- **Creado:** 2026-03-22
- **Basado en:** `.agent/skills/apps/APP_MONETIZATION_AND_ADS_COMMAND.md`
- **Surfaces identificadas:** 12 superficies con modelos de monetización únicos
- **Revisión:** Trimestral
