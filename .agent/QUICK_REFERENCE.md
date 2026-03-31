# Referencia Rapida - TradeShare Platform

## Comandos Esenciales

```bash
# Desarrollo
npm run dev              # Iniciar dev server (puerto 5173)
npm run lint             # Verificar TypeScript
npm run build            # Build produccion

# Backend Convex
npx convex dev          # Iniciar dev server de Convex (requerido para datos)
npx convex codegen       # Regenerar tipos
npx convex data         # Ver/editar datos

# Git
git add . && git commit -m "mensaje" && git push
```

## Estructura de Componente

```tsx
import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'compact';
}

export const MiComponente: React.FC<Props> = ({ 
  title, 
  subtitle,
  variant = 'default' 
}) => {
  return (
    <div className={`
      glass rounded-2xl p-6 border border-white/10
      ${variant === 'compact' ? 'p-3' : 'p-6'}
    `}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </div>
  );
};
```

## Hooks de Convex

```tsx
// Queries (lectura)
const posts = useQuery(api.posts.list, { limit: 10 });
const user = useQuery(api.users.get, userId);

// Mutations (escritura)
const createPost = useMutation(api.posts.create);
const deletePost = useMutation(api.posts.delete);

// Uso en evento
<button onClick={() => createPost({ title: 'Nuevo' })}>
  Crear
</button>
```

## Glass Morphism Patrones

```tsx
// Card basica
<div className="glass rounded-xl p-5 border border-white/10">
  Contenido
</div>

// Card con hover
<div className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
  Contenido
</div>

// Input
<input 
  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
  placeholder="Escribe aqui..."
/>

// Boton primario
<button className="bg-primary hover:bg-blue-600 text-white rounded-xl font-bold px-6 py-3 shadow-lg shadow-primary/20 transition-all hover:scale-105">
  Accion
</button>

// Boton secundario
<button className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-4 py-2 border border-white/10 transition-all">
  Cancelar
</button>
```

## Colores Rapidos

| Variable | Hex | Uso |
|----------|-----|-----|
| primary | #3b82f6 | Botones, links |
| signal-green | #10b981 | Ganancias, exito |
| alert-red | #ef4444 | Perdidas, errores |
| bg-dark | #050608 | Fondo |
| glass-bg | rgba(255,255,255,0.05) | Cards |

## Lazy Loading Vistas

```tsx
// En App.tsx
import { lazy, Suspense } from 'react';

const NuevaVista = lazy(() => import('./views/NuevaVista'));

// En JSX
<Suspense fallback={<LoadingSpinner />}>
  <NuevaVista />
</Suspense>
```

## Variables de Entorno Requeridas

```env
# .env.local (NO COMMITIR)
GEMINI_API_KEY=xxx
CONVEX_DEPLOYMENT=xxx
EXNESS_API_KEY=xxx
STRIPE_SECRET_KEY=xxx
```

## Errores Comunes

| Error | Solucion |
|-------|----------|
| `useQuery() called in non-reactive context` | Usar dentro de componente React |
| `Module not found: convex` | Ejecutar `npx convex dev` |
| Build fail en Vercel | Verificar variables de entorno en dashboard |
| Datos no cargan | Verificar conexion a `rapid-rabbit-951` |
