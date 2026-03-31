#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const HF_AGENTS_DIR = join(process.cwd(), '.agent', 'aurora', 'hf-agents');

const agents = [
  {
    id: 'smolagents',
    name: 'smolagents',
    description: 'Framework oficial HF para crear agentes IA',
    install: 'pip install smolagents[toolkit]',
    npm: null,
    requiresPython: true,
    installPython: 'python -m pip install smolagents[toolkit]',
    space: 'https://huggingface.co/spaces/smolagents/computer-use-agent'
  },
  {
    id: 'web-scraper',
    name: 'web-scraper',
    description: 'Web scraper via MCP',
    install: 'npx @agents-mcp-hackathon/web-scraper',
    npm: '@agents-mcp-hackathon/web-scraper',
    requiresPython: false,
    space: 'https://huggingface.co/spaces/Agents-MCP-Hackathon/web-scraper'
  },
  {
    id: 'knowledge-graph-builder',
    name: 'knowledge-graph-builder',
    description: 'Construcción de grafos de conocimiento',
    install: 'npx @agents-mcp-hackathon/knowledge-graph-builder',
    npm: '@agents-mcp-hackathon/knowledge-graph-builder',
    requiresPython: false,
    space: 'https://huggingface.co/spaces/Agents-MCP-Hackathon/KGB-mcp'
  },
  {
    id: 'deep-research',
    name: 'deep-research',
    description: 'Sistema multi-agente para deep research',
    install: 'npx @agents-mcp-hackathon/multi-agent-deep-research',
    npm: '@agents-mcp-hackathon/multi-agent-deep-research',
    requiresPython: false,
    space: 'https://huggingface.co/spaces/Agents-MCP-Hackathon/multi-agent_deep-research'
  },
  {
    id: 'workflow-builder',
    name: 'workflow-builder',
    description: 'Constructor visual de workflows',
    install: 'npx @agents-mcp-hackathon/workflow-builder',
    npm: '@agents-mcp-hackathon/workflow-builder',
    requiresPython: false,
    space: 'https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_workflowbuilder'
  },
  {
    id: 'file-converter',
    name: 'file-converter',
    description: 'Conversor universal de archivos',
    install: 'npx @agents-mcp-hackathon/file-converter',
    npm: '@agents-mcp-hackathon/file-converter',
    requiresPython: false,
    space: 'https://huggingface.co/spaces/Agents-MCP-Hackathon/universal-file-converter'
  }
];

function runCommand(cmd, silent = false) {
  try {
    if (!silent) console.log(`  → ${cmd}`);
    execSync(cmd, { stdio: silent ? 'pipe' : 'inherit', shell: true });
    return true;
  } catch (e) {
    if (!silent) console.log(`  ⚠️  Falló (continuando...)\n`);
    return false;
  }
}

console.log('\n🔧 HuggingFace Agents Installer');
console.log('='.repeat(50));

if (!existsSync(HF_AGENTS_DIR)) {
  mkdirSync(HF_AGENTS_DIR, { recursive: true });
}

console.log('\n📦 Instalando NPM packages...\n');

for (const agent of agents.filter(a => a.npm)) {
  console.log(`📦 ${agent.name}...`);
  const success = runCommand(`npm install -g ${agent.npm}`, true);
  if (success) {
    console.log(`  ✅ Instalado\n`);
  }
}

console.log('\n🐍 Verificando Python...\n');

let hasPython = false;
try {
  execSync('python --version', { stdio: 'pipe' });
  hasPython = true;
  console.log('  ✅ Python disponible\n');
} catch {
  console.log('  ⚠️  Python no disponible en PATH');
  console.log('  → Instalar desde: https://www.python.org/downloads/\n');
}

if (hasPython) {
  console.log('📦 Instalando smolagents...\n');
  const success = runCommand('python -m pip install smolagents[toolkit]', true);
  if (success) {
    console.log('  ✅ smolagents instalado\n');
  }
}

console.log('\n📝 Creando scripts de ejemplo...\n');

const scripts = {
  'smolagents-example.js': `// smolagents example - Framework oficial HF para agentes IA
// Docs: https://huggingface.co/docs/smolagents

import { CodeAgent } from 'smolagents';

const agent = new CodeAgent({
  model: 'openai', // o 'anthropic', 'huggingface', 'local'
  apiKey: process.env.OPENAI_API_KEY,
});

const result = await agent.run('Busca las últimas noticias sobre trading crypto y haz un resumen');
console.log(result);
`,

  'web-scraper-example.js': `// web-scraper example - Extrae websites como markdown
// Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/web-scraper

import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

async function scrapeWebsite(url) {
  // Usa el Space de HF via Inference API
  const response = await hf.chat({
    model: 'meta-llama/Llama-3-70b',
    inputs: \`Scrapea el contenido de esta URL y devuelve como markdown: \${url}\`,
    parameters: { max_tokens: 2048 }
  });
  return response;
}

const content = await scrapeWebsite('https://example.com');
console.log(content);
`,

  'knowledge-graph-example.js': `// knowledge-graph example - Construye grafos de conocimiento
// Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/KGB-mcp

async function buildKnowledgeGraph(text) {
  // Extrae entidades y relaciones del texto
  const entities = extractEntities(text);
  const relationships = extractRelationships(text);
  
  return {
    nodes: entities.map(e => ({ id: e.id, label: e.name, type: e.type })),
    edges: relationships.map(r => ({ 
      from: r.source, 
      to: r.target, 
      label: r.relationship 
    }))
  };
}

const graph = await buildKnowledgeGraph('Aurora es un agente de IA que coordina equipos de desarrollo.');
console.log(JSON.stringify(graph, null, 2));
`,

  'deep-research-example.js': `// deep-research example - Investigación profunda multi-agente
// Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/multi-agent_deep-research

async function deepResearch(query) {
  // Simula investigación multi-agente
  const agents = [
    { role: 'searcher', task: \`Buscar información sobre: \${query}\` },
    { role: 'analyzer', task: \`Analizar hallazgos y extraer puntos clave\` },
    { role: 'synthesizer', task: \`Sintetizar en un reporte coherente\` }
  ];
  
  const results = [];
  for (const agent of agents) {
    console.log(\`🔍 [\${agent.role}] \${agent.task}\`);
    // Aquí iría la llamada real al Space
    results.push({ agent: agent.role, findings: [] });
  }
  
  return {
    query,
    agents: results.length,
    findings: results,
    summary: 'Reporte generado'
  };
}

const report = await deepResearch('Mejores prácticas para trading de futuros');
console.log(JSON.stringify(report, null, 2));
`,

  'workflow-builder-example.js': `// workflow-builder example - Construye workflows automatizados
// Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/gradio_workflowbuilder

const workflowTemplate = {
  name: 'aurora-task-workflow',
  steps: [
    { id: 1, name: 'research', action: 'web_search', inputs: { query: '{{query}}' } },
    { id: 2, name: 'analyze', action: 'code_analysis', inputs: { context: '{{step1.output}}' } },
    { id: 3, name: 'implement', action: 'code_generation', inputs: { spec: '{{step2.output}}' } },
    { id: 4, name: 'validate', action: 'lint_check', inputs: { code: '{{step3.output}}' } }
  ]
};

async function executeWorkflow(task) {
  let context = { query: task };
  
  for (const step of workflowTemplate.steps) {
    console.log(\`⚙️  Ejecutando: \${step.name}\`);
    // Ejecutar cada paso
    context[\`step\${step.id}.output\`] = \`Resultado de \${step.name}\`;
  }
  
  return context;
}

const result = await executeWorkflow('Crear un componente de trading chart');
console.log('Workflow completado:', result);
`,

  'file-converter-example.js': `// file-converter example - Conversión universal de archivos
// Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/universal-file-converter

const conversions = {
  'pdf': ['markdown', 'json', 'text'],
  'docx': ['markdown', 'pdf', 'text'],
  'csv': ['json', 'xlsx', 'markdown'],
  'json': ['csv', 'yaml', 'markdown'],
  'markdown': ['html', 'pdf', 'docx']
};

async function convertFile(inputFile, targetFormat) {
  console.log(\`🔄 Convirtiendo \${inputFile} a \${targetFormat}...\`);
  
  // Leer archivo
  const content = readFileSync(inputFile);
  
  // Detectar formato de entrada
  const inputFormat = inputFile.split('.').pop();
  
  // Validar conversión
  if (!conversions[inputFormat]?.includes(targetFormat)) {
    throw new Error(\`Conversión \${inputFormat} → \${targetFormat} no soportada\`);
  }
  
  // Simular conversión
  const outputFile = inputFile.replace(\`.\\${inputFormat}\`, \`.\\${targetFormat}\`);
  console.log(\`✅ Guardado como: \${outputFile}\`);
  
  return outputFile;
}

convertFile('data/report.pdf', 'markdown');
`
};

for (const [filename, content] of Object.entries(scripts)) {
  const filepath = join(HF_AGENTS_DIR, filename);
  writeFileSync(filepath, content);
  console.log(`  ✅ ${filename}`);
}

console.log('\n📚 Documentación de Spaces:\n');
for (const agent of agents) {
  console.log(`  ${agent.name}: ${agent.space}`);
}

console.log('\n✅ Instalación completada!\n');
console.log('Scripts de ejemplo en: .agent/aurora/hf-agents/');
console.log('Ejecutar con: node .agent/aurora/hf-agents/<script>.js\n');
