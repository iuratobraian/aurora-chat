# 🚨 PROTOCOLO DE EMERGENCIA: FIX LOGIN & UI (Fase Crítica)

Este plan de trabajo está diseñado para ser ejecutado de inmediato por **2 Agentes Externos**. La prioridad absoluta es restaurar el acceso de usuarios (Login) y la carga correcta de la interfaz (Iconos faltantes).

---

## 👨‍💻 AGENTE 1: BACKEND & INFRAESTRUCTURA (Foco: Login Roto)

**Objetivo Principal:** Identificar por qué el usuario no puede iniciar sesión desde otro dispositivo y solucionar el bloqueo.

### 📝 Lista de Tareas (Agent-1):
1. **Auditoría de Logs en Convex Dashboard:**
   - Entrar al panel de Convex (`https://dashboard.convex.dev`) y revisar la pestaña **Logs**.
   - Intentar iniciar sesión en el frontend y observar qué mutation falla (`profiles:login`, `profiles:getUser`, etc.).
   - *Hipótesis:* Puede haber una discrepancia de esquema silenciada (ej. un campo `streakDays` o `referral` que es requerido pero el frontend envía incompleto) o un problema con la sanitización de passwords.

2. **Revisión del Flujo `services/storage.ts` y `sessionManager.ts`:**
   - Verificar la función de login en el frontend. ¿Está guardando correctamente el token/sesión en el `localStorage` del nuevo dispositivo?
   - Confirmar si se está llamando a `clearSecureSession()` erróneamente durante o antes del inicio de sesión, borrando el estado recién creado.

3. **Validación de CORS y CSP (Convex Connectivity):**
   - Asegurar que la directiva `connect-src` en `index.html` y `vite.config.ts` no esté bloqueando llamadas WebSocket `wss://*.convex.cloud` de forma estricta por alguna actualización reciente de Vite.

---

## 🎨 AGENTE 2: FRONTEND & UI (Foco: Iconos Faltantes y Errores de Consola)

**Objetivo Principal:** Restaurar la visualización de los iconos de la plataforma y limpiar la consola de errores estáticos.

### 📝 Lista de Tareas (Agent-2):
1. **Solucionar Iconos Invisibles (Material Symbols):**
   - **Diagnóstico:** Los iconos cargan como texto (ej. sale la palabra "home" o "person" en vez del icono). Esto ocurre porque la fuente `Material Symbols Outlined` no se está descargando/aplicando.
   - **Fix CSP:** Revisar en la consola del navegador (`F12` -> Console/Network) si hay un error de `Content-Security-Policy` bloqueando `https://fonts.gstatic.com`. Específicamente, asegurarse de que `font-src` incluye `https://fonts.gstatic.com` y `style-src` incluye `https://fonts.googleapis.com`.
   - **Fix CSS:** Revisar si en `index.css` o en Tailwind se borró accidentalmente la clase base `.material-symbols-outlined { font-family: 'Material Symbols Outlined'; }`.

2. **Reparar Errores Residuales de Consola (Cursor & CSP):**
   - **Vercel Live:** El error `Framing 'https://vercel.live/' violates the following Content Security Policy` necesita que en el `<meta http-equiv="Content-Security-Policy">` del _index.html_ se modifique `frame-src` para incluir de forma explícita `https://vercel.live`. *(Nota: `frame-ancestors` no funciona en meta tags, debe removerse del HTML y configurarse en `vercel.json` o dejarse ignorado)*.
   - **Paginación Post-Deploy:** Revisar que el parche implementado recientemente en `ComunidadView.tsx` (`cursor: cursor ?? undefined` o `cursor !== null ? cursor : undefined`) esté funcionando y no arroje más el error `ArgumentValidationError` de Convex.

### 🚀 Instrucciones de Despliegue Paralelo:
- **Agente 1** trabaja en `convex/profiles.ts`, `services/storage.ts` y revisión de DB remota.
- **Agente 2** trabaja en `index.html`, `vite.config.ts`, e `index.css`.
- **Ambos** deben correr `npm run dev` localmente, intentar replicar el fallo exacto en consola, repararlo, y luego unificar código para hacer `npx convex deploy -y` y `git push` final.
