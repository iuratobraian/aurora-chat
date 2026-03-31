import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const SOURCE_DEPLOYMENT = 'rapid-rabbit-951';
const SOURCE_TOKEN = 'prod:rapid-rabbit-951|eyJ2MiI6ImZiZTQwODI1MzY0YTQ2YjFhYjcyYWVlNjI1N2M5NTQ5In0=';
const SOURCE_URL = `https://${SOURCE_DEPLOYMENT}.convex.cloud`;

const TABLES_TO_IMPORT = [
  'profiles',
  'posts',
  'communities',
  'communityMembers',
  'achievements',
  'userAchievements',
  'notifications',
  'recursos',
  'videos',
  'ads',
  'referrals',
  'referralCodes',
  'chat',
  'chatChannels',
  'qa',
  'strategies',
  'bookLibrary',
  'strategyPurchases',
  'subscriptions',
  'payments',
  'products',
  'purchases',
  'signals',
  'signal_plans',
  'signal_subscriptions',
  'signal_providers',
  'signal_performance',
  'competitions',
  'competition_participants',
  'trader_verification',
  'prop_firms',
  'subcommunities',
  'subcommunityMembers',
  'subcommunitySubscriptions',
  'token_balances',
  'token_transactions',
  'instagram_accounts',
  'instagram_scheduled_posts',
  'instagram_messages',
  'market_news',
  'economic_calendar',
];

async function convexQuery(deploymentUrl, token, tableName) {
  const response = await fetch(`${deploymentUrl}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      path: tableName,
      args: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Error querying ${tableName}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getTableCount(deploymentUrl, token, tableName) {
  try {
    const response = await fetch(`${deploymentUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        path: tableName,
        args: {},
      }),
    });

    if (!response.ok) return 0;
    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (e) {
    console.log(`  ⚠️ ${tableName}: no accessible or doesn't exist`);
    return 0;
  }
}

async function exportAllTables() {
  console.log('🔄 Exportando datos de:', SOURCE_DEPLOYMENT);
  console.log('='.repeat(50));

  const exportDir = path.join(process.cwd(), '.agent', 'data', 'import', SOURCE_DEPLOYMENT);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const results = {};

  for (const tableName of TABLES_TO_IMPORT) {
    process.stdout.write(`📤 Exportando ${tableName}... `);
    try {
      const data = await convexQuery(SOURCE_URL, SOURCE_TOKEN, tableName);
      const rows = Array.isArray(data) ? data : data?.value || [];
      
      if (rows.length > 0) {
        const filePath = path.join(exportDir, `${tableName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
        console.log(`✅ ${rows.length} registros`);
        results[tableName] = { count: rows.length, file: filePath };
      } else {
        console.log(`⚪ 0 registros`);
        results[tableName] = { count: 0 };
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
      results[tableName] = { error: e.message };
    }
  }

  const summaryPath = path.join(exportDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE EXPORTACIÓN');
  console.log('='.repeat(50));

  let total = 0;
  for (const [table, result] of Object.entries(results)) {
    if (result.count) {
      console.log(`  ${table}: ${result.count} registros`);
      total += result.count;
    } else if (!result.error) {
      console.log(`  ${table}: 0 (vacío)`);
    }
  }
  console.log('─'.repeat(30));
  console.log(`  TOTAL: ${total} registros`);
  console.log('\n📁 Archivos guardados en:', exportDir);
  console.log('\n✅ Exportación completada!');
  console.log('\n➡️  Para importar a este proyecto, ejecuta:');
  console.log(`   node scripts/import-from-convex.mjs --import`);

  return results;
}

async function importToCurrentProject() {
  console.log('🔄 Importando datos al proyecto actual...');
  console.log('='.repeat(50));

  const importDir = path.join(process.cwd(), '.agent', 'data', 'import', SOURCE_DEPLOYMENT);
  
  if (!fs.existsSync(importDir)) {
    console.log('❌ No hay datos exportados. Ejecuta primero sin --import');
    return;
  }

  const summaryPath = path.join(importDir, 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.log('❌ No se encontró summary.json');
    return;
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  console.log('📋 Tablas a importar:');
  for (const [table, data] of Object.entries(summary)) {
    if (data.count > 0) {
      console.log(`  - ${table}: ${data.count} registros`);
    }
  }

  console.log('\n⚠️  NOTA: La importación directa a Convex requiere:');
  console.log('  1. Convex CLI instalado y configurado');
  console.log('  2. Acceso de escritura al proyecto actual');
  console.log('  3. Mutations específicas para cada tabla');
  console.log('\n📝 Los datos exportados están disponibles en:');
  console.log(`   ${importDir}`);
  console.log('\n💡 Para proceder con la importación, necesitas:');
  console.log('   1. Agregar funciones de importación en convex/import.ts');
  console.log('   2. Ejecutar: npx convex run import --from-file <archivo>');
}

const args = process.argv.slice(2);
if (args.includes('--import')) {
  importToCurrentProject();
} else {
  exportAllTables();
}
