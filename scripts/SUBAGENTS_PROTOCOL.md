# 🧠 Aurora AI - Sistema Inteligente de Subagentes

## 🎯 Visión General

Sistema multi-agente con **selección automática inteligente** y **subagentes especializados** para maximizar eficiencia y minimizar costos de tokens.

---

## 📊 Providers Disponibles

| Provider | Modelo | Velocidad | Calidad | Costo/1k | Estado | Caso de Uso |
|----------|--------|-----------|---------|----------|--------|-------------|
| **Groq** | Llama 3.3 70B | ⚡ 700ms | ⭐⭐⭐⭐⭐ | $0.0004 | ✅ | Snippets, debugging |
| **Groq** | Llama 3.1 8B | ⚡ 1300ms | ⭐⭐⭐⭐ | $0.0002 | ✅ | Explicaciones |
| **Kimi K2** | kimi-k2-instruct | 🧠 3-5s | ⭐⭐⭐⭐⭐ | $0.0005 | ✅ | Code review, arquitectura |
| **GLM-4.7** | glm-4.7 | 💎 2-3s | ⭐⭐⭐⭐⭐ | **$0.0000** | ✅ | **¡GRATIS!** Explicaciones, tutoriales |
| **Claude 3.5** | claude-3-5-sonnet | ⭐ 3-5s | ⭐⭐⭐⭐⭐ | $0.003 | ✅ | Premium, producción |
| **DeepSeek V3** | deepseek-chat | 💎 2-4s | ⭐⭐⭐⭐⭐ | $0.00027 | ⏳ | Excelente código (barato) |
| **OpenRouter** | Qwen2.5 Coder | 💰 2-3s | ⭐⭐⭐⭐⭐ | $0.0002 | ✅ | Backup económico |
| **Ollama** | qwen2.5-coder | 🔒 10-30s | ⭐⭐⭐ | $0.0000 | ✅ | Offline/local |

---

## 🤖 Sistema de Subagentes

### ¿Qué son los Subagentes?

Los **subagentes** son especialistas que se activan automáticamente según el tipo de tarea. Cada subagente tiene un prompt especializado y proporciona análisis profundo en su área.

### Subagentes Disponibles

| Subagente | Especialidad | Se Activa Cuando |
|-----------|--------------|------------------|
| **security-audit** | Seguridad OWASP | "seguridad", "vulnerabilidad", "XSS", "CSRF" |
| **performance-analyzer** | Optimización | "performance", "lento", "optimiza" |
| **system-designer** | Arquitectura | "arquitectura", "diseña", "sistema" |
| **pattern-expert** | Patrones de diseño | "patrón", "mejor práctica" |
| **bug-hunter** | Debugging profundo | "bug", "falla", "no funciona" |
| **tutor** | Enseñanza didáctica | "enséñame", "tutorial", "aprende" |
| **senior-reviewer** | Code review senior | "premium", "producción" |
| **test-generator** | Tests automáticos | "tests", "unit tests" |

### Ejemplo de Activación de Subagentes

```bash
# Usuario pide code review
node scripts/aurora-ai-agent.mjs "Analiza este código y busca bugs de seguridad"

# Sistema automáticamente:
1. Clasifica → codeReview + security
2. Selecciona → Kimi K2 (mejor para análisis)
3. Activa subagents → security-audit + performance-analyzer
4. Ejecuta → Kimi principal + 2 subagentes especializados
5. Retorna → Análisis completo con 3 perspectivas
```

### Output con Subagentes

```
══════════════════════════════════════════════
[KIMI] moonshotai/kimi-k2-instruct
⚡ 4235ms | Tokens: 1847
💰 Costo: $0.000923 USD
🤖 Subagents: Security Auditor, Performance Analyzer
══════════════════════════════════════════════

[Análisis principal de Kimi]
1. Bugs identificados...
2. Mejoras sugeridas...
3. Código reescrito...

══════════════════════════════════════════════
[SUBAGENTS RESULTS]
══════════════════════════════════════════════

[Security Auditor]
Vulnerabilidades encontradas:
- XSS potencial en línea 23
- Falta validación de input
- CSRF token no verificado
Recomendaciones: ...

[Performance Analyzer]
Bottlenecks detectados:
- Loop anidado O(n²) en línea 45
- Query N+1 en base de datos
- Falta caching en datos estáticos
Recomendaciones: ...
```

---

## 🎯 Routing Inteligente

### Clasificador de Tareas

El sistema detecta automáticamente el mejor provider según palabras clave:

```javascript
"analiza", "revisa", "bug"      → Kimi K2 + subagents
"arquitectura", "diseña"        → Kimi K2 + system-designer
"seguridad", "vulnerabilidad"   → Kimi K2 + security-audit
"genera", "crea", "función"     → Groq Llama 3.3 70B
"debug", "falla", "error"       → Groq 70B + bug-hunter
"explica", "qué hace"           → GLM-4.7 (¡GRATIS!)
"enséñame", "tutorial"          → GLM-4.7 + tutor (¡GRATIS!)
"rápido", "simple"              → Groq Llama 3.1 8B
"premium", "producción"         → Claude 3.5 + senior-reviewer
"gratis", "free"                → GLM-4.7 (¡GRATIS!)
```

### Estrategia de Optimización de Tokens

```
┌─────────────────────────────────────────┐
│  Tarea llega                            │
│         ↓                               │
│  ¿Es simple? → Groq 8B (¢0.2/1k)       │
│         ↓                               │
│  ¿Es código? → Groq 70B (¢0.4/1k)      │
│         ↓                               │
│  ¿Es análisis? → Kimi K2 (¢0.5/1k)     │
│         ↓                               │
│  ¿Es explicación? → GLM-4.7 (GRATIS)   │
│         ↓                               │
│  ¿Es premium? → Claude 3.5 (¢3/1k)     │
│         ↓                               │
│  ¿Necesita subagentes? → Activa        │
│         ↓                               │
│  Si falla → Fallback automático        │
└─────────────────────────────────────────┘
```

---

## 💰 Estrategia de Costos

### Niveles de Prioridad

| Nivel | Provider | Costo | Uso Recomendado |
|-------|----------|-------|-----------------|
| **1** | GLM-4.7 | $0 | Explicaciones, tutoriales, preguntas generales |
| **2** | Groq 8B | $0.0002/1k | Tareas simples, explicaciones rápidas |
| **3** | Groq 70B | $0.0004/1k | Generación de código, debugging |
| **4** | OpenRouter | $0.0002/1k | Backup económico |
| **5** | DeepSeek | $0.00027/1k | Código complejo (cuando esté disponible) |
| **6** | Kimi K2 | $0.0005/1k | Code review, arquitectura, seguridad |
| **7** | Claude 3.5 | $0.003/1k | Tareas críticas, producción |

### Ejemplo de Costos

```
Tarea: "Genera un hook useFetch con retry"
→ Groq 70B, 500 tokens = $0.0002 USD

Tarea: "Analiza seguridad de este auth"
→ Kimi K2 + security-audit, 2000 tokens = $0.001 USD

Tarea: "¿Cómo funciona useEffect?"
→ GLM-4.7, 800 tokens = $0.0000 USD (¡GRATIS!)

Tarea: "Review premium para producción"
→ Claude 3.5 + senior-reviewer, 3000 tokens = $0.009 USD
```

---

## 🔧 Comandos y Uso

### Interactive Mode
```bash
node scripts/aurora-ai-agent.mjs
```

### Comandos Disponibles
```
/status          - Ver estado de providers
/model <name>    - Forzar modelo (groq|kimi|glm|claude|openrouter)
/clear           - Limpiar historial
/read <archivo>  - Leer archivo
/exit            - Salir
```

### Ejemplos de Uso

#### 1. Code Review con Subagentes
```bash
node scripts/aurora-ai-agent.mjs "Analiza este código y busca bugs:
const auth = (req, res) => {
  const token = req.headers.authorization;
  const user = decode(token);
  req.user = user;
  next();
};"
```

**Resultado esperado:**
- Provider: Kimi K2
- Subagents: Security Auditor, Bug Hunter
- Análisis: 3 perspectivas (principal + 2 subagentes)

#### 2. Explicación Gratuita
```bash
node scripts/aurora-ai-agent.mjs "Explícame cómo funciona React useEffect"
```

**Resultado esperado:**
- Provider: GLM-4.7
- Costo: $0.0000
- Explicación didáctica completa

#### 3. Generación Rápida de Código
```bash
node scripts/aurora-ai-agent.mjs "Genera un componente React para mostrar usuarios"
```

**Resultado esperado:**
- Provider: Groq Llama 3.3 70B
- Velocidad: <1 segundo
- Código TypeScript completo

#### 4. Forzar Provider
```bash
# Usar GLM-4.7 (gratis)
node scripts/aurora-ai-agent.mjs --model glm "Genera función debounce"

# Usar Claude 3.5 (premium)
node scripts/aurora-ai-agent.mjs --model claude "Review de arquitectura"
```

---

## 📋 Flujo de Trabajo Inteligente

### 1. Detección de Intención

```javascript
Usuario: "¿Por qué falla mi autenticación?"

Clasificador detecta:
- Keywords: "falla", "autenticación"
- Tipo: debugging + security
- Provider: Groq 70B (rápido)
- Subagents: bug-hunter, security-audit
```

### 2. Ejecución en Paralelo

```
┌─────────────────────────────────────────┐
│  Provider Principal (Groq 70B)          │
│  "Debug: ¿Por qué falla auth?"          │
│  ↓                                      │
│  Respuesta en 700ms                     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Subagent 1: Bug Hunter                 │
│  "Encuentra la raíz del problema"       │
│  ↓                                      │
│  Respuesta en 800ms                     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Subagent 2: Security Auditor           │
│  "Audita seguridad de auth"             │
│  ↓                                      │
│  Respuesta en 900ms                     │
└─────────────────────────────────────────┘
```

### 3. Consolidación de Resultados

```
Respuesta final:
1. Análisis principal (Groq)
2. Bug Hunter: "El token no se valida correctamente"
3. Security Auditor: "Falta verificación de firma JWT"
4. Solución consolidada
```

---

## 🚀 Optimización de Tokens

### Estrategias Implementadas

1. **Selección por Complejidad**
   - Simple → Modelo barato
   - Complejo → Modelo caro

2. **Subagentes On-Demand**
   - Solo se activan si son necesarios
   - Evita tokens innecesarios

3. **Fallback Automático**
   - Si un provider caro falla → usa barato
   - Si un provider rápido falla → usa preciso

4. **GLM-4.7 para Explicaciones**
   - ¡Completamente gratis!
   - Calidad excelente para tutoriales

5. **Historial Limitado**
   - Máximo 10 mensajes en memoria
   - Evita acumulación de tokens

### Ejemplo de Ahorro

**Sin optimización:**
```
Todas las tareas → Claude 3.5
100 preguntas × 500 tokens × $0.003/1k = $0.15 USD
```

**Con optimización:**
```
40 preguntas simples → GLM-4.7 (gratis) = $0.00
30 snippets → Groq 70B × 300 tokens = $0.0036
20 explicaciones → GLM-4.7 (gratis) = $0.00
10 code reviews → Kimi K2 × 1500 tokens = $0.0075
─────────────────────────────────────────────
Total: $0.0111 USD (93% más barato)
```

---

## 🎓 Mejores Prácticas

### 1. Usa el Provider Correcto

```bash
✅ "Genera función" → Automático (Groq 70B)
✅ "Analiza seguridad" → Automático (Kimi + subagents)
✅ "Explícame esto" → Automático (GLM-4.7 gratis)
❌ Forzar Claude 3.5 para todo (caro)
```

### 2. Activa Subagentes Estratégicamente

```bash
✅ "Analiza seguridad y performance" → 2 subagents
✅ "Review de arquitectura" → system-designer + pattern-expert
❌ Pedir subagentes para tareas simples
```

### 3. Monitorea Costos

```bash
# El sistema muestra:
⚡ 712ms | Tokens: 523
💰 Costo: $0.000209 USD
🆓 ¡GRATIS! (cuando usa GLM-4.7)
```

### 4. Aprovecha GLM-4.7 (Gratis)

```bash
✅ "¿Qué es TypeScript?"
✅ "Explícame useEffect"
✅ "Tutorial de React hooks"
✅ "¿Cómo funciona async/await?"
```

---

## 📊 Comparativa con Otros Sistemas

| Característica | Aurora AI | Claude Code | ChatGPT |
|----------------|-----------|-------------|---------|
| Multi-provider | ✅ 7 providers | ❌ 1 provider | ❌ 1 provider |
| Subagents | ✅ 8 especializados | ❌ No tiene | ❌ No tiene |
| Modelo gratis | ✅ GLM-4.7 | ❌ No tiene | ❌ Limitado |
| Costo óptimo | ✅ Auto-select | ❌ Fijo | ❌ Fijo |
| Fallback auto | ✅ Sí | ❌ No | ❌ No |
| Offline | ✅ Ollama | ❌ No | ❌ No |

---

## 🔮 Futuras Mejoras

- [ ] Agregar más subagentes (DB expert, UX reviewer)
- [ ] Caching de respuestas frecuentes
- [ ] Fine-tuning de prompts por dominio
- [ ] Integración con Convex para persistencia
- [ ] Dashboard de costos en tiempo real
- [ ] Más modelos gratuitos (Llama 3.2, Phi-3)

---

**Versión**: 2.0.0
**Última actualización**: 2025-03-30
**Estado**: ✅ Producción
