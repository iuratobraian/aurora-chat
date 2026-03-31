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
  console.log('🔄 Iniciando importación del snapshot...');
  console.log('='.repeat(50));

  const importResults = {
    profiles: { success: 0, errors: 0 },
    posts: { success: 0, errors: 0 },
    ads: { success: 0, errors: 0 },
    notifications: { success: 0, errors: 0 },
    chat: { success: 0, errors: 0 },
    qa: { success: 0, errors: 0 },
    videos: { success: 0, errors: 0 },
    global_config: { success: 0, errors: 0 },
  };

  // Import profiles
  console.log('\n📥 Importando profiles...');
  const profiles = readJsonl(path.join(snapshotDir, 'profiles', 'documents.jsonl'));
  for (const profile of profiles) {
    try {
      await convexRun('importSnapshot:importProfile', { profileData: profile });
      importResults.profiles.success++;
      console.log(`  ✅ ${profile.usuario || profile.email}`);
    } catch (e) {
      importResults.profiles.errors++;
      console.log(`  ❌ ${profile.usuario}: ${e.message.substring(0, 50)}`);
    }
  }

  // Import posts
  console.log('\n📥 Importando posts...');
  const posts = readJsonl(path.join(snapshotDir, 'posts', 'documents.jsonl'));
  for (const post of posts) {
    try {
      await convexRun('importSnapshot:importPost', { postData: post });
      importResults.posts.success++;
    } catch (e) {
      importResults.posts.errors++;
    }
  }
  console.log(`  ✅ ${posts.length} posts`);

  // Import ads
  console.log('\n📥 Importando ads...');
  const ads = readJsonl(path.join(snapshotDir, 'ads', 'documents.jsonl'));
  for (const ad of ads) {
    try {
      await convexRun('importSnapshot:importAd', { adData: ad });
      importResults.ads.success++;
    } catch (e) {
      importResults.ads.errors++;
    }
  }
  console.log(`  ✅ ${ads.length} ads`);

  // Import notifications
  console.log('\n📥 Importando notifications...');
  const notifications = readJsonl(path.join(snapshotDir, 'notifications', 'documents.jsonl'));
  for (const notif of notifications) {
    try {
      await convexRun('importSnapshot:importNotification', { notifData: notif });
      importResults.notifications.success++;
    } catch (e) {
      importResults.notifications.errors++;
    }
  }
  console.log(`  ✅ ${notifications.length} notifications`);

  // Import chat
  console.log('\n📥 Importando chat...');
  const chat = readJsonl(path.join(snapshotDir, 'chat', 'documents.jsonl'));
  for (const msg of chat) {
    try {
      await convexRun('importSnapshot:importChat', { chatData: msg });
      importResults.chat.success++;
    } catch (e) {
      importResults.chat.errors++;
    }
  }
  console.log(`  ✅ ${chat.length} mensajes`);

  // Import qa
  console.log('\n📥 Importando Q&A...');
  const qa = readJsonl(path.join(snapshotDir, 'qa', 'documents.jsonl'));
  for (const item of qa) {
    try {
      await convexRun('importSnapshot:importQA', { qaData: item });
      importResults.qa.success++;
    } catch (e) {
      importResults.qa.errors++;
    }
  }
  console.log(`  ✅ ${qa.length} Q&A`);

  // Import videos
  console.log('\n📥 Importando videos...');
  const videos = readJsonl(path.join(snapshotDir, 'videos', 'documents.jsonl'));
  for (const video of videos) {
    try {
      await convexRun('importSnapshot:importVideo', { videoData: video });
      importResults.videos.success++;
    } catch (e) {
      importResults.videos.errors++;
    }
  }
  console.log(`  ✅ ${videos.length} videos`);

  // Import global_config
  console.log('\n📥 Importando global_config...');
  const configs = readJsonl(path.join(snapshotDir, 'global_config', 'documents.jsonl'));
  for (const config of configs) {
    try {
      await convexRun('importSnapshot:importGlobalConfig', { configData: config });
      importResults.global_config.success++;
    } catch (e) {
      importResults.global_config.errors++;
    }
  }
  console.log(`  ✅ ${configs.length} configs`);

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(50));
  
  let totalSuccess = 0;
  let totalErrors = 0;
  for (const [table, result] of Object.entries(importResults)) {
    console.log(`  ${table}: ${result.success} ✅ ${result.errors} ❌`);
    totalSuccess += result.success;
    totalErrors += result.errors;
  }
  
  console.log('─'.repeat(30));
  console.log(`  TOTAL: ${totalSuccess} ✅ ${totalErrors} ❌`);
  console.log('\n✅ Importación completada!');
}

runImport().catch(console.error);
