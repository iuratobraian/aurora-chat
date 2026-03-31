# Implementación de HuggingFace Agents - Roadmap

## Plan de Integración

### 1. 🌐 Web Scraper + Deep Research → Sector Noticias
**Ubicación:** Nuevo componente en ComunidadView o vista separada
- Feed de noticias automáticas de mercados
- Análisis de activos en tiempo real
- Estilo portal de noticias (Cards, Grid)

### 2. 💬 Agent Chat (Gold+) 
**Ubicaciones:**
- **Bitácora:** Asistente de gestión de riesgo
- **Cursos:** Ayuda contextual
- **Dashboard Creator:** Asistencia para creadores

### 3. 🧠 Knowledge Graph → Panel Admin
**Ubicación:** Admin Panel
- Recomendaciones de contenido
- Análisis de usuarios/comunidades

### 4. 🎤 Voice Agent → Marketing Pro
**Ubicación:** 
- Sección propia en el nav
- Marketing Pro dashboard

### 5. ⚙️ Workflow Builder → Panel Admin
**Ubicación:** Admin Panel
- Automoderación
- Gestión de workflows

---

## Estructura de Archivos a Crear

```
src/
├── components/
│   ├── agents/
│   │   ├── NewsFeed.tsx          # Web Scraper + Research
│   │   ├── RiskAssistant.tsx     # Agent Chat - Gestión riesgo
│   │   ├── CourseAssistant.tsx   # Agent Chat - Cursos
│   │   ├── CreatorAssistant.tsx  # Agent Chat - Creador
│   │   ├── VoiceAssistant.tsx     # Voice Agent
│   │   └── AgentChat.tsx          # Componente base
│   └── admin/
│       ├── KnowledgePanel.tsx     # Knowledge Graph
│       └── WorkflowPanel.tsx      # Workflow Builder
├── services/
│   ├── agents/
│   │   ├── scraperService.ts     # Web scraping
│   │   ├── researchService.ts    # Deep research
│   │   └── chatService.ts        # Agent chat
│   └── voiceService.ts
├── hooks/
│   ├── useAgent.ts
│   └── useVoice.ts
└── views/
    ├── NewsPortalView.tsx        # Portal de noticias
    └── VoicePortalView.tsx       # Portal de voz
```

---

## Implementación Fase 1: Sector Noticias

### NewsFeed.tsx
- Grid de cards con noticias
- Scraping de fuentes: CoinMarketCap, TradingView, Binance
- Deep Research para análisis de activos
- Actualización cada 15 minutos
