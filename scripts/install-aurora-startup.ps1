param(
  [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$startupDir = [Environment]::GetFolderPath("Startup")
$startupCmdPath = Join-Path $startupDir "AuroraAutoStart.cmd"
$repoLauncherPath = Join-Path $projectRoot "scripts\aurora-startup.cmd"

if ($Uninstall) {
  if (Test-Path $startupCmdPath) {
    Remove-Item $startupCmdPath -Force
    Write-Host "Autoarranque de Aurora removido de Startup." -ForegroundColor Yellow
  } else {
    Write-Host "No existía autoarranque instalado." -ForegroundColor DarkYellow
  }
  return
}

$content = @"
@echo off
cd /d "$projectRoot"
call "$repoLauncherPath"
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($startupCmdPath, $content.Trim() + "`r`n", $utf8NoBom)

Write-Host "Autoarranque de Aurora instalado en Startup." -ForegroundColor Green
Write-Host "Archivo: $startupCmdPath" -ForegroundColor DarkGray
