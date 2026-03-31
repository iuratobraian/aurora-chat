# Marketing Automation - TradePortal

## Overview

Sistema automatizado de crecimiento de cuentas sociales con batching, calendario, reportes y aprendizaje semanal.

## Componentes

### 1. GrowthAutomation (`scripts/marketing/growthAutomation.ts`)

```typescript
// Métricas
recordMetric(metric: GrowthMetric): void
getMetrics(days?: number): GrowthMetric[]

// Reportes
generateWeeklyReport(weekStart: Date): WeeklyReport

// Batch Jobs
scheduleBatchJob(job): BatchJob
processBatchJobs(): BatchJob[]
getPendingJobs(): BatchJob[]
cancelJob(jobId: string): boolean

// Config
getDefaultAutomationConfig(): AutomationConfig
```

## Métricas Rastreadas

| Métrica | Descripción | Fuente |
|---------|-------------|--------|
| followers | Total de seguidores | Manual/API |
| engagement | % de engagement | Calculado |
| reach | Alcance por post | Manual/API |
| clicks | Clics en links | UTM params |
| conversions | Registros/Upgrades | Analytics |

## Reportes Semanales

```typescript
interface WeeklyReport {
  week: string;
  metrics: {
    totalPosts: number;
    totalReach: number;
    avgEngagement: number;
    topPerforming: string[];
    growthFollowers: number;
    clicks: number;
    conversions: number;
  };
  insights: string[];
  recommendations: string[];
}
```

## Automatizaciones

### Posting Schedule

| Hora | Canal | Tipo |
|------|-------|------|
| 08:00 | Telegram | News/Analysis |
| 09:00 | Instagram | Educational |
| 12:00 | Twitter | Trending |
| 18:00 | Instagram | Community |

### Engagement Actions

```typescript
const engagementActions = [
  {
    type: 'comment',
    keywords: ['trading', 'forex', 'crypto'],
    response: '¡Buen punto! ¿Qué estrategias usas?'
  },
  {
    type: 'like',
    keywords: ['trading', 'señales']
  },
  {
    type: 'follow',
    keywords: ['trader', 'crypto']
  }
];
```

### Auto-Respond DMs

| Trigger | Mensaje | Delay |
|---------|---------|-------|
| welcome | "¡Bienvenido!" | 5s |
| question | "Te recomiendo nuestra ayuda" | 10s |

## Batch Jobs

```typescript
interface BatchJob {
  id: string;
  type: 'post' | 'dm' | 'engagement' | 'content';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledFor: number;
  result?: string;
  error?: string;
}
```

## ROI Calculator

```typescript
calculateROI(spend, conversions, avgValue)
// → { revenue, profit, roi }
```

## Integración con IA

```typescript
import { aiService } from '../../lib/ai/aiService';

async function generateWeeklyInsight(report: WeeklyReport): Promise<string> {
  const response = await aiService.complete({
    messages: [{
      role: 'system',
      content: 'Eres un growth marketer experto.'
    }, {
      role: 'user',
      content: `Analiza este reporte y dame 3 insights accionables:\n${JSON.stringify(report)}`
    }]
  });
  return response.content;
}
```

## Learning Loop

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  RECOLECT  │────▶│  ANALIZAR   │────▶│  OPTIMIZAR │
│  metrics   │     │  weekly     │     │  strategy  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                    ┌─────────────────────────┘
                    ▼
              ┌─────────────┐
              │  APLICAR    │
              │  next week  │
              └─────────────┘
```

## Calendario Semanal

| Día | Instagram | Twitter | Telegram |
|-----|-----------|---------|----------|
| Lun | Educational | Trending | Analysis |
| Mar | Community | Tips | News |
| Mie | Educational | Trending | Analysis |
| Jue | Community | Tips | News |
| Vie | Educational | Trending | Analysis |
| Sáb | Community | Trending | Analysis |
| Dom | Engagement | Tips | Weekly Recap |

## Métricas de Éxito

| Métrica | Target | Alarm |
|---------|--------|-------|
| Engagement Rate | >4% | <2% |
| Growth Semanal | >5% | <1% |
| Conversiones | >10/semana | <3 |
| ROI Ads | >200% | <100% |

## Herramientas

- [ ] Hootsuite/Buffer integration
- [ ] Instagram API (requires approval)
- [ ] Telegram Bot API
- [ ] Twitter API v2
- [ ] Analytics dashboard

## Próximas Features

- [ ] Auto-posting real via APIs
- [ ] DM automation
- [ ] Comment automation
- [ ] Follow/unfollow automation
- [ ] A/B testing de contenido
- [ ] Predictive posting times
