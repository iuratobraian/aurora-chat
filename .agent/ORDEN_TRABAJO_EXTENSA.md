# 📋 ORDEN DE TRABAJO EXTENSA - MEJORAS TRADEPORTAL 2025

**De:** Coordinador (Antigravity)
**Para:** Agentes de Implementación (Stablity, Experience, Growth)
**Objetivo:** Implementar el backlog de mejoras críticas y nuevas funcionalidades para asegurar el funcionamiento premium de todos los sectores.

---

## 1. Integración de Instagram (Modo Popup & Live)
- **Tarea:** Al conectar con Instagram, abrir un popup (modal) interno en la app.
- **Funcionalidad:** 
  - Mostrar páginas habilitadas en tiempo real.
  - Actualización "Live" del estado de conexión.
  - Interfaz premium con flujos de carga elegantes.
- **Archivos:** `src/views/ConfiguracionView.tsx`, `src/services/instagramService.ts`.

## 2. Sistema de Notificaciones & Chat
- **Tarea:** Implementar globos de notificación (badges) en el chat.
- **Detalle:** 
  - Mostrar cantidad de mensajes nuevos.
  - Sincronización en tiempo real con Convex.
  - Mejorar la visibilidad de notificaciones globales.
- **Archivos:** `src/components/Navigation.tsx`, `src/components/LiveChatWidget.tsx`.

## 3. Marketplace Integrado (Reemplazo de Estrategias)
- **Tarea:** Renombrar y expandir el sector "Estrategias" a "Marketplace".
- **Funcionalidad:**
  - Permitir publicación de Cursos, Mentorías, Scripts, EAs e Indicadores.
  - Filtros por tipo de producto y categoría.
  - Integración total con el sistema de pagos (Stripe/MercadoPago).
- **Archivos:** `src/views/MarketplaceView.tsx` (ex MarketplaceView), `src/App.tsx`.

## 4. Sistema de Afiliados & Recompensas (Tokens)
- **Tarea:** Implementar sistema de puntos por post (estilo Taringa) llamados **Tokens**.
- **Funcionalidad:**
  - Recompensas por invitar usuarios con link de afiliado.
  - Sector para canjear Tokens por mentorías, sesiones en vivo, etc.
  - Dashboard de recompensas para el usuario.
- **Archivos:** `src/views/ReferralView.tsx`, `src/views/DashboardView.tsx`, `convex/affiliates.ts`.

## 5. Extracción Automática de Videos (Psicotrading)
- **Tarea:** Implementar buscador/extractor de videos de YouTube sobre Psicotrading.
- **Detalle:**
  - Filtros para extraer solo los mejores videos.
  - Categorización automática y visualización en el sector de Psicotrading.
- **Archivos:** `src/views/PsicotradingView.tsx`, backend scripts de extracción.

## 6. Correcciones UI (Encuesta del Día)
- **Tarea:** Corregir el efecto de la encuesta del día que funciona mal.
- **Detalle:** Asegurar transiciones suaves y guardado correcto del voto.
- **Archivos:** `src/components/DailyPoll.tsx`.

---

## 📝 PROTOCOLO DE EJECUCIÓN
1. **Reclamar Tarea** en `TASK_BOARD.md`.
2. **Definir Scope** en `CURRENT_FOCUS.md`.
3. **Validar** con `npm run lint` y pruebas unitarias.
4. **Respetar Estética Premium** (Glassmorphism, Dark Mode, Animaciones).

---
*Firma: Antigravity - Coordinador de Mente Maestra*
