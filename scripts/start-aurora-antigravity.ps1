$projectRoot = Split-Path -Parent $PSScriptRoot
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

node scripts/aurora-ensure-port.mjs
node scripts/aurora-choose-repo.mjs

$apiCommand = "cd `"$projectRoot`"; npm run aurora:api"
$hookCommand = "cd `"$projectRoot`"; npm run auto:hook"

Start-Process powershell -ArgumentList "-NoProfile","-NoExit","-Command",$apiCommand
Start-Process powershell -ArgumentList "-NoProfile","-NoExit","-Command",$hookCommand -WindowStyle Hidden

npm run aurora:seed-app-learning
npm run aurora:seed-app-tech
npm run aurora:seed-community-loops
npm run aurora:scorecard
npm run aurora:shell
