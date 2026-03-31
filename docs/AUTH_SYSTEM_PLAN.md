# Plan: Sistema de Login/Register Seguro (Convex + Web)

## Análisis del Sistema Actual

### Problemas Identificados:
1. ❌ Password almacenada en texto plano en `profiles.password`
2. ❌ No hay tabla separada para auth (users)
3. ❌ No hay tabla de sesiones
4. ❌ Sistema de registro manual sin hash
5. ❌ No hay rate limiting

### Lo que ya existe:
- ✅ Convex Auth (Auth.js) para OAuth (Google)
- ✅ Middleware `requireAuth` con JWT
- ✅ Tabla `profiles` con datos de usuario

---

## Plan de Implementación

### Fase 1: Schema (Días 1)

#### 1.1 Crear tabla `users` (Auth Core)
```typescript
users: defineTable({
  email: v.string(),
  passwordHash: v.string(),  // bcrypt hashed
  username: v.string(),
  role: v.number(),          // 0=free, 1=pro, 2=elite, etc.
  createdAt: v.number(),
  isVerified: v.boolean(),
  isBlocked: v.boolean(),
  lastLoginAt: v.optional(v.number()),
})
  .index("by_email", ["email"])
  .index("by_username", ["username"])
```

#### 1.2 Crear tabla `sessions`
```typescript
sessions: defineTable({
  userId: v.id("users"),
  token: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
})
  .index("by_token", ["token"])
  .index("by_user", ["userId"])
```

#### 1.3 Crear tabla `rate_limits`
```typescript
rate_limits: defineTable({
  identifier: v.string(),     // email, IP, etc.
  action: v.string(),       // "login", "register", etc.
  count: v.number(),
  windowStart: v.number(),
})
  .index("by_identifier", ["identifier", "action"])
```

---

### Fase 2: Backend Mutations (Días 2-3)

#### 2.1 Helper: getAuthUser(ctx)
- Leer header Authorization
- Buscar sesión válida en `sessions`
- Retornar usuario authenticado

#### 2.2 Mutation: register
```typescript
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),    // min 8 chars
    username: v.string(),   // alphanumeric + underscore
  },
  handler: async (ctx, args) => {
    // 1. Validar email格式
    // 2. Verificar que no existe usuario
    // 3. Hash password con bcrypt (salt 12)
    // 4. Crear usuario en tabla `users`
    // 5. Crear sesión
    // 6. Retornar token
  }
});
```

#### 2.3 Mutation: login
```typescript
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Buscar usuario por email
    // 2. Verificar password con bcrypt.compare
    // 3. Verificar que no está bloqueado
    // 4. Crear sesión
    // 5. Rate limiting check
    // 6. Retornar token
  }
});
```

#### 2.4 Mutation: logout
```typescript
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Eliminar sesión de la tabla
  }
});
```

#### 2.5 Mutation: verifySession
```typescript
export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Verificar que sesión existe y no expiró
  }
});
```

---

### Fase 3: Seguridad Avanzada (Días 4)

#### 3.1 Rate Limiting
- Limitar intentos de login: 5 por 15 minutos
- Limitar registros: 3 por hora por IP

#### 3.2 Validación de Input
- Email: formato válido
- Password: min 8 caracteres, 1 mayúscula, 1 número
- Username: 3-20 caracteres, alphanumeric + underscore

#### 3.3 Sanitización
- Usar validación de zod para todos los inputs

---

### Fase 4: Frontend Integration (Días 5-6)

#### 4.1 Auth Service
```typescript
// src/services/auth/authService.ts
export const authService = {
  async register(email, password, username)
  async login(email, password)
  async logout()
  async getCurrentUser()
  getToken() // localStorage.getItem('auth_token')
}
```

#### 4.2 Auth Context
- Crear AuthProvider en React
- Provee: user, login, logout, register, isAuthenticated

#### 4.3 Actualizar componentes
- LoginModal → usar nuevo auth service
- RegisterModal → usar nuevo auth service
- Navigation → mostrar según auth state

---

### Fase 5: Migración y Testing (Días 7)

#### 5.1 Migration Script
- Migrar usuarios existentes a tabla `users`
- Hash passwords con bcrypt
- NO migrar passwords en texto plano (forzar reset)

#### 5.2 Testing
- Login con credenciales correctas
- Login con credenciales incorrectas
- Rate limiting
- Expiración de sesión
- Logout

---

## Archivos a Crear/Modificar

### Nuevos Archivos
- `convex/auth/users.ts` - Tabla users y mutations
- `convex/auth/sessions.ts` - Tabla sessions
- `convex/auth/rateLimit.ts` - Rate limiting
- `src/services/auth/authService.ts` - Frontend auth service
- `src/contexts/AuthContext.tsx` - React auth context

### Archivos a Modificar
- `convex/schema.ts` - Añadir tablas
- `src/components/LoginModal.tsx` - Actualizar
- `src/components/RegisterModal.tsx` - Actualizar
- `src/components/Navigation.tsx` - Auth state

---

## Notas de Seguridad

1. **NUNCA** guardar passwords en texto plano
2. **USAR** bcrypt con salt 12
3. **RATE LIMIT** en login para prevenir brute force
4. **EXPIRAR** sesiones después de 7 días
5. **VALIDAR** todo input en el server
6. **USAR** HTTPS en producción

---

## Compatibilidad

- Mantener Convex Auth existente para OAuth (Google)
- Nuevo sistema solo para login/registro manual
- Perfiles siguen en tabla `profiles` (separación de concerns)
