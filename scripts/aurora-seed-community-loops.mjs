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

function appendIfMissing(entries) {
  const existing = new Set(readJsonl(knowledgePath).map((entry) => entry.id));
  const fresh = entries.filter((entry) => !existing.has(entry.id));
  if (!fresh.length) return 0;
  fs.appendFileSync(knowledgePath, fresh.map((entry) => JSON.stringify(entry)).join("\n") + "\n");
  return fresh.length;
}

const now = new Date().toISOString();
const loops = [
  {
    id: "COMMUNITY-LOOP-LEARNING",
    title: "Loop de aprendizaje",
    statement: "Ver valor -> guardar -> practicar -> compartir -> ganar reputacion -> volver. Aurora debe reforzar features que aceleren este loop en comunidad y academia.",
    tags: ["community-loop", "learning", "community_product"],
    domain: "community_product"
  },
  {
    id: "COMMUNITY-LOOP-SOCIAL",
    title: "Loop social",
    statement: "Descubrir -> comentar -> recibir respuesta -> seguir autores o comunidades -> volver. Aurora debe priorizar mejoras que reduzcan friccion entre lectura e interaccion.",
    tags: ["community-loop", "social", "community_product"],
    domain: "community_product"
  },
  {
    id: "COMMUNITY-LOOP-CREATOR",
    title: "Loop creator",
    statement: "Publicar valor -> ganar reputacion -> ganar seguidores -> monetizar -> volver a crear. Aurora debe aprender que creators y comunidad son una misma maquina de crecimiento.",
    tags: ["community-loop", "creator", "growth"],
    domain: "growth"
  },
  {
    id: "COMMUNITY-LOOP-TRUST",
    title: "Loop de confianza",
    statement: "Consumir contenido -> verificar señales -> confiar en autor o comunidad -> interactuar -> recomendar. Aurora debe reforzar reputacion, moderacion y claridad de contexto.",
    tags: ["community-loop", "trust", "security"],
    domain: "security"
  },
  {
    id: "COMMUNITY-LOOP-AURORA",
    title: "Loop de utilidad de Aurora",
    statement: "Pregunta -> claridad -> accion -> resultado -> aprendizaje reutilizable. Aurora debe medir si realmente redujo friccion para usuario, agente o creator.",
    tags: ["community-loop", "aurora", "aurora_ops"],
    domain: "aurora_ops"
  }
].map((entry) => ({
  ...entry,
  source: "community_loop_seed",
  sourceType: "product_loop",
  taskId: "OPS-039",
  confidence: 0.91,
  reuseScore: 0.9,
  validated: true,
  createdAt: now
}));

const inserted = appendIfMissing(loops);
console.log(`Aurora community loops seeded: ${inserted} records added.`);
