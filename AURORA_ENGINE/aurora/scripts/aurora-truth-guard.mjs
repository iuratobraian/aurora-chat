#!/usr/bin/env node
/**
 * Aurora Truth Guard
 * Detects anti-patterns: localStorage as truth, hardcoded IDs, internal mutations from client, etc.
 * Requirement: Mandatory Startup Readiness (SKILL.md)
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const ANTI_PATTERNS = [
  {
    id: "LOCAL_STORAGE_TRUTH",
    name: "localStorage as Source of Truth",
    regex: /localStorage\.(getItem|setItem|removeItem)/g,
    severity: "warning",
    message: "Avoid using localStorage as a shared source of truth. Use Convex or a global store instead.",
    exclude: [/cacheManager\.ts/, /authBase\.ts/]
  },
  {
    id: "HARDCODED_ID",
    name: "Hardcoded Admin/User ID",
    regex: /['"][0-9a-zA-Z]{15,40}['"]/g, // Long alphanumeric strings that look like IDs
    severity: "warning",
    message: "Potential hardcoded ID detected. Use context or environment variables.",
    exclude: [/\.test\./, /mock/, /\.json/]
  },
  {
    id: "INTERNAL_MUTATION_CLIENT",
    name: "Internal Mutation from Client",
    regex: /api\.[a-zA-Z0-9_]+\.internal[a-zA-Z0-9_]+/g,
    severity: "error",
    message: "Calling internal mutations/actions from client code is forbidden.",
  },
  {
    id: "MISSING_AUTH_VALIDATION",
    name: "Potential Missing Auth Validation",
    regex: /mutation\s*{\s*handler:\s*async\s*\(ctx,\s*args\)\s*=>\s*{/g,
    severity: "warning",
    message: "Check if this mutation validates ctx.auth. Identity check is mandatory for user-dependent data.",
    include: [/convex\//]
  },
  {
    id: "PLACEHOLDER_UI",
    name: "Development Placeholders",
    regex: /['"](.*)(en desarrollo|coming soon|TODO|FIXME)(.*)['"]/gi,
    severity: "warning",
    message: "Remove 'coming soon' or 'en desarrollo' labels before marking as done.",
  }
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(ROOT, filePath);
  const issues = [];

  for (const pattern of ANTI_PATTERNS) {
    if (pattern.include && !pattern.include.some(re => re.test(relativePath))) continue;
    if (pattern.exclude && pattern.exclude.some(re => re.test(relativePath))) continue;

    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split("\n");
      const lineNum = lines.length;
      issues.push({
        ...pattern,
        file: relativePath,
        line: lineNum,
        match: match[0]
      });
    }
  }

  return issues;
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "dist" && file !== ".next") {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function main() {
  console.log("\n🛡️  AURORA TRUTH GUARD - Anti-Pattern Scanner");
  console.log("============================================\n");

  const files = [];
  getAllFiles(SRC_DIR, files);
  getAllFiles(path.join(ROOT, "convex"), files);

  console.log(`📂 Scanning ${files.length} files...\n`);

  let totalIssues = 0;
  const issuesByFile = {};

  for (const file of files) {
    const issues = scanFile(file);
    if (issues.length > 0) {
      issuesByFile[file] = issues;
      totalIssues += issues.length;
    }
  }

  if (totalIssues === 0) {
    console.log("✅ No anti-patterns detected. Your code is pure! ✨");
  } else {
    for (const file in issuesByFile) {
      console.log(`📄 ${path.relative(ROOT, file)}`);
      for (const issue of issuesByFile[file]) {
        const color = issue.severity === "error" ? "❌" : "⚠️";
        console.log(`   ${color} [L${issue.line}] ${issue.name}: ${issue.message}`);
        console.log(`      Found: ${issue.match.substring(0, 50)}${issue.match.length > 50 ? "..." : ""}`);
      }
      console.log("");
    }

    console.log(`\n📊 Summary: Found ${totalIssues} potential issues.`);
    const criticals = Object.values(issuesByFile).flat().filter(i => i.severity === "error").length;
    if (criticals > 0) {
      console.log(`   🚨 CRITICAL ERRORS: ${criticals}`);
      process.exit(1);
    }
  }
}

main();
