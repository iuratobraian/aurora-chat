# 🚀 FASE 9: INNOVACIÓN & PWA — Briefing de Misión

## 🎯 Objetivo Global
Elevar TradeHub de una red social funcional a una plataforma de alta retención ("Habit-forming") con estabilidad 99.9% y herramientas exclusivas de IA.

---

## 🚨 [P0] Misión de Emergencia: Estabilidad & Login
**Responsable:** AGENT-2 (Frontend/Security)
**Tarea:** TP-009
**Contexto:** Reportes de iconos invisibles, pérdida de sesión y ERRORES EN CONSOLA (Signals).

**Acciones Críticas:**
1. **CSP Fix:** Actualizar `vite.config.ts` y `index.html`. Permitir `fonts.gstatic.com` y `https://vercel.live`.
2. **Auth Persistence:** Asegurar que el token de Convex use `local_session` en `services/storage.ts`.
3. **Signals Backend Sync:** 
   - El cliente falla al llamar `signals:getActiveSignals`. Correr `npx convex deploy` para sincronizar.
   - **¡ATENCIÓN!** Faltan funciones en `convex/signals.ts` que el frontend (`SignalsView.tsx`) requiere: `getSignalHistory` y `sendSignalToChat`. IMPLEMENTARLAS.
4. **Environment Keys:** Advertencia de `VITE_IMGBB_API_KEY` faltante en consola. Configurar en Vercel si se usará ImgBB.

---

## 📱 [P1] Misión PWA: Offline-First Experience
**Responsable:** AGENT-2 (Frontend/Mobile)
**Tarea:** TP-010
**Contexto:** Los usuarios de trading suelen operar en movilidad con conexión inestable.
**Acciones:**
1. **Cache de Feed:** Implementar persistencia de los últimos 20-50 posts en el cliente usando el middleware de `syncService.ts`.
2. **Background Sync:** Al recuperar conexión, disparar el vaciado de la cola de `pendingSync` para posts o comentarios creados offline.
3. **Visual:** Mostrar un sutil indicador "Sincronizado" (en verde) al terminar la carga.

---

## 🤖 [P1] Misión IA: Morning Briefing 3.0
**Responsable:** AGENT-1 (Backend/IA)
**Tarea:** AI-004
**Contexto:** El usuario PRO debe sentir que tiene un analista 24/7.
**Acciones:**
1. **Briefing Engine:** Crear `lib/ai/briefing.ts`. Debe leer la `watchlist` del perfil y cruzar con las noticias frescas de `marketNews`.
2. **Sintesis:** Generar un resumen diario ejecutivo. Opcional: Integrar ElevenLabs (o similar) para toggle de audio.
3. **Distribución:** El briefing aparece como un Card especial "fijado" al inicio del feed cada mañana (5:00 AM local).

---

## 📊 [P2] Misión Analytics: Creator Business Tools
**Responsable:** AGENT-1 (Fullstack/Data)
**Tarea:** MKT-009
**Contexto:** Atraer comunidades requiere darles datos de negocio.
**Acciones:**
1. **Conversion Funnel:** En `CreatorDashboard`, mostrar ratio de: Personas que vieron la comunidad → Personas que se unieron.
2. **Retention Stats:** Promedio de días activos de sus miembros.
3. **Heatmaps:** (Opcional) Mapa de calor de interacción en sus posts.

---

## 🎨 Estándar Visual Fase 9
- Usar `ElectricLoader` para estados de carga de la IA.
- Micro-interacciones premium en los dashboards de métricas.
- Mantener el "Dark Mode" profundo (`bg-[#050608]`).

---
*Mantenido por el Agente Coordinador (Fase 9).*
