#!/usr/bin/env node
/**
 * Aurora MCP Research Automation
 * Automatic discovery and integration of new MCPs from mcpmarket.com
 * 
 * Usage: node aurora-mcp-research.mjs
 * 
 * Features:
 * - Scrapes trending MCPs from mcpmarket.com
 * - Analyzes GitHub stats and activity
 * - Proposes integration based on stars, maintenance, and relevance
 * - Updates connectors.json with new findings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESEARCH_SOURCES = {
  mcpmarket: 'https://mcpmarket.com',
  mcpmarket_es: 'https://mcpmarket.com/es',
  mcpmarket_daily: 'https://mcpmarket.com/es/daily',
  github_awesome: 'https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md',
  brightdata_blog: 'https://brightdata.es/blog/ai/best-mcp-servers'
};

const MIN_STARS = 500;
const MIN_UPDATED_MONTHS = 6;

const CONNECTORS_PATH = path.join(__dirname, '../../../aurora/connectors.json');
const KNOWLEDGE_PATH = path.join(__dirname, '../../../brain/db/oss_ai_repos.jsonl');

class MCPresearcher {
  constructor() {
    this.findings = [];
    this.existingConnectors = [];
    this.loadExistingConnectors();
  }

  loadExistingConnectors() {
    try {
      if (fs.existsSync(CONNECTORS_PATH)) {
        const data = JSON.parse(fs.readFileSync(CONNECTORS_PATH, 'utf-8'));
        this.existingConnectors = data.connectors || [];
      }
    } catch (e) {
      console.error('Failed to load existing connectors:', e.message);
    }
  }

  saveFindings() {
    try {
      // Update connectors.json
      const data = JSON.parse(fs.readFileSync(CONNECTORS_PATH, 'utf-8'));
      
      const newConnectors = this.findings.filter(f => 
        !this.existingConnectors.find(e => e.id === f.id)
      );

      if (newConnectors.length > 0) {
        data.connectors = [...data.connectors, ...newConnectors];
        fs.writeFileSync(CONNECTORS_PATH, JSON.stringify(data, null, 2));
        console.log(`\n✓ Added ${newConnectors.length} new MCPs to connectors.json`);
      }

      // Update knowledge base
      const knowledgeEntries = this.findings.map(f => JSON.stringify({
        id: `${f.id}-RESEARCH`,
        title: `MCP Research: ${f.name}`,
        statement: f.uso,
        tags: ['mcp', 'research', 'auto-discovered', f.tipo],
        repo: f.repo,
        stars: f.stars,
        tools: f.herramientas,
        discovered_at: new Date().toISOString()
      }));

      fs.appendFileSync(KNOWLEDGE_PATH, knowledgeEntries.join('\n') + '\n');
      console.log(`✓ Added ${knowledgeEntries.length} entries to knowledge base`);

    } catch (e) {
      console.error('Failed to save findings:', e.message);
    }
  }

  async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Aurora-Nexus-MCP-Research/1.0'
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  parseMCPMarket(html) {
    const mcps = [];
    
    // Extract MCP entries from HTML
    const mcpRegex = /\/server\/([a-z0-9-]+)["']/gi;
    const starsRegex = /stars[\s\S]*?(\d[\d,.]+[Kk]?)/gi;
    
    let match;
    while ((match = mcpRegex.exec(html)) !== null) {
      const slug = match[1];
      if (!mcps.find(m => m.slug === slug)) {
        mcps.push({
          id: slug.replace(/-/g, '_'),
          slug,
          name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          url: `${RESEARCH_SOURCES.mcpmarket}/es/server/${slug}`
        });
      }
    }
    
    return mcps;
  }

  async analyzeGitHub(repo) {
    try {
      const apiUrl = repo.replace('https://github.com/', 'https://api.github.com/repos/');
      const response = await this.fetchWithRetry(apiUrl);
      const data = JSON.parse(response);
      
      const updatedAt = new Date(data.updated_at);
      const monthsSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        lastUpdated: data.updated_at,
        monthsSinceUpdate: Math.round(monthsSinceUpdate),
        isMaintained: monthsSinceUpdate < MIN_UPDATED_MONTHS,
        description: data.description,
        language: data.language,
        topics: data.topics || []
      };
    } catch (e) {
      console.warn(`Failed to analyze ${repo}:`, e.message);
      return null;
    }
  }

  evaluateMCP(mcp, githubData) {
    if (!githubData) return null;
    
    // Calculate score
    let score = 0;
    score += Math.min(githubData.stars / 1000, 50); // Stars (max 50 points)
    score += githubData.isMaintained ? 20 : 0; // Maintenance bonus
    score += githubData.forks > 100 ? 10 : 0; // Community bonus
    score -= githubData.monthsSinceUpdate * 2; // Staleness penalty
    
    const priority = score >= 70 ? 'critica' : score >= 40 ? 'alta' : score >= 20 ? 'media' : 'baja';
    
    return {
      ...mcp,
      stars: githubData.stars,
      forks: githubData.forks,
      lastUpdated: githubData.lastUpdated,
      score: Math.round(score),
      priority,
      readiness: 'research'
    };
  }

  async research() {
    console.log('\n🔬 Aurora MCP Research Automation');
    console.log('═══════════════════════════════════════');
    console.log(`\n📡 Researching from:`);
    console.log(`   • ${RESEARCH_SOURCES.mcpmarket_es}`);
    console.log(`   • ${RESEARCH_SOURCES.github_awesome}`);
    
    console.log('\n⏳ Fetching MCP Market...');
    
    try {
      const html = await this.fetchWithRetry(RESEARCH_SOURCES.mcpmarket_es);
      const mcps = this.parseMCPMarket(html);
      
      console.log(`\n✓ Found ${mcps.length} MCPs on MCPMarket`);
      
      // Filter out existing
      const newMcps = mcps.filter(m => 
        !this.existingConnectors.find(e => e.id === m.id)
      );
      
      console.log(`✓ ${newMcps.length} new MCPs to analyze`);
      
      // Analyze top 10
      const toAnalyze = newMcps.slice(0, 10);
      
      for (const mcp of toAnalyze) {
        console.log(`\n📊 Analyzing: ${mcp.name}`);
        
        const githubData = await this.analyzeGitHub(`https://github.com/${mcp.slug}`);
        
        if (githubData && githubData.stars >= MIN_STARS) {
          const evaluated = this.evaluateMCP(mcp, githubData);
          
          if (evaluated && evaluated.score >= 20) {
            this.findings.push({
              id: evaluated.id,
              tipo: 'auto_discovered',
              prioridad: evaluated.priority,
              uso: evaluated.description || `MCP server: ${evaluated.name}`,
              repo: `https://github.com/${evaluated.slug}`,
              stars: evaluated.stars,
              herramientas: [],
              readiness: 'research',
              score: evaluated.score,
              discovered_at: new Date().toISOString()
            });
            
            console.log(`   ✓ Stars: ${evaluated.stars}, Score: ${evaluated.score}/100`);
          } else {
            console.log(`   ⚠ Score too low: ${evaluated?.score || 0}/100`);
          }
        } else if (githubData) {
          console.log(`   ⚠ Below threshold: ${githubData.stars} stars`);
        } else {
          console.log(`   ⚠ Could not fetch GitHub data`);
        }
        
        await new Promise(r => setTimeout(r, 500)); // Rate limiting
      }
      
    } catch (e) {
      console.error('\n❌ Research failed:', e.message);
    }
  }

  generateReport() {
    console.log('\n\n📋 RESEARCH REPORT');
    console.log('═══════════════════════════════════════');
    
    if (this.findings.length === 0) {
      console.log('\n✓ No new MCPs to integrate (all analyzed, below threshold, or existing)');
      return;
    }

    console.log(`\n🎯 Found ${this.findings.length} MCPs worth integrating:\n`);
    
    // Sort by score
    this.findings.sort((a, b) => b.score - a.score);
    
    this.findings.forEach((mcp, i) => {
      const priorityEmoji = mcp.priority === 'critica' ? '🔴' : 
                           mcp.priority === 'alta' ? '🟡' : '🟢';
      
      console.log(`${i + 1}. ${priorityEmoji} ${mcp.name}`);
      console.log(`   ID: ${mcp.id}`);
      console.log(`   Stars: ⭐ ${mcp.stars.toLocaleString()}`);
      console.log(`   Score: ${mcp.score}/100`);
      console.log(`   Repo: ${mcp.repo}`);
      console.log('');
    });
    
    console.log('\n📈 RECOMMENDED ACTIONS:');
    
    const critical = this.findings.filter(m => m.priority === 'critica');
    const high = this.findings.filter(m => m.priority === 'alta');
    
    if (critical.length > 0) {
      console.log('\n🔴 CRITICAL - Integrate immediately:');
      critical.forEach(m => console.log(`   • ${m.name}`));
    }
    
    if (high.length > 0) {
      console.log('\n🟡 HIGH - Consider for next sprint:');
      high.forEach(m => console.log(`   • ${m.name}`));
    }
  }

  async run() {
    await this.research();
    this.generateReport();
    this.saveFindings();
    
    console.log('\n✨ Research complete!');
    console.log(`   Findings saved to: ${CONNECTORS_PATH}`);
    console.log(`   Knowledge updated: ${KNOWLEDGE_PATH}`);
  }
}

// Run
const researcher = new MCPresearcher();
researcher.run().catch(console.error);
