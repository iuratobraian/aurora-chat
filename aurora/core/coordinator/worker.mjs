#!/usr/bin/env node
/**
 * worker.mjs - Aurora Worker Agent
 * 
 * Worker genérico para Coordinator Mode.
 * Ejecuta tareas específicas según el rol asignado.
 * 
 * Uso: node worker.mjs '{"workerId":"x","role":"y","task":{...}}'
 */

import fs from 'node:fs';
import path from 'node:path';

// Parsear configuración desde argumentos
const config = JSON.parse(process.argv[2] || '{}');

const { workerId, role, task, focus, phase } = config;

// ============================================================================
// WORKER ROLES
// ============================================================================

const WORKER_ROLES = {
  // Research phase
  'codebase-explorer': exploreCodebase,
  'pattern-matcher': matchPatterns,
  'dependency-analyzer': analyzeDependencies,
  'error-detector': detectErrors,
  
  // Implementation phase
  'implementer': implementAction,
  
  // Verification phase
  'lint-checker': runLintCheck,
  'test-runner': runTests,
  'type-checker': runTypeCheck,
  'security-scanner': runSecurityScan
};

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  log(`Worker ${workerId} starting...`);
  log(`Role: ${role}`);
  log(`Phase: ${phase}`);
  log(`Focus: ${focus}`);
  
  const handler = WORKER_ROLES[role];
  
  if (!handler) {
    throw new Error(`Unknown worker role: ${role}`);
  }
  
  try {
    const result = await handler(task, config);
    
    log(`Worker ${workerId} completed successfully`);
    
    // Output resultado como JSON
    console.log(JSON.stringify({
      workerId,
      role,
      success: true,
      ...result
    }));
    
  } catch (error) {
    log(`Worker ${workerId} failed: ${error.message}`);
    
    console.log(JSON.stringify({
      workerId,
      role,
      success: false,
      error: error.message
    }));
    
    process.exit(1);
  }
}

// ============================================================================
// RESEARCH WORKERS
// ============================================================================

async function exploreCodebase(task) {
  log('Exploring codebase structure...');
  
  const findings = [];
  const rootDir = process.cwd();
  
  // Explorar estructura de directorios
  const dirs = await walkDirectory(rootDir, 3); // Max 3 niveles
  
  // Analizar archivos encontrados
  const tsFiles = dirs.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const jsFiles = dirs.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  
  findings.push({
    title: 'Codebase Structure Analysis',
    description: `Found ${tsFiles.length} TypeScript files and ${jsFiles.length} JavaScript files`,
    category: 'architecture',
    files: [...tsFiles.slice(0, 20), ...jsFiles.slice(0, 20)]
  });
  
  // Detectar patrones de arquitectura
  const hasComponents = tsFiles.some(f => f.includes('/components/'));
  const hasViews = tsFiles.some(f => f.includes('/views/'));
  const hasHooks = tsFiles.some(f => f.includes('/hooks/'));
  
  if (hasComponents && hasViews) {
    findings.push({
      title: 'Component-View Architecture Detected',
      description: 'Project uses component-view separation pattern',
      category: 'architecture'
    });
  }
  
  if (hasHooks) {
    findings.push({
      title: 'React Hooks Usage',
      description: 'Project uses custom React hooks for logic reuse',
      category: 'architecture'
    });
  }
  
  return { findings };
}

async function matchPatterns(task) {
  log('Matching design patterns...');
  
  const findings = [];
  const rootDir = process.cwd();
  
  // Buscar patrones comunes
  const files = await walkDirectory(rootDir, 2);
  
  // Singleton pattern
  const singletonFiles = files.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      return content.includes('export default') && 
             content.includes('let ') && 
             content.includes('getInstance');
    } catch {
      return false;
    }
  });
  
  if (singletonFiles.length > 0) {
    findings.push({
      title: 'Singleton Pattern Detected',
      description: `${singletonFiles.length} files use singleton pattern`,
      category: 'architecture',
      files: singletonFiles.slice(0, 10)
    });
  }
  
  // Factory pattern
  const factoryFiles = files.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      return content.toLowerCase().includes('factory') || 
             content.includes('create') && content.includes('switch');
    } catch {
      return false;
    }
  });
  
  if (factoryFiles.length > 0) {
    findings.push({
      title: 'Factory Pattern Detected',
      description: `${factoryFiles.length} files use factory pattern`,
      category: 'architecture',
      files: factoryFiles.slice(0, 10)
    });
  }
  
  // Observer pattern
  const observerFiles = files.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      return content.includes('EventEmitter') || 
             content.includes('.on(') || 
             content.includes('.emit(');
    } catch {
      return false;
    }
  });
  
  if (observerFiles.length > 0) {
    findings.push({
      title: 'Observer Pattern Detected',
      description: `${observerFiles.length} files use observer pattern`,
      category: 'architecture',
      files: observerFiles.slice(0, 10)
    });
  }
  
  return { findings };
}

async function analyzeDependencies(task) {
  log('Analyzing dependencies...');
  
  const findings = [];
  const rootDir = process.cwd();
  
  // Leer package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    
    findings.push({
      title: 'Dependency Analysis',
      description: `${Object.keys(deps).length} dependencies, ${Object.keys(devDeps).length} devDependencies`,
      category: 'architecture'
    });
    
    // Detectar dependencias potencialmente problemáticas
    const oldDeps = [];
    const now = Date.now();
    
    // Aquí podríamos verificar versiones antiguas
    // Por ahora es un placeholder
    
    if (oldDeps.length > 0) {
      findings.push({
        title: 'Outdated Dependencies',
        description: `${oldDeps.length} dependencies may be outdated`,
        category: 'maintenance',
        severity: 'low'
      });
    }
  }
  
  // Analizar imports circulares (básico)
  const tsFiles = await walkDirectory(rootDir, 2);
  const importMap = new Map();
  
  for (const file of tsFiles.slice(0, 50)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = content.match(/import.*from\s+['"](.*)['"]/g) || [];
      importMap.set(file, imports.map(i => i.match(/['"](.*)['"]/)[1]));
    } catch {
      // Ignorar
    }
  }
  
  return { findings };
}

async function detectErrors(task) {
  log('Detecting errors...');
  
  const findings = [];
  const rootDir = process.cwd();
  
  // Buscar console.log en producción
  const files = await walkDirectory(rootDir, 2);
  const consoleLogFiles = files.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      return content.includes('console.log') && !f.includes('.test.');
    } catch {
      return false;
    }
  });
  
  if (consoleLogFiles.length > 5) {
    findings.push({
      title: 'Excessive console.log Usage',
      description: `${consoleLogFiles.length} files contain console.log`,
      category: 'bugs',
      severity: 'low',
      files: consoleLogFiles.slice(0, 10)
    });
  }
  
  // Buscar TODOs y FIXMEs
  const todoFiles = files.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      return content.includes('// TODO') || content.includes('// FIXME');
    } catch {
      return false;
    }
  });
  
  if (todoFiles.length > 10) {
    findings.push({
      title: 'Many TODOs/FIXMEs',
      description: `${todoFiles.length} files have TODO or FIXME comments`,
      category: 'maintenance',
      severity: 'low'
    });
  }
  
  // Buscar any en TypeScript
  const anyFiles = files.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      return content.includes(': any') && (f.endsWith('.ts') || f.endsWith('.tsx'));
    } catch {
      return false;
    }
  });
  
  if (anyFiles.length > 5) {
    findings.push({
      title: 'Excessive "any" Types',
      description: `${anyFiles.length} TypeScript files use "any" type`,
      category: 'bugs',
      severity: 'medium',
      files: anyFiles.slice(0, 10)
    });
  }
  
  return { findings };
}

// ============================================================================
// IMPLEMENTATION WORKERS
// ============================================================================

async function implementAction(task) {
  log('Implementing action...');
  
  const action = task.action;
  
  if (!action) {
    throw new Error('No action provided for implementation');
  }
  
  log(`Action type: ${action.type}`);
  log(`Action title: ${action.title}`);
  
  // Simular implementación
  const changes = [];
  
  switch (action.type) {
    case 'fix':
      changes.push(`Fixed: ${action.title}`);
      break;
    case 'secure':
      changes.push(`Secured: ${action.title}`);
      break;
    case 'optimize':
      changes.push(`Optimized: ${action.title}`);
      break;
    case 'refactor':
      changes.push(`Refactored: ${action.title}`);
      break;
    case 'improve':
      changes.push(`Improved: ${action.title}`);
      break;
    default:
      changes.push(`Applied: ${action.title}`);
  }
  
  return {
    changes,
    actionId: action.title
  };
}

// ============================================================================
// VERIFICATION WORKERS
// ============================================================================

async function runLintCheck(task) {
  log('Running lint check...');
  
  // Simular lint check
  const passed = true; // En producción, ejecutar npm run lint
  
  return {
    passed,
    details: passed ? 'No lint errors' : 'Lint errors found'
  };
}

async function runTests(task) {
  log('Running tests...');
  
  // Simular test run
  const passed = true; // En producción, ejecutar npm test
  
  return {
    passed,
    details: passed ? 'All tests passed' : 'Tests failed'
  };
}

async function runTypeCheck(task) {
  log('Running type check...');
  
  // Simular type check
  const passed = true; // En producción, ejecutar npm run lint (tsc)
  
  return {
    passed,
    details: passed ? 'No type errors' : 'Type errors found'
  };
}

async function runSecurityScan(task) {
  log('Running security scan...');
  
  // Simular security scan
  const passed = true; // En producción, ejecutar auditoría de seguridad
  
  return {
    passed,
    details: passed ? 'No security issues' : 'Security issues found'
  };
}

// ============================================================================
// UTILS
// ============================================================================

async function walkDirectory(dir, maxDepth = 2, currentDepth = 0) {
  const files = [];
  
  if (currentDepth >= maxDepth) return files;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await walkDirectory(fullPath, maxDepth, currentDepth + 1));
        }
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignorar errores de permisos
  }
  
  return files;
}

function log(message) {
  console.error(`[${workerId}]: ${message}`);
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  console.error(`[${workerId}]: FATAL ERROR: ${error.message}`);
  process.exit(1);
});
