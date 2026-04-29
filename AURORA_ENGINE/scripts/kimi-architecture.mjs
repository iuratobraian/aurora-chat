import { askKimiWithContext } from "./aurora-kimi-agent.mjs";
import fs from "fs";

async function main() {
  const context = {
    currentTask: "Legacy Auth Migration",
    filesToEdit: ["convex/**/*.ts"],
    forbidden: ["App.tsx", "Navigation.tsx", "PricingView.tsx"],
    issue: "218 legacy auth patterns (identity.subject) found across 47 files. Need to migrate to resolveCallerId/assertOwnershipOrAdmin."
  };

  console.log("🤖 Consultando a Kimi K2.5 para plan de arquitectura...");
  
  const result = await askKimiWithContext(
    "Genera un plan detallado para migrar los patrones de identity.subject a resolveCallerId o assertOwnershipOrAdmin. " +
    "Incluye ejemplos de refactorización para Queries vs Mutations.",
    context
  );

  fs.writeFileSync("vault/03-conocimiento/AUTH_MIGRATION_PLAN.md", result.answer);
  console.log("✅ Plan de arquitectura guardado en vault/03-conocimiento/AUTH_MIGRATION_PLAN.md");
}

main();
