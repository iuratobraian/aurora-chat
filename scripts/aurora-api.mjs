#!/usr/bin/env node
/**
 * aurora-api.mjs — Compatibility Wrapper
 * 
 * Este archivo permite que TradeShare siga usando Aurora API
 * después de la separación, sin modificar código existente.
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/api/aurora-api.mjs
 */

import auroraApi from '../../aurora/api/aurora-api.mjs';

// Re-exportar todo
export default auroraApi;
export const { app, start, stop } = auroraApi;

// Exportar servidor Express directamente
export { app as expressApp };
