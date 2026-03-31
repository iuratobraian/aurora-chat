$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $root ".agent/aurora/ruflo-bootstrap.json"
$stateDir = Split-Path -Parent $statePath
$auroraApiTerminalScript = Join-Path $root "scripts/aurora-api-terminal.ps1"
$auroraApiTerminalStatusPath = Join-Path $root ".agent/aurora/aurora-api-terminal-status.json"
$auroraApiRuntimeStatusPath = Join-Path $root ".agent/aurora/aurora-api-runtime.json"
$auroraTerminalScript = Join-Path $root "scripts/aurora-inicio-aurora-terminal.ps1"
$auroraTerminalStatusPath = Join-Path $root ".agent/aurora/aurora-terminal-status.json"
$claudeFlow = Join-Path $root "node_modules/.bin/claude-flow.cmd"
$ruflo = Join-Path $root "node_modules/.bin/ruflo.cmd"
$maxAgents = if ($env:RUFLO_MAX_AGENTS) { [int]$env:RUFLO_MAX_AGENTS } else { 20 }
$objective = if ($env:RUFLO_BOOT_OBJECTIVE) { $env:RUFLO_BOOT_OBJECTIVE } else { "aurora-ruflo-startup" }

if (-not (Test-Path $stateDir)) {
  New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
}

function Invoke-RufloCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  try {
    $joinedArguments = $Arguments | ForEach-Object {
      if ($_ -match '\s') { '"' + $_.Replace('"', '\"') + '"' } else { $_ }
    }
    $commandLine = '"' + $FilePath + '" ' + ($joinedArguments -join ' ')
    $stdoutFile = [System.IO.Path]::GetTempFileName()
    $stderrFile = [System.IO.Path]::GetTempFileName()
    $process = Start-Process -FilePath "cmd.exe" `
      -ArgumentList "/c $commandLine" `
      -Wait `
      -PassThru `
      -NoNewWindow `
      -WorkingDirectory $root `
      -RedirectStandardOutput $stdoutFile `
      -RedirectStandardError $stderrFile
    $stdout = Get-Content $stdoutFile -Raw
    $stderr = Get-Content $stderrFile -Raw
    $output = @($stdout, $stderr) -join "`n"
    Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
    return @{
      ok = ($process.ExitCode -eq 0)
      output = $output.Trim()
    }
  } catch {
    return @{
      ok = $false
      output = $_.Exception.Message
    }
  }
}

function Get-SwarmId {
  param([string]$Text)

  if (-not $Text) { return $null }
  $swarmTable = [regex]::Match($Text, "Swarm ID\s*\|\s*([^\s|]+)")
  if ($swarmTable.Success) { return $swarmTable.Groups[1].Value }
  $monitor = [regex]::Match($Text, "swarm status (\S+)")
  if ($monitor.Success) { return $monitor.Groups[1].Value }
  return $null
}

function Read-JsonFile {
  param([string]$Path)

  if (-not (Test-Path $Path)) { return $null }
  try {
    return Get-Content $Path -Raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Test-ProcessAlive {
  param([object]$ProcessId)

  if (-not $ProcessId) { return $false }
  return [bool](Get-Process -Id ([int]$ProcessId) -ErrorAction SilentlyContinue)
}

function Test-AuroraApiHealth {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:4310/health" -UseBasicParsing -TimeoutSec 2
    return ($response.StatusCode -eq 200)
  } catch {
    return $false
  }
}

function Get-ExistingApiTerminal {
  $terminalStatus = Read-JsonFile -Path $auroraApiTerminalStatusPath
  if ($terminalStatus -and (Test-ProcessAlive -ProcessId $terminalStatus.pid) -and @("booting", "starting", "running") -contains $terminalStatus.phase) {
    return $terminalStatus
  }

  $runtimeStatus = Read-JsonFile -Path $auroraApiRuntimeStatusPath
  if ((Test-AuroraApiHealth) -and $runtimeStatus -and (Test-ProcessAlive -ProcessId $runtimeStatus.pid)) {
    return [pscustomobject]@{
      phase = "running"
      message = "Aurora API ya estaba saludable y será reutilizada."
      healthy = $true
      pid = $runtimeStatus.pid
    }
  }

  return $null
}

function Get-ExistingAuroraTerminal {
  $terminalStatus = Read-JsonFile -Path $auroraTerminalStatusPath
  if ($terminalStatus -and (Test-ProcessAlive -ProcessId $terminalStatus.pid) -and @("booting", "working", "shell") -contains $terminalStatus.phase) {
    return $terminalStatus
  }

  return $null
}

$state = [ordered]@{
  generatedAt = (Get-Date).ToString("o")
  available = (Test-Path $claudeFlow) -and (Test-Path $ruflo)
  maxAgents = $maxAgents
  objective = $objective
  init = $null
  start = $null
  status = $null
  swarmId = $null
  auroraTerminal = $null
}

if ($state.available) {
  $state.init = Invoke-RufloCommand -FilePath $claudeFlow -Arguments @(
    "swarm",
    "init",
    "--topology",
    "hierarchical",
    "--max-agents",
    "$maxAgents",
    "--strategy",
    "specialized"
  )
  $state.swarmId = Get-SwarmId -Text $state.init.output

  $state.start = Invoke-RufloCommand -FilePath $ruflo -Arguments @(
    "swarm",
    "start",
    "-o",
    $objective,
    "-s",
    "development"
  )
  if (-not $state.swarmId) {
    $state.swarmId = Get-SwarmId -Text $state.start.output
  }

  if ($state.swarmId) {
    $state.status = Invoke-RufloCommand -FilePath $ruflo -Arguments @(
      "swarm",
      "status",
      $state.swarmId
    )
  }
}

$existingApiTerminal = Get-ExistingApiTerminal
if ($existingApiTerminal) {
  $state.auroraApiTerminal = [ordered]@{
    launched = $false
    reused = $true
    pid = [int]$existingApiTerminal.pid
    script = $auroraApiTerminalScript
    statusFile = $auroraApiTerminalStatusPath
    url = "http://127.0.0.1:4310/app"
    note = $existingApiTerminal.message
  }
} else {
  if (Test-Path $auroraApiTerminalStatusPath) {
    Remove-Item $auroraApiTerminalStatusPath -Force -ErrorAction SilentlyContinue
  }

  $auroraApiTerminal = Start-Process powershell `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $auroraApiTerminalScript `
    -PassThru

  $state.auroraApiTerminal = [ordered]@{
    launched = $true
    reused = $false
    pid = $auroraApiTerminal.Id
    script = $auroraApiTerminalScript
    statusFile = $auroraApiTerminalStatusPath
    url = "http://127.0.0.1:4310/app"
  }
}

$existingAuroraTerminal = Get-ExistingAuroraTerminal
if ($existingAuroraTerminal) {
  $state.auroraTerminal = [ordered]@{
    launched = $false
    reused = $true
    pid = [int]$existingAuroraTerminal.pid
    script = $auroraTerminalScript
    statusFile = $auroraTerminalStatusPath
    note = $existingAuroraTerminal.message
  }
} else {
  if (Test-Path $auroraTerminalStatusPath) {
    Remove-Item $auroraTerminalStatusPath -Force -ErrorAction SilentlyContinue
  }

  $auroraTerminal = Start-Process powershell `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $auroraTerminalScript `
    -PassThru

  $state.auroraTerminal = [ordered]@{
    launched = $true
    reused = $false
    pid = $auroraTerminal.Id
    script = $auroraTerminalScript
    statusFile = $auroraTerminalStatusPath
  }
}

$json = $state | ConvertTo-Json -Depth 8
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($statePath, $json, $utf8NoBom)
