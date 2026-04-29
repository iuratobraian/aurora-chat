import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const logPath = path.join(ROOT, ".agent/workspace/coordination/AGENT_LOG.md");
const knowledgePath = path.join(ROOT, ".agent/brain/db/teamwork_knowledge.jsonl");
const pointerPath = path.join(ROOT, ".agent/aurora/agent-learner.pointer.json");

function ensureDirectories() {
  const dir = path.dirname(pointerPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.dirname(knowledgePath))) fs.mkdirSync(path.dirname(knowledgePath), { recursive: true });
}

function readPointer() {
  if (!fs.existsSync(pointerPath)) return new Set();
  try {
    const raw = fs.readFileSync(pointerPath, "utf8");
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function writePointer(ids) {
  const list = Array.from(ids).slice(-400);
  fs.writeFileSync(pointerPath, JSON.stringify(list, null, 2), "utf8");
}

function hashSection(header, body) {
  return crypto.createHash("sha256").update(`${header}::${body}`).digest("hex");
}

function parseAgentSections() {
  if (!fs.existsSync(logPath)) return [];
  const raw = fs.readFileSync(logPath, "utf8");
  const parts = raw.split(/\n###\s*/).map((chunk) => chunk.trim()).filter(Boolean);
  const sections = [];
  for (const part of parts) {
    const lines = part.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    const headerLine = lines[0];
    const headerMatch = headerLine.match(/^(\d{4}-\d{2}-\d{2})\s*-\s*(.+)$/);
    if (!headerMatch) continue;
    const [, date, agent] = headerMatch;
    const bodyLines = lines.slice(1);
    const data = {
      task: "",
      estado: "",
      archivos: "",
      validacion: "",
      riesgo: "",
      notas: ""
    };
    bodyLines.forEach((line) => {
      const match = line.match(/^-+\s*(.+?):\s*(.*)$/);
      if (match) {
        const key = match[1].toLowerCase().trim();
        const value = match[2].trim();
        if (key.startsWith("task-id")) data.task = value;
        else if (key.startsWith("estado")) data.estado = value;
        else if (key.startsWith("archivos")) data.archivos = value;
        else if (key.startsWith("validación") || key.startsWith("validacion")) data.validacion = value;
        else if (key.startsWith("riesgo")) data.riesgo = value;
      } else if (line.startsWith("- ")) {
        data.notas = `${data.notas} ${line.replace(/^-+\s*/, "").trim()}`.trim();
      }
    });
    const body = bodyLines.join(" ");
    const sectionId = hashSection(headerLine, body);
    sections.push({
      id: sectionId,
      header: headerLine,
      date,
      agent,
      summary: data.validacion || data.notas || "Sin validación documentada",
      task: data.task,
      files: data.archivos,
      risk: data.riesgo,
      note: data.notas
    });
  }
  return sections;
}

function appendFact(section) {
  const normalizedTaskId = section.task ? section.task.split(/\s+/)[0].trim() : "general";
  const domain = /^GROW|^MKT|^SALE/.test(normalizedTaskId)
    ? "growth"
    : /^SEC|^PAY|^INF/.test(normalizedTaskId)
      ? "security"
      : /^AI|^OPS/.test(normalizedTaskId)
        ? "aurora_ops"
        : /^TP|^CORE|^CRIT|^STAB/.test(normalizedTaskId)
          ? "community_product"
          : "general";
  const fact = {
    id: `AGENT-${section.agent.replace(/\s+/g, "-").toUpperCase()}-${Date.now()}`,
    title: `Aprendizaje desde mesa: ${section.agent} (${section.date})`,
    statement: `Tarea: ${section.task || "sin id"}. Validación: ${section.summary}. Archivos: ${section.files || "n/d"}. Riesgo: ${section.risk || "controlado"}.`,
    tags: ["agent-learning", section.agent.toLowerCase(), section.task || "general"],
    source: "agent_log",
    sourceType: "agent_log",
    taskId: normalizedTaskId,
    domain,
    confidence: section.summary ? 0.82 : 0.58,
    reuseScore: section.files ? 0.73 : 0.5,
    validated: Boolean(section.summary),
    createdAt: new Date().toISOString(),
    agent: section.agent
  };
  fs.appendFileSync(knowledgePath, JSON.stringify(fact) + "\n");
  return fact;
}

export function runAgentLearner() {
  ensureDirectories();
  const processed = readPointer();
  const sections = parseAgentSections();
  const newSections = sections.filter((section) => !processed.has(section.id));
  if (!newSections.length) {
    console.log("Aurora Agent Learner: sin nuevas secciones.");
    return;
  }
  newSections.forEach((section) => {
    const fact = appendFact(section);
    console.log(`Aurora Agent Learner: registró ${fact.id}`);
    processed.add(section.id);
  });
  writePointer(processed);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  runAgentLearner();
}
