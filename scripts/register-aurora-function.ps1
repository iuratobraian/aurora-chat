param()

$profilePath = $PROFILE.CurrentUserAllHosts
if (-not (Test-Path $profilePath)) {
  New-Item -ItemType File -Path $profilePath -Force
}

$functionDef = @'
function aurora {
  powershell -ExecutionPolicy Bypass -File "C:\Users\iurato\Downloads\tradeportal-2025-platinum\scripts\start-aurora-antigravity.ps1"
}
'@

$content = Get-Content -Path $profilePath -Raw
if ($content -notmatch "function aurora") {
  Add-Content -Path $profilePath -Value $functionDef
  Write-Host "Función aurora registrada. Ejecutá `aurora` desde cualquier PowerShell para arrancar Aurora completo."
} else {
  Write-Host "aurora ya existe en el perfil."
}
