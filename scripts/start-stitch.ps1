# Stitch MCP Quick Start Script
# Run this to start Stitch MCP Proxy
# Requires STITCH_API_KEY environment variable

if (-not $env:STITCH_API_KEY) {
    Write-Host "ERROR: STITCH_API_KEY no configurada." -ForegroundColor Red
    Write-Host "Agrega STITCH_API_KEY a tu .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Stitch MCP Proxy..." -ForegroundColor Cyan
Write-Host "API Key: $($env:STITCH_API_KEY.Substring(0, 10))..." -ForegroundColor Gray

npx @_davideast/stitch-mcp proxy
