# AI Utility Integration - TradePortal

## Overview

Sistema de IA integrado transversalmente en la plataforma para proporcionar ayuda contextual, coaching y soporte en cada superficie del producto.

## Componentes

### 1. AIService (`lib/ai/aiService.ts`)

Servicio central de IA que abstrae múltiples providers.

**Providers soportados:**
- OpenAI (GPT-4, GPT-4o-mini)
- Anthropic (Claude)
- Google (Gemini)
- GitHub Models

**API:**
```typescript
interface AIRequest {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  content: string;
  model: string;
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  finishReason?: string;
}

aiService.complete(request: AIRequest): Promise<AIResponse>
aiService.selectModel(task: 'caption' | 'analytics' | 'reply' | 'general'): string
```

### 2. CoachService (`lib/ai/coach.ts`)

Sistema de recomendaciones diarias basadas en progreso del usuario.

**Tipos de acciones:**
```typescript
type CoachActionType =
  | 'create_post'      // Crear primer post
  | 'join_community'    // Unirse a comunidad
  | 'complete_profile' // Completar perfil
  | 'try_signals'       // Probar señales
  | 'invite_friends'    // Invitar amigos
  | 'upgrade_pro'      // Hacer upgrade
  | 'explore_courses'   // Explorar cursos
  | 'engage_more';      // Mayor engagement
```

**API:**
```typescript
CoachService.getDailyRecommendations(usuario: Usuario | null): CoachRecommendation[]
CoachService.getTopRecommendation(usuario: Usuario | null): CoachRecommendation | null
CoachService.getStreakMessage(streak: number): string
CoachService.calculateXPDaily(usuario: Usuario | null): number
```

### 3. MorningBriefing (`lib/ai/briefing.ts`)

Genera briefing matutino con watchlist y noticias.

### 4. useAIAssistant (`hooks/useAIAssistant.ts`)

Hook React para integrar IA en cualquier superficie.

**Modos disponibles:**
```typescript
type AIAssistantMode = 'onboarding' | 'support' | 'general' | 'coach';
```

**API:**
```typescript
const ai = useAIAssistant({
  userId?: string;
  mode?: AIAssistantMode;
  user?: Usuario | null;
  enabled?: boolean;
});

// Propiedades
ai.isLoading: boolean;
ai.response: string | null;
ai.error: string | null;
ai.mode: AIAssistantMode;
ai.coachRecommendations: CoachRecommendation[];
ai.topCoachRecommendation: CoachRecommendation | null;

// Métodos
ai.sendMessage(message: string): Promise<void>;
ai.clearResponse(): void;
ai.getOnboardingHelp(step: string): string;
ai.getSupportAnswer(question: string): string;
```

## Integración por Superficie

### Onboarding

```tsx
import { useAIAssistant } from '../hooks';

function OnboardingFlow() {
  const ai = useAIAssistant({ mode: 'onboarding', user });

  return (
    <div>
      <h2>Bienvenido, {user?.nombre}</h2>
      <p>{ai.getOnboardingHelp('welcome')}</p>
      
      {/* Mostrar recomendación del coach */}
      {ai.topCoachRecommendation && (
        <Card>
          <h3>{ai.topCoachRecommendation.title}</h3>
          <p>{ai.topCoachRecommendation.description}</p>
          <Button>{ai.topCoachRecommendation.ctaLabel}</Button>
        </Card>
      )}
    </div>
  );
}
```

### Support/FAQ

```tsx
function SupportSection() {
  const ai = useAIAssistant({ mode: 'support' });
  const [question, setQuestion] = useState('');

  const handleAsk = async () => {
    await ai.sendMessage(question);
  };

  return (
    <div>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="¿En qué puedo ayudarte?"
      />
      <button onClick={handleAsk} disabled={ai.isLoading}>
        {ai.isLoading ? '...' : 'Preguntar'}
      </button>
      
      {ai.response && <div className="response">{ai.response}</div>}
      {ai.error && <div className="error">{ai.error}</div>}
    </div>
  );
}
```

### Coach Card en Dashboard

```tsx
import { DailyCoachCard } from '../components';

function DashboardView() {
  const { coachRecommendations } = useAIAssistant({ 
    mode: 'coach', 
    user 
  });

  return (
    <div>
      <DailyCoachCard 
        recommendations={coachRecommendations.slice(0, 3)}
        user={user}
      />
    </div>
  );
}
```

### Morning Briefing

```tsx
import { MorningBriefingCard } from '../components';

function DashboardView() {
  const { briefing } = useMorningBriefing({ userId });

  return (
    <div>
      <MorningBriefingCard 
        watchlist={briefing.watchlist}
        news={briefing.news}
        isLoading={briefing.isLoading}
      />
    </div>
  );
}
```

## Rate Limiting (AI-001)

El relay de IA tiene rate limiting configurado:

```typescript
// Endpoints protegidos
/api/ai/external/chat - 60 req/min por IP
/api/admin/aurora/chat - 30 req/min por IP

// Variables de entorno
AI_RATE_LIMIT_CHAT=60
AI_RATE_LIMIT_AURORA=30
```

**Respuesta 429:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfterMs": 60000
}
```

## Audit Logging

Todas las requests AI se loguean con:

```typescript
{
  timestamp: number;
  requestId: string;
  endpoint: string;
  userId?: string;
  provider?: string;
  model?: string;
  success: boolean;
  durationMs: number;
  errorMessage?: string;
  ip?: string;
}
```

## Métricas

Endpoint `/health-metrics` expone:

```json
{
  "ai": {
    "totalRequests": 1234,
    "totalErrors": 5,
    "errorRate": "0.41%",
    "byProvider": { "groq": 800, "openrouter": 434 },
    "byModel": { "llama-3.3-70b-versatile": 800, "qwen": 434 },
    "byEndpoint": {
      "/api/ai/external/chat": { "requests": 1000, "errors": 3 },
      "/api/admin/aurora/chat": { "requests": 234, "errors": 2 }
    },
    "lastRequestAt": "2026-03-21T01:00:00.000Z",
    "lastErrorAt": "2026-03-21T00:30:00.000Z"
  }
}
```

## Security

- API keys nunca expuestas al cliente
- Rate limiting por endpoint
- Request IDs para trazabilidad
- Logs sanitizados (sin claves sensibles)

## Testing

```bash
# Unit tests
npx vitest run __tests__/unit/rateLimiter.test.ts
npx vitest run __tests__/unit/paymentFactory.test.ts

# All tests
npm test
```

## Futuras Mejoras

- [ ] Integrar Aurora Support en flows de onboarding
- [ ] Personalizar prompts según tier del usuario
- [ ] Agregar streaming para respuestas largas
- [ ] Cachear respuestas frecuentes
- [ ] Implementar feedback loop (thumbs up/down)
