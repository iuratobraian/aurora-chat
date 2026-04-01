#!/usr/bin/env node
/**
 * aurora-inicio.mjs — Compatibility Wrapper
 * 
 * Este archivo permite que TradeShare siga usando Aurora
 * después de la separación, sin modificar código existente.
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/cli/aurora-inicio.mjs
 */

import auroraInicio from '../../aurora/cli/aurora-inicio.mjs';

// Re-exportar todo
export default auroraInicio;
export const { run, init, sync } = auroraInicio;

// Si el módulo original tiene ejecución automática, respetarla
if (typeof auroraInicio.main === 'function') {
  auroraInicio.main().catch(console.error);
}
