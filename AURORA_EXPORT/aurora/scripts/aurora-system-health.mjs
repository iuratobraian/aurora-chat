#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SCRIPTS = {
  knowledge: "scripts/aurora-knowledge-validator.mjs",
  surface: "scripts/aurora-surface-monitor.mjs",
  contracts: "scripts/aurora-contract-validator.mjs",
  destil: "scripts/aurora-auto-destil.mjs",
};

function runScript(name, script) {
  console.log(`\n📜 Running ${name}...`);
  try {
    const fullPath = path.join(ROOT, script);
    if (fs.existsSync(fullPath)) {
      execSync(`node "${fullPath}"`, { cwd: ROOT, stdio: "inherit" });
      return true;
    } else {
      console.log(`   ⚠️  Script not found: ${script}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error running ${name}`);
    return false;
  }
}

function getMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    scripts: {},
    summary: {
      passed: 0,
      failed: 0,
    },
  };

  const scriptList = [
    { name: "knowledge", path: SCRIPTS.knowledge },
    { name: "surface", path: SCRIPTS.surface },
    { name: "contracts", path: SCRIPTS.contracts },
  ];

  for (const { name, path: scriptPath } of scriptList) {
    const fullPath = path.join(ROOT, scriptPath);
    if (!fs.existsSync(fullPath)) {
      metrics.scripts[name] = { status: "missing" };
      metrics.summary.failed++;
      continue;
    }
    metrics.scripts[name] = { status: "available" };
  }

  return metrics;
}

function main() {
  console.log("🧠 Aurora Auto-Learn & Health Check\n");
  console.log("=".repeat(50));
  console.log(`Started: ${new Date().toISOString()}\n`);

  let passed = 0;
  let failed = 0;

  console.log("🔍 Phase 1: Health Checks");
  console.log("-".repeat(30));

  if (runScript("Knowledge Validator", SCRIPTS.knowledge)) passed++;
  else failed++;

  if (runScript("Surface Monitor", SCRIPTS.surface)) passed++;
  else failed++;

  if (runScript("Contract Validator", SCRIPTS.contracts)) passed++;
  else failed++;

  console.log("\n📊 Phase 2: Learning");
  console.log("-".repeat(30));

  if (runScript("Knowledge Destiller", SCRIPTS.destil)) {
    console.log("   ✅ Knowledge distillation complete");
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📈 Aurora System Health Summary");
  console.log("-".repeat(30));

  const metrics = getMetrics();
  console.log(`   Timestamp: ${metrics.timestamp}`);
  console.log(`   Scripts Available: ${Object.values(metrics.scripts).filter(s => s.status === "available").length}`);
  console.log(`   Scripts Passed: ${passed}`);
  console.log(`   Scripts Failed: ${failed}`);

  const healthScore = Math.round((passed / (passed + failed || 1)) * 100);
  console.log(`\n   🟢 Aurora Health Score: ${healthScore}/100`);

  if (healthScore >= 90) {
    console.log("   ✅ Aurora is operating at peak efficiency!");
  } else if (healthScore >= 70) {
    console.log("   ⚠️  Aurora needs some attention.");
  } else {
    console.log("   🔴 Aurora needs urgent maintenance.");
  }

  console.log("\n📋 Next Steps:");
  console.log("   1. Review failed scripts");
  console.log("   2. Update knowledge base with new learnings");
  console.log("   3. Check surface health if below 80%");
  console.log("   4. Validate contracts if errors found");

  console.log("\n" + "=".repeat(50));
  console.log("\n✨ Auto-learn cycle complete!\n");
}

main();
