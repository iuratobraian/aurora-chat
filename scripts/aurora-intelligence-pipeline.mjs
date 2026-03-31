#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";

const readText = (relativePath) => {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
};

const readJson = (relativePath) => JSON.parse(readText(relativePath));

function readJsonl(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function writeJsonl(relativePath, records) {
  const full = path.join(ROOT, relativePath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, records.map(r => JSON.stringify(r)).join("\n") + "\n");
}

function appendJsonl(relativePath, record) {
  const full = path.join(ROOT, relativePath);
  fs.appendFileSync(full, JSON.stringify(record) + "\n");
}

function scoreRelevance(record, query) {
  const queryLower = query.toLowerCase();
  const terms = queryLower.split(/\s+/);
  let score = 0;
  
  const searchableText = [
    record.title || "",
    record.statement || "",
    record.tags?.join(" ") || "",
    record.collection || ""
  ].join(" ").toLowerCase();
  
  for (const term of terms) {
    if (searchableText.includes(term)) score += 1;
  }
  
  if (record.confidence) score += record.confidence * 0.5;
  if (record.reuseScore) score += record.reuseScore * 0.3;
  
  return score;
}

function RETRIEVE(query, collections = ["heuristics", "patterns", "error_catalog", "teamwork_knowledge"]) {
  console.log(`${CYAN}📥 RETRIEVE:${RESET} Searching for "${query}"`);
  
  const allRecords = [];
  for (const collection of collections) {
    const records = readJsonl(`.agent/brain/db/${collection}.jsonl`);
    for (const record of records) {
      allRecords.push({ ...record, collection });
    }
  }
  
  const scored = allRecords.map(r => ({
    ...r,
    relevanceScore: scoreRelevance(r, query)
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  const top = scored.slice(0, 10);
  console.log(`  Found ${scored.length} total records, top ${top.length} by relevance`);
  
  return top;
}

function JUDGE(records, query) {
  console.log(`${CYAN}⚖️ JUDGE:${RESET} Evaluating ${records.length} records`);
  
  const judged = records.map(record => {
    let verdict = "useful";
    let reason = "Matches query and has good signal";
    
    const isStale = record.createdAt && 
      (Date.now() - new Date(record.createdAt).getTime()) > 30 * 24 * 60 * 60 * 1000;
    if (isStale) {
      verdict = "stale";
      reason = "Record older than 30 days";
    }
    
    const hasLowConfidence = record.confidence && record.confidence < 0.3;
    if (hasLowConfidence) {
      verdict = verdict === "stale" ? "discard" : "low_confidence";
      reason += ", low confidence";
    }
    
    const isValidated = record.validated === true;
    
    return {
      ...record,
      verdict,
      reason,
      isValidated,
      judgedAt: new Date().toISOString()
    };
  });
  
  const counts = { useful: 0, low_confidence: 0, stale: 0, discard: 0 };
  judged.forEach(r => counts[r.verdict]++);
  console.log(`  Verdict: ${counts.useful} useful, ${counts.low_confidence} low_confidence, ${counts.stale} stale, ${counts.discard} discard`);
  
  return judged;
}

function DISTILL(judgedRecords, query) {
  console.log(`${CYAN}🧪 DISTILL:${RESET} Extracting insights from ${judgedRecords.length} records`);
  
  const usefulRecords = judgedRecords.filter(r => r.verdict === "useful" || r.verdict === "low_confidence");
  
  const distilled = {
    id: `distill-${Date.now()}`,
    query,
    timestamp: new Date().toISOString(),
    summary: "",
    keyInsights: [],
    actionItems: [],
    confidence: 0
  };
  
  const insightsByCollection = {};
  for (const record of usefulRecords) {
    if (!insightsByCollection[record.collection]) {
      insightsByCollection[record.collection] = [];
    }
    insightsByCollection[record.collection].push({
      title: record.title,
      statement: record.statement?.substring(0, 200),
      tags: record.tags
    });
  }
  
  distilled.keyInsights = usefulRecords.slice(0, 5).map(r => ({
    title: r.title || r.id,
    insight: r.statement?.substring(0, 150) || "No statement",
    collection: r.collection,
    confidence: r.confidence || 0.5
  }));
  
  distilled.actionItems = usefulRecords
    .filter(r => r.tags?.includes("action") || r.tags?.includes("todo"))
    .slice(0, 3)
    .map(r => r.statement || r.title);
  
  const avgConfidence = usefulRecords.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / usefulRecords.length;
  distilled.confidence = avgConfidence;
  
  distilled.summary = `Pipeline distilled ${usefulRecords.length} useful records into ${distilled.keyInsights.length} key insights with ${Math.round(avgConfidence * 100)}% confidence`;
  
  console.log(`  Extracted ${distilled.keyInsights.length} key insights`);
  console.log(`  Generated ${distilled.actionItems.length} action items`);
  
  return distilled;
}

function CONSOLIDATE(distilled, previousConsolidations = []) {
  console.log(`${CYAN}📚 CONSOLIDATE:${RESET} Saving to knowledge base`);
  
  const consolidated = {
    ...distilled,
    consolidatedAt: new Date().toISOString(),
    version: (previousConsolidations.length || 0) + 1,
    previousVersions: previousConsolidations.length
  };
  
  appendJsonl(".agent/brain/db/consolidations.jsonl", consolidated);
  
  const kbPath = ".agent/brain/db/knowledge_index.json";
  let index = { entries: [], lastUpdated: null };
  if (fs.existsSync(kbPath)) {
    try { 
      const existing = JSON.parse(readText(kbPath));
      index = { entries: existing.entries || [], lastUpdated: existing.lastUpdated };
    } catch {}
  }
  if (!index.entries) index.entries = [];
  
  index.entries.push({
    id: consolidated.id,
    query: consolidated.query,
    timestamp: consolidated.timestamp,
    insightCount: consolidated.keyInsights.length,
    confidence: consolidated.confidence
  });
  index.lastUpdated = new Date().toISOString();
  fs.writeFileSync(kbPath, JSON.stringify(index, null, 2));
  
  console.log(`  Saved consolidation v${consolidated.version}`);
  console.log(`  Updated knowledge index with ${index.entries.length} total entries`);
  
  return consolidated;
}

async function runPipeline(query) {
  console.log(`\n${BOLD}🧠 Aurora Intelligence Pipeline${RESET}\n`);
  console.log(`${CYAN}Query:${RESET} "${query}"`);
  console.log("=".repeat(50));
  
  const retrieved = RETRIEVE(query);
  const judged = JUDGE(retrieved, query);
  const distilled = DISTILL(judged, query);
  
  const previousConsolidations = readJsonl(".agent/brain/db/consolidations.jsonl");
  const consolidated = CONSOLIDATE(distilled, previousConsolidations);
  
  console.log("\n" + "=".repeat(50));
  console.log(`${BOLD}✅ Pipeline Complete${RESET}\n`);
  console.log(`Summary: ${consolidated.summary}`);
  
  if (consolidated.actionItems.length > 0) {
    console.log(`\n${YELLOW}Action Items:${RESET}`);
    consolidated.actionItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item}`);
    });
  }
  
  return consolidated;
}

const query = process.argv[2] || "aurora agent intelligence";
runPipeline(query).catch(console.error);
