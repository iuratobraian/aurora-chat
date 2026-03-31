// NVIDIA Agent Skill - MiniMax M2.5

const MODEL = "minimaxai/minimax-m2.5";
const AGENT_NAME = "MiniMax";
const PROJECT_ROOT = "C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum";

export const minimaxSkill = {
  name: "minimax",
  description: "Agente NVIDIA MiniMax M2.5 para análisis y estrategia",
  model: MODEL,
  agentName: AGENT_NAME,
  projectRoot: PROJECT_ROOT,
  
  init() {
    console.log(`[Skill] ${AGENT_NAME} inicializado - Modelo: ${MODEL}`);
  },
  
  run(args?: string[]) {
    console.log(`[Skill] Ejecutando ${AGENT_NAME} con args:`, args);
    return {
      agent: AGENT_NAME,
      model: MODEL,
      command: `scripts\\chat-minimax.ps1`
    };
  },
  
  getHelp() {
    return {
      commands: [
        "inicio - Ejecutar protocolo Aurora",
        "read <archivo> - Leer archivo del proyecto",
        "ls <carpeta> - Listar archivos",
        "run <comando> - Ejecutar comando npm",
        "help - Mostrar ayuda"
      ]
    };
  }
};

export default minimaxSkill;
