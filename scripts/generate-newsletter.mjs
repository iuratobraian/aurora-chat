#!/usr/bin/env node
/**
 * Newsletter Generator - Creador de Apps
 * Genera boletines semanales con tendencias de desarrollo
 */

import { websearch } from 'exa-js';

const NEWSLETTER_TEMPLATE = `---
name: newsletter-generator
description: Genera boletines semanales de tendencias de desarrollo
---

# 📱 Newsletter de Desarrollo - {WEEK}

**Fecha:** {DATE}  
**Edición:** #{ISSUE}  
**Autor:** Aurora AI Agent

---

## 🔥 Tendencias de la Semana

{TRENDS}

## 🛠️ Herramientas Destacadas

{TOOLS}

## 📚 Recursos

{ RESOURCES}

## 💡 Tips de Implementación

{TIPS}

---

*Generado por Aurora AI Agent*  
*Suscribirse: \`.agent/skills/creador_de_apps/news/\`
`;

const SEARCH_QUERIES = {
  frontend: 'React Vue Svelte news 2026',
  backend: 'Node.js Deno Bun database trends 2026',
  mobile: 'React Native Flutter PWA 2026',
  ai: 'AI development tools SDK 2026',
  design: 'design systems UI trends accessibility 2026',
};

async function searchTrends(query) {
  try {
    const results = await websearch({
      query,
      numResults: 5,
      type: 'news',
    });
    return results.results.map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.snippet,
    }));
  } catch (error) {
    console.error(`Error searching ${query}:`, error.message);
    return [];
  }
}

function formatNewsletter(data) {
  const now = new Date();
  const yearWeek = `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}`;
  
  return NEWSLETTER_TEMPLATE
    .replace('{WEEK}', yearWeek)
    .replace('{DATE}', now.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
    .replace('{ISSUE}', String(Math.floor(Math.random() * 100)).padStart(3, '0'))
    .replace('{TRENDS}', formatTrends(data.frontend))
    .replace('{TOOLS}', formatTools(data.tools))
    .replace('{RESOURCES}', formatResources(data.resources))
    .replace('{TIPS}', formatTips());
}

function formatTrends(results) {
  if (!results.length) {
    return '- AI-First Development continúa dominando\n- Edge Computing en todas partes\n- Server Components son el nuevo standard';
  }
  
  return results.slice(0, 5).map((r, i) => 
    `### ${i + 1}. ${r.title}\n${r.snippet}\n[Más](${r.url})`
  ).join('\n\n');
}

function formatTools(tools) {
  const defaultTools = [
    { name: 'v0.dev', category: 'AI UI', use: 'Genera componentes React con prompts' },
    { name: 'Cursor', category: 'IDE', use: 'Editor AI-first' },
    { name: 'Convex', category: 'Backend', use: 'DB + real-time unificado' },
    { name: 'Bolt.new', category: 'Full-stack', use: 'Apps completas con AI' },
  ];
  
  return tools?.length 
    ? tools.map(t => `- **${t.name}** - ${t.snippet}`).join('\n')
    : defaultTools.map(t => `- **${t.name}** - ${t.use}`).join('\n');
}

function formatResources(resources) {
  const defaultResources = [
    { title: 'The Future of Web Development is AI-Native', url: '#' },
    { title: 'Why Server Components Change Everything', url: '#' },
    { title: 'Edge Computing Patterns for 2026', url: '#' },
  ];
  
  return (resources?.length ? resources : defaultResources)
    .map(r => `- [${r.title}](${r.url})`)
    .join('\n');
}

function formatTips() {
  return `### 1. Usa TypeScript Strict Mode
\`\`\`typescript
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});
\`\`\`

### 2. Implementa Error Boundaries
\`\`\`tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <Component />
</ErrorBoundary>
\`\`\`

### 3. Prefiere Server Components
Async components son el default para data fetching.`;
}

async function generateNewsletter() {
  console.log('🔍 Buscando tendencias de desarrollo...');
  
  try {
    const [frontend] = await Promise.all([
      searchTrends(SEARCH_QUERIES.frontend),
    ]);
    
    const data = {
      frontend,
      tools: [],
      resources: [],
    };
    
    const newsletter = formatNewsletter(data);
    
    const now = new Date();
    const filename = `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}.md`;
    
    console.log(`\n✅ Newsletter generado: ${filename}`);
    console.log('\n--- PREVIEW ---');
    console.log(newsletter.slice(0, 500) + '...\n');
    
    return newsletter;
  } catch (error) {
    console.error('❌ Error generando newsletter:', error.message);
    return formatNewsletter({});
  }
}

// CLI Interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📱 Newsletter Generator - Creador de Apps

Uso:
  node scripts/generate-newsletter.mjs [opciones]

Opciones:
  --save, -s    Guardar en archivo
  --preview, -p Ver preview
  --help, -h    Mostrar ayuda

Ejemplos:
  node scripts/generate-newsletter.mjs --preview
  node scripts/generate-newsletter.mjs --save
  `);
  process.exit(0);
}

if (args.includes('--save') || args.includes('-s')) {
  generateNewsletter().then(content => {
    const fs = require('fs');
    const path = require('path');
    const now = new Date();
    const filename = path.join(
      __dirname,
      '..',
      '.agent',
      'skills',
      'creador_de_apps',
      'news',
      `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}.md`
    );
    fs.writeFileSync(filename, content);
    console.log(`💾 Guardado en: ${filename}`);
  });
} else {
  generateNewsletter().then(console.log);
}
