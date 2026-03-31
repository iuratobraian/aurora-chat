import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAIN_DB = join(__dirname, '../../brain/db');
const EMBEDDINGS_STORE = join(BRAIN_DB, 'embeddings-store.jsonl');
const KNOWLEDGE_STORE = join(BRAIN_DB, 'teamwork_knowledge.jsonl');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

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

async function generateEmbedding(text) {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('[SemanticRetriever] Embedding generation failed:', error.message);
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

async function semanticSearch(query, options = {}) {
  const { 
    topK = 5, 
    collections = ['teamwork_knowledge', 'heuristics', 'error_catalog'],
    minSimilarity = 0.3,
    domain = null,
    includeMetadata = true
  } = options;
  
  console.log(`[SemanticRetriever] Searching: "${query}" (topK=${topK})`);
  
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    console.warn('[SemanticRetriever] Failed to generate query embedding, falling back to keyword');
    return keywordSearch(query, { topK, domain });
  }
  
  const results = [];
  
  if (collections.includes('teamwork_knowledge')) {
    const knowledge = loadJsonl(KNOWLEDGE_STORE);
    for (const entry of knowledge) {
      if (domain && entry.domain !== domain) continue;
      
      let embedding = null;
      
      const store = loadJsonl(EMBEDDINGS_STORE);
      const stored = store.find(e => e.id === entry.id);
      
      if (stored?.embedding) {
        embedding = stored.embedding;
      } else {
        const newEmbedding = await generateEmbedding(entry.statement);
        if (newEmbedding) {
          appendJsonl(EMBEDDINGS_STORE, { id: entry.id, embedding: newEmbedding });
          embedding = newEmbedding;
        }
      }
      
      if (embedding) {
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        if (similarity >= minSimilarity) {
          results.push({
            ...entry,
            similarity,
            source: 'teamwork_knowledge'
          });
        }
      }
    }
  }
  
  if (collections.includes('heuristics')) {
    const heuristics = loadJsonl(join(BRAIN_DB, 'heuristics.jsonl'));
    for (const h of heuristics) {
      const embedding = await generateEmbedding(h.statement || h.title);
      if (embedding) {
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        if (similarity >= minSimilarity) {
          results.push({
            ...h,
            similarity,
            source: 'heuristics'
          });
        }
      }
    }
  }
  
  if (collections.includes('error_catalog')) {
    const errors = loadJsonl(join(BRAIN_DB, 'error_catalog.jsonl'));
    for (const err of errors) {
      const embedding = await generateEmbedding(err.statement || err.title);
      if (embedding) {
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        if (similarity >= minSimilarity) {
          results.push({
            ...err,
            similarity,
            source: 'error_catalog'
          });
        }
      }
    }
  }
  
  results.sort((a, b) => b.similarity - a.similarity);
  const top = results.slice(0, topK);
  
  console.log(`[SemanticRetriever] Found ${top.length} results (max similarity: ${top[0]?.similarity?.toFixed(3) || 0})`);
  
  return top.map(r => includeMetadata ? r : { id: r.id, statement: r.statement, similarity: r.similarity });
}

function keywordSearch(query, options = {}) {
  const { topK = 5, domain = null } = options;
  const keywords = query.toLowerCase().split(/\s+/);
  
  const knowledge = loadJsonl(KNOWLEDGE_STORE);
  const scored = knowledge
    .filter(entry => {
      if (domain && entry.domain !== domain) return false;
      const text = `${entry.title || ''} ${entry.statement || ''}`.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    })
    .map(entry => {
      const text = `${entry.title || ''} ${entry.statement || ''}`.toLowerCase();
      const matchCount = keywords.filter(kw => text.includes(kw)).length;
      return { ...entry, score: matchCount / keywords.length, similarity: matchCount / keywords.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  return scored;
}

async function computeEmbeddings(options = {}) {
  const { force = false, batchSize = 10 } = options;
  
  console.log('[SemanticRetriever] Computing embeddings...');
  
  let store = [];
  if (existsSync(EMBEDDINGS_STORE)) {
    store = loadJsonl(EMBEDDINGS_STORE);
  }
  
  const existingIds = new Set(store.map(e => e.id));
  const knowledge = loadJsonl(KNOWLEDGE_STORE);
  
  const newEntries = knowledge.filter(e => !existingIds.has(e.id));
  console.log(`[SemanticRetriever] ${newEntries.length} entries need embeddings`);
  
  let processed = 0;
  for (let i = 0; i < newEntries.length; i += batchSize) {
    const batch = newEntries.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (entry) => {
      const embedding = await generateEmbedding(entry.statement);
      if (embedding) {
        appendJsonl(EMBEDDINGS_STORE, { id: entry.id, embedding });
        processed++;
      }
    }));
    
    if ((i + batchSize) % 50 === 0) {
      console.log(`[SemanticRetriever] Progress: ${processed}/${newEntries.length}`);
    }
  }
  
  console.log(`[SemanticRetriever] Done! Computed ${processed} embeddings`);
  return { processed, total: newEntries.length };
}

async function findSimilar(query, options = {}) {
  const { limit = 5, excludeId = null } = options;
  
  const results = await semanticSearch(query, { ...options, topK: limit + 1 });
  return results.filter(r => r.id !== excludeId).slice(0, limit);
}

function getStats() {
  const knowledge = loadJsonl(KNOWLEDGE_STORE);
  const embeddings = loadJsonl(EMBEDDINGS_STORE);
  
  const embedded = new Set(embeddings.map(e => e.id));
  const needsEmbedding = knowledge.filter(k => !embedded.has(k.id));
  
  return {
    totalKnowledge: knowledge.length,
    totalEmbeddings: embeddings.length,
    embedded: knowledge.length - needsEmbedding.length,
    needsEmbedding: needsEmbedding.length,
    coverage: ((knowledge.length - needsEmbedding.length) / knowledge.length * 100).toFixed(1) + '%'
  };
}

export {
  semanticSearch,
  keywordSearch,
  computeEmbeddings,
  findSimilar,
  cosineSimilarity,
  generateEmbedding,
  getStats
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'search') {
    const query = process.argv.slice(3).join(' ');
    semanticSearch(query, { topK: 10 }).then(results => {
      console.log('\n=== Semantic Search Results ===\n');
      results.forEach((r, i) => {
        console.log(`${i + 1}. [${r.source}] (${(r.similarity * 100).toFixed(1)}%) ${r.id}`);
        console.log(`   ${r.statement || r.title}\n`);
      });
    });
  } else if (command === 'compute') {
    computeEmbeddings({ force: process.argv[3] === '--force' }).then(stats => {
      console.log('\n=== Embedding Computation Complete ===');
      console.log(`Processed: ${stats.processed}/${stats.total}`);
      console.log(`Coverage: ${getStats().coverage}`);
    });
  } else if (command === 'stats') {
    const stats = getStats();
    console.log('\n=== Semantic Retriever Stats ===');
    console.log(`Knowledge entries: ${stats.totalKnowledge}`);
    console.log(`Embeddings: ${stats.totalEmbeddings}`);
    console.log(`Coverage: ${stats.coverage}`);
  } else {
    console.log('Usage:');
    console.log('  node semantic-retriever.mjs search <query>');
    console.log('  node semantic-retriever.mjs compute [--force]');
    console.log('  node semantic-retriever.mjs stats');
  }
}
