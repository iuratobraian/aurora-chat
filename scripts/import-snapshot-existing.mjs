import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const snapshotDir = path.join(__dirname, '..', '.agent', 'data', 'import', 'snapshot');

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
}

function convexRun(functionName, args) {
  return new Promise((resolve, reject) => {
    const argsJson = JSON.stringify(args);
    const cmd = 'npx';
    const cmdArgs = ['convex', 'run', functionName, argsJson];
    
    const proc = spawn(cmd, cmdArgs, { 
      cwd: process.cwd(),
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || stdout));
      }
    });
    
    proc.on('error', reject);
  });
}

async function runImport() {
  console.log('🔄 Importando snapshot usando funciones existentes...');
  console.log('='.repeat(50));

  let profilesSuccess = 0;
  let profilesErrors = 0;
  let postsSuccess = 0;
  let postsErrors = 0;

  // Import profiles using upsertProfile
  console.log('\n📥 Importando profiles (usando upsertProfile)...');
  const profiles = readJsonl(path.join(snapshotDir, 'profiles', 'documents.jsonl'));
  console.log(`  Total: ${profiles.length} profiles`);
  
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    try {
      await convexRun('profiles:upsertProfile', { 
        userId: p.userId,
        nombre: p.nombre || "",
        usuario: p.usuario || "",
        email: p.email || "",
        avatar: p.avatar || "",
        esPro: p.esPro || false,
        esVerificado: p.esVerificado || false,
        rol: p.rol || "visitante"
      });
      profilesSuccess++;
      if (profilesSuccess <= 3) {
        console.log(`  ✅ ${p.usuario || p.email}`);
      }
    } catch (e) {
      profilesErrors++;
      if (profilesErrors <= 3) {
        console.log(`  ❌ ${p.usuario}: ${e.message.substring(0, 50)}`);
      }
    }
  }
  console.log(`  📊 Perfiles: ${profilesSuccess} ✅ ${profilesErrors} ❌`);

  // Import posts using createPost
  console.log('\n📥 Importando posts (usando createPost)...');
  const posts = readJsonl(path.join(snapshotDir, 'posts', 'documents.jsonl'));
  console.log(`  Total: ${posts.length} posts`);
  
  for (const post of posts) {
    try {
      await convexRun('posts:createPost', {
        titulo: post.titulo || "",
        contenido: post.contenido || "",
        categoria: post.categoria || "General",
        par: post.par || "",
        tipo: post.tipo || "Post",
        imagenUrl: post.imagenUrl || "",
        tags: post.tags || []
      });
      postsSuccess++;
    } catch (e) {
      postsErrors++;
    }
  }
  console.log(`  📊 Posts: ${postsSuccess} ✅ ${postsErrors} ❌`);

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`  Profiles: ${profilesSuccess} ✅ ${profilesErrors} ❌`);
  console.log(`  Posts: ${postsSuccess} ✅ ${postsErrors} ❌`);
  console.log('\n✅ Importación completada!');
}

runImport().catch(console.error);
