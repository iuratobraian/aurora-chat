#!/usr/bin/env node
/**
 * aurora-scorecard.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-scorecard.mjs
 */

import auroraScorecard from '../../aurora/scripts/aurora-scorecard.mjs';
export default auroraScorecard;
export const { build, report } = auroraScorecard;
