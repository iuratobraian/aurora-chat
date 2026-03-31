import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const logPath = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
const knowledgePath = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");

function readEntries() {
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, "utf8")
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

function recordFact(entry) {
  const domain = entry.command?.includes("web") || entry.command?.includes("research")
    ? "growth"
    : entry.command?.includes("local") || entry.command?.includes("help")
      ? "aurora_ops"
      : "general";
  const fact = {
    id: `AUTO-${entry.command}-${Date.now()}`,
    title: `Auto ingest: ${entry.command}`,
    statement: entry.response?.slice(0, 200) || entry.note || "Auto generated insight",
    tags: ["auto", entry.command],
    source: "activity",
    sourceType: "activity_log",
    taskId: "AUTO-LEARN",
    domain,
    confidence: entry.response ? 0.64 : 0.42,
    reuseScore: entry.command ? 0.55 : 0.35,
    validated: Boolean(entry.response),
    createdAt: new Date().toISOString()
  };
  fs.appendFileSync(knowledgePath, JSON.stringify(fact) + "\n");
  return fact;
}

const entries = readEntries().filter((entry) => entry.command && entry.response);
if (!entries.length) {
  console.log("Sin datos de actividad nuevos.");
  process.exit(0);
}

const fact = recordFact(entries[entries.length - 1]);
console.log("Fact ingested:", fact.id);
