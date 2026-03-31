#!/bin/bash
# =============================================================================
# Aurora AI - GitHub Secrets Setup
# =============================================================================
# Este script agrega automáticamente los GitHub Secrets para Aurora AI
# 
# Requisitos:
# 1. Tener GitHub CLI (gh) instalado
# 2. Estar autenticado: gh auth login
# 3. Tener permisos de admin en el repositorio
#
# Uso:
#   ./scripts/add-github-secrets.sh
# =============================================================================

set -e  # Salir si hay error

echo "╔══════════════════════════════════════════════╗"
echo "║  🚀 Aurora AI - GitHub Secrets Setup         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Verificar que gh esté instalado
echo "[1/5] Verificando GitHub CLI..."
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) no está instalado."
    echo ""
    echo "Instalar en Windows:"
    echo "  winget install --id GitHub.cli"
    echo ""
    echo "Instalar en Mac:"
    echo "  brew install gh"
    echo ""
    echo "Instalar en Linux:"
    echo "  sudo apt install gh"
    exit 1
fi
echo "✅ GitHub CLI instalado: $(gh --version | head -1)"

# Verificar autenticación
echo ""
echo "[2/5] Verificando autenticación..."
if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado en GitHub."
    echo ""
    echo "Ejecutá:"
    echo "  gh auth login"
    echo ""
    echo "Seguí las instrucciones para autenticarte."
    exit 1
fi
echo "✅ Autenticado en GitHub"

# Obtener información del repositorio
echo ""
echo "[3/5] Obteniendo información del repositorio..."
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
echo "✅ Repositorio: $REPO"

# Lista de Secrets a agregar
echo ""
echo "[4/5] Agregando GitHub Secrets..."
echo "───────────────────────────────────────────────"

# Función para agregar secret
add_secret() {
    local name=$1
    local value=$2
    local description=$3
    
    echo -n "  → $name... "
    
    # Verificar si el secret ya existe
    if gh secret list | grep -q "$name"; then
        echo "⚠️  Ya existe (actualizando)"
        gh secret set "$name" --body "$value"
    else
        echo "✅ Agregando"
        gh secret set "$name" --body "$value"
    fi
}

# =============================================================================
# SECRETS DE AURORA AI - TODAS LAS API KEYS
# =============================================================================
# IMPORTANTE: Estos secrets se usan en GitHub Actions para:
# - Tests automáticos
# - Deploy automático
# - CI/CD pipelines
#
# El equipo IGUAL necesita su propio .env.nvidia local para desarrollo.
# =============================================================================

echo ""
echo "📦 AGREGANDO AI PROVIDERS..."
echo "───────────────────────────────────────────────"

# NVIDIA API Key (Kimi K2 + GLM-4)
add_secret \
    "NVIDIA_API_KEY" \
    "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" \
    "NVIDIA API para Kimi K2 y GLM-4"

# Groq API Key (Ultra-fast Llama models)
add_secret \
    "GROQ_API_KEY" \
    "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" \
    "Groq API para Llama 3.3 70B"

# OpenRouter API Key (Multi-model gateway) - Principal
add_secret \
    "OPENROUTER_API_KEY" \
    "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" \
    "OpenRouter para Qwen2.5 Coder y Claude 3.5"

# OpenRouter API Key (Aurora) - Backup
add_secret \
    "OPENROUTER_AURORA_KEY" \
    "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" \
    "OpenRouter Aurora (backup)"

# Anthropic API Key (Claude 3.5 Sonnet - Premium)
add_secret \
    "ANTHROPIC_API_KEY" \
    "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" \
    "Anthropic API para Claude 3.5 Sonnet"

# Google Gemini API Key
add_secret \
    "GEMINI_API_KEY" \
    "AIzaSyA2qQ5ZRUwjcNJQ3lrh0rm3OY4BAayUwGU" \
    "Google Gemini API"

# HuggingFace API Key
add_secret \
    "HUGGINGFACE_API_KEY" \
    "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" \
    "HuggingFace API para modelos ML"

echo ""
echo "🔍 AGREGANDO SERVICIOS DE BÚSQUEDA..."
echo "───────────────────────────────────────────────"

# Tavily API Key (AI Search)
add_secret \
    "TAVILY_API_KEY" \
    "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" \
    "Tavily AI Search"

# SerpAPI API Key (Google Search)
add_secret \
    "SERPAPI_API_KEY" \
    "780f18814e299852ff5d3daffe38a59b4c1c168738bfedf108d82d7063c7c391" \
    "SerpAPI Google Search"

echo ""
echo "📱 AGREGANDO OTROS SERVICIOS..."
echo "───────────────────────────────────────────────"

# YouTube API Key
add_secret \
    "YOUTUBE_API_KEY" \
    "AIzaSyAOuRFzJ157GdmOctojcYyy3Lwg61pDo0o" \
    "YouTube Data API"

# Notion API Key
add_secret \
    "NOTION_API_KEY" \
    "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" \
    "Notion API para sincronización"

# Notion Database ID
add_secret \
    "NOTION_DATABASE_ID" \
    "33142b008df080f8b6b3db69d36e84d5" \
    "Notion Database ID para tareas"

# MercadoPago Access Token
add_secret \
    "MERCADOPAGO_ACCESS_TOKEN" \
    "APP_USR-3819445901618978-032605-1548d8d94a4167bdf018f329c532d54f-183552913" \
    "MercadoPago Access Token"

echo ""
echo "💾 AGREGANDO BACKUPS ADICIONALES..."
echo "───────────────────────────────────────────────"

# Groq API Key (Backup - de .env.aurora)
add_secret \
    "GROQ_API_KEY_BACKUP" \
    "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" \
    "Groq API Backup (de .env.aurora)"

# =============================================================================
# NUEVAS API KEYS AGREGADAS (ACTUALIZACIÓN 2025-03-30)
# =============================================================================

echo ""
echo "🆕 AGREGANDO NUEVAS API KEYS..."
echo "───────────────────────────────────────────────"

# Anthropic API Key (Nueva - Claude 3.5 Sonnet)
add_secret \
    "ANTHROPIC_API_KEY_2" \
    "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" \
    "Anthropic API Key 2 (Claude 3.5 Sonnet)"

# NVIDIA API Key (Nueva - Kimi K2 + GLM-4)
add_secret \
    "NVIDIA_API_KEY_2" \
    "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" \
    "NVIDIA API Key 2 (Kimi K2 + GLM-4)"

# OpenRouter API Key (Nueva - Backup adicional)
add_secret \
    "OPENROUTER_API_KEY_2" \
    "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" \
    "OpenRouter API Key 2 (Backup adicional)"

# =============================================================================

echo "───────────────────────────────────────────────"
echo ""
echo "[5/5] Verificando secrets agregados..."
echo ""
echo "Secrets en el repositorio:"
gh secret list
echo ""

# =============================================================================
# CREAR .env.nvidia AUTOMÁTICAMENTE
# =============================================================================

echo ""
echo "💾 Creando .env.nvidia automáticamente..."
echo "───────────────────────────────────────────────"

# Crear .env.nvidia con todas las keys
cat > .env.nvidia << 'EOF'
# Aurora AI - API Keys Configuration
# Generado automáticamente por add-github-secrets.sh
# Fecha: 2025-03-30

# AI Providers
NVIDIA_API_KEY=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
NVIDIA_API_KEY_2=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
GROQ_API_KEY=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
GROQ_API_KEY_BACKUP=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
OPENROUTER_API_KEY=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
OPENROUTER_AURORA_KEY=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
OPENROUTER_API_KEY_2=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
ANTHROPIC_API_KEY=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
ANTHROPIC_API_KEY_2=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
GEMINI_API_KEY=AIzaSyA2qQ5ZRUwjcNJQ3lrh0rm3OY4BAayUwGU
HUGGINGFACE_API_KEY=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

# Search Services
TAVILY_API_KEY=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
SERPAPI_API_KEY=780f18814e299852ff5d3daffe38a59b4c1c168738bfedf108d82d7063c7c391

# Other Services
YOUTUBE_API_KEY=AIzaSyAOuRFzJ157GdmOctojcYyy3Lwg61pDo0o
NOTION_API_KEY=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
NOTION_DATABASE_ID=33142b008df080f8b6b3db69d36e84d5
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3819445901618978-032605-1548d8d94a4167bdf018f329c532d54f-183552913
EOF

echo ""
echo "✅ .env.nvidia creado exitosamente"
echo "📄 Ubicación: $(pwd)/.env.nvidia"
echo "🔑 Keys configuradas: 16 API keys"
echo ""

# Resumen
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ ¡GitHub Secrets configurados!            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Secrets agregados:"
echo "  ✅ 16 API keys en GitHub"
echo "  ✅ .env.nvidia creado localmente"
echo ""
echo "Próximos pasos:"
echo "  1. Verificar .env.nvidia: cat .env.nvidia"
echo "  2. Probar Aurora AI: node scripts/aurora-ai-agent.mjs"
echo "  3. En otras PCs: git pull + ejecutar este script"
echo ""
