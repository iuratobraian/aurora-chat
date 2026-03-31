// NVIDIA Agent Skill - GLM-5

const MODEL = "z-ai/glm5";
const AGENT_NAME = "GLM-5";
const PROJECT_ROOT = "C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum";

export const glm5Skill = {
  name: "glm5",
  description: "Agente NVIDIA GLM-5 para coding y creatividad",
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
      command: `scripts\\chat-glm5.ps1`
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

export default glm5Skill;
