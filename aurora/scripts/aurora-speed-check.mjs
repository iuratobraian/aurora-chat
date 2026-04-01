import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const pointerFile = path.join(ROOT, ".agent/aurora/auto-runner.pointer");
const knowledgeFile = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");
const learnerPointerFile = path.join(ROOT, ".agent/aurora/agent-learner.pointer.json");
const healthUrl = "http://127.0.0.1:4310/health";

function fileAge(pathToFile) {
  if (!fs.existsSync(pathToFile)) return null;
  return Date.now() - fs.statSync(pathToFile).mtimeMs;
}

async function probeHealth() {
  try {
    const res = await fetch(healthUrl, { cache: "no-store" });
    return {
      ok: res.ok,
      status: res.status,
      message: res.ok ? "Aurora API disponible" : `HTTP ${res.status}`
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      message: `No responde: ${error.message}`
    };
  }
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

function countStructuredKnowledge(entries) {
  return entries.filter((entry) =>
    typeof entry.sourceType === "string" &&
    typeof entry.taskId === "string" &&
    typeof entry.domain === "string" &&
    typeof entry.confidence === "number" &&
    typeof entry.reuseScore === "number" &&
    typeof entry.validated === "boolean"
  ).length;
}

export async function runSpeedCheck() {
  const now = Date.now();
  const runnerAge = fileAge(pointerFile);
  const knowledgeAge = fileAge(knowledgeFile);
  const learnerAge = fileAge(learnerPointerFile);
  const knowledgeEntries = readJsonl(knowledgeFile);
  const structuredKnowledgeEntries = countStructuredKnowledge(knowledgeEntries);
  const structuredCoveragePct = knowledgeEntries.length
    ? Math.round((structuredKnowledgeEntries / knowledgeEntries.length) * 100)
    : 0;
  const health = await probeHealth();
  const alerts = [];

  if (!health.ok) {
    alerts.push({
      severity: "critical",
      text: "Aurora API no responde",
      detail: health.message
    });
  }
  if (runnerAge === null || runnerAge > 2 * 60 * 1000) {
    alerts.push({
      severity: "warning",
      text: "Auto-runner desactualizado",
      detail: runnerAge === null ? "No se detectó el puntero de auto-runner." : `Última ejecución hace ${Math.round(runnerAge / 1000)}s.`
    });
  }
  if (learnerAge === null || learnerAge > 10 * 60 * 1000) {
    alerts.push({
      severity: "warning",
      text: "Agent learner desactualizado",
      detail: learnerAge === null ? "No se detectó el puntero de agent learner." : `Última ingestión hace ${Math.round(learnerAge / 1000)}s.`
    });
  }
  if (knowledgeAge === null || knowledgeAge > 5 * 60 * 1000) {
    alerts.push({
      severity: "info",
      text: "Base de conocimiento sin actualización reciente",
      detail: knowledgeAge === null ? "No se detectó el archivo de aprendizaje." : `Última actualización hace ${Math.round(knowledgeAge / 1000)}s.`
    });
  }
  if (structuredCoveragePct < 80) {
    alerts.push({
      severity: "info",
      text: "Conocimiento poco estructurado",
      detail: `Cobertura estructurada actual: ${structuredCoveragePct}%`
    });
  }

  return {
    timestamp: new Date(now).toISOString(),
    health: health.ok,
    healthMessage: health.message,
    runnerAgeMs: runnerAge,
    learnerAgeMs: learnerAge,
    knowledgeAgeMs: knowledgeAge,
    knowledgeEntries: knowledgeEntries.length,
    structuredKnowledgeEntries,
    structuredCoveragePct,
    alerts,
    summary: alerts.length ? "Necesita atención" : "Aurora lista y aprendiendo"
  };
}

const entryPointUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1]))
  : null;

if (entryPointUrl && entryPointUrl.href === import.meta.url) {
  runSpeedCheck()
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));
      if (data.alerts.length) {
        console.log("Alertas:");
        data.alerts.forEach((alert) => console.log(`- ${alert.severity}: ${alert.text} (${alert.detail})`));
      }
    })
    .catch((error) => {
      console.error("speed-check falló:", error.message);
      process.exitCode = 1;
    });
}
