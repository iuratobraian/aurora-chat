# Website Factory — Top 10 Specs

Specs ejecutables de las 10 ideas priorizadas de `HUNDRED_WINNING_WEBSITE_IDEAS.md`. Cada spec: promesa, audiencia, sitemap, monetización, stack y risk.

## Selección

| # | Idea | Score | Justificación |
|---|---|---|---|
| 1 | Academia con comunidad + IA | ⭐⭐⭐⭐⭐ | Alto alineamiento con stack, alto valor |
| 2 | Comunidad para traders | ⭐⭐⭐⭐⭐ | Core del negocio existente |
| 3 | Plataforma de señales verificadas | ⭐⭐⭐⭐⭐ | Diferenciador claro |
| 4 | Plataforma de educación financiera | ⭐⭐⭐⭐ | Mercado grande en LATAM |
| 5 | Plataforma de memberships creators | ⭐⭐⭐⭐ | Creator economy en expansión |
| 6 | Media hub de análisis financiero | ⭐⭐⭐⭐ | Contenido como acquisition |
| 7 | Plataforma de templates por prompt | ⭐⭐⭐⭐ | AI-native, diferenciador |
| 8 | Suite de analítica para comunidades | ⭐⭐⭐ | Analytics como servicio |
| 9 | Plataforma de sponsorship matching | ⭐⭐⭐ | Mercado B2B valioso |
| 10 | Sitemap generator + website builder | ⭐⭐⭐⭐ | Producto propio de la factory |

---

## SPEC-01: EduTrade — Academia con Comunidad + IA

### Promesa

"Aprende trading con una comunidad real y asistentes IA que te guían paso a paso."

### Audiencia

- Traders principiantes en LATAM (18-35 años)
- Personas que buscan ingresos pasivos
- Profesionales interesados en mercados financieros

### Modelo de Negocio

- Freemium: cursos free + comunidad free
- Pro ($9/mes): cursos avanzados, IA coach, sin ads
- Marketplace: cursos de terceros (15% comisión)

### Sitemap

```
/ (Landing — promesa + social proof)
/academia (Catálogo de cursos)
/curso/[slug] (Contenido del curso)
/comunidad (Feed social + debates)
/perfil/[user] (Perfil + progreso)
/ia-coach (Asistente IA conversacional)
/pricing (Planes Pro)
/dashboard (Pro only — progreso + next steps)
```

### Páginas Clave

| Página | Objetivo | CTA Principal |
|---|---|---|
| Landing | Captar + registrar | "Empezar gratis" |
| Academia | Browse cursos | "Ver curso" |
| Comunidad | Engagement | "Unirme" |
| IA Coach | Demostrar valor IA | "Probar IA" |
| Pricing | Convertir | "Upgrade a Pro" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex (DB + Auth)
- Relay: Express (webhooks)
- AI: GPT-4o / Claude para coach
- Payments: MercadoPago

### Risk

- **Alto**: Dependencia de contenido de calidad (resolver: curation + UGC)
- **Medio**: IA puede dar información financiera incorrecta (resolver: disclaimer + sources)

### Growth

- SEO: "curso trading gratis", "aprender forex"
- Content: blog con análisis semanal
- Community: referral de usuarios existentes

---

## SPEC-02: TradeHub Community — Comunidad para Traders

### Promesa

"La comunidad de traders más activa de LATAM. Comparte ideas, sigue analistas y crece junto a otros."

### Audiencia

- Traders activos (todos los niveles)
- Inversores en forex, crypto, acciones
- Personas buscando señales y análisis

### Modelo de Negocio

- Free: comunidad básica + señales limitadas
- Pro ($9/mes): señales unlimited, analytics, sin ads
- Creator ($15/mes): crear comunidad propia, monetizar
- Marketplace: servicios de traders (20% comisión)

### Sitemap

```
/ (Landing)
/comunidades (Discovery)
/comunidad/[slug] (Feed de comunidad)
/señales (Lista de señales)
/señal/[id] (Detalle de señal)
/analista/[user] (Perfil + historial)
/pricing
/dashboard
/creator (Para creadores)
```

### Páginas Clave

| Página | Objetivo | CTA |
|---|---|---|
| Landing | Registro | "Unirme a la comunidad" |
| Comunidades | Discovery | "Ver comunidad" |
| Señales | Engagement | "Ver señal" |
| Analista | Trust | "Seguir" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex (real-time feeds)
- Relay: Express (OAuth, webhooks)
- AI: AI relay para resumen de señales
- Payments: MercadoPago

### Risk

- **Medio**: Señales pueden ser irresponsables (resolver: disclaimer + risk score visible)
- **Medio**: moderation de contenido (resolver: report system + mod tools)

### Growth

- SEO: "comunidad trading", "señales forex"
- Viral: compartir señales = referral orgánico
- Creators: ambassadors que traen su audiencia

---

## SPEC-03: SignalVault — Plataforma de Señales Verificadas

### Promesa

"Señales de trading auditadas y verificadas. Verifica el historial real de cada proveedor antes de seguirlo."

### Audiencia

- Traders que buscan orientación
- Personas sin tiempo para analizar
- Inversores que prefieren copy espiritual (sin auto-copy)

### Modelo de Negocio

- Free: 3 señales/día, historial limitado
- Pro ($9/mes): señales unlimited, historial completo, alertas
- Provider ($19/mes): crear y vender señales propias (30% revenue share)
- Verified badge: $5/mes para proveedores verificados

### Sitemap

```
/ (Landing)
/señales (Feed de señales)
/señal/[id] (Detalle + analytics)
/proveedores (Ranking de providers)
/proveedor/[id] (Perfil + historial + stats)
/pricing
/mi-cuenta (Dashboard de señales seguidas)
/become-provider (Para creadores)
```

### Páginas Clave

| Página | Objetivo | CTA |
|---|---|---|
| Landing | Captar trader | "Ver señales gratis" |
| Señales | Engagement | "Seguir proveedor" |
| Proveedores | Trust + discovery | "Ver perfil" |
| Pricing | Conversion | "Upgrade" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex (signals + providers + history)
- Relay: Express (integración brokers)
- AI: resumen automático de señales
- Payments: MercadoPago + Stripe

### Diferenciador vs Competidores

- **Verificación real**: cada proveedor muestra historial auditado
- **Trust score**: scoring propietario basado en accuracy + consistency
- **No auto-copy**: señal editorial, decisión humana del usuario

### Risk

- **Alto**: regulators pueden ver señales como advice (resolver: disclaimer + no guarantee)
- **Alto**: quality de proveedores (resolver: tier system + moderation)

### Growth

- SEO: "señales trading", "mejor proveedor señales"
- Partnerships: prop firms, brokers referidos
- Creators: revenue share para providers

---

## SPEC-04: FinLearn — Plataforma de Educación Financiera

### Promesa

"Educación financiera seria y práctica para latinos. Cursos, herramientas y comunidad para aprender a invertir."

### Audiencia

- Hispanohablantes (LATAM) 25-45 años
- Profesionales con ingreso disponible
- Personas sin conocimiento financiero formal

### Modelo de Negocio

- Free: cursos introductorios, blog
- Premium ($7/mes): cursos completos, certificates, community
- Certification ($99): exámen + certificado + badge
- Marketplace: cursos de terceros (20%)

### Sitemap

```
/ (Landing)
/cursos (Catálogo)
/curso/[slug] (Player de curso)
/ruta/[slug] (Learning path)
/comunidad (Foro + debates)
/herramientas (Calculadoras + recursos)
/blog (Artículos educativos)
/pricing
/certificaciones
```

### Páginas Clave

| Página | Objetivo | CTA |
|---|---|---|
| Landing | Captar | "Empezar curso gratis" |
| Cursos | Browse | "Ver curso" |
| Comunidad | Engagement | "Unirme" |
| Herramientas | Utility | "Usar calculadora" |
| Pricing | Conversion | "Premium" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex
- Video: Mux / YouTube embeds
- Payments: MercadoPago

### Risk

- **Medio**: contenido requiere experticia (resolver: hire/partner con educators)
- **Medio**: video hosting costs (resolver: YouTube embeds al inicio)

### Growth

- SEO: "curso invertir", "educación financiera"
- YouTube: contenido free como funnel
- Institutions: B2B para empresas

---

## SPEC-05: CreatorVault — Memberships para Creators

### Promesa

"Construye tu comunidad de pago en minutos. Membresías, contenido exclusivo y analytics sin complicaciones."

### Audiencia

- Creators en LATAM (18-45) con audiencia
- Coaches, traders, educators, artistas
- Personas con 1K+ seguidores en redes

### Modelo de Negocio

- Starter ($0): 100 members, 5% fee
- Pro ($15/mes): unlimited members, 5% fee, analytics
- Elite ($29/mes): + custom branding, API access, priority support

### Sitemap

```
/ (Landing)
/explorar (Discovery de creators)
/creator/[slug] (Página pública del creator)
/dashboard (Creator dashboard)
/membership/[slug] (Página de suscripción)
/contenido (Contenido exclusivo)
/analytics (Pro)
/settings (Config)
```

### Páginas Clave

| Página | Objetivo | CTA |
|---|---|---|
| Landing (para fans) | Descubrir creators | "Explorar" |
| Landing (para creators) | Registro | "Crear membresía" |
| Discovery | Engagement | "Suscribirme" |
| Dashboard | Retención | "Publicar contenido" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex
- Payments: MercadoPago (subscriptions)
- Email: Resend / SendGrid

### Risk

- **Medio**: chargebacks y disputas (resolver: clear T&Cs + support)
- **Medio**: content moderation (resolver: report + block tools)

### Growth

- SEO: "crear membresía", "suscripción creators"
- Social: creators traen sus seguidores
- Partnerships: agencies de creators

---

## SPEC-06: MarketPulse — Media Hub de Análisis Financiero

### Promesa

"Análisis financiero diario de los mercados que importan. Sin ruido, solo signal."

### Audiencia

- Traders activos
- Inversores profesionales
- Periodistas y analysts junior

### Modelo de Negocio

- Free: análisis básico + 3 articles/día
- Pro ($5/mes): análisis completo, archive, alerts
- Sponsored: empresas pagan por análisis destacado
- B2B: media kit para subscriptions corporativas

### Sitemap

```
/ (Home — latest analysis)
/analisis/[category] (Por categoría: forex, crypto, acciones, macro)
/articulo/[slug] (Artículo completo)
/watchlist (Herramienta de seguimiento)
/alerts (Config alerts)
/pricing
/quienes-somos (About)
```

### Páginas Clave

| Página | Objetivo | CTA |
|---|---|---|
| Home | Engagement | "Leer análisis" |
| Categoría | Discovery | "Ver más" |
| Watchlist | Utility | "Crear watchlist" |
| Pricing | Conversion | "Suscribirme" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- CMS: contenido como Convex + MDX
- Backend: Convex
- Payments: MercadoPago

### Risk

- **Medio**: calidad del análisis (resolver: hire + review process)
- **Bajo**: SEO fuerte si contenido es bueno

### Growth

- SEO: "análisis EUR/USD", "crypto hoy"
- Newsletter: email como retention
- Syndication: licensing de contenido

---

## SPEC-07: PromptCraft — Templates por Prompt

### Promesa

"Accede a miles de templates probados para ChatGPT, Claude y más. Genera cualquier cosa en segundos."

### Audiencia

- Freelancers y creators
- Marketers y销售人员
- Startups y entrepreneurs

### Modelo de Negocio

- Free: 10 templates/día
- Pro ($7/mes): unlimited + favorites + AI generation
- Marketplace ($0 listing + 15%): usuarios venden templates

### Sitemap

```
/ (Landing)
/templates (Browse + search)
/categoria/[slug] (Templates por categoría)
/template/[id] (Detalle + preview)
/generador (AI generation)
/crear (Submit template)
/pricing
/mis-templates (Dashboard)
```

### Páginas Clave

| Página | Objetivo | CTA |
|---|---|---|
| Landing | Captar | "Explorar templates" |
| Browse | Discovery | "Usar template" |
| Generador | Demostrar | "Probar gratis" |
| Pricing | Conversion | "Upgrade" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex
- AI: OpenAI + Anthropic API relay
- Payments: Stripe

### Risk

- **Alto**: templates pueden ser genéricos (resolver: curation + ratings)
- **Medio**: API costs (resolver: cache + rate limits)

### Growth

- SEO: "[herramienta] prompt para [use case]"
- Content: blog con use cases
- Viral: share de templates públicos

---

## SPEC-08: ComunityMetrics — Suite de Analítica para Comunidades

### Promesa

"Mide lo que importa en tu comunidad. Analytics, engagement scores y reportes para crecer más rápido."

### Audiencia

- Admins de comunidades (Discord, Telegram, Slack)
- Managers de comunidades en empresas
- Creadores con comunidades propias

### Modelo de Negocio

- Free: 1 comunidad, métricas básicas
- Pro ($12/mes): 5 comunidades, reportes, historical
- Team ($29/mes): 25 comunidades, API, white label

### Sitemap

```
/ (Landing)
/dashboard (Overview de métricas)
/comunidades (Lista)
/comunidad/[id] (Analytics detallada)
/reportes (Reportes + exports)
/integraciones (Connect Discord/Telegram/Slack)
/pricing
/configuracion
```

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex
- Integrations: Discord API, Telegram Bot API, Slack API
- Payments: Stripe

### Risk

- **Medio**: APIs de plataformas pueden cambiar (resolver: abstraction layer)
- **Medio**: data privacy (resolver: no store content, solo metrics)

### Growth

- SEO: "analytics discord", "métricas comunidad"
- Partnerships: Discord partners, Slack apps
- Content: blog sobre community management

---

## SPEC-09: SponsorMatch — Plataforma de Sponsorship Matching

### Promesa

"Conecta creators con brands que encajan. Sin negociación compleja, con匹配 inteligente."

### Audiencia

- **Brands**: empresas buscando creators para campañas
- **Creators**: influencers con 1K-500K seguidores

### Modelo de Negocio

- **Brands pagan**: $199-999/campaign según alcance
- **Creators pagan**: nada (free to apply)
- **Take rate**: 15% del fee de campaign

### Sitemap

```
/ (Landing — dual: brands + creators)
/brands (Para marcas)
/creators (Para creators)
/campaigns (Browse campaigns abiertas)
/campaign/[id] (Detalle de campaign)
/creator/[id] (Perfil creator para brands)
/brand/[id] (Perfil brand para creators)
/dashboard (Creator o brand dashboard)
/pricing (Para brands)
```

### Páginas Clave

| Landing (brands) | Captar brand | "Crear campaign" |
| Landing (creators) | Captar creator | "Aplicar" |
| Campaigns | Discovery | "Aplicar ahora" |
| Creator profile | Credibilidad | "Contactar" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- Backend: Convex
- Matching: algoritmo propio basado en niche + audience + budget
- Payments: Stripe

### Risk

- **Alto**: fake creators / inflated stats (resolver: verification + review system)
- **Alto**: campaign disputes (resolver: clear T&Cs + mediation)

### Growth

- SEO: " sponsorship creators", "campaña influencer"
- Outreach: cold email a ambos lados
- Partnerships: agencies de influencers

---

## SPEC-10: SitemapAI — Generador de Sitemap + Website Builder

### Promesa

"Pide un sitio web en español. Lo generamos con sitemap, estructura y contenido listo para deploy."

### Audiencia

- Entrepreneurs en LATAM
- Pequeños negocios
- Freelancers y consultants

### Modelo de Negocio

- Free: generación de sitemap + estructura base
- Pro ($9/mes): código completo, hosting incluido, domain
- Agency ($49/mes): ilimitados sites, white label

### Sitemap

```
/ (Landing)
/generador (Herramienta principal)
/mis-sitios (Dashboard)
/sitio/[id] (Preview del sitio generado)
/editor (Editor visual ligero)
/pricing
/docs (Documentation)
```

### Páginas Clave

| Landing | Captar | "Generar mi sitio gratis" |
| Generador | Demostrar | "Ver preview" |
| Mis sitios | Retención | "Editar sitio" |
| Pricing | Conversion | "Upgrade" |

### Stack

- Frontend: Vite + React + Obsidian Ether
- AI: GPT-4o para generación de contenido
- Code gen: templates + AI para HTML/CSS
- Hosting: Vercel API
- Payments: MercadoPago

### Diferenciador

- Enfocado en LATAM (español nativo, contexto local)
- No código requerido — prompt to deploy
- Templates curados por industria

### Risk

- **Alto**: calidad de output variable (resolver: templates + review)
- **Medio**: hosting costs (resolver: Vercel free tier hasta scale)

### Growth

- SEO: "crear sitio web", "generador de páginas"
- Viral: share de sitios generados
- Content: blog con sitios de ejemplo

---

## Priorización de Builds

| Orden | Spec | Tiempo Estimado | Justificación |
|---|---|---|---|
| 1 | SPEC-02 (TradeHub Community) | 4-6 semanas | Alineamiento con producto actual |
| 2 | SPEC-03 (SignalVault) | 3-5 semanas | Diferenciador claro |
| 3 | SPEC-01 (EduTrade) | 4-6 semanas | Contenido como acquisition |
| 4 | SPEC-05 (CreatorVault) | 3-4 semanas | Creator economy |
| 5 | SPEC-07 (PromptCraft) | 2-3 semanas | AI-native, rápido de validar |
| 6 | SPEC-04 (FinLearn) | 4-6 semanas | Mercado grande |
| 7 | SPEC-06 (MarketPulse) | 3-4 semanas | SEO strong |
| 8 | SPEC-09 (SponsorMatch) | 4-6 semanas | B2B value |
| 9 | SPEC-08 (ComunityMetrics) | 3-4 semanas | Utilidad clara |
| 10 | SPEC-10 (SitemapAI) | 2-3 semanas | Producto de la factory |

## Resumen Revenue Potential

| Spec | MRR Target (año 1) | Modelo Principal |
|---|---|---|
| SPEC-01 | $5,000 | Subscriptions |
| SPEC-02 | $15,000 | Subscriptions + creators |
| SPEC-03 | $10,000 | Subscriptions + providers |
| SPEC-04 | $3,000 | Subscriptions |
| SPEC-05 | $8,000 | Subscriptions |
| SPEC-06 | $2,000 | Subscriptions + sponsored |
| SPEC-07 | $5,000 | Subscriptions + marketplace |
| SPEC-08 | $4,000 | Subscriptions |
| SPEC-09 | $3,000 | Campaign fees |
| SPEC-10 | $2,000 | Subscriptions |
| **Total** | **$57,000/mo** | |

---

## Metadata

- **Creado:** 2026-03-22
- **Specs:** 10
- **Formato:** promesa + audiencia + monetización + sitemap + stack + risk + growth
- **Revisión:** Trimestral
