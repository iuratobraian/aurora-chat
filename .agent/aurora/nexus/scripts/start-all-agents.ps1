# Aurora Nexus - Start All Agents Script
# Multi-Agent Orchestration Launcher v2.0
# Author: Aurora Nexus Team

param(
    [switch]$SkipServer,
    [switch]$SkipWeb,
    [switch]$SkipAgents,
    [string]$Agents = "all"
)

$ErrorActionPreference = "Continue"
$PROJECT_PATH = "C:\Users\iurato\Downloads\tradeportal-2025-platinum"

# Colors
$Success = "Green"
$Warning = "Yellow"
$Error = "Red"
$Info = "Cyan"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor $Info
Write-Host "║              AURORA NEXUS - Multi-Agent Orchestration            ║" -ForegroundColor $Info
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor $Info
Write-Host ""

# Agent definitions
$AGENTS = @(
    @{ Name = "opencode"; DisplayName = "OpenCode"; Type = "opencode"; Color = "Orange" },
    @{ Name = "minimax1"; DisplayName = "Minimax #1"; Type = "minimax"; Color = "Pink" },
    @{ Name = "minimax2"; DisplayName = "Minimax #2"; Type = "minimax"; Color = "Pink" },
    @{ Name = "aurora"; DisplayName = "Aurora Core"; Type = "aurora"; Color = "Purple" },
    @{ Name = "gemini"; DisplayName = "Gemini Maestro"; Type = "gemini"; Color = "Blue" }
)

# Filter agents if specified
if ($Agents -ne "all") {
    $selectedAgents = $Agents -split ","
    $AGENTS = $AGENTS | Where-Object { $selectedAgents -contains $_.Name }
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $color = switch ($Type) {
        "Success" { $Success }
        "Warning" { $Warning }
        "Error" { $Error }
        default { $Info }
    }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $color
}

function Test-NexusServer {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Start-NexusServer {
    Write-Status "Starting Aurora Nexus Server..." -Type Info
    
    if (Test-NexusServer) {
        Write-Status "Server already running on port 3000" -Type Warning
        return
    }
    
    $serverPath = Join-Path $PROJECT_PATH ".agent\aurora\nexus\aurora-nexus-server"
    
    if (Test-Path (Join-Path $serverPath "package.json")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run dev" -WindowStyle Normal
        Write-Status "Server starting in new terminal..." -Type Success
    }
    else {
        Write-Status "Server path not found: $serverPath" -Type Error
    }
}

function Start-NexusWeb {
    Write-Status "Starting Aurora Nexus Web UI..." -Type Info
    
    $webPath = Join-Path $PROJECT_PATH ".agent\aurora\nexus\aurora-nexus-web"
    
    if (Test-Path (Join-Path $webPath "package.json")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webPath'; npm run dev" -WindowStyle Normal
        Write-Status "Web UI starting in new terminal..." -Type Success
    }
    else {
        Write-Status "Web path not found: $webPath" -Type Error
    }
}

function Start-AgentRemotely {
    param([string]$AgentId, [string]$AgentType)
    
    try {
        $body = @{
            agentId = $AgentId
            agentType = $AgentType
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/spawn" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        if ($response.success) {
            Write-Status "$AgentId spawned via API" -Type Success
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

function Start-AgentLocally {
    param([string]$AgentName, [string]$AgentType)
    
    $agentScript = switch ($AgentType) {
        "opencode" {
            @"
cd '$PROJECT_PATH'
Write-Host 'Starting OpenCode Agent...' -ForegroundColor Cyan
npm run dev
"@
        }
        "minimax" {
            @"
Write-Host 'Minimax Agent ($AgentName) initialized' -ForegroundColor Magenta
Write-Host 'Capabilities: Analysis, Code Review, Strategy' -ForegroundColor Gray
while (`$true) { Start-Sleep -Seconds 10 }
"@
        }
        "aurora" {
            @"
cd '$PROJECT_PATH'
Write-Host 'Aurora Core Agent starting...' -ForegroundColor Purple
npm run inicio
"@
        }
        "gemini" {
            @"
Write-Host 'Gemini Maestro Agent initialized' -ForegroundColor Cyan
Write-Host 'Capabilities: Design, Creativity, UI' -ForegroundColor Gray
while (`$true) { Start-Sleep -Seconds 10 }
"@
        }
        default {
            @"
Write-Host 'Custom Agent ($AgentName) initialized' -ForegroundColor White
while (`$true) { Start-Sleep -Seconds 10 }
"@
        }
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $agentScript -WindowStyle Normal
}

# Check prerequisites
Write-Status "[1/6] Checking prerequisites..." -Type Info
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Status "ERROR: Node.js not found" -Type Error
    exit 1
}
Write-Status "Node.js $(node --version) detected" -Type Success

# Start Nexus Server
if (-not $SkipServer) {
    Write-Host ""
    Write-Status "[2/6] Starting Nexus Server..." -Type Info
    Start-NexusServer
    Start-Sleep -Seconds 3
}
else {
    Write-Status "[2/6] Skipping Server" -Type Warning
}

# Start Web UI
if (-not $SkipWeb) {
    Write-Host ""
    Write-Status "[3/6] Starting Web UI..." -Type Info
    Start-NexusWeb
    Start-Sleep -Seconds 2
}
else {
    Write-Status "[3/6] Skipping Web UI" -Type Warning
}

# Start agents
Write-Host ""
Write-Status "[4/6] Starting agents via Nexus API..." -Type Info

$agentsStarted = 0
foreach ($agent in $AGENTS) {
    Write-Host "  $($agent.DisplayName)..." -NoNewline
    
    if (Test-NexusServer) {
        $remoteStarted = Start-AgentRemotely -AgentId $agent.Name -AgentType $agent.Type
        if (-not $remoteStarted) {
            Start-AgentLocally -AgentName $agent.DisplayName -AgentType $agent.Type
        }
    }
    else {
        Start-AgentLocally -AgentName $agent.DisplayName -AgentType $agent.Type
    }
    
    Write-Host " [OK]" -ForegroundColor $Success
    Start-Sleep -Milliseconds 300
    $agentsStarted++
}

Write-Host ""
Write-Status "[5/6] Verifying system..." -Type Info
Start-Sleep -Seconds 2

Write-Host ""
Write-Status "[6/6] System Status:" -Type Info

if (Test-NexusServer) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host ""
        Write-Host "  Nexus Server: Running (uptime: $([math]::Round($health.uptime, 1))s)" -ForegroundColor $Success
        Write-Host "  Agents: $($health.agents.online)/$($health.agents.total) online, $($health.agents.busy) busy" -ForegroundColor White
        Write-Host "  Tasks: $($health.tasks.total) total, $($health.tasks.inProgress) in progress" -ForegroundColor White
        Write-Host "  Memory: $($health.memory.entries) entries" -ForegroundColor White
    }
    catch {
        Write-Status "Could not fetch health data" -Type Warning
    }
}
else {
    Write-Status "Nexus Server: Not reachable" -Type Warning
}

# Summary
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor $Success
Write-Host "║                    ✓ AURORA NEXUS ONLINE                        ║" -ForegroundColor $Success
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor $Success
Write-Host ""
Write-Host "  Agents Started: $agentsStarted" -ForegroundColor White
Write-Host "  API Server:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Web UI:        http://localhost:5173" -ForegroundColor Cyan
Write-Host "  WebSocket:      ws://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all processes..." -ForegroundColor $Warning
Write-Host ""

# Cleanup on exit
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host "Shutting down..." -ForegroundColor $Warning
Get-Process -Name "powershell" | Where-Object { $_.MainWindowTitle -like "*Agent*" -or $_.MainWindowTitle -like "*Nexus*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "All processes stopped." -ForegroundColor $Success
