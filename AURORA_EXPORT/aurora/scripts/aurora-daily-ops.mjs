#!/usr/bin/env node
/**
 * Aurora Daily Operations Runner
 * Ejecuta las operaciones diarias de mantenimiento de Aurora
 */

import { execSync } from "node:child_process";

const SCRIPTS = [
  { name: "Brain Backup", script: "scripts/aurora-brain-backup.mjs", critical: true },
  { name: "Metrics Dashboard", script: "scripts/aurora-metrics-dashboard.mjs", critical: false },
  { name: "Auto-Learn", script: "scripts/aurora-auto-learn-v2.mjs", critical: false },
];

function runScript(script, critical) {
  try {
    console.log(`\n▶ ${script.name}...`);
    execSync(`node ${script.script}`, { stdio: "inherit" });
    return { success: true, name: script.name };
  } catch (err) {
    console.error(`❌ ${script.name} failed`);
    if (critical) {
      console.error("   Script crítico - abortando");
      process.exit(1);
    }
    return { success: false, name: script.name, error: err.message };
  }
}

function run() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🧠 AURORA DAILY OPERATIONS");
  console.log(`  📅 ${new Date().toISOString().slice(0, 10)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const results = [];
  for (const script of SCRIPTS) {
    const result = runScript(script, script.critical);
    results.push(result);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  📊 RESUMEN");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  console.log(`  ✅ Exitosos: ${passed}`);
  console.log(`  ❌ Fallidos: ${failed}`);

  if (failed > 0) {
    console.log("\n  Scripts fallidos:");
    results.filter((r) => !r.success).forEach((r) => {
      console.log(`    - ${r.name}`);
    });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

run();
