#!/usr/bin/env pwsh
# =================================================================
# PREPARAR MIGRACIÓN A NUEVA CUENTA CONVEX
# =================================================================
# Uso: .\scripts\prepare-migration.ps1
# =================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TRADESHARE - PREPARAR MIGRACIÓN                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Colores
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Yellow"

# 1. Verificar Node.js
Write-Host "[1/6] Verificando Node.js..." -ForegroundColor $InfoColor
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor $SuccessColor
} catch {
    Write-Host "  ✗ Node.js NO está instalado" -ForegroundColor $ErrorColor
    Write-Host "  → Instalar desde: https://nodejs.org" -ForegroundColor $InfoColor
    exit 1
}

# 2. Crear carpeta limpia
Write-Host ""
Write-Host "[2/6] Creando carpeta limpia..." -ForegroundColor $InfoColor
$CleanDir = "C:\Users\iurato\Desktop\PROYECTO\TRADE-SHARE-MIGRATION"

if (Test-Path $CleanDir) {
    Write-Host "  ! Carpeta ya existe, limpiando..." -ForegroundColor $InfoColor
    Remove-Item $CleanDir -Recurse -Force
}

New-Item -ItemType Directory -Path $CleanDir | Out-Null
Write-Host "  ✓ Carpeta creada: $CleanDir" -ForegroundColor $SuccessColor

# 3. Copiar archivos esenciales
Write-Host ""
Write-Host "[3/6] Copiando archivos esenciales..." -ForegroundColor $InfoColor

$SourceDir = "C:\Users\iurato\Desktop\PROYECTO\TRADE-SHARE"
$ExcludeDirs = @('node_modules', '.git', '.claude-flow', '.qwen', '.vercel', '.agent', 'backups', 'coverage', 'dist', 'tmp', 'trade-share')
$ExcludeFiles = @('.env.local', 'package-lock.json', '*.tsbuildinfo')

# Copiar con robocopy
robocopy $SourceDir $CleanDir /E `
    /XD @ExcludeDirs `
    /XF @ExcludeFiles `
    /NFL /NDL /NJH /NJS `
    | Out-Null

Write-Host "  ✓ Archivos copiados" -ForegroundColor $SuccessColor

# 4. Preparar .env.local
Write-Host ""
Write-Host "[4/6] Preparando .env.local..." -ForegroundColor $InfoColor

$EnvExample = Join-Path $CleanDir ".env.example"
$EnvLocal = Join-Path $CleanDir ".env.local"

if (Test-Path $EnvExample) {
    Copy-Item $EnvExample $EnvLocal
    Write-Host "  ✓ .env.local creado" -ForegroundColor $SuccessColor
    Write-Host "  → EDITAR: $EnvLocal" -ForegroundColor $InfoColor
    Write-Host "  → Completar VITE_CONVEX_URL con nueva cuenta" -ForegroundColor $InfoColor
} else {
    Write-Host "  ⚠ .env.example no encontrado" -ForegroundColor $InfoColor
}

# 5. Crear README de migración
Write-Host ""
Write-Host "[5/6] Creando README de migración..." -ForegroundColor $InfoColor

$ReadmeContent = @"
# 📦 TRADESHARE - MIGRACIÓN LISTA

**Fecha:** $(Get-Date -Format "yyyy-MM-dd")  
**Estado:** ✅ LISTO PARA DEPLOY

---

## 🚀 PRÓXIMOS PASOS

### 1. Crear Nueva Cuenta Convex

1. Ir a: https://convex.dev
2. Click: "Get Started for Free"
3. Email: USAR EMAIL ALTERNATIVO
4. Crear proyecto: tradeshare-pro-2
5. Copiar: VITE_CONVEX_URL

### 2. Configurar Variables

Editar \`.env.local\`:

\`\`\`bash
VITE_CONVEX_URL=https://TU-NUEVO-PROYECTO.convex.cloud
JWT_SECRET=generar_con_crypto_randomBytes32
# ... completar resto ...
\`\`\`

### 3. Instalar Dependencias

\`\`\`bash
cd $CleanDir
npm install
\`\`\`

### 4. Deploy a Convex

\`\`\`bash
npx convex login
npx convex dev
\`\`\`

### 5. Importar Backups

1. Ir a: https://dashboard.convex.dev/t/nuevo-proyecto/database
2. ⋮ → Import JSON
3. Importar en orden:
   - profiles ✅
   - communities ✅
   - communityMembers ✅
   - posts ✅
   - strategies ✅
   - products ✅
   - payments ✅
   - subscriptions ✅
   - signals ✅

### 6. Deploy a Vercel

\`\`\`bash
npm run build
vercel --prod
\`\`\`

---

## 📊 CHECKLIST

- [ ] Nueva cuenta Convex creada
- [ ] .env.local configurado
- [ ] npm install completado
- [ ] npx convex dev exitoso
- [ ] Backups importados
- [ ] Deploy a Vercel completado
- [ ] Verificación completada

---

## 📞 SOPORTE

- docs/migration/MIGRATION_GUIDE_2026-03-30.md
- docs/incidents/POST_MORTEM_2026-03-30_MIGRATION_SATURATION.md

---

**TIEMPO ESTIMADO:** 30-60 minutos  
**DIFICULTAD:** Media
"@

$ReadmePath = Join-Path $CleanDir "README-MIGRATION.md"
$ReadmeContent | Out-File -FilePath $ReadmePath -Encoding UTF8

Write-Host "  ✓ README creado: $ReadmePath" -ForegroundColor $SuccessColor

# 6. Resumen
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PREPARACIÓN COMPLETADA ✅                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Carpeta lista: $CleanDir" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor $InfoColor
Write-Host "  1. Crear cuenta en convex.dev" -ForegroundColor White
Write-Host "  2. Editar .env.local con nueva URL" -ForegroundColor White
Write-Host "  3. Ejecutar: cd $CleanDir && npm install" -ForegroundColor White
Write-Host "  4. Ejecutar: npx convex dev" -ForegroundColor White
Write-Host "  5. Importar backups desde dashboard" -ForegroundColor White
Write-Host "  6. Deploy a Vercel" -ForegroundColor White
Write-Host ""
Write-Host "📖 Leer: $ReadmePath" -ForegroundColor $InfoColor
Write-Host ""
