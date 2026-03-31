# 🚀 Setup del Equipo - Aurora AI Multi-Agent System

## 📋 Instrucciones para Configurar en tu PC

### 1. Actualizar el Repositorio
```bash
git pull origin main
```

### 2. Configurar API Keys
```bash
# Copiar el archivo de ejemplo
copy .env.nvidia.example .env.nvidia
```

### 3. Obtener API Keys (¡GRATIS!)

#### Keys Esenciales (Recomendadas)
```
✅ NVIDIA API Key (Kimi K2 + GLM-4 gratis)
   → https://build.nvidia.com/
   → Registrarse y crear API key

✅ Groq API Key (Ultra-rápido)
   → https://console.groq.com/
   → Registrarse y crear API key

✅ OpenRouter API Key (Backup económico)
   → https://openrouter.ai/
   → Registrarse y crear API key
```

#### Keys Opcionales (Premium)
```
⏸️ Anthropic API Key (Claude 3.5 Sonnet)
   → https://console.anthropic.com/
   → Opcional, el sistema funciona sin esta

⏸️ DeepSeek API Key
   → https://platform.deepseek.com/
   → Opcional, el sistema funciona sin esta
```

### 4. Editar `.env.nvidia`
```bash
# Abrir con tu editor
notepad .env.nvidia

# Reemplazar las keys con las tuyas:
NVIDIA_API_KEY=nvapi-TU_KEY_AQUI
GROQ_API_KEY=gsk_TU_KEY_AQUI
OPENROUTER_API_KEY=sk-or-TU_KEY_AQUI
```

### 5. Verificar Instalación
```bash
# Verificar que Node.js esté instalado
node --version

# Instalar dependencias (si es necesario)
npm install undici
```

### 6. Probar el Sistema
```bash
# Verificar providers disponibles
node scripts/aurora-ai-agent.mjs --status

# Deberías ver al menos 3 providers disponibles:
# ✅ Groq
# ✅ Kimi K2 (NVIDIA)
# ✅ GLM-4 (NVIDIA)
# ✅ OpenRouter
# ✅ Ollama (si está instalado)
```

### 7. ¡Empezar a Usar!
```bash
# Interactive mode
node scripts/aurora-ai-agent.mjs

# O pregunta rápida
node scripts/aurora-ai-agent.mjs "Genera componente React"
```

---

## 🎯 Configuración Automática

El sistema está configurado para trabajar **automáticamente**:

### Routing Inteligente
```
✅ El sistema selecciona el mejor provider según la tarea
✅ Activa subagentes especializados automáticamente
✅ Hace fallback si un provider falla
✅ Muestra costos en tiempo real
```

### No Necesitás Configurar Nada Más
```
✅ MCP Server ya está configurado en .mcp.json
✅ Subagentes están pre-configurados
✅ Prompts de sistema están optimizados
✅ Fallback chain está establecida
```

---

## 📊 Providers Disponibles

| Provider | Velocidad | Costo | Esencial? |
|----------|-----------|-------|-----------|
| **Groq** | ⚡ 700ms | $0.0004/1k | ✅ SÍ |
| **Kimi K2** | 🧠 3-5s | $0.0005/1k | ✅ SÍ |
| **GLM-4** | 💎 2-3s | **GRATIS** | ✅ SÍ |
| **OpenRouter** | 💰 2-3s | $0.0002/1k | ✅ SÍ |
| **Ollama** | 🔒 Offline | GRATIS | ⏸️ Opcional |
| **Claude 3.5** | ⭐ 3-5s | $0.003/1k | ⏸️ Opcional |
| **DeepSeek** | 💎 2-4s | $0.00027/1k | ⏸️ Opcional |

**Mínimo recomendado:** NVIDIA + Groq + OpenRouter

---

## 🤖 Subagentes Disponibles

Todos los subagentes están **pre-configurados**:

```
✅ security-audit      → Auditoría de seguridad
✅ performance-analyzer → Optimización de performance
✅ system-designer     → Arquitectura de sistemas
✅ pattern-expert      → Patrones de diseño
✅ bug-hunter          → Debugging profundo
✅ tutor               → Explicaciones didácticas
✅ senior-reviewer     → Code review senior
✅ test-generator      → Generación de tests
```

**No necesitás configurarlos** - se activan automáticamente según la tarea.

---

## 🔧 Comandos Principales

### Interactive Mode
```bash
node scripts/aurora-ai-agent.mjs
```

### Comandos Dentro del Interactive Mode
```
/status          - Ver providers disponibles
/model groq      - Forzar Groq
/model kimi      - Forzar Kimi K2
/model glm       - Forzar GLM-4 (gratis)
/clear           - Limpiar historial
/exit            - Salir
```

### Pregunta Rápida
```bash
node scripts/aurora-ai-agent.mjs "Genera hook useFetch"
```

### Ver Estado
```bash
node scripts/aurora-ai-agent.mjs --status
```

---

## 📁 Estructura de Archivos

```
REPO/
├── scripts/
│   ├── aurora-ai-agent.mjs      # ⭐ Agente principal
│   ├── aurora-ai-mcp.mjs        # MCP para Claude Code
│   ├── load-aurora-env.mjs      # Carga de .env
│   ├── AURORA_AI_README.md      # Guía completa
│   └── SUBAGENTS_PROTOCOL.md    # Subagentes
│
├── .env.nvidia.example          # Ejemplo de configuración
├── .env.nvidia                  # TU configuración (NO SUBIR)
├── .mcp.json                    # MCP config
└── SETUP_EQUIPO.md              # Este archivo
```

---

## 🚨 Troubleshooting

### Error: API key no configurada
```bash
# Verificar que .env.nvidia existe
cat .env.nvidia

# Verificar que las keys están cargadas
node scripts/aurora-ai-agent.mjs --status
```

### Error: Provider no disponible
```
1. Verificar API key en .env.nvidia
2. Verificar conexión a internet
3. Probar individualmente:
   node test-groq-direct.mjs
```

### Error: Todos los providers fallaron
```
1. Verificar internet
2. Verificar .env.nvidia
3. Reiniciar terminal
4. Usar Ollama (offline):
   node scripts/aurora-ai-agent.mjs --model ollama "..."
```

---

## 💰 Costos Estimados

### Configuración Mínima (Recomendada)
```
NVIDIA + Groq + OpenRouter:
100 tareas/día → $0.038 USD
Monthly → $1.14 USD
```

### Con Todas las Keys
```
Todos los providers:
100 tareas/día → $0.038 USD (optimizado)
Monthly → $1.14 USD
```

**El sistema automáticamente usa los providers más baratos!**

---

## 🎯 Flujo de Trabajo Automático

```
1. Usuario hace pregunta
       ↓
2. Sistema clasifica tarea
       ↓
3. Selecciona mejor provider
       ↓
4. Activa subagentes si es necesario
       ↓
5. Ejecuta y retorna resultado
       ↓
6. Muestra costo y tokens
```

**¡Todo automático! No necesitás configurar nada.**

---

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| `README_AURORA_AI_FINAL.md` | Guía ejecutiva completa |
| `scripts/AURORA_AI_README.md` | Documentación técnica |
| `scripts/SUBAGENTS_PROTOCOL.md` | Sistema de subagentes |
| `OPTIMIZACION_FLUJO_TRABAJO.md` | Mejores prácticas |
| `ESTADO_FINAL_SISTEMA.md` | Estado actual del sistema |

---

## ✅ Checklist de Instalación

```
☐ git pull origin main
☐ Copiar .env.nvidia.example a .env.nvidia
☐ Obtener NVIDIA API Key (https://build.nvidia.com/)
☐ Obtener Groq API Key (https://console.groq.com/)
☐ Obtener OpenRouter API Key (https://openrouter.ai/)
☐ Editar .env.nvidia con las keys
☐ Ejecutar: node scripts/aurora-ai-agent.mjs --status
☐ Probar: node scripts/aurora-ai-agent.mjs "Hola"
```

---

## 🎉 ¡Listo!

Una vez completado el setup, el sistema funciona **automáticamente**:

```bash
# Solo necesitás ejecutar:
node scripts/aurora-ai-agent.mjs

# El sistema se encarga de:
✅ Seleccionar mejor provider
✅ Activar subagentes
✅ Optimizar costos
✅ Mostrar resultados
```

**¡A trabajar de forma inteligente y eficiente!** 🚀

---

**Versión**: 2.0.0  
**Actualizado**: 2025-03-30  
**Estado**: ✅ Producción
