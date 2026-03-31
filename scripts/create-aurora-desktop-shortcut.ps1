$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$iconScript = Join-Path $projectRoot "scripts\create-aurora-icon.ps1"
$startupScript = Join-Path $projectRoot "scripts\aurora-startup.ps1"
$iconPath = Join-Path $projectRoot ".agent\aurora\assets\aurora-icon.ico"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Aurora Chat.lnk"

if (-not (Test-Path $iconPath)) {
  & $iconScript
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$startupScript`" -OpenBrowser"
$shortcut.WorkingDirectory = $projectRoot
$shortcut.IconLocation = $iconPath
$shortcut.Description = "Aurora Chat local con agentes y runtime del repo"
$shortcut.Save()

Write-Host "Acceso directo creado en $shortcutPath" -ForegroundColor Green
