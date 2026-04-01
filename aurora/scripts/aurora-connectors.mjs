import fs from "node:fs";
import path from "node:path";
import { loadAuroraEnv } from "./load-aurora-env.mjs";
import { getLocalAgentStatus } from "./aurora-local-agents.mjs";

const ROOT = process.cwd();

loadAuroraEnv();

const data = JSON.parse(
  fs.readFileSync(path.join(ROOT, ".agent/aurora/connectors.json"), "utf8")
);

const withStatus = (items) =>
  items.map((item) => ({
    ...item,
    activo: item.estadoEnv ? Boolean(process.env[item.estadoEnv]) : null,
    playbook: item.playbook || null,
    readiness: item.readiness || (item.estadoEnv ? (process.env[item.estadoEnv] ? "configured" : "not_configured") : "unknown")
  }));

export function getConnectorStatus() {
  const local = getLocalAgentStatus();
  let aiModels = [];
  try {
    aiModels = JSON.parse(fs.readFileSync(path.join(ROOT, ".agent/aurora/ai_models.json"), "utf8"));
  } catch {
    aiModels = [];
  }
  return {
    apis: withStatus(data.apis),
    mcp: withStatus(data.mcp),
    locales: {
      ollama: local.ollama,
      opencode: local.opencode
    },
    aiModels: aiModels.map((model) => ({
      ...model,
      gpuCapable: model.gpu || false
    }))
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(JSON.stringify(getConnectorStatus(), null, 2));
}
