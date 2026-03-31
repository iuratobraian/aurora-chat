# Marketing AI System - TradePortal

## Overview

Sistema operativo de marketing impulsado por IA para TradePortal. Automatiza la generación de contenido, scheduling y análisis de campañas.

## Componentes

### ContentGenerator (`scripts/marketing/contentGenerator.ts`)

Genera briefs de contenido usando templates y heurísticas.

```typescript
interface ContentBrief {
  id: string;
  topic: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'telegram';
  format: 'post' | 'story' | 'reel' | 'thread';
  hook: string;
  keyMessage: string;
  cta?: string;
  hashtags: string[];
  tone: 'educational' | 'promotional' | 'engaging' | 'authoritative';
  targetAudience: string;
  estimatedReach: number;
  status: 'draft' | 'approved' | 'published';
}
```

### API

```typescript
// Generar brief de contenido
generateContentBrief(topic, platform, format): ContentBrief

// Crear campaña
createCampaign(name, objective, targetAudience, topics): ContentCampaign

// Calcular score de contenido
calculateContentScore(brief): number

// Obtener schedule de posting
getPostingSchedule(channels): PostingSchedule[]
```

## Canales Soportados

| Canal | Plataforma | Engagement Típico | Mejor Hora |
|-------|-------------|-------------------|------------|
| Instagram Principal | Instagram | 3.5% | 09:00 |
| Telegram Comunidad | Telegram | 15% | 08:00 |

## Tipos de Contenido

### Instagram
- **Post**: Imagen con caption educativo
- **Story**: Contenido efímero, encuestas, behind-the-scenes
- **Reel**: Videos cortos, máximo reach

### Twitter/X
- **Thread**: Serie de tweets educativos
- **Post**: Contenido rápido, opinions

### Telegram
- **Post**: Análisis diario, señales, recursos

## Flujo de Trabajo

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  RESEARCH   │────▶│  GENERATION  │────▶│ SCHEDULING  │
│  (topics)   │     │  (briefs)     │     │ (calendar)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                 │
                    ┌─────────────────────────────┘
                    ▼
              ┌─────────────┐     ┌─────────────┐
              │ PUBLISHING │────▶│   ANALYTICS │
              │ (auto/manual)    │  (metrics)  │
              └─────────────┘     └─────────────┘
```

## Generación de Contenido

### Hooks por Plataforma

**Instagram:**
- "Lo que nadie te cuenta sobre [tema]"
- "3 errores con [tema] que te costaron dinero"
- "Tu guía definitiva de [tema]"

**Twitter:**
- "[tema]: un thread"
- "Hot take: sobre [tema]"
- "[tema] en 280 caracteres"

**Telegram:**
- "📊 Análisis: [tema]"
- "🎯干货: todo sobre [tema]"
- "💡 Insight: [tema]"

### Hashtags por Tema

```typescript
const hashtagsByTopic = {
  'trading': ['#trading', '#forex', '#inversión', '#traders'],
  'signals': ['#señales', '#trading', '#forex', '#crypto'],
  'education': ['#educación', '#trading', '#aprende', '#forex'],
  'community': ['#comunidad', '#traders', '#growth'],
};
```

## Métricas de Campaña

```typescript
interface CampaignMetrics {
  impressions: number;    // Vistas
  engagement: number;     // Likes, comentarios, shares
  clicks: number;        // Clics al link
  conversions: number;    // Registros, upgrades
}

interface ContentScore {
  score: number;         // 0-100
  breakdown: {
    hashtags: number;
    hook: number;
    cta: number;
    format: number;
  };
}
```

## Objetivos de Campaña

### Awareness
- Aumentar reconocimiento de marca
- Métrica: Impresiones, alcance

### Engagement
- Generar interacción
- Métrica: Engagement rate, comentarios

### Conversion
- Llevar a registro/upgrade
- Métrica: CTR, conversiones

## Integración con IA

El sistema puede integrarse con `AIService` para:

1. **Generación de hooks personalizados** - Usar GPT para crear hooks únicos
2. **Optimización de hashtags** - Analizar trending topics
3. **Análisis de sentimiento** - Evaluar comentarios
4. **A/B testing de copy** - Probar variaciones

```typescript
import { aiService } from '../../lib/ai/aiService';

async function enhanceBrief(topic: string): Promise<string> {
  const response = await aiService.complete({
    messages: [
      { role: 'system', content: 'Eres un copywriter experto en marketing de trading.' },
      { role: 'user', content: `Genera 3 hooks virales sobre: ${topic}` },
    ],
    temperature: 0.8,
  });
  
  return response.content;
}
```

## Scheduling

### Mejores Horas por Canal

| Canal | Hora Principal | Hora Secondary |
|-------|---------------|---------------|
| Instagram | 09:00 | 12:00, 18:00 |
| Twitter | 08:00 | 14:00, 20:00 |
| Telegram | 08:00 | 12:00 |

## Reporting

### Dashboard de Marketing

```typescript
interface MarketingReport {
  totalPosts: number;
  totalImpressions: number;
  avgEngagementRate: number;
  topPerforming: ContentBrief[];
  upcomingContent: ContentBrief[];
  recommendations: string[];
}
```

## Uso de Scripts

```bash
# Generar brief de contenido
node scripts/marketing/contentGenerator.ts

# Crear campaña
node scripts/marketing/campaign.ts
```

## Métricas a Rastrear

- Posts publicados por semana
- Engagement rate por canal
- Follower growth
- Click-through rate
- Conversiones atribuidas
- ROI de contenido

## Futuras Integraciones

- [ ] Conexión con API de Instagram
- [ ] Auto-posting a Telegram
- [ ] Dashboard de analytics en tiempo real
- [ ] A/B testing automatizado
- [ ] Predictor de viralidad
