import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea [PROTOCOL-HARDEN]: Reforzar y actualizar el protocolo de coordinación de agentes (AMM).

Estado Actual:
- Los agentes están saltándose los pasos de Gemma/Kimi para tareas que consideran "simples", resultando en regresiones visuales (como gaps innecesarios) y falta de prolijidad.
- El usuario exige que el protocolo sea INELUDIBLE.

Objetivos:
1. Diseñar una sección para AGENTS.md que establezca la obligatoriedad de generar un archivo 'scripts/kimi-task-N.mjs' por cada tarea asignada.
2. Definir que el primer paso de CADA sesión es leer el 'briefing' de Gemma y el último es la 'auditoría'.
3. Establecer que el incumplimiento del flujo GEMMA -> KIMI -> CÓDIGO será considerado una "falla crítica de seguridad" del agente.

Responde con el texto exacto para insertar en AGENTS.md y recomendaciones para que los agentes no lo olviden.`;

console.log("💜 Consultando a KIMI K2.5 para PROTOCOL-HARDEN...");

try {
  const result = await askKimi(prompt, { timeout: 300000 });
  console.log("\n💜 Respuesta de Kimi - [PROTOCOL-HARDEN]:");
  console.log(result.answer);
} catch (err) {
  console.error("❌ Error al consultar a Kimi:", err.message);
}
