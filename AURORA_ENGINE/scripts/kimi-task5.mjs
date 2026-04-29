import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea OPT-001: Optimización de ComunidadView.tsx (943 líneas).

PROBLEMA: Múltiples useState causan re-renders innecesarios.

ESTADOS ACTUALES (30+ estados individuales):
- posts, filterType, filterTag, filterFollowing, sortBy
- justPublishedPostId, pulsingPostId, newPostId, newPostsFromTop
- showWelcome, editingAd, showNewPostsPill, pendingRawPosts
- liveStatus, editingLive, isLiveCinemaMode, selectedPost
- isRefreshing, isPublishing, isCreateModalOpen, isCreateCommunityOpen
- herramientasData, isAgentLoading, showXpToast, xpToastAmount
- feedDataSignal

PREGUNTAS:
1. Debería agrupar estados relacionados en useReducer?
2. Cuáles estados pueden derivarse (no necesitan useState)?
3. Hay useMemo/useCallback faltantes críticos?
4. Estrategia recomendada para componente tan grande?

Responde con estrategia concreta y priorizada.`;

const result = await askKimi(prompt, { timeout: 300000 }); // 5 minutos para KIMI

console.log("\n💜 Respuesta de Kimi - OPT-001:");
console.log(result.answer);
