import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), '.agent');
const masteryPath = path.join(basePath, 'skills', 'aurora-mastery', 'SKILL.md');
const indexPath = path.join(basePath, 'workspace', 'agent_memories', 'INDEX.md');

console.log('🤖 INICIANDO ONBOARDING EXPRESS PARA AGENTE...');

if (!fs.existsSync(masteryPath)) {
  console.log("⚠️ Archivo de maestría no encontrado o en ruta incorrecta.");
} else {
  const masteryContent = fs.readFileSync(masteryPath, 'utf8');
  console.log('\n--- 1. CONTEXTO DE MAESTRÍA (PRINCIPALES REGLAS DE ORO) ---');
  // Extraemos líneas que parezcan reglas marcadas o un resumen general
  const lines = masteryContent.split('\n');
  const contextLimit = lines.slice(0, 30).join('\n'); 
  console.log(contextLimit);
  console.log('[...] (Lee el archivo completo en skills/aurora-mastery/SKILL.md para detalles técnicos).');
}

if (!fs.existsSync(indexPath)) {
  console.log("⚠️ Índice de identidades no encontrado.");
} else {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log('\n--- 2. ESPECIALIZACIONES DE EQUIPO ---');
  const indexLines = indexContent.split('\n');
  let inTable = false;
  indexLines.forEach(line => {
    if (line.includes('| ID |')) inTable = true;
    if (inTable && line.includes('| AGENT-')) {
      console.log(line);
    }
  });
}

console.log('\n--- 3. SIGUIENTE PASO OBLIGATORIO ---');
console.log('1. Crea tu archivo de memoria individual copiando el template en .agent/workspace/agent_memories/.');
console.log('2. Anda a .agent/workspace/coordination/TASK_BOARD.md, elige tareas y MARCA TRES (3) a tu nombre.');
console.log('3. Actualiza DAILY_STANDUP.md con tu estado y comienza a operar. ¡Bienvenido al Enjambre!');
