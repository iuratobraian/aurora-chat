import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function detectGPU() {
  try {
    const output = execSync("nvidia-smi --query-gpu=name,utilization.gpu --format=csv,noheader", { encoding: "utf8" }).trim();
    return { driver: "nvidia", info: output };
  } catch {
    try {
      const output = execSync("rocm-smi --showproductname --showuse", { encoding: "utf8" }).trim();
      return { driver: "rocm", info: output };
    } catch {
      return { driver: null, info: "no GPU detected" };
    }
  }
}

function logStatus(status) {
  const dest = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
  const payload = {
    timestamp: new Date().toISOString(),
    command: "/gpu-check",
    response: status.info,
    gpu: status.driver
  };
  fs.appendFileSync(dest, JSON.stringify(payload) + "\n");
  console.log("GPU status:", status);
}

const status = detectGPU();
logStatus(status);
