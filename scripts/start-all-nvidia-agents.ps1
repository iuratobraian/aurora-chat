# Abrir todos los agentes en terminals separados

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AURORA NEXUS - NVIDIA AGENTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\iurato\Downloads\tradeportal-2025-platinum\scripts"

Write-Host "Abriendo agentes en terminals separados..." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; .\chat-kimi.ps1" -WindowStyle Normal
Write-Host "  [OK] Kimi K2 Instruct" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; .\chat-deepseek.ps1" -WindowStyle Normal
Write-Host "  [OK] DeepSeek V3.2" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; .\chat-minimax.ps1" -WindowStyle Normal
Write-Host "  [OK] MiniMax M2.5" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; .\chat-glm5.ps1" -WindowStyle Normal
Write-Host "  [OK] GLM-5" -ForegroundColor Green

Write-Host ""
Write-Host "Todos los agentes iniciados!" -ForegroundColor Cyan
Write-Host "Comandos: exit = salir, clear = limpiar historial"
Write-Host ""
