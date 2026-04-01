import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const knowledgePath = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");
const activityPath = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
const agentLogPath = path.join(ROOT, ".agent/workspace/coordination/AGENT_LOG.md");
const learningLogPath = path.join(ROOT, ".agent/workspace/coordination/LEARNING_LOG.md");
const taskBoardPath = path.join(ROOT, ".agent/workspace/coordination/TASK_BOARD.md");
const focusPath = path.join(ROOT, ".agent/workspace/coordination/CURRENT_FOCUS.md");
const scoresDir = path.join(ROOT, ".agent/aurora/scores");

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

function safePercent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function fileAgeMs(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return Date.now() - fs.statSync(filePath).mtimeMs;
}

function countSections(markdown, prefix) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith(prefix))
    .length;
}

function hasStructuredMetadata(entry) {
  return (
    typeof entry.sourceType === "string" &&
    typeof entry.taskId === "string" &&
    typeof entry.domain === "string" &&
    typeof entry.confidence === "number" &&
    typeof entry.reuseScore === "number" &&
    typeof entry.validated === "boolean"
  );
}

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function parseTaskBoard(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("|") && !line.includes("TASK-ID") && !line.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .map(([id, status, owner, scope, files, goal, acceptance]) => ({ id, status, owner, scope, files, goal, acceptance }));
}

function calculateDriftScore(tasks, focusText, logText) {
  const claimedTasks = tasks.filter((t) => t.status === "claimed");
  const focusMissing = claimedTasks.filter((t) => !focusText.includes(t.id)).length;
  
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const logMissing = pendingTasks.filter((t) => !logText.includes(t.id)).length;
  
  const totalChecks = claimedTasks.length + pendingTasks.length;
  if (totalChecks === 0) return 0;
  
  const driftPoints = focusMissing + logMissing;
  return Math.round((driftPoints / totalChecks) * 100);
}

function calculateContextPrecision(knowledge, activity) {
  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recentActivity = activity.filter((a) => new Date(a.timestamp).getTime() > last24h);
  
  if (recentActivity.length === 0) return 50;
  
  const recentQueries = recentActivity.filter((a) => a.type === "query");
  if (recentQueries.length === 0) return 50;
  
  const uniqueDomains = [...new Set(recentQueries.map((a) => a.domain))];
  const coverage = Math.min(100, uniqueDomains.length * 20);
  
  return coverage;
}

function saveDailyScore(scoreData) {
  if (!fs.existsSync(scoresDir)) {
    fs.mkdirSync(scoresDir, { recursive: true });
  }
  const today = new Date().toISOString().split("T")[0];
  const filePath = path.join(scoresDir, `score-${today}.json`);
  fs.writeFileSync(filePath, JSON.stringify(scoreData, null, 2));
}

function getHistoricalScores(days = 7) {
  if (!fs.existsSync(scoresDir)) return [];
  const files = fs.readdirSync(scoresDir).filter((f) => f.startsWith("score-") && f.endsWith(".json"));
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  
  return files
    .map((file) => {
      const filePath = path.join(scoresDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return { date: file.replace("score-", "").replace(".json", ""), ...data };
    })
    .filter((s) => new Date(s.date).getTime() > cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

const knowledge = readJsonl(knowledgePath);
const activity = readJsonl(activityPath);
const agentLog = fs.existsSync(agentLogPath) ? fs.readFileSync(agentLogPath, "utf8") : "";
const learningLog = fs.existsSync(learningLogPath) ? fs.readFileSync(learningLogPath, "utf8") : "";
const taskBoard = fs.existsSync(taskBoardPath) ? parseTaskBoard(fs.readFileSync(taskBoardPath, "utf8")) : [];
const focus = fs.existsSync(focusPath) ? fs.readFileSync(focusPath, "utf8") : "";

const structuredEntries = knowledge.filter(hasStructuredMetadata);
const validatedEntries = knowledge.filter((entry) => entry.validated === true);
const confidenceValues = structuredEntries.map((entry) => entry.confidence).filter((value) => Number.isFinite(value));
const reuseValues = structuredEntries.map((entry) => entry.reuseScore).filter((value) => Number.isFinite(value));
const recentActivity = activity.filter((entry) => {
  if (!entry.timestamp) return false;
  return Date.now() - new Date(entry.timestamp).getTime() <= 24 * 60 * 60 * 1000;
});

const domains = structuredEntries.reduce((acc, entry) => {
  acc[entry.domain] = (acc[entry.domain] || 0) + 1;
  return acc;
}, {});

const utilityScore = Math.min(100, Math.round((validatedEntries.length / Math.max(1, knowledge.length)) * 100));
const reuseScore = average(reuseValues);
const driftScore = calculateDriftScore(taskBoard, focus, agentLog);
const contextPrecision = calculateContextPrecision(knowledge, activity);
const overallScore = Math.round((utilityScore * 0.3 + reuseScore * 0.2 + (100 - driftScore) * 0.3 + contextPrecision * 0.2));

const summary = {
  generatedAt: new Date().toISOString(),
  metrics: {
    utilityScore,
    reuseScore,
    driftScore,
    contextPrecision,
    overallScore
  },
  knowledgeEntries: knowledge.length,
  structuredKnowledgeEntries: structuredEntries.length,
  structuredCoveragePct: safePercent(structuredEntries.length, knowledge.length),
  validatedKnowledgeEntries: validatedEntries.length,
  validatedCoveragePct: safePercent(validatedEntries.length, knowledge.length),
  averageConfidence: average(confidenceValues),
  averageReuseScore: average(reuseValues),
  recentActivityEntries24h: recentActivity.length,
  agentLogEntries: countSections(agentLog, "### "),
  learningLogEntries: countSections(learningLog, "## "),
  activityFreshnessMs: fileAgeMs(activityPath),
  knowledgeFreshnessMs: fileAgeMs(knowledgePath),
  topDomains: Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count })),
  taskStats: {
    total: taskBoard.length,
    done: taskBoard.filter((t) => t.status === "done").length,
    pending: taskBoard.filter((t) => t.status === "pending").length,
    claimed: taskBoard.filter((t) => t.status === "claimed").length
  },
  historicalScores: getHistoricalScores(7)
};

saveDailyScore(summary);

console.log("AURORA SCORECARD");
console.log(JSON.stringify(summary, null, 2));

if (summary.metrics.driftScore > 30) {
  console.log(`Alert: Drift score alto (${summary.metrics.driftScore}%). Revisa consistencia entre TASK_BOARD, CURRENT_FOCUS y AGENT_LOG.`);
}
if (summary.structuredCoveragePct < 80) {
  console.log("Alert: la cobertura estructurada del conocimiento sigue baja.");
}
if (summary.validatedCoveragePct < 50) {
  console.log("Alert: falta validar una porcion grande del conocimiento.");
}
