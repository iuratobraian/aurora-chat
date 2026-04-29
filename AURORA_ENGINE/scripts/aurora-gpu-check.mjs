import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function detectGPU() {
  // Try NVIDIA
  try {
    const output = execSync("nvidia-smi --query-gpu=name,utilization.gpu --format=csv,noheader", { encoding: "utf8" }).trim();
    return { driver: "nvidia", info: output };
  } catch (e) {
    // Try AMD ROCm (Linux/Enterprise)
    try {
      const output = execSync("rocm-smi --showproductname --showuse", { encoding: "utf8" }).trim();
      return { driver: "rocm", info: output };
    } catch (e) {
      // Windows Fallback: WMI for AMD/Consumer GPUs
      if (process.platform === 'win32') {
        try {
          const cmd = "powershell -Command \"Get-WmiObject Win32_VideoController | Select-Object Name, AdapterRAM, Status | ConvertTo-Json\"";
          const output = execSync(cmd, { encoding: "utf8" }).trim();
          const gpus = JSON.parse(output);
          const primary = Array.isArray(gpus) ? gpus[0] : gpus;
          return { 
            driver: primary.Name.toLowerCase().includes('nvidia') ? 'nvidia' : (primary.Name.toLowerCase().includes('radeon') ? 'amd' : 'intel'),
            info: `${primary.Name} (Status: ${primary.Status})`
          };
        } catch (e2) {
          return { driver: null, info: "no GPU detected via WMI" };
        }
      }
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
