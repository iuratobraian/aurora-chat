# 🧠 MEMORY OPTIMIZATION PLAYBOOK

**Aprendizaje Crítico del Proyecto TradeShare**  
**Fecha:** 2026-03-31  
**Estado:** ✅ Production Ready - 94% memory reduction (5GB → 300MB)

---

## 📚 LECCIONES APRENDIDAS

### 1. ~~Legacy Module Memory Leak~~ [ELIMINADO - PROHIBIDO]

> 🚫 **El módulo inestable ha sido eliminado permanentemente del proyecto.** Está **ESTRICTAMENTE PROHIBIDO** reimportar, referenciar o intentar reinstalar componentes no autorizados en cualquier forma.

**Problema original:**
```typescript
// ❌ MAL: Polling múltiple creando arrays infinitos
useEffect(() => {
  const interval = setInterval(() => {
    setHistory(prev => [...prev.slice(-19), newValue]); // Nueva array cada 10s
  }, 10000);
}, []);
```

**Solución:**
```typescript
// ✅ BIEN: Eliminar polling completamente si no es crítico
useEffect(() => {
  checkStatus(); // Solo en mount
  // Sin interval - el usuario puede refrescar manualmente
}, []);
```

**Lección:** Si el polling no es esencial para UX, eliminar completamente.

---

### 2. PostCard Hook Explosion (1.5GB → 500MB)

**Problema:**
```typescript
// ❌ MAL: 15+ useState, 8+ useEffect por post × 100 posts = 1500+ listeners
export const PostCard = memo(({ post }) => {
  const [state1, set1] = useState(); // 15 veces
  const [state2, set2] = useState();
  // ... 13 más
});
```

**Solución:**
```typescript
// ✅ BIEN: 8 estados esenciales + memoized inner components
export const PostCard: React.FC<PostCardProps> = memo(({ post, usuario }) => {
  // Estados esenciales
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(fullView);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [isFollowingLocal, setIsFollowingLocal] = useState(false);
  const [showFullCommentsModal, setShowFullCommentsModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Inner components memoized
  const ShareModal = memo(({ show, onClose }) => { /* ... */ });
  const FullCommentsModal = memo(({ show, onClose }) => { /* ... */ });
});
```

**Lección:** Cada estado/hook extra se multiplica por N renders. Minimizar.

---

### 3. Duplicate Notification Polling (2x → 1x)

**Problema:**
```typescript
// ❌ MAL: Dos hooks polleando lo mismo
// Navigation.tsx - 15s
setInterval(fetchNotifications, 15000);

// useNotifications.ts - 30s
setInterval(fetchNotifications, 30000);
```

**Solución:**
```typescript
// ✅ BIEN: Unificado en custom hook con visibility-aware
function useNotificationPolling(userId: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled || document.visibilityState === 'hidden') return;
    
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [userId, enabled]);
}
```

**Lección:** Centralizar polling en un solo lugar con control de visibilidad.

---

### 4. Market Data Aggressive Polling (30/min → 6/min)

**Problema:**
```typescript
// ❌ MAL: 2 segundos = 30 requests/minuto
setInterval(() => {
  setPrices(prev => { /* update */ });
}, 2000);
```

**Solución:**
```typescript
// ✅ BIEN: 10 segundos + visibility check + concurrency guard
const isFetchingRef = useRef(false);

useEffect(() => {
  const interval = setInterval(() => {
    if (isFetchingRef.current || document.visibilityState === 'hidden') return;
    
    isFetchingRef.current = true;
    try {
      setPrices(prev => { /* update */ });
    } finally {
      isFetchingRef.current = false;
    }
  }, 10000); // 6 requests/min
  
  return () => clearInterval(interval);
}, []);
```

**Lección:** 10s es suficiente para datos de mercado. Agregar guards de concurrencia y visibilidad.

---

### 5. Unlimited Array Growth (∞ → 200 items)

**Problema:**
```typescript
// ❌ MAL: Array crece infinitamente
const [items, setItems] = useState<FeedItem[]>([]);

setItems(prev => [...prev, ...newItems]); // Sin límite
```

**Solución:**
```typescript
// ✅ BIEN: Límite explícito con constante
const MAX_FEED_ITEMS = 200;

setItems(prev => {
  const updated = [...prev, ...newItems];
  return updated.slice(-MAX_FEED_ITEMS); // Mantiene últimos 200
});
```

**Lección:** Siempre poner límite a arrays que acumulan datos.

---

### 6. ErrorBoundary Full-Page Blocker

**Problema:**
```typescript
// ❌ MAL: Pantalla completa bloqueando toda la app
<div className="fixed inset-0 z-[9999]">
  <h1>Error en la Red - Anomalía crítica</h1>
  {/* Usuario no puede hacer nada */}
</div>
```

**Solución:**
```typescript
// ✅ BIEN: Popup discreto solo para admins
if (!isAdmin) return children; // Usuarios normales ven fallback

return (
  <>
    {children}
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md">
      {/* Popup pequeño con botón de descartar */}
    </div>
  </>
);
```

**Lección:** Errores no deben bloquear UX. Solo admins ven detalles técnicos.

---

## 🔍 AGENT AUDIT PATTERN

### Cómo Usar Agentes para Memory Audit

```bash
# 1. Ejecutar auto-setup
.\scripts\auto-setup-ai.ps1

# 2. Ejecutar agente especializado
node scripts/aurora-ai-agent.mjs "Analiza memory leaks, polling, intervals"

# 3. Revisar reporte en consola
```

### Métricas Clave a Buscar

| Métrica | Ideal | Alerta | Crítico |
|---------|-------|--------|---------|
| **Intervals sin cleanup** | 0 | 1-3 | 4+ |
| **Polling frequency** | >30s | 10-30s | <10s |
| **Arrays sin límite** | 0 | 1-2 | 3+ |
| **Event listeners sin cleanup** | 0 | 1+ | N/A |
| **Fetches sin debounce** | 0 | 1-3 | 4+ |

---

## 🛠️ OPTIMIZATION TOOLKIT

### Memory Profiler (Desarrollo)

```javascript
// public/memory-profiler.js
window.memoryProfiler = {
  takeSnapshot(label) {
    if (performance.memory) {
      console.log(`[${label}] ${performance.memory.usedJSHeapSize / 1024 / 1024}MB`);
    }
  },
  report() {
    // Compara snapshots
  }
};

// Uso en consola:
memoryProfiler.takeSnapshot("Inicio");
// ... usa la app ...
memoryProfiler.takeSnapshot("Después");
memoryProfiler.report();
```

### Visibility-Aware Polling Pattern

```typescript
function useVisibilityAwarePolling(callback: () => void, intervalMs: number) {
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      callback();
    };
    
    tick(); // Ejecución inmediata
    const interval = setInterval(tick, intervalMs);
    
    return () => clearInterval(interval);
  }, [callback, intervalMs]);
}
```

### Concurrency Guard Pattern

```typescript
const isFetchingRef = useRef(false);

const fetchWithGuard = async () => {
  if (isFetchingRef.current) return;
  
  isFetchingRef.current = true;
  try {
    await fetchData();
  } finally {
    isFetchingRef.current = false;
  }
};
```

---

## 📋 PRE-LAUNCH CHECKLIST

### Memory Leak Prevention

- [ ] Todos intervals tienen `clearInterval` en cleanup
- [ ] Todos event listeners tienen `removeEventListener`
- [ ] Todos WebSockets tienen `.close()` en cleanup
- [ ] Todos observables tienen `.unsubscribe()`
- [ ] Arrays tienen límite explícito (MAX_ITEMS)
- [ ] Polling es visibility-aware
- [ ] Fetches tienen debounce/throttle
- [ ] Promesas usan AbortController

### Performance Checks

- [ ] Build size < 150kB gzip
- [ ] Initial load < 3s en 3G
- [ ] Memory usage < 500MB después de 5min
- [ ] No más de 10 intervals activos
- [ ] No más de 20 event listeners globales

### Monitoring

- [ ] Memory profiler en desarrollo
- [ ] ErrorBoundary solo para admins
- [ ] Logging de memory leaks en dev
- [ ] Alertas en producción (>1GB RAM)

---

## 🎯 BATCH OPTIMIZATION STRATEGY

### Cómo Organizar Optimizaciones

**Batch #1: Critical Memory Leaks (5GB → 500MB)**
1. Eliminar TurboQuant polling
2. Reducir PostCard hooks
3. Fix Navigation polling
4. ErrorBoundary admin-only

**Batch #2: Polling Optimization (500MB → 300MB)**
1. Market data 2s → 10s
2. Feed array limit (200 items)
3. Visibility-aware polling
4. Concurrency guards

**Batch #3: Nice-to-Have (300MB → 250MB)**
1. Unify notification hooks
2. Debounce all fetches
3. Cache limits everywhere
4. Virtualize long lists

---

## 📖 REFERENCIAS

### Archivos del Proyecto

- `MEMORY_OPTIMIZATION_REPORT.md` - Batch #1 completo
- `MEMORY_OPTIMIZATION_BATCH2.md` - Batch #2 completo
- `AGENT_LOG.md` - Timeline de cambios
- `public/memory-profiler.js` - Herramienta de profiling

### Patrones Externos

- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Memory Management in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [Web Performance Optimization](https://web.dev/performance/)

---

## 🚀 QUICK START PARA NUEVOS AGENTES

### Si Encuentras Memory Leak

1. **Identifica la fuente:**
   - ¿Interval sin cleanup?
   - ¿Array creciendo infinitamente?
   - ¿Event listener sin remover?

2. **Aplica el patrón correcto:**
   - Interval → Agregar `return () => clearInterval()`
   - Array → Agregar `.slice(-MAX_ITEMS)`
   - Listener → Agregar `removeEventListener`

3. **Verifica:**
   ```bash
   npm run build
   memoryProfiler.takeSnapshot("Before")
   # ... usa la app ...
   memoryProfiler.takeSnapshot("After")
   memoryProfiler.report()
   ```

4. **Commitea:**
   ```bash
   git add -A
   git commit -m "fix: Memory leak in [component] - [solution]"
   git push
   ```

---

**Última actualización:** 2026-03-31  
**Mantenimiento:** Todos los agentes deben seguir este playbook  
**Estado:** ✅ Production Ready
