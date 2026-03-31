#!/usr/bin/env pwsh
# =================================================================
# CONFIGURAR VARIABLES DE VERCEL
# =================================================================
# Uso: .\scripts\setup-vercel-env.ps1
# =================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   VERCEL - CONFIGURAR VARIABLES DE ENTORNO             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Colores
$InfoColor = "Yellow"
$SuccessColor = "Green"
$ErrorColor = "Red"

# Variables a configurar
$Variables = @{
    "VITE_CONVEX_URL" = "https://diligent-wildcat-523.convex.cloud"
    "VITE_CONVEX_SITE_URL" = "https://diligent-wildcat-523.convex.site"
    "CONVEX_DEPLOYMENT" = "prod:diligent-wildcat-523"
    "JWT_SECRET" = "ts_dev_jwt_secret_2026_secure_key_min_32_chars_xxxxx"
    "REFRESH_TOKEN_SECRET" = "ts_refresh_secret_2026_secure_key_min_32_chars_xxxxx"
    "MERCADOPAGO_ACCESS_TOKEN" = "APP_USR-3819445901618978-032605-1548d8d94a4167bdf018f329c532d54f-183552913"
    "VITE_MERCADOPAGO_PUBLIC_KEY" = ""
    "MERCADOPAGO_WEBHOOK_SECRET" = ""
    "SENDGRID_API_KEY" = ""
    "VITE_GOOGLE_CLIENT_ID" = ""
    "VITE_APP_URL" = "https://tradeportal-2025-platinum.vercel.app"
    "VITE_API_URL" = "https://tradeportal-2025-platinum.vercel.app"
    "PORT" = "3000"
    "NODE_ENV" = "production"
    "SECURITY_CONTACT_EMAIL" = "security@tradeportal.io"
    "APP_URL" = "https://tradeportal-2025-platinum.vercel.app"
    "AI_RATE_LIMIT_PER_MIN" = "60"
    "INTERNAL_API_SHARED_KEY" = "your_internal_api_shared_key"
    "VITE_FEATURE_SIGNALS" = "on"
    "VITE_FEATURE_ADS" = "on"
    "VITE_FEATURE_PWA" = "on"
    "NOTION_API_KEY" = "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"
    "NOTION_DATABASE_ID" = "33142b008df080f8b6b3db69d36e84d5"
}

Write-Host "[INFO] Configurando $(($Variables).Count) variables de entorno..." -ForegroundColor $InfoColor
Write-Host ""

# Crear archivo .env para Vercel
$EnvContent = @"
# =================================================================
# TRADESHARE - VERCEL ENVIRONMENT VARIABLES
# =================================================================
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Project: tradeportal-2025-platinum
# =================================================================

"@

foreach ($key in $Variables.Keys) {
    $value = $Variables[$key]
    if ($value -ne "") {
        $EnvContent += "$key=$value`n"
        Write-Host "  ✓ $key" -ForegroundColor $SuccessColor
    } else {
        Write-Host "  ⚠ $key (vacío - completar manualmente)" -ForegroundColor $InfoColor
    }
}

# Guardar archivo
$EnvFile = ".env.vercel"
$EnvContent | Out-File -FilePath $EnvFile -Encoding UTF8

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CONFIGURACIÓN COMPLETADA ✅                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Archivo creado: $EnvFile" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "  OPCIÓN A - Usar Vercel CLI (Recomendado):" -ForegroundColor White
Write-Host "  ----------------------------------------" -ForegroundColor Gray
Write-Host "  vercel env pull          # Descargar variables" -ForegroundColor Gray
Write-Host "  vercel --prod            # Redeploy con nuevas variables" -ForegroundColor Gray
Write-Host ""
Write-Host "  OPCIÓN B - Dashboard Manual:" -ForegroundColor White
Write-Host "  ----------------------------------------" -ForegroundColor Gray
Write-Host "  1. Ir a: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "  2. Click en tu proyecto" -ForegroundColor Gray
Write-Host "  3. Settings → Environment Variables" -ForegroundColor Gray
Write-Host "  4. Copiar variables desde $EnvFile" -ForegroundColor Gray
Write-Host "  5. Redeploy: vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Dashboard Vercel:" -ForegroundColor $InfoColor
Write-Host "   https://vercel.com/braians-projects-60b0b610/tradeportal-2025-platinum/settings/environment-variables"
Write-Host ""
