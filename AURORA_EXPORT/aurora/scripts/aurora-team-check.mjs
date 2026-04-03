import fs from "node:fs";
import path from "node:path";
import { getConnectorStatus } from "./aurora-connectors.mjs";

const ROOT = process.cwd();
const modelsPath = path.join(ROOT, ".agent/aurora/ai_models.json");
const knowledgePaths = [
  path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl"),
  path.join(ROOT, ".agent/brain/db/oss_ai_repos.jsonl")
];

function checkFiles() {
  const results = knowledgePaths.map((p) => ({
    path: p,
    exists: fs.existsSync(p),
    lines: fs.existsSync(p) ? fs.readFileSync(p, "utf8").trim().split(/\r?\n/).filter(Boolean).length : 0
  }));
  return results;
}

function checkModels() {
  if (!fs.existsSync(modelsPath)) return [];
  return JSON.parse(fs.readFileSync(modelsPath, "utf8"));
}

function log(message) {
  console.log(`[Aurora Check] ${message}`);
}

const connectors = getConnectorStatus();
log(`Conectores activos: ${connectors.apis.filter((api) => api.activo).map((api) => api.id).join(", ") || "ninguno"}`);
log(`Modelos GPU-ready: ${connectors.aiModels.filter((model) => model.gpuCapable).map((model) => model.name).join(", ") || "ninguno"}`);
checkFiles().forEach((entry) => {
  log(`${entry.path}: existe=${entry.exists}, registros=${entry.lines}`);
});
const models = checkModels();
log(`Modelos totales registrados: ${models.length}`);
