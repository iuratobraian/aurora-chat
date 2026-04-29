#!/usr/bin/env node
/**
 * resume-context.mjs - Resume Interrupted Tasks
 * 
 * Enables Aurora to resume work by:
 * - Saving task state to disk
 * - Restoring from interrupted task
 * - Replaying last N actions
 * - Continuing from checkpoint
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Memory Patterns
 * @see aurora/core/dream/aurora-dream.mjs - Session tracking
 * @see aurora/core/memory/memory-backend.mjs - Memory storage
 */

import fs from 'node:fs';
import path from 'node:path';

const RESUME_CONFIG = {
  // Directory for checkpoints
  checkpointDir: '.aurora/checkpoints',
  
  // Max checkpoints to keep
  maxCheckpoints: 10,
  
  // Auto-save interval (ms)
  autoSaveInterval: 5 * 60 * 1000, // 5 minutes
  
  // Max actions to replay
  maxReplayActions: 50
};

export class ResumeContext {
  constructor(options = {}) {
    this.config = { ...RESUME_CONFIG, ...options };
    this.currentSession = null;
    this.actionBuffer = [];
    this.autoSaveTimer = null;
    
    this.ensureCheckpointDir();
  }

  /**
   * Get tool schema
   */
  getSchema() {
    return {
      name: 'resume',
      description: 'Save and restore task state for resuming interrupted work',
      parameters: {
        operation: {
          type: 'string',
          required: true,
          enum: ['save', 'load', 'list', 'delete', 'replay'],
          description: 'Resume operation'
        },
        taskId: {
          type: 'string',
          description: 'Task ID (auto-generated if not provided)'
        },
        checkpointName: {
          type: 'string',
          description: 'Checkpoint name (for list/delete)'
        },
        replayActions: {
          type: 'number',
          description: 'Number of actions to replay (default: 10)'
        }
      },
      returns: {
        success: 'boolean',
        checkpoint: 'object',
        state: 'object',
        error: 'string | null'
      }
    };
  }

  /**
   * Execute resume operation
   */
  async execute(operation, options = {}) {
    switch (operation) {
      case 'save':
        return await this.saveCheckpoint(options);
      case 'load':
        return await this.loadCheckpoint(options);
      case 'list':
        return await this.listCheckpoints();
      case 'delete':
        return await this.deleteCheckpoint(options);
      case 'replay':
        return await this.replayActions(options);
      default:
        return { success: false, error: `Unknown operation: ${operation}` };
    }
  }

  /**
   * Start session with auto-save
   */
  async startSession(task) {
    const sessionId = `session-${Date.now()}-${task.name?.replace(/\s+/g, '-') || 'untitled'}`;
    
    this.currentSession = {
      id: sessionId,
      task,
      startTime: new Date().toISOString(),
      lastSave: null,
      checkpoints: [],
      actions: [],
      state: {}
    };
    
    // Start auto-save
    this.startAutoSave();
    
    // Save initial state
    await this.saveCheckpoint({ reason: 'session_start' });
    
    console.log(`📍 Session started: ${sessionId}`);
    console.log(`   Task: ${task.name}`);
    console.log(`   Auto-save: every ${this.config.autoSaveInterval / 60000} min\n`);
    
    return { sessionId, success: true };
  }

  /**
   * Save checkpoint
   */
  async saveCheckpoint(options = {}) {
    if (!this.currentSession) {
      return { success: false, error: 'No active session' };
    }

    const { reason = 'manual', state = {} } = options;
    
    const checkpoint = {
      id: `checkpoint-${Date.now()}`,
      sessionId: this.currentSession.id,
      reason,
      timestamp: new Date().toISOString(),
      task: this.currentSession.task,
      actions: this.actionBuffer.slice(-this.config.maxReplayActions),
      state: { ...this.currentSession.state, ...state },
      actionCount: this.currentSession.actions.length
    };
    
    // Save to file
    const checkpointFile = path.join(
      this.config.checkpointDir,
      `${checkpoint.id}.json`
    );
    
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2), 'utf8');
    
    // Update session
    this.currentSession.checkpoints.push(checkpoint.id);
    this.currentSession.lastSave = checkpoint.timestamp;
    
    // Cleanup old checkpoints
    await this.cleanupOldCheckpoints();
    
    console.log(`💾 Checkpoint saved: ${checkpoint.id}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Actions buffered: ${checkpoint.actions.length}\n`);
    
    return {
      success: true,
      checkpoint: {
        id: checkpoint.id,
        reason: checkpoint.reason,
        timestamp: checkpoint.timestamp,
        actionCount: checkpoint.actionCount
      }
    };
  }

  /**
   * Load checkpoint
   */
  async loadCheckpoint(options = {}) {
    const { checkpointId } = options;
    
    // Find checkpoint
    const checkpointFile = checkpointId
      ? path.join(this.config.checkpointDir, `${checkpointId}.json`)
      : this.getLatestCheckpoint();
    
    if (!checkpointFile || !fs.existsSync(checkpointFile)) {
      return { success: false, error: 'Checkpoint not found' };
    }
    
    const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    
    // Restore session
    this.currentSession = {
      id: checkpoint.sessionId,
      task: checkpoint.task,
      startTime: new Date().toISOString(),
      lastSave: checkpoint.timestamp,
      checkpoints: [],
      actions: checkpoint.actions,
      state: checkpoint.state
    };
    
    this.actionBuffer = checkpoint.actions;
    
    console.log(`📍 Checkpoint loaded: ${checkpoint.id}`);
    console.log(`   Task: ${checkpoint.task.name}`);
    console.log(`   Actions available: ${checkpoint.actions.length}`);
    console.log(`   Saved: ${checkpoint.timestamp}\n`);
    
    return {
      success: true,
      checkpoint: {
        id: checkpoint.id,
        task: checkpoint.task,
        state: checkpoint.state,
        actions: checkpoint.actions.length
      }
    };
  }

  /**
   * List checkpoints
   */
  async listCheckpoints() {
    const files = fs.readdirSync(this.config.checkpointDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, this.config.maxCheckpoints);
    
    const checkpoints = [];
    
    for (const file of files) {
      const checkpoint = JSON.parse(
        fs.readFileSync(path.join(this.config.checkpointDir, file), 'utf8')
      );
      
      checkpoints.push({
        id: checkpoint.id,
        sessionId: checkpoint.sessionId,
        task: checkpoint.task?.name,
        reason: checkpoint.reason,
        timestamp: checkpoint.timestamp,
        actions: checkpoint.actions.length
      });
    }
    
    return {
      success: true,
      checkpoints,
      total: checkpoints.length
    };
  }

  /**
   * Delete checkpoint
   */
  async deleteCheckpoint(options = {}) {
    const { checkpointId } = options;
    
    if (!checkpointId) {
      return { success: false, error: 'Checkpoint ID required' };
    }
    
    const checkpointFile = path.join(this.config.checkpointDir, `${checkpointId}.json`);
    
    if (!fs.existsSync(checkpointFile)) {
      return { success: false, error: 'Checkpoint not found' };
    }
    
    fs.unlinkSync(checkpointFile);
    
    console.log(`🗑️  Checkpoint deleted: ${checkpointId}\n`);
    
    return { success: true, deleted: checkpointId };
  }

  /**
   * Replay actions
   */
  async replayActions(options = {}) {
    const { count = 10 } = options;
    
    if (!this.currentSession) {
      return { success: false, error: 'No active session' };
    }
    
    const actionsToReplay = this.currentSession.actions.slice(-count);
    
    console.log(`🔄 Replaying ${actionsToReplay.length} actions:\n`);
    
    for (let i = 0; i < actionsToReplay.length; i++) {
      const action = actionsToReplay[i];
      console.log(`  ${i + 1}. [${action.type}] ${action.description}`);
      if (action.result) {
        console.log(`     → ${action.result.success ? '✅ Success' : '❌ Failed'}`);
      }
    }
    
    console.log('\n');
    
    return {
      success: true,
      actions: actionsToReplay,
      total: actionsToReplay.length
    };
  }

  /**
   * Log action
   */
  logAction(action) {
    if (!this.currentSession) return;
    
    const actionRecord = {
      ...action,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession.id
    };
    
    this.currentSession.actions.push(actionRecord);
    this.actionBuffer.push(actionRecord);
    
    // Trim buffer
    if (this.actionBuffer.length > this.config.maxReplayActions) {
      this.actionBuffer.shift();
    }
  }

  /**
   * Update session state
   */
  updateState(state) {
    if (!this.currentSession) return false;
    
    this.currentSession.state = {
      ...this.currentSession.state,
      ...state
    };
    
    return true;
  }

  /**
   * End session
   */
  async endSession(reason = 'completed') {
    if (!this.currentSession) return { success: false, error: 'No active session' };
    
    // Stop auto-save
    this.stopAutoSave();
    
    // Save final checkpoint
    await this.saveCheckpoint({ reason: `session_end_${reason}` });
    
    const session = this.currentSession;
    this.currentSession = null;
    this.actionBuffer = [];
    
    console.log(`📍 Session ended: ${session.id}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Total actions: ${session.actions.length}`);
    console.log(`   Checkpoints: ${session.checkpoints.length}\n`);
    
    return {
      success: true,
      session: {
        id: session.id,
        task: session.task,
        duration: Date.now() - new Date(session.startTime).getTime(),
        actions: session.actions.length,
        checkpoints: session.checkpoints.length
      }
    };
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    this.stopAutoSave();
    
    this.autoSaveTimer = setInterval(async () => {
      if (this.currentSession && this.actionBuffer.length > 0) {
        await this.saveCheckpoint({ reason: 'auto_save' });
      }
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Ensure checkpoint directory exists
   */
  ensureCheckpointDir() {
    if (!fs.existsSync(this.config.checkpointDir)) {
      fs.mkdirSync(this.config.checkpointDir, { recursive: true });
    }
  }

  /**
   * Get latest checkpoint file
   */
  getLatestCheckpoint() {
    const files = fs.readdirSync(this.config.checkpointDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    return files.length > 0 
      ? path.join(this.config.checkpointDir, files[0])
      : null;
  }

  /**
   * Cleanup old checkpoints
   */
  async cleanupOldCheckpoints() {
    const files = fs.readdirSync(this.config.checkpointDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    // Keep only maxCheckpoints
    const toDelete = files.slice(this.config.maxCheckpoints);
    
    for (const file of toDelete) {
      fs.unlinkSync(path.join(this.config.checkpointDir, file));
    }
    
    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} old checkpoints\n`);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let resumeContextInstance = null;

export function getResumeContext() {
  if (!resumeContextInstance) {
    resumeContextInstance = new ResumeContext();
  }
  return resumeContextInstance;
}

export async function executeResume(operation, options = {}) {
  const resumeContext = getResumeContext();
  return await resumeContext.execute(operation, options);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const operation = args[0];

  if (!operation) {
    console.log('ResumeContext - Save and restore task state\n');
    console.log('Usage: node resume-context.mjs <operation> [options]');
    console.log('\nOperations:');
    console.log('  save              - Save current checkpoint');
    console.log('  load [id]         - Load checkpoint (latest if no ID)');
    console.log('  list              - List all checkpoints');
    console.log('  delete <id>       - Delete checkpoint');
    console.log('  replay [count]    - Replay last N actions\n');
    console.log('Options:');
    console.log('  --reason <text>   - Reason for checkpoint');
    console.log('  --count <n>       - Number of actions to replay\n');
    process.exit(0);
  }

  const resumeContext = getResumeContext();
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--reason' && args[i + 1]) {
      options.reason = args[++i];
    } else if (arg === '--count' && args[i + 1]) {
      options.count = parseInt(args[++i]);
    } else if (!arg.startsWith('-') && operation !== 'save') {
      options.checkpointId = arg;
    }
  }

  console.log(`🔄 Resume: ${operation}\n`);

  resumeContext.execute(operation, options)
    .then(result => {
      if (result.error) {
        console.error('❌ Error:', result.error);
        process.exit(1);
      }

      if (result.checkpoint) {
        console.log('📍 Checkpoint:', result.checkpoint.id || 'loaded');
        if (result.checkpoint.task) {
          console.log('   Task:', result.checkpoint.task.name);
        }
      }

      if (result.checkpoints) {
        console.log('\n📋 Checkpoints:\n');
        for (const cp of result.checkpoints) {
          console.log(`  ${cp.id}`);
          console.log(`    Task: ${cp.task}`);
          console.log(`    Reason: ${cp.reason}`);
          console.log(`    Actions: ${cp.actions}`);
          console.log(`    Saved: ${cp.timestamp}\n`);
        }
      }

      if (result.actions) {
        console.log(`\n📊 Actions: ${result.total}`);
      }

      console.log('\n✅ Success\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
