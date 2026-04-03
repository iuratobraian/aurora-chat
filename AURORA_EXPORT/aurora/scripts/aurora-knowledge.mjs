import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const query = (process.argv[2] || "").toLowerCase();
const files = [
  ".agent/brain/db/heuristics.jsonl",
  ".agent/brain/db/anti_patterns.jsonl",
  ".agent/brain/db/patterns.jsonl",
  ".agent/brain/db/ideas.jsonl",
  ".agent/brain/db/references.jsonl",
  ".agent/brain/db/error_catalog.jsonl",
  ".agent/brain/db/teamwork_knowledge.jsonl"
];

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .map((item) => ({ ...item, _collection: path.basename(relativePath) }));
}

const all = files.flatMap(readJsonl);
const filtered = query
  ? all.filter((item) => JSON.stringify(item).toLowerCase().includes(query))
  : all;

console.log("Aurora Knowledge Query");
console.log("======================");
console.log(`Query: ${query || "(all)"}`);
console.log(`Results: ${filtered.length}`);
console.log("");

for (const item of filtered.slice(0, 20)) {
  const title = item.title || item.id || "record";
  const statement = item.statement || item.url || item.status || "";
  console.log(`[${item._collection}] ${title}`);
  if (statement) console.log(`  ${statement}`);
}
