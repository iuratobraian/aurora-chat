import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAIN_DB = join(__dirname, '../../brain/db');
const KNOWLEDGE_STORE = join(BRAIN_DB, 'teamwork_knowledge.jsonl');
const VALIDATION_LOG = join(BRAIN_DB, 'validation-log.jsonl');
const VALIDATED_STORE = join(BRAIN_DB, 'validated-knowledge.jsonl');

function loadJsonl(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, 'utf-8');
  return content.trim().split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function saveJsonl(filePath, entries) {
  const content = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
  writeFileSync(filePath, content, 'utf-8');
}

function appendJsonl(filePath, entry) {
  writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a' });
}

async function checkFilesExist(relatedFiles) {
  if (!relatedFiles || relatedFiles.length === 0) return { checked: true, existing: [], missing: [] };
  
  const existing = [];
  const missing = [];
  
  for (const file of relatedFiles) {
    const normalized = file.replace(/^\.?\/?/, '');
    const patterns = [
      normalized,
      `**/${normalized}`,
      `views/${normalized}`,
      `convex/${normalized}`,
      `lib/${normalized}`
    ];
    
    let found = false;
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: join(__dirname, '../../..') });
      if (matches.length > 0) {
        found = true;
        existing.push(file);
        break;
      }
    }
    
    if (!found) {
      missing.push(file);
    }
  }
  
  return { checked: true, existing, missing };
}

async function verifyStatement(entry) {
  const statement = (entry.statement || '').toLowerCase();
  const title = (entry.title || '').toLowerCase();
  const text = `${title} ${statement}`;
  
  if (text.includes('tsconfig') || text.includes('typescript')) {
    const tsconfig = join(__dirname, '../../../tsconfig.json');
    if (existsSync(tsconfig)) {
      const content = readFileSync(tsconfig, 'utf-8');
      if (text.includes('esnext') && content.includes('"module": "esnext"')) {
        return { valid: true, confidence: 0.9 };
      }
    }
  }
  
  if (text.includes('convex')) {
    const convexFiles = await glob('convex/**/*.ts', { cwd: join(__dirname, '../../../') });
    if (convexFiles.length > 0) {
      return { valid: true, confidence: 0.8 };
    }
  }
  
  if (text.includes('vitest') || text.includes('test')) {
    const testFiles = await glob('__tests__/**/*.test.ts', { cwd: join(__dirname, '../../../') });
    if (testFiles.length > 0) {
      return { valid: true, confidence: 0.8 };
    }
  }
  
  if (text.includes('security') || text.includes('auth')) {
    const authFiles = await glob('convex/**/auth*.ts', { cwd: join(__dirname, '../../../') });
    if (authFiles.length > 0) {
      return { valid: true, confidence: 0.85 };
    }
  }
  
  return { valid: true, confidence: 0.5, reason: 'Generic statement, manual review recommended' };
}

function calculateConfidence(filesExist, statementValid) {
  let confidence = statementValid.confidence || 0.5;
  
  if (filesExist.missing.length > 0) {
    confidence *= (1 - filesExist.missing.length * 0.1);
  }
  
  if (filesExist.existing.length > 0) {
    confidence *= 1.1;
    if (confidence > 1) confidence = 1;
  }
  
  return Math.max(0, Math.min(1, confidence));
}

function extractRelatedFiles(entry) {
  const text = `${entry.title || ''} ${entry.statement || ''}`;
  const filePatterns = [
    /views\/[\w-/]+\.tsx?/gi,
    /convex\/[\w-/]+\.ts/gi,
    /lib\/[\w-/]+\.(ts|js)/gi,
    /server\.ts/gi,
    /App\.tsx/gi
  ];
  
  const files = [];
  for (const pattern of filePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      files.push(...matches);
    }
  }
  
  return [...new Set(files)];
}

async function validateKnowledgeEntry(entry) {
  const relatedFiles = extractRelatedFiles(entry);
  const filesExist = await checkFilesExist(relatedFiles);
  const statementValid = await verifyStatement(entry);
  const confidence = calculateConfidence(filesExist, statementValid);
  
  let status = 'validated';
  let needsReview = false;
  
  if (confidence < 0.5) {
    status = 'low_confidence';
    needsReview = true;
  }
  
  if (filesExist.missing.length > relatedFiles.length * 0.5) {
    status = 'files_missing';
    needsReview = true;
  }
  
  if (statementValid.reason) {
    needsReview = true;
  }
  
  return {
    id: entry.id,
    validated: true,
    validatedAt: new Date().toISOString(),
    confidence,
    status,
    needsReview,
    filesExist,
    statementValid,
    warnings: [
      ...filesExist.missing.map(f => `File not found: ${f}`),
      ...(statementValid.reason ? [statementValid.reason] : [])
    ]
  };
}

async function validateKnowledge(options = {}) {
  const { minConfidence = 0, domains = null, force = false, batchSize = 10 } = options;
  
  console.log('[KnowledgeValidator] Starting validation...');
  
  let entries = loadJsonl(KNOWLEDGE_STORE);
  
  if (domains) {
    entries = entries.filter(e => domains.includes(e.domain));
  }
  
  const alreadyValidated = new Set();
  if (!force) {
    const validated = loadJsonl(VALIDATED_STORE);
    validated.forEach(v => alreadyValidated.add(v.id));
    entries = entries.filter(e => !alreadyValidated.has(e.id));
  }
  
  console.log(`[KnowledgeValidator] ${entries.length} entries to validate`);
  
  const results = {
    validated: [],
    needs_review: [],
    low_confidence: [],
    outdated: []
  };
  
  let processed = 0;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(batch.map(async (entry) => {
      try {
        return await validateKnowledgeEntry(entry);
      } catch (error) {
        return {
          id: entry.id,
          validated: false,
          error: error.message,
          needsReview: true
        };
      }
    }));
    
    for (const result of batchResults) {
      processed++;
      
      const validatedEntry = {
        ...result,
        ...entries.find(e => e.id === result.id)
      };
      
      if (result.error) {
        results.needs_review.push(validatedEntry);
      } else if (result.confidence < 0.3) {
        results.low_confidence.push(validatedEntry);
      } else if (result.needsReview) {
        results.needs_review.push(validatedEntry);
      } else {
        results.validated.push(validatedEntry);
      }
      
      appendJsonl(VALIDATION_LOG, {
        ...result,
        validatedAt: new Date().toISOString()
      });
      
      appendJsonl(VALIDATED_STORE, validatedEntry);
    }
    
    if ((i + batchSize) % 50 === 0) {
      console.log(`[KnowledgeValidator] Progress: ${processed}/${entries.length}`);
    }
  }
  
  console.log(`\n[KnowledgeValidator] Validation complete!`);
  console.log(`  Validated: ${results.validated.length}`);
  console.log(`  Needs review: ${results.needs_review.length}`);
  console.log(`  Low confidence: ${results.low_confidence.length}`);
  
  return results;
}

function getValidationStats() {
  const entries = loadJsonl(KNOWLEDGE_STORE);
  const validated = loadJsonl(VALIDATED_STORE);
  const validationLog = loadJsonl(VALIDATION_LOG);
  
  const validatedIds = new Set(validated.map(v => v.id));
  
  const coverage = entries.length > 0 
    ? (validatedIds.size / entries.length * 100).toFixed(1) + '%' 
    : '0%';
  
  const avgConfidence = validated.length > 0
    ? (validated.reduce((sum, v) => sum + (v.confidence || 0), 0) / validated.length * 100).toFixed(1) + '%'
    : '0%';
  
  const needsReview = validated.filter(v => v.needsReview).length;
  const lowConfidence = validated.filter(v => v.confidence < 0.5).length;
  
  return {
    totalEntries: entries.length,
    validated: validated.length,
    coverage,
    avgConfidence,
    needsReview,
    lowConfidence,
    lastValidation: validationLog.length > 0 
      ? validationLog[validationLog.length - 1].validatedAt 
      : null
  };
}

async function reviewEntries(options = {}) {
  const { minConfidence = 0.5, domains = null } = options;
  
  const validated = loadJsonl(VALIDATED_STORE);
  let toReview = validated.filter(v => v.needsReview || v.confidence < minConfidence);
  
  if (domains) {
    toReview = toReview.filter(e => domains.includes(e.domain));
  }
  
  return toReview.map(v => ({
    id: v.id,
    title: v.title,
    domain: v.domain,
    confidence: v.confidence,
    status: v.status,
    warnings: v.warnings,
    statement: v.statement?.slice(0, 150) + (v.statement?.length > 150 ? '...' : '')
  }));
}

function generateValidationReport() {
  const stats = getValidationStats();
  const validated = loadJsonl(VALIDATED_STORE);
  const needsReview = validated.filter(v => v.needsReview);
  
  const report = {
    generatedAt: new Date().toISOString(),
    summary: stats,
    byDomain: {},
    recommendations: []
  };
  
  for (const v of validated) {
    if (!report.byDomain[v.domain]) {
      report.byDomain[v.domain] = { total: 0, validated: 0, needsReview: 0, avgConfidence: 0 };
    }
    report.byDomain[v.domain].total++;
    if (!v.needsReview) report.byDomain[v.domain].validated++;
    if (v.needsReview) report.byDomain[v.domain].needsReview++;
    report.byDomain[v.domain].avgConfidence += v.confidence || 0;
  }
  
  for (const domain of Object.keys(report.byDomain)) {
    const d = report.byDomain[domain];
    d.avgConfidence = d.total > 0 ? (d.avgConfidence / d.total * 100).toFixed(1) + '%' : '0%';
    d.coverage = (d.validated / d.total * 100).toFixed(1) + '%';
  }
  
  if (stats.coverage < '80%') {
    report.recommendations.push({
      priority: 'high',
      action: 'Increase validation coverage',
      current: stats.coverage,
      target: '80%'
    });
  }
  
  if (stats.avgConfidence < '70%') {
    report.recommendations.push({
      priority: 'medium',
      action: 'Review low-confidence entries',
      count: stats.lowConfidence
    });
  }
  
  if (needsReview.length > 10) {
    report.recommendations.push({
      priority: 'medium',
      action: 'Review flagged entries',
      count: needsReview.length
    });
  }
  
  return report;
}

export {
  validateKnowledge,
  validateKnowledgeEntry,
  checkFilesExist,
  verifyStatement,
  getValidationStats,
  reviewEntries,
  generateValidationReport
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'validate') {
    const options = {
      force: process.argv.includes('--force'),
      minConfidence: parseFloat(process.argv.find(a => a.startsWith('--min='))?.split('=')[1] || '0')
    };
    
    validateKnowledge(options).then(results => {
      console.log('\n=== Validation Complete ===');
      console.log(`Total validated: ${results.validated.length}`);
      console.log(`Needs review: ${results.needs_review.length}`);
    });
  } else if (command === 'stats') {
    const stats = getValidationStats();
    console.log('\n=== Validation Stats ===');
    console.log(`Total entries: ${stats.totalEntries}`);
    console.log(`Validated: ${stats.validated}`);
    console.log(`Coverage: ${stats.coverage}`);
    console.log(`Avg confidence: ${stats.avgConfidence}`);
    console.log(`Needs review: ${stats.needsReview}`);
    console.log(`Low confidence: ${stats.lowConfidence}`);
  } else if (command === 'report') {
    const report = generateValidationReport();
    console.log('\n=== Validation Report ===');
    console.log(JSON.stringify(report, null, 2));
  } else if (command === 'review') {
    reviewEntries().then(entries => {
      if (entries.length === 0) {
        console.log('\n✅ No entries need review!');
      } else {
        console.log(`\n=== ${entries.length} Entries to Review ===\n`);
        entries.forEach((e, i) => {
          console.log(`${i + 1}. [${e.domain}] ${e.title}`);
          console.log(`   Confidence: ${(e.confidence * 100).toFixed(0)}%`);
          console.log(`   ${e.warnings?.join(', ') || 'No warnings'}\n`);
        });
      }
    });
  } else {
    console.log('Usage:');
    console.log('  node knowledge-validator.mjs validate [--force] [--min=0.5]');
    console.log('  node knowledge-validator.mjs stats');
    console.log('  node knowledge-validator.mjs report');
    console.log('  node knowledge-validator.mjs review');
  }
}
