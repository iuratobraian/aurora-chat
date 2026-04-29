#!/usr/bin/env node
/**
 * aurora-auto-learn.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-auto-learn.mjs
 */

import auroraAutoLearn from '../../aurora/scripts/aurora-auto-learn.mjs';
export default auroraAutoLearn;
export const { learn, distill } = auroraAutoLearn;
