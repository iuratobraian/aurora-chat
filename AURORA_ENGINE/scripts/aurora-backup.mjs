#!/usr/bin/env node
/**
 * aurora-backup.mjs — Compatibility Wrapper
 * 
 * @deprecated Usar directamente desde aurora/
 * @see ../../aurora/scripts/backup/aurora-backup.mjs
 */

import auroraBackup from '../../aurora/scripts/backup/aurora-backup.mjs';
export default auroraBackup;
export const { backup, restore, list } = auroraBackup;
