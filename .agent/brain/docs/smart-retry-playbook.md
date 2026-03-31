# Aurora Smart Retry Strategy - Playbook

## Overview
Smart Retry Strategy es una mejora proactiva implementada en Aurora para detectar, analizar y recuperarse automáticamente de errores de build, lint y operaciones CI/CD.

## Implementación ERR-001

### Problema Resuelto
El repositorio tenía errores TypeScript estructurales que bloqueaban el build:
- 20+ import path errors por estructura duplicada `lib/lib/`
- Errores de tipo por imports incorrectos
- Errores de propagación de props

### Solución
Estrategia de retry inteligente con:
1. **Exponential Backoff + Jitter**: Retry con delays crecientes
2. **Análisis de Patrones**: Detección automática de categorías de errores
3. **Sugerencias de Fix**: Recomendaciones basadas en el tipo de error

## Configuración

```javascript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,      // 1 segundo inicial
  maxDelay: 10000,      // 10 segundos máximo
  jitter: 0.3,          // 30% de variación aleatoria
  backoffMultiplier: 2  // Duplica el delay cada intento
};
```

## Patrones de Error Detectados

| Pattern | Categoría | Severidad | Fix Sugerido |
|---------|-----------|-----------|--------------|
| `Cannot find module` | import | high | Verificar ruta del import |
| `TS2307` | import | high | Check module path |
| `Type error` | type | high | Revisar definición de tipo |
| `TS2322` | type | medium | Verificar asignación |
| `Syntax error` | syntax | critical | Revisar sintaxis |
| `ENOENT` | filesystem | high | Verificar archivo existe |
| `timeout` | timeout | medium | Incrementar timeout |

## Uso

### Comando Directo
```bash
# Retry con npm run lint
npm run aurora:smart-retry -- npm run lint

# Retry con tsc
npm run aurora:smart-retry -- tsc --noEmit

# Diagnóstico completo
npm run aurora:smart-retry:diagnose
```

### Script Directo
```bash
# Con argumentos
node scripts/aurora-smart-retry.mjs npm run lint
node scripts/aurora-smart-retry.mjs tsc --noEmit
node scripts/aurora-smart-retry.mjs npm run build

# Modo diagnóstico
node scripts/aurora-smart-retry.mjs diagnose
```

## Output Ejemplo

```
[INFO] Starting Smart Retry Strategy { command: 'npm', args: [ 'run', 'lint' ] }
[INFO] Attempt 1/4: npm run lint
[WARN] Command failed (attempt 1), retrying... { findings: [{ category: 'import', severity: 'high', fix: 'check_import_path' }] }
[INFO] Waiting 2000ms before retry...
[INFO] Attempt 2/4: npm run lint
[SUCCESS] Command succeeded on attempt 2

Error analysis and suggestions:
1. [HIGH] import
   Error: Cannot find module '../../utils/logger'
   Suggestion: Verificar que la ruta del import sea correcta. Usar rutas relativas normalizadas (../../lib/)
```

## Integración con Aurora

### En Aurora Shell
```
@aurora retry npm run lint
@aurora retry diagnose
```

### En Aurora API
```javascript
// POST /aurora/smart-retry
{
  "command": "npm run lint",
  "retries": 3,
  "timeout": 60000
}
```

## Logs

- **Archivo de logs**: `.agent/brain/db/retry-strategy-log.jsonl`
- **Patrones de error**: `.agent/brain/db/error-patterns.jsonl`

## Métricas

- Total de retries ejecutados
- Tasa de éxito por tipo de error
- Tiempo promedio de recuperación
- Errores que requieren intervención manual

## Mejoras Futuras

1. **Auto-fix para import paths**: Corregir automáticamente rutas comunes
2. **Machine Learning**: Aprender de errores recurrentes
3. **Integración con CI**: Auto-retry en GitHub Actions
4. **Slack Alerts**: Notificaciones cuando retry falla

---

**Fecha de implementación**: 2026-03-26
**Status**: ✅ Implementado y funcionando
**Prioridad**: CRÍTICA
