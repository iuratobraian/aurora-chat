#!/usr/bin/env node
/**
 * aurora-sovereign.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-sovereign.mjs
 */

import auroraSovereign from '../../aurora/scripts/aurora-sovereign.mjs';
export default auroraSovereign;
export const { 
  getAuroraSurfaceRegistry, 
  buildAuroraDriftReport, 
  buildAuroraHealthSnapshot,
  buildAuroraScorecardDaily,
  buildAuroraRiskSignal,
  buildAuroraValidationChecklist,
  buildAuroraNextBestStep
} = auroraSovereign;
