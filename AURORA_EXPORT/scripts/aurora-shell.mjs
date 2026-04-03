#!/usr/bin/env node
/**
 * aurora-shell.mjs — Compatibility Wrapper
 * 
 * Este archivo permite que TradeShare siga usando Aurora Shell
 * después de la separación, sin modificar código existente.
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/cli/aurora-shell.mjs
 */

import auroraShell from '../../aurora/cli/aurora-shell.mjs';

// Re-exportar todo
export default auroraShell;
export const { run, interact, execute } = auroraShell;
