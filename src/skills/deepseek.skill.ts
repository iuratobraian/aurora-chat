// NVIDIA Agent Skill - DeepSeek V3.2

const MODEL = "deepseek-ai/deepseek-v3.2";
const AGENT_NAME = "DeepSeek";
const PROJECT_ROOT = "C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum";

export const deepseekSkill = {
  name: "deepseek",
  description: "Agente NVIDIA DeepSeek V3.2 para razonamiento y código",
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
      command: `scripts\\chat-deepseek.ps1`
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

export default deepseekSkill;
