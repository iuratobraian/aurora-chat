/**
 * resume.mjs - Resume Interrupted Tasks para Aurora
 *
 * Guarda estado de tareas a disco, restaura tareas interrumpidas,
 * hace replay de acciones previas.
 *
 * Uso:
 *   const { ResumeContext } = await import('./resume.mjs');
 *   const rc = new ResumeContext();
 *   await rc.save('task-001', { step: 3, data: {...} });
 *   const state = await rc.restore('task-001');
 */

import fs from 'node:fs';
import path from 'node:path';

const STATE_DIR = path.join(process.cwd(), '.aurora', 'state');

function ensureDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

export class ResumeContext {
  constructor(options = {}) {
    this.stateDir = options.stateDir || STATE_DIR;
    this.maxHistory = options.maxHistory || 50;
  }

  /**
   * Save task state to disk
   */
  async save(taskId, state) {
    ensureDir();
    const filePath = path.join(this.stateDir, `${taskId}.json`);
    const data = {
      taskId,
      state,
      savedAt: new Date().toISOString(),
      cwd: process.cwd(),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { saved: true, path: filePath };
  }

  /**
   * Restore task state from disk
   */
  async restore(taskId) {
    const filePath = path.join(this.stateDir, `${taskId}.json`);
    if (!fs.existsSync(filePath)) {
      return { found: false, taskId };
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return { found: true, ...data };
    } catch {
      return { found: false, taskId, error: 'Corrupted state file' };
    }
  }

  /**
   * Delete task state
   */
  async clear(taskId) {
    const filePath = path.join(this.stateDir, `${taskId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { cleared: true };
    }
    return { cleared: false, reason: 'State file not found' };
  }

  /**
   * List all saved states
   */
  async list() {
    ensureDir();
    const files = fs.readdirSync(this.stateDir).filter(f => f.endsWith('.json'));
    const states = [];

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.stateDir, file), 'utf8'));
        states.push({
          taskId: data.taskId,
          savedAt: data.savedAt,
          fileSize: fs.statSync(path.join(this.stateDir, file)).size,
        });
      } catch { /* skip corrupted */ }
    }

    return states.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)).slice(0, this.maxHistory);
  }

  /**
   * Replay last N actions for a task
   */
  async replay(taskId, actions) {
    const restored = await this.restore(taskId);
    if (!restored.found) {
      return { replayed: 0, error: 'No state found' };
    }

    // Log replay
    const replay = {
      taskId,
      restoredAt: new Date().toISOString(),
      originalSavedAt: restored.savedAt,
      actions: actions || restored.state.actions || [],
      state: restored.state,
    };

    return { replayed: replay.actions.length, replay };
  }

  /**
   * Schema for Aurora registry
   */
  getSchema() {
    return {
      name: 'resume',
      description: 'Save, restore, and replay task states. Use when tasks may be interrupted.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['save', 'restore', 'clear', 'list', 'replay'] },
          taskId: { type: 'string' },
          state: { type: 'object' },
          actions: { type: 'array' },
        },
        required: ['action'],
      },
    };
  }
}
