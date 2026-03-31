// NVIDIA Agent Skill - Kimi K2
// Integrado con Aurora Nexus

const MODEL = "moonshotai/kimi-k2-instruct";
const AGENT_NAME = "Kimi";
const PROJECT_ROOT = "C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum";

export const kimiSkill = {
  name: "kimi",
  description: "Agente NVIDIA Kimi K2 para coding y análisis",
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
      command: `scripts\\chat-kimi.ps1`
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

export default kimiSkill;
