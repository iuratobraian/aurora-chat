param(
  [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$bootstrapScript = Join-Path $projectRoot "scripts/aurora-inicio-bootstrap.ps1"
$statePath = Join-Path $projectRoot ".agent/aurora/ruflo-bootstrap.json"
$chatUrl = "http://127.0.0.1:4310/app"

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

Set-Location $projectRoot

Write-Host "AURORA STARTUP" -ForegroundColor Magenta
Write-Host "Project root: $projectRoot" -ForegroundColor DarkGray

& $bootstrapScript

Start-Sleep -Seconds 2
$state = Read-JsonFile -Path $statePath

if ($state.auroraApiTerminal) {
  $apiMode = if ($state.auroraApiTerminal.reused) { "reutilizada" } else { "lanzada" }
  Write-Host "Aurora API $apiMode en PID $($state.auroraApiTerminal.pid)" -ForegroundColor Green
}

if ($state.auroraTerminal) {
  $terminalMode = if ($state.auroraTerminal.reused) { "reutilizada" } else { "lanzada" }
  Write-Host "Aurora shell $terminalMode en PID $($state.auroraTerminal.pid)" -ForegroundColor Green
}

Write-Host "Chat local: $chatUrl" -ForegroundColor Cyan

if ($OpenBrowser) {
  Start-Process $chatUrl | Out-Null
}
