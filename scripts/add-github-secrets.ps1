# =============================================================================
# Aurora AI - GitHub Secrets Setup (PowerShell)
# =============================================================================
# Este script agrega automáticamente los GitHub Secrets para Aurora AI
# 
# Requisitos:
# 1. Tener GitHub CLI (gh) instalado
# 2. Estar autenticado: gh auth login
# 3. Tener permisos de admin en el repositorio
#
# Uso:
#   .\scripts\add-github-secrets.ps1
#
# NOTA: Las API keys se leen de variables de entorno locales, NO están hardcodeadas.
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 Aurora AI - GitHub Secrets Setup         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar que gh esté instalado
Write-Host "[1/5] Verificando GitHub CLI..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Host "✅ GitHub CLI instalado: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI (gh) no está instalado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalar con winget:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    exit 1
}

# Verificar autenticación
Write-Host ""
Write-Host "[2/5] Verificando autenticación..." -ForegroundColor Yellow
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Autenticado en GitHub" -ForegroundColor Green
    } else {
        throw "Not authenticated"
    }
} catch {
    Write-Host "❌ No estás autenticado en GitHub." -ForegroundColor Red
    Write-Host ""
    Write-Host "Ejecutá:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor White
    exit 1
}

# Obtener información del repositorio
Write-Host ""
Write-Host "[3/5] Obteniendo información del repositorio..." -ForegroundColor Yellow
$repo = gh repo view --json nameWithOwner -q '.nameWithOwner'
Write-Host "✅ Repositorio: $repo" -ForegroundColor Green

# Lista de Secrets a agregar
Write-Host ""
Write-Host "[4/5] Agregando GitHub Secrets..." -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────" -ForegroundColor Gray

# Función para agregar secret
function Add-Secret {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Description
    )
    
    if ([string]::IsNullOrEmpty($Value) -or $Value -eq "YOUR_KEY_HERE") {
        Write-Host "  ⏭️  $Name... SKIP (no configurada)" -ForegroundColor DarkGray
        return
    }
    
    Write-Host "  → $Name... " -NoNewline
    
    # Verificar si el secret ya existe
    $existing = gh secret list 2>&1 | Select-String $Name
    if ($existing) {
        Write-Host "⚠️  Ya existe (actualizando)" -ForegroundColor Yellow
        gh secret set $Name --body $Value 2>&1 | Out-Null
    } else {
        Write-Host "✅ Agregando" -ForegroundColor Green
        gh secret set $Name --body $Value 2>&1 | Out-Null
    }
}

# =============================================================================
# SECRETS DE AURORA AI - Se leen de variables de entorno, NO hardcodeadas
# =============================================================================

Write-Host ""
Write-Host "📦 AGREGANDO AI PROVIDERS..." -ForegroundColor Cyan

Add-Secret "NVIDIA_API_KEY" $env:NVIDIA_API_KEY "NVIDIA API para Kimi K2 y GLM-4"
Add-Secret "NVIDIA_API_KEY_2" $env:NVIDIA_API_KEY_2 "NVIDIA API Key 2"
Add-Secret "GROQ_API_KEY" $env:GROQ_API_KEY "Groq API para Llama 3.3 70B"
Add-Secret "GROQ_API_KEY_BACKUP" $env:GROQ_API_KEY_BACKUP "Groq API Backup"
Add-Secret "OPENROUTER_API_KEY" $env:OPENROUTER_API_KEY "OpenRouter para Qwen2.5"
Add-Secret "OPENROUTER_AURORA_KEY" $env:OPENROUTER_AURORA_KEY "OpenRouter Aurora (backup)"
Add-Secret "OPENROUTER_API_KEY_2" $env:OPENROUTER_API_KEY_2 "OpenRouter API Key 2"
Add-Secret "ANTHROPIC_API_KEY" $env:ANTHROPIC_API_KEY "Anthropic API para Claude 3.5"
Add-Secret "ANTHROPIC_API_KEY_2" $env:ANTHROPIC_API_KEY_2 "Anthropic API Key 2"
Add-Secret "HUGGINGFACE_API_KEY" $env:HUGGINGFACE_API_KEY "HuggingFace API"
Add-Secret "GEMINI_API_KEY" $env:GEMINI_API_KEY "Google Gemini API"
Add-Secret "DEEPSEEK_API_KEY" $env:DEEPSEEK_API_KEY "DeepSeek API"
Add-Secret "SERPAPI_API_KEY" $env:SERPAPI_API_KEY "SerpAPI para búsqueda"
Add-Secret "TAVILY_API_KEY" $env:TAVILY_API_KEY "Tavily API para búsqueda"
Add-Secret "BRAVE_SEARCH_API_KEY" $env:BRAVE_SEARCH_API_KEY "Brave Search API"

Write-Host ""
Write-Host "📦 AGREGANDO CONFIGURACIÓN..." -ForegroundColor Cyan

Add-Secret "AURORA_GPU" $env:AURORA_GPU "GPU habilitada para Aurora"
Add-Secret "OLLAMA_GPU" $env:OLLAMA_GPU "GPU habilitada para Ollama"
Add-Secret "AURORA_PROVIDER_STRATEGY" $env:AURORA_PROVIDER_STRATEGY "Estrategia de proveedor"
Add-Secret "AURORA_AUTO_FALLBACK" $env:AURORA_AUTO_FALLBACK "Auto fallback habilitado"

# =============================================================================
# RESUMEN
# =============================================================================

Write-Host ""
Write-Host "[5/5] Resumen..." -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────" -ForegroundColor Gray

$secrets = gh secret list 2>&1
Write-Host ""
Write-Host "✅ Secrets configurados:" -ForegroundColor Green
Write-Host $secrets

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ GitHub Secrets configurados exitosamente  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para ver los secrets:" -ForegroundColor Yellow
Write-Host "  gh secret list" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Las API keys se leen de variables de entorno locales." -ForegroundColor Yellow
Write-Host "   Configurá las variables antes de ejecutar este script." -ForegroundColor Yellow
