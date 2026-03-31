/**
 * AURORA - Auto-Routing System
 * 
 * Selecciona el prompt óptimo según el tipo de tarea
 * Esto optimiza el uso de recursos y mejora accuracy
 */

export type TaskComplexity = 'simple' | 'medium' | 'complex';

export type TaskCategory = 
  | 'security'
  | 'bugfix'
  | 'feature'
  | 'refactor'
  | 'admin'
  | 'review'
  | 'default';

interface TaskPattern {
  keywords: string[];
  category: TaskCategory;
  complexity: TaskComplexity;
}

// Sistema de clasificación de tareas
const TASK_PATTERNS: TaskPattern[] = [
  // SECURITY - Siempre HIGH priority
  {
    keywords: ['auth', 'permission', 'role', 'admin', 'pago', 'payment', 
               'security', 'credential', 'token', 'password', 'kyc',
               'verify', 'ban', 'delete user', 'sensitive'],
    category: 'security',
    complexity: 'complex',
  },
  
  // BUGBUG - Generalmente simple/medium
  {
    keywords: ['fix', 'bug', 'error', 'debug', 'crash', 'broken',
               'issue', 'not working', 'falla', 'error de'],
    category: 'bugfix',
    complexity: 'medium',
  },
  
  // FEATURE - Nueva funcionalidad
  {
    keywords: ['add', 'new', 'create', 'implement', 'feature', 
               'agregar', 'nuevo', 'nueva funcionalidad'],
    category: 'feature',
    complexity: 'medium',
  },
  
  // REFACTOR - Reestructurar código
  {
    keywords: ['refactor', 'restructure', 'rewrite', 'improve',
               'refactorizar', 'optimizar', 'clean up'],
    category: 'refactor',
    complexity: 'medium',
  },
  
  // ADMIN - Tareas administrativas
  {
    keywords: ['admin', 'dashboard', 'panel', 'manage', 'config',
               'settings', 'backup', 'export', 'seed'],
    category: 'admin',
    complexity: 'medium',
  },
  
  // REVIEW - Code review
  {
    keywords: ['review', 'audit', 'check', 'verify', 'test',
               'revisar', 'analizar', 'auditar'],
    category: 'review',
    complexity: 'simple',
  },
];

// Routing según complejidad
export const COMPLEXITY_ROUTING = {
  // SIMPLE: Cambios pequeños, sin riesgo
  // Ejemplos: fix typo, add comment, rename
  simple: {
    model: 'minimax-m2.5-free',
    prompt: 'default',
    timeout: 30000,
    maxRetries: 1,
  },
  
  // MEDIUM: Funcionalidad nueva, cambios moderados
  // Ejemplos: add feature, fix bug, create component
  medium: {
    model: 'minimax-m2.5-free',
    prompt: 'feature',
    timeout: 60000,
    maxRetries: 2,
  },
  
  // COMPLEX: Cambios grandes, alta responsabilidad
  // Ejemplos: security, archictecture, auth
  complex: {
    model: 'minimax-m2.5-free',
    prompt: 'security',
    timeout: 120000,
    maxRetries: 3,
  },
};

/**
 * Clasifica una tarea según su descripción
 */
export function classifyTask(description: string): {
  category: TaskCategory;
  complexity: TaskComplexity;
} {
  const lowerDesc = description.toLowerCase();
  
  for (const pattern of TASK_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return {
          category: pattern.category,
          complexity: pattern.complexity,
        };
      }
    }
  }
  
  return { category: 'default', complexity: 'medium' };
}

/**
 * Obtiene el prompt según la categoría
 */
export function getPromptForCategory(category: TaskCategory): string {
  const prompts: Record<TaskCategory, string> = {
    security: 'security',
    bugfix: 'bugfix',
    feature: 'feature',
    refactor: 'default',
    admin: 'admin',
    review: 'default',
    default: 'default',
  };
  
  return prompts[category];
}

/**
 * Obtiene configuración óptima para una tarea
 */
export function getTaskConfig(description: string) {
  const { category, complexity } = classifyTask(description);
  const complexityConfig = COMPLEXITY_ROUTING[complexity];
  
  return {
    category,
    complexity,
    ...complexityConfig,
    prompt: getPromptForCategory(category),
  };
}

// DEBUG: Log de clasificación
export function logTaskClassification(description: string): void {
  const config = getTaskConfig(description);
  console.log(`[Aurora Router] Task: "${description.substring(0, 50)}..."`);
  console.log(`[Aurora Router] Category: ${config.category}`);
  console.log(`[Aurora Router] Complexity: ${config.complexity}`);
  console.log(`[Aurora Router] Prompt: ${config.prompt}`);
}
