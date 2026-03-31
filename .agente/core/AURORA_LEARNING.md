# AURORA - Sistema de Aprendizaje

> Basado en SONA (Self-Optimizing Neural Architecture) + AgentDB

---

## 🎯 Concepts Clave

### 1. Pre-Task Hooks
```bash
npx claude-flow hook pre-task --description "Fix auth bug" --load-memory
```

### 2. Post-Task Hooks
```bash
npx claude-flow hook post-task --task-id "$ID" --success true
```

### 3. Memory con AgentDB
- **Vector Search**: <100µs
- **Pattern Retrieval**: <1ms (con cache)
- **Batch Insert**: 2ms para 100 patterns
- **Memory Reduction**: 4-32x con quantization

---

## 🧠 Patrones de Aprendizaje

### Session Memory
Guardar lo de la sesión actual:
```typescript
{
  sessionId: "current",
  task: "payment-auth",
  filesModified: ["convex/payments.ts"],
  errors: ["adminId no existe"],
  solution: "usar ctx.auth.getUserIdentity()",
  timestamp: Date.now()
}
```

### Long-Term Memory
Patrones que se repiten:
```typescript
{
  domain: "security",
  pattern: "ownership-check",
  trigger: "query por userId",
  solution: "validar identity.subject === args.userId || isAdmin",
  successRate: 0.95,
  usageCount: 15
}
```

---

## 📈 Métricas a Registrar

| Métrica | Descripción | Target |
|---------|-------------|--------|
| timePerTask | Tiempo por tarea | -30% |
| errorRate | Errores repetidos | <5% |
| accuracy | Código correcto al primer intento | >90% |
| tokenUsage | Tokens por tarea | -40% |

---

## 🔄 Workflow de Aprendizaje

```
1. Nueva tarea
   ↓
2. Pre-task: Cargar memoria relevante
   ↓
3. Clasificar: security/bugfix/feature/etc
   ↓
4. Seleccionar prompt especializado
   ↓
5. Ejecutar tarea
   ↓
6. Post-task: Guardar resultado
   ↓
7. Si éxito → guardar pattern
   ↓
8. Si error → documentar para evitar
```

---

## 📋 Patterns Exitosos del Proyecto (BIG-PICKLE)

### Security
- ✅ Siempre usar `ctx.auth.getUserIdentity()`
- ✅ `getCallerAdminStatus()` para operaciones admin
- ✅ Ownership check: `identity.subject === args.userId || isAdmin`

### Bugs Comunes
- ❌ `adminId` del cliente → usar ctx.auth
- ❌ `localStorage` → usar Convex
- ❌ `fetch` legacy → usar useMutation de Convex
- ❌ `confirm()` → usar showToast

---

## 🧠 Heurísticas de BIG-PICKLE

### Autores del Proyecto (para referencia)
- BIG-PICKLE: Creador del Brain Improvement Plan
- SONA: Self-Optimizing Neural Architecture
- Claude Code: Runtime principal

### Skills Definidos (BIG-PICKLE)
| Skill | Dominio |
|-------|---------|
| skill_auth_security | security, convex |
| skill_rate_limit | security, backend |
| skill_react_perf | frontend, react |
| skill_test_isolation | testing, vitest |
| skill_knowledge_destil | aurora, knowledge |

### Anti-Patrones Detectados
1. Convex mocking in unit tests
2. Inline mock functions
3. Unused exports in production
4. Hardcoded thresholds
5. Unverified Convex mutations
6. Client-side auth checks only

---

## 🛠️ Auto-Routing

Clasificar tarea automáticamente:

| Keywords | Categoría | Complejidad |
|----------|------------|-------------|
| auth, payment, admin | security | complex |
| fix, bug, error | bugfix | medium |
| add, new, create | feature | medium |
| refactor, improve | refactor | medium |
| review, check | review | simple |

---

## 📊 Objetivos

- [ ] 30% reducción tiempo por tarea
- [ ] 80% menos errores repetidos  
- [ ] 90% accuracy código
- [ ] Implementar memory hooks
