import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(__dirname, '..', '.agent', 'data', 'export', 'notable-sandpiper-279');

const DEPLOYMENT_URL = 'https://notable-sandpiper-279.convex.cloud';

const TABLES = [
  'profiles',
  'posts',
  'communities',
  'communityMembers',
  'notifications',
  'ads',
  'chat',
  'chatChannels',
  'qa',
  'videos',
  'recursos',
  'global_config',
];

async function queryTable(tableName) {
  try {
    const response = await fetch(`${DEPLOYMENT_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: tableName, args: {} }),
    });
    if (!response.ok) {
      console.log(`  ⚠️ ${tableName}: ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (e) {
    console.log(`  ❌ ${tableName}: ${e.message}`);
    return [];
  }
}

async function exportTables() {
  console.log('🔄 Exportando datos de notable-sandpiper-279...');
  console.log('='.repeat(50));

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const results = {};

  for (const table of TABLES) {
    process.stdout.write(`📤 Exportando ${table}... `);
    const data = await queryTable(table);
    const rows = Array.isArray(data) ? data : data?.value || [];
    
    if (rows.length > 0) {
      const filePath = path.join(exportDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
      console.log(`✅ ${rows.length} registros`);
      results[table] = { count: rows.length, file: filePath };
    } else {
      console.log(`⚪ 0 registros`);
      results[table] = { count: 0 };
    }
  }

  const summaryPath = path.join(exportDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log('\n✅ Exportación completada!');
  console.log('📁 Archivos en:', exportDir);
}

exportTables().catch(console.error);
