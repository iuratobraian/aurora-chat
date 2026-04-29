# Aurora Nexus Launcher - Master Script
# This script starts everything needed for Aurora Nexus Portal

param(
    [switch]$Headless,
    [switch]$Dev
)

$ErrorActionPreference = "Continue"

# Configuration
$PROJECT_PATH = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$PORTAL_PORT = 8080
$API_PORT = 3000
$WS_PORT = 3000

$AGENTS = @(
    @{ 
        Name = "OpenCode (Big Pickle)"; 
        Id = "opencode"; 
        Port = 3001; 
        Color = "Orange"; 
        Command = "claude-code"
    },
    @{ 
        Name = "Minimax M2.5 #1"; 
        Id = "minimax1"; 
        Port = 3002; 
        Color = "Pink"; 
        Command = "minimax-agent"
    },
    @{ 
        Name = "Minimax M2.5 #2"; 
        Id = "minimax2"; 
        Port = 3003; 
        Color = "Pink"; 
        Command = "minimax-agent"
    },
    @{ 
        Name = "Aurora Core"; 
        Id = "aurora"; 
        Port = 3004; 
        Color = "Purple"; 
        Command = "node .agent/aurora/core/aurora-core.js"
    },
    @{ 
        Name = "Gemini Maestro"; 
        Id = "gemini"; 
        Port = 3005; 
        Color = "Blue"; 
        Command = "gemini-agent"
    }
)

function Write-Banner {
    param([string]$Text, [string]$Color = "Cyan")
    $colors = @{
        "Cyan" = [ConsoleColor]::Cyan
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Red" = [ConsoleColor]::Red
        "Magenta" = [ConsoleColor]::Magenta
        "White" = [ConsoleColor]::White
    }
    $bar = "═" * 70
    Write-Host ""
    Write-Host "  $bar" -ForegroundColor $colors[$Color]
    Write-Host "  $Text" -ForegroundColor $colors[$Color]
    Write-Host "  $bar" -ForegroundColor $colors[$Color]
    Write-Host ""
}

function Check-Prerequisites {
    Write-Banner "CHECKING PREREQUISITES" "Yellow"
    
    # Node.js
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $nodeVersion) {
        Write-Host "  [ERROR] Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
        return $false
    }
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
    
    # Git
    $gitVersion = & git --version 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $gitVersion) {
        Write-Host "  [WARN] Git not found. Some features may not work." -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] $gitVersion" -ForegroundColor Green
    }
    
    # NPM packages
    if (Test-Path "$PROJECT_PATH\package.json") {
        Write-Host "  [OK] Project found: $PROJECT_PATH" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Project not found at $PROJECT_PATH" -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Start-Agent {
    param(
        [hashtable]$Agent,
        [int]$Index
    )
    
    $title = "[$Index/5] Starting $($Agent.Name)..."
    Write-Host "  $title" -NoNewline
    
    # Start agent in new window
    $scriptContent = @"
`$ErrorActionPreference = "Continue"
`$host.UI.RawUI.WindowTitle = "AURORA - $($Agent.Name)"
Write-Host ""
Write-Host "  ═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ║  $($Agent.Name)" -ForegroundColor Cyan
Write-Host "  ║  Port: $($Agent.Port)" -ForegroundColor Cyan
Write-Host "  ═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Wait for API server
Start-Sleep -Seconds 2

# Agent loop (placeholder for actual agent connection)
while (`$true) {
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $($Agent.Name) - Ready and waiting for tasks..." -ForegroundColor $($Agent.Color)
    Start-Sleep -Seconds 10
}
"@
    
    $tempFile = "$env:TEMP\aurora_agent_$($Agent.Id).ps1"
    # Write with UTF-8 BOM for proper encoding
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($tempFile, $scriptContent, $Utf8NoBomEncoding)
    
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tempFile -WindowStyle Normal
    
    Write-Host " [STARTED]" -ForegroundColor Green
    return $true
}

function Start-WebPortal {
    Write-Host "  Starting Web Portal..." -NoNewline
    
    $portalScript = @"
`$host.UI.RawUI.WindowTitle = "AURORA NEXUS - Web Portal"
Set-Location "$PROJECT_PATH\.agent\aurora\nexus\aurora-nexus-web"
Write-Host ""
Write-Host "  ═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ║  AURORA NEXUS WEB PORTAL" -ForegroundColor Cyan
Write-Host "  ║  URL: http://localhost:$PORTAL_PORT" -ForegroundColor Cyan
Write-Host "  ═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
npm run dev
"@
    
    $tempFile = "$env:TEMP\aurora_portal.ps1"
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($tempFile, $portalScript, $Utf8NoBomEncoding)
    
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tempFile -WindowStyle Normal
    
    Write-Host " [STARTED]" -ForegroundColor Green
}

function Start-API-Server {
    Write-Host "  Starting API Server..." -NoNewline
    
    $apiScript = @"
`$host.UI.RawUI.WindowTitle = "AURORA NEXUS - API Server"
Set-Location "$PROJECT_PATH\.agent\aurora\nexus\aurora-nexus-server"
Write-Host ""
Write-Host "  ═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ║  AURORA NEXUS API SERVER" -ForegroundColor Cyan
Write-Host "  ║  WebSocket: ws://localhost:$WS_PORT" -ForegroundColor Cyan
Write-Host "  ═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
npm run dev
"@
    
    $tempFile = "$env:TEMP\aurora_api.ps1"
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($tempFile, $apiScript, $Utf8NoBomEncoding)
    
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tempFile -WindowStyle Normal
    
    Write-Host " [STARTED]" -ForegroundColor Green
}

# ==================== MAIN ====================

# Clear screen
Clear-Host

Write-Banner "A U R O R A   N E X U S" "Cyan"
Write-Host "  Aurora Portal - Agent Orchestration Center" -ForegroundColor White
Write-Host "  Version 1.0.0 | $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Gray
Write-Host ""

# Check prerequisites
if (-not (Check-Prerequisites)) {
    Write-Host ""
    Write-Host "  Prerequisites check failed. Please fix the issues above." -ForegroundColor Red
    Write-Host "  Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Banner "STARTING AURORA NEXUS" "Yellow"

# Start API Server first
Write-Host ""
Start-API-Server
Start-Sleep -Seconds 2

# Start all agents
Write-Host ""
Write-Host "  Starting Agents:" -ForegroundColor White

$index = 1
foreach ($agent in $AGENTS) {
    Start-Agent -Agent $agent -Index $index
    Start-Sleep -Milliseconds 800
    $index++
}

# Start Web Portal
Write-Host ""
Start-WebPortal

# Wait for everything to initialize
Write-Host ""
Write-Host "  Initializing connections..." -NoNewline
for ($i = 1; $i -le 5; $i++) {
    Write-Host "." -NoNewline
    Start-Sleep -Milliseconds 400
}
Write-Host " DONE" -ForegroundColor Green

# Final status
Write-Host ""
Write-Banner "ALL SYSTEMS ONLINE" "Green"
Write-Host "  ┌────────────────────────────────────────────────────────────┐" -ForegroundColor White
Write-Host "  │  AURORA NEXUS PORTAL                                     │" -ForegroundColor White
Write-Host "  ├────────────────────────────────────────────────────────────┤" -ForegroundColor White
Write-Host "  │                                                            │" -ForegroundColor White
Write-Host "  │  🌐  Web Portal:    http://localhost:$PORTAL_PORT         │" -ForegroundColor Cyan
Write-Host "  │  🔌  API Server:    http://localhost:$API_PORT            │" -ForegroundColor Cyan
Write-Host "  │  📡  WebSocket:     ws://localhost:$WS_PORT              │" -ForegroundColor Cyan
Write-Host "  │                                                            │" -ForegroundColor White
Write-Host "  ├────────────────────────────────────────────────────────────┤" -ForegroundColor White
Write-Host "  │  AGENTS STATUS                                            │" -ForegroundColor White
Write-Host "  │                                                            │" -ForegroundColor White
Write-Host "  │  🟠  OpenCode (Big Pickle)    - Online                    │" -ForegroundColor Orange
Write-Host "  │  🩷  Minimax M2.5 #1         - Online                    │" -ForegroundColor Magenta
Write-Host "  │  🩷  Minimax M2.5 #2         - Online                    │" -ForegroundColor Magenta
Write-Host "  │  🟣  Aurora Core             - Online                    │" -ForegroundColor Magenta
Write-Host "  │  🔵  Gemini Maestro          - Online                    │" -ForegroundColor Cyan
Write-Host "  │                                                            │" -ForegroundColor White
Write-Host "  ├────────────────────────────────────────────────────────────┤" -ForegroundColor White
Write-Host "  │  Ready to work! Open the web portal to begin.              │" -ForegroundColor Green
Write-Host "  └────────────────────────────────────────────────────────────┘" -ForegroundColor White
Write-Host ""

# Open browser automatically
Write-Host "  Opening web portal..." -ForegroundColor Yellow
Start-Process "http://localhost:$PORTAL_PORT"

Write-Host ""
Write-Host "  Press Ctrl+C to stop all processes" -ForegroundColor Yellow
Write-Host ""

# Keep this script running
try {
    while ($true) {
        Start-Sleep -Seconds 30
    }
} finally {
    Write-Host ""
    Write-Host "Shutting down Aurora Nexus..." -ForegroundColor Yellow
    # Kill all related processes
    Get-Process powershell | Where-Object { 
        $_.MainWindowTitle -like "*AURORA*" 
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All processes stopped." -ForegroundColor Green
}
