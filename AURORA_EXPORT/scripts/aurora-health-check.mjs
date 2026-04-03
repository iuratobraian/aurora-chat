#!/usr/bin/env node
/**
 * aurora-health-check.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-health-check.mjs
 */

import auroraHealth from '../../aurora/scripts/aurora-health-check.mjs';
export default auroraHealth;
export const { check, report } = auroraHealth;
