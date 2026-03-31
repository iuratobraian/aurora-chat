# 🔧 CONFIGURACIÓN DE CONVEX - SOLUCIÓN

## 🚨 PROBLEMA DETECTADO

El deploy de Convex no se está ejecutando porque **no estás autenticado** en el proyecto nuevo `diligent-wildcat-523`.

**Error:**
```
✖ You don't have access to the selected project. Run `npx convex dev` to select a different project.
```

---

## ✅ SOLUCIÓN PASO A PASO

### **Paso 1: Iniciar sesión en Convex**

```bash
npx convex login
```

Esto abrirá el navegador para que te autentiques.

---

### **Paso 2: Seleccionar el proyecto correcto**

```bash
npx convex dev
```

Cuando te pregunte, seleccioná el proyecto:
```
diligent-wildcat-523
```

---

### **Paso 3: Verificar que estás en el proyecto correcto**

```bash
npx convex env list
```

Debería mostrar las variables de entorno del proyecto `diligent-wildcat-523`.

---

### **Paso 4: Hacer el deploy**

```bash
npx convex deploy
```

Esto subirá todas las tablas y funciones al proyecto correcto.

---

## 📋 URLs CORRECTAS

### **Producción (USAR ESTA)**
```
Cloud URL: https://diligent-wildcat-523.convex.cloud
Site URL: https://diligent-wildcat-523.convex.site
Dashboard: https://dashboard.convex.dev/d/diligent-wildcat-523
```

### **Development (NO USAR)**
```
❌ https://shiny-rabbit-21.convex.cloud
❌ https://notable-sandpiper-279.convex.cloud
```

---

## 🔍 VERIFICACIÓN POST-DEPLOY

### **1. Verificar tablas en el dashboard**

1. Ir a: https://dashboard.convex.dev/d/diligent-wildcat-523
2. Iniciar sesión
3. Ir a la pestaña "Database"
4. Deberías ver **54 tablas** creadas

### **2. Verificar desde la consola del navegador**

```javascript
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api';

const convex = new ConvexHttpClient('https://diligent-wildcat-523.convex.cloud');

// Listar usuarios (debería funcionar si las tablas existen)
const users = await convex.query(api.profiles.listUsers, { limit: 5 });
console.log('Usuarios:', users);

// Listar posts
const posts = await convex.query(api.posts.getPosts, { limit: 5 });
console.log('Posts:', posts);
```

---

## 📊 TABLAS QUE DEBERÍAN CREARSE

Al hacer el deploy, deberías ver estas 54 tablas en el dashboard:

1. profiles
2. posts
3. postComments
4. postInteractions
5. postMetrics
6. signals
7. signalSubscriptions
8. signalUpdates
9. signalResults
10. subscriptions
11. communities
12. subcommunities
13. communityMembers
14. communityPlans
15. products
16. purchases
17. productReviews
18. creatorEarnings
19. strategyPurchases
20. strategies
21. payments
22. paymentWebhooks
23. achievements
24. leaderboards
25. xpTransactions
26. prizeRedemptions
27. notifications
28. pushSubscriptions
29. courses
30. classes
31. enrollments
32. bitacora
33. gazette
34. news
35. ads
36. adEvents
37. follows
38. messages
39. conversations
40. instagram_accounts
41. instagram_posts
42. referrals
43. userSettings
44. userMeta
45. config
46. featureFlags
47. auditLogs
48. backups
49. backupItems
50. emergencySettings
51. analytics
52. userSignals
53. marketAnalytics
54. chat

---

## 🎯 COMANDOS RÁPIDOS

```bash
# 1. Login
npx convex login

# 2. Seleccionar proyecto
npx convex dev

# 3. Deploy
npx convex deploy

# 4. Verificar
npx convex env list
```

---

## ⚠️ POSIBLES ERRORES

### **Error: "Project not found"**

**Causa:** No estás logueado o no tenés permisos en el proyecto.

**Solución:**
1. Asegurate de estar logueado: `npx convex login`
2. Verificá que tenés permisos en el dashboard de Convex
3. Si es un proyecto nuevo, asegurate de haberlo creado

### **Error: "Team exceeded Free plan limits"**

**Causa:** El equipo `tradeshare-pro` superó los límites del plan gratuito.

**Solución:**
1. Ir a: https://dashboard.convex.dev/t/tradeshare-pro
2. Eliminar proyectos viejos que no se usan
3. O hacer upgrade al plan Pro

### **Error: "TypeScript errors"**

**Causa:** Hay errores de TypeScript en el código.

**Solución:**
```bash
# Deploy ignorando errores de TS
npx convex deploy --typecheck=disable
```

---

## 📞 SOPORTE

Si después de seguir estos pasos todavía no ves las tablas:

1. **Verificar login:**
   ```bash
   npx convex whoami
   ```

2. **Listar proyectos disponibles:**
   ```bash
   npx convex list
   ```

3. **Forzar selección de proyecto:**
   ```bash
   npx convex dev --prod
   ```

4. **Ver logs del deploy:**
   ```bash
   npx convex deploy --verbose
   ```

---

**Última actualización:** 2026-03-30 23:15 UTC  
**Estado:** ⚠️ **ESPERANDO LOGIN DEL USUARIO**
