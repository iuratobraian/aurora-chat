#!/usr/bin/env node
/**
 * vault-guard.mjs — Guardián del Neural Vault
 *
 * Ejecutar ANTES de cada commit para verificar la integridad del vault.
 * Verifica:
 *  1. Que no se eliminaron archivos del vault
 *  2. Que no se modificaron zonas cero
 *  3. Que todas las notas nuevas tienen frontmatter válido
 *  4. Que no hay conflictos de propiedad
 *  5. Que la constitución no fue alterada
 *
 * Uso:
 *   node scripts/vault-guard.mjs              → Verifica contra staging (git diff --cached)
 *   node scripts/vault-guard.mjs --all        → Verifica contra último commit
 *   node scripts/vault-guard.mjs --strict     → Modo estricto (falla ante cualquier warning)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const VAULT = path.join(ROOT, 'vault');

// ANSI Colors
const R = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const args = process.argv.slice(2);
const strict = args.includes('--strict');

// ═══════════════════════════════════════════════════════
// ZONAS PROTEGIDAS — archivos que requieren aprobación especial
// ═══════════════════════════════════════════════════════
const IMMUTABLE_FILES = [
  'vault/00-inbox/VAULT_CONSTITUTION.md',
  'vault/00-inbox/TEAM_ROSTER.md',
];

const ZONE_ZERO_FILES = [
  'src/App.tsx',
  'src/views/Navigation.tsx',
  'src/views/ComunidadView.tsx',
  'src/views/PricingView.tsx',
  'AGENTS.md',
];

const REQUIRED_FRONTMATTER = ['id', 'fecha', 'tags'];

// ═══════════════════════════════════════════════════════
// CHECKS
// ═══════════════════════════════════════════════════════

let errors = 0;
let warnings = 0;

function error(msg) {
  errors++;
  console.log(`  ${RED}❌ ERROR:${R} ${msg}`);
}

function warn(msg) {
  warnings++;
  console.log(`  ${YELLOW}⚠️  WARN:${R} ${msg}`);
}

function ok(msg) {
  console.log(`  ${GREEN}✅${R} ${msg}`);
}

function getChangedFiles() {
  try {
    const diffMode = args.includes('--all') ? 'HEAD~1' : '--cached';
    const output = execSync(`git diff ${diffMode} --name-status`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output.trim().split('\n').filter(Boolean).map(line => {
      const [status, ...fileParts] = line.split('\t');
      return { status: status.trim(), file: fileParts.join('\t').trim() };
    });
  } catch {
    // Si no hay commits o staging, verificar archivos actuales del vault
    return [];
  }
}

// Check 1: No se eliminaron archivos del vault
function checkNoDeleted(changedFiles) {
  console.log(`\n${BOLD}${CYAN}🛡️  Check 1: Protección contra eliminación${R}`);
  const deletedVault = changedFiles.filter(
    f => f.status === 'D' && f.file.startsWith('vault/')
  );
  if (deletedVault.length > 0) {
    deletedVault.forEach(f => error(`Archivo del vault ELIMINADO: ${f.file}`));
    console.log(`  ${DIM}→ Los archivos del vault NUNCA se eliminan. Marcarlos como deprecated.${R}`);
  } else {
    ok('Ningún archivo del vault fue eliminado');
  }
}

// Check 2: Constitución intacta
function checkConstitution(changedFiles) {
  console.log(`\n${BOLD}${CYAN}🏛️  Check 2: Integridad de la Constitución${R}`);
  const modified = changedFiles.filter(
    f => IMMUTABLE_FILES.includes(f.file) && f.status === 'M'
  );
  if (modified.length > 0) {
    modified.forEach(f => error(`ARCHIVO INMUTABLE modificado: ${f.file}`));
    console.log(`  ${DIM}→ Solo el USUARIO puede modificar estos archivos.${R}`);
  } else {
    ok('Constitución y Team Roster intactos');
  }
}

// Check 3: Zonas Cero no modificadas sin claim
function checkZoneZero(changedFiles) {
  console.log(`\n${BOLD}${CYAN}🚧  Check 3: Zonas Cero del código${R}`);
  const zoneModified = changedFiles.filter(
    f => ZONE_ZERO_FILES.some(z => f.file.endsWith(z)) && f.status === 'M'
  );
  if (zoneModified.length > 0) {
    zoneModified.forEach(f => {
      warn(`Zona Cero modificada: ${f.file} — verificar que hay claim explícito en vault/01-tareas/`);
    });
  } else {
    ok('Ninguna Zona Cero modificada');
  }
}

// Check 4: Frontmatter válido en notas nuevas
function checkFrontmatter(changedFiles) {
  console.log(`\n${BOLD}${CYAN}📋  Check 4: Frontmatter de notas nuevas${R}`);
  const newVaultFiles = changedFiles.filter(
    f => f.status === 'A' && f.file.startsWith('vault/') && f.file.endsWith('.md')
  );

  if (newVaultFiles.length === 0) {
    ok('Sin notas nuevas para validar');
    return;
  }

  for (const { file } of newVaultFiles) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Verificar que tiene frontmatter
    if (!content.startsWith('---')) {
      error(`${file}: SIN frontmatter YAML`);
      continue;
    }

    const fmEnd = content.indexOf('---', 3);
    if (fmEnd === -1) {
      error(`${file}: Frontmatter no cerrado`);
      continue;
    }

    const fm = content.slice(3, fmEnd);
    const missingFields = REQUIRED_FRONTMATTER.filter(field => !fm.includes(`${field}:`));
    
    if (missingFields.length > 0) {
      warn(`${file}: Frontmatter incompleto — faltan: ${missingFields.join(', ')}`);
    } else {
      ok(`${file}: Frontmatter válido`);
    }
  }
}

// Check 5: Verificar que no se modificaron notas de otros agentes
function checkOwnership(changedFiles) {
  console.log(`\n${BOLD}${CYAN}🔒  Check 5: Protección de propiedad${R}`);
  const modifiedVault = changedFiles.filter(
    f => f.status === 'M' && f.file.startsWith('vault/05-agentes/') && f.file.endsWith('.md')
  );

  if (modifiedVault.length === 0) {
    ok('Sin modificaciones a notas de agentes');
    return;
  }

  for (const { file } of modifiedVault) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const agentMatch = content.match(/agente:\s*"?([^"\n]+)"?/);
    
    if (agentMatch) {
      warn(`Nota de agente modificada: ${file} (propietario: ${agentMatch[1]})`);
      console.log(`  ${DIM}→ Verificar que solo se agregaron comentarios, no se alteró contenido original.${R}`);
    }
  }
}

// Check 6: Verificar integridad estructural del vault
function checkStructure() {
  console.log(`\n${BOLD}${CYAN}🏗️  Check 6: Integridad estructural del vault${R}`);
  
  const requiredDirs = [
    '00-inbox', '01-tareas/activas', '01-tareas/completadas',
    '02-decisiones', '03-conocimiento', '04-errores',
    '05-agentes/sesiones', '05-agentes/handoffs', '05-agentes/aprendizajes',
    '05-agentes/identidades', '06-arquitectura', '07-roadmap',
  ];

  let allGood = true;
  for (const dir of requiredDirs) {
    const fullPath = path.join(VAULT, dir);
    if (!fs.existsSync(fullPath)) {
      error(`Carpeta faltante: vault/${dir}`);
      allGood = false;
    }
  }

  // Verificar constitución
  if (!fs.existsSync(path.join(VAULT, '00-inbox', 'VAULT_CONSTITUTION.md'))) {
    error('VAULT_CONSTITUTION.md no encontrada');
    allGood = false;
  }

  if (!fs.existsSync(path.join(VAULT, '00-inbox', 'TEAM_ROSTER.md'))) {
    error('TEAM_ROSTER.md no encontrado');
    allGood = false;
  }

  if (allGood) {
    ok('Estructura del vault completa');
  }
}

// Check 7: Verificar que hay evolución (al menos 1 nota nueva en la sesión)
function checkEvolution(changedFiles) {
  console.log(`\n${BOLD}${CYAN}🧬  Check 7: Evolución del conocimiento${R}`);
  const newKnowledge = changedFiles.filter(
    f => f.status === 'A' && f.file.startsWith('vault/') && 
    !f.file.includes('.obsidian') && f.file.endsWith('.md')
  );

  if (newKnowledge.length > 0) {
    ok(`${newKnowledge.length} nota(s) nueva(s) agregada(s) al vault`);
    newKnowledge.forEach(f => console.log(`  ${DIM}+ ${f.file}${R}`));
  } else {
    warn('Sin notas nuevas en esta sesión — ¿no hubo aprendizajes?');
  }
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

function main() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${R}`);
  console.log(`${BOLD}${CYAN}║   🛡️  VAULT GUARD — Guardián del Neural Vault         ║${R}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${R}`);

  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log(`\n${DIM}ℹ️  Sin cambios en staging. Ejecutando verificación estructural...${R}`);
  }

  checkNoDeleted(changedFiles);
  checkConstitution(changedFiles);
  checkZoneZero(changedFiles);
  checkFrontmatter(changedFiles);
  checkOwnership(changedFiles);
  checkStructure();
  checkEvolution(changedFiles);

  // ═══════════════════════════════════════════════════════
  // VEREDICTO
  // ═══════════════════════════════════════════════════════
  console.log(`\n${BOLD}${'─'.repeat(56)}${R}`);

  if (errors > 0) {
    console.log(`${BOLD}${RED}❌ VAULT GUARD: RECHAZADO${R}`);
    console.log(`${RED}   ${errors} error(es), ${warnings} warning(s)${R}`);
    console.log(`${DIM}   Corregir los errores antes de hacer commit.${R}\n`);
    process.exit(1);
  } else if (warnings > 0 && strict) {
    console.log(`${BOLD}${YELLOW}⚠️  VAULT GUARD: RECHAZADO (modo estricto)${R}`);
    console.log(`${YELLOW}   0 errores, ${warnings} warning(s)${R}`);
    console.log(`${DIM}   En modo estricto, los warnings también bloquean.${R}\n`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`${BOLD}${YELLOW}⚠️  VAULT GUARD: APROBADO CON ADVERTENCIAS${R}`);
    console.log(`${YELLOW}   0 errores, ${warnings} warning(s)${R}`);
    console.log(`${DIM}   Revisar las advertencias antes de deploy.${R}\n`);
    process.exit(0);
  } else {
    console.log(`${BOLD}${GREEN}✅ VAULT GUARD: APROBADO${R}`);
    console.log(`${GREEN}   Vault íntegro. Listo para commit.${R}\n`);
    process.exit(0);
  }
}

main();
