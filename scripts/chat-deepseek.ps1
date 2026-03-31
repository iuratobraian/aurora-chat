# NVIDIA DeepSeek V3.2 - Chat Terminal con Acceso al Proyecto
# Integrado con Aurora Nexus + Protocolo Inicio

param(
    [string]$Model = "deepseek-ai/deepseek-v3.2",
    [string]$AgentName = "DeepSeek"
)

$ErrorActionPreference = "Continue"

$ProjectRoot = "C:\Users\iurato\Downloads\tradeportal-2025-platinum"
$AgentWorkspace = "$ProjectRoot\.agent\workspace\coordination"

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
        max_tokens = 2048
        temperature = 0.7
    } | ConvertTo-Json

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
    Write-Host (Get-CurrentFocus) -ForegroundColor White
    Write-Host ""
    
    Write-Host "[3] Historial Reciente (AGENT_LOG):" -ForegroundColor $TaskColor
    Write-Host (Get-AgentLog) -ForegroundColor White
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor $SystemColor
    Write-Host "Comandos: inicio = recargar hoja de ruta" -ForegroundColor Gray
    Write-Host ""
}

$systemPrompt = @"
You are $AgentName, an AI coding assistant integrated into Aurora Nexus project.

IMPORTANT - Protocolo de Inicio:
When user types 'inicio', show the TASK_BOARD.md, CURRENT_FOCUS.md and AGENT_LOG.md.

You can: read files, list directories, run commands, analyze code.
"@

Clear-Host
Write-Host "========================================" -ForegroundColor $SystemColor
Write-Host "  AURORA NEXUS - $AgentName" -ForegroundColor $SystemColor
Write-Host "  Modelo: $Model" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor $SystemColor
Write-Host ""
Write-Host "Escribe 'inicio' para cargar la hoja de ruta" -ForegroundColor Yellow
Write-Host "Comandos: help, exit, clear" -ForegroundColor Gray
Write-Host ""

$messages = @(
    @{role = "system"; content = $systemPrompt}
)

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
        Write-Host ""
        Write-Host "Comandos: inicio, tareas, focus, log, read <file>, ls <dir>, run <cmd>, exit, clear" -ForegroundColor Gray
        Write-Host ""
        continue
    }
    
    if ($input -eq "inicio" -or $input -eq "tareas" -or $input -eq "focus" -or $input -eq "log") {
        Show-Inicio
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
    
    if ($input -eq "") { continue }
    
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
