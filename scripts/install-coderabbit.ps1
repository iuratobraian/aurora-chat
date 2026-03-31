# CodeRabbit Integration Setup - PowerShell
# For Windows users (WSL required)

Write-Host "🚀 CodeRabbit CLI Installation" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if WSL is available
Write-Host "Checking WSL availability..." -ForegroundColor Yellow
$wslCheck = wsl --status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ WSL is required for CodeRabbit on Windows" -ForegroundColor Red
    Write-Host "Install WSL: Run 'wsl --install' in PowerShell as Admin`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ WSL is available`n" -ForegroundColor Green

# Install CodeRabbit in WSL
Write-Host "Installing CodeRabbit CLI in WSL..." -ForegroundColor Yellow
wsl curl -fsSL https://cli.coderabbit.ai/install.sh | wsl bash

Write-Host "`n✅ CodeRabbit CLI installed in WSL!" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Authenticate with CodeRabbit:"
Write-Host "   wsl coderabbit auth login"
Write-Host "`n2. In Claude Code, install the plugin:"
Write-Host "   /plugin install coderabbit"
Write-Host "`n3. Run reviews with:"
Write-Host "   /coderabbit:review"
