#!/usr/bin/env node
/**
 * Aurora Team Metrics Dashboard
 * Dashboard de métricas del equipo de agentes
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const METRICS_LOG = ".agent/brain/db/agent_metrics.jsonl";
const TASK_BOARD = ".agent/workspace/coordination/TASK_BOARD.md";
const LOG = ".agent/workspace/coordination/AGENT_LOG.md";

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function readTasks() {
  const content = fs.readFileSync(path.join(ROOT, TASK_BOARD), "utf8");
  const lines = content.split("\n");
  const tasks = [];

  for (const line of lines) {
    if (line.startsWith("|") && !line.includes("TASK-ID") && !line.includes("---")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.length >= 3) {
        tasks.push({
          id: cells[0],
          status: cells[1],
          owner: cells[2],
        });
      }
    }
  }
  return tasks;
}

function readAgentLog() {
  if (!fs.existsSync(path.join(ROOT, LOG))) return [];
  const content = fs.readFileSync(path.join(ROOT, LOG), "utf8");
  const entries = [];
  const blocks = content.split("### 202");

  for (const block of blocks) {
    if (!block.trim()) continue;
    const dateMatch = block.match(/^(\d{4}-\d{2}-\d{2})/);
    const taskMatch = block.match(/TASK-ID:\s*([^\n]+)/);
    const filesMatch = block.match(/Archivos:\s*([^\n]+)/);

    if (dateMatch) {
      entries.push({
        date: dateMatch[1],
        tasks: taskMatch ? taskMatch[1].split(",").map((t) => t.trim()) : [],
        files: filesMatch ? filesMatch[1].split(",").map((f) => f.trim()) : [],
      });
    }
  }
  return entries;
}

function calculateAgentStats(tasks, logEntries) {
  const agents = {};

  for (const task of tasks) {
    if (!agents[task.owner]) {
      agents[task.owner] = {
        name: task.owner,
        total: 0,
        done: 0,
        inProgress: 0,
        pending: 0,
        claimed: 0,
      };
    }
    agents[task.owner].total++;
    const status = task.status.toLowerCase();
    if (status === "done") agents[task.owner].done++;
    else if (status === "in_progress") agents[task.owner].inProgress++;
    else if (status === "claimed") agents[task.owner].claimed++;
    else agents[task.owner].pending++;
  }

  for (const entry of logEntries) {
    for (const task of entry.tasks) {
      const owner = task.split("-")[0] || "UNKNOWN";
      if (!agents[owner]) {
        agents[owner] = { name: owner, total: 0, done: 0, sessions: 0 };
      }
      if (!agents[owner].sessions) agents[owner].sessions = 0;
      agents[owner].sessions++;
    }
  }

  return Object.values(agents);
}

function calculateVelocity(logEntries) {
  const weeklyData = {};

  for (const entry of logEntries.slice(-30)) {
    const week = entry.date.slice(0, 7);
    if (!weeklyData[week]) {
      weeklyData[week] = { tasks: 0, files: 0 };
    }
    weeklyData[week].tasks += entry.tasks.length;
    weeklyData[week].files += entry.files.length;
  }

  return weeklyData;
}

function run() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🧠 AURORA TEAM METRICS DASHBOARD");
  console.log(`  📅 ${new Date().toISOString().slice(0, 10)}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const tasks = readTasks();
  const logEntries = readAgentLog();
  const agentStats = calculateAgentStats(tasks, logEntries);
  const velocity = calculateVelocity(logEntries);

  console.log("📊 RESUMEN DE TAREAS");
  console.log("─".repeat(50));
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status.toLowerCase() === "done").length;
  const completionRate = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : 0;
  console.log(`  Total: ${totalTasks} | Completadas: ${doneTasks} | Tasa: ${completionRate}%\n`);

  console.log("👥 PERFORMANCE POR AGENTE");
  console.log("─".repeat(50));
  agentStats
    .sort((a, b) => b.done - a.done)
    .forEach((agent) => {
      const rate = agent.total > 0 ? ((agent.done / agent.total) * 100).toFixed(0) : 0;
      const bar = "█".repeat(Math.round(rate / 10)) + "░".repeat(10 - Math.round(rate / 10));
      console.log(`  ${agent.name.padEnd(15)} ${bar} ${rate}% (${agent.done}/${agent.total})`);
    });

  console.log("\n📈 VELOCIDAD SEMANAL");
  console.log("─".repeat(50));
  Object.entries(velocity)
    .slice(-4)
    .forEach(([week, data]) => {
      console.log(`  ${week}: ${data.tasks} tareas, ${data.files} archivos modificados`);
    });

  console.log("\n🎯 RECOMENDACIONES");
  console.log("─".repeat(50));
  const inProgress = tasks.filter((t) => t.status.toLowerCase() === "in_progress");
  const claimed = tasks.filter((t) => t.status.toLowerCase() === "claimed");
  
  if (inProgress.length > 0) {
    console.log(`  ⚡ ${inProgress.length} tareas en progreso - revisar bloqueos`);
  }
  if (claimed.length > 0) {
    console.log(`  ⏳ ${claimed.length} tareas reclamadas sin progreso`);
  }
  const idleAgents = agentStats.filter((a) => a.done === 0 && a.total === 0);
  if (idleAgents.length > 0) {
    console.log(`  👋 Agentes sin tareas: ${idleAgents.map((a) => a.name).join(", ")}`);
  }

  const newEntries = logEntries.slice(-7);
  if (newEntries.length > 0) {
    console.log(`\n📋 ÚLTIMAS ACTIVIDADES`);
    console.log("─".repeat(50));
    newEntries
      .reverse()
      .slice(0, 5)
      .forEach((entry) => {
        console.log(`  ${entry.date}: ${entry.tasks.join(", ") || "Sin tareas específicas"}`);
      });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  fs.appendFileSync(
    path.join(ROOT, METRICS_LOG),
    JSON.stringify({
      timestamp: Date.now(),
      type: "dashboard_snapshot",
      totalTasks,
      doneTasks,
      completionRate,
      agents: agentStats,
      weeklyVelocity: velocity,
    }) + "\n"
  );
}

run();
