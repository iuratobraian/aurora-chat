# TradeShare - Lista de Tareas

## 🚨 PRIORIDAD ALTA - BUGS CRÍTICOS

### 1. Loader Doble
- [x] El loader aparece dos veces al iniciar - **CORREGIDO**
- **Archivo**: `App.tsx`
- **Solución**: Flujo unificado - Welcome 2s → Frase 2.5s → Done

### 2. Error Convex chat:getChannels
- [x] Función deployada y funcionando
- **Verificado**: Deploy de Convex completado

### 3. Widget TradingView
- [x] Error cross-origin - **CORREGIDO**
- **Solución**: Reemplazado con ticker CSS personalizado

### 4. Usuario Desconocido al Publicar
- [x] Fix - Corregido fallback de nombre de usuario - **CORREGIDO 19/03**
- **Archivos**: `convex/posts.ts`
- **Solución**: Ahora intenta buscar en post.nombreUsuario y post.usuarioManejo si profile no existe

---

## 🔒 MEJORAS DE SEGURIDAD (19/03/2026)

### Completadas ✅
- [x] **S1**: API Key ImgBB eliminada del código hardcodeado
- [x] **S2**: MOCKED_AUTH reemplazado con `ctx.auth.getUserIdentity()` (17 locations)
- [x] **S3**: Comentarios con passwords históricos eliminados
- [x] **S4**: Hash contraseñas con Web Crypto API (PBKDF2 - compatible Convex)
- [x] **S5**: CSP Headers en vite.config.ts + vercel.json
- [x] **T4**: Notificaciones Push mejoradas con autenticación
- [x] **T5**: Chat Moderation con censura automática

---

## 🎯 FEATURES IMPLEMENTADAS (Verificar)

### Pagos
- [x] Orquestador de pagos (placeholders)
- [ ] Integrar MercadoPago real (requiere API key)
- [ ] Integrar Zenobank real (requiere API key)

### Comunidad
- [x] Sistema de logros (30 achievements)
- [x] Chat en tiempo real
- [x] Moderación anti-spam
- [x] Posts IA estilo noticia informativa (AIAgentFeed.tsx)

### UI/UX
- [x] Loader con frases de traders
- [x] Tema claro/oscuro
- [x] Navigation moderna con dropdowns
- [x] FloatingBar con TV player
- [x] Publicidades estilo VIP glass
- [x] Popup publicidad curso

### Admin
- [x] Panel completo con 8 secciones
- [x] Gestión de usuarios
- [x] CRUD publicidades
- [x] CRUD comunidades
- [x] AI Agent para noticias
- [x] Moderación visible (ModerationPanel.tsx enhanced)

---

## 📋 TAREAS PARA AGENTE EXTERNO

### Bugs a Corregir
1. **Doble loader** - Investigar y corregir
2. **Tema claro** - Verificar que funcione completamente
3. **Popup perfil** - Posición y auto-close
4. **Widget TradingView** - Corregir cross-origin

### Mejoras UI
1. **Admin Panel** - Simplificar, menos colores
2. **Posts IA** - Estilo noticia informativa
3. **Responsive** - Verificar mobile

### Documentación
1. [x] Guía para agente externo - `.agent/EXTERNAL_AGENT_GUIDE.md`
2. [x] Referencia rápida - `.agent/QUICK_REFERENCE.md`
3. [x] Sistema de diseño - `.agent/skills/DESIGN_SYSTEM.md`

---

## 🔧 CONFIGURACIÓN PENDIENTE

### Variables de Entorno Necesarias
```bash
# MercadoPago
VITE_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=

# Zenobank
ZENOBANK_API_KEY=

# SendGrid
SENDGRID_API_KEY=

# Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# App URLs
VITE_APP_URL=https://tradeportal-2025-platinum.vercel.app
VITE_API_URL=https://tradeportal-2025-platinum.vercel.app
```

### Para Generar VAPID Keys
```bash
npx web-push generate-vapid-keys
```

---

## 📊 ESTADO ACTUAL

| Componente | Estado | Notas |
|------------|--------|-------|
| Frontend | ✅ OK | Build exitoso |
| Backend (Convex) | ✅ OK | Deployado |
| Auth | ⚠️ Testing | Verificar emails |
| Chat | ⚠️ Testing | getChannels deployado |
| Pagos | 🔧 Placeholder | Esperando API keys |
| Loaders | ✅ FIXED | Flujo unificado single loader |
| Tema | ✅ FIXED | Toggle funcional + paleta Apple |

---

## 🚀 PRÓXIMOS PASOS

1. [ ] Corregir bugs de loader y tema
2. [ ] Test completo de autenticación
3. [ ] Conectar APIs reales de pago
4. [ ] Test de chat en tiempo real
5. [ ] Optimizar performance

---

## 📁 ESTRUCTURA DE ARCHIVOS CLAVE

```
tradeportal-2025-platinum/
├── App.tsx                    # Router principal
├── index.tsx                  # Entry point
├── components/
│   ├── Navigation.tsx         # Menú principal
│   ├── ElectricLoader.tsx     # Loader
│   ├── FloatingBar.tsx        # Barra flotante
│   └── PostCard.tsx           # Cards de posts
├── views/
│   ├── ComunidadView.tsx      # Feed principal
│   ├── AdminView.tsx          # Panel admin
│   └── PerfilView.tsx         # Perfil usuario
├── convex/
│   ├── schema.ts              # DB schema
│   ├── chat.ts                # Chat queries
│   └── payments.ts           # Pagos
└── .agent/                    # Docs para agentes
    ├── EXTERNAL_AGENT_GUIDE.md
    ├── QUICK_REFERENCE.md
    └── skills/
        └── DESIGN_SYSTEM.md
```
