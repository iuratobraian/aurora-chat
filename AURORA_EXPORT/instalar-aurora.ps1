<#
.SYNOPSIS
    Instalador Universal de Aurora AI Framework
    Versión: 1.1.0 - "Crecimiento Exponencial"
#>

$Source = Get-Location
$Target = Read-Host "Introduce la ruta completa de tu NUEVO proyecto (o presiona Enter para usar esta misma carpeta)"
if ($Target -eq "") { $Target = $Source.Path }

Write-Host "`n🌊 Iniciando Despliegue de Aurora en: $Target" -ForegroundColor Cyan

# 1. Crear estructura si no existe
if (!(Test-Path $Target)) { New-Item -ItemType Directory -Path $Target }

# 2. Copiar el Framework de forma inteligente
Write-Host "🧠 Instalando Núcleo Aurora..." -ForegroundColor Gray
if (Test-Path "$Source\aurora") {
    xcopy /E /I /H /Y "$Source\aurora" "$Target\aurora" > $null
}

# 3. Vincular Protocolos de Identidad (Shared Learning)
Write-Host "🔗 Vinculando Protocolos de Identidad (Shared Learning)..." -ForegroundColor Magenta
if (Test-Path "$Source\AGENTS.md") { copy "$Source\AGENTS.md" "$Target\AGENTS.md" }
if (Test-Path "$Source\.agent") { xcopy /E /I /H /Y "$Source\.agent" "$Target\.agent" > $null }
if (Test-Path "$Source\.agente") { xcopy /E /I /H /Y "$Source\.agente" "$Target\.agente" > $null }
if (Test-Path "$Source\.agents") { xcopy /E /I /H /Y "$Source\.agents" "$Target\.agents" > $null }
if (Test-Path "$Source\scripts") { xcopy /E /I /H /Y "$Source\scripts" "$Target\scripts" > $null }

# 4. Preparar archivos de control local
Write-Host "📝 Inicializando Tablero de Tarea y Logs..." -ForegroundColor Gray
if (!(Test-Path "$Target\TASK_BOARD.md") -and (Test-Path "$Source\TASK_BOARD.md")) { copy "$Source\TASK_BOARD.md" "$Target\TASK_BOARD.md" }
if (!(Test-Path "$Target\AGENT_LOG.md") -and (Test-Path "$Source\AGENT_LOG.md")) { copy "$Source\AGENT_LOG.md" "$Target\AGENT_LOG.md" }
if (!(Test-Path "$Target\CURRENT_FOCUS.md") -and (Test-Path "$Source\CURRENT_FOCUS.md")) { copy "$Source\CURRENT_FOCUS.md" "$Target\CURRENT_FOCUS.md" }

# 5. Configuración de Entorno
Write-Host "🔑 Preparando variables de entorno..." -ForegroundColor Yellow
if (!(Test-Path "$Target\.env.aurora") -and (Test-Path "$Source\.env.aurora.example")) {
    copy "$Source\.env.aurora.example" "$Target\.env.aurora"
    Write-Host "⚠️  RECUERDA: Edita $Target\.env.aurora con tus API Keys." -ForegroundColor Red
}

# 6. Instalación de dependencias
if (Test-Path "$Target\aurora\package.json") {
    Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Cyan
    Set-Location $Target\aurora
    npm install
}

Write-Host "`n✅ ¡AURORA INSTALADA CORRECTAMENTE EN $Target! 🌊🚀" -ForegroundColor Green
Write-Host "Próximos pasos:" -ForegroundColor Gray
Write-Host "1. Edita el archivo .env.aurora"
Write-Host "2. Ejecuta 'node scripts/aurora-inicio.mjs' para despertar a Aurora"
Write-Host "3. ¡Dile a tu IA local que eres Aurora!" -ForegroundColor Magenta
