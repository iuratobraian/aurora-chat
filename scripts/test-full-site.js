#!/usr/bin/env node
/**
 * Test Automático de TradeShare
 * 
 * Ejecuta tests E2E sin framework de tests
 * Uso: node scripts/test-full-site.js
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const BASE_URL = 'https://tradeportal-2025-platinum.vercel.app';
const RESULTS_FILE = join(__dirname, '..', 'test-results-manual.json');

// Resultados
const results = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  }
};

async function runTest(name, testFn) {
  results.summary.total++;
  console.log(`\n[TEST ${results.summary.total}] ${name}...`);
  
  try {
    await testFn();
    results.summary.passed++;
    results.tests.push({ name, status: '✅ PASSED' });
    console.log(`✅ ${name} OK`);
    return true;
  } catch (error) {
    results.summary.failed++;
    results.tests.push({ name, status: '❌ FAILED', error: error.message });
    console.log(`❌ ${name} FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   TRADESHARE - TEST AUTOMÁTICO                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 URL: ${BASE_URL}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Configurar console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Page error: ${msg.text()}`);
    }
  });
  
  page.on('requestfailed', request => {
    console.log(`❌ Request failed: ${request.url()}`);
  });
  
  // TEST 1: Homepage
  await runTest('Homepage carga', async () => {
    const response = await page.goto(BASE_URL);
    if (response.status() !== 200) {
      throw new Error(`Status ${response.status()}`);
    }
    
    const title = await page.title();
    if (!title.match(/TradeHub|TradeShare/i)) {
      throw new Error(`Título incorrecto: ${title}`);
    }
    
    const root = await page.$('#root');
    if (!root) {
      throw new Error('Root div no encontrada');
    }
    
    console.log(`📄 Título: ${title}`);
  });
  
  // TEST 2: Assets
  await runTest('Assets cargan', async () => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    if (failedRequests.length > 0) {
      throw new Error(`${failedRequests.length} assets fallaron`);
    }
    
    console.log('✅ Todos los assets cargaron');
  });
  
  // TEST 3: Comunidad
  await runTest('Comunidad carga', async () => {
    const response = await page.goto(`${BASE_URL}/comunidad`);
    if (response.status() !== 200) {
      throw new Error(`Status ${response.status()}`);
    }
    
    await page.waitForTimeout(5000);
    
    const url = page.url();
    console.log(`📄 URL: ${url}`);
    
    const content = await page.$('body');
    if (!content) {
      throw new Error('Contenido no encontrado');
    }
    
    console.log('✅ Comunidad OK');
  });
  
  // TEST 4: Navegación
  await runTest('Navegación entre páginas', async () => {
    const pages = [
      ['Home', '/'],
      ['Comunidad', '/comunidad'],
      ['Señales', '/senales'],
      ['Noticias', '/noticias'],
      ['Marketplace', '/marketplace'],
    ];
    
    for (const [name, path] of pages) {
      const response = await page.goto(`${BASE_URL}${path}`);
      await page.waitForTimeout(2000);
      
      const status = response.status() === 200 ? '✅' : '⚠️';
      console.log(`${status} ${name}: ${response.status()}`);
      
      if (response.status() !== 200) {
        throw new Error(`${name} falló con status ${response.status()}`);
      }
    }
    
    console.log('✅ Navegación OK');
  });
  
  // TEST 5: Performance
  await runTest('Performance de carga', async () => {
    const start = Date.now();
    await page.goto(BASE_URL);
    const loadTime = Date.now() - start;
    
    console.log(`⏱️ Tiempo de carga: ${loadTime}ms`);
    
    if (loadTime > 10000) {
      throw new Error(`Performance lenta: ${loadTime}ms`);
    }
    
    console.log('✅ Performance OK');
  });
  
  // TEST 6: Sin errores de JavaScript
  await runTest('Sin errores de JS', async () => {
    const errors = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(5000);
    
    if (errors.length > 0) {
      throw new Error(`${errors.length} errores de JS: ${errors[0]}`);
    }
    
    console.log('✅ Sin errores de JS');
  });
  
  // TEST 7: Mobile responsive
  await runTest('Mobile responsive', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    const root = await page.$('#root');
    if (!root) {
      throw new Error('Root no visible en mobile');
    }
    
    console.log('✅ Mobile responsive OK');
  });
  
  // TEST 8: Security headers
  await runTest('Security headers', async () => {
    const response = await page.goto(BASE_URL);
    const headers = response.headers();
    
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ];
    
    const missing = requiredHeaders.filter(h => !headers[h]);
    
    if (missing.length > 0) {
      throw new Error(`Headers faltantes: ${missing.join(', ')}`);
    }
    
    console.log('✅ Security headers presentes');
  });
  
  await browser.close();
  
  // Guardar resultados
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  
  // Resumen final
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   RESUMEN DE TESTS                                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nTotal: ${results.summary.total}`);
  console.log(`✅ Pasaron: ${results.summary.passed}`);
  console.log(`❌ Fallaron: ${results.summary.failed}`);
  console.log(`\n📊 Resultados guardados en: ${RESULTS_FILE}`);
  
  if (results.summary.failed === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Algunos tests fallaron');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
