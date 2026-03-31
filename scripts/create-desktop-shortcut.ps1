$WshShell = New-Object -ComObject WScript.Shell

$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\GLM-4.7 Chat.lnk")
$Shortcut.TargetPath = "C:\Users\iurato\Downloads\tradeportal-2025-platinum\scripts\chat-kimi.ps1"
$Shortcut.WorkingDirectory = "C:\Users\iurato\Downloads\tradeportal-2025-platinum\scripts"
$Shortcut.Description = "Aurora Nexus - GLM-4.7 AI Chat Terminal"
$Shortcut.IconLocation = "C:\Windows\System32\cmd.exe,0"
$Shortcut.Save()

$Shortcut2 = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Aurora Antigravity.lnk")
$Shortcut2.TargetPath = "C:\Users\iurato\Downloads\tradeportal-2025-platinum\scripts\start-antigravity.bat"
$Shortcut2.WorkingDirectory = "C:\Users\iurato\Downloads\tradeportal-2025-platinum"
$Shortcut2.Description = "Aurora Nexus - Antigravity Mode"
$Shortcut2.IconLocation = "C:\Windows\System32\cmd.exe,0"
$Shortcut2.Save()

Write-Host "Shortcuts creados en el escritorio:" -ForegroundColor Green
Write-Host "  - GLM-4.7 Chat.lnk" -ForegroundColor Cyan
Write-Host "  - Aurora Antigravity.lnk" -ForegroundColor Magenta
