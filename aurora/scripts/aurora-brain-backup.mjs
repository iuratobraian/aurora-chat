#!/usr/bin/env node
/**
 * Aurora Brain Backup & Sync
 * Realiza backup automático de la base de conocimiento y sincroniza con repos externos
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BACKUP_DIR = ".agent/brain/backups";
const DATE = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const BACKUP_NAME = `brain_backup_${DATE}`;

const KNOWLEDGE_FILES = [
  ".agent/brain/db/heuristics.jsonl",
  ".agent/brain/db/anti_patterns.jsonl",
  ".agent/brain/db/patterns.jsonl",
  ".agent/brain/db/ideas.jsonl",
  ".agent/brain/db/error_catalog.jsonl",
  ".agent/brain/db/teamwork_knowledge.jsonl",
  ".agent/brain/knowledge/*.md",
  ".agent/workspace/coordination/TASK_BOARD.md",
  ".agent/workspace/coordination/AGENT_LOG.md",
  ".agent/aurora/*.json",
];

const DECISIONS_LOG = ".agent/brain/db/decisions_graph.jsonl";
const METRICS_LOG = ".agent/brain/db/agent_metrics.jsonl";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function backupKnowledgeFiles() {
  const backupPath = path.join(ROOT, BACKUP_DIR, BACKUP_NAME);
  ensureDir(backupPath);
  ensureDir(path.join(backupPath, "brain"));
  ensureDir(path.join(backupPath, "coordination"));

  let filesBacked = 0;
  let errors = [];

  for (const file of KNOWLEDGE_FILES) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const destDir = path.join(backupPath, "brain", path.basename(file));
          ensureDir(destDir);
          for (const subFile of fs.readdirSync(fullPath)) {
            const src = path.join(fullPath, subFile);
            const dst = path.join(destDir, subFile);
            fs.copyFileSync(src, dst);
            filesBacked++;
          }
        } else {
          const dest = path.join(backupPath, file.replace(".agent/", ""));
          ensureDir(path.dirname(dest));
          fs.copyFileSync(fullPath, dest);
          filesBacked++;
        }
      } catch (e) {
        errors.push(`Error backing ${file}: ${e.message}`);
      }
    }
  }

  return { filesBacked, errors };
}

function updateDecisionsGraph(action, details) {
  const entry = {
    timestamp: Date.now(),
    action,
    details,
    agent: "aurora-core",
  };
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(path.join(ROOT, DECISIONS_LOG), line, "utf8");
}

function recordMetric(metric) {
  const entry = {
    timestamp: Date.now(),
    ...metric,
  };
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(path.join(ROOT, METRICS_LOG), line, "utf8");
}

function generateInsights() {
  const insights = [];
  
  try {
    const logPath = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
    if (fs.existsSync(logPath)) {
      const lines = fs.readFileSync(logPath, "utf8").split("\n").filter(Boolean);
      const last24h = lines.filter((line) => {
        try {
          const entry = JSON.parse(line);
          return Date.now() - entry.timestamp < 24 * 60 * 60 * 1000;
        } catch {
          return false;
        }
      });
      
      if (last24h.length > 0) {
        insights.push(`Actividad en 24h: ${last24h.length} entradas`);
      }
    }
  } catch (e) {
    insights.push(`Error analizando logs: ${e.message}`);
  }

  return insights;
}

function run() {
  console.log(`\n🧠 Aurora Brain Backup - ${new Date().toISOString()}\n`);
  
  const { filesBacked, errors } = backupKnowledgeFiles();
  console.log(`✅ Archivos respaldados: ${filesBacked}`);
  
  if (errors.length > 0) {
    console.log(`⚠️ Errores: ${errors.length}`);
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  updateDecisionsGraph("brain_backup", {
    filesBacked,
    backupName: BACKUP_NAME,
  });

  const insights = generateInsights();
  if (insights.length > 0) {
    console.log(`\n📊 Insights:`);
    insights.forEach((i) => console.log(`  - ${i}`));
  }

  recordMetric({
    type: "backup",
    filesBacked,
    errors: errors.length,
    backupName: BACKUP_NAME,
  });

  console.log(`\n✅ Backup completo: ${BACKUP_DIR}/${BACKUP_NAME}\n`);
}

run();
