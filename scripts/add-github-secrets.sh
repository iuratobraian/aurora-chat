#!/bin/bash
# =============================================================================
# Aurora AI - GitHub Secrets Setup
# =============================================================================
# Este script agrega automáticamente los GitHub Secrets para Aurora AI
# 
# NOTA: Las API keys se leen de variables de entorno locales, NO están hardcodeadas.
# Configurá las variables de entorno antes de ejecutar este script.
# =============================================================================

set -e

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
    
    if [ -z "$value" ] || [ "$value" = "YOUR_KEY_HERE" ]; then
        echo "  ⏭️  $name... SKIP (no configurada)"
        return
    fi
    
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
# SECRETS DE AURORA AI - Se leen de variables de entorno, NO hardcodeadas
# =============================================================================

echo ""
echo "📦 AGREGANDO AI PROVIDERS..."
echo "───────────────────────────────────────────────"

add_secret "NVIDIA_API_KEY" "$NVIDIA_API_KEY" "NVIDIA API para Kimi K2 y GLM-4"
add_secret "NVIDIA_API_KEY_2" "$NVIDIA_API_KEY_2" "NVIDIA API Key 2"
add_secret "GROQ_API_KEY" "$GROQ_API_KEY" "Groq API para Llama 3.3 70B"
add_secret "GROQ_API_KEY_BACKUP" "$GROQ_API_KEY_BACKUP" "Groq API Backup"
add_secret "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY" "OpenRouter para Qwen2.5"
add_secret "OPENROUTER_AURORA_KEY" "$OPENROUTER_AURORA_KEY" "OpenRouter Aurora"
add_secret "OPENROUTER_API_KEY_2" "$OPENROUTER_API_KEY_2" "OpenRouter API Key 2"
add_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY" "Anthropic API para Claude 3.5"
add_secret "ANTHROPIC_API_KEY_2" "$ANTHROPIC_API_KEY_2" "Anthropic API Key 2"
add_secret "HUGGINGFACE_API_KEY" "$HUGGINGFACE_API_KEY" "HuggingFace API"
add_secret "GEMINI_API_KEY" "$GEMINI_API_KEY" "Google Gemini API"
add_secret "DEEPSEEK_API_KEY" "$DEEPSEEK_API_KEY" "DeepSeek API"
add_secret "SERPAPI_API_KEY" "$SERPAPI_API_KEY" "SerpAPI para búsqueda"
add_secret "TAVILY_API_KEY" "$TAVILY_API_KEY" "Tavily API para búsqueda"
add_secret "BRAVE_SEARCH_API_KEY" "$BRAVE_SEARCH_API_KEY" "Brave Search API"

echo ""
echo "📦 AGREGANDO CONFIGURACIÓN..."
echo "───────────────────────────────────────────────"

add_secret "AURORA_GPU" "$AURORA_GPU" "GPU habilitada para Aurora"
add_secret "OLLAMA_GPU" "$OLLAMA_GPU" "GPU habilitada para Ollama"
add_secret "AURORA_PROVIDER_STRATEGY" "$AURORA_PROVIDER_STRATEGY" "Estrategia de proveedor"
add_secret "AURORA_AUTO_FALLBACK" "$AURORA_AUTO_FALLBACK" "Auto fallback habilitado"

# =============================================================================
# RESUMEN
# =============================================================================

echo ""
echo "[5/5] Resumen..."
echo "───────────────────────────────────────────────"

gh secret list

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ GitHub Secrets configurados exitosamente  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "💡 Para ver los secrets:"
echo "  gh secret list"
echo ""
echo "⚠️  Las API keys se leen de variables de entorno locales."
echo "   Configurá las variables antes de ejecutar este script."
