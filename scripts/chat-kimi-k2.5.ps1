# NVIDIA Kimi K2.5 - Chat Terminal
# Acceso directo a Kimi K2.5 multimodal agentic
# Uso: .\chat-kimi-k2.5.ps1

param(
    [string]$Model = "moonshotai/kimi-k2.5",
    [string]$AgentName = "Kimi"
)

$ErrorActionPreference = "Continue"

# Rutas del proyecto
$ProjectRoot = "C:\Users\iurato\Downloads\tradeportal-2025-platinum"
$AgentWorkspace = "$ProjectRoot\.agent\workspace\coordination"
$SkillsPath = "$ProjectRoot\.agent\skills"

# Cargar API key
$ApiKey = $env:NVIDIA_API_KEY
if (-not $ApiKey) {
    $envFile = "$ProjectRoot\.env.nvidia"
    if (Test-Path $envFile) {
        $ApiKey = (Get-Content $envFile -Raw).Trim()
    }
}

if (-not $ApiKey) {
    Write-Host "[ERROR] NVIDIA_API_KEY no configurada" -ForegroundColor Red
    exit 1
}

# Colores
$UserColor = "Cyan"
$BotColor = "Green"
$SystemColor = "Yellow"
$FileColor = "Magenta"
$CmdColor = "Gray"
$TaskColor = "White"

function Send-ToAI {
    param($messages)
    
    $body = @{
        model = $Model
        messages = $messages
        max_tokens = 4096
        temperature = 0.6
    } | ConvertTo-Json -Depth 5

    try {
        Write-Host "..." -NoNewline -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
            -Method Post `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $ApiKey" } `
            -Body $body `
            -TimeoutSec 180
        Write-Host "`b`b`b" -NoNewline
        return $response.choices[0].message.content
    }
    catch {
        Write-Host "`b`b`b" -NoNewline
        Write-Host "[ERROR: $($_.Exception.Message)]" -ForegroundColor Red
        return $null
    }
}

function Read-ProjectFile {
    param([string]$path)
    
    $fullPath = if ([System.IO.Path]::IsPathRooted($path)) { $path } else { Join-Path $ProjectRoot $path }
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
        if ($content.Length -gt 8000) {
            return $content.Substring(0, 8000) + "`n... [truncated]"
        }
        return $content
    }
    return "[Archivo no encontrado: $path]"
}

function Get-TaskBoard {
    $taskBoardPath = Join-Path $AgentWorkspace "TASK_BOARD.md"
    if (Test-Path $taskBoardPath) {
        $content = Get-Content $taskBoardPath -Raw
        $lines = $content -split "`n"
        $pendingTasks = @()
        $inBoard = $false
        foreach ($line in $lines) {
            if ($line -match '^\| TASK-ID') { $inBoard = $true; continue }
            if ($inBoard -and $line -match '^\|') {
                if ($line -match '\| (pending|claimed|in_progress) \|') {
                    $pendingTasks += $line
                }
            }
        }
        return $pendingTasks
    }
    return @()
}

function Get-CurrentFocus {
    $focusPath = Join-Path $AgentWorkspace "CURRENT_FOCUS.md"
    if (Test-Path $focusPath) {
        return Get-Content $focusPath -Raw
    }
    return "[No hay CURRENT_FOCUS.md]"
}

function Get-AgentLog {
    $logPath = Join-Path $AgentWorkspace "AGENT_LOG.md"
    if (Test-Path $logPath) {
        $content = Get-Content $logPath -Raw
        $lines = $content -split "`n"
        return ($lines | Select-Object -First 15) -join "`n"
    }
    return "[No hay AGENT_LOG.md]"
}

function Show-Inicio {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $SystemColor
    Write-Host "  PROTOCOLO DE INICIO - AURORA" -ForegroundColor $SystemColor
    Write-Host "========================================" -ForegroundColor $SystemColor
    Write-Host ""
    
    Write-Host "[1] Tareas Pendientes (TASK_BOARD):" -ForegroundColor $TaskColor
    $pendingTasks = Get-TaskBoard
    if ($pendingTasks.Count -gt 0) {
        $pendingTasks | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "  No hay tareas pendientes" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "[2] Enfoque Actual (CURRENT_FOCUS):" -ForegroundColor $TaskColor
    $focus = Get-CurrentFocus
    Write-Host $focus -ForegroundColor White
    Write-Host ""
    
    Write-Host "[3] Historial Reciente (AGENT_LOG):" -ForegroundColor $TaskColor
    $log = Get-AgentLog
    Write-Host $log -ForegroundColor White
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor $SystemColor
    Write-Host "Comandos: model = cambiar modelo" -ForegroundColor Gray
    Write-Host "          inicio = recargar hoja de ruta" -ForegroundColor Gray
    Write-Host ""
}

function Show-Help {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $SystemColor
    Write-Host "  COMANDOS DISPONIBLES" -ForegroundColor $SystemColor
    Write-Host "========================================" -ForegroundColor $SystemColor
    Write-Host ""
    Write-Host "  inicio           - Hoja de ruta (TASK_BOARD)" -ForegroundColor Gray
    Write-Host "  tareas          - Listar tareas pendientes" -ForegroundColor Gray
    Write-Host "  focus           - Mostrar CURRENT_FOCUS" -ForegroundColor Gray
    Write-Host "  log             - Ver AGENT_LOG" -ForegroundColor Gray
    Write-Host "  model           - Ver/cambiar modelo" -ForegroundColor Gray
    Write-Host "  read <archivo>  - Leer archivo del proyecto" -ForegroundColor Gray
    Write-Host "  ls <carpeta>    - Listar archivos" -ForegroundColor Gray
    Write-Host "  run <comando>   - Ejecutar comando npm" -ForegroundColor Gray
    Write-Host "  exit            - Salir" -ForegroundColor Gray
    Write-Host "  clear           - Limpiar chat" -ForegroundColor Gray
    Write-Host ""
}

# Banner
Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor $SystemColor
Write-Host "  AURORA NEXUS - $AgentName" -ForegroundColor $SystemColor
Write-Host "  Modelo: $Model" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor $SystemColor
Write-Host ""
Write-Host "Proyecto: TradePortal 2025" -ForegroundColor Gray
Write-Host "Ruta: $ProjectRoot" -ForegroundColor Gray
Write-Host ""
Write-Host "Escribe 'inicio' para cargar la hoja de ruta" -ForegroundColor Yellow
Write-Host "Comandos: help = ayuda, exit = salir" -ForegroundColor Gray
Write-Host ""

$systemPrompt = @"
You are $AgentName, an AI coding assistant integrated into Aurora Nexus (TradePortal 2025).

IMPORTANT - Protocolo de Inicio:
When user types 'inicio', load and show: TASK_BOARD, CURRENT_FOCUS, AGENT_LOG

You have access to project files and can:
- Read files from the project
- List directories
- Run npm/node commands
- Analyze code and help with development
- Modify and create code files

When user asks to read a file, use: read <path>
When user asks to list files, use: ls <path>
When user asks to run a command, use: run <command>
When user asks about tasks, use: inicio

Always help with coding, debugging, and development tasks. Modify code when requested.
"@

$messages = @(
    @{role = "system"; content = $systemPrompt}
)

# Loop principal
while ($true) {
    Write-Host -NoNewline "You ($AgentName): " -ForegroundColor $UserColor
    $input = Read-Host
    
    $input = $input.Trim()
    
    if ($input -eq "exit" -or $input -eq "salir") {
        Write-Host "Hasta luego!" -ForegroundColor $SystemColor
        break
    }
    
    if ($input -eq "clear" -or $input -eq "limpiar") {
        $messages = @(
            @{role = "system"; content = $systemPrompt}
        )
        Clear-Host
        Write-Host "Historial limpiado" -ForegroundColor Gray
        continue
    }
    
    if ($input -eq "help" -or $input -eq "ayuda") {
        Show-Help
        continue
    }
    
    if ($input -eq "inicio" -or $input -eq "tareas" -or $input -eq "focus" -or $input -eq "log") {
        Show-Inicio
        $messages += @{role = "user"; content = "El usuario ejecuto el comando: $input"}
        $messages += @{role = "assistant"; content = "He cargado la hoja de ruta del proyecto."}
        continue
    }
    
    if ($input -eq "model") {
        Write-Host "Modelos disponibles:" -ForegroundColor Yellow
        Write-Host "  moonshotai/kimi-k2.5       - Kimi K2.5 (multimodal, agentic)" -ForegroundColor Gray
        Write-Host "  moonshotai/kimi-k2-instruct - Kimi K2 Instruct" -ForegroundColor Gray
        Write-Host "  z-ai/glm-4.7              - GLM-4.7" -ForegroundColor Gray
        Write-Host "  deepseek-ai/deepseek-chat - DeepSeek" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Cambiar: model <modelo>" -ForegroundColor Yellow
        continue
    }
    
    if ($input.StartsWith("model ")) {
        $Model = $input.Substring(6).Trim()
        if ($Model -match "glm") { $AgentName = "GLM" }
        elseif ($Model -match "kimi" -and $Model -notmatch "k2.5") { $AgentName = "Kimi" }
        elseif ($Model -match "deepseek") { $AgentName = "DeepSeek" }
        else { $AgentName = "AI" }
        Write-Host "[OK] Modelo cambiado a: $Model ($AgentName)" -ForegroundColor Green
        continue
    }
    
    if ($input.StartsWith("read ") -or $input.StartsWith("leer ")) {
        $path = $input.Substring(5).Trim()
        $content = Read-ProjectFile -path $path
        Write-Host ""
        Write-Host "=== $path ===" -ForegroundColor $FileColor
        Write-Host $content -ForegroundColor White
        Write-Host ""
        continue
    }
    
    if ($input.StartsWith("ls ") -or $input.StartsWith("dir ")) {
        $path = $input.Substring(3).Trim()
        $fullPath = if ($path) { Join-Path $ProjectRoot $path } else { $ProjectRoot }
        if (Test-Path $fullPath) {
            $files = Get-ChildItem $fullPath -ErrorAction SilentlyContinue
            Write-Host ""
            Write-Host "=== $path ===" -ForegroundColor $FileColor
            $files | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }
            Write-Host ""
        }
        continue
    }
    
    if ($input.StartsWith("run ") -or $input.StartsWith("ejecutar ")) {
        $cmd = $input.Substring(4).Trim()
        Write-Host ""
        Write-Host "[Running] $cmd" -ForegroundColor $CmdColor
        try {
            $output = Invoke-Expression "cd $ProjectRoot; $cmd" 2>&1
            Write-Host $output -ForegroundColor White
        } catch {
            Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        }
        Write-Host ""
        continue
    }
    
    if ($input -eq "") {
        continue
    }
    
    $messages += @{role = "user"; content = $input}
    Write-Host "${AgentName}: " -NoNewline -ForegroundColor $BotColor
    
    $response = Send-ToAI -messages $messages
    
    if ($response) {
        Write-Host $response -ForegroundColor White
        $messages += @{role = "assistant"; content = $response}
    }
    else {
        Write-Host "[Sin respuesta]" -ForegroundColor Red
    }
    
    Write-Host ""
}
