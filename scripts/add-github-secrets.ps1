# Add GitHub Secrets Script
# WARNING: Never commit real API keys to version control
# This script should only be run locally with proper .env file configured

# Load secrets from environment variables or a secure .env file
$secrets = @{
    "NVIDIA_API_KEY" = "$env:NVIDIA_API_KEY"
    "NVIDIA_API_KEY_2" = "$env:NVIDIA_API_KEY_2"
    "GROQ_API_KEY" = "$env:GROQ_API_KEY"
    "GROQ_API_KEY_BACKUP" = "$env:GROQ_API_KEY_BACKUP"
    "OPENROUTER_API_KEY" = "$env:OPENROUTER_API_KEY"
    "OPENROUTER_AURORA_KEY" = "$env:OPENROUTER_AURORA_KEY"
    "OPENROUTER_API_KEY_2" = "$env:OPENROUTER_API_KEY_2"
    "ANTHROPIC_API_KEY" = "$env:ANTHROPIC_API_KEY"
    "ANTHROPIC_API_KEY_2" = "$env:ANTHROPIC_API_KEY_2"
    "GEMINI_API_KEY" = "$env:GEMINI_API_KEY"
    "HUGGINGFACE_API_KEY" = "$env:HUGGINGFACE_API_KEY"
    "TAVILY_API_KEY" = "$env:TAVILY_API_KEY"
    "SERPAPI_API_KEY" = "$env:SERPAPI_API_KEY"
    "YOUTUBE_API_KEY" = "$env:YOUTUBE_API_KEY"
    "NOTION_API_KEY" = "$env:NOTION_API_KEY"
    "NOTION_DATABASE_ID" = "$env:NOTION_DATABASE_ID"
    "MERCADOPAGO_ACCESS_TOKEN" = "$env:MERCADOPAGO_ACCESS_TOKEN"
}

# Verify gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: GitHub CLI is not installed." -ForegroundColor Red
    exit 1
}

# Verify authentication
if (-not (gh auth status 2>$null)) {
    Write-Host "Error: Not authenticated with GitHub CLI. Run 'gh auth login' first." -ForegroundColor Red
    exit 1
}

# Add each secret to GitHub
foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    if ([string]::IsNullOrWhiteSpace($value) -or $value -match '^\$env:') {
        Write-Host "Skipping $key - not set in environment" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Setting secret: $key" -ForegroundColor Cyan
    echo $value | gh secret set $key
}

Write-Host "`nSecrets have been set!" -ForegroundColor Green
Write-Host "Remember to also update your .env files with the actual values." -ForegroundColor Yellow
