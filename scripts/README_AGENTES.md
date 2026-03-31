# 🤖 Instrucciones para Agentes AI - Setup Automático

## 🎯 Objetivo
Automatizar el setup de Aurora AI en una nueva PC sin intervención humana (excepto autenticación GitHub).

---

## 🚀 Comando Único para Ejecutar

El agente debe ejecutar ESTE script:

```powershell
.\scripts\auto-setup-ai.ps1
```

---

## 📋 ¿Qué Hace el Script?

El script `auto-setup-ai.ps1` hace TODO automáticamente:

```
1. ✅ Verifica directorio correcto
2. ✅ Instala GitHub CLI
3. ✅ Actualiza repositorio (git pull)
4. ✅ Autentica en GitHub (requiere usuario)
5. ✅ Habilita scripts de PowerShell
6. ✅ Ejecuta add-github-secrets.ps1
7. ✅ Verifica .env.nvidia
8. ✅ Prueba Aurora AI
```

---

## 📝 Instrucciones Paso a Paso para el Agente

### Si el agente PUEDE ejecutar PowerShell:

```powershell
# Navegar al repo (si no está ahí)
cd C:\Users\Brai\Desktop\REPO

# Ejecutar setup automático
.\scripts\auto-setup-ai.ps1
```

### Si el agente NO PUEDE ejecutar PowerShell:

Decile al usuario que ejecute:

```
Por favor, ejecutá este comando en PowerShell:

.\scripts\auto-setup-ai.ps1

Esto configurará automáticamente Aurora AI con las 16 API keys.
Solo necesitás autenticarte en GitHub cuando te lo pida.
```

---

## ✅ Verificación Post-Setup

Después de ejecutar, el agente debe verificar:

```powershell
# 1. Verificar .env.nvidia
cat .env.nvidia

# 2. Verificar Aurora AI
node scripts/aurora-ai-agent.mjs --status

# 3. Probar Aurora AI
node scripts/aurora-ai-agent.mjs "Hola"
```

---

## 🚨 Troubleshooting

### Error: "Script no encontrado"
```
Solución: Verificar que estamos en C:\Users\Brai\Desktop\REPO
```

### Error: "GitHub CLI no está instalado"
```
Solución: El script lo instala automáticamente
O manualmente: winget install --id GitHub.cli
```

### Error: "Autenticación requerida"
```
Solución: El usuario debe ejecutar gh auth login
```

### Error: "Scripts deshabilitados"
```
Solución: El script lo habilita automáticamente
O manualmente: Set-ExecutionPolicy RemoteSigned -Scope Process
```

---

## 📊 Output Esperado

Al finalizar, el agente debe ver:

```
╔══════════════════════════════════════════════╗
║  ✅ AUTO-SETUP COMPLETADO                    ║
╚══════════════════════════════════════════════╝

✅ GitHub CLI: Instalado
✅ Repositorio: Actualizado
✅ Autenticación: Completada
✅ Scripts: Habilitados
✅ GitHub Secrets: Configurados
✅ .env.nvidia: Creado
✅ Aurora AI: Listo para usar

📍 Ubicación: C:\Users\Brai\Desktop\REPO
📄 .env.nvidia: C:\Users\Brai\Desktop\REPO\.env.nvidia
🔑 API Keys: 16 configuradas
🤖 Providers: 5+ disponibles

¡Aurora AI está listo para usar en esta PC! 🚀
```

---

## 📁 Archivos Involucrados

| Archivo | Propósito |
|---------|-----------|
| `scripts/auto-setup-ai.ps1` | ⭐ Script principal de auto-setup |
| `scripts/add-github-secrets.ps1` | Configuración de GitHub Secrets |
| `scripts/AUTO_SETUP_AGENT.md` | Instrucciones detalladas |
| `scripts/README_AGENTES.md` | Este archivo |

---

## 🎯 Prompt para el Agente

Cuando el usuario pida configurar Aurora AI en una nueva PC, el agente debe:

1. **Verificar** que está en el directorio correcto
2. **Ejecutar** `.\scripts\auto-setup-ai.ps1`
3. **Pedir** al usuario que autentique en GitHub (si es necesario)
4. **Verificar** que .env.nvidia se creó
5. **Probar** Aurora AI

---

## 💡 Consejos para el Agente

- El script es **idempotente** (se puede ejecutar múltiples veces)
- La autenticación de GitHub **requiere intervención del usuario**
- El script **crea .env.nvidia automáticamente** con las 16 keys
- **No es necesario** que el usuario configure nada manualmente

---

## 📞 Soporte

Si algo falla:

1. Verificar logs del script
2. Revisar `scripts/AUTO_SETUP_AGENT.md` para troubleshooting
3. Ejecutar manualmente los pasos fallidos
4. Reportar errores al usuario

---

**Fecha**: 2025-03-30  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para usar
