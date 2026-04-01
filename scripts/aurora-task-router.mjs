#!/usr/bin/env node
/**
 * aurora-task-router.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-task-router.mjs
 */

import auroraTaskRouter from '../../aurora/scripts/aurora-task-router.mjs';
export default auroraTaskRouter;
export const { route, assign, report } = auroraTaskRouter;
