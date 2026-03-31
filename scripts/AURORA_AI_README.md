# 🧠 Aurora AI - Multi-Provider System

Sistema inteligente de AI multi-proveedor con selección automática según la tarea.

## 🚀 Quick Start

### 1. Iniciar Interactive Mode
```bash
node scripts/aurora-ai-agent.mjs
```

### 2. Pregunta Rápida
```bash
node scripts/aurora-ai-agent.mjs "Genera un hook useFetch con retry"
```

### 3. Forzar Modelo
```bash
node scripts/aurora-ai-agent.mjs --model kimi "Analiza este código..."
```

## 📊 Providers Disponibles

| Provider | Modelo | Velocidad | Calidad | Costo | Caso de Uso |
|----------|--------|-----------|---------|-------|-------------|
| **Groq** | Llama 3.3 70B | ⚡ 700ms | ⭐⭐⭐⭐⭐ | ¢0.4/1k | Snippets, debugging |
| **Groq** | Llama 3.1 8B | ⚡ 1300ms | ⭐⭐⭐⭐ | ¢0.2/1k | Explicaciones rápidas |
| **Kimi K2** | kimi-k2-instruct | 🧠 3-5s | ⭐⭐⭐⭐⭐ | ¢0.5/1k | Code review, arquitectura |
| **OpenRouter** | Qwen2.5 Coder 32B | 💰 2-3s | ⭐⭐⭐⭐⭐ | ¢0.2/1k | Backup económico |
| **OpenRouter** | Claude 3.5 Sonnet | ⭐ 3-5s | ⭐⭐⭐⭐⭐ | ¢1.5/1k | Premium (sin créditos) |

## 🎯 Selección Automática

El sistema detecta automáticamente el mejor modelo según tu pregunta:

| Palabras Clave | Modelo Seleccionado | Razón |
|----------------|---------------------|-------|
| "analiza", "revisa", "bug", "mejora" | Kimi K2 | 🧠 Análisis profundo |
| "arquitectura", "diseña", "patrón" | Kimi K2 | 🏗️ Complejidad |
| "genera", "crea", "función" | Groq 70B | 🚀 Código rápido |
| "debug", "falla", "error" | Groq 70B | ⚡ Debugging |
| "explica", "qué hace" | Groq 8B | ⚡ Explicación |
| "rápido", "simple" | Groq 8B | ⚡ Máxima velocidad |

## 🛠️ Comandos

### Interactive Mode
```bash
node scripts/aurora-ai-agent.mjs
```

Comandos disponibles:
- `/status` - Ver estado de providers
- `/model <provider>` - Forzar modelo (groq|kimi|openrouter|ollama)
- `/clear` - Limpiar historial
- `/read <archivo>` - Leer archivo
- `/exit` - Salir

### Single Query
```bash
# Automático
node scripts/aurora-ai-agent.mjs "Genera componente React"

# Forzar Groq
node scripts/aurora-ai-agent.mjs --model groq "Genera función TypeScript"

# Forzar Kimi
node scripts/aurora-ai-agent.mjs --model kimi "Analiza este código..."
```

### Ver Estado
```bash
node scripts/aurora-ai-agent.mjs --status
```

## 🔧 MCP Server (Claude Code Integration)

### Configuración en `.mcp.json`:
```json
{
  "mcpServers": {
    "aurora-ai": {
      "command": "node",
      "args": ["scripts/aurora-ai-mcp.mjs"],
      "env": {
        "GROQ_API_KEY": "gsk_...",
        "NVIDIA_API_KEY": "nvapi-...",
        "OPENROUTER_API_KEY": "sk-or-..."
      }
    }
  }
}
```

### Herramientas MCP Disponibles:

#### 1. `ai_chat` - Chat Multi-Provider
```
/aurora-ai ai_chat
  prompt: "Genera un hook useFetch"
  provider: "auto"  # auto|groq|kimi|openrouter
  model: "quality"  # fast|quality|code
```

#### 2. `ai_code_review` - Code Review Profundo
```
/aurora-ai ai_code_review
  code: "const x = ..."
  language: "typescript"
  focus: "security"  # security|performance|best-practices
```

#### 3. `ai_generate_code` - Generación Ultra-Rápida
```
/aurora-ai ai_generate_code
  description: "Función debounce"
  language: "typescript"
  fast: false  # true para máxima velocidad
```

#### 4. `ai_status` - Ver Estado
```
/aurora-ai ai_status
```

## 📁 Archivos del Proyecto

```
scripts/
├── aurora-ai-agent.mjs      # Agente interactivo principal
├── aurora-ai-mcp.mjs        # MCP Server para Claude Code
├── aurora-kimi-agent.mjs    # Legacy Kimi agent
├── test-groq-direct.mjs     # Test Groq
├── test-kimi-real.mjs       # Test Kimi
├── test-openrouter-direct.mjs  # Test OpenRouter
└── test-free-models.mjs     # Test modelos gratuitos

src/services/ai/providers/
├── groq.ts          # Groq provider actualizado
├── openrouter.ts    # OpenRouter provider actualizado
└── (kimi integration via aurora-ai-agent)

src/utils/
└── logger.ts        # Logger mejorado con tipado seguro
```

## 🔑 Configuración de API Keys

Agregar a `.env.nvidia`:
```bash
# Groq (Ultra-rápido)
GROQ_API_KEY=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

# NVIDIA (Kimi K2)
NVIDIA_API_KEY=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

# OpenRouter (Backup)
OPENROUTER_API_KEY=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
```

## 📝 Ejemplos de Uso

### 1. Code Review
```bash
node scripts/aurora-ai-agent.mjs "Analiza este logger y busca bugs:
const logger = {
  debug: (...args) => { if (isDev) console.debug('[DEBUG]', ...args); },
  info: (...args) => { if (isDev) console.info('[INFO]', ...args); },
  warn: (...args) => { console.warn('[WARN]', ...args); },
  error: (...args) => { console.error('[ERROR]', ...args); },
};"
```

**Resultado**: Kimi K2 identifica que `logLevel` no se usa y sugiere mejoras.

### 2. Generar Código
```bash
node scripts/aurora-ai-agent.mjs "Genera un hook useFetch con retry y exponential backoff"
```

**Resultado**: Groq Llama 3.3 70B genera el código en <1 segundo.

### 3. Debugging
```bash
node scripts/aurora-ai-agent.mjs "¿Por qué falla este useEffect?
useEffect(() => {
  fetchData().then(setData);
}, [dependency])"
```

**Resultado**: Groq identifica el problema de dependencias.

### 4. Arquitectura
```bash
node scripts/aurora-ai-agent.mjs "Diseña la arquitectura para un sistema de notificaciones en tiempo real con Convex"
```

**Resultado**: Kimi K2 proporciona análisis arquitectónico detallado.

## 🎯 Flujo Recomendado

```
┌─────────────────────────────────────────┐
│  1. Tarea llega                          │
│         ↓                                │
│  2. Clasificador detecta tipo           │
│         ↓                                │
│  3. Selecciona mejor provider           │
│         ↓                                │
│  4. Ejecuta y retorna                   │
│         ↓                                │
│  5. Si falla → Fallback automático      │
└─────────────────────────────────────────┘
```

## 🔄 Fallback Automático

Si un provider falla, el sistema prueba automáticamente en este orden:
1. Groq (Llama 3.3 70B)
2. Kimi K2 Instruct
3. OpenRouter (Qwen2.5 Coder)
4. Ollama (qwen2.5-coder - local)

## 📊 Comparativa de Costos

| Provider | Modelo | Costo/1k tokens | Ejemplo: 100 queries |
|----------|--------|-----------------|----------------------|
| Groq | 8B | $0.000075 | $0.075 |
| Groq | 70B | $0.0004 | $0.40 |
| Kimi K2 | Instruct | $0.0005 | $0.50 |
| OpenRouter | Qwen2.5 | $0.0002 | $0.20 |
| OpenRouter | Claude 3.5 | $0.015 | $15.00 |

## 🚨 Troubleshooting

### Error: API key no configurada
```bash
# Verificar .env.nvidia
cat .env.nvidia

# Recargar variables
source .env.nvidia
```

### Error: Todos los providers fallaron
1. Verificar conexión a internet
2. Verificar API keys en `.env.nvidia`
3. Probar individualmente:
   ```bash
   node test-groq-direct.mjs
   node test-kimi-real.mjs
   node test-openrouter-direct.mjs
   ```

### MCP Server no conecta
1. Reiniciar Claude Code
2. Verificar `.mcp.json`
3. Probar manualmente:
   ```bash
   node scripts/aurora-ai-mcp.mjs
   ```

## 📚 Recursos

- [Groq Console](https://console.groq.com/)
- [NVIDIA Build](https://build.nvidia.com/)
- [OpenRouter Models](https://openrouter.ai/models)
- [MCP Protocol](https://modelcontextprotocol.io/)

## 🎓 Best Practices

1. **Usar selección automática** para la mayoría de casos
2. **Forzar Kimi** para code reviews complejos
3. **Forzar Groq 70B** para generación de código
4. **Forzar Groq 8B** para preguntas rápidas
5. **Revisar tokens** en respuestas largas

---

**Creado por**: Aurora AI Team
**Versión**: 1.0.0
**Última actualización**: 2025-03-30
