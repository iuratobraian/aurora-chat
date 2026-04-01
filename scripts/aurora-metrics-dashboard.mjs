#!/usr/bin/env node
/**
 * aurora-metrics-dashboard.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-metrics-dashboard.mjs
 */

import auroraMetrics from '../../aurora/scripts/aurora-metrics-dashboard.mjs';
export default auroraMetrics;
export const { dashboard, metrics } = auroraMetrics;
