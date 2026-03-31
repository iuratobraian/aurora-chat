#!/usr/bin/env node
/**
 * BACKUP AUTOMÁTICO DE BASE DE DATOS CONVEX
 * 
 * Uso: node scripts/backup-database.js
 * 
 * Exporta TODAS las tablas a archivos JSON locales
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// Configuración
const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://diligent-wildcat-523.convex.cloud';
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Tablas a exportar
const TABLES = [
  // CRÍTICAS
  'profiles',
  'posts',
  'communities',
  'communityMembers',
  
  // IMPORTANTES
  'strategies',
  'products',
  'payments',
  'subscriptions',
  'signals',
  'courses',
  'academies',
  'classes',
  
  // SECUNDARIAS
  'notifications',
  'ads',
  'adCampaigns',
  'adEvents',
  'achievements',
  'userAchievements',
  'prizes',
  'prizeRedemptions',
  'referrals',
  'backups',
  'moderation',
  'reports',
  'config',
  'global_config',
  'platformConfig',
  'migrationCounters',
];

// Crear directorio de backup
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`[BACKUP] Created backup directory: ${BACKUP_DIR}`);
}

// Función para hacer queries a Convex
function queryConvex(queryName, args = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      functionName: queryName,
      args: args,
    });

    const options = {
      hostname: CONVEX_URL.replace('https://', ''),
      port: 443,
      path: '/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          if (res.statusCode === 200) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.error || responseBody}`));
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Función principal de backup
async function backupDatabase() {
  console.log('[BACKUP] Starting database backup...');
  console.log(`[BACKUP] Convex URL: ${CONVEX_URL}`);
  console.log(`[BACKUP] Backup directory: ${BACKUP_DIR}`);
  console.log(`[BACKUP] Tables to export: ${TABLES.length}`);
  console.log('');

  const backup = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    convexUrl: CONVEX_URL,
    tables: {},
  };

  let successCount = 0;
  let failCount = 0;

  for (const table of TABLES) {
    try {
      console.log(`[BACKUP] Exporting table: ${table}...`);
      
      // Intentar obtener todos los registros de la tabla
      // Nota: Esto es una simplificación - en producción habría que paginar
      const result = await queryConvex(`${table}:getAll`);
      
      if (Array.isArray(result)) {
        backup.tables[table] = result;
        console.log(`[BACKUP] ✓ ${table}: ${result.length} records`);
        successCount++;
      } else {
        console.log(`[BACKUP] ⚠ ${table}: Unexpected result type`);
        backup.tables[table] = [];
        failCount++;
      }
    } catch (error) {
      console.error(`[BACKUP] ✗ ${table} failed: ${error.message}`);
      backup.tables[table] = [];
      failCount++;
    }
  }

  console.log('');
  console.log(`[BACKUP] Summary:`);
  console.log(`[BACKUP]   Success: ${successCount}/${TABLES.length}`);
  console.log(`[BACKUP]   Failed: ${failCount}/${TABLES.length}`);

  // Guardar backup completo
  const backupFile = path.join(BACKUP_DIR, `backup-full-${TIMESTAMP}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`[BACKUP] Saved: ${backupFile}`);
  console.log(`[BACKUP] Size: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);

  // Guardar backup por tablas individuales
  for (const [tableName, records] of Object.entries(backup.tables)) {
    const tableFile = path.join(BACKUP_DIR, `backup-${tableName}-${TIMESTAMP}.json`);
    fs.writeFileSync(tableFile, JSON.stringify(records, null, 2));
  }
  console.log(`[BACKUP] Saved individual table files`);

  // Crear archivo de resumen
  const summaryFile = path.join(BACKUP_DIR, `backup-summary-${TIMESTAMP}.txt`);
  const summary = `
BACKUP SUMMARY
==============
Date: ${new Date().toISOString()}
Convex URL: ${CONVEX_URL}
Total Tables: ${TABLES.length}
Success: ${successCount}
Failed: ${failCount}

Tables Exported:
${Object.entries(backup.tables).map(([name, records]) => `  - ${name}: ${Array.isArray(records) ? records.length : 0} records`).join('\n')}

Files Generated:
  - backup-full-${TIMESTAMP}.json (complete backup)
  - backup-TABLE-${TIMESTAMP}.json (individual tables)
`.trim();

  fs.writeFileSync(summaryFile, summary);
  console.log(`[BACKUP] Summary: ${summaryFile}`);

  console.log('');
  console.log('[BACKUP] Complete! ✅');

  return {
    success: failCount === 0,
    backupFile,
    summaryFile,
    successCount,
    failCount,
  };
}

// Ejecutar backup
backupDatabase()
  .then((result) => {
    if (!result.success) {
      console.warn('[BACKUP] Completed with warnings');
      process.exit(1);
    } else {
      console.log('[BACKUP] All tables exported successfully');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('[BACKUP] Fatal error:', error.message);
    process.exit(1);
  });
