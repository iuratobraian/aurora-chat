#!/usr/bin/env pwsh
# Stitch Designer Agent - Quick Commands for Windows

param(
    [string]$Command = "help",
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ExtraArgs = @()
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$localConfigDir = Join-Path $repoRoot ".agent/local"
$localConfigPath = Join-Path $localConfigDir "stitch.env.ps1"
$lastRunPath = Join-Path $localConfigDir "stitch-last-run.json"
$auroraBriefPath = Join-Path $repoRoot ".agent/aurora/app/AURORA_CHAT_STITCH_BRIEF.md"

function Ensure-StitchConfigLoaded {
    if ($env:STITCH_API_KEY) {
        return $true
    }

    if (Test-Path $localConfigPath) {
        . $localConfigPath
    }

    return [bool]$env:STITCH_API_KEY
}

function Save-StitchConfig {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ApiKey
    )

    New-Item -ItemType Directory -Force -Path $localConfigDir | Out-Null
    $escapedKey = $ApiKey.Replace("'", "''")
    Set-Content -Path $localConfigPath -Encoding UTF8 -Value @(
        '$env:STITCH_API_KEY=''' + $escapedKey + ''''
    )
}

function Invoke-StitchTool {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ToolName,
        [string]$JsonData = ""
    )

    if (-not (Ensure-StitchConfigLoaded)) {
        throw "STITCH_API_KEY no configurada. Usa '.\scripts\stitch.ps1 configure <api-key>' primero."
    }

    if ($JsonData) {
        npx @_davideast/stitch-mcp tool $ToolName -d $JsonData
        return
    }

    npx @_davideast/stitch-mcp tool $ToolName
}

function Invoke-StitchToolJson {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ToolName,
        [string]$JsonData = ""
    )

    if (-not (Ensure-StitchConfigLoaded)) {
        throw "STITCH_API_KEY no configurada. Usa '.\scripts\stitch.ps1 configure <api-key>' primero."
    }

    if ($JsonData) {
        $raw = npx @_davideast/stitch-mcp tool $ToolName -d $JsonData --output json
    } else {
        $raw = npx @_davideast/stitch-mcp tool $ToolName --output json
    }

    return $raw | ConvertFrom-Json
}

function Get-AuroraChatPrompt {
    return @"
Design a desktop-first dark AI engineering chat called Aurora.
It should feel like a premium local coding copilot and runtime control room.

Use a refined technical dark theme with teal/aqua accents, soft glass panels,
calm gradients, large Aurora branding, and clear information hierarchy.

Include:
- left sidebar with identity, runtime health, quick metrics and actions
- main conversation area with welcome hero, alert strip, message list and sticky composer
- starter prompts for coding tasks
- cards for session brief and task context
- loading state with large AURORA headline and readiness feedback

Avoid generic SaaS purple gradients.
Make it modern, useful, breathable and serious enough for fullstack work.
Prefer subtle depth, layered surfaces and strong typography.
Desktop first, but responsive for mobile.
"@
}

function Save-StitchLastRun {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Data
    )

    New-Item -ItemType Directory -Force -Path $localConfigDir | Out-Null
    $Data | ConvertTo-Json -Depth 16 | Set-Content -Path $lastRunPath -Encoding UTF8
}

function Show-StitchLastRun {
    if (-not (Test-Path $lastRunPath)) {
        Write-Host "No hay ejecuciones automáticas guardadas todavía." -ForegroundColor Yellow
        return
    }

    Write-Host "Última ejecución automática de Stitch" -ForegroundColor Cyan
    Get-Content $lastRunPath
}

function Show-AuroraChatBrief {
    Write-Host "Aurora Chat Stitch Brief" -ForegroundColor Cyan
    Write-Host "Spec: $auroraBriefPath" -ForegroundColor DarkGray
    if (Test-Path $auroraBriefPath) {
        Get-Content $auroraBriefPath
    } else {
        Write-Host "Brief no encontrado." -ForegroundColor Yellow
    }
}

switch ($Command.ToLower()) {
    "configure" {
        $apiKey = $ExtraArgs[0]
        if (-not $apiKey) {
            throw "Debes pasar la API key: .\stitch.ps1 configure <api-key>"
        }

        Save-StitchConfig -ApiKey $apiKey
        Ensure-StitchConfigLoaded | Out-Null
        Write-Host "🎨 Stitch configurado localmente." -ForegroundColor Green
        Write-Host "Config guardada en $localConfigPath" -ForegroundColor DarkGray
    }
    "status" {
        $configured = Ensure-StitchConfigLoaded
        if ($configured) {
            Write-Host "🎨 Stitch listo." -ForegroundColor Green
            Write-Host "Config local: $localConfigPath" -ForegroundColor DarkGray
            return
        }

        Write-Host "🎨 Stitch no configurado." -ForegroundColor Yellow
        Write-Host "Usa: .\stitch.ps1 configure <api-key>" -ForegroundColor DarkGray
    }
    "init" {
        if (-not (Ensure-StitchConfigLoaded)) {
            throw "STITCH_API_KEY no configurada. Usa '.\stitch.ps1 configure <api-key>' primero."
        }
        Write-Host "🎨 Inicializando Stitch Designer Agent..." -ForegroundColor Cyan
        npx @_davideast/stitch-mcp init
    }
    "design" {
        Write-Host "🎨 Diseñando componente: $($ExtraArgs -join ' ')" -ForegroundColor Cyan
        if (-not (Ensure-StitchConfigLoaded)) {
            throw "STITCH_API_KEY no configurada. Usa '.\stitch.ps1 configure <api-key>' primero."
        }
        npx @_davideast/stitch-mcp view --projects
    }
    "preview" {
        $projectId = $ExtraArgs[0]
        Write-Host "🎨 Previsualizando proyecto: $projectId" -ForegroundColor Cyan
        if (-not (Ensure-StitchConfigLoaded)) {
            throw "STITCH_API_KEY no configurada. Usa '.\stitch.ps1 configure <api-key>' primero."
        }
        if ($projectId) {
            npx @_davideast/stitch-mcp serve -p $projectId
        } else {
            npx @_davideast/stitch-mcp view --projects
        }
    }
    "projects" {
        Write-Host "🎨 Proyectos disponibles:" -ForegroundColor Cyan
        Invoke-StitchTool -ToolName "list_projects"
    }
    "screens" {
        $projectId = $ExtraArgs[0]
        if (-not $projectId) {
            throw "Debes pasar el project id sin prefijo projects/: .\stitch.ps1 screens 2984742732221673460"
        }
        Invoke-StitchTool -ToolName "list_screens" -JsonData ('{"projectId":"' + $projectId + '"}')
    }
    "aurora-chat:auto" {
        $titleSuffix = if ($ExtraArgs.Count) { " - " + ($ExtraArgs -join " ") } else { "" }
        $title = "Aurora Chat Auto" + $titleSuffix
        $prompt = Get-AuroraChatPrompt

        Write-Host "🎨 Creando proyecto Stitch para Aurora..." -ForegroundColor Cyan
        $project = Invoke-StitchToolJson -ToolName "create_project" -JsonData (@{ title = $title } | ConvertTo-Json -Compress)
        $projectName = $project.name
        $projectId = $projectName -replace "^projects/", ""

        Write-Host "🎨 Generando pantalla desde el brief de Aurora..." -ForegroundColor Cyan
        $screen = Invoke-StitchToolJson -ToolName "generate_screen_from_text" -JsonData (@{
            projectId = $projectId
            deviceType = "DESKTOP"
            prompt = $prompt
        } | ConvertTo-Json -Compress)

        $lastRun = [ordered]@{
            timestamp = (Get-Date).ToString("o")
            mode = "aurora-chat:auto"
            project = $project
            generation = $screen
            prompt = $prompt
        }
        Save-StitchLastRun -Data $lastRun

        Write-Host "Proyecto creado: $projectName" -ForegroundColor Green
        Write-Host "Último run guardado en $lastRunPath" -ForegroundColor DarkGray
        Write-Host "Si quieres inspeccionarlo: .\stitch.ps1 screens $projectId" -ForegroundColor DarkGray
    }
    "aurora-chat:last" {
        Show-StitchLastRun
    }
    "doctor" {
        Write-Host "🎨 Verificando configuración..." -ForegroundColor Cyan
        npx @_davideast/stitch-mcp doctor
    }
    "proxy" {
        Write-Host "🎨 Iniciando proxy MCP para agentes..." -ForegroundColor Cyan
        if (-not (Ensure-StitchConfigLoaded)) {
            throw "STITCH_API_KEY no configurada. Usa '.\stitch.ps1 configure <api-key>' primero."
        }
        npx @_davideast/stitch-mcp proxy
    }
    "aurora-chat" {
        Show-AuroraChatBrief
        Write-Host ""
        Write-Host "Proyecto sugerido para base visual: 2984742732221673460" -ForegroundColor Green
        Write-Host "Siguiente paso manual: .\stitch.ps1 screens 2984742732221673460" -ForegroundColor DarkGray
        Write-Host "Siguiente paso automático: .\stitch.ps1 aurora-chat:auto" -ForegroundColor DarkGray
    }
    default {
        Write-Host @"
🎨 Stitch Designer Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Comandos disponibles:

  configure - Guardar API key local de Stitch (ignorada por git)
  status    - Ver si Stitch ya quedó configurado
  init      - Inicializar autenticación Stitch
  design    - Diseñar nuevo componente
  preview   - Previsualizar proyecto (usar: stitch.ps1 preview [project-id])
  projects  - Listar proyectos disponibles
  screens   - Listar pantallas de un proyecto (usar ID sin prefijo)
  doctor    - Diagnosticar configuración
  proxy     - Iniciar proxy MCP para otros agentes
  aurora-chat - Abrir el brief recomendado para rediseñar Aurora
  aurora-chat:auto - Crear proyecto y generar el diseño base de Aurora automáticamente
  aurora-chat:last - Ver el último run automático guardado
  help      - Mostrar esta ayuda

Ejemplo: .\stitch.ps1 design "trading card component"

Auto-activación:
  Usa /stitch en Claude Code para activar el diseñador
  Se activa automáticamente con: diseñar, design, UI component

"@ -ForegroundColor Green
    }
}
