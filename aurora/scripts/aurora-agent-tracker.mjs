import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { loadAuroraEnv } from "./load-aurora-env.mjs";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, ".agent/aurora/agent-registry.json");

loadAuroraEnv();

function safeExec(command) {
  try {
    return execSync(command, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    }).trim();
  } catch {
    return "";
  }
}

function readRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function getAgentRegistry() {
  return readRegistry();
}

export function addAgentToRegistry(agent) {
  const data = readRegistry();
  const nombre = (agent.nombre || "").trim();
  if (!nombre) throw new Error("El agente requiere un nombre.");
  const next = {
    nombre,
    tipo: agent.tipo || "especialista",
    origen: agent.origen || "externo",
    estado: agent.estado || "disponible",
    fortalezas: agent.fortalezas || [],
    aprendeDe: agent.aprendeDe || ["aurora_core", "task_board", "skills", "templates"],
    notas: agent.notas || "Agente agregado a Aurora."
  };
  const index = data.agentes.findIndex((item) => item.nombre.toLowerCase() === nombre.toLowerCase());
  if (index >= 0) data.agentes[index] = next;
  else data.agentes.push(next);
  writeRegistry(data);
  return next;
}

export function getAgentTrackerSnapshot() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  return {
    pc: {
      hostname: os.hostname(),
      plataforma: `${os.platform()} ${os.release()}`,
      arquitectura: os.arch(),
      cpus: os.cpus()?.length || 0,
      memoriaGb: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10
    },
    repo: {
      ruta: ROOT,
      rama: safeExec("git rev-parse --abbrev-ref HEAD") || "desconocida",
      cambiosSinCommit: safeExec("git status --porcelain").split(/\r?\n/).filter(Boolean).length
    },
    aurora: {
      scripts: Object.keys(packageJson.scripts || {}).filter((item) => item.startsWith("aurora:")),
      conectores: {
        brave: Boolean(process.env.BRAVE_SEARCH_API_KEY),
        tavily: Boolean(process.env.TAVILY_API_KEY),
        serpapi: Boolean(process.env.SERPAPI_API_KEY)
      }
    },
    privacidad: "Solo releva contexto operativo local del repo y del runtime. No lee datos personales."
  };
}

const command = process.argv[2] || "listar";

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  if (command === "listar") console.log(JSON.stringify(getAgentRegistry(), null, 2));
  else if (command === "rastrear") console.log(JSON.stringify(getAgentTrackerSnapshot(), null, 2));
  else if (command === "agregar") {
    console.log(JSON.stringify(addAgentToRegistry({
      nombre: process.argv[3],
      tipo: process.argv[4] || "especialista",
      origen: "externo",
      fortalezas: (process.argv[5] || "").split(",").map((item) => item.trim()).filter(Boolean)
    }), null, 2));
  } else {
    console.error(`Comando no soportado: ${command}`);
    process.exitCode = 1;
  }
}
