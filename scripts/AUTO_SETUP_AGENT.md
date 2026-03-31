# 🤖 Auto-Setup para Agentes AI - Aurora AI Multi-PC Setup

## 🎯 Objetivo
Automatizar la configuración de Aurora AI en múltiples PCs sin intervención humana.

---

## 📋 Instrucciones para el Agente AI

### Contexto:
El usuario necesita configurar Aurora AI en múltiples PCs. Este script automatiza todo el proceso.

### Tareas del Agente:

#### 1. Verificar Prerrequisitos
```powershell
# Verificar si estamos en el directorio correcto
if (!(Test-Path ".git")) {
    Write-Host "❌ No estamos en el directorio del repositorio"
    Write-Host "Por favor navegá a: C:\Users\Brai\Desktop\REPO"
    exit 1
}
```

#### 2. Instalar GitHub CLI (si no está)
```powershell
# Verificar si gh está instalado
try {
    $null = Get-Command gh -ErrorAction Stop
    Write-Host "✅ GitHub CLI ya está instalado"
} catch {
    Write-Host "⚠️  Instalando GitHub CLI..."
    winget install --id GitHub.cli -e --silent
    Write-Host "✅ GitHub CLI instalado"
}
```

#### 3. Actualizar Repositorio
```powershell
Write-Host "📥 Actualizando repositorio..."
git pull origin main
Write-Host "✅ Repositorio actualizado"
```

#### 4. Autenticar en GitHub (INTERACTIVO - Requiere Usuario)
```powershell
Write-Host "🔐 Autenticando en GitHub..."
Write-Host "⚠️  El usuario necesita completar la autenticación"
Write-Host ""
gh auth login
Write-Host "✅ Autenticación completada"
```

#### 5. Habilitar Ejecución de Scripts
```powershell
Write-Host "🔓 Habilitando ejecución de scripts..."
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
Write-Host "✅ Scripts habilitados"
```

#### 6. Ejecutar Script de Configuración
```powershell
Write-Host "🚀 Ejecutando configuración de GitHub Secrets..."
.\scripts\add-github-secrets.ps1
Write-Host "✅ Configuración completada"
```

#### 7. Verificar Configuración
```powershell
Write-Host "🔍 Verificando configuración..."

# Verificar .env.nvidia
if (Test-Path ".env.nvidia") {
    Write-Host "✅ .env.nvidia creado"
    $lines = (Get-Content ".env.nvidia" | Measure-Object -Line).Lines
    Write-Host "   $lines líneas configuradas"
} else {
    Write-Host "❌ .env.nvidia no se creó"
    exit 1
}

# Verificar Aurora AI
Write-Host "🧪 Probando Aurora AI..."
node scripts/aurora-ai-agent.mjs --status
Write-Host "✅ Aurora AI configurado correctamente"
```

---

## 🤖 Prompt para el Agente AI

```
Por favor, ejecutá el auto-setup de Aurora AI en esta PC.

Seguí estos pasos en orden:

1. Verificá que estamos en el directorio correcto (C:\Users\Brai\Desktop\REPO)
2. Instalá GitHub CLI si no está instalado
3. Actualizá el repositorio con git pull
4. Autenticame en GitHub (yo completaré la autenticación cuando me lo pidas)
5. Habilitá la ejecución de scripts de PowerShell
6. Ejecutá el script add-github-secrets.ps1
7. Verificá que .env.nvidia se creó correctamente
8. Probá Aurora AI con: node scripts/aurora-ai-agent.mjs --status

Si hay algún error, informame inmediatamente.

El objetivo es tener Aurora AI configurado con las 16 API keys en esta PC.
```

---

## 📁 Archivos Involucrados

| Archivo | Propósito |
|---------|-----------|
| `scripts/add-github-secrets.ps1` | Script principal de configuración |
| `scripts/AUTO_SETUP_AGENT.md` | Este archivo - instrucciones para el agente |
| `.env.nvidia` | Se crea automáticamente con 16 API keys |
| `.agent/workspace/coordination/AUTO_SETUP_LOG.md` | Log del setup (opcional) |

---

## ✅ Checklist de Verificación

Después de ejecutar, el agente debe verificar:

```
☐ GitHub CLI instalado
☐ Repositorio actualizado (git pull)
☐ Autenticación en GitHub completada
☐ Scripts de PowerShell habilitados
☐ add-github-secrets.ps1 ejecutado exitosamente
☐ .env.nvidia creado con 16 API keys
☐ Aurora AI funciona (node scripts/aurora-ai-agent.mjs --status)
☐ Al menos 3 providers disponibles
```

---

## 🚨 Troubleshooting para el Agente

### Error: "GitHub CLI no está instalado"
```powershell
# Solución:
winget install --id GitHub.cli -e --silent
```

### Error: "No estás autenticado en GitHub"
```powershell
# Solución:
gh auth login
# El usuario debe completar la autenticación
```

### Error: "Scripts deshabilitados"
```powershell
# Solución:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
```

### Error: ".env.nvidia no se creó"
```powershell
# Solución:
# Verificar que el script se ejecutó correctamente
# Ejecutar manualmente: .\scripts\add-github-secrets.ps1
```

### Error: "Aurora AI no funciona"
```powershell
# Solución:
# 1. Verificar .env.nvidia: cat .env.nvidia
# 2. Verificar providers: node scripts/aurora-ai-agent.mjs --status
# 3. Reinstalar dependencias: npm install
```

---

## 📊 Output Esperado

El agente debe reportar:

```
╔══════════════════════════════════════════════╗
║  ✅ AUTO-SETUP COMPLETADO                    ║
╚══════════════════════════════════════════════╝

✅ GitHub CLI: Instalado
✅ Repositorio: Actualizado
✅ Autenticación: Completada
✅ Scripts: Habilitados
✅ GitHub Secrets: 16 keys configuradas
✅ .env.nvidia: Creado (18 líneas)
✅ Aurora AI: Funcionando (5+ providers)

📍 Ubicación: C:\Users\Brai\Desktop\REPO
📄 .env.nvidia: C:\Users\Brai\Desktop\REPO\.env.nvidia
🔑 API Keys: 16 configuradas
🤖 Providers: 5+ disponibles

Próximos pasos:
  node scripts/aurora-ai-agent.mjs
```

---

## 🎯 Comando Único para el Agente

Si el agente puede ejecutar comandos directamente:

```powershell
# Comando completo (copiar y pegar):
cd C:\Users\Brai\Desktop\REPO; git pull; winget install --id GitHub.cli -e --silent; gh auth login; Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force; .\scripts\add-github-secrets.ps1; node scripts/aurora-ai-agent.mjs --status
```

---

## 📝 Notas para el Agente

1. **Importante**: La autenticación de GitHub requiere intervención del usuario
2. **Importante**: El script crea .env.nvidia automáticamente
3. **Importante**: Verificar que al menos 3 providers estén disponibles
4. **Importante**: Las 16 API keys son las mismas en todas las PCs

---

**Fecha de Creación**: 2025-03-30  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para usar por agentes AI
