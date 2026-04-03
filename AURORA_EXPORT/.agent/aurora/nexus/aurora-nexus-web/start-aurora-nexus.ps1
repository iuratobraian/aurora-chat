# Aurora Nexus Auto-Start Script
# Ejecutar este script como Administrador para iniciar automáticamente Aurora Nexus

$ErrorActionPreference = "Stop"

# Configuración
$PORT = 61913
$PROJECT_PATH = "$PSScriptRoot\..\..\aurora-nexus-web"
$HTML_FILE = "aurora-nexus-desktop.html"

# Buscar si ya está corriendo en el puerto
$running = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue

if ($running) {
    Write-Host "Aurora Nexus ya está corriendo en http://localhost:$PORT" -ForegroundColor Green
    Start-Process "http://localhost:$PORT"
    exit 0
}

# Ir al directorio del proyecto
Set-Location $PSScriptRoot

Write-Host "Iniciando Aurora Nexus..." -ForegroundColor Cyan

# Instalar serve si no existe
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js no encontrado. Instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Iniciar servidor en segundo plano
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npx -y serve -l $PORT $HTML_FILE" -WindowStyle Hidden

# Esperar a que inicie
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  AURORA NEXUS INICIADO" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Abre en tu navegador:" -ForegroundColor White
Write-Host "  http://localhost:$PORT" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host ""

# Abrir navegador automáticamente
Start-Process "http://localhost:$PORT"
