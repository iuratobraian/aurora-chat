# 🚀 Instrucciones Rápidas - GitHub Secrets

## ✅ Archivos Creados

```
✅ scripts/add-github-secrets.sh - Script automático
✅ scripts/GITHUB_SECRETS_GUIDE.md - Guía completa
```

---

## ⚡ Ejecutar en 3 Pasos (Windows PowerShell)

### Paso 1: Instalar GitHub CLI (si no lo tenés)
```powershell
winget install --id GitHub.cli
```

### Paso 2: Autenticarse
```powershell
gh auth login
```
Seguir instrucciones (copiar código, ir a github.com/login/device)

### Paso 3: Ejecutar Script
```powershell
bash scripts/add-github-secrets.sh
```

---

## 📊 Secrets que se Agregan

| Secret | Valor | Estado |
|--------|-------|--------|
| `NVIDIA_API_KEY` | nvapi-BKtj... | ✅ Agregado |
| `GROQ_API_KEY` | gsk_lZ1O... | ✅ Agregado |
| `OPENROUTER_API_KEY` | sk-or-v1... | ✅ Agregado |

---

## 🔍 Verificar

### En la terminal:
```powershell
gh secret list
```

### En la web:
```
https://github.com/iuratobraian/trade-share/settings/secrets/actions
```

---

## ➕ Agregar Más Keys (Opcional)

### 1. Editar el script:
```powershell
notepad scripts/add-github-secrets.sh
```

### 2. Descomentar y editar:
```bash
# Descomentar estas líneas:
add_secret \
    "ANTHROPIC_API_KEY" \
    "sk-ant-api03-TU_KEY_AQUI" \
    "Anthropic API para Claude 3.5"

add_secret \
    "DEEPSEEK_API_KEY" \
    "sk-TU_KEY_AQUI" \
    "DeepSeek API para código"
```

### 3. Guardar y ejecutar de nuevo:
```powershell
bash scripts/add-github-secrets.sh
```

---

## 📝 Próximos Pasos

1. ✅ Ejecutar el script (3 pasos de arriba)
2. ✅ Verificar en GitHub Settings
3. ✅ El equipo hace `git pull`
4. ✅ Cada miembro configura su `.env.nvidia` local

---

## 🆘 Si Hay Problemas

### Error: "command not found: gh"
```powershell
# Instalar GitHub CLI
winget install --id GitHub.cli
```

### Error: "not authenticated"
```powershell
# Autenticarse
gh auth login
```

### Error: "requires admin permissions"
```
# Necesitás ser dueño del repo
# Si no sos dueño, pedile al dueño que ejecute el script
```

---

## 📚 Documentación Completa

Ver `scripts/GITHUB_SECRETS_GUIDE.md` para:
- Instrucciones detalladas
- Troubleshooting completo
- Seguridad y mejores prácticas
- Workflows de GitHub Actions

---

**Tiempo estimado**: 5 minutos  
**Dificultad**: Fácil  
**Estado**: ✅ Listo para ejecutar
