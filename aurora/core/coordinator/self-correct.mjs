#!/usr/bin/env node
/**
 * self-correct.mjs - Self-Correction Loop for Aurora
 * 
 * Enables Aurora to automatically fix errors by:
 * - Executing tasks through Coordinator
 * - Checking verification results
 * - Parsing error messages
 * - Creating fix plans
 * - Re-executing until success (max 3 attempts)
 * 
 * @see docs/CLAUDE_CODE_LEAK_ANALYSIS.md - Coordinator Mode Pattern
 * @see aurora/core/coordinator/aurora-coordinator.mjs - 4-phase execution
 * @see aurora/core/coordinator/worker.mjs - Verification workers
 */

import { getCoordinator } from './aurora-coordinator.mjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SELFCORRECT_CONFIG = {
  // Maximum correction attempts
  maxAttempts: 3,
  
  // Delay between attempts (ms)
  retryDelayMs: 1000,
  
  // Error types that trigger auto-correction
  correctableErrors: [
    'test_failure',
    'lint_error',
    'type_error',
    'syntax_error',
    'import_error',
    'undefined_variable',
    'missing_import',
    'unused_variable'
  ],
  
  // Error types that require human intervention
  nonCorrectableErrors: [
    'permission_denied',
    'file_not_found',
    'disk_full',
    'network_error',
    'timeout'
  ],
  
  // Verification checks to run after each attempt
  verificationChecks: [
    'lint',
    'test',
    'type-check'
  ]
};

// ============================================================================
// ERROR PARSER CLASS
// ============================================================================

class ErrorParser {
  /**
   * Parse error message and extract structured info
   */
  parse(errorOutput) {
    if (!errorOutput) {
      return { type: 'unknown', message: 'Unknown error', location: null };
    }

    // Test failure pattern
    const testMatch = errorOutput.match(/FAIL.*?(.+?\.test\.[jt]sx?):(\d+):(\d+)/);
    if (testMatch) {
      return {
        type: 'test_failure',
        message: errorOutput.split('\n')[0],
        location: {
          file: testMatch[1],
          line: parseInt(testMatch[2]),
          column: parseInt(testMatch[3])
        }
      };
    }

    // TypeScript error pattern
    const tsMatch = errorOutput.match(/TS(\d+):\s*(.+?)\((\d+),(\d+)\)/);
    if (tsMatch) {
      return {
        type: 'type_error',
        code: tsMatch[1],
        message: tsMatch[2],
        location: {
          file: tsMatch[3],
          line: parseInt(tsMatch[4]),
          column: parseInt(tsMatch[5])
        }
      };
    }

    // ESLint error pattern
    const lintMatch = errorOutput.match(/(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+\((.+?)\)/);
    if (lintMatch) {
      return {
        type: 'lint_error',
        message: lintMatch[4],
        rule: lintMatch[5],
        location: {
          line: parseInt(lintMatch[1]),
          column: parseInt(lintMatch[2])
        }
      };
    }

    // Syntax error pattern
    const syntaxMatch = errorOutput.match(/SyntaxError:\s*(.+?)\s+at\s+(.+?):(\d+):(\d+)/);
    if (syntaxMatch) {
      return {
        type: 'syntax_error',
        message: syntaxMatch[1],
        location: {
          file: syntaxMatch[2],
          line: parseInt(syntaxMatch[3]),
          column: parseInt(syntaxMatch[4])
        }
      };
    }

    // Import error pattern
    const importMatch = errorOutput.match(/Cannot find module ['"](.+?)['"]/);
    if (importMatch) {
      return {
        type: 'import_error',
        message: errorOutput.split('\n')[0],
        module: importMatch[1]
      };
    }

    // Undefined variable pattern
    const undefinedMatch = errorOutput.match(/['"](.+?)['"] is not defined/);
    if (undefinedMatch) {
      return {
        type: 'undefined_variable',
        variable: undefinedMatch[1],
        message: errorOutput.split('\n')[0]
      };
    }

    // Default: unknown error
    return {
      type: 'unknown',
      message: errorOutput.split('\n')[0]
    };
  }
}

// ============================================================================
// FIX PLAN GENERATOR
// ============================================================================

class FixPlanGenerator {
  /**
   * Generate fix plan from parsed errors
   */
  generate(errors, task) {
    const actions = [];

    for (const error of errors) {
      const fixActions = this.getFixActions(error, task);
      actions.push(...fixActions);
    }

    return {
      actions,
      totalActions: actions.length,
      estimatedTime: actions.length * 2, // 2 minutes per action
      priority: this.getPriority(errors)
    };
  }

  /**
   * Get fix actions for specific error type
   */
  getFixActions(error, task) {
    switch (error.type) {
      case 'test_failure':
        return this.fixTestFailure(error, task);
      
      case 'type_error':
        return this.fixTypeError(error, task);
      
      case 'lint_error':
        return this.fixLintError(error, task);
      
      case 'syntax_error':
        return this.fixSyntaxError(error, task);
      
      case 'import_error':
        return this.fixImportError(error, task);
      
      case 'undefined_variable':
        return this.fixUndefinedVariable(error, task);
      
      default:
        return this.fixUnknownError(error, task);
    }
  }

  /**
   * Fix test failure
   */
  fixTestFailure(error, task) {
    return [
      {
        type: 'analyze',
        description: `Analyze test failure in ${error.location?.file || 'test file'}`,
        target: error.location?.file,
        focus: 'understand test expectations'
      },
      {
        type: 'fix',
        description: `Fix implementation to pass test: ${error.message}`,
        target: error.location?.file,
        focus: 'match expected behavior'
      },
      {
        type: 'verify',
        description: 'Re-run tests to verify fix',
        target: 'test suite'
      }
    ];
  }

  /**
   * Fix type error
   */
  fixTypeError(error, task) {
    return [
      {
        type: 'analyze',
        description: `Analyze type error: ${error.message}`,
        target: error.location?.file,
        focus: 'type mismatch'
      },
      {
        type: 'fix',
        description: `Add/fix type annotation: ${error.code}`,
        target: error.location?.file,
        line: error.location?.line
      },
      {
        type: 'verify',
        description: 'Re-run type checker',
        target: 'tsc --noEmit'
      }
    ];
  }

  /**
   * Fix lint error
   */
  fixLintError(error, task) {
    return [
      {
        type: 'fix',
        description: `Fix linting: ${error.message} (${error.rule})`,
        target: error.location?.file,
        line: error.location?.line,
        rule: error.rule
      },
      {
        type: 'verify',
        description: 'Re-run linter',
        target: 'npm run lint'
      }
    ];
  }

  /**
   * Fix syntax error
   */
  fixSyntaxError(error, task) {
    return [
      {
        type: 'fix',
        description: `Fix syntax: ${error.message}`,
        target: error.location?.file,
        line: error.location?.line,
        urgency: 'critical'
      },
      {
        type: 'verify',
        description: 'Re-parse file',
        target: error.location?.file
      }
    ];
  }

  /**
   * Fix import error
   */
  fixImportError(error, task) {
    return [
      {
        type: 'analyze',
        description: `Find module: ${error.module}`,
        focus: 'locate missing module'
      },
      {
        type: 'fix',
        description: `Add import or install package: ${error.module}`,
        target: error.module
      },
      {
        type: 'verify',
        description: 'Re-run build/lint',
        target: 'npm run lint'
      }
    ];
  }

  /**
   * Fix undefined variable
   */
  fixUndefinedVariable(error, task) {
    return [
      {
        type: 'analyze',
        description: `Find definition for: ${error.variable}`,
        focus: 'locate variable declaration'
      },
      {
        type: 'fix',
        description: `Define or import: ${error.variable}`,
        target: error.variable
      },
      {
        type: 'verify',
        description: 'Re-run type checker',
        target: 'tsc --noEmit'
      }
    ];
  }

  /**
   * Fix unknown error
   */
  fixUnknownError(error, task) {
    return [
      {
        type: 'analyze',
        description: `Analyze error: ${error.message}`,
        focus: 'understand root cause'
      },
      {
        type: 'fix',
        description: `Fix: ${error.message}`,
        focus: 'general fix'
      },
      {
        type: 'verify',
        description: 'Re-run verification',
        target: 'all checks'
      }
    ];
  }

  /**
   * Get priority from errors
   */
  getPriority(errors) {
    const hasCritical = errors.some(e => 
      e.type === 'syntax_error' || 
      e.type === 'import_error'
    );
    
    return hasCritical ? 'critical' : 'high';
  }
}

// ============================================================================
// SELF CORRECT LOOP CLASS
// ============================================================================

export class SelfCorrectLoop {
  constructor(options = {}) {
    this.config = { ...SELFCORRECT_CONFIG, ...options };
    this.coordinator = getCoordinator();
    this.errorParser = new ErrorParser();
    this.fixPlanGenerator = new FixPlanGenerator();
    this.attemptHistory = [];
  }

  /**
   * Execute task with auto-correction
   */
  async execute(task) {
    console.log('\n🔄 SELF-CORRECT: Starting auto-correction loop\n');
    console.log(`Task: ${task.name || 'Unnamed task'}`);
    console.log(`Max attempts: ${this.config.maxAttempts}\n`);

    let lastError = null;
    let lastResult = null;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`ATTEMPT ${attempt}/${this.config.maxAttempts}`);
      console.log(`${'='.repeat(60)}\n`);

      // Execute task
      const result = await this.coordinator.execute(task);
      lastResult = result;

      // Check if successful
      if (result.success && result.verification?.passed) {
        console.log('\n✅ SELF-CORRECT: Task completed successfully!\n');
        
        this.logAttempt(attempt, result, 'success');
        
        return {
          success: true,
          attempts: attempt,
          result,
          history: this.attemptHistory
        };
      }

      // Extract errors
      const errors = this.extractErrors(result);
      
      if (errors.length === 0) {
        console.log('\n⚠️  SELF-CORRECT: No extractable errors found\n');
        lastError = { type: 'unknown', message: 'Verification failed without specific errors' };
      } else {
        console.log(`\n❌ Attempt ${attempt} failed with ${errors.length} error(s):\n`);
        
        for (const error of errors) {
          console.log(`  - [${error.type}] ${error.message}`);
          if (error.location) {
            console.log(`    at ${error.location.file || 'unknown'}:${error.location.line || '?'}:${error.location.column || '?'}`);
          }
        }
        
        lastError = errors[0];
      }

      // Check if error is correctable
      if (!this.isCorrectable(lastError)) {
        console.log(`\n🚫 SELF-CORRECT: Error type '${lastError.type}' is not auto-correctable\n`);
        console.log('Human intervention required.\n');
        
        this.logAttempt(attempt, result, 'non-correctable');
        
        return {
          success: false,
          attempts: attempt,
          result,
          error: lastError,
          reason: 'non-correctable',
          history: this.attemptHistory
        };
      }

      // Check if max attempts reached
      if (attempt >= this.config.maxAttempts) {
        console.log(`\n🚫 SELF-CORRECT: Max attempts (${this.config.maxAttempts}) reached\n`);
        console.log('Human intervention required.\n');
        
        this.logAttempt(attempt, result, 'max-attempts');
        
        return {
          success: false,
          attempts: attempt,
          result,
          error: lastError,
          reason: 'max-attempts',
          history: this.attemptHistory
        };
      }

      // Generate fix plan
      console.log('\n🔧 Generating fix plan...\n');
      const fixPlan = this.fixPlanGenerator.generate(errors, task);
      
      console.log(`Fix plan: ${fixPlan.totalActions} action(s)`);
      console.log(`Priority: ${fixPlan.priority}`);
      console.log(`Estimated time: ${fixPlan.estimatedTime} min\n`);

      // Execute fix plan
      console.log('🔨 Executing fix plan...\n');
      
      const fixTask = {
        name: `Fix: ${task.name}`,
        description: `Auto-generated fix plan for attempt ${attempt}`,
        actions: fixPlan.actions
      };

      const fixResult = await this.coordinator.execute(fixTask);

      if (!fixResult.success) {
        console.log('\n⚠️  Fix plan execution failed\n');
      }

      // Wait before retry
      console.log(`\n⏱️  Waiting ${this.config.retryDelayMs}ms before retry...\n`);
      await this.wait(this.config.retryDelayMs);

      this.logAttempt(attempt, result, 'failed', errors, fixPlan);
    }

    // Should not reach here, but just in case
    return {
      success: false,
      attempts: this.config.maxAttempts,
      result: lastResult,
      error: lastError,
      reason: 'unknown',
      history: this.attemptHistory
    };
  }

  /**
   * Extract errors from coordinator result
   */
  extractErrors(result) {
    const errors = [];

    // From verification results
    if (result.verification && !result.verification.passed) {
      const verificationErrors = result.verification.results || [];
      
      for (const check of verificationErrors) {
        if (!check.passed && check.error) {
          const parsed = this.errorParser.parse(check.error);
          errors.push(parsed);
        }
      }
    }

    // From implementation errors
    if (result.implementation && result.implementation.failed) {
      for (const failed of result.implementation.failed) {
        if (failed.error) {
          const parsed = this.errorParser.parse(failed.error);
          errors.push(parsed);
        }
      }
    }

    // From error property
    if (result.error) {
      const parsed = this.errorParser.parse(result.error);
      errors.push(parsed);
    }

    return errors;
  }

  /**
   * Check if error is correctable
   */
  isCorrectable(error) {
    // Check non-correctable list
    if (this.config.nonCorrectableErrors.includes(error.type)) {
      return false;
    }

    // Check correctable list
    if (this.config.correctableErrors.includes(error.type)) {
      return true;
    }

    // Default: try to correct
    return true;
  }

  /**
   * Wait for specified duration
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log attempt to history
   */
  logAttempt(attempt, result, status, errors = null, fixPlan = null) {
    this.attemptHistory.push({
      attempt,
      status,
      timestamp: Date.now(),
      errors: errors ? errors.map(e => e.type) : null,
      fixPlan: fixPlan ? fixPlan.totalActions : null,
      success: result.success
    });
  }

  /**
   * Get attempt history
   */
  getHistory() {
    return this.attemptHistory;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.attemptHistory = [];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let selfCorrectInstance = null;

export function getSelfCorrectLoop() {
  if (!selfCorrectInstance) {
    selfCorrectInstance = new SelfCorrectLoop();
  }
  return selfCorrectInstance;
}

export async function executeWithSelfCorrect(task, options = {}) {
  const selfCorrect = getSelfCorrectLoop();
  
  // Override config if provided
  if (options.maxAttempts) {
    selfCorrect.config.maxAttempts = options.maxAttempts;
  }
  
  return await selfCorrect.execute(task);
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔄 Self-Correct Loop - Auto-correction for Aurora\n');
  console.log('Usage: node self-correct.mjs (requires task definition)\n');
  console.log('This module is designed to be used programmatically:');
  console.log('  import { executeWithSelfCorrect } from "./self-correct.mjs";');
  console.log('  const result = await executeWithSelfCorrect(task);\n');
  
  // Demo mode
  console.log('🧪 Demo mode (no actual task):\n');
  
  const demoErrors = [
    { type: 'test_failure', message: 'Expected true to be false' },
    { type: 'type_error', message: 'Type string is not assignable to type number' },
    { type: 'lint_error', message: 'Missing semicolon', rule: 'semi' }
  ];
  
  const parser = new ErrorParser();
  const fixGenerator = new FixPlanGenerator();
  
  console.log('Error Parser Demo:');
  for (const error of demoErrors) {
    console.log(`  Input: ${error.message}`);
    console.log(`  Parsed: ${error.type}`);
    console.log();
  }
  
  console.log('Fix Plan Generator Demo:');
  const plan = fixGenerator.generate(demoErrors, { name: 'demo-task' });
  console.log(`  Total actions: ${plan.totalActions}`);
  console.log(`  Priority: ${plan.priority}`);
  console.log(`  Estimated time: ${plan.estimatedTime} min\n`);
}
