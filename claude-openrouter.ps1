#claude-openrouter.ps1
# Script para iniciar Claude Code (Anthropic CLI) usando OpenRouter como backend

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Inicializando Claude Code con OpenRouter" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Configuramos el endpoint de OpenRouter y pasamos la API KEY que suministraste
$env:ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"
$env:ANTHROPIC_API_KEY="" # ELIMINADA POR BLOQUEO


Write-Host "[+] Variables de entorno inyectadas correctamente" -ForegroundColor Green

# 2. Inicializamos Claude Code forzando tu API de OpenRouter
Write-Host "[+] Lanzando Claude Code en la terminal..." -ForegroundColor Yellow
npx @anthropic-ai/claude-code@latest
