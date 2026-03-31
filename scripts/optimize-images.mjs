#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts large images in public/ to WebP format
 * Usage: node scripts/optimize-images.mjs
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');

const MAX_SIZE_KB = 500; // Convert images larger than this
const WEBP_QUALITY = 80;

async function findLargeImages(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findLargeImages(fullPath));
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const stat = await fs.stat(fullPath);
      const sizeKB = stat.size / 1024;
      if (sizeKB > MAX_SIZE_KB) {
        files.push({ path: fullPath, name: entry.name, sizeKB: Math.round(sizeKB) });
      }
    }
  }
  
  return files;
}

async function convertToWebp(filePath) {
  // Check if sharp is available
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('⚠️  sharp not installed. Run: npm install --save-dev sharp');
    return false;
  }
  
  const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  try {
    await sharp(filePath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
    
    const original = await fs.stat(filePath);
    const optimized = await fs.stat(webpPath);
    const savings = ((1 - optimized.size / original.size) * 100).toFixed(1);
    
    console.log(`✅ ${basename(filePath)} (${Math.round(original.size/1024)}KB → ${Math.round(optimized.size/1024)}KB, -${savings}%)`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to convert ${basename(filePath)}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Scanning for large images in public/...\n');
  
  const largeImages = await findLargeImages(PUBLIC);
  
  if (largeImages.length === 0) {
    console.log('✅ No large images found!');
    return;
  }
  
  console.log(`Found ${largeImages.length} image(s) larger than ${MAX_SIZE_KB}KB:\n`);
  
  for (const img of largeImages) {
    console.log(`  📷 ${img.name} - ${img.sizeKB}KB`);
  }
  
  console.log('\n🔄 Converting to WebP...\n');
  
  let converted = 0;
  for (const img of largeImages) {
    const success = await convertToWebp(img.path);
    if (success) converted++;
  }
  
  console.log(`\n📊 Converted ${converted}/${largeImages.length} images to WebP`);
  console.log('\n💡 Next steps:');
  console.log('   1. Update <img> tags to use .webp versions');
  console.log('   2. Consider using <picture> with WebP + fallback');
  console.log('   3. Add loading="lazy" to all non-hero images');
}

main().catch(console.error);
