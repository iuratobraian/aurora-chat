/**
 * 🤖 KIMI K2.5 ARCHITECT - TRADESHARE SIGNALS & BUBBLES
 * Tarea: Unificación de Señales y Sistema de Burbujas Globales
 * Directriz Gemma-4: Estabilizar Nueva Idea y Bubbles Real-time.
 */

/* 
  ARQUITECTURA DE UNIFICACIÓN:
  1. Frontend: QuickTradingIdeaButton -> convex/liveIdeas:createLiveIdea
  2. Backend: convex/trading/unifiedSignals:getGlobalSignals (Merge trading_ideas + liveIdeas)
  3. UI: src/components/tv/GlobalSignalBubbles (Overlay global en App.tsx)
  4. Lógica de Negocio: Ocultar detalles a Free users (limit 2/día).
*/

// [NEW] convex/trading/unifiedSignals.ts
// Handler para obtener señales de ambas tablas ordenadas por creación.

// [MODIFY] src/components/QuickTradingIdeaButton.tsx
// Switch mutation from tradingIdeas.createQuickIdea to liveIdeas.createLiveIdea.

// [NEW] src/components/tv/GlobalSignalBubbles.tsx
// Componente que escucha 'api.trading.unifiedSignals.getGlobalSignals' 
// y maneja un stack local de burbujas con auto-dismiss.

console.log("🚀 Kimi Architect: Plan de arquitectura para señales y burbujas generado.");
