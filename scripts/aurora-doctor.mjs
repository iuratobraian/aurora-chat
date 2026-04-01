#!/usr/bin/env node
/**
 * aurora-doctor.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-doctor.mjs
 */

import auroraDoctor from '../../aurora/scripts/aurora-doctor.mjs';
export default auroraDoctor;
export const { diagnose, fix } = auroraDoctor;
