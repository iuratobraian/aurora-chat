#!/usr/bin/env node
import { Client } from "@notionhq/client";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_API_KEY });

async function clearAllTasks() {
  console.log('🗑️  Limpiando todas las tareas de Notion...\n');
  console.log(`Database: ${NOTION_DATABASE_ID}\n`);

  // Fetch all pages in the database
  let allPages = [];
  let hasMore = true;
  let cursor = undefined;

  while (hasMore) {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
      }),
    });

    const data = await response.json();
    allPages = allPages.concat(data.results);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  console.log(`📋 Encontradas ${allPages.length} tareas en la base de datos\n`);

  if (allPages.length === 0) {
    console.log('✅ No hay tareas que eliminar. La base de datos está limpia.');
    return;
  }

  // Show what will be deleted
  console.log('📝 Tareas a eliminar:');
  allPages.forEach((page, i) => {
    const title = page.properties?.Name?.title?.[0]?.plain_text || 'Untitled';
    const status = page.properties?.Status?.select?.name || 'Sin estado';
    const type = page.properties?.Type?.select?.name || '-';
    console.log(`  ${i + 1}. [${status}] ${title} (${type})`);
  });

  console.log('\n⚠️  Todas estas tareas serán archivadas (no eliminadas permanentemente).\n');

  // Archive all pages (set archived: true)
  let deleted = 0;
  let errors = 0;

  for (const page of allPages) {
    try {
      await notion.pages.update({
        page_id: page.id,
        archived: true,
      });
      deleted++;
      process.stdout.write(`\r  Progreso: ${deleted}/${allPages.length}`);
    } catch (err) {
      errors++;
      console.error(`\n  ❌ Error archivando página ${page.id}: ${err.message}`);
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  ✅ Limpieza completada                  ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  📊 Resumen:`);
  console.log(`     - Archivadas: ${deleted}`);
  console.log(`     - Errores: ${errors}`);
  console.log(`     - Total: ${allPages.length}`);
  console.log('\n  Las tareas fueron archivadas, no eliminadas permanentemente.');
  console.log('  Puedes recuperarlas desde la papelera de Notion si es necesario.\n');
}

clearAllTasks().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
