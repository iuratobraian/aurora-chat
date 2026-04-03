import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const logPath = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
const digestPath = path.join(ROOT, ".agent/aurora/activity_digests.jsonl");

function readEntries() {
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, "utf8")
    .trim()
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

function summarize(entries) {
  const counts = {};
  for (const entry of entries) {
    const cmd = entry.command || "other";
    counts[cmd] = (counts[cmd] || 0) + 1;
  }
  return {
    timestamp: new Date().toISOString(),
    total: entries.length,
    counts,
    last: entries[entries.length - 1]
  };
}

const entries = readEntries();
if (!entries.length) {
  console.log("Sin actividad para resumir.");
  process.exit(0);
}

const summary = summarize(entries);
fs.mkdirSync(path.dirname(digestPath), { recursive: true });
fs.appendFileSync(digestPath, JSON.stringify(summary) + "\n");
console.log("Digest created:", summary.timestamp);
