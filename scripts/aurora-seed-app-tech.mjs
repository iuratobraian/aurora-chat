import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const stackPath = path.join(ROOT, ".agent/aurora/app-stack.json");
const knowledgePath = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function appendIfMissing(entries) {
  const existing = new Set(readJsonl(knowledgePath).map((entry) => entry.id));
  const fresh = entries.filter((entry) => !existing.has(entry.id));
  if (!fresh.length) return 0;
  fs.appendFileSync(knowledgePath, fresh.map((entry) => JSON.stringify(entry)).join("\n") + "\n");
  return fresh.length;
}

const stack = readJson(stackPath);
const now = new Date().toISOString();

const entries = [
  {
    id: "APP-STACK-FRONTEND",
    title: "Stack frontend de la app",
    statement: `Frontend basado en ${stack.frontend.framework}, ${stack.frontend.bundler}, ${stack.frontend.styling}, ${stack.frontend.routing}, ${stack.frontend.i18n} y ${stack.frontend.monitoring}.`,
    domain: "community_product"
  },
  {
    id: "APP-STACK-BACKEND",
    title: "Stack backend de la app",
    statement: `Backend basado en ${stack.backend.server}, realtime con ${stack.backend.realtime} y runtime ${stack.backend.runtime}. Entrada principal: ${stack.backend.apiEntry}.`,
    domain: "aurora_ops"
  },
  {
    id: "APP-STACK-DATA",
    title: "Capa de datos de la app",
    statement: `La source of truth principal es ${stack.data.primary}. El cliente usa ${stack.data.clientPattern}. Esquema principal: ${stack.data.schemas}. API generada: ${stack.data.generatedApi}.`,
    domain: "community_product"
  },
  {
    id: "APP-STACK-PAYMENTS",
    title: "Pagos e integraciones criticas",
    statement: `Los pagos usan ${stack.payments.providers.join(", ")} y cruzan server y Convex. Archivos clave: ${stack.payments.serverRoutes.join(", ")}.`,
    domain: "security"
  },
  {
    id: "APP-STACK-COMMUNITY",
    title: "Nucleo tecnico de comunidad",
    statement: `Las superficies core de comunidad viven en ${stack.communityCore.views.join(", ")} y dependen de ${stack.communityCore.convexModules.join(", ")} y ${stack.communityCore.services.join(", ")}.`,
    domain: "community_product"
  },
  {
    id: "APP-STACK-AI",
    title: "Capa de IA del producto y de Aurora",
    statement: `Aurora runtime vive en ${stack.aiLayer.localRuntime.join(", ")}. La capa IA de producto vive en ${stack.aiLayer.productAi.join(", ")}.`,
    domain: "aurora_ops"
  },
  {
    id: "APP-STACK-ROUTING",
    title: "Mapa de frontend para programar features",
    statement: `Las vistas principales viven en ${stack.communityCore.views.join(", ")}. La UI reusable suele caer en components/ y el cableado del flujo de usuario entra por React Router dentro del frontend Vite.`,
    domain: "community_product"
  },
  {
    id: "APP-STACK-SERVICE-LAYER",
    title: "Patron de servicios del repo",
    statement: `La lógica de dominio de frontend y adapters suele vivir en services/. Cuando una tarea toca UI conviene seguir el flujo view/component -> services/ -> Convex o server.ts según la integración.`,
    domain: "community_product"
  },
  {
    id: "APP-STACK-CONVEX-FLOW",
    title: "Flujo de datos fullstack con Convex",
    statement: `La app usa ${stack.data.primary} como source of truth. El patrón normal es useQuery/useMutation o ConvexHttpClient en cliente, schema en ${stack.data.schemas} y contratos generados en ${stack.data.generatedApi}.`,
    domain: "community_product"
  },
  {
    id: "APP-STACK-SERVER-RESPONSIBILITIES",
    title: "Responsabilidad de server.ts",
    statement: `${stack.backend.apiEntry} concentra Express, relays de IA, webhooks e integraciones sensibles. Si una tarea menciona API, webhook, pago o auth server-side, conviene inspeccionarlo temprano.`,
    domain: "aurora_ops"
  },
  {
    id: "APP-STACK-PAYMENT-FLOW",
    title: "Ruta de pagos y webhooks",
    statement: `Los pagos usan ${stack.payments.providers.join(", ")} y cruzan ${stack.payments.serverRoutes.join(", ")}. Cambios de billing suelen tocar server, Convex y feedback visible en views.`,
    domain: "security"
  },
  {
    id: "APP-STACK-TESTING",
    title: "Validacion esperada por superficie",
    statement: `La validación base del repo es ${stack.testing.unit}. UI relevante suele requerir build además de lint; cambios en server, auth, pagos o Convex merecen pruebas más profundas y smoke checks de flujo.`,
    domain: "aurora_ops"
  },
  {
    id: "APP-STACK-REPO-MAP",
    title: "Mapa util para una IA fullstack",
    statement: `Para programar rápido en este repo: views/ y components/ cubren experiencia, services/ contiene lógica de dominio, convex/ define datos y realtime, server.ts maneja integraciones y scripts/ opera Aurora.`,
    domain: "aurora_ops"
  },
  {
    id: "APP-STACK-AURORA-PROGRAMMING",
    title: "Aurora debe razonar tareas de código como fullstack",
    statement: `Una tarea técnica debe traducirse a scope, surface, archivos probables, frontend/backend/data impactados, validación y riesgo antes de editar. Ese es el modo operativo correcto para Aurora Shell.`,
    domain: "aurora_ops"
  },
  {
    id: "APP-STACK-GUARDRAILS",
    title: "Guardrails del repo para edición",
    statement: `No tocar App.tsx, Navigation.tsx, ComunidadView.tsx ni PricingView.tsx sin claim explícito. Mantener cambios pequeños, reversibles y coordinados con TASK_BOARD.md y CURRENT_FOCUS.md.`,
    domain: "aurora_ops"
  }
].map((entry) => ({
  ...entry,
  tags: ["app-stack", "engineering", stack.product.toLowerCase()],
  source: "app_stack_manifest",
  sourceType: "engineering_context",
  taskId: "OPS-073",
  confidence: 0.94,
  reuseScore: 0.9,
  validated: true,
  createdAt: now
}));

const inserted = appendIfMissing(entries);
console.log(`Aurora app tech seeded: ${inserted} records added.`);
