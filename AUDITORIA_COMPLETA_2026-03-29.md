# 🔍 AUDITORÍA COMPLETA TRADESHARE 2.0
## Fecha: 2026-03-29
## Estado: CRÍTICO - BLOQUEO TOTAL DE AUTH

---

## 🚨 PROBLEMAS CRÍTICOS (BLOQUEANTES)

### 1. **LOGIN/REGISTRO ROTO** - SEVERIDAD: CRÍTICA
**Síntoma:** Error `[CONVEX A(auth:register)] Server Error`

**Causa Raíz:**
- Convex NO está autenticado localmente
- `convex.json` apunta a `tradeshare-pro` pero la URL es `notable-sandpiper-279.convex.site`
- Falta variable `VITE_CONVEX_URL` en `.env.local`
- Comando `npx convex env list` falla con 404

**Archivos Involucrados:**
- `convex.json` - project/trade mismatch
- `.env.local` - falta VITE_CONVEX_URL
- `src/config/urls.ts` - depende de env var no configurada
- `src/main.tsx` - lanza error si URL no está configurada

**Solución Inmediata:**
```bash
# 1. Autenticar Convex
npx convex auth login

# 2. Verificar deployment
npx convex deployment list

# 3. Agregar a .env.local:
VITE_CONVEX_URL=https://notable-sandpiper-279.convex.cloud

# 4. Deploy de funciones
npx convex deploy
```

---

### 2. **SEGURIDAD: CONTRASEÑAS EN TEXTO PLANO** - SEVERIDAD: CRÍTICA
**Problema:** `convex/authInternal.ts` guarda passwords hasheadas PERO el hash se hace en el cliente

**Riesgo:**
- Hash en cliente es inseguro (se puede interceptar password antes del hash)
- Passwords viajan como acción de Convex (potencialmente logs)

**Solución:**
- Mover TODO el hashing a server-side (ya está parcialmente hecho)
- Usar HTTPS obligatorio en producción (ya configurado en Vercel)
- Agregar rate limiting en login (parcialmente implementado)

---

### 3. **LOCALSTORAGE COMO FUENTE DE VERDAD** - SEVERIDAD: ALTA
**Encontrados 102 usos de localStorage** en:
- `src/services/authService.ts` - sesión de usuario
- `src/services/storage.ts` - datos de posts, users
- `src/services/users/userService.ts` - caché de usuarios
- `src/utils/sessionManager.ts` - gestión de sesión
- `src/utils/notificationCache.ts` - notificaciones

**Riesgo:**
- Datos no se sincronizan entre dispositivos
- Pérdida de datos si se limpia caché
- Inconsistencias cross-browser

**Solución:**
- Migrar TODO a Convex (ya hay migración en progreso TSK-042, TSK-049)
- Usar localStorage SOLO para caché efímero

---

## ⚠️ PROBLEMAS DE ARQUITECTURA

### 4. **MOCKS Y DATOS FALSOS ACTIVOS** - SEVERIDAD: ALTA
**Encontrados en TASK_BOARD.md:**
- TSK-043: News con `SAMPLE_NEWS`, `NOTICIAS_MOCK`, `mockAnalysis`
- TSK-044: Signals con feature flag hardcodeado `signalsFeatureEnabled = true`
- TSK-060: InstagramDashboard usa `StorageService` + localStorage
- TSK-061: CreatorDashboard con métricas estimadas

**Impacto:**
- Usuarios ven datos falsos en producción
- Analytics corruptos
- Toma de decisiones basada en datos incorrectos

---

### 5. **VALIDACIÓN DE AUTH INCONSISTENTE** - SEVERIDAD: ALTA
**Problema:** Algunas queries/mutations validan ownership, otras no

**Ejemplos encontrados:**
- ✅ `convex/payments.ts` - valida ownership en createCheckoutSession
- ✅ `convex/traderVerification.ts` - valida admin en getVerificationStatus
- ❌ `convex/signals.ts` - NO valida ownership en getUserSubscriptions
- ❌ `convex/posts.ts` - algunas mutations sin validación completa

**Riesgo:** Usuario puede acceder/modify datos de otros usuarios

---

### 6. **DEPENDENCIAS DE SERVICIOS EXTERNOS** - SEVERIDAD: MEDIA
**Servicios críticos sin fallback:**
- Google OAuth (login)
- MercadoPago (pagos)
- Convex (backend completo)
- Instagram Graph API
- HuggingFace (AI)

**Impacto:** Si uno cae, toda esa funcionalidad se rompe

**Solución:**
- Implementar circuit breakers
- Agregar degraded mode con datos en caché
- Health checks automáticos

---

## 📊 DEUDA TÉCNICA

### 7. **CÓDIGO LEGACY SIN LIMPIAR** - SEVERIDAD: MEDIA
**Encontrados:**
- `XXX.ts` - archivo con código de prueba
- `REPARACION LOGIN POST/` - carpeta con fixes temporales
- 224 comentarios `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`
- Funciones duplicadas (authService.ts vs services/auth/)

**Acción:**
- Eliminar archivos temporales
- Consolidar servicios duplicados
- Resolver o eliminar TODOs

---

### 8. **TIPOS Y CONTRATOS ROTOS** - SEVERIDAD: MEDIA
**Encontrado en análisis de código:**
- `tipo` legacy en postService.ts
- Contracts mismatch entre frontend/backend
- Índices de Convex faltantes para queries frecuentes
- Soft delete implementado pero no usado consistentemente

---

### 9. **PERFORMANCE SIN OPTIMIZAR** - SEVERIDAD: MEDIA
**Problemas:**
- Feed sin paginación real (carga todo)
- Queries sin `take` limit
- Sin índices compuestos
- Caché de feed implementado pero no siempre usado

**Impacto:**
- Feed lento con muchos posts
- Consultas a Convex costosas
- Experiencia de usuario pobre en móviles

---

## 🔐 SEGURIDAD

### 10. **CSP DEMASIADO PERMISIVO** - SEVERIDAD: MEDIA
**Problema:** Content-Security-Policy permite muchos dominios:
```
script-src: 'unsafe-inline' 'unsafe-eval' + 10 dominios externos
connect-src: 20+ dominios externos
```

**Riesgo:** XSS si algún dominio externo es comprometido

**Solución:**
- Remover 'unsafe-inline' y 'unsafe-eval'
- Reducir dominios externos al mínimo
- Usar nonces para scripts inline

---

### 11. **VARIABLES DE ENTORNO EXPLICITAS** - SEVERIDAD: ALTA
**Problema:** `.env.example` NO existía (creado en NTN-049)

**Estado:** ✅ RESUELTO - `.env.example` creado con 60+ variables

---

### 12. **SECRETOS EN CÓDIGO** - SEVERIDAD: CRÍTICA
**Encontrado en búsquedas:**
- Keys de API hardcodeadas en algunos servicios
- JWT_SECRET con fallback inseguro
- Keys de Supabase en código del cliente

**Solución:**
- Mover TODAS las keys a variables de entorno
- Rotar keys expuestas
- Usar secrets manager de Vercel/Convex

---

## 🎯 PRIORIDADES DE ARREGLO

### SEMA 1 (URGENTE - BLOQUEANTE):
1. ✅ **Arreglar Convex Auth** - Login/Registro funcional
2. **Rotar secrets expuestos** - Seguridad
3. **Validar ownership en TODAS las mutations** - Seguridad

### SEMA 2 (CRÍTICO):
4. **Migrar localStorage a Convex** - Consistencia de datos
5. **Eliminar mocks activos** - Datos reales en prod
6. **Implementar rate limiting real** - Prevenir abuso

### SEMA 3 (IMPORTANTE):
7. **Optimizar queries del feed** - Performance
8. **Agregar índices faltantes** - Performance
9. **Clean up de código legacy** - Mantenibilidad

### SEMA 4 (RECOMENDADO):
10. **Refinar CSP** - Seguridad
11. **Implementar circuit breakers** - Resiliencia
12. **Documentar arquitectura** - Onboarding

---

## 📈 MÉTRICAS DE CALIDAD ACTUALES

| Categoría | Estado | Score |
|-----------|--------|-------|
| **Auth** | 🔴 Roto | 0/10 |
| **Seguridad** | 🟡 Riesgo Alto | 4/10 |
| **Performance** | 🟡 Mejorable | 5/10 |
| **Consistencia** | 🔴 Crítico | 3/10 |
| **Mantenibilidad** | 🟡 Deuda | 5/10 |
| **Testing** | 🟢 OK | 8/10 (396 tests) |

**Overall: 4.2/10 - REQUIERE ATENCIÓN INMEDIATA**

---

## ✅ PLAN DE ACCIÓN INMEDIATO

### Paso 1: Arreglar Login/Registro (HOY)
```bash
# 1. Autenticar Convex
npx convex auth login

# 2. Verificar proyecto
npx convex deployment list

# 3. Agregar a .env.local
VITE_CONVEX_URL=https://notable-sandpiper-279.convex.cloud

# 4. Deploy
npx convex deploy
```

### Paso 2: Validar Auth (HOY)
- [ ] Probar registro con email nuevo
- [ ] Probar login con credentials
- [ ] Verificar sesión se guarda correctamente
- [ ] Testear logout

### Paso 3: Security Audit (MAÑANA)
- [ ] Revisar TODAS las mutations críticas
- [ ] Agregar validación de ownership
- [ ] Rotar secrets expuestos
- [ ] Implementar rate limiting

### Paso 4: Data Truth (SEMANA)
- [ ] Migrar localStorage restante a Convex
- [ ] Eliminar mocks de News, Signals, Instagram
- [ ] Conectar CreatorDashboard a datos reales

---

## 📝 NOTAS ADICIONALES

### Positivos del Proyecto:
- ✅ Testing robusto (396 tests passing)
- ✅ TypeScript bien implementado
- ✅ Convex como backend (buena elección)
- ✅ Arquitectura por dominios
- ✅ Documentación extensa (AGENTS.md, TASK_BOARD.md)

### Patrones Riesgosos:
- ⚠️ Demasiada lógica en el cliente
- ⚠️ Validaciones inconsistentes
- ⚠️ Fallbacks silenciosos a datos mock
- ⚠️ Errores tragados en lugar de logueados

### Recomendaciones:
1. **Usar Convex Actions para TODO** - No lógica de negocio en cliente
2. **Validar SIEMPRE en el backend** - Nunca confiar en el cliente
3. **Loguear errores reales** - No silent failures
4. **Tests E2E para flujos críticos** - Auth, pagos, posts

---

**Próxima Revisión:** 2026-04-05
**Responsable:** Team Lead (Antigravity)
**Estado:** 🔴 BLOQUEADO - Auth no funcional
