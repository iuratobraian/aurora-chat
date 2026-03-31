# 🚀 GitHub Secrets Setup - Aurora AI

## 📋 ¿Qué son los GitHub Secrets?

Los **GitHub Secrets** son variables de entorno encriptadas que se usan en GitHub Actions para:

- ✅ Tests automáticos con acceso a APIs
- ✅ Deploy automático a producción
- ✅ CI/CD pipelines
- ✅ Integración con servicios externos

---

## 🔧 Requisitos

### 1. Tener GitHub CLI instalado

```bash
# Verificar si está instalado
gh --version

# Instalar en Windows (PowerShell):
winget install --id GitHub.cli

# Instalar en Mac:
brew install gh

# Instalar en Linux:
sudo apt update && sudo apt install gh
```

### 2. Autenticarse en GitHub

```bash
# Iniciar sesión
gh auth login

# Seguir las instrucciones:
# 1. Elegir GitHub.com
# 2. Elegir HTTPS
# 3. Copiar el código que aparece
# 4. Ir a https://github.com/login/device
# 5. Pegar el código
# 6. Autorizar
```

### 3. Tener permisos de admin en el repo

- Dueño del repo: ✅ Puede agregar secrets
- Colaborador: ❌ No puede agregar secrets

---

## 🚀 Ejecutar el Script

### En Windows (PowerShell):
```powershell
# Ejecutar el script
bash scripts/add-github-secrets.sh

# O si no funciona:
./scripts/add-github-secrets.sh
```

### En Mac/Linux:
```bash
# Dar permisos de ejecución
chmod +x scripts/add-github-secrets.sh

# Ejecutar
./scripts/add-github-secrets.sh
```

---

## 📊 Secrets que se Agregan

El script agrega automáticamente:

| Secret | Descripción | Uso |
|--------|-------------|-----|
| `NVIDIA_API_KEY` | Kimi K2 + GLM-4 | Code review, explicaciones |
| `GROQ_API_KEY` | Llama 3.3 70B | Código ultra-rápido |
| `OPENROUTER_API_KEY` | Qwen2.5 + Claude | Backup económico |

---

## 🔍 Verificar Secrets

### Ver lista de secrets:
```bash
gh secret list
```

### Ver un secret específico:
```bash
# No se puede ver el valor (por seguridad)
# Pero se puede verificar que existe
gh secret list | grep NVIDIA_API_KEY
```

### Ver en la web:
```
1. Ir a: https://github.com/iuratobraian/trade-share/settings/secrets/actions
2. Ver lista de secrets en "Repository secrets"
```

---

## ➕ Agregar Más Secrets

### Opción 1: Editar el Script

```bash
# 1. Abrir scripts/add-github-secrets.sh
notepad scripts/add-github-secrets.sh

# 2. Descomentar y editar las líneas:
add_secret \
    "ANTHROPIC_API_KEY" \
    "sk-ant-api03-..." \
    "Anthropic API para Claude 3.5"

# 3. Guardar y ejecutar:
./scripts/add-github-secrets.sh
```

### Opción 2: Manualmente en GitHub

```
1. Ir a: https://github.com/iuratobraian/trade-share/settings/secrets/actions
2. Click en "New repository secret"
3. Nombre: ANTHROPIC_API_KEY
4. Valor: sk-ant-api03-...
5. Click "Add secret"
```

### Opción 3: Con gh CLI

```bash
gh secret set ANTHROPIC_API_KEY --body "sk-ant-api03-..."
```

---

## 📝 Secrets Opcionales para Agregar

### Modelos de IA:
```bash
# Anthropic (Claude 3.5)
ANTHROPIC_API_KEY=sk-ant-api03-...

# DeepSeek (Código)
DEEPSEEK_API_KEY=sk-...

# OpenAI (GPT-4)
OPENAI_API_KEY=sk-...

# Google (Gemini)
GOOGLE_API_KEY=...

# HuggingFace (ML)
HUGGINGFACE_API_KEY=hf_...
```

### Servicios:
```bash
# Vercel (Deploy)
VERCEL_TOKEN=...

# Sentry (Error tracking)
SENTRY_AUTH_TOKEN=...

# Convex (Backend)
CONVEX_DEPLOYMENT=...
```

---

## 🔄 Actualizar Secrets

### Si una key expira o se agota:

```bash
# 1. Ejecutar el script de nuevo (actualiza automáticamente)
./scripts/add-github-secrets.sh

# 2. O actualizar manualmente:
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

### ¿Los secrets son seguros?

```
✅ Encriptados con AES-256
✅ Solo accesibles en GitHub Actions
✅ No se muestran en logs
✅ No se pueden exportar
```

### Buenas prácticas:

```
✅ Rotar keys cada 3-6 meses
✅ Usar keys diferentes para prod/dev
✅ Monitorear uso de cada key
✅ Revocar keys no usadas
```

---

## 🚨 Troubleshooting

### Error: "command not found: gh"
```bash
# Instalar GitHub CLI
winget install --id GitHub.cli  # Windows
brew install gh                  # Mac
sudo apt install gh              # Linux
```

### Error: "not authenticated"
```bash
# Autenticarse
gh auth login
```

### Error: "requires admin permissions"
```
# Necesitás ser dueño del repo
# Pedile al dueño que agregue los secrets
```

### Error: "secret already exists"
```
# El script actualiza automáticamente
# Si querés forzar:
gh secret set NAME --body "value" --force
```

---

## 📚 Próximos Pasos

### Después de agregar secrets:

1. ✅ Verificar en GitHub Settings
2. ✅ Crear workflow de GitHub Actions
3. ✅ El equipo hace git pull
4. ✅ Cada miembro configura su .env.nvidia local

### Workflow de ejemplo:

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
        run: npm test
```

---

## 🎯 Resumen

```
┌─────────────────────────────────────────┐
│  ✅ GitHub Secrets Configurados         │
│  ─────────────────────────────────────  │
│  ✅ 3 secrets agregados                 │
│  ✅ Script automatizado                 │
│  ✅ Fácil de actualizar                 │
│  ✅ Seguro y encriptado                 │
│  ✅ Listo para CI/CD                    │
└─────────────────────────────────────────┘
```

---

**Documentación creada**: 2025-03-30  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para usar
