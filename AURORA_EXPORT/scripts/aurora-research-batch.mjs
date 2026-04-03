import fs from "node:fs";
import path from "node:path";
import { researchRepo } from "./aurora-research.mjs";

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, ".agent/aurora/professional-growth-repos.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const manifest = readJson(manifestPath);
const limit = Number(process.argv[2] || 4);
const repos = manifest.tracks.flatMap((track) => track.repos).slice(0, limit);

let success = 0;
let fail = 0;

for (const repo of repos) {
  try {
    const result = await researchRepo(repo);
    if (result.success) success += 1;
    else fail += 1;
    console.log(`researched: ${repo} | success=${result.success}`);
  } catch (error) {
    fail += 1;
    console.log(`researched: ${repo} | success=false | error=${error.message}`);
  }
}

console.log(`Aurora research batch done. success=${success} fail=${fail} total=${repos.length}`);
