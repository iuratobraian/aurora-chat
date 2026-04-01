#!/usr/bin/env node
/**
 * aurora-notion-sync.mjs — Compatibility Wrapper
 *
 * Este archivo permite que TradeShare siga sincronizando con Notion
 * después de la separación, sin modificar código existente.
 *
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/aurora-notion-sync.mjs
 */

import notionSync from '../../aurora/scripts/aurora-notion-sync.mjs';

// Re-exportar todo
export default notionSync;
export const { sync, fetchTasks, updateStatus } = notionSync;
