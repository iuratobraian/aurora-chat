#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, ".agent/aurora/aurora_surface_registry.json");
const SURFACES_PATH = path.join(ROOT, "scripts");

const CONTRACT_FILES = {
  "aurora_handoff_brief": ".agent/aurora/contracts/aurora_handoff_brief.json",
  "aurora_next_best_step": ".agent/aurora/contracts/aurora_next_best_step.json",
  "aurora_scorecard_daily": ".agent/aurora/contracts/aurora_scorecard_daily.json",
  "aurora_drift_report": ".agent/aurora/contracts/aurora_drift_report.json",
  "aurora_learning_record": ".agent/aurora/contracts/aurora_learning_record.json",
  "aurora_validation_checklist": ".agent/aurora/contracts/aurora_validation_checklist.json",
  "aurora_risk_signal": ".agent/aurora/contracts/aurora_risk_signal.json",
  "aurora_task_context_pack": ".agent/aurora/contracts/aurora_task_context_pack.json",
  "aurora_health_snapshot": ".agent/aurora/contracts/aurora_health_snapshot.json",
};

function fileExists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

function fileAge(filePath) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return null;
  return Date.now() - fs.statSync(fullPath).mtimeMs;
}

function getFilesInDir(dir, pattern) {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) return [];
  
  try {
    return fs.readdirSync(fullPath)
      .filter(f => f.includes(pattern))
      .map(f => path.join(dir, f));
  } catch {
    return [];
  }
}

function checkSurface(surface) {
  const checks = {
    exists: true,
    dependencies: [],
    scripts: [],
    health: 100,
    issues: [],
    lastModified: null,
  };

  for (const dep of surface.dependencies || []) {
    const exists = fileExists(dep);
    const age = fileAge(dep);
    checks.dependencies.push({
      path: dep,
      exists,
      age,
    });
    
    if (!exists) {
      checks.health -= 20;
      checks.issues.push(`Missing dependency: ${dep}`);
    }
  }

  const scriptFiles = getFilesInDir("scripts", "aurora-");
  checks.scripts = scriptFiles;

  checks.lastModified = Math.max(
    ...checks.dependencies
      .filter(d => d.age)
      .map(d => d.age),
    0
  );

  if (checks.lastModified > 7 * 24 * 60 * 60 * 1000) {
    checks.health -= 10;
    checks.issues.push("Surface not updated in 7+ days");
  }

  return checks;
}

function checkContracts() {
  const results = {};
  let total = 0;
  let valid = 0;

  for (const [name, filePath] of Object.entries(CONTRACT_FILES)) {
    total++;
    const fullPath = path.join(ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
      results[name] = { status: "missing", health: 0 };
      continue;
    }

    try {
      const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      const hasRequired = content.requiredFields?.length > 0;
      const hasArtifact = content.artifact === name;
      
      if (hasRequired && hasArtifact) {
        results[name] = { status: "valid", health: 100 };
        valid++;
      } else {
        results[name] = { status: "incomplete", health: 50 };
      }
    } catch {
      results[name] = { status: "invalid", health: 0 };
    }
  }

  return { results, total, valid, health: Math.round((valid / total) * 100) };
}

function main() {
  console.log("🧠 Aurora Surface Monitor\n");
  console.log("=".repeat(50));

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const contractCheck = checkContracts();

  console.log("\n📋 Surface Registry Health");
  console.log("-".repeat(30));

  const surfaceResults = [];
  let totalHealth = 0;

  for (const surface of registry.surfaces || []) {
    const checks = checkSurface(surface);
    totalHealth += checks.health;

    const status = checks.health >= 80 ? "✅" : checks.health >= 50 ? "⚠️" : "❌";
    surfaceResults.push({
      id: surface.surfaceId,
      health: checks.health,
      status,
      issues: checks.issues,
    });

    console.log(`\n${status} ${surface.surfaceId}`);
    console.log(`   Health: ${checks.health}/100`);
    
    if (checks.issues.length > 0) {
      for (const issue of checks.issues) {
        console.log(`   ⚠️  ${issue}`);
      }
    }

    console.log(`   Core: ${surface.coreOrSatellite}`);
    console.log(`   Metrics: ${surface.primaryMetric}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📝 Contract Registry");
  console.log("-".repeat(30));

  for (const [name, result] of Object.entries(contractCheck.results)) {
    const icon = result.status === "valid" ? "✅" : result.status === "missing" ? "❌" : "⚠️";
    console.log(`   ${icon} ${name}: ${result.status} (${result.health}%)`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Overall Health");
  console.log("-".repeat(30));

  const avgSurfaceHealth = surfaceResults.length > 0 
    ? Math.round(totalHealth / surfaceResults.length) 
    : 0;
  const overallHealth = Math.round((avgSurfaceHealth + contractCheck.health) / 2);

  console.log(`   Surface Health: ${avgSurfaceHealth}/100`);
  console.log(`   Contract Health: ${contractCheck.health}/100`);
  console.log(`   Overall Aurora Health: ${overallHealth}/100`);

  if (overallHealth >= 90) {
    console.log("\n   🟢 Aurora is healthy and operational.");
  } else if (overallHealth >= 70) {
    console.log("\n   ⚠️  Aurora is functional but needs attention.");
  } else {
    console.log("\n   🔴 Aurora needs urgent attention.");
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📈 Surface Health Scores");
  console.log("-".repeat(30));

  const sorted = [...surfaceResults].sort((a, b) => b.health - a.health);
  for (const s of sorted) {
    console.log(`   ${s.status} ${s.surfaceId}: ${s.health}/100`);
  }

  console.log("\n✨ Surface monitoring complete!\n");
}

main();
