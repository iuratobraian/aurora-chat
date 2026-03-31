#!/usr/bin/env node
import { notionSync } from './aurora-notion-sync.mjs';

const TASK_STATUS_MAP = {
  'done': 'Listo',
  'in_progress': 'En Progreso',
  'claimed': 'En Progreso',
  'unassigned': 'Sin empezar',
  'cancelled': 'Cancelado'
};

const TASK_PATTERNS = [
  { name: 'TV Bug', keywords: ['TV Bitacora', 'TV Bug', 'YouTube link'] },
  { name: 'Global Styling', keywords: ['Global Styling', 'outline icons', 'business avatars'] },
  { name: 'Bitácora', keywords: ['Bitácora Native', 'User Profiles', 'Stitch'] },
  { name: 'Señales', keywords: ['Señales', 'Trading', 'Bull/Bear', 'Dynamic background'] },
  { name: 'Noticias', keywords: ['Noticias', 'newspaper', 'Economic Calendar'] },
  { name: 'Premios', keywords: ['Premios', 'Ranking', 'token prize'] },
  { name: 'Ads Engine', keywords: ['Ads Engine', 'rotating banners', 'Top Feed'] },
  { name: 'Bottom Controls', keywords: ['Bottom Controls', 'floating Menu', 'routing'] },
  { name: 'Suscripciones', keywords: ['Suscripciones', 'Pricing', 'Top 3 Communities'] },
  { name: 'Top Menu', keywords: ['Top menu', 'Psicotrading', 'Cursos', 'Voz IA'] },
  { name: 'AdminView', keywords: ['AdminView', 'floating AI', 'full-width'] },
  { name: 'Navigation', keywords: ['Navigation', 'floating AI icons', 'top right'] },
  { name: 'Architecture', keywords: ['architecture', 'TASK_BOARD'] },
];

async function syncAll() {
  const status = await notionSync.checkConnection();
  if (!status.connected) {
    console.log('❌ Notion not connected:', status.reason);
    return { synced: 0, failed: 0 };
  }
  
  console.log('🔄 Auto-syncing task statuses to Notion...\n');
  
  const pages = await notionSync.searchPages('');
  let synced = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const page of pages) {
    const pageId = page.id;
    const currentStatus = page.properties?.status?.status?.name;
    
    if (currentStatus === 'Listo') {
      skipped++;
      continue;
    }
    
    const title = page.properties?.Nombre?.title?.[0]?.plain_text || 
                  page.properties?.title?.[0]?.plain_text || 
                  'Untitled';
    
    let matched = false;
    for (const pattern of TASK_PATTERNS) {
      for (const keyword of pattern.keywords) {
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          try {
            await notionSync.updateTaskStatus(pageId, 'Listo', 'OpenCode Agent');
            console.log(`✅ Synced: "${title.substring(0, 50)}..."`);
            synced++;
            matched = true;
          } catch (err) {
            console.log(`⚠️ Failed: "${title.substring(0, 40)}" - ${err.message}`);
            failed++;
          }
          break;
        }
      }
      if (matched) break;
    }
    
    if (!matched && title !== 'Untitled') {
      console.log(`⏭️ Skipped (no pattern match): "${title.substring(0, 40)}..."`);
    }
  }
  
  console.log(`\n✨ Sync complete!`);
  console.log(`   ✅ Synced: ${synced}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️ Skipped: ${skipped}`);
  
  return { synced, failed, skipped };
}

syncAll().then(result => {
  process.exit(result.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
