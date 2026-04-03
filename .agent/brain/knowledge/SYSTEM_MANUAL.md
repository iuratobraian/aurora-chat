# 🗺️ MANUAL DE ARQUITECTURA Y PREVENCIÓN DE CAÍDAS (TradeShare)
*Mapa Conceptual para Agentes Autónomos*

Este manual permite a cualquier agente comprender rápidamente la anatomía de TradeShare y realizar diagnósticos al instante para mantener el sistema operando sin caídas ni pantallas blancas.

## 🏗️ MAPA CONCEPTUAL DEL SISTEMA

### 1. Capa de Presentación (Frontend)
- **Tecnología**: React 19 + Vite + Tailwind CSS v4.
- **Enrutamiento**: React Router Dom.
- **Regla de Supervivencia**: Si la UI se rompe, el usuario **NO** debe ver pantallas blancas. Usar `src/lib/fallback.ts` y `<ErrorBoundary>`. Nunca asumas que la carga es asíncrona perfecta.
- **Componentes Clave**: `Navigation.tsx`, `App.tsx`. *¡Peligro! Modificar con extrema cautela y probar exhaustivamente.*

### 2. Capa de Datos y Lógica (Backend)
- **Tecnología**: Convex (Serverless Realtime Database & Functions).
- **Control Central**: Carpeta `convex/`.
- **Regla de Supervivencia**: Todo `query` y `mutation` debe validar Identidad con `ctx.auth.getUserIdentity()`. No dejes queries desprotegidas.
- **Paginación Obligatoria**: Las lecturas masivas a DB deben usar índices (`.withIndex()`) y paginación para evitar la sobrecarga y caída del CPU.

### 3. Capa de Operaciones y Servicios Externos
- **Servidor Complementario**: `server.ts` (Express) - Maneja webhooks asíncronos que Convex no puede enrutar directamente de forma nativa (MercadoPago, Stripe, Meta GraphQL).
- **Regla de Supervivencia**: Errores en `server.ts` no deben crashear el servidor. Aplicar estrictamente `try/catch` globales y `serverLogger.ts`.

---

## 🛠️ MANUAL DE DIAGNÓSTICO RÁPIDO (TROUBLESHOOTING)

### 🚨 CASO 1: "Error 401 Unauthorized" o falla al conectar a Convex
- **CAUSA**: La llave de despliegue (`CONVEX_DEPLOY_KEY`) expiró o `.env.local` no cuadra.
- **SOLUCION**: 
  1. Revisar `.env.local`.
  2. Ejecutar `npx convex dev` para asegurar el flujo oclusión de variables, autenticar la consola local a la nube.

### 🚨 CASO 2: "Pantalla en Blanco" o Error de Renderización Infinita (Maximum update depth exceeded)
- **CAUSA**: Un hook (`useEffect`) modifique un estado dentro de una dependencia no memoizada, provocando renderizados ciclicos en loop.
- **SOLUCIÓN**: Usar `useCallback` en funciones. Cortar las devoluciones infinitas de callbacks de sesión. Asegurar que las views utilicen `<ErrorBoundary>`. 

### 🚨 CASO 3: Errores TypeScript bloqueantes (`tsc --noEmit` fails)
- **CAUSA**: Desincronización del esquema exportado entre la Base de datos y Tipos FronEnd (Ej. `convex/_generated`).
- **SOLUCIÓN**: Correr `npx convex dev` para re-generar esquema real. Adaptar Interfaces. **PROHIBIDO APAGAR CON `@ts-ignore`** si se trata de modelos core (users, communities, posts).

### 🚨 CASO 4: Pagos o Webhooks rotos o no procesados
- **CAUSA**: Server asíncrono crasheado o firmas de header incorrectas desde MercadoPago/Stripe.
- **SOLUCIÓN**: Revisar logs de Vercel/Node. Las firmas de webhooks tienen que ser validadas como *Buffer raw*, si metes body-parser a esa ruta, destruyes el HMAC de validación.

### 🚨 CASO 5: Desajuste de Pantallas Responsivas (Rompe UI Móbile)
- **CAUSA**: Hardcoding de pixeles en Tailwind (ej `w-[800px]`) o layout fallido de `flex`.
- **SOLUCIÓN**: Usar propiedades relativas del Design System de TradeShare, contenedores flex wrap y `max-w-7xl` con `w-full px-4`.
