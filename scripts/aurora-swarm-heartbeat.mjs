#!/usr/bin/env node
/**
 * Aurora Swarm Heartbeat
 * Sistema de coordinación en tiempo real para agentes
 * Monitorea salud del sistema, estado de tareas y orquesta agentes
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// Configuration
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const AGENT_TIMEOUT = 300000; // 5 minutes
const MAX_AGENTS = 8;

// Agent registry
const AGENT_ROLES = {
  designer: { skill: "stitch-ui-designer", maxTime: 600000 },
  architect: { skill: "v3-ddd-architecture", maxTime: 900000 },
  coder: { skill: "general", maxTime: 1200000 },
  tester: { skill: "playwright-best-practices", maxTime: 600000 },
  auditor: { skill: "verification-before-completion", maxTime: 300000 },
  security: { skill: "v3-security-overhaul", maxTime: 900000 },
  growth: { skill: "general", maxTime: 600000 },
  coordinator: { skill: "swarm-coordination", maxTime: 300000 },
};

// Task board path
const TASK_BOARD_PATH = path.join(ROOT, ".agent", "workspace", "coordination", "TASK_BOARD.md");
const CURRENT_FOCUS_PATH = path.join(ROOT, ".agent", "workspace", "coordination", "CURRENT_FOCUS.md");
const AGENT_LOG_PATH = path.join(ROOT, "AGENT_LOG.md");

// Health metrics
let healthMetrics = {
  timestamp: new Date().toISOString(),
  activeAgents: [],
  taskQueue: [],
  systemHealth: {
    cpu: 0,
    memory: 0,
    disk: 0,
  },
  lastHeartbeat: Date.now(),
  uptime: 0,
  errors: [],
};

/**
 * Get system health metrics
 */
function getSystemHealth() {
  try {
    const memUsage = process.memoryUsage();
    healthMetrics.systemHealth.memory = Math.round(
      (memUsage.heapUsed / memUsage.heapTotal) * 100
    );
    healthMetrics.systemHealth.uptime = Math.round(
      (Date.now() - healthMetrics.lastHeartbeat) / 1000
    );
  } catch (error) {
    healthMetrics.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
  return healthMetrics.systemHealth;
}

/**
 * Parse task board to get pending tasks
 */
function getPendingTasks() {
  try {
    if (!fs.existsSync(TASK_BOARD_PATH)) {
      return [];
    }

    const content = fs.readFileSync(TASK_BOARD_PATH, "utf-8");
    const lines = content.split("\n");
    const pendingTasks = [];

    for (const line of lines) {
      if (line.includes("| pending |") || line.includes("| claimed |") || line.includes("| in_progress |")) {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length >= 5) {
          pendingTasks.push({
            id: parts[1],
            type: parts[2],
            status: parts[3],
            assigned: parts[4],
            description: parts[5] || "",
          });
        }
      }
    }

    return pendingTasks;
  } catch (error) {
    console.error(`Error reading task board: ${error.message}`);
    return [];
  }
}

/**
 * Get active agents from current focus
 */
function getActiveAgents() {
  try {
    if (!fs.existsSync(CURRENT_FOCUS_PATH)) {
      return [];
    }

    const content = fs.readFileSync(CURRENT_FOCUS_PATH, "utf-8");
    const agents = [];

    // Parse agent info from current focus
    const agentMatch = content.match(/Agent:\s*(.+)/);
    const taskMatch = content.match(/Task:\s*(.+)/);

    if (agentMatch && taskMatch) {
      agents.push({
        name: agentMatch[1].trim(),
        task: taskMatch[1].trim(),
        startedAt: new Date().toISOString(),
        status: "active",
      });
    }

    return agents;
  } catch (error) {
    return [];
  }
}

/**
 * Assign task to best available agent
 */
function assignTask(task, availableAgents) {
  const taskType = task.type.toLowerCase();
  let bestAgent = null;

  // Match task type to agent role
  if (taskType.includes("front") || taskType.includes("ui")) {
    bestAgent = availableAgents.find((a) => a.role === "designer" || a.role === "coder");
  } else if (taskType.includes("back") || taskType.includes("db")) {
    bestAgent = availableAgents.find((a) => a.role === "architect" || a.role === "coder");
  } else if (taskType.includes("sec")) {
    bestAgent = availableAgents.find((a) => a.role === "security");
  } else if (taskType.includes("test") || taskType.includes("qa")) {
    bestAgent = availableAgents.find((a) => a.role === "tester" || a.role === "auditor");
  } else {
    bestAgent = availableAgents.find((a) => a.role === "coder");
  }

  return bestAgent || availableAgents[0];
}

/**
 * Log agent activity
 */
function logAgentActivity(agentName, taskId, action, details = "") {
  const logEntry = `[${new Date().toISOString()}] ${agentName} - ${taskId} - ${action}${
    details ? ` - ${details}` : ""
  }\n`;

  try {
    fs.appendFileSync(AGENT_LOG_PATH, logEntry);
  } catch (error) {
    console.error(`Error writing to agent log: ${error.message}`);
  }
}

/**
 * Check agent health and timeout
 */
function checkAgentHealth() {
  const activeAgents = getActiveAgents();
  const now = Date.now();

  return activeAgents.map((agent) => {
    const elapsed = now - new Date(agent.startedAt).getTime();
    const maxTime = AGENT_TIMEOUT;

    if (elapsed > maxTime) {
      return { ...agent, status: "timeout", needsReassignment: true };
    }

    return { ...agent, status: "healthy", elapsed };
  });
}

/**
 * Generate heartbeat report
 */
function generateHeartbeatReport() {
  const pendingTasks = getPendingTasks();
  const activeAgents = getActiveAgents();
  const systemHealth = getSystemHealth();
  const agentHealth = checkAgentHealth();

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      pendingTasks: pendingTasks.length,
      activeAgents: activeAgents.length,
      systemHealth: systemHealth.memory < 80 ? "healthy" : "degraded",
    },
    tasks: pendingTasks.slice(0, 10),
    agents: agentHealth,
    recommendations: [],
  };

  // Generate recommendations
  if (pendingTasks.length > 0 && activeAgents.length < MAX_AGENTS) {
    report.recommendations.push(
      `Spawn ${Math.min(pendingTasks.length, MAX_AGENTS - activeAgents.length)} more agents`
    );
  }

  if (systemHealth.memory > 80) {
    report.recommendations.push("High memory usage - consider reducing agent count");
  }

  const timeoutAgents = agentHealth.filter((a) => a.status === "timeout");
  if (timeoutAgents.length > 0) {
    report.recommendations.push(
      `Reassign ${timeoutAgents.length} timed out agents`
    );
  }

  return report;
}

/**
 * Main heartbeat loop
 */
function heartbeat() {
  const report = generateHeartbeatReport();

  console.log("\n" + "=".repeat(60));
  console.log("🧠 AURORA SWARM HEARTBEAT");
  console.log("=".repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Pending Tasks: ${report.summary.pendingTasks}`);
  console.log(`Active Agents: ${report.summary.activeAgents}`);
  console.log(`System Health: ${report.summary.systemHealth}`);

  if (report.recommendations.length > 0) {
    console.log("\n📋 Recommendations:");
    report.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  console.log("=".repeat(60));

  return report;
}

/**
 * Initialize swarm coordination
 */
function initSwarm(topology = "hierarchical", strategy = "specialized") {
  console.log(`\n🚀 Initializing Aurora Swarm (${topology}, ${strategy})`);
  console.log(`Max agents: ${MAX_AGENTS}`);
  console.log(`Available roles: ${Object.keys(AGENT_ROLES).join(", ")}`);

  const pendingTasks = getPendingTasks();
  console.log(`\n📋 Pending tasks: ${pendingTasks.length}`);

  if (pendingTasks.length === 0) {
    console.log("✅ No pending tasks - swarm idle");
    return;
  }

  // Show first 3 tasks for assignment
  console.log("\n📌 Next tasks to assign:");
  pendingTasks.slice(0, 3).forEach((task) => {
    console.log(`  - ${task.id}: ${task.description}`);
  });

  // Start heartbeat
  console.log(`\n💓 Heartbeat started (every ${HEARTBEAT_INTERVAL / 1000}s)`);
  heartbeat();

  return {
    topology,
    strategy,
    maxAgents: MAX_AGENTS,
    pendingTasks: pendingTasks.length,
    startTime: new Date().toISOString(),
  };
}

/**
 * Main execution
 */
const command = process.argv[2] || "heartbeat";

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  switch (command) {
    case "init":
      initSwarm(process.argv[3] || "hierarchical", process.argv[4] || "specialized");
      break;

    case "heartbeat":
      heartbeat();
      break;

    case "tasks":
      const tasks = getPendingTasks();
      console.log(`\n📋 Pending Tasks (${tasks.length}):`);
      tasks.forEach((task) => {
        console.log(`  [${task.status}] ${task.id}: ${task.description}`);
      });
      break;

    case "agents":
      const agents = getActiveAgents();
      console.log(`\n🤖 Active Agents (${agents.length}):`);
      agents.forEach((agent) => {
        console.log(`  - ${agent.name}: ${agent.task} (${agent.status})`);
      });
      break;

    case "health":
      const health = getSystemHealth();
      console.log("\n💚 System Health:");
      console.log(`  Memory: ${health.memory}%`);
      console.log(`  Uptime: ${health.uptime}s`);
      break;

    case "report":
      const report = generateHeartbeatReport();
      console.log("\n📊 Aurora Swarm Report:");
      console.log(JSON.stringify(report, null, 2));
      break;

    default:
      console.log(`
🧠 Aurora Swarm Heartbeat

Usage:
  node scripts/aurora-swarm-heartbeat.mjs init [topology] [strategy]
  node scripts/aurora-swarm-heartbeat.mjs heartbeat
  node scripts/aurora-swarm-heartbeat.mjs tasks
  node scripts/aurora-swarm-heartbeat.mjs agents
  node scripts/aurora-swarm-heartbeat.mjs health
  node scripts/aurora-swarm-heartbeat.mjs report

Options:
  topology: hierarchical | mesh | star (default: hierarchical)
  strategy: specialized | balanced | generalist (default: specialized)
`);
  }
}

export {
  heartbeat,
  initSwarm,
  getPendingTasks,
  getActiveAgents,
  getSystemHealth,
  generateHeartbeatReport,
  assignTask,
  logAgentActivity,
  checkAgentHealth,
  AGENT_ROLES,
  MAX_AGENTS,
  HEARTBEAT_INTERVAL,
};
