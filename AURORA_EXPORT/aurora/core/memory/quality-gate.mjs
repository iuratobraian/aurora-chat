import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAIN_DB = join(__dirname, '../../brain/db');
const KNOWLEDGE_STORE = join(BRAIN_DB, 'teamwork_knowledge.jsonl');
const QUALITY_GATE_LOG = join(BRAIN_DB, 'quality-gate-log.jsonl');

const QUALITY_THRESHOLDS = {
  minStatementLength: 20,
  maxStatementLength: 2000,
  minTitleLength: 5,
  noveltyThreshold: 0.3,
  confidenceMin: 0.3,
  confidenceMax: 1.0
};

const REQUIRED_FIELDS = ['id', 'title', 'statement', 'domain', 'sourceType'];
const VALID_DOMAINS = ['aurora_ops', 'growth', 'security', 'community_product', 'general', 'marketing', 'performance', 'testing'];
const VALID_SOURCE_TYPES = ['agent_log', 'legacy', 'oss_repo', 'activity', 'manual', 'validation'];

function loadJsonl(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, 'utf-8');
  return content.trim().split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function appendJsonl(filePath, entry) {
  writeFileSync(filePath, JSON.stringify(entry) + '\n', { flag: 'a' });
}

function hashEntry(entry) {
  const normalized = `${entry.statement || ''}|${entry.title || ''}|${entry.domain || ''}`.toLowerCase().trim();
  return createHash('sha256').update(normalized).digest('hex');
}

function validateSchema(entry) {
  const errors = [];
  
  for (const field of REQUIRED_FIELDS) {
    if (!entry[field] && field !== 'id') {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (entry.id && typeof entry.id !== 'string') {
    errors.push('id must be a string');
  }
  
  if (entry.title && entry.title.length < QUALITY_THRESHOLDS.minTitleLength) {
    errors.push(`Title too short: ${entry.title.length} chars (min: ${QUALITY_THRESHOLDS.minTitleLength})`);
  }
  
  if (entry.statement) {
    if (entry.statement.length < QUALITY_THRESHOLDS.minStatementLength) {
      errors.push(`Statement too short: ${entry.statement.length} chars (min: ${QUALITY_THRESHOLDS.minStatementLength})`);
    }
    if (entry.statement.length > QUALITY_THRESHOLDS.maxStatementLength) {
      errors.push(`Statement too long: ${entry.statement.length} chars (max: ${QUALITY_THRESHOLDS.maxStatementLength})`);
    }
  }
  
  if (entry.domain && !VALID_DOMAINS.includes(entry.domain)) {
    errors.push(`Invalid domain: ${entry.domain}. Valid: ${VALID_DOMAINS.join(', ')}`);
  }
  
  if (entry.sourceType && !VALID_SOURCE_TYPES.includes(entry.sourceType)) {
    errors.push(`Invalid sourceType: ${entry.sourceType}. Valid: ${VALID_SOURCE_TYPES.join(', ')}`);
  }
  
  if (entry.confidence !== undefined) {
    if (entry.confidence < 0 || entry.confidence > 1) {
      errors.push(`Invalid confidence: ${entry.confidence} (must be 0-1)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function isDuplicate(hash) {
  const existing = loadJsonl(KNOWLEDGE_STORE);
  return existing.some(e => {
    const existingHash = hashEntry(e);
    return existingHash === hash;
  });
}

async function scoreNovelty(entry) {
  const existing = loadJsonl(KNOWLEDGE_STORE);
  const statementWords = new Set((entry.statement || '').toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  if (statementWords.size === 0) return 0;
  
  let maxSimilarity = 0;
  
  for (const e of existing) {
    if (e.domain !== entry.domain) continue;
    
    const existingWords = new Set((e.statement || '').toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const intersection = [...statementWords].filter(w => existingWords.has(w)).length;
    const union = new Set([...statementWords, ...existingWords]).size;
    const similarity = union > 0 ? intersection / union : 0;
    
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }
  
  return 1 - maxSimilarity;
}

function extractKeywords(entry) {
  const text = `${entry.title || ''} ${entry.statement || ''}`.toLowerCase();
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);
  
  const words = text.split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w) && /^[a-z]+$/.test(w))
    .slice(0, 10);
  
  return [...new Set(words)];
}

function detectNoisePatterns(entry) {
  const signals = [];
  const text = `${entry.title || ''} ${entry.statement || ''}`.toLowerCase();
  
  if (text.includes('test test test') || text.match(/(.)\1{4,}/)) {
    signals.push('repetitive_pattern');
  }
  
  if (text.includes('lorem ipsum') || text.includes('placeholder')) {
    signals.push('placeholder_text');
  }
  
  if (text.match(/^[\d\W]+$/)) {
    signals.push('only_numbers_or_symbols');
  }
  
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern) || [];
  if (urls.length > 3) {
    signals.push('too_many_urls');
  }
  
  if (entry.statement && entry.title && entry.statement === entry.title) {
    signals.push('identical_title_statement');
  }
  
  return signals;
}

async function qualityGatedLearn(entry, options = {}) {
  const { skipDuplicateCheck = false, skipNoveltyCheck = false, forceConfidence = null } = options;
  
  const result = {
    id: entry.id || randomUUID(),
    timestamp: new Date().toISOString(),
    qualityGatePassed: false,
    rejected: false,
    flagged: false,
    reason: null,
    details: {}
  };
  
  const schemaValidation = validateSchema(entry);
  if (!schemaValidation.valid) {
    result.rejected = true;
    result.reason = 'invalid_schema';
    result.details = { errors: schemaValidation.errors };
    logQualityGateResult(result, entry);
    return result;
  }
  
  const hash = hashEntry(entry);
  result.details.hash = hash;
  
  if (!skipDuplicateCheck) {
    const duplicate = await isDuplicate(hash);
    if (duplicate) {
      result.rejected = true;
      result.reason = 'duplicate';
      logQualityGateResult(result, entry);
      return result;
    }
  }
  
  const noisePatterns = detectNoisePatterns(entry);
  if (noisePatterns.length > 0) {
    result.flagged = true;
    result.reason = 'noise_detected';
    result.details.noisePatterns = noisePatterns;
  }
  
  let novelty = 0.5;
  if (!skipNoveltyCheck) {
    novelty = await scoreNovelty(entry);
    result.details.novelty = novelty;
    
    if (novelty < QUALITY_THRESHOLDS.noveltyThreshold) {
      result.flagged = true;
      if (!result.reason) {
        result.reason = 'low_novelty';
      }
    }
  }
  
  const confidence = forceConfidence || entry.confidence || 0.7;
  result.details.calibratedConfidence = Math.min(
    Math.max(confidence * novelty, QUALITY_THRESHOLDS.confidenceMin),
    QUALITY_THRESHOLDS.confidenceMax
  );
  
  if (result.rejected) {
    logQualityGateResult(result, entry);
    return result;
  }
  
  result.qualityGatePassed = true;
  
  const finalEntry = {
    ...entry,
    id: result.id,
    hash,
    novelty,
    noisePatterns,
    confidence: result.details.calibratedConfidence,
    qualityGatePassed: true,
    ingestedAt: new Date().toISOString(),
    needsReview: result.flagged,
    reviewReason: result.flagged ? result.reason : null,
    tags: entry.tags || extractKeywords(entry)
  };
  
  appendJsonl(KNOWLEDGE_STORE, finalEntry);
  logQualityGateResult(result, entry);
  
  return result;
}

function logQualityGateResult(result, entry) {
  const logEntry = {
    ...result,
    entryId: entry.id,
    entryDomain: entry.domain,
    entrySourceType: entry.sourceType,
    timestamp: result.timestamp
  };
  appendJsonl(QUALITY_GATE_LOG, logEntry);
}

async function batchProcess(entries, options = {}) {
  const results = {
    accepted: [],
    rejected: [],
    flagged: [],
    summary: {
      total: entries.length,
      accepted: 0,
      rejected: 0,
      flagged: 0
    }
  };
  
  for (const entry of entries) {
    const result = await qualityGatedLearn(entry, options);
    
    if (result.rejected) {
      results.rejected.push({ entry, result });
    } else if (result.flagged) {
      results.flagged.push({ entry, result });
    } else {
      results.accepted.push({ entry, result });
    }
    
    results.summary[result.rejected ? 'rejected' : result.flagged ? 'flagged' : 'accepted']++;
  }
  
  return results;
}

function getQualityStats() {
  const entries = loadJsonl(KNOWLEDGE_STORE);
  const gateLog = loadJsonl(QUALITY_GATE_LOG);
  
  const recentLogs = gateLog.slice(-100);
  const accepted = recentLogs.filter(l => l.qualityGatePassed && !l.needsReview).length;
  const flagged = recentLogs.filter(l => l.needsReview).length;
  const rejected = recentLogs.filter(l => l.rejected).length;
  
  const noiseDetected = recentLogs.filter(l => l.noisePatterns?.length > 0).length;
  const duplicatesDetected = recentLogs.filter(l => l.reason === 'duplicate').length;
  
  return {
    totalEntries: entries.length,
    recentActivity: {
      accepted,
      flagged,
      rejected,
      total: recentLogs.length
    },
    detectionRates: {
      noiseDetection: noiseDetected > 0 ? (noiseDetected / recentLogs.length * 100).toFixed(1) + '%' : '0%',
      duplicateDetection: duplicatesDetected > 0 ? (duplicatesDetected / recentLogs.length * 100).toFixed(1) + '%' : '0%',
      flagRate: recentLogs.length > 0 ? (flagged / recentLogs.length * 100).toFixed(1) + '%' : '0%'
    },
    domains: [...new Set(entries.map(e => e.domain))].filter(Boolean),
    sources: [...new Set(entries.map(e => e.sourceType))].filter(Boolean)
  };
}

async function reviewFlaggedEntries() {
  const entries = loadJsonl(KNOWLEDGE_STORE);
  const flagged = entries.filter(e => e.needsReview);
  
  return flagged.map(e => ({
    id: e.id,
    domain: e.domain,
    reviewReason: e.reviewReason,
    title: e.title,
    statement: e.statement?.slice(0, 200) + (e.statement?.length > 200 ? '...' : ''),
    noisePatterns: e.noisePatterns,
    novelty: e.novelty,
    confidence: e.confidence
  }));
}

export {
  qualityGatedLearn,
  batchProcess,
  validateSchema,
  isDuplicate,
  scoreNovelty,
  extractKeywords,
  detectNoisePatterns,
  getQualityStats,
  reviewFlaggedEntries,
  QUALITY_THRESHOLDS
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'stats') {
    const stats = getQualityStats();
    console.log('\n=== Quality Gate Stats ===');
    console.log(`Total entries: ${stats.totalEntries}`);
    console.log('\nRecent Activity (last 100):');
    console.log(`  Accepted: ${stats.recentActivity.accepted}`);
    console.log(`  Flagged: ${stats.recentActivity.flagged}`);
    console.log(`  Rejected: ${stats.recentActivity.rejected}`);
    console.log('\nDetection Rates:');
    console.log(`  Noise: ${stats.detectionRates.noiseDetection}`);
    console.log(`  Duplicates: ${stats.detectionRates.duplicateDetection}`);
    console.log(`  Flag Rate: ${stats.detectionRates.flagRate}`);
    console.log(`\nDomains: ${stats.domains.join(', ')}`);
    console.log(`Sources: ${stats.sources.join(', ')}`);
  } else if (command === 'review') {
    reviewFlaggedEntries().then(flagged => {
      if (flagged.length === 0) {
        console.log('\n✅ No flagged entries to review!');
      } else {
        console.log(`\n=== ${flagged.length} Flagged Entries ===\n`);
        flagged.forEach((e, i) => {
          console.log(`${i + 1}. [${e.domain}] ${e.reason}`);
          console.log(`   ${e.title}`);
          console.log(`   ${e.statement}\n`);
        });
      }
    });
  } else if (command === 'test') {
    const testEntry = {
      title: 'Test quality gate',
      statement: 'This is a test entry to verify the quality gate is working correctly',
      domain: 'aurora_ops',
      sourceType: 'manual'
    };
    
    qualityGatedLearn(testEntry).then(result => {
      console.log('\n=== Quality Gate Test ===');
      console.log(JSON.stringify(result, null, 2));
    });
  } else {
    console.log('Usage:');
    console.log('  node quality-gate.mjs stats');
    console.log('  node quality-gate.mjs review');
    console.log('  node quality-gate.mjs test');
  }
}
