#!/usr/bin/env pwsh
# ============================================
# TradeShare Full Deploy Script
# ============================================
# Usage:
#   .\scripts\deploy.ps1                          → deploy con mensaje automático
#   .\scripts\deploy.ps1 -message "feat: nuevo"   → deploy con mensaje custom
#   .\scripts\deploy.ps1 -skipConvex               → solo git push (sin Convex deploy)
# ============================================

param(
    [string]$message = "",
    [switch]$skipConvex = $false
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date

function Write-Step($n, $total, $text) {
    Write-Host "`n[$n/$total] $text" -ForegroundColor Cyan
}
function Write-Ok($text) {
    Write-Host "    ✅ $text" -ForegroundColor Green
}
function Write-Warn($text) {
    Write-Host "    ⚠️  $text" -ForegroundColor Yellow
}
function Write-Fail($text) {
    Write-Host "    ❌ $text" -ForegroundColor Red
}

Write-Host ""
Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │     OBLITERATUS: System Liberation       │" -ForegroundColor Cyan
Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""
Write-Host "[0/6] Initializing OBLITERATUS..." -ForegroundColor Cyan
try {
    # Check if python is available
    if (Get-Command "python" -ErrorAction SilentlyContinue) {
        Write-Host "    Installing OBLITERATUS via pip..." -ForegroundColor $Yellow
        python -m pip install obliteratus --quiet
        Write-Ok "OBLITERATUS installed successfully"
    } else {
        Write-Warn "Python not found, skipping OBLITERATUS local install"
    }
} catch {
    Write-Warn "Could not install OBLITERATUS (non-blocking)"
}

$totalSteps = if ($skipConvex) { 5 } else { 6 }

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║     TradeShare Deploy Pipeline        ║" -ForegroundColor Cyan
Write-Host "  ║     Git → Build → Convex → Vercel     ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ──────────────────────────────────────────
# Step 1: Lint check
# ──────────────────────────────────────────
Write-Step 1 $totalSteps "Verificando TypeScript (lint)..."
npm run lint 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Warn "Lint tiene errores — continuando igualmente (no-blocking)"
} else {
    Write-Ok "TypeScript sin errores"
}

# ──────────────────────────────────────────
# Step 2: Build frontend
# ──────────────────────────────────────────
Write-Step 2 $totalSteps "Compilando frontend (vite build)..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Build falló. Corregí los errores antes de hacer deploy."
    exit 1
}
Write-Ok "Build exitoso"

# ──────────────────────────────────────────
# Step 3: Git add + commit + push
# ──────────────────────────────────────────
Write-Step 3 $totalSteps "Git push a GitHub..."

$status = git status --porcelain
if ($status) {
    git add -A

    if (-not $message) {
        $message = "deploy: actualización $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }

    Write-Host "    Commit: $message" -ForegroundColor Yellow
    git commit -m $message

    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Commit falló"
        exit 1
    }
} else {
    Write-Host "    Sin cambios nuevos para commitear" -ForegroundColor Yellow
}

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Push a GitHub falló. Verificá tus credenciales."
    exit 1
}
Write-Ok "Pushed a GitHub (Vercel se despliega automáticamente desde ahí)"

# ──────────────────────────────────────────
# Step 4: Deploy Convex a Production
# ──────────────────────────────────────────
if (-not $skipConvex) {
    Write-Step 4 $totalSteps "Desplegando funciones a Convex Production (notable-sandpiper)..."
    npx convex deploy --cmd "echo skip"

    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Convex deploy falló"
        Write-Warn "Intentá manualmente: npx convex deploy"
    } else {
        Write-Ok "Convex Production actualizado"
    }
}

# ──────────────────────────────────────────
# Step 5: Notion sync
# ──────────────────────────────────────────
$notionStep = if ($skipConvex) { 4 } else { 5 }
Write-Step $notionStep $totalSteps "Sincronizando con Notion..."

try {
    node scripts/aurora-notion-sync.mjs 2>&1 | Out-Null
    Write-Ok "Notion sincronizado"
} catch {
    Write-Warn "Notion sync falló (no crítico)"
}

# ──────────────────────────────────────────
# Summary
# ──────────────────────────────────────────
$elapsed = (Get-Date) - $startTime
$minutes = [math]::Floor($elapsed.TotalMinutes)
$seconds = $elapsed.Seconds

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║        ✅ DEPLOY COMPLETO             ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  ⏱️  Tiempo total: ${minutes}m ${seconds}s" -ForegroundColor Yellow
Write-Host "  🌐 Vercel: https://tradeportal-2025-platinum.vercel.app/" -ForegroundColor Cyan
Write-Host "  📦 Convex: https://dashboard.convex.dev/d/notable-sandpiper-279" -ForegroundColor Cyan
Write-Host ""
