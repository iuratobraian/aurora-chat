/**
 * Knowledge Graph Example - Construye grafos de conocimiento
 * Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/KGB-mcp
 */

function extractEntities(text) {
  // Entidades simples basadas en patrones
  const patterns = [
    { regex: /[A-Z][a-z]+ (?:AI|IA)/g, type: 'TECH' },
    { regex: /[A-Z][a-z]+Agent/gi, type: 'AGENT' },
    { regex: /[A-Z][a-z]+ (?:framework|tool|system)/gi, type: 'TOOL' },
  ];
  
  const entities = [];
  for (const { regex, type } of patterns) {
    const matches = text.match(regex) || [];
    matches.forEach(m => {
      if (!entities.find(e => e.name === m)) {
        entities.push({ id: entities.length + 1, name: m, type });
      }
    });
  }
  return entities;
}

function extractRelationships(text) {
  const relationships = [];
  const relationPatterns = [
    { regex: /(\w+) (?:usa|utiliza|uses) (\w+)/gi, label: 'USES' },
    { regex: /(\w+) (?:es|is|se basa|en) (\w+)/gi, label: 'IS_A' },
    { regex: /(\w+) (?:crea|builds|creates) (\w+)/gi, label: 'BUILDS' },
  ];
  
  for (const { regex, label } of relationPatterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      relationships.push({
        from: match[1],
        to: match[2],
        label
      });
    }
  }
  return relationships;
}

async function buildKnowledgeGraph(text) {
  const entities = extractEntities(text);
  const relationships = extractRelationships(text);
  
  return {
    nodes: entities.map(e => ({
      id: e.id,
      label: e.name,
      type: e.type,
      color: e.type === 'TECH' ? '#3b82f6' : 
             e.type === 'AGENT' ? '#10b981' : '#f59e0b'
    })),
    edges: relationships.map((r, i) => ({
      id: i + 1,
      from: r.from,
      to: r.to,
      label: r.label,
      color: '#6366f1'
    }))
  };
}

// Ejemplo de uso
const sampleText = `
smolagents es un framework de HuggingFace para crear agentes IA.
CodeAgent usa Python para ejecutar tareas.
Aurora es un agente que coordina equipos de desarrollo.
Aurora usa smolagents para automatización.
`;

buildKnowledgeGraph(sampleText).then(graph => {
  console.log('\n🔷 Knowledge Graph:\n');
  console.log('Nodes:', JSON.stringify(graph.nodes, null, 2));
  console.log('\nEdges:', JSON.stringify(graph.edges, null, 2));
}).catch(console.error);
