---
name: master_briefing
description: Punto de entrada único para todos los agentes. Estado actual del proyecto, tareas asignadas, reglas y pipeline de deploy. LEER ESTE ARCHIVO PRIMERO.
---

# 🧠 MASTER BRIEFING — TradeShare Platform
## 📅 Última actualización: 19/03/2026 | Sprint Final Premium

> **INSTRUCCIÓN #1:** Lee este documento completo. Luego abre `TAREAS.md` en la raíz para ver el estado de cada módulo con su checklist.

---

## 📚 SKILLS DISPONIBLES

| Skill | Uso | Path |
|-------|-----|------|
| 🎨 **Guía Visual** | Estándar de diseño premium obligatorio | `_agents/skills/guia_visual/SKILL.md` |
| 🖥️ **Migración Servidor** | Para cuando se migre a un nuevo servidor/infra | `_agents/skills/migracion_servidor/SKILL.md` |

---

## 👥 EQUIPO DE AGENTES

| Agente | Responsable de | Módulos prioritarios |
|--------|---------------|----------------------|
| **AGENT-1** | Backend, Convex, IA, Referidos, Deploy | M5, M7, M9 |
| **AGENT-2** | Frontend, UI/UX, Navegación, PostCard | M3, M4, M10 |

---

## 📋 TAREAS ACTIVAS (Sprint Final)

> Estado detallado con checkboxes en `TAREAS.md` sección `FASE 4`. Marcar `[/]` al iniciar, `[x]` al terminar.

### 🔴 P0 — Hacer primero:
- **[AGENT-2] M3:** `components/PostCard.tsx` → ocultar Follow en bots (`&& !post.isAiAgent`), Web Share API, animación de like
- **[AGENT-2] M4:** `components/Navigation.tsx` → Tab "Trading" (dropdown: Gráfico, Broker, Bitácora) + Tab "Prop Firms". CREAR `views/PropFirmsView.tsx`. Registrar en `App.tsx`.
- **[AGENT-1] M5:** `views/ReferralView.tsx` → rediseñar completo. Query `getReferralStats` en Convex. Guardar `referredBy` al signup.

### 🟡 P1 — Importantes:
- **[AGENT-2] M1:** `views/DashboardView.tsx` → Podio Top 3 traders (🥇🥈🥉) + pill flotante "Nuevas publicaciones"
- **[AGENT-2] M2:** `views/ComunidadView.tsx` → Tab "Planes" en sidebar + Trending Communities + Modal "Crear Comunidad"
- **[AGENT-1] M7:** `convex/crons.ts` → IA dual-post: al generar post, replicar en comunidad "AI News"
- **[AGENT-2+AGENT-1] M10:** Chat privado por subcomunidad (ver sección técnica abajo)

### 🟢 P2:
- **[AGENT-1] M6:** `components/AdBanner.tsx` → prop `autoRotate` + sidebar de `ComunidadView` con ads rotativos cada 10s
- **[AGENT-2] M8:** Gamification → streak diario, XP por primer post del día, toast de ranking

### 🚀 FASE 10 — Innovación & PWA (NUEVO)
> Ver detalle en `.agent/skills/FASE_10_INNOVACION_PWA.md`

- **[AGENT-2] TP-009:** Protocolo Emergencia: Fix CSP, Iconos, Auth Persistence.
- **[AGENT-2] TP-010:** Offline Feed (IndexedDB) + Background Sync.
- **[AGENT-1] AI-004:** Morning Briefing (Watchlist + News).
- **[AGENT-1] MKT-009:** Analyst Dashboard para Creadores.

### 🔵 P3 — Al final:

- **[AGENT-1] M9:** `npx convex deploy` + `npm run build` sin errores. Actualizar `TAREAS.md`.

---

## 💬 M10 — Chat por Subcomunidad (Referencia Técnica)

**Estado `App.tsx`:** ✅ YA implementado — evento `open-community-chat` con `chatCommunityChannel` y `chatCommunityName`.

### Lo que falta:

**`components/LiveChatWidget.tsx`** — Agregar props:
```tsx
interface Props {
  // ...existentes...
  initialChannel?: string;   // ← NUEVO
  communityName?: string;    // ← NUEVO
}

// Al montar:
useEffect(() => {
  if (initialChannel) setCurrentChannel(initialChannel);
}, [initialChannel]);

// Header dinámico:
<h3>{communityName ? `CHAT: ${communityName.toUpperCase()}` : 'TRADESHARE LIVE'}</h3>

// Ocultar selector de canales si hay initialChannel:
{!initialChannel && channels.length > 0 && (...selector...)}
```

**`views/ComunidadView.tsx`** — Botón visible solo a miembros:
```tsx
const esMiembro = userCommunities?.some(uc => uc._id === selectedCommunity?._id);

{selectedCommunity && esMiembro && (
  <button onClick={() => window.dispatchEvent(new CustomEvent('open-community-chat', {
    detail: { channelId: selectedCommunity._id, communityName: selectedCommunity.nombre }
  }))}
    className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
  >
    <span className="material-symbols-outlined text-sm">forum</span>
    Chat Privado
  </button>
)}
```

**`convex/chat.ts`** — Verificar que `sendMessage` acepta `channelId` como string dinámico (no hardcodeado).

---

## 🎨 ESTÁNDAR VISUAL (Resumen)

> **Detalle completo:** `_agents/skills/guia_visual/SKILL.md`

- Fondo: `bg-[#0f1115]` / `bg-black/40` / `glass` + `backdrop-blur-xl`
- Animaciones: `animate-in fade-in duration-300`, `hover:scale-105`, `transition-all`
- Tipografía: `font-black uppercase tracking-widest` (títulos), `text-[10px]` (labels)
- Colores: `#3b82f6` (primary), `signal-green` (success), `alert-red` (danger), `#050608` (fondo)
- Bordes: `border border-white/10` → hover: `hover:border-primary/40`
- **Regla:** Si la UI no se siente "viva" y "premium", no cumple el estándar.

---

## 🚀 PIPELINE DE DEPLOY

```bash
# Orden OBLIGATORIO — siempre respetar este orden:
git add .
git commit -m "feat: descripción del cambio"
git push                   # → dispara Vercel automáticamente
npx convex deploy          # → actualiza backend (DESPUÉS del push)
```

> ⚠️ Nunca hacer `npx convex deploy` sin haber hecho `git push` antes.

---

## 🏗️ REGLAS DE ARQUITECTURA

1. **UI Optimista:** Borrar/editar → actualizar UI primero, luego llamar Convex. Revertir si falla.
2. **No auto-refresh:** Pill flotante "Cargar nuevas publicaciones" en lugar de polling constante.
3. **Admin CRUD:** Todo lo que está en DB debe tener edit+delete en el panel Admin.
4. **AI Bots:** No seguibles (`isAiAgent=true`), dual-posting (feed global + comunidad AI News).
5. **Ads:** Banners en sidebar, nunca pop-ups centrales.

---

## 📁 MAPA DE ARCHIVOS CLAVE

```
views/
├── DashboardView.tsx      ← M1: Podio + pill
├── ComunidadView.tsx      ← M2 + M10: Chat btn para miembros
├── ReferralView.tsx       ← M5: Rediseñar completo [EN PROGRESO]
├── PropFirmsView.tsx      ← M4: CREAR NUEVO
└── AdminView.tsx          ← Panel admin ✅ completo

components/
├── PostCard.tsx           ← M3: IA restrictions + share + like anim
├── LiveChatWidget.tsx     ← M10: props initialChannel/communityName
├── Navigation.tsx         ← M4: Tabs Trading + Prop Firms
└── AdBanner.tsx           ← M6: prop autoRotate

convex/
├── crons.ts               ← M7: IA dual-post
├── chat.ts                ← M10: channelId dinámico
└── profiles.ts            ← M5: getReferralStats

App.tsx                    ← M10 ✅ (evento open-community-chat implementado)
TAREAS.md                  ← Checklist viva del sprint
```

---

## ✅ YA IMPLEMENTADO (No tocar)

- ✅ `App.tsx` — Evento `open-community-chat` implementado
- ✅ `services/storage.ts` — Session manager con tokens seguros
- ✅ `components/Navigation.tsx` — Menú de perfil dinámico (Escape, scroll, resize)
- ✅ `views/AdminView.tsx` — Lazy loading + skeleton screens
- ✅ `convex/propFirms.ts` — Backend CRUD para Prop Firms
- ✅ `convex/communities.ts` — `updateCommunity` + `deleteCommunity`
- ✅ `components/admin/` — Edit + Delete en CommunityManagement y PropFirmManagement

---

*🤖 Mantenido por el Agente Coordinador. Solo el coordinador modifica este archivo.*
