$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Aurora Nexus.lnk")
$Shortcut.TargetPath = "C:\Windows\System32\cmd.exe"
$Shortcut.Arguments = "/c start cmd /k `"cd /d C:\Users\iurato\Downloads\tradeportal-2025-platinum\.agent\aurora\nexus\aurora-nexus-web && npx -y serve -l 3000 aurora-nexus-desktop.html`""
$Shortcut.WorkingDirectory = "C:\Users\iurato\Downloads\tradeportal-2025-platinum\.agent\aurora\nexus\aurora-nexus-web"
$Shortcut.Description = "Aurora Nexus - Portal de Orquestacion de Agentes AI"
$Shortcut.Save()
Write-Host "Acceso directo creado!"
