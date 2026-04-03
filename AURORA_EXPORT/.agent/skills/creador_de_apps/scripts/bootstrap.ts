#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'workspace', 'template');
const WORKSPACE_DIR = path.join(__dirname, '..', 'workspace');
const APPS_DIR = path.join(WORKSPACE_DIR, '..', '..', '..');

interface AppConfig {
  name: string;
  id: string;
  description: string;
  stack: 'full' | 'frontend' | 'api';
  features: string[];
}

function copyTemplate(from: string, to: string, vars: Record<string, string>) {
  let content = fs.readFileSync(from, 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, content);
  console.log(`  ✅ ${path.relative(WORKSPACE_DIR, to)}`);
}

function createAppWorkspace(config: AppConfig): string {
  const date = new Date().toISOString().split('T')[0];
  const safeName = config.name.replace(/[^a-zA-Z0-9]/g, '');
  const appDir = path.join(APPS_DIR, safeName);

  if (fs.existsSync(appDir)) {
    console.error(`❌ Ya existe un proyecto en: ${safeName}`);
    process.exit(1);
  }

  console.log(`\n🚀 Creando workspace para: ${config.name}`);
  console.log(`📁 Ubicación: ${path.relative(APPS_DIR, appDir)}`);

  const vars: Record<string, string> = {
    '{APP_NAME}': config.name,
    '{APP_ID}': config.id,
    '{DATE}': date,
    '{APP_DESCRIPTION}': config.description,
    '{APP_FEATURES}': config.features.join(', '),
  };

  console.log('\n📋 Generando archivos...');
  copyTemplate(
    path.join(TEMPLATE_DIR, 'TASK_BOARD_template.md'),
    path.join(appDir, 'TASK_BOARD.md'),
    vars
  );
  copyTemplate(
    path.join(TEMPLATE_DIR, 'CURRENT_FOCUS_template.md'),
    path.join(appDir, 'CURRENT_FOCUS.md'),
    vars
  );
  copyTemplate(
    path.join(TEMPLATE_DIR, 'AGENT_LOG_template.md'),
    path.join(appDir, 'AGENT_LOG.md'),
    vars
  );

  console.log('\n📁 Estructura creada:');
  console.log(`  ${safeName}/`);
  console.log(`  ├── TASK_BOARD.md`);
  console.log(`  ├── CURRENT_FOCUS.md`);
  console.log(`  └── AGENT_LOG.md`);

  console.log('\n📝 Scripts (agregar a package.json del proyecto):');
  console.log(`  "new-task": "node scripts/addTask.mjs"`);
  console.log(`  "claim": "node scripts/claimTask.mjs"`);
  console.log(`  "status": "node scripts/status.mjs"`);

  return appDir;
}

function listTemplates() {
  console.log('\n📋 Plantillas disponibles:');
  const files = fs.readdirSync(TEMPLATE_DIR);
  for (const file of files) {
    console.log(`  - ${file.replace('_template.md', '')}`);
  }
}

const args = process.argv.slice(2);

if (args[0] === 'list') {
  listTemplates();
  process.exit(0);
}

if (args.length < 2) {
  console.log(`
🤖 TradeStack App Bootstrap

Uso:
  npx tsx scripts/bootstrap.mjs <nombre> <id> [--full|--frontend|--api]

Ejemplos:
  npx tsx scripts/bootstrap.mjs "Saboteador" SAB
  npx tsx scripts/bootstrap.mjs "Mi App" APP --full
  npx tsx scripts/bootstrap.mjs "API Only" API --api

Flags:
  --full     Stack completo: Vite + React + Convex + Express
  --frontend Solo frontend: Vite + React
  --api      Solo backend: Convex + Express

Opciones:
  list       Ver plantillas disponibles
`);
  process.exit(1);
}

const name = args[0];
const id = args[1].toUpperCase();
const stack = args.includes('--frontend') ? 'frontend' : args.includes('--api') ? 'api' : 'full';

const config: AppConfig = {
  name,
  id,
  description: '',
  stack,
  features: [],
};

createAppWorkspace(config);
console.log('\n✨ Workspace listo. Editá TASK_BOARD.md para empezar.\n');
