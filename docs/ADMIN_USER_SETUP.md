# Crear Usuario Admin - Guía Rápida

## Opción 1: Dashboard de Convex (RECOMENDADA)

1. Ve a https://dashboard.convex.dev
2. Selecciona tu deployment: `notable-sandpiper-279`
3. Ve a **Functions** → `profiles` → `createAdminSeed`
4. Click en **Run** (sin argumentos)
5. **Luego ejecuta el script para poner contraseña:**
   ```bash
   node scripts/set-admin-password.js "TuContraseña123!"
   ```
6. ¡Listo! El admin fue creado con tu contraseña

---

## Opción 2: Script Automático (MÁS FÁCIL)

```bash
# Ejecuta el script con tu contraseña deseada
node scripts/set-admin-password.js "MiContraseña123!"
```

**Esto automáticamente:**
- ✅ Crea el usuario admin si no existe
- ✅ Establece la contraseña encriptada
- ✅ Setea role=6 (SUPERADMIN)
- ✅ Te muestra las credenciales

---

## Opción 3: Registro Manual + Editar Role

1. **Regístrate en la app** con:
   - Email: `admin@tradeportal.com`
   - Contraseña: `TuContraseña123!` (la que quieras)
   - Usuario: `brai`

2. **Edita tu role en Convex:**
   - Ve a https://dashboard.convex.dev
   - Deployment: `notable-sandpiper-279`
   - **Data** → `profiles`
   - Busca tu usuario
   - Click **Edit**
   - Cambia:
     - `role: 6`
     - `rol: "admin"`
   - Click **Save**

---

## Credenciales por Defecto

Si usas el script sin argumentos:

| Campo | Valor |
|-------|-------|
| **Email** | `admin@tradeportal.com` |
| **Usuario** | `brai` |
| **Contraseña** | `Admin123!` |
| **Role** | 6 (SUPERADMIN) |

Si usas el script con tu contraseña:
```bash
node scripts/set-admin-password.js "MiPassword123!"
```
La contraseña será la que especificaste.
