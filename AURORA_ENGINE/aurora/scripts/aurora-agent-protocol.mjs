#!/usr/bin/env node
/**
 * aurora-agent-protocol.mjs — Protocolo de Comunicación Aurora × Agente
 *
 * Define el protocolo de comunicación entre Aurora (mente maestra) y el agente de trabajo.
 * Establece formatos de mensaje, handoffs, y sincronización de estado.
 *
 * Este protocolo asegura que:
 * - Aurora y el agente compartan contexto sin duplicación
 * - Las decisiones sean trazables y verificables
 * - El conocimiento fluya bidireccionalmente
 * - Los handoffs sean limpios y sin pérdida de información
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROTOCOL_VERSION = '1.0.0';

function readText(filePath) {
  try { return fs.readFileSync(path.join(ROOT, filePath), 'utf8'); }
  catch { return ''; }
}

function readJson(filePath) {
  try { return JSON.parse(readText(filePath)); }
  catch { return null; }
}

function writeJson(filePath, data) {
  fs.writeFileSync(path.join(ROOT, filePath), JSON.stringify(data, null, 2), 'utf8');
}

// ═══════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════

export const MessageType = {
  // De Aurora → Agente
  TASK_ASSIGN: 'task_assign',
  CONTEXT_INJECT: 'context_inject',
  SKILL_TRIGGER: 'skill_trigger',
  RISK_ALERT: 'risk_alert',
  NEXT_STEP: 'next_step',
  VALIDATION_CHECK: 'validation_check',
  HANDOFF_REQUEST: 'handoff_request',
  SESSION_BRIEF: 'session_brief',
  DRIFT_ALERT: 'drift_alert',
  SCORECARD_UPDATE: 'scorecard_update',

  // De Agente → Aurora
  TASK_CLAIM: 'task_claim',
  TASK_COMPLETE: 'task_complete',
  TASK_BLOCKED: 'task_blocked',
  KNOWLEDGE_CONTRIBUTE: 'knowledge_contribute',
  PATTERN_DISCOVERED: 'pattern_discovered',
  ANTI_PATTERN_DETECTED: 'anti_pattern_detected',
  ERROR_REPORT: 'error_report',
  PROGRESS_UPDATE: 'progress_update',
  CONTEXT_REQUEST: 'context_request',
  SKILL_RESULT: 'skill_result',

  // Bidireccional
  SYNC_REQUEST: 'sync_request',
  SYNC_RESPONSE: 'sync_response',
  HEARTBEAT: 'heartbeat',
};

// ═══════════════════════════════════════════
// MESSAGE FACTORY
// ═══════════════════════════════════════════

function createMessage(type, payload, source = 'aurora') {
  return {
    protocol: PROTOCOL_VERSION,
    type,
    source,
    target: source === 'aurora' ? 'agent' : 'aurora',
    payload,
    timestamp: new Date().toISOString(),
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  };
}

// ═══════════════════════════════════════════
// AURORA → AGENTE MESSAGES
// ═══════════════════════════════════════════

export function taskAssign(taskId, context) {
  return createMessage(MessageType.TASK_ASSIGN, {
    taskId,
    context,
    priority: context?.priority || 'medium',
    estimatedComplexity: context?.complexity || 'unknown',
    suggestedSkills: context?.skills || [],
    relatedFiles: context?.files || [],
    deadline: context?.deadline || null,
  }, 'aurora');
}

export function contextInject(knowledge, surface, skills) {
  return createMessage(MessageType.CONTEXT_INJECT, {
    knowledge: knowledge?.slice(0, 10) || [],
    surface: surface || null,
    skills: skills?.slice(0, 5) || [],
    injectionReason: 'task_preparation',
  }, 'aurora');
}

export function skillTrigger(skillId, reason, context) {
  return createMessage(MessageType.SKILL_TRIGGER, {
    skillId,
    reason,
    context,
    autoApply: true,
  }, 'aurora');
}

export function riskAlert(riskType, severity, details) {
  return createMessage(MessageType.RISK_ALERT, {
    riskType,
    severity,
    details,
    suggestedAction: details?.suggestedAction || 'review',
  }, 'aurora');
}

export function nextStep(taskId, step, validation) {
  return createMessage(MessageType.NEXT_STEP, {
    taskId,
    step,
    validation,
    reasoning: step?.reasoning || '',
  }, 'aurora');
}

export function validationCheck(taskId, checklist) {
  return createMessage(MessageType.VALIDATION_CHECK, {
    taskId,
    checklist,
    required: true,
  }, 'aurora');
}

export function sessionBrief(health, tasks, knowledge, focus) {
  return createMessage(MessageType.SESSION_BRIEF, {
    health,
    tasks,
    knowledge,
    focus,
    sessionStart: new Date().toISOString(),
  }, 'aurora');
}

// ═══════════════════════════════════════════
// AGENTE → AURORA MESSAGES
// ═══════════════════════════════════════════

export function taskClaim(taskId, agentName, reasoning) {
  return createMessage(MessageType.TASK_CLAIM, {
    taskId,
    agent: agentName,
    reasoning,
    estimatedDuration: null,
    requiredContext: [],
  }, 'agent');
}

export function taskComplete(taskId, agentName, results, notes) {
  return createMessage(MessageType.TASK_COMPLETE, {
    taskId,
    agent: agentName,
    results,
    notes,
    filesModified: results?.filesModified || [],
    testsPassed: results?.testsPassed || false,
    lintPassed: results?.lintPassed || false,
    duration: results?.duration || null,
  }, 'agent');
}

export function taskBlocked(taskId, agentName, reason, blockers) {
  return createMessage(MessageType.TASK_BLOCKED, {
    taskId,
    agent: agentName,
    reason,
    blockers,
    needsHelp: true,
    suggestedResolution: null,
  }, 'agent');
}

export function knowledgeContribute(type, entry) {
  return createMessage(MessageType.KNOWLEDGE_CONTRIBUTE, {
    type,
    entry: {
      ...entry,
      source: 'agent',
      timestamp: new Date().toISOString(),
      validated: false,
      reuseScore: 0,
    },
  }, 'agent');
}

export function patternDiscovered(pattern, context, confidence) {
  return createMessage(MessageType.PATTERN_DISCOVERED, {
    pattern,
    context,
    confidence,
    applicableDomains: context?.domains || [],
  }, 'agent');
}

export function antiPatternDetected(antiPattern, context, severity) {
  return createMessage(MessageType.ANTI_PATTERN_DETECTED, {
    antiPattern,
    context,
    severity,
    suggestedFix: context?.fix || null,
  }, 'agent');
}

export function errorReport(error, context, recovery) {
  return createMessage(MessageType.ERROR_REPORT, {
    error: {
      message: error?.message || 'Unknown error',
      stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
      type: error?.name || 'Error',
    },
    context,
    recovery,
    timestamp: new Date().toISOString(),
  }, 'agent');
}

export function progressUpdate(taskId, percent, milestone, notes) {
  return createMessage(MessageType.PROGRESS_UPDATE, {
    taskId,
    percent,
    milestone,
    notes,
    remainingWork: null,
    blockers: [],
  }, 'agent');
}

export function contextRequest(query, taskId, minContext) {
  return createMessage(MessageType.CONTEXT_REQUEST, {
    query,
    taskId,
    minContext: minContext || true,
    maxResults: 10,
  }, 'agent');
}

export function skillResult(skillId, result, applied) {
  return createMessage(MessageType.SKILL_RESULT, {
    skillId,
    result,
    applied,
    effectiveness: result?.effectiveness || null,
  }, 'agent');
}

// ═══════════════════════════════════════════
// BIDIRECTIONAL MESSAGES
// ═══════════════════════════════════════════

export function syncRequest(source) {
  return createMessage(MessageType.SYNC_REQUEST, {
    requestedData: ['tasks', 'knowledge', 'surfaces', 'health'],
    forceRefresh: false,
  }, source);
}

export function syncResponse(data, source) {
  return createMessage(MessageType.SYNC_RESPONSE, {
    data,
    timestamp: new Date().toISOString(),
    version: PROTOCOL_VERSION,
  }, source);
}

export function heartbeat(source, status) {
  return createMessage(MessageType.HEARTBEAT, {
    status: status || 'alive',
    load: null,
    activeTasks: [],
    uptime: null,
  }, source);
}

// ═══════════════════════════════════════════
// MESSAGE LOG
// ═══════════════════════════════════════════

function logMessage(message) {
  const logPath = path.join(ROOT, '.agent/workspace/coordination/message-log.jsonl');
  try {
    const existing = fs.readFileSync(logPath, 'utf8').trim();
    fs.writeFileSync(logPath, existing + '\n' + JSON.stringify(message), 'utf8');
  } catch {
    fs.writeFileSync(logPath, JSON.stringify(message), 'utf8');
  }
}

export function sendMessage(message) {
  logMessage(message);
  return message;
}

// ═══════════════════════════════════════════
// PROTOCOL HANDLER
// ═══════════════════════════════════════════

export function handleMessage(message) {
  const handlers = {
    [MessageType.TASK_ASSIGN]: handleTaskAssign,
    [MessageType.TASK_CLAIM]: handleTaskClaim,
    [MessageType.TASK_COMPLETE]: handleTaskComplete,
    [MessageType.CONTEXT_REQUEST]: handleContextRequest,
    [MessageType.KNOWLEDGE_CONTRIBUTE]: handleKnowledgeContribute,
    [MessageType.HEARTBEAT]: handleHeartbeat,
  };

  const handler = handlers[message.type];
  if (!handler) {
    return { error: `Unknown message type: ${message.type}` };
  }

  return handler(message);
}

function handleTaskAssign(message) {
  const { taskId, context } = message.payload;
  return {
    ok: true,
    taskId,
    action: 'task_received',
    nextStep: 'review_context_and_claim',
  };
}

function handleTaskClaim(message) {
  const { taskId, agent, reasoning } = message.payload;
  return {
    ok: true,
    taskId,
    agent,
    action: 'task_claimed',
    reasoning,
    nextStep: 'begin_implementation',
  };
}

function handleTaskComplete(message) {
  const { taskId, agent, results, notes } = message.payload;
  return {
    ok: true,
    taskId,
    agent,
    action: 'task_completed',
    results,
    notes,
    nextStep: 'update_board_and_log',
  };
}

function handleContextRequest(message) {
  const { query, taskId, minContext } = message.payload;
  // This would integrate with the context bridge
  return {
    ok: true,
    query,
    taskId,
    action: 'context_requested',
    nextStep: 'retrieve_from_knowledge_base',
  };
}

function handleKnowledgeContribute(message) {
  const { type, entry } = message.payload;
  return {
    ok: true,
    type,
    entryId: entry.id,
    action: 'knowledge_contributed',
    nextStep: 'validate_and_store',
  };
}

function handleHeartbeat(message) {
  return {
    ok: true,
    status: message.payload.status,
    action: 'heartbeat_received',
  };
}

// ═══════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════

export function startSession(agentName) {
  const session = {
    id: `session_${Date.now()}`,
    agent: agentName,
    startTime: new Date().toISOString(),
    status: 'active',
    tasksCompleted: 0,
    messagesExchanged: 0,
  };

  const sessionsPath = path.join(ROOT, '.agent/workspace/coordination/sessions.json');
  const sessions = readJson('.agent/workspace/coordination/sessions.json') || [];
  sessions.push(session);
  writeJson('.agent/workspace/coordination/sessions.json', sessions);

  sendMessage(heartbeat(agentName, 'session_started'));

  return session;
}

export function endSession(sessionId, agentName) {
  const sessionsPath = path.join(ROOT, '.agent/workspace/coordination/sessions.json');
  const sessions = readJson('.agent/workspace/coordination/sessions.json') || [];

  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.endTime = new Date().toISOString();
    session.status = 'completed';
  }

  writeJson('.agent/workspace/coordination/sessions.json', sessions);

  sendMessage(heartbeat(agentName, 'session_ended'));

  return session;
}

export function getActiveSession() {
  const sessions = readJson('.agent/workspace/coordination/sessions.json') || [];
  return sessions.find(s => s.status === 'active') || null;
}
