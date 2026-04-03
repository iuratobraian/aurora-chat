import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 INICIANDO VERIFICACIÓN DE CONEXIÓN CONVEX...');

try {
  // 1. Verificar .env.local
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('CONVEX_DEPLOY_KEY')) {
      console.log('✅ CONVEX_DEPLOY_KEY encontrada en .env.local');
    } else {
      console.error('❌ ERROR: CONVEX_DEPLOY_KEY no encontrada en .env.local');
    }
  } else {
    console.warn('⚠️ ADVERTENCIA: .env.local no existe');
  }

  // 2. Verificar npx convex status
  console.log('⏳ Ejecutando npx convex status...');
  const status = execSync('npx convex status', { encoding: 'utf8' });
  console.log('--- RESULTADO ---');
  console.log(status);
  console.log('-----------------');

  console.log('🏆 CONEXIÓN ESTABLECIDA CON ÉXITO');
} catch (error) {
  console.error('❌ ERROR CRÍTICO DE CONEXIÓN:');
  console.error(error.stdout || error.message);
  process.exit(1);
}
