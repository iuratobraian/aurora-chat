import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🛡️ AURORA INSTITUTIONAL READINESS CHECK...');

try {
  // 1. Sincronización de Memoria (pasado.md)
  const pasadoPath = path.resolve(process.cwd(), '.agent/workspace/coordination/pasado.md');
  if (!fs.existsSync(pasadoPath)) {
    throw new Error('MEMORIA CRÍTICA FALTANTE: No existe pasado.md. Sincronización de órdenes fallida.');
  }
  console.log('✅ Verificación de Memoria: PASADA');

  // 2. Sincronización de Maestría (aurora-mastery)
  const masteryPath = path.resolve(process.cwd(), '.agent/skills/aurora-mastery/SKILL.md');
  if (!fs.existsSync(masteryPath)) {
    throw new Error('SISTEMA DE MAESTRÍA FALTANTE: No existe el skill aurora-mastery.');
  }
  console.log('✅ Verificación de Maestría: PASADA');

  // 3. Verificación de Infraestructura (Convex)
  console.log('⏳ Probando conexión con Convex (npx convex dev --help)...');
  execSync('npx convex --version', { stdio: 'ignore' });
  console.log('✅ CLI de Convex: DETECTADO');

  // 4. Verificación de Tipado (Lint)
  console.log('⏳ Ejecutando validación de tipos (npm run lint)...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Estabilidad de Tipado: VERIFICADA');

  console.log('🏆 EQUIPO 100% SINCRONIZADO. PUEDES PROCEDER CON LAS ÓRDENES DEL JEFE.');
} catch (error) {
  console.error('\n❌ ERROR DE PREPARACIÓN INSTITUCIONAL:');
  console.error(error.message);
  console.log('--- REQUERIMIENTO DEL JEFE: "Basta de errores. Corrige antes de seguir." ---');
  process.exit(1);
}
