import fs from 'fs';
import path from 'path';

/**
 * Aurora Context Recovery Script
 * Purpose: Summarizes the last 3 entries of AGENT_LOG.md to give the agent immediate context.
 * Part of Aurora Mastermind (AMM) Protocol.
 */

const logPath = path.resolve('.agent/workspace/coordination/AGENT_LOG.md');

function recoverContext() {
    try {
        const content = fs.readFileSync(logPath, 'utf8');
        const sections = content.split('###').slice(1, 4); // Get last 3 entries
        
        console.log("=== AURORA CONTEXT RECOVERY ===");
        sections.forEach(section => {
            console.log("-------------------------------");
            console.log("###" + section.split('\n').slice(0, 5).join('\n') + "...");
        });
        console.log("===============================");
    } catch (error) {
        console.error("Error recovering context:", error);
    }
}

recoverContext();
