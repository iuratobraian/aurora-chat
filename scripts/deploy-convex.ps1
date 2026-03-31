# 🚀 SCRIPT PARA DEPLOY DE CONVEX

## EJECUTAR ESTE SCRIPT EN POWERSHELL

### **Paso 1: Copiar todo el script**

### **Paso 2: Pegar en PowerShell**

### **Paso 3: Presionar Enter**

---

```powershell
# ========================================
# DEPLOY DE CONVEX A PRODUCCIÓN
# ========================================

Write-Host "🚀 Iniciando deploy de Convex..." -ForegroundColor Green
Write-Host ""

# Navegar al proyecto
Write-Host "📁 Navegando al proyecto..." -ForegroundColor Yellow
Set-Location "C:\Users\iurato\Desktop\PROYECTO\TRADE-SHARE"

# Configurar variables de entorno
Write-Host "🔑 Configurando Deploy Key..." -ForegroundColor Yellow
$env:CONVEX_DEPLOY_KEY = "eyJ2MiI6IjlkYzE1Y2Y4M2RkNzRiMWZiMjFkYzA5OGE1ODUzODlhIn0="
$env:CONVEX_DEPLOYMENT = "prod:diligent-wildcat-523"

Write-Host "✅ Variables configuradas:" -ForegroundColor Green
Write-Host "   CONVEX_DEPLOYMENT: $env:CONVEX_DEPLOYMENT"
Write-Host "   CONVEX_DEPLOY_KEY: [OCULTO]"
Write-Host ""

# Ejecutar deploy
Write-Host "🔨 Ejecutando deploy..." -ForegroundColor Yellow
Write-Host ""

npx convex dev

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡DEPLOY COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Verificar tablas en:" -ForegroundColor Cyan
    Write-Host "   https://dashboard.convex.dev/d/diligent-wildcat-523"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error en el deploy. Código: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verificar que la Deploy Key sea correcta"
    Write-Host "2. Ejecutar 'npx convex login' primero"
    Write-Host "3. Verificar conexión a internet"
    Write-Host ""
}
```

---

## 📊 DESPUÉS DE EJECUTAR

1. **Esperar** a que termine (3-5 minutos)
2. **Seleccionar** el proyecto cuando lo pida: `prod:diligent-wildcat-523`
3. **Verificar** en el dashboard que las tablas están creadas

---

## ✅ CRITERIOS DE ÉXITO

- [ ] Mensaje: `✔ Deployed Convex functions to https://diligent-wildcat-523.convex.cloud`
- [ ] 100+ tablas visibles en el dashboard
- [ ] Sin errores en la terminal

---

**Script creado:** 2026-03-30 23:50 UTC  
**Para:** Ejecución en PowerShell
