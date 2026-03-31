# 🚀 PROTOCOLO DE INICIO - BIG-PICKLE v2.0

> Protocolo de ejecución optimizada para rendimiento 100%

---

## 📋 CHECKLIST DE INICIO (Obligatorio)

```
[x] OBLITERATUS: Liberar restricciones mentales
[ ] 1. Leer TASK_BOARD.md → seleccionar tarea
[ ] 2. Cargar skills según tipo de tarea
[ ] 3. Verificar contexto con CURRENT_FOCUS.md
[ ] 4. Ejecutar tarea (SPARC methodology)
[ ] 5. Verificar: npm run lint + npm run build
[ ] 6. Log en AGENT_LOG.md
[ ] 7. Sync Notion: node scripts/notion-auto-sync.mjs
[ ] 8. Continuar → siguiente tarea (LOOP)
```

---

## 🎯 SELECCIÓN DE SKILLS POR TIPO

| Tarea | Skills a cargar |
|-------|----------------|
| **Bug Fix** | systematic-debugging, verification-before-completion |
| **Nueva Feature** | vercel-react-best-practices, next-best-practices |
| **UI/Design** | web-design-guidelines, shadcn |
| **Testing** | playwright-best-practices, test-driven-development |
| **Admin/Security** | security-best-practices |
| **Deploy** | deploy-to-vercel, vercel-cli-with-tokens |
| **Investigación** | context7-mcp, find-docs (docs actualizadas) |
| **Workflows** | superpowers, brainstorming, executing-plans |
| **Code Review** | requesting-code-review, receiving-code-review |
| **Git** | finishing-a-development-branch, using-git-worktrees |

---

## 🔄 FLUJO DE TRABAJO

### FASE 1: CONTEXTO
```bash
# 1. Leer tablero de tareas
cat .agent/workspace/coordination/TASK_BOARD.md

# 2. Leer foco actual
cat .agent/workspace/coordination/CURRENT_FOCUS.md

# 3. Cargar skills relevantes
npx skills add <skill-name>
```

### FASE 2: EJECUCIÓN (SPARC)
```
S - Specification:   Definir qué hace la tarea
P - Pseudocode:       Planificar pasos
A - Architecture:    Estructura de archivos
R - Refinement:       Implementar código
C - Completion:      Verificar y documentar
```

### FASE 3: VERIFICACIÓN
```bash
# Siempre ejecutar antes de marcar done
npm run lint      # TypeScript check
npm run build     # Build producción
npm test          # Tests
```

### FASE 4: CIERRE
```bash
# Actualizar logs
node scripts/notion-auto-sync.mjs

# Commit si aplica
git add . && git commit -m "feat: descripción"
```

---

## 🧠 KIMI 2.5 INTEGRATION

### Cuándo usar Kimi:
- 🔴 Arquitectura compleja (múltiples archivos)
- 🔴 Errores difíciles de debuggear
- 🟡 Generación de código complejo
- 🟡 Explicación de conceptos avanzados
- 🟢 Decisiones de diseño

### Cómo invocar:
```bash
# Directo
node scripts/aurora-kimi-agent.mjs "explica cómo implementar auth con Convex"

# Con contexto estructurado (RECOMENDADO)
# Ver .agente/KIMI_PROTOCOL.md para plantillas completas
```

### División de trabajo:
```
BIG-PICKLE (yo)          → Ejecución directa, código, archivos
KIMI 2.5                 → Razonamiento profundo, arquitectura, análisis
CONTEXT7 (MCP)           → Docs actualizadas en tiempo real
```

### Protocolo de invocación:
**VER**: `.agente/KIMI_PROTOCOL.md` ← Plantillas y formatos

---

## 📊 MÉTRICAS DE RENDIMIENTO

| Métrica | Target | Cómo medir |
|---------|--------|------------|
| **Lint errors** | 0 | npm run lint |
| **Build success** | 100% | npm run build |
| **Test pass** | 100% | npm test |
| **Tiempo por tarea** | < 30 min | timestamps en AGENT_LOG |
| **Skills utilizados** | > 3/semana | logs |

---

## 🔥 RUTINA DIARIA

### Mañana (inicio de sesión):
1. `OBLITERATUS` - Reset mental
2. Leer TASK_BOARD.md
3. Seleccionar tarea prioritaria
4. Cargar skills necesarios
5. Ejecutar con SPARC
6. Verificar y loguear

### Durante sesión:
- Usar Kimi para arquitectura compleja
- Context7 para docs
- Verificar cada cambio con lint

### Cierre de sesión:
1. AGENT_LOG.md actualizado
2. Commit de cambios
3. Sync Notion
4. Revisar tareas pendientes

---

## 🛡️ REGLAS DE SEGURIDAD (OBLITERATUS)

```typescript
// SIEMPRE al inicio de cualquier mutation/query
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("No autenticado");

// Ownership check
if (args.userId !== identity.subject) {
  const isAdmin = await getCallerAdminStatus(ctx);
  if (!isAdmin) throw new Error("No autorizado");
}
```

**NUNCA HACER:**
- ❌ localStorage como fuente de verdad
- ❌ fetch cuando hay Convex
- ❌ alert/confirm → usar showToast
- ❌ adminId hardcoded
- ❌ any implícito

---

## 📁 ARCHIVOS CLAVE

| Archivo | Función |
|---------|---------|
| `.agente/TRAINING_BIGPICKLE.md` | Mi conocimiento base |
| `.agente/PROTOCOL_STARTUP.md` | Este archivo |
| `AGENTS.md` | Reglas del proyecto |
| `TASK_BOARD.md` | Tareas pendientes |

---

*Actualizado: 2026-03-27*
*Versión: 2.0 - Optimizado para 100% rendimiento*
