#!/usr/bin/env pwsh
# ============================================
# Ruflo v3.5 - Complexity & Swarm Detection
# ============================================

param (
    [string]$task = "CURRENT_TASK",
    [int]$threshold = 3
)

Write-Host "`n[RUFLO-CHECK] Analyzing task complexity: $task" -ForegroundColor Cyan

# 1. Count modified files (staged or unstaged)
$files = git status --short | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "[INFO] Files modified: $files" -ForegroundColor Gray

# 2. Key keywords for new features/refactors
$keywords = "feat", "refactor", "schema", "auth", "security", "convex", "mutation"
$hasKeywords = $false
foreach ($k in $keywords) {
    if ($task -like "*$k*") {
        $hasKeywords = $true
        Write-Host "[ALERT] Strategic keyword detected: $k" -ForegroundColor Yellow
        break
    }
}

# 3. Decision Logic
Write-Host "`n--- DECISION ---" -ForegroundColor White
if ($files -ge $threshold -or $hasKeywords) {
    Write-Host "[ACTION] >>> AUTO-INVOKE SWARM <<<" -ForegroundColor Red -BackgroundColor Black
    Write-Host "[REASON] Complexity (${files} files) or strategic impact detected."
    Write-Host "Refer to: .agent/skills/SWARM_AUTO_START_PROTOCOL.md"
    exit 3 # Code 3: Feature/Complex Swarm Required
} else {
    Write-Host "[ACTION] >>> SOLO-AGENT PERMITTED <<<" -ForegroundColor Green
    Write-Host "[REASON] Low complexity (${files} files) and no strategic keywords detected."
    exit 1 # Code 1: Bug Fix/Simple Solo Task
}
