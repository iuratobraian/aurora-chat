$ErrorActionPreference = "SilentlyContinue"

$PROJECT_PATH = "C:\Users\iurato\Downloads\tradeportal-2025-platinum\.agent\aurora\nexus\aurora-nexus-web"
$PORT = "61913"

$running = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue

if ($running) {
    Write-Host "Aurora Nexus ya esta corriendo."
    Start-Process "http://localhost:61913"
    exit 0
}

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Aurora Nexus.lnk")
$Shortcut.TargetPath = "C:\Windows\System32\cmd.exe"
$Shortcut.Arguments = '/c start "Aurora" cmd /k "cd /d ' + $PROJECT_PATH + ' && npx -y serve -l ' + $PORT + ' aurora-nexus-desktop.html && start http://localhost:' + $PORT + '"'
$Shortcut.WorkingDirectory = $PROJECT_PATH
$Shortcut.Description = "Aurora Nexus - Portal de Orquestacion de Agentes AI"
$Shortcut.Save()

Start-Process "cmd.exe" -ArgumentList '/c', 'cd /d', $PROJECT_PATH, '&&', 'npx', '-y', 'serve', '-l', $PORT, 'aurora-nexus-desktop.html', '&&', 'start', "http://localhost:$PORT"

Write-Host "Listo!"
Write-Host "Verifica el escritorio para el acceso directo."
Write-Host "Abre: http://localhost:61913"
