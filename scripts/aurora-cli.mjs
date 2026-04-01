#!/usr/bin/env node
/**
 * aurora-cli.mjs — Compatibility Wrapper
 * 
 * Este archivo permite que TradeShare siga usando Aurora CLI
 * después de la separación, sin modificar código existente.
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/cli/aurora-cli.mjs
 */

import auroraCli from '../../aurora/cli/aurora-cli.mjs';

// Re-exportar todo
export default auroraCli;
export const { run, executeCommand, help } = auroraCli;
