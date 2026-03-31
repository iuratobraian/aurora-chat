# 🔴 QA WAVE 2 - Smoke Test Específico

> Verificación detallada de vistas adicionales

---

## VISTAS A VERIFICAR

### 1. AdminView
- [ ] Ads Panel carga correctamente
- [ ] AI Agent controls operativos
- [ ] No hay localStorage como source

### 2. PerfilView
- [ ] Guest puede ver perfil público
- [ ] Usuario puede editar su perfil
- [ ] Logros cargan desde Convex

### 3. MarketplaceView
- [ ] Guest flow operativo
- [ ] Productos cargan correctamente
- [ ] Filtros funcionan

### 4. ComunidadView
- [ ] Posts cargan desde Convex
- [ ] Likes se actualizan
- [ ] Unirse/salir funciona

### 5. CommunityDetailView
- [ ] Detalles de comunidad cargan
- [ ] Miembros se muestran
- [ ] Posts de comunidad aparecen

### 6. DiscoverCommunities
- [ ] Comunidades recomendadas cargan
- [ ] Búsqueda funciona
- [ ] Crear comunidad accesible

### 7. PricingView
- [ ] Planes se muestran correctamente
- [ ] Precios correctos
- [ ] Botón de compra funciona

### 8. UserWallet
- [ ] Balance se muestra
- [ ] Historial de transacciones
- [ ] Depósitos funcionan

---

## VERIFICACIONES ESPECÍFICAS

### Guest Flow
1. Abrir app sin login
2. Navegar a cada vista
3. Verificar que contenido público carga
4. Verificar que acciones protegidas piden login

### Permisos
1. Login como usuario normal
2. Intentar acceder a Admin
3. Verificar que se deniega acceso

### Sync Cloud
1. Crear contenido
2. Recargar página
3. Verificar que datos persisten (no localStorage)

---

*QA Wave 2 - 2026-03-27*
*Auditor: BIG-PICKLE*
