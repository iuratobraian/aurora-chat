import { askKimiWithContext } from "./aurora-kimi-agent.mjs";

const result = await askKimiWithContext("Planifica estrategia para 6 tareas nuevas en TradeShare", {
  currentTask: "Planificación de 6 tareas: FIX-006, FIX-007, UI-021, UI-022, OPT-001, OPT-002",
  filesToEdit: [
    "src/components/ui/SubscriptionSlider.tsx",
    "src/components/LiveChatWidget.tsx", 
    "src/components/ElectricLoader.tsx",
    "src/components/ui/SkeletonCard.tsx",
    "src/components/ui/SkeletonList.tsx",
    "src/components/ui/EmptyState.tsx",
    "src/views/ComunidadView.tsx",
    "src/App.tsx"
  ],
  forbidden: ["App.tsx (solo para lazy loading)", "Navigation.tsx", "ComunidadView.tsx (optimizar sin romper)"]
});

console.log("💜 Respuesta de Kimi:");
console.log(result.answer);
