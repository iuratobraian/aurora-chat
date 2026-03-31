# 🧠 AURORA AI - Always Present in Chat

## Quick Start

### Iniciar Aurora Siempre Presente

```bash
# Iniciar daemon de Aurora
npm run aurora:always

# Ver estado
npm run aurora:status

# Detener daemon
npm run aurora:stop
```

## Comandos de Aurora en el Chat

Una vez que Aurora está presente, puedes usar estos comandos:

### Comandos Básicos

| Comando | Descripción |
|---------|-------------|
| `@aurora help` | Mostrar todos los comandos disponibles |
| `@aurora status` | Ver estado del sistema y providers |
| `@aurora providers` | Listar providers disponibles |

### Code Review

| Comando | Descripción |
|---------|-------------|
| `@aurora review [archivo]` | Code review del archivo especificado |
| `@aurora review:security` | Auditoría de seguridad |
| `@aurora review:performance` | Review de performance |
| `@aurora review:memory` | Detectar memory leaks |

### Análisis Profundo

| Comando | Descripción |
|---------|-------------|
| `@aurora analyze` | Análisis profundo del código |
| `@aurora analyze:architecture` | Análisis de arquitectura |
| `@aurora analyze:dependencies` | Análisis de dependencias |
| `@aurora analyze:patterns` | Patrones de diseño detectados |

### Optimización

| Comando | Descripción |
|---------|-------------|
| `@aurora optimize` | Sugerencias de optimización |
| `@aurora optimize:bundle` | Optimización del bundle |
| `@aurora optimize:memory` | Optimización de memoria |
| `@aurora optimize:polling` | Optimización de polling/intervals |

### Memory & Performance

| Comando | Descripción |
|---------|-------------|
| `@aurora memory` | Check de memory leaks |
| `@aurora memory:report` | Reporte completo de memoria |
| `@aurora performance` | Análisis de performance |
| `@aurora performance:bundle` | Análisis del bundle size |

### Task Management

| Comando | Descripción |
|---------|-------------|
| `@aurora tasks` | Ver tareas pendientes |
| `@aurora tasks:claim [id]` | Reclamar tarea |
| `@aurora tasks:done [id]` | Marcar tarea como completada |
| `@aurora tasks:report` | Reporte de progreso |

## Providers Disponibles

### Groq (Fast) ⚡
- **Modelo:** Llama 3.3 70B
- **Tiempo:** ~0.7s
- **Costo:** $0.0004/1k tokens
- **Mejor para:** Código rápido, debugging, snippets

### Kimi K2 (Quality) 🚀
- **Modelo:** kimi-k2-instruct
- **Tiempo:** ~3-5s
- **Costo:** $0.0005/1k tokens
- **Mejor para:** Code review, arquitectura, análisis profundo

### OpenRouter (Backup) 💰
- **Modelo:** Qwen 2.5 Coder 32B
- **Tiempo:** ~2-3s
- **Costo:** $0.0002/1k tokens
- **Mejor para:** Backup económico

## Configuración

### Variables de Entorno

Agregar a `.env.aurora`:

```bash
# Providers
GROQ_API_KEY=sk-xxx
NVIDIA_API_KEY=nvapi-xxx
OPENROUTER_API_KEY=sk-or-xxx

# Opcional: Ollama local
OLLAMA_BASE_URL=http://127.0.0.1:11434/api/generate
```

### Configuración de Aurora

Editar `scripts/aurora-always-on.mjs`:

```javascript
const AURORA_PRESENCE = {
  enabled: true,              // Aurora siempre activo
  autoRespond: true,          // Responder automáticamente a menciones
  providers: ['groq', 'kimi', 'openrouter'],
  models: {
    fast: 'groq:llama-3.3-70b-versatile',
    quality: 'kimi:kimi-k2-instruct',
    backup: 'openrouter:qwen-2.5-coder-32b'
  },
  features: {
    codeReview: true,
    memoryLeakDetection: true,
    performanceMonitoring: true,
    taskTracking: true
  }
};
```

## Ejemplos de Uso

### Code Review Rápido

```bash
@aurora review src/components/PostCard.tsx
```

**Output:**
```
🔍 Code Review: src/components/PostCard.tsx

✅ Puntos Fuertes:
- Componente memoizado correctamente
- Hooks esenciales (8 estados)

⚠️ Mejoras Sugeridas:
- Línea 45: Considerar useCallback para handleSaveClick
- Línea 78: useMemo podría cachear más datos

📊 Score: 8.5/10
```

### Análisis de Memoria

```bash
@aurora memory
```

**Output:**
```
🧠 Memory Leak Detection

✅ Status: No leaks detected
📊 Current Usage: 320MB
📈 Trend: Stable (-5MB last 5min)

Active Intervals: 6 (all with cleanup)
Event Listeners: 24 (all cleaned up)
Arrays: 3/200 items (within limits)
```

### Optimización de Performance

```bash
@aurora optimize
```

**Output:**
```
🚀 Performance Optimization Suggestions

1. Market Data Polling
   Current: 2s interval (30 req/min)
   Suggested: 10s interval (6 req/min)
   Impact: -80% requests

2. Feed Array Limit
   Current: Unlimited
   Suggested: MAX_FEED_ITEMS = 200
   Impact: Prevent infinite growth

3. Visibility-Aware Polling
   Add: document.visibilityState check
   Impact: Save battery on mobile
```

## Integración con Qwen Code

### Auto-Start al Abrir Terminal

Agregar al `.bashrc` o `.zshrc`:

```bash
# Aurora Always-On
alias aurora-start="cd ~/Desktop/REPO && npm run aurora:always"
aurora-start
```

### Integration con VS Code

Agregar a `settings.json`:

```json
{
  "terminal.integrated.commandsToSkipShell": [
    "aurora:always",
    "aurora:status",
    "aurora:stop"
  ]
}
```

## Troubleshooting

### Aurora No Responde

```bash
# Verificar estado
npm run aurora:status

# Reiniciar daemon
npm run aurora:stop
npm run aurora:always
```

### Providers No Disponibles

```bash
# Verificar API keys
cat .env.aurora | grep API_KEY

# Testear conexión
node scripts/aurora-ai-agent.mjs --status
```

### Memory Leak en Daemon

```bash
# Detener daemon
npm run aurora:stop

# Limpiar logs
rm .aurora-daemon.log

# Reiniciar
npm run aurora:always
```

## Logs

### Ver Logs en Tiempo Real

```bash
tail -f .aurora-daemon.log
```

### Log Levels

- `INFO` - Información general
- `DEBUG` - Debugging detallado
- `WARN` - Advertencias
- `ERROR` - Errores críticos

## Estado del Sistema

### Health Check

```bash
@aurora status
```

**Output:**
```
🧠 Aurora System Status

✅ Daemon: RUNNING (PID: 12345)
✅ Providers: 3/3 online
✅ Memory: 320MB (stable)
✅ Intervals: 6 active
✅ Tasks: 14 ready, 3 in progress

Last Check: 2026-03-31 15:30:00
```

## Recursos Adicionales

- **Memory Optimization Playbook:** `docs/MEMORY_OPTIMIZATION_PLAYBOOK.md`
- **Agent Audit Report:** `MEMORY_OPTIMIZATION_BATCH2.md`
- **Aurora AI Agent:** `scripts/aurora-ai-agent.mjs`

---

**Última actualización:** 2026-03-31  
**Estado:** ✅ Production Ready
