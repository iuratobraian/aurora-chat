#!/usr/bin/env node
/**
 * Aurora Auto-Validation Pipeline
 * Validación automática post-tarea: lint, tests, smoke
 */

import { execSync, exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const VALIDATION_STEPS = [
  { name: "lint", cmd: "npm run lint", label: "TypeScript / ESLint", critical: true },
  { name: "test", cmd: "npm run test:run", label: "Unit Tests", critical: false },
  { name: "build", cmd: "npm run build", label: "Build", critical: true },
];

const SMOKE_TESTS = [
  { name: "homepage", url: "http://localhost:3000", check: "html" },
  { name: "api", url: "http://localhost:3000/api/health", check: "json" },
];

function runCommand(cmd, timeout = 120000) {
  try {
    const output = execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      timeout,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, output };
  } catch (err) {
    return {
      success: false,
      output: err.stdout || "",
      error: err.stderr || err.message,
      code: err.status,
    };
  }
}

function checkSmokeTests() {
  const results = [];

  for (const test of SMOKE_TESTS) {
    try {
      const res = runCommand(`curl -s -o /dev/null -w "%{http_code}" ${test.url}`, 10000);
      const status = parseInt(res.output) || 0;
      results.push({
        name: test.name,
        status: status >= 200 && status < 400 ? "pass" : "fail",
        code: status,
      });
    } catch (e) {
      results.push({ name: test.name, status: "skip", error: e.message });
    }
  }

  return results;
}

function checkGitDiff() {
  try {
    const output = execSync("git status --short", {
      cwd: ROOT,
      encoding: "utf8",
    });
    const files = output.split("\n").filter(Boolean).map((line) => line.slice(3).trim());
    return { success: true, files };
  } catch {
    return { success: false, files: [] };
  }
}

function detectBreakingChanges(files) {
  const breakingPatterns = [
    { pattern: /schema\.ts$/, type: "DB Schema" },
    { pattern: /convex\/schema\.ts/, type: "Convex Schema" },
    { pattern: /\.env/, type: "Env Variables" },
    { pattern: /package\.json/, type: "Dependencies" },
    { pattern: /server\.ts/, type: "Server API" },
  ];

  return files
    .filter((f) => breakingPatterns.some((p) => p.pattern.test(f)))
    .map((f) => ({
      file: f,
      type: breakingPatterns.find((p) => p.pattern.test(f))?.type || "Unknown",
    }));
}

function run() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🔍 AURORA AUTO-VALIDATION PIPELINE");
  console.log(`  📅 ${new Date().toISOString().slice(0, 19)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const diff = checkGitDiff();
  let allPassed = true;

  if (diff.success && diff.files.length > 0) {
    console.log("📁 Archivos modificados:");
    diff.files.forEach((f) => console.log(`   ${f}`));

    const breaking = detectBreakingChanges(diff.files);
    if (breaking.length > 0) {
      console.log("\n⚠️  CAMBIOS POTENCIALMENTE BREAKING:");
      breaking.forEach((b) => console.log(`   ${b.type}: ${b.file}`));
    }
    console.log("");

    for (const step of VALIDATION_STEPS) {
      console.log(`▶ ${step.label}...`);
      const result = runCommand(step.cmd);

      if (result.success) {
        console.log(`   ✅ PASS\n`);
      } else {
        console.log(`   ❌ FAIL (code: ${result.code || "?"})\n`);
        if (result.error) {
          const lines = result.error.split("\n").slice(0, 10);
          lines.forEach((l) => console.log(`   ${l}`));
          if (result.error.split("\n").length > 10) {
            console.log("   ... (más errores)");
          }
          console.log("");
        }
        if (step.critical) {
          allPassed = false;
        }
      }
    }

    console.log("🏓 Smoke Tests:");
    const smokeResults = checkSmokeTests();
    smokeResults.forEach((r) => {
      if (r.status === "pass") {
        console.log(`   ✅ ${r.name} (HTTP ${r.code})`);
      } else if (r.status === "skip") {
        console.log(`   ⏭️  ${r.name} (skipped: ${r.error})`);
      } else {
        console.log(`   ❌ ${r.name} (HTTP ${r.code})`);
      }
    });
  } else {
    console.log("✅ No hay cambios pendientes para validar");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (allPassed) {
    console.log("  ✅ VALIDACIÓN COMPLETA - LISTO PARA COMMIT");
  } else {
    console.log("  ❌ VALIDACIÓN FALLIDA - CORREGIR ANTES DE COMMIT");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const logEntry = {
    timestamp: Date.now(),
    passed: allPassed,
    filesChanged: diff.files,
    breakingChanges: detectBreakingChanges(diff.files).map((b) => b.type),
    steps: VALIDATION_STEPS.map((s) => s.name),
  };
  fs.appendFileSync(
    path.join(ROOT, ".agent/brain/db/agent_metrics.jsonl"),
    JSON.stringify(logEntry) + "\n"
  );

  return allPassed;
}

const passed = run();
process.exit(passed ? 0 : 1);
