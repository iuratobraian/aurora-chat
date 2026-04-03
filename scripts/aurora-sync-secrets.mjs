import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARGS = process.argv.slice(2);
const IS_PULL = ARGS.includes('--pull');
const ENV_FILE = path.resolve(process.cwd(), '.env.local');

const SECRETS_TO_SYNC = [
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID',
  'CONVEX_DEPLOY_KEY',
  'CONVEX_DEPLOYMENT',
  'OPENAI_API_KEY',
  'NVIDIA_API_KEY',
  'VITE_CONVEX_URL'
];

if (IS_PULL) {
  console.log('📥 AURORA - PULL SECRETS PROTOCOL INICIADO...');
  
  if (!fs.existsSync(ENV_FILE)) {
    fs.writeFileSync(ENV_FILE, '# .env.local generado por Aurora Sync\n');
  }

  for (const key of SECRETS_TO_SYNC) {
    try {
      console.log(`⏳ Obteniendo secret ${key} desde GitHub...`);
      // Nota: gh secret get no existe pero gh api puede servir, 
      // pero gh secret list no da los valores.
      // USAMOS: gh variable get o gh secret list no da valores. 
      // SECRETS NO SE PUEDEN DESCARGAR POR SEGURIDAD DE GITHUB. 
      // SOLO SE PUEDEN SETEAR. 
      
      // ALTERNATIVA PROFESIONAL: Usar gh env para entornos de desarrollo 
      // o un archivo .env.vault (estilo dotenv-vault). 
      
      // Dado que los secrets de acciones no se pueden leer via CLI, 
      // informamos que la sincronización es de SUBIDA (Push) solamente 
      // para despliegues CI/CD. Para AGENTES LOCALES, el Jefe debe 
      // proveer el archivo .env.local inicial.
      
      console.warn(`⚠️ GitHub Secrets son de solo escritura (write-only) por seguridad.`);
      console.warn(`Usa este script para SUBIR (Push) cambios del Jefe al servidor.`);
    } catch (e) { /* ignore */ }
  }
} else {
  console.log('🚀 AURORA - PUSH SECRETS PROTOCOL INICIADO...');
  
  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ ERROR: .env.local no encontrado.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');

    if (SECRETS_TO_SYNC.includes(key) && value) {
      try {
        console.log(`⏳ Sincronizando ${key} con GitHub...`);
        execSync(`gh secret set ${key} --body "${value}"`, { stdio: 'inherit' });
        console.log(`✅ ${key} sincronizado.`);
      } catch (error) {
        console.error(`❌ ERROR al sincronizar ${key}:`, error.message);
      }
    }
  }
}

console.log('🏆 PROTOCOLO DE SECRETOS FINALIZADO.');
