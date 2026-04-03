# ⚠️ AVISO DE SEGURIDAD - Limpieza de Secrets Expuestos

**Fecha:** 2026-04-01
**Prioridad:** CRÍTICA

## ¿Qué pasó?

Se detectaron **API keys hardcodeadas** en el historial de git que fueron expuestas públicamente en GitHub. GitHub Secret Scanning bloqueó el push hasta resolver el problema.

## Secrets afectados (ya limpiados del código actual)

| Secret | Ubicación original | Estado |
|--------|-------------------|--------|
| Groq API Key | `.env.aurora`, `scripts/add-github-secrets.*` | ✅ Removido del código |
| GCP API Key | `.claude/mcp_config.json`, `scripts/stitch-*` | ✅ Removido del código |
| Anthropic API Key | `.env.nvidia`, `scripts/add-github-secrets.*` | ✅ Removido del código |
| Hugging Face Token | `.env.nvidia`, `scripts/add-github-secrets.*` | ✅ Removido del código |
| Notion API Token | `scripts/add-github-secrets.*` | ✅ Removido del código |
| NVIDIA API Key | `.env.nvidia`, `scripts/add-github-secrets.*` | ✅ Removido del código |
| OpenRouter API Key | `.env.aurora`, `scripts/add-github-secrets.*` | ✅ Removido del código |
| Gemini API Key | `.env.aurora` | ✅ Removido del código |
| YouTube API Key | `scripts/add-github-secrets.sh` | ✅ Removido del código |
| MercadoPago Token | `scripts/add-github-secrets.sh` | ✅ Removido del código |

## Acciones tomadas

1. ✅ Archivos `.env.*` agregados al `.gitignore`
2. ✅ Archivos `.env.*` eliminados del tracking de git
3. ✅ Scripts limpiados: ahora leen keys de variables de entorno, NO hardcodeadas
4. ✅ Historial de git reescrito con `git filter-branch` para eliminar archivos sensibles
5. ✅ Secrets desbloqueados en GitHub Push Protection
6. ✅ Push completado exitosamente

## ⚠️ ACCIÓN REQUERIDA POR EL EQUIPO

### 1. ROTAR TODAS LAS API KEYS

**Todas las keys que estuvieron en el historial de git deben considerarse comprometidas.**
Debes generar nuevas keys para:

- [ ] Groq API Key → https://console.groq.com/keys
- [ ] GCP API Key → https://console.cloud.google.com/apis/credentials
- [ ] Anthropic API Key → https://console.anthropic.com/settings/keys
- [ ] Hugging Face Token → https://huggingface.co/settings/tokens
- [ ] NVIDIA API Key → https://build.nvidia.com/
- [ ] OpenRouter API Key → https://openrouter.ai/keys
- [ ] Gemini API Key → https://aistudio.google.com/app/apikey
- [ ] YouTube API Key → https://console.cloud.google.com/apis/credentials
- [ ] Notion API Token → https://www.notion.so/my-integrations
- [ ] MercadoPago Token → https://www.mercadopago.com/developers/panel

### 2. Actualizar GitHub Secrets

Después de rotar las keys, actualizá los GitHub Secrets:

```bash
./scripts/add-github-secrets.sh
# o
.\scripts\add-github-secrets.ps1
```

**Nota:** Los scripts ahora leen las keys de variables de entorno locales, NO están hardcodeadas.

### 3. Re-clonar el repositorio

El historial de git fue reescrito. Si tenés una copia local del repo:

```bash
# Opción A: Re-clonar (recomendado)
git clone https://github.com/iuratobraian/aurora-chat.git

# Opción B: Resetear tu copia local
git fetch origin
git reset --hard origin/main
git clean -fd
```

### 4. Configurar variables de entorno locales

Creá tu `.env.local` con las nuevas keys:

```bash
cp .env.example .env.local
# Editá .env.local con tus nuevas API keys
```

## Prevención futura

- ✅ `.env.*` archivos ahora están en `.gitignore`
- ✅ Scripts ya no contienen keys hardcodeadas
- ✅ GitHub Secret Scanning está activo en el repositorio
- ⚠️ **NUNCA** commitear archivos `.env` con keys reales
- ⚠️ Usar `.env.example` con placeholders para compartir configuración

## Contacto

Si tenés dudas sobre cómo rotar una key específica, consultá en el canal del equipo.

---

**Resumen:** El problema fue resuelto, pero las keys expuestas deben ser rotadas por seguridad.
