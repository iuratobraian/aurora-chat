# 📋 QA CHECKLIST - Cross-Section Verification

> Checklist para verificar el estado de salud de las vistas principales

---

## VISTAS A VERIFICAR

### 1. AdminView
**Archivo:** `src/views/AdminView.tsx`

| Check | Estado | Notas |
|-------|--------|-------|
| Queries Convex implementadas | ✅ | usa api.ads, api.aiAgent, etc. |
| Paginación en tablas | ⚠️ | Verificar con datos reales |
| showToast en vez de alert | ✅ | Corregido en tareas previas |
| No localStorage como source | ✅ | Validado en TSK-042 |
| Validación admin en mutations | ✅ | getCallerAdminStatus en todos |

**Verificación manual:**
1. Abrir AdminView con usuario admin
2. Verificar que panels cargan datos
3. Verificar que no-admin no puede acceder

---

### 2. PerfilView
**Archivo:** `src/views/PerfilView.tsx`

| Check | Estado | Notas |
|-------|--------|-------|
| Queries Convex implementadas | ✅ | usa api.profiles, api.achievements |
| No localStorage como source | ⚠️ | Auditar PostService/UserService |
| showToast en vez de alert | ✅ | Verificar |
| Paginación en historial | ⚠️ | Verificar con muchos datos |

**Verificación manual:**
1. Abrir PerfilView de usuario
2. Verificar achievements cargan
3. Verificar historial de suscripciones

---

### 3. MarketplaceView
**Archivo:** `src/views/MarketplaceView.tsx`

| Check | Estado | Notas |
|-------|--------|-------|
| Queries Convex (no window.convex) | ✅ | Corregido en TSK-053 |
| Leaderboard de vendedores | ⚠️ | Verificar convex/strategies.ts |
| Guest flow operativo | ✅ | Verificar |
| Paginación en productos | ⚠️ | Verificar |

**Verificación manual:**
1. Abrir Marketplace como guest
2. Navegar entre categorías
3. Verificar filtros funcionan

---

### 4. ComunidadView
**Archivo:** `src/views/ComunidadView.tsx`

| Check | Estado | Notas |
|-------|--------|-------|
| No fallback local 5s | ✅ | Corregido en TSK-050 |
| Cloud-first data | ✅ | Source de Convex |
| Post/Like/Follow reactivo | ✅ | Cross-browser consistency |
| Paginación en posts | ⚠️ | Verificar Convex paginated query |

**Verificación manual:**
1. Abrir comunidad
2. Crear post y verificar aparece
3. Dar like y verificar contador
4. Hacer follow y verificar estado

---

## QUICK VERIFICATION COMMANDS

```bash
# Verificar que no hay localStorage como source
grep -r "localStorage" src/views/AdminView.tsx
grep -r "localStorage" src/views/PerfilView.tsx
grep -r "localStorage" src/views/MarketplaceView.tsx

# Verificar que usan api. en vez de window.convex
grep -r "window.convex" src/views/MarketplaceView.tsx

# Verificar showToast en vez de alert
grep -r "alert(" src/views/AdminView.tsx
grep -r "alert(" src/views/PerfilView.tsx
```

---

## ISSUES CONOCIDOS (Documentar aquí)

### AdminView
- [ ] Verificar AdsPanel carga correctamente
- [ ] Verificar AI Agent controls operativos

### PerfilView
- [ ] Verificar que Achievements se cargan desde Convex
- [ ] Verificar historial de compras real

### MarketplaceView
- [ ] Verificar leaderboard con datos reales
- [ ] Verificar guest flow completo

### ComunidadView
- [ ] Verificar paginación con >20 posts
- [ ] Verificar consistencia cross-browser

---

## PROCEDIMIENTO DE VERIFICACIÓN

1. **Login** como usuario de prueba
2. **Navegar** a cada vista
3. **Verificar** que los datos cargan desde Convex
4. **Probar** funcionalidades principales
5. **Documentar** cualquier issue encontrado

---

*Última actualización: 2026-03-27*
*Auditor: BIG-PICKLE*
