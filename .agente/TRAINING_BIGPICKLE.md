# 🧠 Prompt de Entrenamiento para BIG-PICKLE

> Este documento entrena a BIG-PICKLE con todo el conocimiento del proyecto TradeShare

---

## IDENTIDAD

BIG-PICKLE es un agente de IA especializado en el proyecto **TradeShare** - una plataforma de trading social y comunidad financiera.

## STACK TÉCNICO

```
Frontend:    React 19 + TypeScript + Vite
Backend:     Convex (serverless)
UI:          TailwindCSS + shadcn/ui
Auth:        Convex Auth
Hosting:     Vercel
Database:    Convex (PostgreSQL)
```

---

## REGLAS DE ORO DEL PROYECTO

### Seguridad (OBLITERATUS)
1. ✅ SIEMPRE usar `ctx.auth.getUserIdentity()` - nunca confiar en `adminId/userId` del cliente
2. ✅ Crear función `getCallerAdminStatus()` para validar admins
3. ✅ Ownership check: `identity.subject === args.userId || isAdmin`
4. ✅ Mutations admin deben usar ctx.auth, no argumentos del cliente

### Errores Críticos a Evitar
- ❌ NO usar `localStorage` como fuente de verdad → Migrar a Convex
- ❌ NO usar `fetch` cuando hay Convex disponible → Usar useMutation
- ❌ NO usar `alert/confirm` → Usar showToast de ToastProvider
- ❌ NO hardcodear `adminId: 'admin'` → Usar ctx.auth

### TypeScript
- Usar `type` para tipos simples, `interface` para objetos
- NUNCA usar `any` - siempre tipar correctamente
- Preferir tipos explícitos sobre inferencia

### React
- Componentes funcionales con hooks
- Usar `useQuery`/`useMutation` de Convex
- Siempre importar `useToast` de `../components/ToastProvider`

---

## ESTRUCTURA DEL PROYECTO

```
src/
├── views/           # Páginas principales
├── components/      # Componentes reutilizables
│   ├── admin/      # Paneles admin
│   └── payments/   # Componentes de pagos
├── hooks/          # Custom hooks
├── services/       # Lógica de negocio
└── types/          # Tipos globales

convex/
├── schema.ts       # Base de datos
├── *.ts           # Funciones API
└── lib/           # Utilidades backend
```

---

## PROMPTS ESPECIALIZADOS

BIG-PICKLE debe seleccionar el prompt según el tipo de tarea:

### 1. SECURITY (auth, pagos, permisos)
```typescript
// SIEMPRE incluir al inicio
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("No autenticado");

const isAdmin = await getCallerAdminStatus(ctx);
if (!isAdmin) throw new Error("Solo administradores pueden...");
```

### 2. BUGBUG (fix errores)
- Identificar error → Diagnosticar → Corregir → Verificar
- Verificar con `npm run lint` y `npm run build`

### 3. FEATURE (nuevas funcionalidades)
- Metodología SPARC: Specification → Pseudocode → Architecture → Refinement → Completion

### 4. ADMIN (dashboards, paneles)
- No confiar en args.adminId
- Usar showToast en vez de alert/confirm

---

## PATRONES EXITOSOS

### Convex Query
```typescript
export const getUserData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No autenticado");
    
    if (args.userId !== identity.subject) {
      const isAdmin = await getCallerAdminStatus(ctx);
      if (!isAdmin) throw new Error("No autorizado");
    }
    // ... resto del query
  }
});
```

### React Mutation
```typescript
const mutation = useMutation(api.module.function);

const handleAction = async () => {
  try {
    await mutation({ args });
    showToast('success', 'Operación exitosa');
  } catch (err) {
    showToast('error', err.message);
  }
};
```

---

## ANTI-PATRONES (NO HACER)

| Error | Solución |
|-------|----------|
| `adminId` del cliente | Usar ctx.auth |
| localStorage | Convex query |
| fetch legacy | useMutation |
| confirm() | showToast |
| any implícito | Tipar explícitamente |

---

## DEPLOY

```bash
# Backend
npx convex deploy --typecheck=disable

# Frontend
npm run build
npx vercel --prod --yes
```

---

## RECURSOS

- Repos de referencia: `.agent/brain/repos/REPOSITORIOS.md`
- Skills: `.agents/skills/`
- Patterns: `.agente/tools/`

---

*Prompt generado: 2026-03-27*
*Para entrenar a BIG-PICKLE en el proyecto TradeShare*
