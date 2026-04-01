#!/usr/bin/env node
/**
 * aurora-kairos.mjs - KAIROS Always-On Assistant
 * 
 * Patrón extraído de Claude Code leak:
 * - Asistente siempre activo en background
 * - Detección proactiva de cambios
 * - Sugerencias automáticas sin prompting
 * - Logs diarios de contexto
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md
 */

import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const KAIROS_LOG_DIR = path.join(ROOT, '.aurora', 'kairos', 'logs');
const KAIROS_STATE_FILE = path.join(ROOT, '.aurora', 'kairos', 'state.json');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const KAIROS_CONFIG = {
  // Intervalo entre ticks (5 minutos)
  tickIntervalMs: 5 * 60 * 1000,
  
  // Límite de tiempo para acciones proactivas (15 segundos)
  actionTimeoutMs: 15000,
  
  // Modo breve (minimiza output en terminal)
  briefMode: true,
  
  // Habilitar notificaciones push
  enableNotifications: true,
  
  // Monitoreo de cambios
  watchPaths: [
    'src/',
    'convex/',
    'scripts/',
    '.agent/workspace/coordination/'
  ],
  
  // Umbrales para sugerencias
  thresholds: {
    gitChangesForSuggestion: 3,
    errorCountForAlert: 5,
    taskAgeForReminder: 24 * 60 * 60 * 1000 // 24 horas
  }
};

// ============================================================================
// KAIROS CLASS
// ============================================================================

export class AuroraKAIROS extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = { ...KAIROS_CONFIG, ...options };
    this.isActive = false;
    this.tickLoop = null;
    this.lastTick = null;
    this.dailyLog = [];
    this.proactiveActions = [];
    this.contextChanges = [];
  }

  /**
   * Iniciar KAIROS daemon
   */
  async start() {
    console.log('🧠 KAIROS: Starting always-on assistant...\n');
    
    // Crear directorios
    await this.ensureDirectories();
    
    // Cargar estado previo
    await this.loadState();
    
    // Iniciar loop de ticks
    this.isActive = true;
    this.tickLoop = setInterval(() => this.tick(), this.config.tickIntervalMs);
    
    console.log(`✅ KAIROS: Active (tick every ${this.config.tickIntervalMs / 1000}s)`);
    console.log(`📝 Daily log: ${KAIROS_LOG_DIR}`);
    console.log(`👁️  Watching: ${this.config.watchPaths.join(', ')}\n`);
    
    // Primer tick inmediato
    await this.tick();
    
    this.emit('kairos:started', { timestamp: Date.now() });
  }

  /**
   * Detener KAIROS daemon
   */
  async stop() {
    console.log('\n🧠 KAIROS: Stopping...\n');
    
    this.isActive = false;
    
    if (this.tickLoop) {
      clearInterval(this.tickLoop);
      this.tickLoop = null;
    }
    
    // Guardar estado
    await this.saveState();
    
    // Guardar log diario
    await this.saveDailyLog();
    
    console.log('✅ KAIROS: Stopped');
    console.log(`📊 Actions taken: ${this.proactiveActions.length}`);
    console.log(`📝 Context changes: ${this.contextChanges.length}\n`);
    
    this.emit('kairos:stopped', { timestamp: Date.now() });
  }

  /**
   * Tick principal - se ejecuta cada intervalo
   */
  async tick() {
    const tickStart = Date.now();
    this.lastTick = tickStart;
    
    try {
      // 1. Detectar cambios desde el último tick
      const changes = await this.detectChanges();
      
      // 2. Si hay cambios, procesar proactivamente
      if (changes.length > 0) {
        await this.processChanges(changes);
      }
      
      // 3. Verificar si hay acciones proactivas sugeridas
      await this.checkProactiveActions();
      
      // 4. Actualizar log diario
      await this.updateDailyLog({
        tick: tickStart,
        changes: changes.length,
        actions: this.proactiveActions.length
      });
      
      // Log en modo debug
      if (this.config.enableNotifications && changes.length > 0) {
        console.log(`🔔 KAIROS tick: ${changes.length} changes detected`);
      }
      
    } catch (error) {
      console.error('❌ KAIROS tick error:', error.message);
      this.emit('kairos:error', { error, tick: tickStart });
    }
  }

  /**
   * Detectar cambios en el codebase
   */
  async detectChanges() {
    const changes = [];
    
    // 1. Cambios en Git
    const gitChanges = await this.detectGitChanges();
    if (gitChanges.length > 0) {
      changes.push({ type: 'git', items: gitChanges });
    }
    
    // 2. Nuevas tareas en TASK_BOARD
    const taskChanges = await this.detectTaskChanges();
    if (taskChanges.length > 0) {
      changes.push({ type: 'tasks', items: taskChanges });
    }
    
    // 3. Errores en AGENT_LOG
    const errorChanges = await this.detectErrorChanges();
    if (errorChanges.length > 0) {
      changes.push({ type: 'errors', items: errorChanges });
    }
    
    // 4. Archivos modificados recientemente
    const fileChanges = await this.detectFileChanges();
    if (fileChanges.length > 0) {
      changes.push({ type: 'files', items: fileChanges });
    }
    
    this.contextChanges.push(...changes);
    return changes;
  }

  /**
   * Detectar cambios en Git
   */
  async detectGitChanges() {
    try {
      const { execSync } = await import('node:child_process');
      
      // Git status --porcelain
      const output = execSync('git status --porcelain', {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      
      if (!output) return [];
      
      return output.split('\n').map(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3).trim();
        return { status, file };
      });
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Detectar cambios en tareas
   */
  async detectTaskChanges() {
    try {
      const taskBoardPath = path.join(ROOT, '.agent/workspace/coordination/TASK_BOARD.md');
      
      if (!fs.existsSync(taskBoardPath)) return [];
      
      const content = fs.readFileSync(taskBoardPath, 'utf8');
      
      // Buscar tareas "in_progress" o "claimed"
      const inProgressMatch = content.match(/\| [A-Z]+-\d+ \| [^|]+\| in_progress \|/gi);
      const claimedMatch = content.match(/\| [A-Z]+-\d+ \| [^|]+\| claimed \|/gi);
      
      const changes = [];
      
      if (inProgressMatch) {
        inProgressMatch.forEach(match => {
          const taskId = match.match(/[A-Z]+-\d+/)[0];
          changes.push({ 
            type: 'in_progress', 
            taskId,
            message: `Task ${taskId} is in progress`
          });
        });
      }
      
      if (claimedMatch) {
        claimedMatch.forEach(match => {
          const taskId = match.match(/[A-Z]+-\d+/)[0];
          changes.push({ 
            type: 'claimed', 
            taskId,
            message: `Task ${taskId} was claimed`
          });
        });
      }
      
      return changes;
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Detectar errores en AGENT_LOG
   */
  async detectErrorChanges() {
    try {
      const agentLogPath = path.join(ROOT, 'AGENT_LOG.md');
      
      if (!fs.existsSync(agentLogPath)) return [];
      
      const content = fs.readFileSync(agentLogPath, 'utf8');
      
      // Buscar errores recientes (últimas 24h)
      const errorLines = content.split('\n').filter(line => 
        line.includes('❌') || line.includes('Error') || line.includes('FAILED')
      );
      
      return errorLines.slice(-5).map(line => ({
        type: 'error',
        content: line.trim()
      }));
      
    } catch (error) {
      return [];
    }
  }

  /**
   * Detectar archivos modificados recientemente
   */
  async detectFileChanges() {
    const changes = [];
    const now = Date.now();
    const threshold = this.config.tickIntervalMs;
    
    for (const watchPath of this.config.watchPaths) {
      const fullPath = path.join(ROOT, watchPath);
      
      if (!fs.existsSync(fullPath)) continue;
      
      try {
        const files = await this.walkDirectory(fullPath);
        
        for (const file of files.slice(0, 50)) { // Limitar a 50 archivos
          const stats = fs.statSync(file);
          const modifiedTime = stats.mtimeMs;
          
          if (now - modifiedTime < threshold) {
            changes.push({
              type: 'modified',
              file: path.relative(ROOT, file),
              time: modifiedTime
            });
          }
        }
      } catch (error) {
        // Ignorar errores de permisos
      }
    }
    
    return changes;
  }

  /**
   * Procesar cambios detectados
   */
  async processChanges(changes) {
    for (const change of changes) {
      switch (change.type) {
        case 'git':
          await this.handleGitChanges(change.items);
          break;
        case 'tasks':
          await this.handleTaskChanges(change.items);
          break;
        case 'errors':
          await this.handleErrorChanges(change.items);
          break;
        case 'files':
          await this.handleFileChanges(change.items);
          break;
      }
    }
  }

  /**
   * Manejar cambios en Git
   */
  async handleGitChanges(changes) {
    if (changes.length >= this.config.thresholds.gitChangesForSuggestion) {
      const suggestion = {
        type: 'git_commit_suggestion',
        priority: 'medium',
        message: `Tienes ${changes.length} archivos modificados. ¿Quieres hacer commit?`,
        files: changes.map(c => c.file),
        actions: [
          { label: 'git add . && git commit -m "..."', type: 'command' },
          { label: 'Ver cambios', type: 'view' }
        ]
      };
      
      await this.sendProactiveSuggestion(suggestion);
    }
  }

  /**
   * Manejar cambios en tareas
   */
  async handleTaskChanges(changes) {
    for (const change of changes) {
      if (change.type === 'claimed') {
        const suggestion = {
          type: 'task_started',
          priority: 'low',
          message: `Task ${change.taskId} fue reclamada. ¿Necesitas ayuda para comenzar?`,
          actions: [
            { label: 'Mostrar archivos a editar', type: 'view' },
            { label: 'Crear CURRENT_FOCUS.md', type: 'action' }
          ]
        };
        
        await this.sendProactiveSuggestion(suggestion);
      }
    }
  }

  /**
   * Manejar errores
   */
  async handleErrorChanges(errors) {
    if (errors.length >= this.config.thresholds.errorCountForAlert) {
      const suggestion = {
        type: 'error_alert',
        priority: 'high',
        message: `Se detectaron ${errors.length} errores recientes. ¿Quieres que analice?`,
        errors: errors.map(e => e.content),
        actions: [
          { label: 'Analizar errores', type: 'action' },
          { label: 'Mostrar AGENT_LOG.md', type: 'view' }
        ]
      };
      
      await this.sendProactiveSuggestion(suggestion);
    }
  }

  /**
   * Manejar cambios en archivos
   */
  async handleFileChanges(files) {
    // Por ahora, solo loguear
    // En el futuro: detectar patrones, sugerir refactorings, etc.
  }

  /**
   * Verificar acciones proactivas
   */
  async checkProactiveActions() {
    // 1. Verificar tareas antiguas sin progreso
    await this.checkStaleTasks();
    
    // 2. Verificar si hay commits pendientes
    await this.checkPendingCommits();
    
    // 3. Verificar salud del sistema
    await this.checkSystemHealth();
  }

  /**
   * Verificar tareas antiguas
   */
  async checkStaleTasks() {
    try {
      const taskBoardPath = path.join(ROOT, '.agent/workspace/coordination/TASK_BOARD.md');
      
      if (!fs.existsSync(taskBoardPath)) return;
      
      const content = fs.readFileSync(taskBoardPath, 'utf8');
      const stats = fs.statSync(taskBoardPath);
      const lastModified = stats.mtimeMs;
      const now = Date.now();
      
      // Si TASK_BOARD no se modificó en 24h
      if (now - lastModified > this.config.thresholds.taskAgeForReminder) {
        const suggestion = {
          type: 'task_reminder',
          priority: 'medium',
          message: 'No hay actividad en TASK_BOARD en las últimas 24h. ¿Todo bien?',
          actions: [
            { label: 'Ver tareas pendientes', type: 'view' },
            { label: 'Sincronizar con Notion', type: 'action' }
          ]
        };
        
        await this.sendProactiveSuggestion(suggestion);
      }
    } catch (error) {
      // Ignorar
    }
  }

  /**
   * Verificar commits pendientes
   */
  async checkPendingCommits() {
    const gitChanges = await this.detectGitChanges();
    
    if (gitChanges.length > 10) {
      const suggestion = {
        type: 'large_changes_warning',
        priority: 'medium',
        message: `Tienes ${gitChanges.length} archivos modificados. Considera hacer commits más pequeños.`,
        actions: [
          { label: 'Ver archivos', type: 'view' },
          { label: 'Hacer commit ahora', type: 'command' }
        ]
      };
      
      await this.sendProactiveSuggestion(suggestion);
    }
  }

  /**
   * Verificar salud del sistema
   */
  async checkSystemHealth() {
    // Verificar uso de memoria
    const memUsage = process.memoryUsage();
    const memLimit = parseInt(this.config.AURORA_MEMORY_LIMIT || '500') * 1024 * 1024;
    
    if (memUsage.heapUsed > memLimit * 0.8) {
      const suggestion = {
        type: 'memory_warning',
        priority: 'high',
        message: `Uso de memoria alto: ${(memUsage.heapUsed / 1024 / 1024).toFixed(0)}MB / ${memLimit / 1024 / 1024}MB`,
        actions: [
          { label: 'Liberar memoria', type: 'action' },
          { label: 'Ver detalles', type: 'view' }
        ]
      };
      
      await this.sendProactiveSuggestion(suggestion);
    }
  }

  /**
   * Enviar sugerencia proactiva
   */
  async sendProactiveSuggestion(suggestion) {
    this.proactiveActions.push({
      ...suggestion,
      timestamp: Date.now()
    });
    
    // Emitir evento para que otros componentes puedan reaccionar
    this.emit('kairos:suggestion', suggestion);
    
    // Si las notificaciones están habilitadas, mostrar en consola
    if (this.config.enableNotifications && this.config.briefMode) {
      console.log(`\n💡 KAIROS: ${suggestion.message}`);
    } else if (this.config.enableNotifications) {
      console.log('\n' + '='.repeat(60));
      console.log('💡 SUGERENCIA PROACTIVA DE KAIROS');
      console.log('='.repeat(60));
      console.log(`Prioridad: ${suggestion.priority}`);
      console.log(`Mensaje: ${suggestion.message}`);
      
      if (suggestion.actions && suggestion.actions.length > 0) {
        console.log('\nAcciones sugeridas:');
        suggestion.actions.forEach((action, i) => {
          console.log(`  ${i + 1}. ${action.label}`);
        });
      }
      
      console.log('='.repeat(60) + '\n');
    }
  }

  /**
   * Actualizar log diario
   */
  async updateDailyLog(entry) {
    this.dailyLog.push(entry);
  }

  /**
   * Guardar log diario
   */
  async saveDailyLog() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(KAIROS_LOG_DIR, `daily-${today}.json`);
      
      fs.writeFileSync(logFile, JSON.stringify(this.dailyLog, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving daily log:', error.message);
    }
  }

  /**
   * Cargar estado previo
   */
  async loadState() {
    try {
      if (fs.existsSync(KAIROS_STATE_FILE)) {
        const state = JSON.parse(fs.readFileSync(KAIROS_STATE_FILE, 'utf8'));
        this.lastTick = state.lastTick;
        this.dailyLog = state.dailyLog || [];
      }
    } catch (error) {
      // Ignorar si no existe
    }
  }

  /**
   * Guardar estado
   */
  async saveState() {
    try {
      await this.ensureDirectories();
      
      const state = {
        lastTick: this.lastTick,
        dailyLog: this.dailyLog,
        timestamp: Date.now()
      };
      
      fs.writeFileSync(KAIROS_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving state:', error.message);
    }
  }

  /**
   * Asegurar existencia de directorios
   */
  async ensureDirectories() {
    const dirs = [
      KAIROS_LOG_DIR,
      path.dirname(KAIROS_STATE_FILE)
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Walk directory recursivamente
   */
  async walkDirectory(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.walkDirectory(fullPath));
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorar errores de permisos
    }
    
    return files;
  }

  /**
   * Obtener estado actual
   */
  getStatus() {
    return {
      active: this.isActive,
      lastTick: this.lastTick,
      tickInterval: this.config.tickIntervalMs,
      proactiveActions: this.proactiveActions.length,
      contextChanges: this.contextChanges.length,
      dailyLogEntries: this.dailyLog.length
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let kairosInstance = null;

export function getKAIROS() {
  if (!kairosInstance) {
    kairosInstance = new AuroraKAIROS();
  }
  return kairosInstance;
}

export async function startKAIROS(options = {}) {
  const kairos = getKAIROS();
  await kairos.start(options);
  return kairos;
}

export async function stopKAIROS() {
  if (kairosInstance) {
    await kairosInstance.stop();
  }
}

// ============================================================================
// CLI MODE (si se ejecuta directamente)
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const kairos = getKAIROS();
  
  console.log('🧠 KAIROS - Always-On Assistant\n');
  
  // Manejar señales de interrupción
  process.on('SIGINT', async () => {
    await stopKAIROS();
    process.exit(0);
  });
  
  // Iniciar
  startKAIROS({
    enableNotifications: true,
    briefMode: false
  }).catch(console.error);
}
