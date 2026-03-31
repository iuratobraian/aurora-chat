# 🔴 QA REAL - Smoke Test en Producción

> Pasos de verificación para ejecutar en producción

## Entorno de Prueba
- **URL:** https://tradeportal.vercel.app
- **Convex Prod:** notable-sandpiper-279

---

## VISTAS A VERIFICAR

### 1. Login/Auth
- [ ] Login con Google OAuth funciona
- [ ] Login con email/password funciona
- [ ] Logout funciona
- [ ] Sesión persiste al recargar

### 2. Feed
- [ ] Posts cargan desde Convex (no localStorage)
- [ ] Likes se actualizan en tiempo real
- [ ] Infinite scroll/paginación funciona
- [ ] Pull-to-refresh funciona

### 3. Comunidades
- [ ] Lista de comunidades carga
- [ ] Unirse a comunidad funciona
- [ ] Posts en comunidad aparecen
- [ ] Leaderboard de comunidad carga

### 4. Marketplace
- [ ] Productos cargan (no window.convex)
- [ ] Filtros funcionan
- [ ] Buscador funciona
- [ ] Guest puede ver productos

### 5. Señales (SignalsView)
- [ ] Señales cargan (TSK-044 resuelta)
- [ ] Planes muestran precios correctos
- [ ] Botón de suscripción funciona

### 6. Noticias (NewsView)
- [ ] Feed de noticias carga (TSK-043/058)
- [ ] Calendario económico carga
- [ ] No hay fallback silencioso a datos demo

### 7. Creator
- [ ] Creator Dashboard carga datos reales (TSK-041/061)
- [ ] Analytics muestran métricas reales
- [ ] Perfil público carga desde Convex (TSK-046)

### 8. Admin
- [ ] Panels cargan con datos de Convex (TSK-042)
- [ ] No hay localStorage como source
- [ ] Validación admin funciona
- [ ] Ads, AI Agent, Referrals operativos

### 9. Instagram (TSK-040/060)
- [ ] Conexión con Instagram funciona
- [ ] Dashboard muestra cuenta conectada
- [ ] Publicación programada funciona

### 10. Pagos
- [ ] Pricing muestra planes correctos
- [ ] Checkout redirecciona a MercadoPago
- [ ] Webhook actualiza subscription
- [ ] UserWallet muestra balance correcto

---

## VERIFICACIONES TÉCNICAS

### Console Errors
```javascript
// En browser console:
window.addEventListener('error', (e) => console.error(e.error))
```

### Network Calls
```javascript
// Verificar que NO hay llamadas a:
// - localStorage.getItem
// - StorageService.get
// - window.convex

// Verificar que SÍ hay llamadas a:
// - /api/convex/ (queries y mutations)
// - Convex client
```

---

## COMMANDOS DE VERIFICACIÓN LOCAL

```bash
# Verificar build
npm run build

# Verificar lint
npm run lint

# Verificar tests
npm test
```

---

## REPORTE DE BUGS

Para cada bug encontrado, documentar:
1. **Vista:** Donde ocurrió
2. **Pasos:** Cómo reproducir
3. **Esperado:** Qué debería pasar
4. **Actual:** Qué está pasando
5. **Screenshot:** Si es posible

---

*QA Real - 2026-03-27*
*Auditor: BIG-PICKLE*
