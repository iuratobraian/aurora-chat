/**
 * self-correct.mjs - Auto-Correction Loop para Aurora
 *
 * Detecta fallos de lint/build/test, parsea errores, genera fix plan,
 * reintenta hasta 3 veces antes de pedir ayuda humana.
 *
 * Flujo:
 *   1. Ejecutar comando (lint/build/test)
 *   2. Si falla → parsear errores
 *   3. Generar fix plan desde errores
 *   4. Aplicar fixes (si es posible automáticamente)
 *   5. Reintentar (max 3 intentos)
 *   6. Si sigue fallando → reportar a humano
 *
 * Uso:
 *   const { SelfCorrectLoop } = await import('./self-correct.mjs');
 *   const loop = new SelfCorrectLoop();
 *   const result = await loop.run('npm run lint');
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const execAsync = promisify(exec);

// ============================================================================
// ERROR PARSERS
// ============================================================================

/**
 * Parse TypeScript errors from tsc output
 */
function parseTscErrors(stdout) {
  const errors = [];
  const regex = /^(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(stdout)) !== null) {
    errors.push({
      type: 'typescript',
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      code: `TS${match[4]}`,
      message: match[5].trim(),
      fixable: isTscFixable(match[4]),
    });
  }

  return errors;
}

function isTscFixable(tsCode) {
  // Some TS errors are auto-fixable
  const fixable = [
    '2304', // Cannot find name
    '2305', // Module has no exported member
    '2307', // Cannot find module
    '6133', // Declared but never read
    '2322', // Type not assignable
    '2339', // Property does not exist
    '1127', // Invalid character
  ];
  return fixable.includes(tsCode);
}

/**
 * Parse ESLint errors
 */
function parseEslintErrors(stdout) {
  const errors = [];
  const regex = /^(.+?)\n\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(stdout)) !== null) {
    errors.push({
      type: 'eslint',
      file: match[1].trim(),
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      level: match[4],
      message: match[5].trim(),
      rule: match[6].trim(),
      fixable: match[5].includes('(fixable)'),
    });
  }

  return errors;
}

/**
 * Parse test errors (Vitest/Jest)
 */
function parseTestErrors(stdout) {
  const errors = [];
  const lines = stdout.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Vitest pattern: × test name > error
    if (line.includes('×') || line.includes('FAIL')) {
      errors.push({
        type: 'test',
        file: extractTestFile(lines, i),
        testName: line.replace(/[×FAIL]/g, '').trim(),
        message: lines[i + 1]?.trim() || 'Test failed',
        line: extractTestLine(lines, i),
      });
    }
  }

  return errors;
}

function extractTestFile(lines, index) {
  for (let i = index; i >= 0; i--) {
    if (lines[i].includes('.test.') || lines[i].includes('.spec.')) {
      return lines[i].trim();
    }
  }
  return 'unknown';
}

function extractTestLine(lines, index) {
  for (let i = index; i < Math.min(index + 10, lines.length); i++) {
    const numMatch = lines[i].match(/(\d+)\s*\|/);
    if (numMatch) return parseInt(numMatch[1]);
  }
  return null;
}

// ============================================================================
// FIX GENERATORS
// ============================================================================

function generateFixPlan(errors) {
  const fixes = [];

  for (const error of errors) {
    if (error.type === 'typescript') {
      if (error.code === 'TS2307' || error.code === 'TS2304') {
        fixes.push({
          type: 'add-import',
          file: error.file,
          line: error.line,
          description: `Add missing import for "${error.message.match(/'(.+?)'/)?.[1] || 'unknown'}"`,
          confidence: 0.8,
        });
      } else if (error.code === 'TS6133') {
        fixes.push({
          type: 'remove-unused',
          file: error.file,
          line: error.line,
          description: `Remove unused variable declaration`,
          confidence: 0.9,
        });
      } else if (error.code === 'TS1127') {
        fixes.push({
          type: 'fix-encoding',
          file: error.file,
          line: error.line,
          description: `Fix invalid character (likely literal \\n in string)`,
          confidence: 0.95,
        });
      } else if (error.code === 'TS2322') {
        fixes.push({
          type: 'type-mismatch',
          file: error.file,
          line: error.line,
          description: `Fix type mismatch - may need type assertion`,
          confidence: 0.5,
        });
      }
    } else if (error.type === 'eslint') {
      if (error.fixable) {
        fixes.push({
          type: 'eslint-fix',
          file: error.file,
          description: `Run eslint --fix for ${error.rule}`,
          confidence: 0.9,
        });
      }
    }
  }

  return fixes;
}

// ============================================================================
// AUTO FIXERS
// ============================================================================

async function applyFix(fix) {
  if (fix.type === 'eslint-fix') {
    try {
      await execAsync(`npx eslint --fix "${fix.file}"`);
      return { applied: true, fix };
    } catch {
      return { applied: false, fix, error: 'eslint --fix failed' };
    }
  }

  if (fix.type === 'fix-encoding') {
    try {
      const content = fs.readFileSync(fix.file, 'utf8');
      const fixed = content.replace(/\\n/g, '\n').replace(/\\r/g, '');
      fs.writeFileSync(fix.file, fixed, 'utf8');
      return { applied: true, fix };
    } catch (error) {
      return { applied: false, fix, error: error.message };
    }
  }

  // For complex fixes, report but don't auto-apply
  return { applied: false, fix, reason: 'Requires manual intervention' };
}

// ============================================================================
// SELF CORRECT LOOP
// ============================================================================

export class SelfCorrectLoop {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.cwd = options.cwd || process.cwd();
    this.history = [];
    this.autoFix = options.autoFix !== false; // enabled by default
  }

  /**
   * Run command with auto-correction loop
   * @param {string} command - Command to run (e.g. 'npm run lint')
   * @returns {Promise<{success: boolean, attempts: number, errors: Array, fixes: Array}>}
   */
  async run(command) {
    const startTime = Date.now();
    let lastErrors = [];
    const allFixes = [];

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const attemptStart = Date.now();

      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: this.cwd,
          timeout: 120000,
          maxBuffer: 1024 * 1024 * 10,
        });

        // Command succeeded
        this.history.push({
          command,
          attempts: attempt,
          success: true,
          duration: Date.now() - startTime,
        });

        return {
          success: true,
          attempts: attempt,
          errors: [],
          fixes: allFixes,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        const output = error.stdout || error.stderr || error.message;
        const errors = this.parseErrors(command, output);
        lastErrors = errors;

        if (errors.length === 0) {
          // Non-parseable error
          this.history.push({
            command,
            attempts: attempt,
            success: false,
            error: 'Could not parse errors',
            duration: Date.now() - startTime,
          });

          return {
            success: false,
            attempts: attempt,
            errors: [{ type: 'unknown', message: output.substring(0, 500) }],
            fixes: allFixes,
            duration: Date.now() - startTime,
          };
        }

        // Generate fix plan
        const fixes = generateFixPlan(errors);
        allFixes.push(...fixes);

        if (fixes.length === 0 || attempt === this.maxRetries) {
          // No fixable errors or max retries reached
          this.history.push({
            command,
            attempts: attempt,
            success: false,
            errors: errors.length,
            fixableErrors: fixes.length,
            duration: Date.now() - startTime,
          });

          return {
            success: false,
            attempts: attempt,
            errors,
            fixes: allFixes,
            maxRetriesReached: attempt === this.maxRetries,
            duration: Date.now() - startTime,
          };
        }

        // Apply auto-fixes if enabled
        if (this.autoFix) {
          const fixableFixes = fixes.filter(f => f.confidence >= 0.8);
          for (const fix of fixableFixes) {
            const result = await applyFix(fix);
            fix.applied = result.applied;
          }
        }
      }
    }

    // Should not reach here, but just in case
    return {
      success: false,
      attempts: this.maxRetries,
      errors: lastErrors,
      fixes: allFixes,
      maxRetriesReached: true,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Parse errors based on command type
   */
  parseErrors(command, output) {
    if (command.includes('tsc')) {
      return parseTscErrors(output);
    }
    if (command.includes('eslint')) {
      return parseEslintErrors(output);
    }
    // For 'npm run lint' which typically runs tsc then eslint
    if (command.includes('lint')) {
      const tscErrors = parseTscErrors(output);
      if (tscErrors.length > 0) return tscErrors;
      return parseEslintErrors(output);
    }
    if (command.includes('test') || command.includes('vitest') || command.includes('jest')) {
      return parseTestErrors(output);
    }
    return [{ type: 'unknown', message: output.substring(0, 500) }];
  }

  /**
   * Get correction history
   */
  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  /**
   * Get schema for Aurora registry
   */
  getSchema() {
    return {
      name: 'self_correct',
      description: 'Run a command with automatic error detection and correction. Retries up to 3 times, parsing errors and applying fixes automatically.',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'Command to execute (e.g. npm run lint, npx tsc --noEmit, npm test)',
          },
          maxRetries: {
            type: 'number',
            description: 'Maximum retry attempts (default: 3)',
          },
          autoFix: {
            type: 'boolean',
            description: 'Whether to automatically apply fixes (default: true)',
          },
        },
        required: ['command'],
      },
    };
  }
}

// ============================================================================
// CLI MODE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv.slice(2).join(' ');

  if (!command) {
    console.log('Usage: node self-correct.mjs <command>');
    console.log('Example: node self-correct.mjs npm run lint');
    process.exit(1);
  }

  const loop = new SelfCorrectLoop();

  console.log(`🔧 Running: ${command}`);
  console.log(`📋 Max retries: ${loop.maxRetries}`);
  console.log(`🤖 Auto-fix: ${loop.autoFix ? 'ON' : 'OFF'}\n`);

  loop.run(command).then(result => {
    if (result.success) {
      console.log(`✅ Success after ${result.attempts} attempt(s) (${result.duration}ms)`);
    } else {
      console.log(`❌ Failed after ${result.attempts} attempt(s)`);
      console.log(`📝 Errors: ${result.errors.length}`);
      console.log(`🔧 Fixable: ${result.fixes.length}`);

      if (result.errors.length > 0 && result.errors.length <= 10) {
        console.log('\n📋 Top errors:');
        result.errors.slice(0, 10).forEach((e, i) => {
          console.log(`  ${i + 1}. [${e.type}] ${e.file || ''}:${e.line || ''} - ${e.message.substring(0, 100)}`);
        });
      }

      if (result.fixes.length > 0) {
        console.log('\n🔧 Suggested fixes:');
        result.fixes.slice(0, 10).forEach((f, i) => {
          console.log(`  ${i + 1}. ${f.description} (${(f.confidence * 100).toFixed(0)}% confidence)`);
        });
      }
    }

    process.exit(result.success ? 0 : 1);
  });
}
