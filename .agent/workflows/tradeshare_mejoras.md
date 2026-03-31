---
description: Plan de mejoras completo para TradeShare Platform - Sesión 19/03/2026
---

# TradeShare - Plan de Mejoras Exhaustivo 2026

## ESTADO ACTUAL
- Proyecto: TradeShare Platform (tradingportal)
- Stack: React + Vite + Convex + Tailwind CSS
- Deploy: Vercel (tradingportal.vercel.app)
- **Plan:** `PLAN_MEJORAS_MASTER.md` en `.agent/skills/`

---

## 📋 MEJORAS SESIÓN 16/03 (Completadas ✅)

### BLOQUE 1 - FEED / PUBLICACIONES
- [x] Efecto partículas al publicar
- [x] Efecto explosión al eliminar
- [x] Zona operativa compactada
- [x] Imagen/perfil sin duplicados
- [x] Botón actualizar feed
- [x] Like con destello sutil
- [x] Botones reducidos
- [x] Bordes y estética pulidos
- [x] Modo edición sincronizado

### BLOQUE 2 - IMÁGENES
- [x] Integración postimages.org/postimg.cc
- [x] Fallback a ImgBB

### BLOQUE 3 - ACADEMIA
- [x] Banner superior compactado
- [x] Neón border con animación

### BLOQUE 4 - PANEL ADMIN
- [x] Botón nuevo usuario simplificado (+)
- [x] Checkbox "Verificado?" en Edit Modal

### BLOQUE 5 - DEPLOY
- [x] git add + commit + push + vercel --prod

---

## 🚨 NUEVO PLAN DE MEJORAS 19/03/2026 (Pendiente)

### AGENTE-1: SEGURIDAD & DEPLOY (7 tareas)

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| S1 | Eliminar API Key ImgBB hardcodeada | 🔴 Crítico | 🔴 Pendiente |
| S2 | Reemplazar MOCKED_AUTH con Auth real | 🔴 Crítico | 🔴 Pendiente |
| S3 | Eliminar comentarios passwords históricos | 🔴 Crítico | 🔴 Pendiente |
| S4 | Hash contraseñas con bcrypt | 🟠 Alto | 🔴 Pendiente |
| S5 | CSP Headers | 🟠 Alto | 🔴 Pendiente |
| T4 | Notificaciones Push | 🟠 Alto | 🔴 Pendiente |
| T5 | Chat Moderation | 🟠 Alto | 🔴 Pendiente |

**Skill:** `AGENTE_1_SEGURIDAD.md`

---

### AGENTE-2: REFACTORING & QUALITY (13 tareas)

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| R1 | Eliminar console.log (26+) | 🟠 Alto | 🔴 Pendiente |
| R2 | Reducir @ts-ignore (78+ → <10) | 🟡 Medio | 🔴 Pendiente |
| R3 | Dividir storage.ts (2334 líneas) | 🟡 Medio | 🔴 Pendiente |
| R4 | Dividir AdminView.tsx (3228 líneas) | 🟡 Medio | 🔴 Pendiente |
| R5 | Unificar mapConvexPost | 🟢 Bajo | 🔴 Pendiente |
| R6 | Unificar extractYoutubeId | 🟢 Bajo | 🔴 Pendiente |
| P1 | AdminView lazy loading | 🟠 Alto | 🔴 Pendiente |
| P2 | Memoizar queries Convex | 🟡 Medio | 🔴 Pendiente |
| P3 | Validar parseInt con NaN | 🟡 Medio | 🔴 Pendiente |
| P4 | JSON.parse con try-catch | 🟡 Medio | 🔴 Pendiente |
| T1 | Suite de tests (Vitest) | 🟡 Medio | 🔴 Pendiente |
| T2 | Coverage mínimo 70% | 🟡 Medio | 🔴 Pendiente |
| T3 | CI/CD pipeline | 🟢 Bajo | 🔴 Pendiente |

**Skill:** `AGENTE_2_REFACTOR.md`

---

### AGENTE-3: FEATURES & UX/UI (13 tareas)

#### Features
| # | Tarea | Dependencias | Estado |
|---|-------|--------------|--------|
| F1 | Posts IA | S2 (Auth real) | 🟡 Esperando |
| F2 | MercadoPago real | API Keys | 🟡 Esperando |
| F3 | Zenobank real | API Keys | 🟡 Esperando |
| F4 | Moderación visible | S2 (Auth real) | 🟡 Esperando |
| F5 | Exness API Sync | API Keys | 🟡 Pendiente |
| F6 | Affiliate System | F2 (Pagos) | 🟡 Esperando |
| F7 | Invoice System | F2 (Pagos) | 🟢 Pendiente |

#### UX/UI (Puede iniciar sin dependencias)
| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| U1 | Popup perfil (posición + auto-close) | 🟠 Alto | 🔴 Pendiente |
| U2 | Tema claro funcional | 🟠 Alto | 🔴 Pendiente |
| U3 | Email duplicado en AuthModal | 🟡 Medio | 🔴 Pendiente |
| U4 | Lazy loading feed (5 en 5) | 🟡 Medio | 🔴 Pendiente |
| U5 | Responsive mobile completo | 🟡 Medio | 🔴 Pendiente |
| U6 | Passwords fuera localStorage | 🟡 Medio | 🔴 Pendiente |

**Skill:** `AGENTE_3_FEATURES.md`

---

## 📊 RESUMEN TOTAL

| Agente | Área | Tareas | Completadas |
|--------|------|--------|-------------|
| AGENTE-1 | Seguridad | 7 | 0 |
| AGENTE-2 | Refactoring | 13 | 0 |
| AGENTE-3 | Features + UX | 13 | 0 |
| **TOTAL** | | **33** | **0 (0%)** |

---

## 📁 DOCUMENTACIÓN

```
.agent/skills/
├── AGENTE_1_SEGURIDAD.md     ← Tareas AGENTE-1
├── AGENTE_2_REFACTOR.md      ← Tareas AGENTE-2
├── AGENTE_3_FEATURES.md      ← Tareas AGENTE-3
├── PLAN_MEJORAS_MASTER.md    ← Plan completo
├── AGENT_TEAMS.md           ← Estructura de equipos
└── COORDINATOR.md           ← Progreso detallado
```

---

*Plan actualizado: 19/03/2026*
*Total tareas: 33*
*Estado: LISTO PARA INICIAR*
