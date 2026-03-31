// NVIDIA Agents CLI - Ejecuta agentes NVIDIA desde terminal
// Uso: node scripts/nvidia-agent.mjs <agent> [args]

const AGENTS = {
  kimi: {
    name: 'Kimi K2',
    model: 'moonshotai/kimi-k2-instruct',
    script: 'chat-kimi.ps1'
  },
  deepseek: {
    name: 'DeepSeek V3.2',
    model: 'deepseek-ai/deepseek-v3.2',
    script: 'chat-deepseek.ps1'
  },
  minimax: {
    name: 'MiniMax M2.5',
    model: 'minimaxai/minimax-m2.5',
    script: 'chat-minimax.ps1'
  },
  glm5: {
    name: 'GLM-5',
    model: 'z-ai/glm5',
    script: 'chat-glm5.ps1'
  }
};

const args = process.argv.slice(2);
const agentName = args[0]?.toLowerCase();

if (!agentName || agentName === 'help' || agentName === '--help') {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              AURORA NEXUS - NVIDIA AGENTS CLI                ║
╚══════════════════════════════════════════════════════════════╝

Uso: node nvidia-agent.mjs <agente> [comando]

Agentes disponibles:
  kimi      - Kimi K2 Instruct (coding, análisis)
  deepseek  - DeepSeek V3.2 (razonamiento, código)
  minimax   - MiniMax M2.5 (análisis, estrategia)
  glm5      - GLM-5 (coding, creatividad)

Comandos:
  start     - Abrir terminal interactivo
  test      - Probar conexión
  help      - Mostrar esta ayuda

Ejemplos:
  node nvidia-agent.mjs kimi start
  node nvidia-agent.mjs deepseek test
  node nvidia-agent.mjs help
`);
  process.exit(0);
}

const agent = AGENTS[agentName];

if (!agent) {
  console.error(`[ERROR] Agente '${agentName}' no encontrado.`);
  console.log('Agentes disponibles:', Object.keys(AGENTS).join(', '));
  process.exit(1);
}

const command = args[1] || 'start';

if (command === 'test') {
  console.log(`[Test] Probando ${agent.name}...`);
  console.log(`[Model] ${agent.model}`);
  console.log('[Info] Ejecuta el script directamente para usar:');
  console.log(`  scripts\\${agent.script}`);
} else if (command === 'start') {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              INICIANDO ${agent.name.toUpperCase().padEnd(35)}║
╚══════════════════════════════════════════════════════════════╝

Ejecuta en PowerShell:
  .\\scripts\\${agent.script}
`);
} else {
  console.log(`[INFO] Comando '${command}' no reconocido.`);
  console.log(`Ejecuta: .\\scripts\\${agent.script}`);
}
