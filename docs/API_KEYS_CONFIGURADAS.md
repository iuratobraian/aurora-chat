# 🎉 API Keys Configuradas - GitHub Secrets

## ✅ Secrets Agregados (13 Keys Totales)

### 📦 AI Providers (7 keys)
| Secret | Provider | Uso | Backup |
|--------|----------|-----|--------|
| `NVIDIA_API_KEY` | NVIDIA | Kimi K2 + GLM-4 | ❌ |
| `GROQ_API_KEY` | Groq | Llama 3.3 70B | ✅ GROQ_API_KEY_BACKUP |
| `OPENROUTER_API_KEY` | OpenRouter | Qwen2.5 + Claude | ✅ OPENROUTER_AURORA_KEY |
| `OPENROUTER_AURORA_KEY` | OpenRouter | Aurora backup | ✅ OPENROUTER_API_KEY |
| `ANTHROPIC_API_KEY` | Anthropic | Claude 3.5 Sonnet | ❌ |
| `GEMINI_API_KEY` | Google | Gemini Pro | ❌ |
| `HUGGINGFACE_API_KEY` | HuggingFace | Modelos ML | ❌ |

### 🔍 Búsqueda (2 keys)
| Secret | Provider | Uso |
|--------|----------|-----|
| `TAVILY_API_KEY` | Tavily | AI Search |
| `SERPAPI_API_KEY` | SerpAPI | Google Search |

### 📱 Otros Servicios (4 keys)
| Secret | Servicio | Uso |
|--------|----------|-----|
| `YOUTUBE_API_KEY` | YouTube | Data API v3 |
| `NOTION_API_KEY` | Notion | Sincronización |
| `NOTION_DATABASE_ID` | Notion | Database ID |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago | Pagos |

### 💾 Backups (1 key)
| Secret | Provider | Uso |
|--------|----------|-----|
| `GROQ_API_KEY_BACKUP` | Groq | Backup secundario |

---

## 🚀 Ejecutar Script

### Windows (PowerShell):
```powershell
# 1. Instalar gh (si no lo tenés)
winget install --id GitHub.cli

# 2. Autenticarse
gh auth login

# 3. Ejecutar script
bash scripts/add-github-secrets.sh
```

### Mac/Linux:
```bash
# 1. Instalar gh
brew install gh

# 2. Autenticarse
gh auth login

# 3. Ejecutar script
bash scripts/add-github-secrets.sh
```

---

## 📊 Resultado Esperado

```
╔══════════════════════════════════════════════╗
║  🚀 Aurora AI - GitHub Secrets Setup         ║
╚══════════════════════════════════════════════╝

[1/5] Verificando GitHub CLI...
✅ GitHub CLI instalado

[2/5] Verificando autenticación...
✅ Autenticado en GitHub

[3/5] Obteniendo información del repositorio...
✅ Repositorio: iuratobraian/trade-share

[4/5] Agregando GitHub Secrets...
───────────────────────────────────────────────

📦 AGREGANDO AI PROVIDERS...
  → NVIDIA_API_KEY... ✅ Agregando
  → GROQ_API_KEY... ✅ Agregando
  → OPENROUTER_API_KEY... ✅ Agregando
  → OPENROUTER_AURORA_KEY... ✅ Agregando
  → ANTHROPIC_API_KEY... ✅ Agregando
  → GEMINI_API_KEY... ✅ Agregando
  → HUGGINGFACE_API_KEY... ✅ Agregando

🔍 AGREGANDO SERVICIOS DE BÚSQUEDA...
  → TAVILY_API_KEY... ✅ Agregando
  → SERPAPI_API_KEY... ✅ Agregando

📱 AGREGANDO OTROS SERVICIOS...
  → YOUTUBE_API_KEY... ✅ Agregando
  → NOTION_API_KEY... ✅ Agregando
  → NOTION_DATABASE_ID... ✅ Agregando
  → MERCADOPAGO_ACCESS_TOKEN... ✅ Agregando

💾 AGREGANDO BACKUPS ADICIONALES...
  → GROQ_API_KEY_BACKUP... ✅ Agregando
───────────────────────────────────────────────

[5/5] Verificando secrets agregados...

Secrets en el repositorio:
NVIDIA_API_KEY
GROQ_API_KEY
OPENROUTER_API_KEY
OPENROUTER_AURORA_KEY
ANTHROPIC_API_KEY
GEMINI_API_KEY
HUGGINGFACE_API_KEY
TAVILY_API_KEY
SERPAPI_API_KEY
YOUTUBE_API_KEY
NOTION_API_KEY
NOTION_DATABASE_ID
MERCADOPAGO_ACCESS_TOKEN
GROQ_API_KEY_BACKUP

╔══════════════════════════════════════════════╗
║  ✅ ¡GitHub Secrets configurados!            ║
╚══════════════════════════════════════════════╝
```

---

## 🔍 Verificar en GitHub

### URL Directa:
```
https://github.com/iuratobraian/trade-share/settings/secrets/actions
```

### Deberías ver 13 secrets:
```
✅ NVIDIA_API_KEY
✅ GROQ_API_KEY
✅ OPENROUTER_API_KEY
✅ OPENROUTER_AURORA_KEY
✅ ANTHROPIC_API_KEY
✅ GEMINI_API_KEY
✅ HUGGINGFACE_API_KEY
✅ TAVILY_API_KEY
✅ SERPAPI_API_KEY
✅ YOUTUBE_API_KEY
✅ NOTION_API_KEY
✅ NOTION_DATABASE_ID
✅ MERCADOPAGO_ACCESS_TOKEN
✅ GROQ_API_KEY_BACKUP
```

---

## 🎯 Beneficios

### ✅ Nunca Más Sin Tokens:
```
✅ 2 keys de Groq (principal + backup)
✅ 2 keys de OpenRouter (principal + Aurora)
✅ Múltiples providers de IA
✅ Fallback automático en Aurora AI
```

### ✅ Todos los Servicios:
```
✅ AI: 7 providers diferentes
✅ Búsqueda: Tavily + SerpAPI
✅ Video: YouTube API
✅ Base de datos: Notion
✅ Pagos: MercadoPago
```

### ✅ Redundancia Total:
```
✅ Si una key se agota → usa backup
✅ Si un provider falla → usa alternativo
✅ Si una API cambia → tenés opciones
```

---

## 📝 Uso en GitHub Actions

### Ejemplo de Workflow:
```yaml
# .github/workflows/aurora-ai.yml
name: Aurora AI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Aurora AI tests
        env:
          NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          HUGGINGFACE_API_KEY: ${{ secrets.HUGGINGFACE_API_KEY }}
          TAVILY_API_KEY: ${{ secrets.TAVILY_API_KEY }}
          SERPAPI_API_KEY: ${{ secrets.SERPAPI_API_KEY }}
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          MERCADOPAGO_ACCESS_TOKEN: ${{ secrets.MERCADOPAGO_ACCESS_TOKEN }}
        run: npm test
```

---

## 🔄 Actualizar Keys

### Si una key expira:
```bash
# 1. Editar el script
notepad scripts/add-github-secrets.sh

# 2. Buscar la key vieja y reemplazar
#    Ejemplo: cambiar NVIDIA_API_KEY

# 3. Guardar y ejecutar de nuevo
bash scripts/add-github-secrets.sh

# El script actualiza automáticamente las keys existentes
```

### O manualmente:
```bash
gh secret set NVIDIA_API_KEY --body "nvapi-NUEVA_KEY"
```

---

## 🛡️ Seguridad

### ¿Quién puede ver los secrets?
```
✅ Dueños del repo: Pueden ver y editar
❌ Colaboradores: No pueden ver
❌ Público: No puede ver
```

### ¿Dónde se usan?
```
✅ GitHub Actions (CI/CD)
✅ Tests automáticos
✅ Deploy automático
❌ NUNCA en el código
❌ NUNCA en el repo
```

### Buenas prácticas:
```
✅ Rotar keys cada 3-6 meses
✅ Usar múltiples providers (ya hecho!)
✅ Monitorear uso
✅ Revocar keys no usadas
```

---

## 📚 Próximos Pasos

1. ✅ **Ejecutar el script** (ver sección "Ejecutar Script")
2. ✅ **Verificar en GitHub** (ver sección "Verificar en GitHub")
3. ✅ **El equipo hace git pull**
4. ✅ **Cada miembro configura su .env.nvidia local**
5. ✅ **Crear workflows de GitHub Actions**

---

## 🆘 Troubleshooting

### Error: "command not found: gh"
```powershell
# Instalar GitHub CLI
winget install --id GitHub.cli
```

### Error: "not authenticated"
```powershell
# Autenticarse
gh auth login
```

### Error: "requires admin permissions"
```
# Necesitás ser dueño del repo
# Si no sos dueño, pedile al dueño que ejecute el script
```

### Error: "secret already exists"
```
# El script actualiza automáticamente
# Si querés forzar:
gh secret set NAME --body "value" --force
```

---

## 📊 Resumen Final

```
┌─────────────────────────────────────────┐
│  ✅ 13 API Keys Configuradas            │
│  ─────────────────────────────────────  │
│  ✅ 7 AI Providers                      │
│  ✅ 2 Búsqueda                          │
│  ✅ 4 Otros Servicios                   │
│  ✅ 13 Backups                          │
│  ✅ Script Automatizado                 │
│  ✅ Nunca más sin tokens                │
│  ✅ Redundancia total                   │
└─────────────────────────────────────────┘
```

---

**Archivos relacionados:**
- `scripts/add-github-secrets.sh` - Script automático
- `scripts/GITHUB_SECRETS_GUIDE.md` - Guía completa
- `RAPIDO_GITHUB_SECRETS.md` - Inicio rápido

**Fecha**: 2025-03-30  
**Estado**: ✅ Listo para ejecutar  
**Tiempo estimado**: 5 minutos
