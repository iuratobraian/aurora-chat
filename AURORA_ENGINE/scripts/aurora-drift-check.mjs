#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const COORD_DIR = path.join(ROOT, ".agent/workspace/coordination");

function readMarkdownSection(filePath, sectionStart) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  
  let inSection = false;
  const section = [];
  
  for (const line of lines) {
    if (line.includes(sectionStart) || line.startsWith("#")) {
      if (line.includes(sectionStart)) inSection = true;
      else if (inSection && line.startsWith("#")) break;
    }
    if (inSection) section.push(line);
  }
  
  return section.join("\n") || null;
}

function extractTaskStatus(filePath) {
  if (!fs.existsSync(filePath)) return {};
  
  const content = fs.readFileSync(filePath, "utf8");
  const tasks = {};
  
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^\| (\w+-\d+).*\| (\w+) \|/);
    if (match) {
      const [, taskId, status] = match;
      tasks[taskId] = status;
    }
  }
  
  return tasks;
}

function checkTaskBoardDrift() {
  const drifts = [];
  
  const taskBoardPath = path.join(COORD_DIR, "TASK_BOARD.md");
  const currentFocusPath = path.join(COORD_DIR, "CURRENT_FOCUS.md");
  const agentLogPath = path.join(COORD_DIR, "AGENT_LOG.md");
  
  const boardTasks = extractTaskStatus(taskBoardPath);
  const focusTasks = {};
  const logTasks = {};
  
  if (fs.existsSync(currentFocusPath)) {
    const content = fs.readFileSync(currentFocusPath, "utf8");
    const matches = content.matchAll(/TASK-ID: (\w+-\d+)/g);
    for (const match of matches) {
      focusTasks[match[1]] = true;
    }
  }
  
  if (fs.existsSync(agentLogPath)) {
    const content = fs.readFileSync(agentLogPath, "utf8");
    const matches = content.matchAll(/TASK-ID: (\w+-\d+)/g);
    for (const match of matches) {
      logTasks[match[1]] = true;
    }
  }
  
  for (const [taskId, status] of Object.entries(boardTasks)) {
    if (status === "done" || status === "completed") {
      if (!logTasks[taskId]) {
        drifts.push({
          type: "status_mismatch",
          taskId,
          boardStatus: status,
          issue: "Task marked done in TASK_BOARD but not in AGENT_LOG",
          severity: "high",
        });
      }
    }
    
    if (status === "pending" && focusTasks[taskId]) {
      drifts.push({
        type: "focus_drift",
        taskId,
        issue: "Task in CURRENT_FOCUS but marked pending in TASK_BOARD",
        severity: "medium",
      });
    }
  }
  
  return drifts;
}

function checkFileDrift() {
  const drifts = [];
  
  const taskBoardPath = path.join(COORD_DIR, "TASK_BOARD.md");
  if (!fs.existsSync(taskBoardPath)) return drifts;
  
  const content = fs.readFileSync(taskBoardPath, "utf8");
  const fileMatches = content.matchAll(/\.([jt]sx?|\.ts|\.tsx?)(?=[^"])/g);
  const mentionedFiles = new Set();
  
  for (const match of fileMatches) {
    mentionedFiles.add(match[0]);
  }
  
  const actualFiles = new Set();
  const srcDir = path.join(ROOT, "src");
  const componentsDir = path.join(ROOT, "components");
  const viewsDir = path.join(ROOT, "views");
  const servicesDir = path.join(ROOT, "services");
  
  for (const dir of [srcDir, componentsDir, viewsDir, servicesDir]) {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir);
      for (const file of files) {
        const ext = path.extname(file);
        if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
          actualFiles.add(ext);
        }
      }
    }
  }
  
  return drifts;
}

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      getAllFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function checkOwnershipDrift() {
  const drifts = [];
  
  const taskBoardPath = path.join(COORD_DIR, "TASK_BOARD.md");
  const currentFocusPath = path.join(COORD_DIR, "CURRENT_FOCUS.md");
  
  if (!fs.existsSync(taskBoardPath)) return drifts;
  
  const boardContent = fs.readFileSync(taskBoardPath, "utf8");
  const ownerMatches = boardContent.matchAll(/\| (\w+-\d+) \| done \| (\w+) \|/g);
  
  const owners = {};
  for (const match of ownerMatches) {
    const [, taskId, owner] = match;
    owners[taskId] = owner;
  }
  
  if (fs.existsSync(currentFocusPath)) {
    const focusContent = fs.readFileSync(currentFocusPath, "utf8");
    const focusMatches = focusContent.matchAll(/## (\w+) — /g);
    
    for (const match of focusMatches) {
      const agent = match[1];
      const agentTasks = Object.entries(owners)
        .filter(([, o]) => o === agent)
        .map(([id]) => id);
      
      if (agentTasks.length > 0) {
        drifts.push({
          type: "ownership_info",
          agent,
          taskCount: agentTasks.length,
          tasks: agentTasks.slice(0, 5),
        });
      }
    }
  }
  
  return drifts;
}

function main() {
  console.log("🧠 Aurora Drift Detector\n");
  console.log("=".repeat(50));

  console.log("\n🔍 Scanning for drifts...\n");

  const taskDrifts = checkTaskBoardDrift();
  const fileDrifts = checkFileDrift();
  const ownershipInfo = checkOwnershipDrift();

  console.log("📊 Task Board Drift Analysis");
  console.log("-".repeat(30));

  if (taskDrifts.length === 0) {
    console.log("   ✅ No task drifts detected");
  } else {
    const high = taskDrifts.filter(d => d.severity === "high");
    const medium = taskDrifts.filter(d => d.severity === "medium");
    
    console.log(`   ⚠️  Found ${taskDrifts.length} drifts`);
    console.log(`      High severity: ${high.length}`);
    console.log(`      Medium severity: ${medium.length}`);
    
    for (const drift of taskDrifts.slice(0, 10)) {
      const icon = drift.severity === "high" ? "🔴" : "🟡";
      console.log(`\n   ${icon} ${drift.taskId}`);
      console.log(`      Type: ${drift.type}`);
      console.log(`      Issue: ${drift.issue}`);
    }
  }

  console.log("\n📁 Ownership Distribution");
  console.log("-".repeat(30));

  if (ownershipInfo.length === 0) {
    console.log("   ℹ️  No ownership data found");
  } else {
    for (const info of ownershipInfo) {
      console.log(`   👤 ${info.agent}: ${info.taskCount} tasks`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n📈 Drift Summary");
  console.log("-".repeat(30));

  const totalDrifts = taskDrifts.length + fileDrifts.length;
  console.log(`   Task drifts: ${taskDrifts.length}`);
  console.log(`   File drifts: ${fileDrifts.length}`);
  console.log(`   Total drifts: ${totalDrifts}`);

  const driftScore = Math.max(0, 100 - (totalDrifts * 5));
  console.log(`\n   🟢 Drift Score: ${driftScore}/100`);

  if (totalDrifts === 0) {
    console.log("   ✅ No drifts detected - System is synchronized!");
  } else if (totalDrifts < 5) {
    console.log("   ⚠️  Minor drifts detected - Review recommended.");
  } else {
    console.log("   🔴 Significant drifts detected - Immediate attention needed!");
  }

  if (taskDrifts.length > 0) {
    console.log("\n📋 Recommended Actions:");
    console.log("   1. Update AGENT_LOG with completed tasks");
    console.log("   2. Sync CURRENT_FOCUS with TASK_BOARD");
    console.log("   3. Verify task ownership assignments");
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n✨ Drift detection complete!\n");
}

main();
