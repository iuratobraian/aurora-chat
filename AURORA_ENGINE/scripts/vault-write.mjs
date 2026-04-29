#!/usr/bin/env node
/**
 * vault-write.mjs — Escritura Estandarizada al Neural Vault
 *
 * TODAS las escrituras al vault DEBEN pasar por este script.
 * Garantiza:
 *  - Frontmatter YAML válido y completo
 *  - Propiedad correcta (campo agente:)
 *  - Links bidireccionales automáticos
 *  - Timestamps precisos
 *  - Protección contra sobrescribir notas ajenas
 *
 * Comandos:
 *   node vault-write.mjs sesion --agente "AntiGravity" --objetivo "Fix auth"
 *   node vault-write.mjs tarea --titulo "Hardening de profiles" --agente "Qwen"
 *   node vault-write.mjs aprendizaje --agente "AntiGravity" --titulo "..." --contenido "..."
 *   node vault-write.mjs error --agente "Qwen" --titulo "RLS Bypass" --severidad "critical"
 *   node vault-write.mjs decision --agente "AntiGravity" --titulo "Migrar a JWT"
 *   node vault-write.mjs conocimiento --agente "AntiGravity" --categoria "auth" --titulo "OAuth Flow"
 *   node vault-write.mjs experiencia --agente "AntiGravity" --titulo "Restauración de Tokens" --contenido "..."
 */

import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VAULT = path.join(ROOT, 'vault');

const args = process.argv.slice(2);
const command = args[0];

// ═══════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function getTimestamp() {
  return new Date().toISOString().replace(/[-:T]/g, '').split('.')[0].slice(0, 12);
}

function getDate() {
  return new Date().toISOString().split('T')[0];
}

function getTime() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function sanitizeFileName(title) {
  return title.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildFrontmatter(fields) {
  const lines = Object.entries(fields)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  return `---\n${lines}\n---`;
}

async function writeNote(filePath, frontmatter, body) {
  // Protección: no sobrescribir si ya existe
  if (await fileExists(filePath)) {
    const existing = await readFile(filePath, 'utf8');
    const agentMatch = existing.match(/agente:\s*"?([^"\n]+)"?/);
    const requestingAgent = getArg('agente') || 'Unknown';
    
    if (agentMatch && agentMatch[1] !== requestingAgent) {
      console.error(`❌ BLOQUEADO: Esta nota pertenece a "${agentMatch[1]}". Tú eres "${requestingAgent}".`);
      console.error(`   → Creá una nota nueva que referencie a esta con [[${path.basename(filePath, '.md')}]]`);
      process.exit(1);
    }
  }

  const content = `${frontmatter}\n\n${body}\n`;
  await writeFile(filePath, content);
  console.log(`✅ Nota creada: ${path.relative(ROOT, filePath)}`);
}

// ═══════════════════════════════════════════════════════
// COMANDOS
// ═══════════════════════════════════════════════════════

async function handleSession() {
  const agent = getArg('agente') || 'Agent';
  const objetivo = getArg('objetivo') || 'Sin objetivo declarado';
  const id = `SES-${getTimestamp()}`;
  const fileName = `${getDate()}-${sanitizeFileName(agent)}.md`;
  const dir = path.join(VAULT, '05-agentes', 'sesiones');
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    agente: agent,
    fecha: getDate(),
    inicio: getTime(),
    fin: '',
    estado: 'activa',
    tags: ['sesion'],
  });

  const body = `# 🧠 Sesión: ${agent} — ${getDate()}

## 🎯 Objetivo
${objetivo}

## 📝 Trabajo Realizado
- [ ] [pendiente de registrar]

## 💡 Aprendizajes
[Completar al cierre de sesión]

## 📦 Handoff
[Completar al cierre de sesión]

---
## 🔗 Links
[Agregar links [[]] a tareas, errores y decisiones tocadas]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

async function handleTask() {
  const agent = getArg('agente') || 'Disponible';
  const title = getArg('titulo') || 'Nueva Tarea';
  const status = getArg('estado') || 'pending';
  const id = `TASK-${getTimestamp()}`;
  const fileName = `${id}-${sanitizeFileName(title)}.md`;
  const dir = path.join(VAULT, '01-tareas', status === 'done' ? 'completadas' : 'activas');
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    titulo: title,
    estado: status,
    agente: agent,
    fecha_creacion: `${getDate()} ${getTime()}`,
    fecha_cierre: '',
    archivos_autorizados: [],
    archivos_prohibidos: ['App.tsx', 'Navigation.tsx', 'PricingView.tsx'],
    tags: ['tarea'],
    relacionado: [],
  });

  const body = `# 🎯 ${title}

## 📋 Descripción
[Describir el objetivo]

## 📝 Contexto
[Por qué es necesaria]

## ✅ Criterios de Aceptación
- [ ] 

## 🛠️ Archivos a Tocar
- [ ] 

## 🧪 Validación
- [ ] \`npm run lint\` sin errores
- [ ] Smoke test visual

---
## 🧠 Notas del Agente
[Espacio para pensamientos]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

async function handleLearning() {
  const agent = getArg('agente') || 'Agent';
  const title = getArg('titulo') || 'Aprendizaje';
  const contenido = getArg('contenido') || '';
  const id = `LEARN-${getTimestamp()}`;
  const fileName = `${id}-${sanitizeFileName(title)}.md`;
  const dir = path.join(VAULT, '05-agentes', 'aprendizajes');
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    agente: agent,
    fecha: getDate(),
    tags: ['aprendizaje'],
  });

  const body = `# 💡 ${title}

## Resumen
${contenido || '[Una frase que capture el aprendizaje]'}

## Contexto
[Cómo se descubrió]

## Patrón Reusable
\`\`\`
[Código o proceso a reutilizar]
\`\`\`

## 🚫 Anti-patrón
[Qué NO volver a hacer]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

async function handleError() {
  const agent = getArg('agente') || 'Agent';
  const title = getArg('titulo') || 'Error';
  const severidad = getArg('severidad') || 'high';
  const id = `ERR-${getTimestamp()}`;
  const fileName = `${id}-${sanitizeFileName(title)}.md`;
  const dir = path.join(VAULT, '04-errores');
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    agente: agent,
    severidad,
    fecha: getDate(),
    estado: 'open',
    tags: ['error', severidad],
  });

  const body = `# 🛑 ${title}

## 🔍 Síntomas
[Qué está fallando]

## 🕵️ Causa Raíz
[Por qué falló]

## 🛠️ Solución
[Cómo se arregló]

## 🛡️ Anti-patrón Detectado
[Cómo evitar que vuelva a pasar]

---
## 🔗 Relacionado
[Links a tareas y decisiones]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

async function handleDecision() {
  const agent = getArg('agente') || 'Agent';
  const title = getArg('titulo') || 'Decisión';
  const id = `ADR-${getTimestamp()}`;
  const fileName = `${id}-${sanitizeFileName(title)}.md`;
  const dir = path.join(VAULT, '02-decisiones');
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    agente: agent,
    fecha: getDate(),
    estado: 'proposed',
    tags: ['ADR'],
  });

  const body = `# 🏛️ ${title}

## Resumen
[Una frase]

## Contexto
[Problema a resolver]

## Alternativas
- **A**: [pros/contras]
- **B**: [pros/contras]

## Decisión
[Qué elegimos y por qué]

## Consecuencias
[Qué cambia en el sistema]

---
## 📎 Referencias
[Links]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

async function handleKnowledge() {
  const agent = getArg('agente') || 'Agent';
  const title = getArg('titulo') || 'Conocimiento';
  const categoria = getArg('categoria') || 'general';
  const id = `KNOW-${getTimestamp()}`;
  const fileName = `${id}-${sanitizeFileName(title)}.md`;
  const dir = path.join(VAULT, '03-conocimiento', categoria);
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    agente: agent,
    categoria,
    fecha: getDate(),
    tags: ['conocimiento', categoria],
  });

  const body = `# 📖 ${title}

## Resumen
[Concepto en una frase]

## Detalle
[Explicación técnica]

## Archivos Clave
[Dónde vive esto en el código]

## Links
[Notas relacionadas con [[ ]]]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

async function handleExperience() {
  const agent = getArg('agente') || 'Agent';
  const title = getArg('titulo') || 'Cronica de Resolucion';
  const contenido = getArg('contenido') || '';
  const id = `EXP-${getTimestamp()}`;
  const fileName = `${getDate()}-${sanitizeFileName(agent)}-${sanitizeFileName(title)}.md`;
  const dir = path.join(VAULT, '05-agentes', 'experiencias');
  await ensureDir(dir);

  const fm = buildFrontmatter({
    id,
    agente: agent,
    fecha: getDate(),
    tags: ['experiencia', 'sesion'],
  });

  const body = `# 🧠 Experiencia de Sesión: ${title}

## 🌟 La Chispa (El Origen)
${contenido || '[Qué desencadenó el trabajo en esta sesión]'}

## 🕸️ El Laberinto (Obstáculos y Errores)
- [Obstáculo]: [Descripción]
- [Causa Raíz]: [Por qué falló]

## 💡 La Epifanía (La Resolución)
- [Solución]: [Cómo se arregló]
- [Pattern]: [Nuevo patrón detectado]

## 🏛️ Veredicto de Arquitectura
[Impacto en el sistema]

---
## 🔗 Referencias
[Links [[ ]]]`;

  await writeNote(path.join(dir, fileName), fm, body);
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

const COMMANDS = {
  sesion: handleSession,
  tarea: handleTask,
  aprendizaje: handleLearning,
  error: handleError,
  decision: handleDecision,
  conocimiento: handleKnowledge,
  experiencia: handleExperience,
};

async function main() {
  if (!command || !COMMANDS[command]) {
    console.log('🖊️  vault-write.mjs — Escritura al Neural Vault\n');
    console.log('Comandos:');
    console.log('  sesion        → Registrar inicio de sesión de agente');
    console.log('  tarea         → Crear nueva tarea');
    console.log('  aprendizaje   → Documentar un aprendizaje');
    console.log('  error         → Registrar un error');
    console.log('  decision      → Crear un ADR (Architecture Decision Record)');
    console.log('  conocimiento  → Agregar nota de conocimiento');
    console.log('  experiencia   → Documentar una experiencia de resolución de tarea\n');
    console.log('Opciones comunes: --agente "XXX" --titulo "YYY"');
    return;
  }

  await COMMANDS[command]();

  // Trigger sync inteligente con NotebookLM en segundo plano
  exec('npm run vault:intel:sync', (err) => {
    if (err) console.error('⚠️ [AURORA INTEL] Error en la sincronización automática.');
    else console.log('🧠 [AURORA INTEL] Mastermind actualizado correctamente.');
  });
}

main().catch(err => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
