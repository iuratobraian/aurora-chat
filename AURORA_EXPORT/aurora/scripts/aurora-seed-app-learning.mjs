import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const surfacesPath = path.join(ROOT, ".agent/aurora/product-surfaces.json");
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
  fs.appendFileSync(
    knowledgePath,
    fresh.map((entry) => JSON.stringify(entry)).join("\n") + "\n"
  );
  return fresh.length;
}

const surfaces = readJson(surfacesPath);
const now = new Date().toISOString();

const records = surfaces.prioritySurfaces.flatMap((surface) => {
  const surfaceRecord = {
    id: `SURFACE-${surface.id.toUpperCase()}`,
    title: `Superficie prioritaria: ${surface.label}`,
    statement: `Objetivo: ${surface.goal}. Señales clave: ${surface.signals.join(", ")}. Archivos de referencia: ${surface.files.join(", ")}.`,
    tags: ["product-surface", surface.id, surface.domain],
    source: "aurora_product_map",
    sourceType: "product_surface",
    taskId: "OPS-038",
    domain: surface.domain,
    confidence: 0.9,
    reuseScore: 0.88,
    validated: true,
    createdAt: now
  };

  const antigravityRecord = {
    id: `ANTIGRAVITY-${surface.id.toUpperCase()}`,
    title: `Modo Antigravity para ${surface.label}`,
    statement: `Cuando Aurora trabaje en Antigravity sobre ${surface.label}, debe priorizar cambios pequeños, lectura del board, validación local y cierre con aprendizaje reusable.`,
    tags: ["antigravity", "programmer-mode", surface.id],
    source: "aurora_product_map",
    sourceType: "agent_mode",
    taskId: "OPS-038",
    domain: "aurora_ops",
    confidence: 0.86,
    reuseScore: 0.84,
    validated: true,
    createdAt: now
  };

  return [surfaceRecord, antigravityRecord];
});

const creationRecord = {
  id: "ANTIGRAVITY-CREATOR-MODE",
  title: "Modo creador de apps en Antigravity",
  statement: `Aurora puede actuar como creadora de apps si usa incubadores ordenados, conecta cada idea con arquitectura, monetización y validación, y evita mezclar nuevas creaciones con el producto principal.`,
  tags: ["antigravity", "creator-mode", "app-builder"],
  source: "aurora_product_map",
  sourceType: "agent_mode",
  taskId: "OPS-038",
  domain: "aurora_ops",
  confidence: 0.92,
  reuseScore: 0.9,
  validated: true,
  createdAt: now
};

const inserted = appendIfMissing([...records, creationRecord]);
console.log(`Aurora app learning seeded: ${inserted} records added.`);
