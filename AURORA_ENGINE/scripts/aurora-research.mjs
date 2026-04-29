#!/usr/bin/env node
/**
 * aurora-research.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/skills/research/aurora-research.mjs
 */

import auroraResearch from '../../aurora/skills/research/aurora-research.mjs';
export default auroraResearch;
export const { search, analyze, report } = auroraResearch;
