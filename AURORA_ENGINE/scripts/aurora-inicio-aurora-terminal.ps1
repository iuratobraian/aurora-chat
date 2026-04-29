$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$statusPath = Join-Path $projectRoot ".agent/aurora/aurora-terminal-status.json"
$statusDir = Split-Path -Parent $statusPath

if (-not (Test-Path $statusDir)) {
  New-Item -ItemType Directory -Path $statusDir -Force | Out-Null
}

function Write-TerminalStatus {
  param(
    [string]$Phase,
    [string]$Message,
    [bool]$ReadyForShell = $false
  )

  $payload = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    phase = $Phase
    message = $Message
    readyForShell = $ReadyForShell
    pid = $PID
  }

  $json = $payload | ConvertTo-Json -Depth 4
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($statusPath, $json, $utf8NoBom)
}

function Invoke-Step {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$Label
  )

  Write-Host ""
  Write-Host "==> $Label" -ForegroundColor Cyan
  Write-TerminalStatus -Phase "working" -Message $Label
  & $FilePath @Arguments
}

function Wait-AuroraApiHealth {
  param(
    [int]$TimeoutSeconds = 30
  )

  Write-Host ""
  Write-Host "==> Wait for dedicated Aurora API terminal" -ForegroundColor Cyan
  Write-TerminalStatus -Phase "working" -Message "Waiting for dedicated Aurora API terminal to become healthy."

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:4310/health" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        Write-Host "Aurora API healthy." -ForegroundColor Green
        return
      }
    } catch {
      Start-Sleep -Milliseconds 750
    }
  }

  throw "Aurora API no respondió saludable dentro de ${TimeoutSeconds}s."
}

Set-Location $projectRoot

if (Test-Path ".env.local.aurora") {
  Get-Content ".env.local.aurora" | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $parts = $_ -split '=', 2
    if ($parts.Length -eq 2) {
      [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
  }
}

Write-Host "AURORA TERMINAL / STARTUP WORKER" -ForegroundColor Magenta
Write-Host "Project root: $projectRoot" -ForegroundColor DarkGray
Write-TerminalStatus -Phase "booting" -Message "Aurora external terminal started."

Write-Host ""
Write-Host "Startup queue:" -ForegroundColor Yellow
Write-Host "  1. Sembrar conocimiento técnico fullstack"
Write-Host "  2. Esperar runtime HTTP de Aurora"
Write-Host "  3. Recuperar contexto y brief operativo"
Write-Host "  4. Refrescar activity runner y aprendizaje"
Write-Host "  5. Actualizar scorecard y product intelligence"
Write-Host "  6. Entrar al shell para continuar el trabajo"

Invoke-Step -FilePath "npm" -Arguments @("run", "aurora:seed-app-tech") -Label "Seed fullstack repo knowledge"
Wait-AuroraApiHealth -TimeoutSeconds 30
Invoke-Step -FilePath "npm" -Arguments @("run", "aurora:session-brief") -Label "Generate startup brief"
Invoke-Step -FilePath "npm" -Arguments @("run", "auto:runner") -Label "Process pending Aurora activity"
Invoke-Step -FilePath "npm" -Arguments @("run", "ops:auto-learn") -Label "Ingest recent Aurora learnings"
Invoke-Step -FilePath "npm" -Arguments @("run", "aurora:scorecard") -Label "Refresh Aurora scorecard"
Invoke-Step -FilePath "npm" -Arguments @("run", "aurora:product") -Label "Refresh product intelligence"

Write-Host ""
Write-Host "Aurora startup work complete. Opening live shell..." -ForegroundColor Green
Write-TerminalStatus -Phase "shell" -Message "Aurora startup work complete; shell is now active." -ReadyForShell $true

npm run aurora:shell
