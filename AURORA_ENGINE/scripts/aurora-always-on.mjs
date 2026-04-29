#!/usr/bin/env node
/**
 * aurora-always-on.mjs — Compatibility Wrapper
 * 
 * Este archivo permite que TradeShare siga usando Aurora Daemon
 * después de la separación, sin modificar código existente.
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/core/daemon/aurora-always-on.mjs
 */

import auroraAlwaysOn from '../../aurora/core/daemon/aurora-always-on.mjs';

// Re-exportar todo
export default auroraAlwaysOn;
export const { start, stop, status } = auroraAlwaysOn;
