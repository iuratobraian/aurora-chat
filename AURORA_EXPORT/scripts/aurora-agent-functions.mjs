#!/usr/bin/env node
/**
 * aurora-agent-functions.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/agents/functions/aurora-agent-functions.mjs
 */

import auroraFunctions from '../../aurora/agents/functions/aurora-agent-functions.mjs';
export default auroraFunctions;
export const { execute, list } = auroraFunctions;
