// NVIDIA Agents Skills Index
// Exporta todos los agentes NVIDIA disponibles en Aurora Nexus

export { kimiSkill } from './kimi.skill';
export { deepseekSkill } from './deepseek.skill';
export { minimaxSkill } from './minimax.skill';
export { glm5Skill } from './glm5.skill';

import { kimiSkill } from './kimi.skill';
import { deepseekSkill } from './deepseek.skill';
import { minimaxSkill } from './minimax.skill';
import { glm5Skill } from './glm5.skill';

export const nvidiaAgents = {
  kimi: kimiSkill,
  deepseek: deepseekSkill,
  minimax: minimaxSkill,
  glm5: glm5Skill,
};

export const allSkills = [
  kimiSkill,
  deepseekSkill,
  minimaxSkill,
  glm5Skill,
];

export function initAllSkills() {
  console.log('[Skills] Inicializando agentes NVIDIA...');
  allSkills.forEach(skill => {
    if (typeof skill.init === 'function') {
      skill.init();
    }
  });
  console.log('[Skills] Todos los agentes NVIDIA inicializados');
}

export default allSkills;
