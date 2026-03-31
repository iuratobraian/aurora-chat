# 📋 ORDEN DE TRABAJO: Rediseño Admin & Bitácora

**Fecha:** 2026-03-24  
**Agente Asignado:** Antigravity  
**Estado:** EN EJECUCIÓN 

## 🎯 OBJETIVOS
1. **REPO-001 (Repositorio de Órdenes):** Crear este mismo directorio `.agent/workspace/user_orders/` como fuente de verdad para el historial de órdenes del usuario.
2. **ADMIN-001 (FAB & Fullscreen):** Remover Admin anclado en `Navigation.tsx`, crear `AdminFAB.tsx` flotante, y rediseñar `AdminView.tsx` a modo profesional pantalla completa (`fixed inset-0`).
3. **MKT-007 (Meta/Instagram):** Conectar `InstagramMarketingView` al nuevo panel Admin.
4. **BIT-001 (Bitácora a Convex):** Migrar esquemas de la cuenta Bitácora a `convex/schema.ts`, crear `convex/bitacora.ts` para extraer estadísticas y añadirlas al `PerfilView.tsx` (Validación de rentabilidad).

## 📝 PROTOCOLO DE TRABAJO
- **Archivos a tocar:** 
  - `src/components/Navigation.tsx`
  - `src/components/AdminFAB.tsx` (nuevo)
  - `src/views/AdminView.tsx`
  - `src/App.tsx`
  - `convex/schema.ts`
  - `convex/bitacora.ts` (nuevo)
  - `src/views/PerfilView.tsx`
- **Regla:** Respetar estilos Glassmorphism y diseño premium.
- **Validación final:** Correr `npm run lint`.
