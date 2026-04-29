import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const knowledgePath = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");
const activityPath = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
const learnerPointerPath = path.join(ROOT, ".agent/aurora/agent-learner.pointer.json");
const runnerPointerPath = path.join(ROOT, ".agent/aurora/auto-runner.pointer");

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

function fileAgeMs(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return Date.now() - fs.statSync(filePath).mtimeMs;
}

function safePercent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function summarizeCounts(entries, key) {
  return Object.entries(
    entries.reduce((acc, entry) => {
      const value = entry[key];
      if (!value) return acc;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({ value, count }));
}

export function buildLearningProof() {
  const knowledge = readJsonl(knowledgePath);
  const activity = readJsonl(activityPath);
  const now = Date.now();
  const recent24h = knowledge.filter((entry) => {
    const createdAt = entry.createdAt ? new Date(entry.createdAt).getTime() : 0;
    return createdAt && now - createdAt <= 24 * 60 * 60 * 1000;
  });

  const structured = knowledge.filter((entry) =>
    typeof entry.sourceType === "string" &&
    typeof entry.taskId === "string" &&
    typeof entry.domain === "string" &&
    typeof entry.confidence === "number" &&
    typeof entry.reuseScore === "number" &&
    typeof entry.validated === "boolean"
  );
  const reusable = knowledge.filter((entry) => Number(entry.reuseScore) >= 0.7);
  const validated = knowledge.filter((entry) => entry.validated === true);
  const agentLearned = knowledge.filter((entry) => entry.sourceType === "agent_log");
  const productLearned = knowledge.filter((entry) => entry.sourceType && entry.sourceType !== "agent_log");

  const latestLearned = knowledge
    .slice(-8)
    .reverse()
    .map((entry) => ({
      id: entry.id,
      taskId: entry.taskId || "general",
      domain: entry.domain || "general",
      sourceType: entry.sourceType || "unknown",
      title: entry.title || entry.id,
      reuseScore: entry.reuseScore ?? null,
      validated: entry.validated ?? false
    }));

  const proof = {
    learning: {
      status:
        knowledge.length > 0 && validated.length > 0 && recent24h.length > 0
          ? "Aurora está aprendiendo"
          : "Aurora necesita más actividad o validación para demostrar aprendizaje fuerte",
      totalKnowledgeEntries: knowledge.length,
      recentKnowledgeEntries24h: recent24h.length,
      structuredKnowledgeEntries: structured.length,
      structuredCoveragePct: safePercent(structured.length, knowledge.length),
      validatedKnowledgeEntries: validated.length,
      validatedCoveragePct: safePercent(validated.length, knowledge.length),
      reusableKnowledgeEntries: reusable.length,
      reusableCoveragePct: safePercent(reusable.length, knowledge.length)
    },
    freshness: {
      knowledgeAgeMs: fileAgeMs(knowledgePath),
      activityAgeMs: fileAgeMs(activityPath),
      learnerPointerAgeMs: fileAgeMs(learnerPointerPath),
      runnerPointerAgeMs: fileAgeMs(runnerPointerPath)
    },
    diversity: {
      domains: summarizeCounts(knowledge, "domain"),
      tasks: summarizeCounts(knowledge, "taskId"),
      sourceTypes: summarizeCounts(knowledge, "sourceType")
    },
    sources: {
      agentLearnedEntries: agentLearned.length,
      productLearnedEntries: productLearned.length,
      recentActivityEntries: activity.slice(-10).length
    },
    latestLearned
  };

  proof.verdict = [
    proof.learning.totalKnowledgeEntries > 0 ? "memoria creada" : "sin memoria",
    proof.learning.recentKnowledgeEntries24h > 0 ? "aprendizaje reciente" : "sin aprendizaje reciente",
    proof.learning.reusableCoveragePct >= 50 ? "reutilización razonable" : "reutilización todavía baja",
    proof.learning.validatedCoveragePct >= 50 ? "base validada" : "validación todavía baja"
  ];

  return proof;
}

const entryPointUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1]))
  : null;

if (entryPointUrl && entryPointUrl.href === import.meta.url) {
  console.log(JSON.stringify(buildLearningProof(), null, 2));
}
