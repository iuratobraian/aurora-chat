#!/usr/bin/env node
/**
 * aurora-inicio.mjs — Compatibility Wrapper + Aurora Pre-Flight
 * Runs Aurora inicio CLI from the aurora/ directory, but first takes a snapshot and condenses memory.
 */
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("✨ [AURORA OMNIPRESENTE] 🧠 Inicializando secuencia de núcleo...");
try {
  execSync('node ' + path.join(__dirname, 'aurora-snapshot.mjs'), { stdio: 'inherit' });
  execSync('node ' + path.join(__dirname, 'aurora-condenser.mjs'), { stdio: 'inherit' });
} catch (e) {
  console.log("✨ [AURORA] ⚠️ Aviso en limpieza previa. Continuando con el bootstrap...");
}

import('../aurora/cli/aurora-inicio.mjs');
