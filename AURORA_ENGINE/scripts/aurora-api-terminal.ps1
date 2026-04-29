$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$statusPath = Join-Path $projectRoot ".agent/aurora/aurora-api-terminal-status.json"
$runtimeStatusPath = Join-Path $projectRoot ".agent/aurora/aurora-api-runtime.json"
$statusDir = Split-Path -Parent $statusPath
$apiUrl = "http://127.0.0.1:4310/app"
$healthUrl = "http://127.0.0.1:4310/health"

if (-not (Test-Path $statusDir)) {
  New-Item -ItemType Directory -Path $statusDir -Force | Out-Null
}

function Write-ApiTerminalStatus {
  param(
    [string]$Phase,
    [string]$Message,
    [bool]$Healthy = $false
  )

  $payload = [ordered]@{
    updatedAt = (Get-Date).ToString("o")
    phase = $Phase
    message = $Message
    healthy = $Healthy
    pid = $PID
    apiUrl = $apiUrl
    healthUrl = $healthUrl
    runtimeStatusFile = $runtimeStatusPath
  }

  $json = $payload | ConvertTo-Json -Depth 5
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($statusPath, $json, $utf8NoBom)
}

function Read-JsonFile {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return $null
  }

  try {
    return Get-Content $Path -Raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Test-ProcessAlive {
  param([object]$ProcessId)

  if (-not $ProcessId) {
    return $false
  }

  return [bool](Get-Process -Id ([int]$ProcessId) -ErrorAction SilentlyContinue)
}

function Test-AuroraHealth {
  try {
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
    return ($response.StatusCode -eq 200)
  } catch {
    return $false
  }
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

Write-Host "AURORA API TERMINAL" -ForegroundColor Magenta
Write-Host "Project root: $projectRoot" -ForegroundColor DarkGray
Write-Host "Chat local: $apiUrl" -ForegroundColor Cyan

$existingStatus = Read-JsonFile -Path $statusPath
if ($existingStatus -and $existingStatus.pid -and ([int]$existingStatus.pid -ne $PID) -and (Test-ProcessAlive -ProcessId $existingStatus.pid) -and @("booting", "starting", "running") -contains $existingStatus.phase) {
  Write-Host ""
  Write-Host "Aurora API ya está gestionada por otra terminal (PID $($existingStatus.pid))." -ForegroundColor Yellow
  Write-Host "Usa el chat local en: $apiUrl" -ForegroundColor Green
  return
}

Write-ApiTerminalStatus -Phase "booting" -Message "Aurora API terminal iniciada."

if (Test-AuroraHealth) {
  Write-Host ""
  Write-Host "Aurora API ya estaba saludable en otra sesión." -ForegroundColor Green
  Write-Host "Abrir navegador en: $apiUrl" -ForegroundColor Green
  Write-ApiTerminalStatus -Phase "running" -Message "Aurora API ya estaba saludable en una sesión previa." -Healthy $true
  return
}

try {
  Write-Host ""
  Write-Host "==> Reservando puerto Aurora" -ForegroundColor Cyan
  Write-ApiTerminalStatus -Phase "starting" -Message "Reservando puerto de Aurora antes de iniciar la API."
  node scripts/aurora-ensure-port.mjs

  Write-Host ""
  Write-Host "==> Levantando Aurora API en foreground" -ForegroundColor Cyan
  Write-Host "Abrir navegador en: $apiUrl" -ForegroundColor Yellow
  Write-ApiTerminalStatus -Phase "running" -Message "Aurora API corriendo en terminal dedicada." -Healthy $true

  node scripts/aurora-api.mjs

  Write-ApiTerminalStatus -Phase "stopped" -Message "Aurora API terminó y la terminal quedó disponible." -Healthy $false
} catch {
  Write-ApiTerminalStatus -Phase "crashed" -Message $_.Exception.Message -Healthy $false
  throw
}
