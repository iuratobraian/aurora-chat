#!/usr/bin/env node
/**
 * aurora-cli.mjs — Aurora CLI Entry Point
 *
 * Punto de entrada principal para la CLI de Aurora
 * Ejecuta directamente el CLI real en aurora/cli/
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta absoluta al CLI real de Aurora
const auroraCliPath = resolve(__dirname, '..', 'aurora', 'cli', 'aurora-cli.mjs');

// Obtener argumentos pasados a este script
const args = process.argv.slice(2);

// Ejecutar el CLI real con los argumentos y límite de memoria
const child = spawn('node', ['--max-old-space-size=4096', auroraCliPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (err) => {
  console.error('❌ Error ejecutando Aurora CLI:');
  console.error(err.message);
  console.error('\nVerifica que aurora/cli/aurora-cli.mjs exista');
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code);
});
