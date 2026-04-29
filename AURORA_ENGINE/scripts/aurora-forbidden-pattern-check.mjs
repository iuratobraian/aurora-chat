#!/usr/bin/env node
/**
 * Aurora Forbidden Pattern Check
 * Verifica patrones prohibidos en archivos modificados para cumplir con el Double Verification Protocol.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const FORBIDDEN_PATTERNS = [
  { pattern: /localStorage/g, label: "localStorage (Usa Convex o estado oficial)", severity: "error" },
  { pattern: /en desarrollo/gi, label: "Placeholder 'en desarrollo'", severity: "error" },
  { pattern: /mock(?!s\/)/gi, label: "Posible mock/data de prueba", severity: "warning" },
  { pattern: /demoData/gi, label: "Data de demostración", severity: "error" },
  { pattern: /internalMutation/g, label: "internalMutation llamado desde cliente", severity: "error" },
  { pattern: /internalAction/g, label: "internalAction llamado desde cliente", severity: "error" },
  { pattern: /window\.convex/g, label: "Uso directo de window.convex", severity: "error" },
  { pattern: /console\.log/g, label: "console.log residual", severity: "warning" },
  { pattern: /TODO|FIXME/g, label: "Pendientes (TODO/FIXME)", severity: "warning" },
];

function getModifiedFiles() {
  try {
    const output = execSync("git status --short", { encoding: "utf8" });
    return output
      .split("\n")
      .filter(line => line.trim() && !line.startsWith("D ")) // Ignorar eliminados
      .map(line => line.slice(3).trim())
      .filter(file => /\.(ts|tsx|js|jsx)$/.test(file)); // Solo archivos de código
  } catch (err) {
    console.error("Error al obtener archivos modificados:", err.message);
    return [];
  }
}

function checkFile(filePath) {
  const absolutePath = path.join(ROOT, filePath);
  if (!fs.existsSync(absolutePath)) return [];

  const content = fs.readFileSync(absolutePath, "utf8");
  const lines = content.split("\n");
  const findings = [];

  FORBIDDEN_PATTERNS.forEach(({ pattern, label, severity }) => {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        findings.push({
          file: filePath,
          line: index + 1,
          label,
          severity,
          content: line.trim()
        });
      }
    });
  });

  return findings;
}

function run() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🚫 AURORA FORBIDDEN PATTERN CHECK");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const files = getModifiedFiles();
  if (files.length === 0) {
    console.log("✅ No hay archivos de código modificados para revisar.");
    return true;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  files.forEach(file => {
    const findings = checkFile(file);
    if (findings.length > 0) {
      findings.forEach(f => {
        const icon = f.severity === "error" ? "❌" : "⚠️";
        console.log(`${icon} [${f.severity.toUpperCase()}] ${f.file}:${f.line}`);
        console.log(`   ${f.label}`);
        console.log(`   > ${f.content}\n`);
        
        if (f.severity === "error") totalErrors++;
        else totalWarnings++;
      });
    }
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Resumen: ${totalErrors} Errores, ${totalWarnings} Advertencias`);
  
  if (totalErrors > 0) {
    console.log("  ❌ FALLÓ: Se encontraron patrones prohibidos críticos.");
    return false;
  } else {
    console.log("  ✅ PASÓ: No se encontraron patrones prohibidos críticos.");
    return true;
  }
}

const passed = run();
process.exit(passed ? 0 : 1);
