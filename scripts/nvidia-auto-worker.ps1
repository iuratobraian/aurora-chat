# NVIDIA Agent Auto-Worker - Protocolo Inicio v3.5
#Sigue el protocolo completo de inicio

param(
    [string]$Agent = "kimi",
    [switch]$Silent,
    [string]$TaskLimit = "3"
)

$ErrorActionPreference = "Continue"

# Rutas
$ProjectRoot = "C:\Users\iurato\Downloads\tradeportal-2025-platinum"
$AgentWorkspace = "$ProjectRoot\.agent\workspace\coordination"
$SkillsPath = "$ProjectRoot\.agent\skills"

# Colores
$InfoColor = "Cyan"
$WarnColor = "Yellow"
$SuccessColor = "Green"
$ErrorColor = "Red"

function Write-Step {
    param([string]$msg, [string]$color = "White")
    if (-not $Silent) {
        Write-Host $msg -ForegroundColor $color
    }
}

# Configurar modelo
$agentConfig = @{
    kimi = @{ model = "moonshotai/kimi-k2-instruct"; name = "Kimi" }
    deepseek = @{ model = "deepseek-ai/deepseek-v3.2"; name = "DeepSeek" }
    minimax = @{ model = "minimaxai/minimax-m2.5"; name = "MiniMax" }
    glm5 = @{ model = "z-ai/glm5"; name = "GLM-5" }
}

$config = $agentConfig[$Agent.ToLower()]
$config = if ($config) { $config } else { $agentConfig["kimi"] }
$Model = $config.model
$AgentName = $config.name

# Cargar API key
$ApiKey = Get-Content "$ProjectRoot\.env.nvidia" -Raw -ErrorAction SilentlyContinue
if (-not $ApiKey) { $ApiKey = $env:NVIDIA_API_KEY }
$ApiKey = $ApiKey.Trim()

if (-not $Silent) {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor $InfoColor
    Write-Host "  AURORA NEXUS - Auto-Worker Protocolo Inicio v3.5" -ForegroundColor $InfoColor
    Write-Host "  Agente: $AgentName | Modelo: $Model" -ForegroundColor Gray
    Write-Host "====================================================" -ForegroundColor $InfoColor
    Write-Host ""
}

# ======================
#PASO 1: Cargar Contexto
# ======================
Write-Step "[PASO 1] Recuperando contexto..." $WarnColor

# Leer archivos critica en paralelo
$contextData = @{}

# AGENTS.md
$agentsPath = Join-Path $ProjectRoot "AGENTS.md"
if (Test-Path $agentsPath) {
    $contextData.agents = Get-Content $agentsPath -Raw | Select-Object -First 50
}

# CURRENT_FOCUS.md
$focusPath = Join-Path $AgentWorkspace "CURRENT_FOCUS.md"
if (Test-Path $focusPath) {
    $contextData.focus = Get-Content $focusPath -Raw
}

# AGENT_LOG.md (ultimas 3 entradas)
$logPath = Join-Path $AgentWorkspace "AGENT_LOG.md"
if (Test-Path $logPath) {
    $logContent = Get-Content $logPath -Raw
    $logLines = $logContent -split "`n" | Where-Object { $_ -match '^\|' }
    $contextData.log = ($logLines | Select-Object -Last 3) -join "`n"
}

# TASK_BOARD.md
$taskBoardPath = Join-Path $AgentWorkspace "TASK_BOARD.md"
if (Test-Path $taskBoardPath) {
    $tbContent = Get-Content $taskBoardPath -Raw
    $tbLines = $tbContent -split "`n"
    $pendingTasks = @()
    $inBoard = $false
    foreach ($line in $tbLines) {
        if ($line -match '^\| TASK-ID') { $inBoard = $true; continue }
        if ($inBoard -and $line -match '^\|') {
            if ($line -match '\| (pending|claimed|in_progress) \|') {
                $pendingTasks += $line
            }
        }
    }
    $contextData.taskboard = $pendingTasks
}

if (-not $Silent) {
    Write-Step "  - AGENTS.md: OK" $SuccessColor
    Write-Step "  - CURRENT_FOCUS.md: OK" $SuccessColor
    Write-Step "  - AGENT_LOG.md: OK" $SuccessColor
    Write-Step "  - TASK_BOARD.md: $($pendingTasks.Count) tareas" $SuccessColor
}

# ======================
#PASO 2: Detectar Complejidad
# ======================
Write-Step "" 
Write-Step "[PASO 2] Detectando complejidad..." $WarnColor

# Contar archivos afectados
$filesCount = 0
foreach ($task in $pendingTasks) {
    if ($task -match '\| (pending|claimed|in_progress) \|') {
        $filesCount += 1
    }
}

# Routing simple (sin swarm para ahora)
$useSwarm = $filesCount -ge 3
if ($useSwarm) {
    Write-Step "  Complexidad: ALTA - Se requerira swarm" $WarnColor
    Write-Step "  Nota: Swarm no implementado en esta version" $WarnColor
} else {
    Write-Step "  Complexidad: BAJA - Ejecucion directa" $SuccessColor
}

# ======================
#PASO 3: Reclamar Tareas (3-Task Batching)
# ======================
Write-Step ""
Write-Step "[PASO 3] Reclamando tareas..." $WarnColor

$maxTasks = [int]$TaskLimit
$selectedTasks = @()
$count = 0

# Buscar 3 tareas pending
foreach ($task in $pendingTasks) {
    if ($count -ge $maxTasks) { break }
    
    if ($task -match '\| ([A-Z0-9_-]+) \|') {
        $tid = $matches[1]
        $selectedTasks += $tid
        $count++
        
        # Actualizar en TASK_BOARD (cambiar a claimed)
        $tbContent = $tbContent -replace "\| $tid \| pending \|", "| $tid | claimed |"
        $tbContent = $tbContent -replace "\| $tid \|", "| $tid | claimed | $AgentName |"
    }
}

# Guardar TASK_BOARD actualizado
$tbContent | Out-File -FilePath $taskBoardPath -Force

if (-not $Silent) {
    Write-Step "  Tareas reclamadas: $($selectedTasks.Count)" $SuccessColor
    $selectedTasks | ForEach-Object { Write-Step "    - $_" $InfoColor }
}

# ======================
#PASO 4: Actualizar CURRENT_FOCUS
# ======================
$focusContent = @"
# Current Focus

## Sesion
- **Agente:** $AgentName
- **Modelo:** $Model
- **Inicio:** $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Tareas Reclamadas
$(($selectedTasks | ForEach-Object { "- $_" }) -join "`n")

## Estado
- **Estado:** in_progress
- **Progreso:** working

## Protocolo
Protocolo de inicio v3.5 activado.
"@
$focusContent | Out-File -FilePath $focusPath -Force

# ======================
#PASO 5: Ejecutar Tareas con IA
# ======================
Write-Step ""
Write-Step "[PASO 5] Ejecutando tareas..." $WarnColor

function Send-ToAI {
    param($messages)
    
    $body = @{
        model = $Model
        messages = $messages
        max_tokens = 2048
        temperature = 0.7
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
            -Method Post `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $ApiKey" } `
            -Body $body `
            -TimeoutSec 180
        return $response.choices[0].message.content
    }
    catch {
        Write-Step "[ERROR API] $($_.Exception.Message)" $ErrorColor
        return $null
    }
}

# Sistema prompt
$systemPrompt = @"
You are an autonomous AI coding assistant working on TradePortal project (Aurora Nexus).

Follow these rules (from AGENTS.md):
1. Keep changes small and reversible
2. Use absolute relative imports from repo root
3. Prefer explicit interfaces for public shapes
4. Follow naming conventions (kebab-case files, camelCase functions)
5. Fail fast with clear HTTP errors
6. Do not commit secrets

Context Loaded:
- Focus: $($contextData.focus.Substring(0, [Math]::Min(200, $contextData.focus.Length)))
- Log: $($contextData.log)

Current Tasks:
$(($selectedTasks | ForEach-Object { "- $_" }) -join "`n")

Instructions:
1. Analyze each task and its acceptance criteria
2. Read relevant files from the project
3. Make necessary changes
4. Report progress for each task
"@

$taskMsg = @"
Tienes $($selectedTasks.Count) tareas asignadas:

$((($selectedTasks | ForEach-Object { "Task: $_" }) -join "`n`n"))

Para cada tarea:
1. Lee los archivos relacionados
2. Implementa la solucion segun el objetivo
3. Verifica que cumple los criterios de aceptacion
4. Reporta el progreso

Trabaja en las tareas una por una. Si tienes dudas sobre el alcance, preguntame.
"@

$messages = @(
    @{role = "system"; content = $systemPrompt},
    @{role = "user"; content = $taskMsg}
)

$response = Send-ToAI -messages $messages

if ($response) {
    if (-not $Silent) {
        Write-Step "" 
        Write-Step "=== Respuesta del Agente ===" $SuccessColor
        Write-Step $response -ForegroundColor White
        Write-Step ""
    }
} else {
    Write-Step "[ERROR] No se recibio respuesta del agente" $ErrorColor
}

# ======================
#PASO 6: Cerrar Sesion
# ======================
Write-Step "[PASO 6] Cerrando sesion..." $WarnColor

# Registrar en AGENT_LOG
$logEntry = "| $(Get-Date -Format 'yyyy-MM-dd HH:mm') | $AgentName | $($selectedTasks -join ', ') | completado |"
if (Test-Path $logPath) {
    Add-Content -Path $logPath -Value $logEntry
} else {
    "# Agent Log`n$logEntry" | Out-File -FilePath $logPath
}

# Actualizar CURRENT_FOCUS
$closeFocus = @"
# Current Focus

## Sesion Cerrada
- **Agente:** $AgentName
- **Cierre:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
- **Tareas:** $($selectedTasks.Count) ejecutadas

## Estado
- **Estado:** completed

"@
$closeFocus | Out-File -FilePath $focusPath -Force

if (-not $Silent) {
    Write-Step "" 
    Write-Step "====================================================" $SuccessColor
    Write-Step "  SESION COMPLETADA" $SuccessColor
    Write-Step "  Tareas procesadas: $($selectedTasks.Count)" $SuccessColor
    Write-Step "====================================================" $SuccessColor
    Write-Step ""
}

# Verificar si hay mas tareas pending
if ($tbContent -match '\| pending \|') {
    Write-Step "[INFO] Hay mas tareas pendientes. Ejecuta nuevamente para continuar." $WarnColor
}