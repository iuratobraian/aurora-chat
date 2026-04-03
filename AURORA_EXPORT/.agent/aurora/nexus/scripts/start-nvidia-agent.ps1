# NVIDIA Agent Launcher for Aurora Nexus
# Usage: start-nvidia-agent.ps1 -Model kimik2.5 -ApiKey "nvapi-xxx"

param(
    [string]$Model = "kimik2.5",
    [string]$ApiKey = "",
    [string]$AgentName = "nvidia-kimi"
)

$ErrorActionPreference = "Continue"

# Colors
$Success = "Green"
$Warning = "Yellow"
$Error = "Red"
$Info = "Cyan"

# API Key from parameter or environment
if (-not $ApiKey) {
    $ApiKey = $env:NVIDIA_API_KEY
}

if (-not $ApiKey) {
    Write-Host "[ERROR] NVIDIA API Key required. Set -ApiKey parameter or NVIDIA_API_KEY env variable" -ForegroundColor $Error
    Write-Host ""
    Write-Host "Get your free API key at: https://build.nvidia.com/" -ForegroundColor $Warning
    Write-Host "1. Sign up/login to NVIDIA"
    Write-Host "2. Select a model (Kimi K2.5 or DeepSeek V3)"
    Write-Host "3. Click 'View Code' to get your API key"
    exit 1
}

# Model mapping
$modelMap = @{
    "kimik2.5" = "moonshotai/kimi-k2.5"
    "kimi" = "moonshotai/kimi-k2.5"
    "deepseekv3" = "deepseek-ai/deepseek-v3"
    "deepseek" = "deepseek-ai/deepseek-v3"
}

$modelId = $modelMap[$Model.ToLower()]
if (-not $modelId) {
    Write-Host "[WARNING] Unknown model: $Model, using kimik2.5" -ForegroundColor $Warning
    $modelId = "moonshotai/kimi-k2.5"
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor $Info
Write-Host "║              NVIDIA AGENT - Aurora Nexus                        ║" -ForegroundColor $Info
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor $Info
Write-Host ""
Write-Host "  Model:     $modelId" -ForegroundColor White
Write-Host "  Agent:     $AgentName" -ForegroundColor White
Write-Host "  Provider:  NVIDIA NIM (Free API)" -ForegroundColor $Success
Write-Host ""

# Test API connection
Write-Host "[1/2] Testing NVIDIA API connection..." -ForegroundColor $Info

$testBody = @{
    model = $modelId
    messages = @(
        @{role = "user"; content = "Say 'OK' if you can hear me."}
    )
    max_tokens = 10
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $ApiKey" } `
        -Body $testBody `
        -TimeoutSec 30

    if ($testResponse.choices[0].message.content) {
        Write-Host "  API Connection: OK" -ForegroundColor $Success
        Write-Host "  Response: $($testResponse.choices[0].message.content)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  API Connection: FAILED" -ForegroundColor $Error
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $Error
    exit 1
}

# Register agent with Nexus
Write-Host ""
Write-Host "[2/2] Registering agent with Aurora Nexus..." -ForegroundColor $Info

$nexusUrl = "http://localhost:3000"

if (Test-Path "Nexus Server running") {
    try {
        $body = @{
            agentId = $AgentName
            agentType = "custom"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$nexusUrl/api/agents/spawn" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10

        if ($response.success) {
            Write-Host "  Agent registered: OK" -ForegroundColor $Success
        }
    }
    catch {
        Write-Host "  Nexus not available, agent running locally" -ForegroundColor $Warning
    }
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor $Success
Write-Host "║                  ✓ NVIDIA AGENT READY                          ║" -ForegroundColor $Success
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor $Success
Write-Host ""
Write-Host "  To use in your project:" -ForegroundColor White
Write-Host "  " -NoNewline; Write-Host "const response = await fetch('http://localhost:3001/api/chat')" -ForegroundColor Gray
Write-Host ""
Write-Host "  Or use the NVIDIA agent directly:" -ForegroundColor White
Write-Host "  " -NoNewline; Write-Host "npm run agent:nvidia" -ForegroundColor Gray
Write-Host ""
