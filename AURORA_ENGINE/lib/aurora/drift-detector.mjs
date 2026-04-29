import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = join(__dirname, '../../workspace/coordination');
const TASK_BOARD = join(WORKSPACE, 'TASK_BOARD.md');
const CURRENT_FOCUS = join(WORKSPACE, 'CURRENT_FOCUS.md');
const AGENT_LOG = join(WORKSPACE, 'AGENT_LOG.md');
const DRIFT_REPORT = join(WORKSPACE, 'drift-report.json');

const DRIFT_TYPES = {
  BOARD_FOCUS_MISMATCH: 'board_focus_mismatch',
  COMPLETION_DRIFT: 'completion_drift',
  OWNERSHIP_DRIFT: 'ownership_drift',
  STATUS_DRIFT: 'status_drift',
  LOG_BOARD_DRIFT: 'log_board_drift',
  FILE_OWNERSHIP_DRIFT: 'file_ownership_drift'
};

function loadFile(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf-8');
}

function parseTaskBoard(content) {
  if (!content) return { tasks: [], completed: [], inProgress: [] };
  
  const lines = content.split('\n');
  const tasks = [];
  let currentSection = null;
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
    }
    
    const taskMatch = line.match(/^\| (\S+) \| (\S+) \| (\S+) \|/);
    if (taskMatch && currentSection) {
      const [, id, status, owner] = taskMatch;
      const task = { id, status, owner, section: currentSection };
      tasks.push(task);
    }
  }
  
  return {
    tasks,
    completed: tasks.filter(t => t.status === 'done'),
    inProgress: tasks.filter(t => ['claimed', 'in_progress'].includes(t.status)),
    pending: tasks.filter(t => ['pending', 'requested', 'todo'].includes(t.status))
  };
}

function parseCurrentFocus(content) {
  if (!content) return null;
  
  const taskMatch = content.match(/\*\*TASK-ID\*\*:\s*(\S+)/);
  const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/);
  const phaseMatch = content.match(/\*\*Phase\*\*:\s*([^\n]+)/);
  
  return {
    taskId: taskMatch?.[1] || null,
    status: statusMatch?.[1] || null,
    phase: phaseMatch?.[1]?.trim() || null
  };
}

function parseAgentLog(content) {
  if (!content) return { entries: [], completedTasks: [], claimedTasks: [] };
  
  const entries = [];
  const completedTasks = [];
  const claimedTasks = [];
  
  const entryBlocks = content.split(/\n(?=### \d{4}-\d{2}-\d{2})/);
  
  for (const block of entryBlocks) {
    const dateMatch = block.match(/### (\d{4}-\d{2}-\d{2})/);
    const taskMatch = block.match(/- TASK-ID:\s*(\S+)/);
    const statusMatch = block.match(/- Estado:\s*(\S+)/);
    const agentMatch = block.match(/- Agente:\s*(\S+)/);
    
    if (dateMatch) {
      const entry = {
        date: dateMatch[1],
        taskId: taskMatch?.[1] || null,
        status: statusMatch?.[1] || null,
        agent: agentMatch?.[1] || null
      };
      entries.push(entry);
      
      if (entry.status === 'done' && entry.taskId) {
        completedTasks.push(entry.taskId);
      }
      if (entry.status === 'claimed' && entry.taskId) {
        claimedTasks.push(entry.taskId);
      }
    }
  }
  
  return { entries, completedTasks, claimedTasks };
}

async function detectDrift(options = {}) {
  const { verbose = false } = options;
  
  console.log('[DriftDetector] Starting drift analysis...');
  
  const signals = [];
  
  const boardContent = loadFile(TASK_BOARD);
  const focusContent = loadFile(CURRENT_FOCUS);
  const logContent = loadFile(AGENT_LOG);
  
  const board = parseTaskBoard(boardContent);
  const focus = parseCurrentFocus(focusContent);
  const log = parseAgentLog(logContent);
  
  if (verbose) {
    console.log(`[DriftDetector] Board: ${board.tasks.length} tasks`);
    console.log(`[DriftDetector] Focus: ${focus?.taskId || 'none'}`);
    console.log(`[DriftDetector] Log: ${log.entries.length} entries`);
  }
  
  if (focus?.taskId) {
    const focusTask = board.tasks.find(t => t.id === focus.taskId);
    if (focusTask) {
      if (focusTask.status === 'done' && !focus.status?.includes('COMPLETE')) {
        signals.push({
          type: DRIFT_TYPES.BOARD_FOCUS_MISMATCH,
          severity: 'high',
          title: 'Focus task marked done but status not updated',
          description: `Task ${focus.taskId} is "done" in board but focus shows "${focus.status}"`,
          taskId: focus.taskId,
          recommendedAction: `Update CURRENT_FOCUS.md or move task to in_progress`
        });
      }
      
      if (focusTask.status === 'done' && focus.phase?.includes('IN_PROGRESS')) {
        signals.push({
          type: DRIFT_TYPES.BOARD_FOCUS_MISMATCH,
          severity: 'medium',
          title: 'Phase mismatch with task status',
          description: `Phase shows IN_PROGRESS but task ${focus.taskId} is done`,
          taskId: focus.taskId,
          recommendedAction: 'Update phase to COMPLETED in CURRENT_FOCUS.md'
        });
      }
    } else {
      signals.push({
        type: DRIFT_TYPES.BOARD_FOCUS_MISMATCH,
        severity: 'high',
        title: 'Focus task not found in board',
        description: `Task ${focus.taskId} in focus does not exist in TASK_BOARD.md`,
        taskId: focus.taskId,
        recommendedAction: 'Remove stale focus or add task to board'
      });
    }
  }
  
  const completedInLog = new Set(log.completedTasks);
  const completedInBoard = new Set(board.completed.map(t => t.id));
  
  for (const taskId of completedInLog) {
    if (!completedInBoard.has(taskId)) {
      signals.push({
        type: DRIFT_TYPES.LOG_BOARD_DRIFT,
        severity: 'medium',
        title: 'Task completed in log but not marked done in board',
        description: `Task ${taskId} found as "done" in AGENT_LOG.md but not in TASK_BOARD`,
        taskId,
        recommendedAction: `Update TASK_BOARD.md: ${taskId} → done`
      });
    }
  }
  
  for (const taskId of completedInBoard) {
    if (!completedInLog.has(taskId)) {
      console.log(`[DriftDetector] Note: ${taskId} marked done in board but no entry in log`);
    }
  }
  
  const claimedInLog = new Set(log.claimedTasks);
  const claimedInBoard = new Set(board.inProgress.map(t => t.id));
  
  for (const taskId of claimedInBoard) {
    if (!claimedInLog.has(taskId)) {
      const logEntry = log.entries.find(e => e.taskId === taskId);
      if (!logEntry) {
        signals.push({
          type: DRIFT_TYPES.STATUS_DRIFT,
          severity: 'low',
          title: 'Task claimed but no log entry',
          description: `Task ${taskId} is "claimed/in_progress" but no log entry`,
          taskId,
          recommendedAction: 'Add AGENT_LOG entry for this task'
        });
      }
    }
  }
  
  const doneTasks = board.tasks.filter(t => t.status === 'done');
  for (const task of doneTasks) {
    if (!task.owner || task.owner === 'unassigned') {
      signals.push({
        type: DRIFT_TYPES.OWNERSHIP_DRIFT,
        severity: 'low',
        title: 'Completed task without owner',
        description: `Task ${task.id} is done but has no owner recorded`,
        taskId: task.id,
        recommendedAction: 'Add agent name to owner column'
      });
    }
  }
  
  const oldEntries = log.entries.filter(e => {
    if (!e.date) return false;
    const entryDate = new Date(e.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate < thirtyDaysAgo;
  });
  
  if (oldEntries.length > 0) {
    console.log(`[DriftDetector] ${oldEntries.length} log entries older than 30 days`);
  }
  
  const result = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalTasks: board.tasks.length,
      completed: board.completed.length,
      inProgress: board.inProgress.length,
      pending: board.pending.length,
      driftSignals: signals.length
    },
    signals,
    recommendedActions: generateFixes(signals)
  };
  
  if (verbose || signals.length > 0) {
    console.log(`[DriftDetector] Found ${signals.length} drift signals`);
  }
  
  return result;
}

function generateFixes(signals) {
  const actions = [];
  
  const bySeverity = {
    high: signals.filter(s => s.severity === 'high'),
    medium: signals.filter(s => s.severity === 'medium'),
    low: signals.filter(s => s.severity === 'low')
  };
  
  if (bySeverity.high.length > 0) {
    actions.push({
      priority: 1,
      action: 'Fix high severity drifts immediately',
      tasks: bySeverity.high.map(s => s.recommendedAction)
    });
  }
  
  if (bySeverity.medium.length > 0) {
    actions.push({
      priority: 2,
      action: 'Fix medium severity drifts in this session',
      tasks: bySeverity.medium.map(s => s.recommendedAction)
    });
  }
  
  if (bySeverity.low.length > 0) {
    actions.push({
      priority: 3,
      action: 'Fix low severity drifts when convenient',
      tasks: bySeverity.low.map(s => s.recommendedAction)
    });
  }
  
  return actions;
}

async function autoFix(dryRun = true) {
  const drift = await detectDrift();
  const fixes = [];
  
  for (const signal of drift.signals) {
    if (signal.type === DRIFT_TYPES.LOG_BOARD_DRIFT) {
      fixes.push({
        signal: signal.title,
        fix: `Mark ${signal.taskId} as done in TASK_BOARD.md`,
        dryRun
      });
    }
    
    if (signal.type === DRIFT_TYPES.OWNERSHIP_DRIFT && !dryRun) {
      fixes.push({
        signal: signal.title,
        fix: `Add agent to owner column for ${signal.taskId}`,
        dryRun: false
      });
    }
  }
  
  return fixes;
}

async function saveDriftReport(drift) {
  writeFileSync(DRIFT_REPORT, JSON.stringify(drift, null, 2), 'utf-8');
  console.log(`[DriftDetector] Report saved to ${DRIFT_REPORT}`);
}

async function runAndSave(options = {}) {
  const drift = await detectDrift(options);
  await saveDriftReport(drift);
  return drift;
}

export {
  detectDrift,
  generateFixes,
  autoFix,
  saveDriftReport,
  runAndSave,
  DRIFT_TYPES
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'detect') {
    const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
    detectDrift({ verbose }).then(drift => {
      if (drift.signals.length === 0) {
        console.log('\n✅ No drift detected!');
      } else {
        console.log(`\n⚠️  Found ${drift.signals.length} drift signals:\n`);
        drift.signals.forEach((s, i) => {
          console.log(`${i + 1}. [${s.severity.toUpperCase()}] ${s.title}`);
          console.log(`   ${s.description}`);
          console.log(`   → ${s.recommendedAction}\n`);
        });
      }
    });
  } else if (command === 'fix') {
    const dryRun = !process.argv.includes('--apply');
    autoFix(dryRun).then(fixes => {
      console.log(`\n${dryRun ? 'DRY RUN' : 'APPLYING'} ${fixes.length} fixes:\n`);
      fixes.forEach(f => {
        console.log(`  ${f.dryRun ? '[DRY]' : '[FIX]'} ${f.fix}`);
      });
    });
  } else if (command === 'report') {
    runAndSave({ verbose: true }).then(drift => {
      console.log('\n=== Drift Report ===');
      console.log(`Generated: ${drift.generatedAt}`);
      console.log(`Tasks: ${drift.summary.totalTasks} (${drift.summary.completed} done, ${drift.summary.inProgress} in progress)`);
      console.log(`Drift Signals: ${drift.summary.driftSignals}`);
    });
  } else {
    console.log('Usage:');
    console.log('  node drift-detector.mjs detect [--verbose]');
    console.log('  node drift-detector.mjs fix [--apply]');
    console.log('  node drift-detector.mjs report');
  }
}
