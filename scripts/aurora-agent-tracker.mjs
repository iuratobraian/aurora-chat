#!/usr/bin/env node
/**
 * aurora-agent-tracker.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/agents/tracker/aurora-agent-tracker.mjs
 */

import auroraTracker from '../../aurora/agents/tracker/aurora-agent-tracker.mjs';
export default auroraTracker;
export const { track, list, report } = auroraTracker;
