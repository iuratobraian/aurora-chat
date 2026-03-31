# Integración de HuggingFace Agents al Portal TradePortal

## Beneficios por Agente

| # | Agente | Beneficio para el Portal | Implementación |
|---|--------|-------------------------|----------------|
| 1 | **hf_smolagents** | Framework base para crear agentes personalizados | Backend API |
| 2 | **hf_computer_use_agent** | Automatización de tareas repetitivas | Webhooks |
| 3 | **hf_agent_ui** | Chat de soporte IA para usuarios | Componente React |
| 4 | **hf_web_scraper_mcp** | Scraping de mercados, noticias, precios | API endpoint |
| 5 | **hf_knowledge_graph_mcp** | Base de conocimiento de trading | Base de datos |
| 6 | **hf_deep_research** | Análisis de mercados y activos | Background jobs |
| 7 | **hf_fish_agent** | Asistente de voz para usuarios | WebSocket |
| 8 | **hf_workflow_builder** | Automatización de procesos internos | Admin panel |
| 9 | **hf_file_converter** | Procesamiento de archivos de usuarios | Upload handler |
| 10 | **hf_first_agent_template** | Template para nuevos features | Prototyping |

---

## Integraciones Concretas

### 1. Web Scraper → Feed de Noticias

```
Usuario accede al portal → 
  → API llama a web_scraper 
  → Scraping de: CoinMarketCap, TradingView, Binance News
  → Guarda en BD como posts
  → Muestra en feed de comunidad
```

**Código ejemplo:**
```typescript
// src/services/agentScraper.ts
export async function scrapeMarketNews(): Promise<Post[]> {
  const news = await fetch('https://huggingface.co/api/spaces/Agents-MCP-Hackathon/web-scraper', {
    method: 'POST',
    body: { urls: [
      'https://coinmarketcap.com',
      'https://www.tradingview.com/news/'
    ]}
  });
  return transformToPosts(news);
}
```

### 2. Deep Research → Análisis de Activos

```
Usuario selecciona activo (BTC, EUR/USD) →
  → Agent research analiza el activo
  → Genera reporte con:
    - Tendencia actual
    - Niveles clave
    - Sentimiento del mercado
  → Muestra en vista de activo
```

### 3. Knowledge Graph → Sistema de Recomendación

```
Usuario busca "estrategias trading" →
  → Knowledge Graph busca en base de conocimiento
  → Recomienda:
    - Cursos relacionados
    - Posts de la comunidad
    - Creadores expertos
```

### 4. Agent UI → Chat de Soporte

```
Usuario hace click en "Ayuda IA" →
  → Abre chat con agente
  → Agente responde preguntas sobre:
    - Cómo usar el portal
    - Estrategias de trading
    - Preguntas frecuentes
```

### 5. Voice Agent → Comandos de Voz

```
Usuario dice "Alexa, consulta precio Bitcoin" →
  → Voice agent procesa
  → Busca precio actual
  → Responde con voz
```

---

## Propuesta de Implementación

### Fase 1: Web Scraper + Deep Research (Semana 1)

1. **Web Scraper API**
   - Endpoint: `/api/agents/scrape`
   - Scraping de mercados cada 15 min
   - Guardar en tabla `market_news`

2. **Deep Research API**
   - Endpoint: `/api/agents/research`
   - Análisis bajo demanda
   - Cache de resultados 1 hora

### Fase 2: Agent UI + Knowledge Graph (Semana 2)

3. **Chat de Soporte IA**
   - Componente: `<AIAgentChat />`
   - Integración con smolagents
   - Contexto del usuario

4. **Sistema de Recomendación**
   - Graph de conocimientos
   - Recomendaciones personalizadas

### Fase 3: Voice + Workflow (Semana 3-4)

5. **Asistente de Voz**
   - `<VoiceAssistant />` componente
   - WebSocket para streaming

6. **Admin Automation**
   - Panel de workflows
   - Automoderación de posts

---

## Archivos a Crear

```
src/
├── services/
│   ├── agentScraper.ts      # Web scraper integration
│   ├── agentResearch.ts     # Deep research integration
│   └── agentChat.ts         # Chat agent integration
├── components/
│   ├── AIAgentChat.tsx      # Chat UI
│   ├── VoiceAssistant.tsx   # Voice UI
│   └── MarketAnalysis.tsx    # Research results
└── hooks/
    ├── useAgent.ts          # Agent hook
    └── useVoice.ts          # Voice hook
```

---

## Variables de Entorno

```env
# Agents
HF_TOKEN=hf_xxxxxxxxxxxxx
AGENT_API_URL=https://huggingface.co/api

# Optional
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## Código: Chat Agent Component

```tsx
// src/components/AIAgentChat.tsx
import { useState } from 'react';

export function AIAgentChat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await fetch('/api/agents/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input })
    });
    const result = await response.json();
    setMessages([...messages, 
      { role: 'user', content: input },
      { role: 'agent', content: result.response }
    ]);
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="messages">
        {messages.map(m => (
          <div className={m.role}>{m.content}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}
```

---

## Prioridades de Implementación

| Prioridad | Agente | Impacto | Dificultad |
|-----------|--------|---------|-------------|
| 🔴 Alta | Web Scraper | Feed automático | Baja |
| 🔴 Alta | Deep Research | Análisis premium | Media |
| 🟡 Media | Agent Chat | Soporte 24/7 | Media |
| 🟡 Media | Knowledge Graph | Recomendaciones | Alta |
| 🟢 Baja | Voice Agent | Accesibilidad | Alta |
| 🟢 Baja | Workflow Builder | Admin tools | Media |

---

## Próximos Pasos

1. ✅ Agentes agregados a connectors.json
2. ✅ Scripts CLI creados
3. ⏳ Aprobación de implementación
4. ⏳ Crear componentes React
5. ⏳ Crear API endpoints

**¿Procedemos con la implementación?**
