# Instalador Unificado de Auto-Boot de TradeShare
# Reemplaza el Sentinel aislado e instala el Boot Completo (Server + Centinela)

$WshShell = New-Object -comObject WScript.Shell
$StartupFolder = $WshShell.SpecialFolders.Item("Startup")
$ProjectFolder = (Get-Item -Path ".\").FullName
$BootScriptPath = Join-Path $ProjectFolder "scripts\windows-auto-boot.bat"

# Limpieza del viejo acceso (Si existe)
$OldShortcutPath = Join-Path $StartupFolder "Aurora-Hive-Sentinel.lnk"
if (Test-Path $OldShortcutPath) {
    Remove-Item $OldShortcutPath -Force
}

$ShortcutPath = Join-Path $StartupFolder "TradeShare-Auto-Boot.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

$Shortcut.TargetPath = """$BootScriptPath"""
$Shortcut.WorkingDirectory = $ProjectFolder
$Shortcut.WindowStyle = 7 # Ejecutar minimizado si es posible
$Shortcut.Description = "Sistema Central TradeShare: Arranca Server y Sentinel en segundo plano"
$Shortcut.Save()

Write-Host "✨ [AURORA] Sistema Unificado de Arranque instalado."
Write-Host "Ruta del acceso: $ShortcutPath"
Write-Host "La próxima vez que enciendas, localhost:3000 y el Sentinel vivirán solos."
