# TradeShare AI Toolbox
# Utility to interact with free LLM resources

param (
    [Parameter(Mandatory=$false)]
    [string]$Action = "list"
)

$ToolsPath = "src/scripts/free-llm-tool"

function Run-PullModels {
    Write-Host "--- Pulling Available Free Models ---" -ForegroundColor Cyan
    python "$ToolsPath/pull_available_models.py"
}

switch ($Action) {
    "list" { Run-PullModels }
    "help" { 
        Write-Host "Usage: ./scripts/ai-toolbox.ps1 [action]"
        Write-Host "Actions: list, help"
    }
    default { Write-Host "Unknown action: $Action" -ForegroundColor Red }
}
