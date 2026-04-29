#!/usr/bin/env node
/**
 * aurora-memory.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/core/memory/aurora-memory.mjs
 */

import auroraMemory from '../../aurora/core/memory/aurora-memory.mjs';
export default auroraMemory;
export const { get, set, clear, report } = auroraMemory;
