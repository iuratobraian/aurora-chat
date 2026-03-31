$apiKey = Get-Content "$PSScriptRoot\..\.env.nvidia" -Raw

Write-Host "=== Testing all models ===" -ForegroundColor Cyan
Write-Host ""

# Test GLM-5
Write-Host "[1] GLM-5:" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" -Method Post -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $apiKey" } -Body (@{model="z-ai/glm5"; messages=@(@{role="user"; content="Hi"}); max_tokens=20} | ConvertTo-Json) -TimeoutSec 30
    Write-Host "  OK: " $r.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "  Error: " $_.Exception.Message -ForegroundColor Red
}

# Test Kimi K2
Write-Host "[2] Kimi K2:" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" -Method Post -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $apiKey" } -Body (@{model="moonshotai/kimi-k2-instruct"; messages=@(@{role="user"; content="Hi"}); max_tokens=20} | ConvertTo-Json) -TimeoutSec 30
    Write-Host "  OK: " $r.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "  Error: " $_.Exception.Message -ForegroundColor Red
}

# Test DeepSeek
Write-Host "[3] DeepSeek V3.2:" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" -Method Post -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $apiKey" } -Body (@{model="deepseek-ai/deepseek-v3.2"; messages=@(@{role="user"; content="Hi"}); max_tokens=20} | ConvertTo-Json) -TimeoutSec 30
    Write-Host "  OK: " $r.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "  Error: " $_.Exception.Message -ForegroundColor Red
}

# Test MiniMax
Write-Host "[4] MiniMax:" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" -Method Post -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $apiKey" } -Body (@{model="minimaxai/minimax-m2.5"; messages=@(@{role="user"; content="Hi"}); max_tokens=20} | ConvertTo-Json) -TimeoutSec 30
    Write-Host "  OK: " $r.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "  Error: " $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Done." -ForegroundColor Gray
