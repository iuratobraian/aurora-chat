# TradeHub - Base de Conocimiento de Desarrollo

## Sesión: 20-21 Marzo 2026

---

## 1. Branding: TradeShare → TradeHub

### Archivos modificados:
- `components/SEO.tsx` - Título SEO
- `App.tsx` - Header de navegación
- `views/ComunidadView.tsx` - Mensaje de bienvenida
- `components/OnboardingFlow.tsx` - Onboarding
- `components/ReferralPanel.tsx` - Texto de referido
- `views/comunidad/LiveTVSection.tsx` - TV en vivo
- `components/mobile/MobileInstallPrompt.tsx` - Instalación PWA
- `components/Footer.tsx` - Footer
- `public/logo.svg` - **NUEVO** logo TradeHub
- `public/icons/icon-192.svg` - Icono PWA actualizado
- `index.html` - Meta tags y título
- `public/manifest.json` - Nombre de la app

### Logo TradeHub:
- Diseño: Hub central con satélites conectados
- Colores: Gradiente azul (#3b82f6) → violeta (#8b5cf6) → rosa (#ec4899)
- Centro con rayo como referencia a "TradeHub"
- Icono PWA: Fondo oscuro con el mismo estilo energético

---

## 2. WelcomeIntro - Simplificación

**Problema:** El mensaje de bienvenida tenía cajas, gradientes y mucho peso visual.

**Solución:** 
- Solo mostrar loader circular + texto
- Sin cajas ni elementos decorativos
- Más espacio (pt-20 para no pegarse al header)
- Texto de quotes trader centrado

**Archivo:** `components/WelcomeIntro.tsx`

---

## 3. ElectricLoader - Tiempo de Carga

**Problema:** Al navegar entre secciones, el loader no duraba lo suficiente para leer el contenido.

**Solución:**
- Añadido array de mensajes rotativos:
  - "Conectando con los mercados..."
  - "Sincronizando datos en tiempo real..."
  - "Cargando análisis institucionales..."
  - "Preparando tu experiencia..."
  - "Estableciendo conexión segura..."
- Barra de progreso animada
- Tipografía más grande y visible
- Cambio de mensaje cada 4 segundos

**Archivo:** `components/ElectricLoader.tsx`

---

## 4. Iconos con Font Display: Block

**Problema:** Los iconos de Material Symbols cargaban antes que el texto, causando roturas visuales.

**Solución:**
1. `index.html` - Cambiar a `display=block` y preload asíncrono:
```html
<link rel="preload" as="style" href="...Material+Symbols...=block" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="...display=block"></noscript>
```

2. `index.css` - Añadir estilos anti-layout-shift:
```css
.material-symbols-outlined {
  width: 1em;
  height: 1em;
  contain: layout style;
}
```

3. `Navigation.tsx` - Simplificar dropdowns:
- Remover icono de flecha que causaba parpadeo
- Iconos más pequeños (text-base en vez de text-lg)

**Archivos:** `index.html`, `index.css`, `components/Navigation.tsx`

---

## 5. YouTube CSP - Videos Bloqueados

**Problema:** "Este contenido está bloqueado" en videos de YouTube embebidos.

**Solución:** Actualizar CSP en dos lugares:

### vite.config.ts:
```typescript
"script-src": "... https://www.youtube.com https://www.youtube-nocookie.com",
"media-src": "... https://www.youtube.com https://www.youtube-nocookie.com",
"connect-src": "... https://www.youtube.com https://www.youtube-nocookie.com https://img.youtube.com",
"frame-src": "... https://www.youtube.com https://www.youtube-nocookie.com https://players.youtube.com"
```

### vercel.json:
Misma configuración en headers de Vercel para producción.

**Archivos:** `vite.config.ts`, `vercel.json`

---

## 6. Diseño Visual Unificado

**Problema:** Demasiados colores, gradientes mezclados, estilos inconsistentes entre componentes.

**Referencia:** PostCards de la comunidad (estilo limpio y simple).

### Componentes actualizados:

#### SidebarCommunitiesSection
- Removido gradiente púrpura/rosa
- Fondo: `bg-white dark:bg-black/40`
- Títulos: `text-gray-500` (no colores)
- Iconos: `bg-primary/10`

#### Sidebar (Filtros)
- Borde: `border-gray-100 dark:border-white/5`
- Tags sin colores excesivos
- Separador sutil entre secciones

#### DailyPollWidget
- Estilo glass simple
- Botones: verde/rojo simples (no gradientes)
- Sin sombras exageradas

#### SidebarAdSection
- Fondo limpio
- Botones sin `shadow-lg`

#### DiscoverCommunities
- Cards: `bg-white dark:bg-black/40`
- Sin `shadow-xl shadow-primary/10`
- Gap reducido (6 → 4px)
- Botones simples

### Paleta de referencia:
```
Fondo: bg-white dark:bg-black/40
Borde: border-gray-100 dark:border-white/5
Texto secundario: text-gray-500 dark:text-gray-400
Primario: text-primary
Éxito: text-signal-green
Radio: rounded-2xl
```

---

## 7. Padding Superior - Títulos Pegados

**Problema:** Los títulos quedaban muy pegados al header fixed.

**Solución:** Cambiar de `py-8` a `pt-20` en:
- `ComunidadView.tsx`
- `DiscoverCommunities.tsx`

---

## 8. Estructura de Comunidades

### Modelo decidido:
- **Comunidad principal:** Gratis (acceso libre)
- **Subcomunidades:** Privadas, con membresías de pago
- **Señales:** Posts especiales con distribución por membresía (beneficios según tier)

### Archivos relacionados:
- `convex/schema.ts` - Definición de tables
- `convex/communities.ts` - Lógica de comunidades
- `views/ComunidadView.tsx` - Vista principal
- `views/DiscoverCommunities.tsx` - Descubrimiento
- `views/subcommunity/*` - Subcomunidades

---

## 9. Señales como Posts Especiales

**Concepto:** Las señales son posts que:
- Van al feed del portal
- También tienen su propio espacio dedicado
- Se distribuyen según membresías (cantidad diaria por tier)

**Estructura:**
- Tabla `signals` en schema
- Distribución por niveles de membresía
- Beneficios: cantidad de señales diarias según plan

---

## 10. Errores Comunes y Soluciones

### Error: Iconos parpadeantes
**Causa:** Material Symbols cargando asíncronamente
**Solución:** `font-display: block` + preload + tamaño fijo

### Error: Videos YouTube bloqueados
**Causa:** CSP no incluye dominios de YouTube
**Solución:** Añadir youtube.com a frame-src, media-src, connect-src, script-src

### Error: Layout shifts en navegación
**Causa:** Iconos sin tamaño fijo
**Solución:** `width: 1em; height: 1em; contain: layout style`

### Error: Títulos pegados al header
**Causa:** Falta padding-top
**Solución:** Usar `pt-20` en lugar de `py-8`

---

## 11. Comandos de Verificación

```bash
# Build
npm run build

# Deploy
git push
npx convex deploy -y

# Verificar lint
npm run lint
```

---

## 12. Archivos Clave Marcados

### NO MODIFICAR (Hard guardrail según AGENTS.md):
- `App.tsx`
- `Navigation.tsx`
- `ComunidadView.tsx` (excepto cambios necesarios)
- `PricingView.tsx`

### Modificar con cuidado:
- `vite.config.ts` (CSP)
- `vercel.json` (CSP)
- `index.css` (estilos globales)
- `public/logo.svg` (branding)

### Seguir patrón de:
- `PostCard.tsx` - Estilo visual unificado
- `components/postcard/*` - Componentes de posts

---

## 13. Próximas Mejoras Pendientes

1. [ ] Fix Authentication en ReferralPanel (isAuthenticated circular dependency)
2. [ ] MarketplaceView redesign (cards más pequeñas, slider, estilo transparente)
3. [ ] Seed data para comunidades (posts, miembros, chat)
4. [ ] Señales: espacio dedicado con distribución por membresía
5. [ ] Comunidades privadas con beneficios por tier

---

*Documento creado: Marzo 2026*
*Repo: https://github.com/iuratobraian/trade-share.git*
