import { askKimiWithContext } from "./aurora-kimi-agent.mjs";

async function main() {
  const context = {
    currentTask: "Estabilización de Pagos y TV Automatizada",
    filesToEdit: [
      "convex/mercadopagoApi.ts",
      "convex/tvGrid.ts",
      "src/components/shared/TradingIdeaAlertOverlay.tsx"
    ],
    technicalRequirements: [
      "Implementar logging de 400 errors en Mercado Pago",
      "Automatizar transiciones de playlist en TV por tiempo real",
      "Gating de ideas de trading en TV para usuarios no logueados",
      "Eliminar $ del punto de entrada en ideas"
    ]
  };

  console.log("Consultando a Kimi para arquitectura...");
  const result = await askKimiWithContext("Diseña la arquitectura para la automatización de la TV y el sistema de logs de pagos.", context);
  console.log("\n--- ARQUITECTURA PROPUESTA POR KIMI ---");
  console.log(result);
}

main();
