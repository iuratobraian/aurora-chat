# Aurora Portal - Desktop Shortcut Installer
# Run this script to create a desktop shortcut for Aurora Portal

param(
    [switch]$Uninstall
)

$PROJECT_PATH = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$SCRIPT_PATH = "$PROJECT_PATH\scripts\aurora-portal-launcher.ps1"
$SHORTCUT_NAME = "Aurora Portal"
$DESKTOP_PATH = [Environment]::GetFolderPath("Desktop")
$SHORTCUT_PATH = "$DESKTOP_PATH\$SHORTCUT_NAME.lnk"
$ICON_PATH = "$PROJECT_PATH\aura.png"

if ($Uninstall) {
    if (Test-Path $SHORTCUT_PATH) {
        Remove-Item $SHORTCUT_PATH -Force
        Write-Host "Shortcuts removed successfully." -ForegroundColor Green
    } else {
        Write-Host "No shortcuts found to remove." -ForegroundColor Yellow
    }
    exit
}

# Create WScript Shell object
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($SHORTCUT_PATH)

# Configure shortcut
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -NoExit -File `"$SCRIPT_PATH`""
$shortcut.WorkingDirectory = Split-Path $SCRIPT_PATH
$shortcut.Description = "Aurora Portal - Agent Orchestration Center"
$shortcut.IconLocation = "$env:SystemRoot\System32\Shell32.dll,70"  # Default system icon

# Save shortcut
$shortcut.Save()

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Aurora Portal Desktop Shortcut Created!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Shortcut Location: $SHORTCUT_PATH" -ForegroundColor White
Write-Host ""
Write-Host "  Double-click the shortcut to launch Aurora Portal!" -ForegroundColor Yellow
Write-Host ""
