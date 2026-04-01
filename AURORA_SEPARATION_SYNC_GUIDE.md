# Aurora Separation - Guía de Sincronización

**Fecha:** 2026-04-01  
**Estado:** COMPLETADO ✅  
**Impacto:** Todos los desarrolladores deben actualizar su entorno

---

## 🚨 CAMBIO CRÍTICO: Aurora Separado de TradeShare

### ¿Qué pasó?

Aurora AI Framework fue separado de TradeShare en un proyecto independiente. Ahora conviven **dos proyectos** en el mismo repositorio:

```
trade-share/          # TradeShare Super App (original)
aurora/               # Aurora AI Framework (NUEVO - independiente)
```

---

## 📋 Pasos de Sincronización (OBLIGATORIO)

### **Paso 1: Hacer Git Pull**

```bash
cd "C:\Users\Brai\Desktop\PROYECTO ACTUAL\trade-share"
git pull origin main
```

**Verificar que llegaron los nuevos archivos:**
```bash
# Deberías ver la carpeta aurora/
dir aurora

# Debería mostrar:
# - package.json
# - README.md
# - ARCHITECTURE.md
# - core/
# - cli/
# - scripts/
# - etc.
```

---

### **Paso 2: Instalar Dependencias de Aurora**

```bash
cd aurora
npm install
```

**Verificar instalación:**
```bash
npm list --depth=0
# Debería mostrar @aurora/ai-framework@1.0.0
```

---

### **Paso 3: Configurar Variables de Entorno**

Aurora requiere sus propias variables de entorno.

**Copiar el ejemplo:**
```bash
copy .env.aurora.example .env.aurora
```

**Editar `.env.aurora` y agregar:**
```bash
# AI Providers (OBLIGATORIO - al menos uno)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxx

# Opcional: Modelos locales
OLLAMA_BASE_URL=http://127.0.0.1:11434/api/generate

# Opcional: Notion integration
NOTION_API_KEY=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Aurora Settings
AURORA_PORT=4310
AURORA_MEMORY_LIMIT=500MB
AURORA_LOG_LEVEL=info
```

---

### **Paso 4: Verificar Integración TradeShare ↔ Aurora**

TradeShare ahora usa **compatibility wrappers** para llamar a Aurora.

**Testear desde TradeShare:**
```bash
cd ..  # Volver a trade-share/
npm run inicio
```

**Deberías ver:**
```
╔══════════════════════════════════════════════════════╗
║   🌊 @aurora — INICIO DE SESIÓN                      ║
║   Agente Integrador Principal                        ║
║   Fuente de verdad: Notion                           ║
╚══════════════════════════════════════════════════════╝

🤖 AURORA AI PRESENCE ACTIVADA
✓ @aurora conectado a Notion como: ...
```

---

### **Paso 5: Testear Aurora Independiente**

Aurora ahora puede correr como servicio independiente.

**Iniciar Aurora API:**
```bash
cd aurora
npm run api
```

**Deberías ver:**
```
🧠 Aurora API Server starting...
✅ API listening on http://localhost:4310
📊 Endpoints: /chat, /review, /analyze, /optimize, /memory, /status
```

**En otra terminal, testear:**
```bash
curl http://localhost:4310/status
# Debería responder: {"status": "ok", "version": "1.0.0"}
```

---

### **Paso 6: Iniciar Aurora Daemon (Always-On)**

Para tener Aurora siempre presente:

```bash
cd aurora
npm run daemon
```

**Deberías ver:**
```
🧠 Aurora Daemon starting...
✅ Daemon started (PID: 12345)
🔌 Aurora presence activated in chat
✨ Commands: @aurora help, @aurora review, @aurora analyze, ...
```

---

## 🔌 Comandos Disponibles

### **Desde TradeShare (wrappers):**

```bash
# Iniciar sesión con Aurora
npm run inicio

# Levantar Aurora API
npm run aurora:api

# Abrir shell interactivo
npm run aurora:shell

# Ver estado
npm run aurora:status

# Health check
npm run aurora:health
```

### **Desde Aurora (directo):**

```bash
cd aurora

# Daemon always-on
npm run daemon
npm run daemon:stop
npm run daemon:status

# API server
npm run api

# CLI interactivo
npm run shell
npm run cli

# Sync con Notion
npm run sync:notion

# Backup
npm run backup

# Health check
npm run health
npm run scorecard
npm run doctor
```

---

## 📁 Nueva Estructura del Proyecto

```
trade-share/
├── src/                    # Frontend TradeShare
├── convex/                 # Backend Convex
├── server.ts               # Express server
├── scripts/
│   ├── aurora-inicio.mjs   # ← Wrapper (redirige a aurora/)
│   ├── aurora-api.mjs      # ← Wrapper
│   ├── aurora-shell.mjs    # ← Wrapper
│   └── ...                 # ← Más wrappers
├── aurora/                 # ← NUEVO: Aurora independiente
│   ├── package.json
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── core/
│   │   ├── daemon/         # Always-on daemon
│   │   ├── providers/      # Groq, Kimi, OpenRouter
│   │   ├── memory/         # Memory system
│   │   └── commands/       # @aurora commands
│   ├── cli/
│   ├── api/
│   ├── scripts/
│   └── ...
├── package.json
└── .env.local
```

---

## 🆘 Troubleshooting

### **Error: "Cannot find module '../../aurora/cli/aurora-inicio.mjs'"**

**Causa:** Los wrappers no encuentran Aurora.

**Solución:**
```bash
# Verificar que aurora/ existe
dir aurora

# Si no existe, hacer git pull again
git pull origin main

# Reinstalar dependencias de aurora
cd aurora
npm install
```

---

### **Error: "AURORA_API_KEY not found"**

**Causa:** Faltan variables de entorno.

**Solución:**
```bash
# Copiar ejemplo
copy .env.aurora.example .env.aurora

# Editar .env.aurora y agregar al menos un provider:
GROQ_API_KEY=gsk_...
```

---

### **Error: "Port 4310 already in use"**

**Causa:** Aurora API ya está corriendo.

**Solución:**
```bash
# Matar proceso existente
taskkill /F /IM node.exe

# O cambiar puerto en .env.aurora
AURORA_PORT=4311
```

---

### **Error: "Notion API connection failed"**

**Causa:** Credenciales de Notion inválidas.

**Solución:**
1. Verificar `.env.aurora` tiene `NOTION_API_KEY` y `NOTION_DATABASE_ID`
2. Testear conexión:
```bash
node scripts/aurora-notion-sync.mjs
```

---

## 📊 Estado de la Migración

| Componente | Estado | Archivos |
|------------|--------|----------|
| **TradeShare** | ✅ Estable | 400+ |
| **Aurora** | ✅ Independiente | 131+ |
| **Wrappers** | ✅ Creados | 20 |
| **Documentación** | ✅ Completa | 5 archivos |

---

## 🎯 Próximos Pasos (Fase 4)

Después de sincronizar, vamos a implementar en Aurora:

1. **KAIROS** - Always-on assistant proactivo
2. **Dream** - Memory consolidation system
3. **Coordinator Mode** - Multi-agent orchestration
4. **Buddy** - Companion system (opcional)

Ver `docs/CLAUDE_CODE_LEAK_ANALYSIS.md` para detalles.

---

## 📞 Soporte

**Si algo falla:**

1. Verificar `AGENT_LOG.md` para errores recientes
2. Revisar `.aurora-daemon.log` si el daemon falla
3. Correr `npm run aurora:health` para diagnóstico
4. Abrir issue en GitHub si es bug

---

**Última actualización:** 2026-04-01  
**Responsable:** Aurora Development Team  
**Estado:** ✅ COMPLETADO
