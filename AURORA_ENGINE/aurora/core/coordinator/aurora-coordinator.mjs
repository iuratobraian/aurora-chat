#!/usr/bin/env node
/**
 * aurora-coordinator.mjs - Coordinator Mode (Multi-Agent Orchestration)
 * 
 * Patrón extraído de Claude Code leak:
 * - Orquesta múltiples worker agents en paralelo
 * - 4 fases: Research → Synthesis → Implementation → Verification
 * - Shared state via scratch directory
 * - Comunicación via XML messages entre workers
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md
 */

import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const SCRATCH_DIR = path.join(ROOT, '.aurora', 'coordinator', 'scratch');
const WORKER_LOGS_DIR = path.join(ROOT, '.aurora', 'coordinator', 'logs');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const COORDINATOR_CONFIG = {
  // Timeout por fase (en ms)
  phaseTimeouts: {
    research: 30 * 60 * 1000,      // 30 min
    synthesis: 15 * 60 * 1000,     // 15 min
    implementation: 60 * 60 * 1000, // 60 min
    verification: 20 * 60 * 1000    // 20 min
  },
  
  // Máximo de workers paralelos
  maxParallelWorkers: 5,
  
  // Reintentos por worker fallido
  maxRetries: 2,
  
  // Nivel de logging
  logLevel: 'info', // debug, info, warn, error
  
  // Usar workers reales (process) o mock (para testing)
  useRealWorkers: true
};

// ============================================================================
// COORDINATOR CLASS
// ============================================================================

export class AuroraCoordinator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = { ...COORDINATOR_CONFIG, ...options };
    this.workers = new Map();
    this.sharedState = new Map();
    this.currentPhase = null;
    this.task = null;
    this.results = {
      research: null,
      synthesis: null,
      implementation: null,
      verification: null
    };
  }

  /**
   * Ejecutar tarea coordinada
   */
  async execute(task) {
    console.log('\n🎯 COORDINATOR: Starting multi-agent orchestration\n');
    console.log(`Task: ${task.name || 'Unnamed task'}`);
    console.log(`Description: ${task.description || 'No description'}\n`);
    
    this.task = task;
    await this.ensureDirectories();
    
    try {
      // Phase 1: Research
      console.log('═══════════════════════════════════════════════════════');
      console.log('PHASE 1: RESEARCH');
      console.log('═══════════════════════════════════════════════════════\n');
      
      this.currentPhase = 'research';
      this.results.research = await this.parallelResearch(task);
      
      console.log(`\n✅ Research complete: ${this.results.research.findings?.length || 0} findings\n`);
      
      // Phase 2: Synthesis
      console.log('═══════════════════════════════════════════════════════');
      console.log('PHASE 2: SYNTHESIS');
      console.log('═══════════════════════════════════════════════════════\n');
      
      this.currentPhase = 'synthesis';
      this.results.synthesis = await this.synthesize(this.results.research);
      
      console.log(`\n✅ Synthesis complete: ${this.results.synthesis?.actions?.length || 0} actions planned\n`);
      
      // Phase 3: Implementation
      console.log('═══════════════════════════════════════════════════════');
      console.log('PHASE 3: IMPLEMENTATION');
      console.log('═══════════════════════════════════════════════════════\n');
      
      this.currentPhase = 'implementation';
      this.results.implementation = await this.parallelImplement(this.results.synthesis);
      
      console.log(`\n✅ Implementation complete: ${this.results.implementation?.completed?.length || 0} actions done\n`);
      
      // Phase 4: Verification
      console.log('═══════════════════════════════════════════════════════');
      console.log('PHASE 4: VERIFICATION');
      console.log('═══════════════════════════════════════════════════════\n');
      
      this.currentPhase = 'verification';
      this.results.verification = await this.verify(this.results.implementation);
      
      console.log(`\n✅ Verification complete: ${this.results.verification?.passed ? 'PASSED' : 'FAILED'}\n`);
      
      // Final summary
      console.log('═══════════════════════════════════════════════════════');
      console.log('COORDINATOR: Task complete');
      console.log('═══════════════════════════════════════════════════════\n');
      
      this.emit('coordinator:complete', this.results);
      
      return {
        success: true,
        results: this.results
      };
      
    } catch (error) {
      console.error('\n❌ COORDINATOR: Task failed:', error.message);
      this.emit('coordinator:error', { error, phase: this.currentPhase });
      
      return {
        success: false,
        error: error.message,
        phase: this.currentPhase,
        partialResults: this.results
      };
    } finally {
      this.currentPhase = null;
    }
  }

  /**
   * Phase 1: Parallel Research
   */
  async parallelResearch(task) {
    console.log('📚 Spawning research workers...\n');
    
    // Definir workers de research
    const workerRoles = [
      { id: 'codebase-explorer', focus: 'Explore codebase structure and existing patterns' },
      { id: 'pattern-matcher', focus: 'Identify design patterns and best practices' },
      { id: 'dependency-analyzer', focus: 'Analyze dependencies and imports' },
      { id: 'error-detector', focus: 'Find existing errors and potential issues' }
    ];
    
    // Spawn workers en paralelo
    const workerPromises = workerRoles.map(role => 
      this.spawnWorker({
        role: role.id,
        task: task,
        focus: role.focus,
        phase: 'research'
      })
    );
    
    // Esperar todos los workers
    const results = await Promise.allSettled(workerPromises);
    
    // Merge findings
    const allFindings = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        console.log(`✅ Worker ${workerRoles[index].id} completed`);
        allFindings.push(...(result.value.findings || []));
      } else {
        console.log(`❌ Worker ${workerRoles[index].id} failed: ${result.reason}`);
      }
    });
    
    return {
      findings: allFindings,
      workerCount: workerRoles.length,
      successfulWorkers: results.filter(r => r.status === 'fulfilled').length
    };
  }

  /**
   * Phase 2: Synthesis
   */
  async synthesize(researchResults) {
    console.log('🔮 Synthesizing research findings into action plan...\n');
    
    // Analizar findings
    const findings = researchResults.findings || [];
    
    // Agrupar por categoría
    const categories = {
      architecture: [],
      performance: [],
      security: [],
      bugs: [],
      improvements: []
    };
    
    for (const finding of findings) {
      const category = finding.category || 'improvements';
      if (categories[category]) {
        categories[category].push(finding);
      }
    }
    
    // Crear plan de acción
    const actions = [];
    
    // Prioridad 1: Bugs críticos
    for (const bug of categories.bugs) {
      if (bug.severity === 'critical') {
        actions.push({
          type: 'fix',
          priority: 1,
          title: `Fix critical bug: ${bug.title}`,
          description: bug.description,
          files: bug.files || []
        });
      }
    }
    
    // Prioridad 2: Security issues
    for (const security of categories.security) {
      actions.push({
        type: 'secure',
        priority: 2,
        title: `Address security: ${security.title}`,
        description: security.description,
        files: security.files || []
      });
    }
    
    // Prioridad 3: Performance improvements
    for (const perf of categories.performance) {
      actions.push({
        type: 'optimize',
        priority: 3,
        title: `Optimize: ${perf.title}`,
        description: perf.description,
        files: perf.files || []
      });
    }
    
    // Prioridad 4: Architecture improvements
    for (const arch of categories.architecture) {
      actions.push({
        type: 'refactor',
        priority: 4,
        title: `Refactor: ${arch.title}`,
        description: arch.description,
        files: arch.files || []
      });
    }
    
    // Prioridad 5: General improvements
    for (const imp of categories.improvements) {
      actions.push({
        type: 'improve',
        priority: 5,
        title: `Improve: ${imp.title}`,
        description: imp.description,
        files: imp.files || []
      });
    }
    
    // Ordenar por prioridad
    actions.sort((a, b) => a.priority - b.priority);
    
    console.log(`📋 Action plan created: ${actions.length} actions\n`);
    
    // Guardar plan en scratch
    await this.writeToScratch('synthesis-plan.json', {
      actions,
      categories: Object.fromEntries(
        Object.entries(categories).map(([k, v]) => [k, v.length])
      ),
      timestamp: Date.now()
    });
    
    return {
      actions,
      categories,
      totalActions: actions.length
    };
  }

  /**
   * Phase 3: Parallel Implementation
   */
  async parallelImplement(synthesisResults) {
    console.log('🔨 Spawning implementation workers...\n');
    
    const actions = synthesisResults.actions || [];
    const completed = [];
    const failed = [];
    const skipped = [];
    
    // Procesar acciones en batches
    const batchSize = this.config.maxParallelWorkers;
    
    for (let i = 0; i < actions.length; i += batchSize) {
      const batch = actions.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} actions)\n`);
      
      // Spawn workers para este batch
      const workerPromises = batch.map(action =>
        this.spawnWorker({
          role: 'implementer',
          task: { ...this.task, action },
          focus: `Implement: ${action.title}`,
          phase: 'implementation'
        })
      );
      
      // Esperar resultados del batch
      const results = await Promise.allSettled(workerPromises);
      
      // Procesar resultados
      results.forEach((result, index) => {
        const action = batch[index];
        
        if (result.status === 'fulfilled' && result.value?.success) {
          console.log(`✅ Completed: ${action.title}`);
          completed.push({
            ...action,
            result: result.value
          });
        } else {
          console.log(`❌ Failed: ${action.title} - ${result.reason || 'Unknown error'}`);
          failed.push({
            ...action,
            error: result.reason || 'Unknown error'
          });
        }
      });
    }
    
    console.log(`\n📊 Implementation summary:`);
    console.log(`   Completed: ${completed.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log(`   Skipped: ${skipped.length}\n`);
    
    // Guardar resultados en scratch
    await this.writeToScratch('implementation-results.json', {
      completed,
      failed,
      skipped,
      timestamp: Date.now()
    });
    
    return {
      completed,
      failed,
      skipped,
      total: actions.length
    };
  }

  /**
   * Phase 4: Verification
   */
  async verify(implementationResults) {
    console.log('🔍 Spawning verification workers...\n');
    
    const completed = implementationResults.completed || [];
    
    if (completed.length === 0) {
      console.log('⚠️  No completed actions to verify\n');
      return { passed: true, verified: 0 };
    }
    
    // Spawn verification workers
    const workerRoles = [
      { id: 'lint-checker', focus: 'Run linting checks' },
      { id: 'test-runner', focus: 'Run tests' },
      { id: 'type-checker', focus: 'Run type checking' },
      { id: 'security-scanner', focus: 'Run security scans' }
    ];
    
    const workerPromises = workerRoles.map(role =>
      this.spawnWorker({
        role: role.id,
        task: { ...this.task, completedActions: completed },
        focus: role.focus,
        phase: 'verification'
      })
    );
    
    // Esperar resultados
    const results = await Promise.allSettled(workerPromises);
    
    // Analizar resultados
    const allPassed = results.every(r => 
      r.status === 'fulfilled' && r.value?.passed
    );
    
    let verifiedCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${workerRoles[index].id}: ${result.value?.passed ? 'PASSED' : 'FAILED'}`);
        if (result.value?.passed) verifiedCount++;
      } else {
        console.log(`❌ ${workerRoles[index].id}: FAILED - ${result.reason}`);
      }
    });
    
    console.log(`\n📊 Verification: ${verifiedCount}/${workerRoles.length} checks passed\n`);
    
    // Guardar resultados en scratch
    await this.writeToScratch('verification-results.json', {
      allPassed,
      verifiedCount,
      totalChecks: workerRoles.length,
      results: results.map((r, i) => ({
        worker: workerRoles[i].id,
        passed: r.status === 'fulfilled' && r.value?.passed,
        error: r.reason
      })),
      timestamp: Date.now()
    });
    
    return {
      passed: allPassed,
      verified: verifiedCount,
      total: workerRoles.length
    };
  }

  /**
   * Spawn worker (process o mock)
   */
  async spawnWorker(config) {
    const workerId = `${config.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`   🤖 Spawning worker: ${workerId}`);
    console.log(`      Role: ${config.role}`);
    console.log(`      Focus: ${config.focus}`);
    console.log(`      Phase: ${config.phase}\n`);
    
    if (!this.config.useRealWorkers) {
      // Mock worker para testing
      return await this.mockWorker(config);
    }
    
    // Worker real como proceso separado
    return await this.realWorker(workerId, config);
  }

  /**
   * Mock worker (para testing/desarrollo)
   */
  async mockWorker(config) {
    // Simular trabajo del worker
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Retornar resultado mock
    return {
      workerId: config.role,
      success: true,
      findings: config.phase === 'research' ? [
        {
          title: `Mock finding from ${config.role}`,
          description: 'This is a mock finding for development',
          category: 'improvements',
          severity: 'low'
        }
      ] : [],
      result: config.phase === 'implementation' ? {
        changes: ['Mock change 1', 'Mock change 2']
      } : null,
      passed: config.phase === 'verification'
    };
  }

  /**
   * Real worker (proceso separado)
   */
  async realWorker(workerId, config) {
    return new Promise((resolve, reject) => {
      const timeout = this.config.phaseTimeouts[config.phase] || 300000;
      
      // Spawn proceso worker
      const worker = spawn('node', [
        path.join(__dirname, 'worker.mjs'),
        JSON.stringify({
          workerId,
          ...config
        })
      ], {
        cwd: ROOT,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      worker.stdout.on('data', (data) => {
        output += data.toString();
        if (this.config.logLevel === 'debug') {
          console.log(`   [${workerId}]: ${data.toString().trim()}`);
        }
      });
      
      worker.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`   [${workerId}] ERROR: ${data.toString().trim()}`);
      });
      
      // Timeout
      const timer = setTimeout(() => {
        worker.kill('SIGTERM');
        reject(new Error(`Worker ${workerId} timed out after ${timeout}ms`));
      }, timeout);
      
      worker.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            resolve({
              workerId,
              success: true,
              rawOutput: output
            });
          }
        } else {
          reject(new Error(`Worker ${workerId} exited with code ${code}`));
        }
      });
      
      // Guardar worker en tracking
      this.workers.set(workerId, worker);
    });
  }

  /**
   * Escribir en scratch directory
   */
  async writeToScratch(filename, data) {
    try {
      await this.ensureDirectories();
      const filePath = path.join(SCRATCH_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing to scratch:', error.message);
    }
  }

  /**
   * Asegurar directorios existen
   */
  async ensureDirectories() {
    const dirs = [
      SCRATCH_DIR,
      WORKER_LOGS_DIR
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Obtener estado del Coordinator
   */
  getStatus() {
    return {
      currentPhase: this.currentPhase,
      activeWorkers: this.workers.size,
      task: this.task?.name || null,
      results: {
        research: !!this.results.research,
        synthesis: !!this.results.synthesis,
        implementation: !!this.results.implementation,
        verification: !!this.results.verification
      }
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let coordinatorInstance = null;

export function getCoordinator() {
  if (!coordinatorInstance) {
    coordinatorInstance = new AuroraCoordinator();
  }
  return coordinatorInstance;
}

export async function executeTask(task, options = {}) {
  const coordinator = getCoordinator();
  
  if (options.useRealWorkers !== undefined) {
    coordinator.config.useRealWorkers = options.useRealWorkers;
  }
  
  return await coordinator.execute(task);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const taskName = args[0] || 'demo-task';
  
  console.log('🎯 AURORA COORDINATOR - Multi-Agent Orchestration\n');
  
  const task = {
    name: taskName,
    description: `Demo task: ${taskName}`,
    files: args.slice(1)
  };
  
  executeTask(task, { useRealWorkers: false })
    .then(result => {
      console.log('\n✅ Coordinator task complete');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Coordinator task failed:', error.message);
      process.exit(1);
    });
}
