# CURRENT FOCUS - OpenCode

## ⚠️ BLOCKER - NOTION-012: Deploy Convex

### Bloqueo Identificado:
**Problema:** Falta `CONVEX_DEPLOY_KEY` en .env.local
**Impacto:** No se pueden generar archivos _generated ni desplegar a Convex

### Configuración Actual:
```
CONVEX_URL=https://diligent-wildcat-523.convex.cloud
VITE_CONVEX_URL=https://diligent-wildcat-523.convex.cloud
CONVEX_DEPLOY_KEY=❌ NO CONFIGURADA
```

### Solución Requerida:
1. Ir a https://dashboard.convex.dev/diligent-wildcat-523
2. Settings → Deployment → Deploy Key
3. Copiar clave y agregar a `.env.local`:
   ```
   CONVEX_DEPLOY_KEY=xxxxx:xxxxx-xxxxx-xxxxx-xxxxx
   ```
4. Ejecutar `npx convex dev` para generar _generated
5. Ejecutar `npx convex deploy` para desplegar schema

---

## Alternative: Working Without Convex Generation

Mientras se resuelve el bloqueo, se puede:
1. Usar el modo offline con datos mock
2. El frontend ya tiene fallback a localStorage
3. Los servicios detectan automáticamente si Convex está disponible

---

## Next Available Tasks (Sin Bloqueo Convex):

**NOTION-014: Registro — validar email, password, username** [PENDING]
- Validaciones en frontend (sin necesidad de Convex)
- Archivos: `src/views/AuthView.tsx`, `src/services/auth.ts`

**NOTION-015: Login JWT — verificar tokens** [PENDING]
- Verificación de firma JWT en server.ts
- Archivos: `server.ts`, `src/services/auth.ts`

---
*Status: Awaiting user to provide CONVEX_DEPLOY_KEY from Convex dashboard*
