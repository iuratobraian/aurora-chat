#!/usr/bin/env node
/**
 * aurora-knowledge.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/skills/knowledge/aurora-knowledge.mjs
 */

import auroraKnowledge from '../../aurora/skills/knowledge/aurora-knowledge.mjs';
export default auroraKnowledge;
export const { get, set, search } = auroraKnowledge;
