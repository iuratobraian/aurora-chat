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
# SECRETS DE AURORA AI - TODAS LAS API KEYS
# =============================================================================

Write-Host ""
Write-Host "📦 AGREGANDO AI PROVIDERS..." -ForegroundColor Cyan

Add-Secret "NVIDIA_API_KEY" "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" "NVIDIA API para Kimi K2 y GLM-4"
Add-Secret "NVIDIA_API_KEY_2" "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" "NVIDIA API Key 2 (Kimi K2 + GLM-4)"
Add-Secret "GROQ_API_KEY" "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" "Groq API para Llama 3.3 70B"
Add-Secret "GROQ_API_KEY_BACKUP" "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" "Groq API Backup"
Add-Secret "OPENROUTER_API_KEY" "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" "OpenRouter para Qwen2.5"
Add-Secret "OPENROUTER_AURORA_KEY" "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" "OpenRouter Aurora (backup)"
Add-Secret "OPENROUTER_API_KEY_2" "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" "OpenRouter API Key 2"
Add-Secret "ANTHROPIC_API_KEY" "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" "Anthropic API para Claude 3.5"
Add-Secret "ANTHROPIC_API_KEY_2" "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" "Anthropic API Key 2"
Add-Secret "GEMINI_API_KEY" "AIzaSyA2qQ5ZRUwjcNJQ3lrh0rm3OY4BAayUwGU" "Google Gemini API"
Add-Secret "HUGGINGFACE_API_KEY" "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" "HuggingFace API"

Write-Host ""
Write-Host "🔍 AGREGANDO SERVICIOS DE BÚSQUEDA..." -ForegroundColor Cyan

Add-Secret "TAVILY_API_KEY" "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" "Tavily AI Search"
Add-Secret "SERPAPI_API_KEY" "780f18814e299852ff5d3daffe38a59b4c1c168738bfedf108d82d7063c7c391" "SerpAPI Google Search"

Write-Host ""
Write-Host "📱 AGREGANDO OTROS SERVICIOS..." -ForegroundColor Cyan

Add-Secret "YOUTUBE_API_KEY" "AIzaSyAOuRFzJ157GdmOctojcYyy3Lwg61pDo0o" "YouTube Data API"
Add-Secret "NOTION_API_KEY" "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" "Notion API"
Add-Secret "NOTION_DATABASE_ID" "33142b008df080f8b6b3db69d36e84d5" "Notion Database ID"
Add-Secret "MERCADOPAGO_ACCESS_TOKEN" "APP_USR-3819445901618978-032605-1548d8d94a4167bdf018f329c532d54f-183552913" "MercadoPago Access Token"

Write-Host ""
Write-Host "───────────────────────────────────────────────" -ForegroundColor Gray

# =============================================================================
# CREAR .env.nvidia AUTOMÁTICAMENTE
# =============================================================================

Write-Host ""
Write-Host "💾 Creando .env.nvidia automáticamente..." -ForegroundColor Cyan

$envContent = @"
# Aurora AI - API Keys Configuration
# Generado automáticamente por add-github-secrets.ps1
# Fecha: $(Get-Date -Format 'yyyy-MM-dd')

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
"@

$envContent | Out-File -FilePath ".env.nvidia" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env.nvidia creado exitosamente" -ForegroundColor Green
Write-Host "📄 Ubicación: $(Get-Location)\.env.nvidia" -ForegroundColor Yellow
Write-Host "🔑 Keys configuradas: 16 API keys" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ ¡GitHub Secrets configurados!            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Secrets agregados:" -ForegroundColor White
Write-Host "  ✅ 16 API keys en GitHub" -ForegroundColor Green
Write-Host "  ✅ .env.nvidia creado localmente" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar .env.nvidia: cat .env.nvidia" -ForegroundColor White
Write-Host "  2. Probar Aurora AI: node scripts/aurora-ai-agent.mjs" -ForegroundColor White
Write-Host "  3. En otras PCs: git pull + ejecutar este script" -ForegroundColor White
Write-Host ""
