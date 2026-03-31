# Website Creator App — Spec Ejecutable

App generativa que crea sitios web profesionales a partir de prompts en español. Producto meta que usa la website factory.

## Concepto

**"Describe tu negocio. Generamos tu sitio."**

Un creador de sitios web donde el usuario escribe lo que necesita en lenguaje natural y la app genera un sitio completo, deployable y profesional. Sin código, sin templates genéricos, sin fricción.

### Diferenciadores

- **LATAM-native**: prompts y output en español
- **AI-first**: no es un page builder, es un generador
- **TradeStack-compatible**: usa la infraestructura probada del proyecto
- **Verticalizado**: templates curados por industria y nicho

---

## Producto

### Job-to-be-done

> "Tengo un negocio pequeño y necesito una página web profesional, pero no sé de código y Wix es muy caro y complicado."

### Propuesta de valor

| Para quién | Quiere | Damos | Sin |
|---|---|---|---|
| Freelancer LATAM | Presencia online | Sitio en 5 min | Código |
| Pequeño negocio | Credibilidad | Landing profesional | Costo alto |
| Coach/consultant | Página de servicios | Site con pricing | Complicación |
| Creator | Link-in-bio mejorado | Mini-site | Genericidad |

---

## UX / Flujo

### Flujo Principal

```
┌─────────────────┐
│  ¿Qué necesitas?│  ← Prompt input
│  (escribe aquí)  │
│                   │
│  "Necesito una   │
│   página para mi │
│   academia de    │
│   trading"       │
│                   │
│  [Generar sitio] │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  🎯 Detectando: │
│  Academia       │
│  Trading        │
│  LATAM          │
│                   │
│  ¿Es correcto?   │
│  [Sí, generar]  │
│  [Cambiar tipo] │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  ⚙️ Generando   │
│  ▓▓▓▓▓▓░░ 80%  │
│                   │
│  Creando página  │
│  de inicio...     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  ✅ Sitio listo! │
│                   │
│  [Ver preview]   │
│  [Personalizar]  │
│  [Publicar]     │
└─────────────────┘
```

### Flujo de Personalización

```
┌─────────────────┐
│  Preview del sitio generado │
│                               │
│  [Header]     [Cambiar logo] │
│  [Hero]       Editar texto  │
│  [Features]   Cambiar img  │
│  [CTA]         Modificar   │
│  [Footer]       Editar       │
│                               │
│  [Cambiar colores]          │
│  [Cambiar tipografía]       │
│  [Agregar sección]         │
│                               │
│  [Volver a generar]        │
│  [Publicar sitio]           │
└─────────────────────────────┘
```

---

## Módulos

### 1. Intent Detector

Recibe el prompt del usuario y detecta:

```typescript
interface IntentResult {
  industry: Industry;       // trading, education, health, etc.
  subIndustry: string;    // forex, yoga, consulting
  businessType: BusinessType; // solo, small_business, creator
  audience: string;         // descripción del público
  location: string;         // LATAM, US, etc.
  tone: Tone;              // professional, casual, bold
  features: Feature[];     // pricing, contact form, blog
}

type Industry = 
  | 'trading' | 'education' | 'health' 
  | 'consulting' | 'ecommerce' | 'creator'
  | 'restaurant' | 'real_estate' | 'agency'
  | 'other';

type BusinessType = 
  | 'solo'       // freelancer, consultant
  | 'small_team' // 2-10 empleados
  | 'creator'    // influencer, coach
  | 'startup';    // con producto digital

type Tone = 
  | 'professional' 
  | 'bold' 
  | 'casual' 
  | 'luxury';
```

### 2. Site Generator

Dado el IntentResult, genera:

```typescript
interface GeneratedSite {
  name: string;
  pages: Page[];
  theme: Theme;
  sections: Section[];
  meta: Meta;
}

interface Page {
  slug: string;       // '/', '/servicios', '/contacto'
  title: string;
  sections: Section[];
}

interface Section {
  type: SectionType;
  props: Record<string, unknown>;
}

type SectionType = 
  | 'hero'           // headline + CTA
  | 'features'       // grid de features
  | 'pricing'        // tabla de precios
  | 'about'          // historia / bio
  | 'testimonials'    // social proof
  | 'gallery'        // imágenes
  | 'contact'        // formulario
  | 'faq'            // preguntas frecuentes
  | 'cta'            // llamada a la acción
  | 'team'           // miembros
  | 'blog_preview'   // últimos posts
  | 'footer'          // footer con links
  | 'nav'             // navegación
  | 'custom';         // sección libre
```

### 3. Theme Engine

Genera el tema visual basado en el detected intent:

```typescript
interface Theme {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  typography: {
    heading: Font;
    body: Font;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    section: string;  // padding vertical entre secciones
    container: string;
  };
  shadows: {
    card: string;
    button: string;
  };
}

const THEME_PRESETS: Record<Industry, Theme> = {
  trading: {
    palette: {
      primary: '#2563eb',   // blue — confianza
      secondary: '#0f172a', // dark — profesional
      accent: '#00ff94',     // green — profit
      background: '#0a0a0b',
      surface: '#111113',
      text: '#f4f4f5',
      textMuted: '#a1a1aa',
    },
    // ...
  },
  // ... más presets
};
```

### 4. Content Generator

Genera el copy real para cada sección:

```typescript
interface ContentForSection {
  headline: string;      // H1
  subheadline: string;  // descripción corta
  body?: string;         // párrafo
  items?: Array<{ title: string; description: string }>;
  cta?: { label: string; href: string };
}

function generateContent(section: Section, intent: IntentResult): ContentForSection {
  // Usa AI para generar copy context-aware
  // "academy de trading" → "Aprende a operar con los mejores"
  // "freelancer de diseño" → "Diseño que vende"
}
```

### 5. Deployer

Publica el sitio generado:

```typescript
interface DeployResult {
  url: string;          // sitio.devtrade.app/nombre
  deployId: string;
  previewUrl: string;   // para revisión
}
```

**Stack de deploy:**
- Generate → HTML/CSS/JS estático
- Build → Vercel
- Domain → sitio.[domain].com

---

## Pantallas de la App

### P0 — MVP

1. **Landing de la app** (`/`) — explaining + prompt input
2. **Generando** (`/generating`) — progress screen
3. **Preview** (`/preview/[id]`) — ver el sitio generado
4. **Editor** (`/edit/[id]`) — personalizar
5. **Dashboard** (`/dashboard`) — mis sitios
6. **Published** (`/[site-slug]`) — el sitio público

### P1

- Panel de editor más completo (drag sections)
- Cambio de tema/colores
- Agregar/quitar secciones
- Integración de analytics básico
- Custom domain

### P2

- Multi-página (agregar páginas)
- Blog integrado
- Form builder
- E-commerce básico
- Integración con CRM

---

## Modelo de Negocio

### Freemium

| Free | Pro ($9/mes) | Agency ($49/mes) |
|---|---|---|
| 1 sitio | 5 sitios | 50 sitios |
| Subdomain | Custom domain | Custom domains |
| Estilos básicos | Todos los estilos | White label |
| Sin código | Exportar código | Exportar + API |
| Con ads | Sin ads | Sin ads |

### Revenue

- Subscriptions: Pro + Agency
- Custom domain fee: $2/mes por domain extra
- Extra sites: $2/site/mes
- Agency: reventa como reventa

---

## Arquitectura Técnica

### Stack

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React)                           │
│  - Landing / Dashboard / Editor                     │
│  - Preview in iframe                               │
│  - Vercel deployment                               │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│  GENERATION ENGINE (Express)                        │
│  - Intent detector (regex + AI)                    │
│  - Theme generator                                 │
│  - Content generator (GPT-4o)                       │
│  - Site builder (template + sections)               │
│  - Deploy trigger (Vercel API)                     │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│  STORAGE                                            │
│  - Sites: Convex (metadata, content)                │
│  - Assets: Vercel Blob / Cloudflare R2            │
│  - Generated code: GitHub repos                     │
└─────────────────────────────────────────────────────┘
```

### API Endpoints

```typescript
// Express relay
POST /api/generate    // Genera sitio desde prompt
GET  /api/site/:id    // Obtiene site metadata
PUT  /api/site/:id    // Actualiza site
POST /api/deploy/:id  // Trigger deploy
GET  /api/preview/:id // Preview URL

// Convex
sites.list            // Dashboard
sites.get            // Ver site
sites.delete          // Eliminar
```

### Generation Flow

```typescript
async function generateSite(prompt: string): Promise<GeneratedSite> {
  // 1. Parse intent
  const intent = await detectIntent(prompt);
  
  // 2. Select theme
  const theme = selectTheme(intent.industry);
  
  // 3. Select template structure
  const structure = selectStructure(intent);
  
  // 4. Generate content
  const content = await generateAllContent(structure, intent);
  
  // 5. Build sections
  const sections = buildSections(structure, content, theme);
  
  // 6. Create pages
  const pages = createPages(sections, intent);
  
  return { name: intent.businessName, pages, theme };
}
```

---

## Roadmap

### Fase 1 — MVP (2 semanas)
- [ ] Landing page con prompt
- [ ] Intent detector básico
- [ ] 5 templates por industry
- [ ] Generation con GPT-4o
- [ ] Preview en iframe
- [ ] Deploy a Vercel
- [ ] Dashboard básico

### Fase 2 — Polish (2 semanas)
- [ ] Editor visual básico (cambiar textos)
- [ ] Cambio de colores/tipografía
- [ ] 10 industries soportadas
- [ ] Custom subdomain
- [ ] Analytics básico (Plausible)

### Fase 3 — Growth (3 semanas)
- [ ] Multi-página
- [ ] Blog integrado
- [ ] Form builder
- [ ] Custom domains
- [ ] Pro tier con exports

### Fase 4 — Scale (4 semanas)
- [ ] Agency tier
- [ ] White label
- [ ] API access
- [ ] Integración con herramientas (Calendly, Mailchimp)

---

## Métricas de Producto

| Métrica | Target | Descripción |
|---|---|---|
| Sites generated | 100/week | Usuarios que generan un sitio |
| Sites published | 30/week | Sites que llegan a público |
| Conversion to Pro | 5% | Free → Pro |
| Avg generation time | <30s | Tiempo de generación |
| NPS | >40 | Satisfacción |

---

## Riesgo y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Quality de output variable | Alta | Alto | Templates curados + review flow |
| GPT costs se disparan | Media | Alto | Cache de generations + templates |
| Vercel costs con muchos sites | Media | Medio | Tiering + limits en free |
| Competidores con más features | Alta | Medio | Foco LATAM + velocidad |
| Sites con copyright issues | Baja | Alto | Solo assets propios o CC |

---

## Competitors y Diferenciación

| Competidor | Lo bueno | Lo que falta | Differenciador nuestro |
|---|---|---|---|
| Wix | Fácil | AI weak, caro | AI-first, más barato |
| Framer | Bello | Complejo | LATAM-native, más simple |
| Squarespace | Profesional | Genérico | Prompt → site real |
| Durable | AI generator | Limited customization | Editor + más industries |

---

## Metadata

- **Creado:** 2026-03-22
- **Tipo:** future_products (WEB-002)
- **Dependencias:** WEB-001 (website specs), TradeStack spec
- **Stack:** Vite + React + Convex + Express + GPT-4o + Vercel
