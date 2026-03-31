# 🔒 Seguridad - API Keys y Credenciales

## ⚠️ NUNCA Subir API Keys al Repositorio

Aunque el repo sea **PRIVADO**, nunca debes subir API keys al repositorio.

### Riesgos:
1. **Historial de Git**: Las keys quedan guardadas para siempre en el historial
2. **Acceso de terceros**: Si das acceso al repo, otros ven las keys
3. **Fugas accidentales**: Si el repo se hace público por error
4. **CI/CD**: Las keys pueden exponerse en logs de GitHub Actions
5. **Backups**: Los backups pueden filtrarse

---

## ✅ Configuración Correcta

### 1. Archivo `.env.nvidia` (LOCAL, NO SUBIR)
```bash
# Este archivo existe en tu computadora pero NO se sube a Git
# Está protegido por .gitignore

NVIDIA_API_KEY=nvapi-...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
```

### 2. Archivo `.env.nvidia.example` (SÍ SUBIR)
```bash
# Este es el ejemplo que SÍ se sube al repo
# Sirve como plantilla para el equipo

NVIDIA_API_KEY=nvapi-...      # Reemplazar con tu key
GROQ_API_KEY=gsk_...          # Reemplazar con tu key
OPENROUTER_API_KEY=sk-or-...  # Reemplazar con tu key
```

---

## 🎯 Flujo para el Equipo

### Cada Miembro Debe:

```bash
# 1. Hacer pull del repo
git pull origin main

# 2. Copiar el ejemplo
copy .env.nvidia.example .env.nvidia

# 3. Conseguir SUS PROPIAS API Keys (GRATIS):
#    NVIDIA: https://build.nvidia.com/
#    Groq: https://console.groq.com/
#    OpenRouter: https://openrouter.ai/

# 4. Editar .env.nvidia con SUS keys
notepad .env.nvidia

# 5. NUNCA hacer commit de .env.nvidia
#    (ya está en .gitignore)
```

---

## 🚨 Si Subiste una Key por Error

### 1. Rotar la Key Inmediatamente
```
Ir al servicio correspondiente y generar una nueva key
Borrar la key antigua
```

### 2. Eliminar del Historial de Git
```bash
# Si fue en el último commit:
git reset --soft HEAD~1
# Editar el archivo para quitar la key
git commit --amend
git push --force

# Si fue hace varios commits:
# Usar BFG Repo-Cleaner o git filter-branch
# Ver: https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

### 3. Verificar que no esté en GitHub
```
Ir al repo en GitHub
Buscar la key en la barra de búsqueda
Si aparece, contactar a GitHub Support para que la borren del historial
```

---

## ✅ Verificación de Seguridad

### Verificar que .env.nvidia NO está en Git:
```bash
# Este comando NO debe mostrar .env.nvidia
git ls-files | findstr .env.nvidia

# Solo debe mostrar:
# .env.nvidia.example (el ejemplo, SIN keys reales)
```

### Verificar .gitignore:
```bash
# .env.nvidia debe estar en .gitignore
cat .gitignore

# Debe incluir:
.env.nvidia
.env.*.local
```

---

## 📋 Checklist de Seguridad

```
☐ .env.nvidia está en .gitignore
☐ Nunca hice commit de .env.nvidia
☐ Cada miembro tiene SUS propias keys
☐ Las keys no están en el historial de Git
☐ Las keys no están en logs de CI/CD
☐ Uso variables de entorno para secrets
☐ Roto las keys cada 3-6 meses
```

---

## 🔐 GitHub Secrets (Para CI/CD)

Si necesitás usar API keys en GitHub Actions:

### 1. Agregar Secret en GitHub
```
Ir a: Settings → Secrets and variables → Actions
Click: New repository secret
Nombre: NVIDIA_API_KEY
Valor: nvapi-...
```

### 2. Usar en Workflow
```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      - name: Run tests
        env:
          NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}
        run: npm test
```

### 3. NUNCA en el Código
```javascript
// ❌ MAL
const apiKey = "nvapi-...";

// ✅ BIEN
const apiKey = process.env.NVIDIA_API_KEY;
```

---

## 📞 Contacto de Emergencia

Si descubrís una key expuesta:

1. **Rotar la key inmediatamente** en el servicio correspondiente
2. **Notificar al equipo** por Slack/Telegram
3. **Eliminar del historial** de Git
4. **Revisar logs** para ver si alguien la usó

---

**Recordá: La seguridad es responsabilidad de todos.** 🔒
