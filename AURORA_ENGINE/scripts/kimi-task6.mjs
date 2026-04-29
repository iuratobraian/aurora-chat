import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea OPT-002: Lazy loading componentes pesados en TradeShare.

BUILD OUTPUT actual mostró:
- ComunidadView: 56.43 KB (gzip: 17.46 KB)
- PostDetailModal: 101.95 KB (gzip: 23.86 KB)
- PerfilView: 459.49 KB (gzip: 117.75 KB)
- index: 469.27 KB (gzip: 136.77 KB)

PREGUNTA: Vite ya hace code splitting. Necesito agregar React.lazy + Suspense manualmente o el build output demuestra que ya está optimizado?

Responde SI/NO con explicación de máximo 3 párrafos.`;

const result = await askKimi(prompt, { timeout: 300000 }); // 5 minutos para KIMI

console.log("\n💜 Respuesta de Kimi - OPT-002:");
console.log(result.answer);
