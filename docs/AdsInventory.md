# TradePortal — Inventario de Publicidad

Catálogo ejecutable de formatos publicitarios, specs técnicas, caps y guardrails. Derivado de `MonetizationMap.md`.

## Formatos Disponibles

### 1. Native In-Feed

**Descripción:** Se integra naturalmente entre el contenido del feed, simulando el formato editorial.

**Especificación:**
```
┌────────────────────────────────────────────┐
│  [IMAGE 16:9]                              │
│                                            │
├────────────────────────────────────────────┤
│  [SPONSORED] · hace 2h                    │
│  Título del anuncio hasta 60 caracteres      │
│  Descripción hasta 90 caracteres...          │
│                                            │
│  [CTA Button]                             │
│  #hashtag1 #hashtag2 #hashtag3            │
└────────────────────────────────────────────┘
```

- **Dimensiones imagen:** 1200x628px (1.91:1) o 1080x1080px (1:1)
- **CTA styles:** "Saber más", "Descargar", "Unirme", "Ver ahora"
- **Colores permitidos:** máximo 2 colores accent además del brand
- **Label:** "[SPONSORED]" obligatorio en texto secundario

**Métricas:**
- Viewability mínimo: 50%
- CTR objetivo: 2-5%
- eCPM esperado: $4-8

**Caps:**
- Máximo 1 por cada 5 unidades de contenido orgánico
- Máximo 3 por sesión
- Mismo anunciante:间隔 2 horas mínimo

**Superficies:** ComunidadView, DiscoverCommunities, SignalsView

---

### 2. Banner Estándar

**Descripción:** Banner rectangular en zona fija de la pantalla.

**Especificación:**
```
┌────────────────────────────────────────────┐
│  [320x50] Banner compacto (mobile)          │
└────────────────────────────────────────────┘
```

- **Tamaños IAB estándar:** 320x50 (mobile), 728x90 (desktop), 300x250 (medium rectangle)
- **Límite de peso:** 200KB máximo
- **Animation:** máximo 15 segundos, autoplay silenciado
- **Collapse:** permite collapsed state cuando no está en viewport

**Métricas:**
- Viewability mínimo: 30%
- CTR objetivo: 0.3-0.8%
- eCPM esperado: $1-3

**Caps:**
- Sticky: solo en bottom bar, no top
- Nunca en overlay sobre contenido activo

**Superficies:** Feed, Dashboard, Academia

---

### 3. Sponsored Signal

**Descripción:** Signal que parece orgánica pero está patrocinada. Se distingue visualmente.

**Especificación:**
```
┌────────────────────────────────────────────┐
│  [⭐ SIGNAL · PATROCINADA]                  │
│  EUR/USD · COMPRA · 1.0845                │
│  TP: 1.0860 | SL: 1.0820                  │
│  Análisis breve del setup...                │
│                                            │
│  Analista: @broker_name  [Verified ✓]       │
│  Vence: 14:30 UTC                          │
│                                            │
│  [Ver análisis completo]                    │
└────────────────────────────────────────────┘
```

- **Distintivo visual:** borde dorado sutil + badge "PATROCINADA"
- **Label obligatorio:** siempre visible, parte del diseño
- **Contenido:** análisis real, no generico. Mínimo 50 caracteres de copy.
- **CTA:** linking a landing del broker/anunciante
- **No simulacro:** el análisis debe ser genuino, revisado editorialmente

**Métricas:**
- CTR objetivo: 3-8%
- eCPM esperado: $6-12

**Caps:**
- Máximo 2 por día por usuario
- No en primeras 3 señales de la sesión
- Solo brokers regulados

**Superficie:** SignalsView

---

### 4. Interstitial (Session Break)

**Descripción:** Pantalla completa que aparece en breakpoints naturales.

**Especificación:**
```
┌────────────────────────────────────────────┐
│                                            │
│       [Close X] (top-right)                │
│                                            │
│  [IMAGE/VIDEO 4:3 o 16:9]                  │
│                                            │
│  Headline hasta 40 caracteres              │
│  Subline hasta 60 caracteres               │
│                                            │
│  [CTA Button]                             │
│                                            │
│  [Skip / Learn more] (small text)         │
└────────────────────────────────────────────┘
```

- **Auto-dismiss:** 5 segundos para skip
- **Animación entrada:** fade-in 300ms
- **Animación salida:** fade-out 200ms
- **Viewability:** 100% por definición
- **Frecuencia:** máximo 1 por sesión de 30 minutos

**Métricas:**
- CTR objetivo: 5-12%
- eCPM esperado: $8-15

**Caps:**
- Solo en breakpoints: entre posts, al hacer scroll profundo, al cambiar de tab
- **Nunca:** durante checkout, durante loading, en flows de signup

**Superficies:** Dashboard, Discover, Feed (scroll profundo)

---

### 5. Rewarded Video

**Descripción:** Video que el usuario elige ver a cambio de una recompensa.

**Especificación:**
```
┌────────────────────────────────────────────┐
│                                            │
│  [VIDEO: 15-30 segundos]                  │
│  Contenido de marca                        │
│                                            │
│  Reward: +3 señales extra hoy              │
│         ó +10 XP                           │
│         ó 1 streak freeze                  │
│                                            │
│  [Ver ahora + obtener recompensa]          │
│  [No gracias]                             │
└────────────────────────────────────────────┘
```

- **Formato:** VAST 2.0 o VPAID
- **Duración:** 15-30 segundos
- **Audio:** on by default, mute toggle visible
- **Reward must be real:** no ficticio, debe canjearse
- **Opt-in obligatorio:** el usuario elige, nunca auto-play

**Métricas:**
- Viewability: 90%+
- CTR objetivo: 15-30%
- eCPM esperado: $10-20

**Caps:**
- Máximo 3 por día por usuario
- Nunca en users que ya están en trial de pago
- Cooldown: mínimo 30 minutos entre rewarded

**Superficies:** Onboarding (durante flow), Feed (botón "ver oferta"), Signals ( antes de límite), Comunidad ( antes dewall de contenido premium)

---

### 6. App Open (Mobile)

**Descripción:** Video que se muestra al reabrir la app.

**Especificación:**
```
┌────────────────────────────────────────────┐
│  TradePortal                              │
│                                            │
│  [VIDEO 15s]                              │
│  Brand message                            │
│                                            │
│  [Continue]                               │
│                                            │
│  [Learn more]                             │
└────────────────────────────────────────────┘
```

- **Trigger:** solo al reabrir app después de >30 min inactiva
- **Duración:** máximo 15 segundos
- **CTA:** "Continue" prominent, skip mínimo

**Métricas:**
- eCPM esperado: $3-6

**Caps:**
- Máximo 1 por día
- Solo para usuarios free tier

---

### 7. Branded Placement

**Descripción:** Contenido editorial creado por TradePortal con branding del anunciante.

**Ejemplo:**
```
┌────────────────────────────────────────────┐
│  🏆 Análisis Especial: EUR/USD             │
│  Presented by [Broker Logo]                │
│                                            │
│  [Contenido editorial real de analista]    │
│  ...                                      │
└────────────────────────────────────────────┘
```

- **No simulacro de post de usuario**
- **Disclosure obligatorio:** "Presentado por [Brand]"
- **Mínimo 200 palabras de contenido genuino
- **Revisión editorial:** antes de publicar

---

## Tabla Resumen de Formatos

| Formato | Viewability | CTR target | eCPM | UX Impact | Cap Principal |
|---|---|---|---|---|---|
| Native In-Feed | 50%+ | 2-5% | $4-8 | Bajo | 3/sesión |
| Banner | 30%+ | 0.3-0.8% | $1-3 | Bajo | Siempre visible |
| Sponsored Signal | 50%+ | 3-8% | $6-12 | Medio | 2/día |
| Interstitial | 100% | 5-12% | $8-15 | Alto | 1/sesión 30min |
| Rewarded Video | 90%+ | 15-30% | $10-20 | Positivo | 3/día |
| App Open | 100% | 5-10% | $3-6 | Medio | 1/día |
| Branded Placement | 60%+ | 3-6% | $8-15 | Bajo | 2/semana |

---

## Stack Técnico

### Proveedores Recomendados

| Layer | Proveedor | Alternativa |
|---|---|---|
| Mobile ads | AdMob / GAM | AppLovin MAX |
| Web ads | AdSense / GAM | Criteo |
| Video ads | DFP Video / GAM | SpotX |
| Mediation | AppLovin MAX | ironSource |
| Fraud prevention | Human Security | Adjust |

### Implementación

```
┌────────────────────────────────────────────────────────┐
│                    AD SERVER (GAM)                       │
│  Price priority: Direct > PMP > Programmatic > House    │
└────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │  AdMob     │   │ AdSense    │   │  Direct    │
   │  (mobile)  │   │  (web)     │   │  Sellers   │
   └────────────┘   └────────────┘   └────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ AppLovin  │   │  Criteo    │   │  House     │
   │  MAX      │   │            │   │  Ads       │
   └────────────┘   └────────────┘   └────────────┘
```

### Configuración de Frecuencia

```typescript
const AD_CONFIG = {
  frequencyCaps: {
    native: { maxPerSession: 3, minGapMinutes: 30 },
    banner: { alwaysOn: true, collapseOnHide: true },
    sponsoredSignal: { maxPerDay: 2, minGapHours: 6 },
    interstitial: { maxPerSession: 1, sessionMinutes: 30 },
    rewardedVideo: { maxPerDay: 3, minGapMinutes: 30 },
    appOpen: { maxPerDay: 1, inactiveMinutes: 30 },
  },
  blacklistSurfaces: ['checkout', 'payment', 'profile', 'settings', 'login'],
  viewabilityMin: { banner: 30, native: 50, interstitial: 100, rewarded: 90 },
  pricePriority: ['direct', 'pmp', 'programmatic', 'house'],
};
```

---

## Guardrails Técnicos

1. **No auto-refresh** de ads sin interacción del usuario
2. **No sequential ads** — no mostrar 2 interstitials seguidos
3. **GDPR/CCPA compliance** — consent antes de ads no-essential
4. **COPPA** — no Behavioral targeting en usuarios < 13 años
5. **Fraud detection** — invalid traffic filtering activo
6. **app-ads.txt** — обязателен para mobile inventory
7. **Sellers.json** — publicado para transparencia programática

---

## Activación por Etapa

```
FASE 1 (mes 1-2):
  - Banner en feed (prueba A/B)
  - Native in-feed (1 por cada 5 posts)
  - AdMob SDK + GAM

FASE 2 (mes 3):
  - Interstitial en breakpoints naturales
  - Sponsored signals (solo brokers regulados)
  - App open (rewards unlock)

FASE 3 (mes 4-6):
  - Rewarded video
  - Branded placements
  - Direct sales team para sponsored content
  - Programmatic via PMP
```

---

## Metadata

- **Creado:** 2026-03-22
- **Basado en:** `docs/MonetizationMap.md`, `APP_MONETIZATION_AND_ADS_COMMAND.md`
- **Próximo:** Integrar AdMob/GAM SDK cuando DAU ≥ 1,000
