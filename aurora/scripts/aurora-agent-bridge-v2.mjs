#!/usr/bin/env node
/**
 * Aurora Agent Bridge v2
 * Capa unificada para routing de agentes con retry automático y fallback
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const AGENTS = {
  codex_local: {
    path: process.env.CODEX_PATH || "C:\\Users\\iurato\\codex",
    cmd: "codex",
    args: ["--no-interactive"],
    timeout: 300000,
  },
  opencode_local: {
    path: process.env.OPENCODE_PATH || "opencode",
    cmd: "opencode",
    args: [],
    timeout: 180000,
    enabled: false, // DESHABILITADO POR BLOQUEO DE API
  },
  codex_cloud: {
    enabled: process.env.CODEX_CLOUD_ENABLED === "true",
    cmd: "npx",
    args: ["codex", "apply"],
    timeout: 300000,
  },
};

const ROUTING_RULES = [
  { pattern: /test|spec|coverage/, agent: "codex_local", priority: 1 },
  { pattern: /fix|bug|error/, agent: "codex_local", priority: 2 },
  { pattern: /feature|feat|new/, agent: "opencode_local", priority: 2 },
  { pattern: /refactor|clean|optimize/, agent: "codex_local", priority: 1 },
  { pattern: /docs|readme|comment/, agent: "opencode_local", priority: 3 },
  { pattern: /aurora|brain|agent/, agent: "codex_local", priority: 1 },
  { pattern: /schema|convex|backend/, agent: "codex_local", priority: 1 },
  { pattern: /ui|view|component|tsx/, agent: "opencode_local", priority: 2 },
];

function routeTask(taskDescription) {
  const matches = [];

  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(taskDescription.toLowerCase())) {
      matches.push({ agent: rule.agent, priority: rule.priority, pattern: rule.pattern });
    }
  }

  if (matches.length === 0) {
    return { agent: "codex_local", reason: "default" };
  }

  matches.sort((a, b) => a.priority - b.priority);
  return { agent: matches[0].agent, reason: `matched: ${matches[0].pattern}` };
}

function executeAgent(agentKey, task, options = {}) {
  return new Promise((resolve, reject) => {
    const agent = AGENTS[agentKey];
    if (!agent) {
      reject(new Error(`Agente desconocido: ${agentKey}`));
      return;
    }

    if (agent.enabled === false) {
      reject(new Error(`Agente ${agentKey} deshabilitado`));
      return;
    }

    console.log(`\n🚀 Ejecutando ${agentKey}...`);
    console.log(`   Tarea: ${task.slice(0, 80)}${task.length > 80 ? "..." : ""}\n`);

    const startTime = Date.now();
    let output = "";
    let errorOutput = "";

    const proc = spawn(agent.cmd, [...(agent.args || []), "--", task], {
      cwd: agent.path || ROOT,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error(`Timeout (${agent.timeout / 1000}s) en ${agentKey}`));
    }, agent.timeout);

    proc.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    proc.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (code === 0) {
        console.log(`\n✅ ${agentKey} completado en ${duration}s`);
        resolve({
          success: true,
          agent: agentKey,
          duration,
          output,
        });
      } else {
        console.log(`\n❌ ${agentKey} falló (code: ${code}) en ${duration}s`);
        reject({
          success: false,
          agent: agentKey,
          duration,
          error: errorOutput || output,
          code,
        });
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject({ success: false, agent: agentKey, error: err.message });
    });
  });
}

async function runWithFallback(task, options = {}) {
  const { agent: preferredAgent, reason } = routeTask(task);
  const fallbackAgents = Object.keys(AGENTS).filter(
    (k) => k !== preferredAgent && AGENTS[k].enabled !== false
  );
  const allAgents = [preferredAgent, ...fallbackAgents];

  console.log(`\n🧠 Routing: ${preferredAgent} (${reason})`);
  console.log(`   Fallbacks: ${fallbackAgents.join(", ") || "ninguno"}\n`);

  const errors = [];

  for (const agentKey of allAgents) {
    try {
      const result = await executeAgent(agentKey, task, options);
      return result;
    } catch (err) {
      errors.push({ agent: agentKey, ...err });
      console.log(`   ↩️ Intentando siguiente agente...\n`);
    }
  }

  throw new Error(`Todos los agentes fallaron:\n${errors.map((e) => `  - ${e.agent}: ${e.error}`).join("\n")}`);
}

async function run() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🧠 Aurora Agent Bridge v2

Uso:
  node aurora-agent-bridge.mjs "<tarea>"

Ejemplos:
  node aurora-agent-bridge.mjs "fix login bug"
  node aurora-agent-bridge.mjs "add user profile component"
  node aurora-agent-bridge.mjs "optimize database queries"

Routing automático basado en patrones de la tarea.
    `);
    return;
  }

  const task = args.join(" ");

  try {
    const result = await runWithFallback(task);
    console.log("\n📊 Resultado final:");
    console.log(`   Agente: ${result.agent}`);
    console.log(`   Duración: ${result.duration}s`);
    console.log(`   Éxito: ${result.success}`);
  } catch (err) {
    console.error("\n💥 Error:", err.message);
    process.exit(1);
  }
}

run();
