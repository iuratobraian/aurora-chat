# Stitch MCP Quick Start Script
# Run this to start Stitch MCP Proxy

$env:STITCH_API_KEY = "AQ.Ab8RN6LVlJylZuhwyBC5y_x7t3oOCUqnZt5SXjiM_GxKYGgDJA"

Write-Host "Starting Stitch MCP Proxy..." -ForegroundColor Cyan
Write-Host "API Key: $env:STITCH_API_KEY" -ForegroundColor Gray

npx @_davideast/stitch-mcp proxy
