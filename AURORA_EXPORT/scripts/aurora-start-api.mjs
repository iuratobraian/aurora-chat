#!/usr/bin/env node
import { spawn, spawnSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PORT = 4310;
const HEALTH_URL = `http://127.0.0.1:${PORT}/health`;
const POINTER_FILE = path.join(ROOT, ".agent/aurora/auto-runner.pointer");
const PID_FILE = path.join(ROOT, ".agent/aurora/aurora-api.pid");
const STATUS_FILE = path.join(ROOT, ".agent/aurora/aurora-api-process.json");
const LOG_DIR = path.join(ROOT, ".agent/aurora/logs");
const OUT_LOG_FILE = path.join(LOG_DIR, "aurora-api.out.log");
const ERR_LOG_FILE = path.join(LOG_DIR, "aurora-api.err.log");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function findOwners() {
  try {
    const output = execSync(`netstat -ano | findstr :${PORT}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && /LISTENING/.test(line))
      .map((line) => {
        const parts = line.split(/\s+/);
        return Number(parts[parts.length - 1]);
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function kill(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
  } catch {}
}

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function touch(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, new Date().toISOString());
}

function writeStatus(state, extra = {}) {
  ensureDir(path.dirname(STATUS_FILE));
  fs.writeFileSync(
    STATUS_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        state,
        port: PORT,
        healthUrl: HEALTH_URL,
        pidFile: path.relative(ROOT, PID_FILE).replace(/\\/g, "/"),
        logs: {
          stdout: path.relative(ROOT, OUT_LOG_FILE).replace(/\\/g, "/"),
          stderr: path.relative(ROOT, ERR_LOG_FILE).replace(/\\/g, "/")
        },
        ...extra
      },
      null,
      2
    )
  );
}

function tailLog(file, maxChars = 2500) {
  if (!fs.existsSync(file)) return "";
  const text = fs.readFileSync(file, "utf8");
  return text.slice(Math.max(0, text.length - maxChars));
}

function quotePowerShell(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function launchApiProcess() {
  if (process.platform === "win32") {
    const script = [
      `$p = Start-Process -FilePath ${quotePowerShell(process.execPath)}`,
      `-ArgumentList @('scripts/aurora-api.mjs')`,
      `-WorkingDirectory ${quotePowerShell(ROOT)}`,
      `-RedirectStandardOutput ${quotePowerShell(OUT_LOG_FILE)}`,
      `-RedirectStandardError ${quotePowerShell(ERR_LOG_FILE)}`,
      `-WindowStyle Hidden -PassThru`,
      `Write-Output $p.Id`
    ].join(" ") + "\n";

    const launched = spawnSync(
      "powershell",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "-"],
      {
        cwd: ROOT,
        encoding: "utf8",
        input: script
      }
    );

    if (launched.status === 0) {
      const pid = Number((launched.stdout || "").trim());
      if (!pid) {
        throw new Error("Start-Process no devolvió un PID válido para Aurora API");
      }

      return { pid, strategy: "powershell_start_process" };
    }

    throw new Error(
      launched.error?.code === "EPERM"
        ? "PowerShell Start-Process bloqueado por permisos del entorno."
        : launched.stderr?.trim() || launched.stdout?.trim() || "No se pudo lanzar Aurora API con Start-Process"
    );
  }

  return launchDetachedNodeProcess();
}

function launchDetachedNodeProcess() {
  const outFd = fs.openSync(OUT_LOG_FILE, "a");
  const errFd = fs.openSync(ERR_LOG_FILE, "a");
  const child = spawn(
    process.execPath,
    ["scripts/aurora-api.mjs"],
    {
      cwd: ROOT,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", outFd, errFd]
    }
  );

  return { pid: child.pid };
}

async function probeHealth() {
  try {
    const response = await fetch(HEALTH_URL, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(timeoutMs = 10000, pollMs = 500) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await probeHealth()) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  return false;
}

async function verifyStableRuntime(pid, stabilityMs = 1500) {
  await new Promise((resolve) => setTimeout(resolve, stabilityMs));
  return isRunning(pid) && await probeHealth();
}

const owners = findOwners();
const existingPid = fs.existsSync(PID_FILE) ? Number(fs.readFileSync(PID_FILE, "utf8").trim()) : null;

if (owners.length > 0) {
  const healthy = await probeHealth();
  if (!healthy) {
    writeStatus("blocked", {
      pid: owners[0],
      source: "port_probe",
      healthy: false,
      note: "Puerto ocupado pero /health no responde correctamente."
    });
    console.error(`Port ${PORT} is busy but health probe failed (PID: ${owners[0]})`);
    process.exit(1);
  }
  console.log(`Aurora API already running on port ${PORT} (PID: ${owners[0]})`);
  if (existingPid && existingPid !== owners[0]) {
    fs.writeFileSync(PID_FILE, String(owners[0]));
  }
  touch(POINTER_FILE);
  writeStatus("running", {
    pid: owners[0],
    source: "port_probe",
    healthy
  });
  process.exit(0);
}

if (existingPid && isRunning(existingPid)) {
  const healthy = await probeHealth();
  if (healthy) {
    console.log(`Aurora API already running (PID: ${existingPid})`);
    touch(POINTER_FILE);
    writeStatus("running", {
      pid: existingPid,
      source: "pid_file",
      healthy
    });
    process.exit(0);
  }

  kill(existingPid);
  writeStatus("restarting", {
    pid: existingPid,
    source: "pid_file",
    healthy: false,
    note: "PID file existía pero /health no respondió; reiniciando."
  });
}

console.log(`Starting Aurora API on port ${PORT}...`);
ensureDir(LOG_DIR);
writeStatus("starting", {
  pid: null,
  source: "launcher",
  healthy: false
});

let launched;
try {
  launched = launchApiProcess();
} catch (error) {
  writeStatus("failed", {
    pid: null,
    source: "launcher",
    healthy: false,
    recentStdout: tailLog(OUT_LOG_FILE),
    recentStderr: tailLog(ERR_LOG_FILE),
    note: error instanceof Error ? error.message : "No se pudo lanzar Aurora API"
  });
  console.error(error instanceof Error ? error.message : "Failed to launch Aurora API");
  process.exit(1);
}

fs.writeFileSync(PID_FILE, String(launched.pid));
touch(POINTER_FILE);
writeStatus("starting", {
  pid: launched.pid,
  source: launched.strategy,
  healthy: false,
  note: launched.launchWarning
});

const started = await waitForHealth();

if (started && isRunning(launched.pid) && await verifyStableRuntime(launched.pid)) {
  console.log(`Aurora API started successfully (PID: ${launched.pid})`);
  writeStatus("running", {
    pid: launched.pid,
    source: launched.strategy,
    healthy: true,
    note: launched.launchWarning
  });
  process.exit(0);
}

writeStatus("failed", {
  pid: launched.pid,
  source: launched.strategy,
  healthy: false,
  processAlive: isRunning(launched.pid),
  stable: false,
  recentStdout: tailLog(OUT_LOG_FILE),
  recentStderr: tailLog(ERR_LOG_FILE),
  note: launched.launchWarning
});

console.error("Failed to start Aurora API");
process.exit(1);
