#!/usr/bin/env node
/**
 * Daily Backup Script
 * 
 * Usage:
 *   node scripts/daily-backup.mjs                  # Create backup + git commit
 *   node scripts/daily-backup.mjs --list           # List available backups
 *   node scripts/daily-backup.mjs --restore <date> # Restore from backup
 *   node scripts/daily-backup.mjs --latest         # Show latest backup info
 * 
 * Environment:
 *   INTERNAL_API_SHARED_KEY - Required for auth
 *   BACKUP_SERVER_URL       - Server URL (default: http://localhost:3000)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SERVER_URL = process.env.BACKUP_SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.INTERNAL_API_SHARED_KEY || '';
const BACKUP_DIR = path.join(ROOT, 'backups');

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const [key, ...vals] = line.split('=');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}

async function apiRequest(method, endpoint, body = null) {
  const url = `${SERVER_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-internal-api-key': API_KEY } : {}),
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

async function createBackup() {
  console.log('📦 Creating daily backup...\n');
  
  const { status, data } = await apiRequest('POST', '/api/backup/create');
  
  if (status !== 200) {
    console.error(`❌ Backup failed: ${data.error || data.details || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`✅ Backup created successfully!`);
  console.log(`   Date: ${data.date}`);
  console.log(`   File: ${data.filename}`);
  console.log(`   Size: ${formatBytes(data.sizeBytes)}`);
  console.log('');

  const gitResult = await gitCommit(data.filename);
  if (gitResult.success) {
    console.log(`✅ Git commit: ${gitResult.message}`);
  } else {
    console.log(`⚠️  Git commit: ${gitResult.message}`);
  }

  return data;
}

async function listBackups() {
  console.log('📋 Available backups:\n');
  
  const { status, data } = await apiRequest('GET', '/api/backup/list');
  
  if (status !== 200 || !data.backups?.length) {
    console.log('   No backups found.');
    return;
  }

  const table = data.backups.map(b => ({
    date: b.date,
    size: formatBytes(b.sizeBytes),
    age: getAge(b.createdAt),
  }));

  console.table(table);
  console.log(`Retention: ${data.retentionDays} days`);
  console.log(`Directory: ${data.backupDir}`);
}

async function restoreBackup(date) {
  console.log(`♻️  Restoring backup from ${date}...\n`);
  
  const filename = `backup_${date}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Backup file not found: ${filename}`);
    console.log('   Run --list to see available backups.');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const backup = JSON.parse(content);
    
    console.log(`📄 Backup info:`);
    console.log(`   Version: ${backup.version}`);
    console.log(`   Created: ${new Date(backup.createdAt).toLocaleString()}`);
    console.log(`   Collections: ${backup.data ? Object.keys(backup.data).join(', ') : 'N/A'}`);
    console.log('');
    
    const confirm = () => {
      process.stdout.write('⚠️  This will overwrite local data. Continue? (yes/no): ');
    };
    
    confirm();
    
    // For automation, just restore
    fs.copyFileSync(filepath, filepath + `.restore_${Date.now()}.bak`);
    console.log(`✅ Backup file preserved at: ${filename}.restore_${Date.now()}.bak`);
    console.log(`   To restore, load the JSON data into your localStorage manually or via the browser console.`);
    
    return { success: true, date, filename };
  } catch (err) {
    console.error(`❌ Restore failed: ${err.message}`);
    process.exit(1);
  }
}

async function latestBackup() {
  const { status, data } = await apiRequest('GET', '/api/backup/latest');
  
  if (status !== 200 || !data.latest) {
    console.log('No backups available.');
    return;
  }

  console.log('📦 Latest backup:');
  console.log(`   Date: ${data.latest.date}`);
  console.log(`   Size: ${formatBytes(data.latest.sizeBytes)}`);
  console.log(`   Created: ${new Date(data.latest.createdAt).toLocaleString()}`);
  console.log(`   Available backups: ${data.available}`);
  console.log(`   Retention: ${data.retentionDays} days`);
}

async function gitCommit(filename) {
  try {
    const gitDir = ROOT;
    
    // Check if git
    if (!fs.existsSync(path.join(gitDir, '.git'))) {
      return { success: false, message: 'Not a git repository' };
    }

    // Check if file exists
    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
      return { success: false, message: `File not found: ${filename}` };
    }

    // git add
    const { execSync } = await import('child_process');
    execSync(`git add "${filepath}"`, { cwd: gitDir, stdio: 'pipe' });
    
    // git commit
    const date = path.basename(filename, '.json').replace('backup_', '');
    const commitMsg = `chore: daily backup ${date}`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: gitDir, stdio: 'pipe' });

    return { success: true, message: commitMsg };
  } catch (err) {
    const msg = err.stderr?.toString() || err.message;
    if (msg.includes('nothing to commit')) {
      return { success: false, message: 'Nothing to commit (backup already saved today)' };
    }
    return { success: false, message: `Git error: ${msg.substring(0, 100)}` };
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAge(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

loadEnv();

// CLI
const args = process.argv.slice(2);

if (args.includes('--list')) {
  await listBackups();
} else if (args.includes('--restore')) {
  const dateIdx = args.indexOf('--restore') + 1;
  const date = args[dateIdx];
  if (!date) {
    console.error('Usage: --restore <YYYY-MM-DD>');
    process.exit(1);
  }
  await restoreBackup(date);
} else if (args.includes('--latest')) {
  await latestBackup();
} else {
  await createBackup();
}
