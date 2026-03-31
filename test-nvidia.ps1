$apiKey = "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"

# Test Kimi K2 Instruct (not K2.5)
Write-Host "=== Testing Kimi K2 Instruct ===" -ForegroundColor Cyan
$body1 = @{
    model = "moonshotai/kimi-k2-instruct"
    messages = @(
        @{role = "user"; content = "What is 2+2? Answer in one word."}
    )
    max_tokens = 50
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -Body $body1 `
        -TimeoutSec 60

    Write-Host "Kimi K2 Instruct Response:" $response1.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "Kimi K2 Instruct Error:" $_.Exception.Message -ForegroundColor Red
}

Write-Host ""

# Test Kimi K2 Thinking
Write-Host "=== Testing Kimi K2 Thinking ===" -ForegroundColor Cyan
$body2 = @{
    model = "moonshotai/kimi-k2-thinking"
    messages = @(
        @{role = "user"; content = "What is 2+2? Answer in one word."}
    )
    max_tokens = 50
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -Body $body2 `
        -TimeoutSec 60

    Write-Host "Kimi K2 Thinking Response:" $response2.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "Kimi K2 Thinking Error:" $_.Exception.Message -ForegroundColor Red
}

Write-Host ""

# Test GLM-4.7 from Z-AI
Write-Host "=== Testing GLM-4.7 ===" -ForegroundColor Cyan
$body3 = @{
    model = "z-ai/glm4.7"
    messages = @(
        @{role = "user"; content = "What is 2+2? Answer in one word."}
    )
    max_tokens = 50
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -Body $body3 `
        -TimeoutSec 60

    Write-Host "GLM-4.7 Response:" $response3.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "GLM-4.7 Error:" $_.Exception.Message -ForegroundColor Red
}

Write-Host ""

# Test GLM-5
Write-Host "=== Testing GLM-5 ===" -ForegroundColor Cyan
$body4 = @{
    model = "z-ai/glm5"
    messages = @(
        @{role = "user"; content = "What is 2+2? Answer in one word."}
    )
    max_tokens = 50
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -Body $body4 `
        -TimeoutSec 60

    Write-Host "GLM-5 Response:" $response4.choices[0].message.content -ForegroundColor Green
} catch {
    Write-Host "GLM-5 Error:" $_.Exception.Message -ForegroundColor Red
}
