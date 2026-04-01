#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTRACTS_DIR = path.join(ROOT, ".agent/aurora/contracts");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateContract(name, contract) {
  const results = {
    name,
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!contract.artifact) {
    results.errors.push("Missing 'artifact' field");
    results.valid = false;
  } else if (contract.artifact !== name) {
    results.warnings.push(`Artifact name mismatch: expected '${name}', got '${contract.artifact}'`);
  }

  if (!contract.version) {
    results.warnings.push("Missing 'version' field");
  }

  if (!contract.requiredFields || !Array.isArray(contract.requiredFields)) {
    results.errors.push("Missing or invalid 'requiredFields' array");
    results.valid = false;
  } else if (contract.requiredFields.length === 0) {
    results.warnings.push("'requiredFields' is empty - contract has no requirements");
  }

  return results;
}

function main() {
  console.log("🧠 Aurora Contract Validator\n");
  console.log("=".repeat(50));

  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.log("❌ Contracts directory not found");
    process.exit(1);
  }

  const files = fs.readdirSync(CONTRACTS_DIR).filter(f => f.endsWith(".json"));
  console.log(`\n📂 Found ${files.length} contracts\n`);

  const results = [];
  let totalValid = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const name = file.replace(".json", "");
    const content = readJson(path.join(CONTRACTS_DIR, file));
    const result = content ? validateContract(name, content) : {
      name,
      valid: false,
      errors: ["File not found or invalid JSON"],
      warnings: [],
    };

    results.push(result);

    const icon = result.valid ? "✅" : "❌";
    console.log(`${icon} ${name}`);
    
    if (result.errors.length > 0) {
      totalErrors += result.errors.length;
      for (const error of result.errors) {
        console.log(`   ❌ ${error}`);
      }
    }
    
    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
      for (const warning of result.warnings) {
        console.log(`   ⚠️  ${warning}`);
      }
    }

    if (result.valid) totalValid++;
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Validation Summary");
  console.log(`   Total contracts: ${files.length}`);
  console.log(`   Valid: ${totalValid}`);
  console.log(`   Invalid: ${files.length - totalValid}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);

  const healthScore = Math.max(0, 100 - (totalErrors * 20) - (totalWarnings * 5));
  console.log(`\n   🟢 Contract Health: ${healthScore}/100`);

  if (healthScore >= 90) {
    console.log("   ✅ All contracts are valid!");
  } else if (healthScore >= 70) {
    console.log("   ⚠️  Contracts need some fixes.");
  } else {
    console.log("   🔴 Contracts need urgent attention.");
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📋 Required Fields Summary\n");
  
  const allFields = new Map();
  for (const result of results) {
    if (result.valid && result.name) {
      const contract = readJson(path.join(CONTRACTS_DIR, `${result.name}.json`));
      if (contract?.requiredFields) {
        for (const field of contract.requiredFields) {
          if (!allFields.has(field)) {
            allFields.set(field, []);
          }
          allFields.get(field).push(result.name);
        }
      }
    }
  }

  for (const [field, contracts] of allFields) {
    console.log(`   ${field}: ${contracts.length} contracts`);
  }

  console.log("\n✨ Validation complete!\n");

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
