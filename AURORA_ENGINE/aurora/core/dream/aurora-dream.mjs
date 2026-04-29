#!/usr/bin/env node
/**
 * aurora-dream.mjs - Dream Memory Consolidation System
 * 
 * Patrón extraído de Claude Code leak:
 * - Consolidación de memoria en background
 * - Trigger: 24h + 5 sesiones desde último dream
 * - 4 fases: Orient → Gather → Consolidate → Prune
 * - Mantiene MEMORY.md bajo 200 líneas / ~25KB
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MEMORY_DIR = path.join(ROOT, '.aurora', 'memory');
const MEMORY_INDEX_FILE = path.join(MEMORY_DIR, 'MEMORY.md');
const DREAM_STATE_FILE = path.join(MEMORY_DIR, 'dream-state.json');
const SESSIONS_DIR = path.join(MEMORY_DIR, 'sessions');
const DAILY_LOGS_DIR = path.join(MEMORY_DIR, 'daily-logs');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const DREAM_CONFIG = {
  // Time gate: 24 horas entre dreams
  timeGateMs: 24 * 60 * 60 * 1000,
  
  // Session gate: mínimo 5 sesiones desde último dream
  sessionGateCount: 5,
  
  // Lock gate: prevenir dreams concurrentes
  preventConcurrentDreams: true,
  
  // Límite de MEMORY.md
  maxMemoryLines: 200,
  maxMemorySizeKB: 25,
  
  // Retención de sesiones
  keepRecentSessions: 10,
  
  // Directorios a monitorear para contexto
  contextPaths: [
    '.agent/workspace/coordination/',
    'AGENT_LOG.md',
    'TASK_BOARD.md'
  ]
};

// ============================================================================
// DREAM CLASS
// ============================================================================

export class AuroraDream {
  constructor(memoryBackend = null) {
    this.memory = memoryBackend;
    this.lastDream = null;
    this.sessionCount = 0;
    this.isConsolidating = false;
    this.config = DREAM_CONFIG;
  }

  /**
   * Verificar si debe activarse el dream
   */
  async shouldDream() {
    // Cargar estado
    await this.loadState();
    
    // Gate 1: Tiempo (24 horas)
    const now = Date.now();
    const timeGate = !this.lastDream || (now - this.lastDream >= this.config.timeGateMs);
    
    // Gate 2: Sesiones (mínimo 5)
    const sessionGate = this.sessionCount >= this.config.sessionGateCount;
    
    // Gate 3: Lock (prevenir concurrente)
    const lockGate = !this.isConsolidating || !this.config.preventConcurrentDreams;
    
    const shouldDream = timeGate && sessionGate && lockGate;
    
    if (shouldDream) {
      console.log('🌙 DREAM: All gates passed');
      console.log(`   - Time gate: ${timeGate ? '✅' : '❌'} (${this.lastDream ? Math.round((now - this.lastDream) / 3600000) + 'h' : 'never'})`);
      console.log(`   - Session gate: ${sessionGate ? '✅' : '❌'} (${this.sessionCount}/${this.config.sessionGateCount})`);
      console.log(`   - Lock gate: ${lockGate ? '✅' : '❌'}`);
    }
    
    return shouldDream;
  }

  /**
   * Ejecutar consolidación Dream
   */
  async consolidate() {
    console.log('\n🌙 DREAM: Starting memory consolidation...\n');
    
    this.isConsolidating = true;
    const dreamStart = Date.now();
    
    try {
      // Fase 1: Orient
      console.log('📖 Phase 1: ORIENT');
      const memoryIndex = await this.orient();
      console.log(`   Memory index loaded: ${memoryIndex.topics || 0} topics\n`);
      
      // Fase 2: Gather Recent Signal
      console.log('📥 Phase 2: GATHER RECENT SIGNAL');
      const signal = await this.gatherRecentSignal();
      console.log(`   Sessions gathered: ${signal.sessions.length}`);
      console.log(`   Daily logs gathered: ${signal.dailyLogs.length}\n`);
      
      // Fase 3: Consolidate
      console.log('🔗 Phase 3: CONSOLIDATE');
      const consolidationResult = await this.consolidateMemories(signal);
      console.log(`   Memories consolidated: ${consolidationResult.consolidated}`);
      console.log(`   Memories updated: ${consolidationResult.updated}`);
      console.log(`   Contradictions resolved: ${consolidationResult.resolved}\n`);
      
      // Fase 4: Prune and Index
      console.log('✂️  Phase 4: PRUNE AND INDEX');
      const pruneResult = await this.pruneAndIndex();
      console.log(`   Memory lines: ${pruneResult.lines}/${this.config.maxMemoryLines}`);
      console.log(`   Memory size: ${pruneResult.sizeKB}/${this.config.maxMemorySizeKB}KB\n`);
      
      // Actualizar estado
      this.lastDream = dreamStart;
      this.sessionCount = 0;
      await this.saveState();
      
      const duration = ((Date.now() - dreamStart) / 1000).toFixed(2);
      console.log(`✅ DREAM: Consolidation complete (${duration}s)\n`);
      
      return {
        success: true,
        duration,
        phases: {
          orient: memoryIndex,
          gather: signal,
          consolidate: consolidationResult,
          prune: pruneResult
        }
      };
      
    } catch (error) {
      console.error('❌ DREAM: Consolidation failed:', error.message);
      this.isConsolidating = false;
      throw error;
    } finally {
      this.isConsolidating = false;
    }
  }

  /**
   * Fase 1: Orient - Leer índice de memoria
   */
  async orient() {
    try {
      if (!fs.existsSync(MEMORY_INDEX_FILE)) {
        // Crear MEMORY.md vacío
        await this.ensureDirectories();
        fs.writeFileSync(MEMORY_INDEX_FILE, '# Aurora Memory Index\n\n*Last updated: ' + new Date().toISOString() + '*\n', 'utf8');
        return { topics: 0, created: true };
      }
      
      const content = fs.readFileSync(MEMORY_INDEX_FILE, 'utf8');
      const topics = (content.match(/^## /gm) || []).length;
      
      return { topics, created: false };
      
    } catch (error) {
      console.error('Error in orient phase:', error.message);
      return { topics: 0, error: error.message };
    }
  }

  /**
   * Fase 2: Gather Recent Signal
   */
  async gatherRecentSignal() {
    const result = {
      sessions: [],
      dailyLogs: [],
      contextChanges: []
    };
    
    try {
      // 1. Obtener sesiones recientes
      if (fs.existsSync(SESSIONS_DIR)) {
        const sessionFiles = fs.readdirSync(SESSIONS_DIR)
          .filter(f => f.endsWith('.json'))
          .sort()
          .slice(-this.config.keepRecentSessions);
        
        for (const file of sessionFiles) {
          const filePath = path.join(SESSIONS_DIR, file);
          const session = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          result.sessions.push(session);
        }
      }
      
      // 2. Obtener daily logs recientes
      if (fs.existsSync(DAILY_LOGS_DIR)) {
        const logFiles = fs.readdirSync(DAILY_LOGS_DIR)
          .filter(f => f.startsWith('daily-') && f.endsWith('.json'))
          .sort()
          .slice(-7); // Últimos 7 días
        
        for (const file of logFiles) {
          const filePath = path.join(DAILY_LOGS_DIR, file);
          const log = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          result.dailyLogs.push(log);
        }
      }
      
      // 3. Obtener cambios de contexto
      for (const contextPath of this.config.contextPaths) {
        const fullPath = path.join(ROOT, contextPath);
        
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          const modifiedTime = stats.mtimeMs;
          const now = Date.now();
          
          // Si fue modificado en las últimas 48h
          if (now - modifiedTime < 48 * 60 * 60 * 1000) {
            result.contextChanges.push({
              path: contextPath,
              modified: modifiedTime
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error gathering signal:', error.message);
    }
    
    return result;
  }

  /**
   * Fase 3: Consolidate Memories
   */
  async consolidateMemories(signal) {
    const result = {
      consolidated: 0,
      updated: 0,
      resolved: 0
    };
    
    try {
      let memoryContent = fs.existsSync(MEMORY_INDEX_FILE) 
        ? fs.readFileSync(MEMORY_INDEX_FILE, 'utf8')
        : '# Aurora Memory Index\n\n';
      
      // Procesar sesiones
      for (const session of signal.sessions) {
        if (session.learnings && session.learnings.length > 0) {
          for (const learning of session.learnings) {
            // Verificar si ya existe en memoria
            const exists = memoryContent.includes(learning.title || learning);
            
            if (!exists) {
              // Agregar nuevo learning
              memoryContent += `\n## ${learning.title || 'New Learning'}\n\n`;
              memoryContent += `- ${learning.description || learning}\n`;
              memoryContent += `*Added: ${new Date().toISOString()}*\n`;
              result.consolidated++;
            } else {
              // Actualizar existing
              result.updated++;
            }
          }
        }
      }
      
      // Procesar daily logs
      for (const log of signal.dailyLogs) {
        if (log.keyInsights) {
          for (const insight of log.keyInsights) {
            const exists = memoryContent.includes(insight);
            
            if (!exists) {
              memoryContent += `\n### Insight\n\n${insight}\n`;
              result.consolidated++;
            }
          }
        }
      }
      
      // Resolver contradicciones (básico - detectar duplicados)
      const lines = memoryContent.split('\n');
      const uniqueLines = [...new Set(lines)];
      
      if (uniqueLines.length < lines.length) {
        memoryContent = uniqueLines.join('\n');
        result.resolved = lines.length - uniqueLines.length;
      }
      
      // Guardar memoria consolidada
      fs.writeFileSync(MEMORY_INDEX_FILE, memoryContent, 'utf8');
      
    } catch (error) {
      console.error('Error consolidating memories:', error.message);
    }
    
    return result;
  }

  /**
   * Fase 4: Prune and Index
   */
  async pruneAndIndex() {
    const result = {
      lines: 0,
      sizeKB: 0
    };
    
    try {
      let memoryContent = fs.readFileSync(MEMORY_INDEX_FILE, 'utf8');
      let lines = memoryContent.split('\n');
      
      // Si excede el límite, podar
      if (lines.length > this.config.maxMemoryLines) {
        console.log(`   Pruning: ${lines.length} → ${this.config.maxMemoryLines} lines`);
        
        // Mantener header y temas más recientes
        const header = lines.slice(0, 10); // Header
        const recentTopics = lines.slice(-this.config.maxMemoryLines + 10); // Recientes
        
        lines = [...header, '\n', ...recentTopics];
        
        memoryContent = lines.join('\n');
        fs.writeFileSync(MEMORY_INDEX_FILE, memoryContent, 'utf8');
      }
      
      // Calcular tamaño
      const sizeBytes = Buffer.byteLength(memoryContent, 'utf8');
      const sizeKB = (sizeBytes / 1024).toFixed(2);
      
      result.lines = lines.length;
      result.sizeKB = parseFloat(sizeKB);
      
      // Actualizar timestamp
      const updateLine = `\n*Last updated: ${new Date().toISOString()}*`;
      
      if (!memoryContent.includes(updateLine)) {
        memoryContent = memoryContent.trim() + '\n\n' + updateLine + '\n';
        fs.writeFileSync(MEMORY_INDEX_FILE, memoryContent, 'utf8');
      }
      
    } catch (error) {
      console.error('Error pruning memory:', error.message);
    }
    
    return result;
  }

  /**
   * Cargar estado
   */
  async loadState() {
    try {
      if (fs.existsSync(DREAM_STATE_FILE)) {
        const state = JSON.parse(fs.readFileSync(DREAM_STATE_FILE, 'utf8'));
        this.lastDream = state.lastDream;
        this.sessionCount = state.sessionCount || 0;
      }
    } catch (error) {
      // Ignorar
    }
  }

  /**
   * Guardar estado
   */
  async saveState() {
    try {
      await this.ensureDirectories();
      
      const state = {
        lastDream: this.lastDream,
        sessionCount: this.sessionCount,
        lastUpdated: Date.now()
      };
      
      fs.writeFileSync(DREAM_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving dream state:', error.message);
    }
  }

  /**
   * Asegurar directorios
   */
  async ensureDirectories() {
    const dirs = [
      MEMORY_DIR,
      SESSIONS_DIR,
      DAILY_LOGS_DIR
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Incrementar contador de sesiones
   */
  async incrementSessionCount() {
    await this.loadState();
    this.sessionCount++;
    await this.saveState();
  }

  /**
   * Obtener estado del Dream
   */
  getStatus() {
    return {
      lastDream: this.lastDream,
      sessionCount: this.sessionCount,
      isConsolidating: this.isConsolidating,
      nextDreamAvailable: this.lastDream 
        ? new Date(this.lastDream + this.config.timeGateMs).toISOString()
        : 'now'
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let dreamInstance = null;

export function getDream() {
  if (!dreamInstance) {
    dreamInstance = new AuroraDream();
  }
  return dreamInstance;
}

export async function triggerDream() {
  const dream = getDream();
  
  const shouldDream = await dream.shouldDream();
  
  if (shouldDream) {
    return await dream.consolidate();
  } else {
    console.log('🌙 DREAM: Not yet time for consolidation');
    console.log('   Run "npm run dream:force" to trigger manually');
    return { success: false, reason: 'gates_not_passed', status: dream.getStatus() };
  }
}

export async function forceDream() {
  const dream = getDream();
  dream.isConsolidating = false; // Override lock
  return await dream.consolidate();
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🌙 AURORA DREAM - Memory Consolidation System\n');
  
  if (command === 'force') {
    console.log('⚠️  Forcing dream consolidation...\n');
    forceDream()
      .then(result => {
        console.log('✅ Dream complete');
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Dream failed:', error.message);
        process.exit(1);
      });
  } else {
    console.log('Usage: node aurora-dream.mjs [force]\n');
    
    triggerDream()
      .then(result => {
        if (result.success) {
          console.log('✅ Dream consolidation successful');
        } else {
          console.log('ℹ️  Dream not triggered:', result.reason);
        }
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Dream failed:', error.message);
        process.exit(1);
      });
  }
}
