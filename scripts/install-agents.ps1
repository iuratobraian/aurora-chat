# Install HuggingFace Agents - Aurora Integration
# Ejecute: .\scripts\install-agents.ps1

Write-Host "🚀 Instalando HuggingFace Agents para Aurora..." -ForegroundColor Cyan

# Verificar Python
Write-Host "`n📦 Verificando Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command python3 -ErrorAction SilentlyContinue
}

if ($pythonCmd) {
    Write-Host "  ✓ Python encontrado: $($pythonCmd.Source)" -ForegroundColor Green
    
    # Instalar smolagents
    Write-Host "`n📦 Instalando smolagents framework..." -ForegroundColor Yellow
    & python -m pip install smolagents[toolkit] --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ smolagents instalado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Error instalando smolagents" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠ Python no encontrado. Instale desde: https://www.python.org/downloads/" -ForegroundColor Yellow
}

# Verificar Node.js
Write-Host "`n📦 Verificando Node.js..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    Write-Host "  ✓ Node.js encontrado: $($nodeCmd.Source)" -ForegroundColor Green
    
    # Instalar MCP servers
    $mcps = @(
        "agents-mcp-hackathon/web-scraper",
        "agents-mcp-hackathon/knowledge-graph-builder",
        "agents-mcp-hackathon/multi-agent-deep-research",
        "agents-mcp-hackathon/workflow-builder",
        "agents-mcp-hackathon/file-converter"
    )
    
    foreach ($mcp in $mcps) {
        Write-Host "`n  Instalando $mcp..." -ForegroundColor Yellow
        npx -y @/$mcp --help 2>$null
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
            Write-Host "    ✓ $mcp" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ⚠ Node.js no encontrado. Instale desde: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host "`n✅ Instalación completada!" -ForegroundColor Green
Write-Host "`nPara usar los agentes, configure las variables de entorno en .env:" -ForegroundColor Cyan
Write-Host "  - HF_TOKEN (opcional, para modelos premium)" -ForegroundColor Gray
Write-Host "  - OLLAMA_BASE_URL (para modelos locales)" -ForegroundColor Gray

Write-Host "`n📖 Vea docs/AGENTS_README.md para uso detallado" -ForegroundColor Cyan
