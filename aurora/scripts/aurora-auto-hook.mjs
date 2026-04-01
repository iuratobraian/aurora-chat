import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const logFile = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
const pointerFile = path.join(ROOT, ".agent/aurora/auto-hook.pointer");

const intervalMs = 60000;

function readPointer() {
  if (!execSync) return 0;
  try {
    return Number(execSync(`type ${pointerFile}`.replace(/\//g, "\\"), { encoding: "utf8" }).trim());
  } catch {
    return 0;
  }
}

function writePointer(value) {
  execSync(`powershell -Command "Set-Content -Path '${pointerFile}' -Value ${value}"`);
}

function runAutoRunner() {
  try {
    execSync("npm run auto:runner", { cwd: ROOT, stdio: "inherit", shell: true });
  } catch (error) {
    console.error("Aura hook auto-runner falló:", error.message);
  }
}

function schedule() {
  console.log("Aurora AutoHook iniciando. Revisando actividad cada 60s...");
  setInterval(() => {
    runAutoRunner();
  }, intervalMs);
}

schedule();
