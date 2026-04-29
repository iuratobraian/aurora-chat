import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const knowledgePath = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");

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

function inferTaskId(entry) {
  if (typeof entry.taskId === "string" && entry.taskId) return entry.taskId;
  const text = `${entry.statement || ""} ${entry.title || ""}`;
  const match = text.match(/\b((?:OPS|INF|SEC|PAY|AI|TP|GROW|MKT|CRIT|STAB|SALE|CORE|FIX|VALIDATE|IDENTITY|RELEASE|CLEANUP)-[A-Z0-9]+)\b/);
  return match ? match[1] : "LEGACY";
}

function inferDomain(taskId) {
  if (/^GROW|^MKT|^SALE/.test(taskId)) return "growth";
  if (/^SEC|^PAY|^INF/.test(taskId)) return "security";
  if (/^AI|^OPS/.test(taskId)) return "aurora_ops";
  if (/^TP|^CORE|^CRIT|^STAB/.test(taskId)) return "community_product";
  return "general";
}

function inferSourceType(entry) {
  if (typeof entry.sourceType === "string" && entry.sourceType) return entry.sourceType;
  if (entry.source === "agent_log") return "agent_log";
  if (entry.source === "activity") return "activity_log";
  if (entry.source === "aurora") return "manual_learn";
  return "legacy";
}

function withDefaults(entry) {
  const taskId = inferTaskId(entry);
  return {
    ...entry,
    sourceType: inferSourceType(entry),
    taskId,
    domain: typeof entry.domain === "string" && entry.domain ? entry.domain : inferDomain(taskId),
    confidence: typeof entry.confidence === "number" ? entry.confidence : 0.6,
    reuseScore: typeof entry.reuseScore === "number" ? entry.reuseScore : 0.5,
    validated: typeof entry.validated === "boolean" ? entry.validated : Boolean(entry.statement || entry.title),
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString()
  };
}

const records = readJsonl(knowledgePath);
const migrated = records.map(withDefaults);
fs.writeFileSync(
  knowledgePath,
  migrated.map((entry) => JSON.stringify(entry)).join("\n") + "\n",
  "utf8"
);

console.log(`Aurora knowledge backfilled: ${migrated.length} records updated.`);
