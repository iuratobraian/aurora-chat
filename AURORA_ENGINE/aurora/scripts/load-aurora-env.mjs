import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/**
 * Carga variables de entorno desde múltiples archivos .env
 * Prioridad: .env.local > .env.aurora > .env.nvidia > .env > .env.local.aurora
 */
export function loadAuroraEnv() {
  const candidates = [
    path.join(ROOT, ".env.local"),
    path.join(ROOT, ".env.aurora"),
    path.join(ROOT, ".env.nvidia"),
    path.join(ROOT, ".env"),
    path.join(ROOT, ".env.local.aurora")
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIndex = line.indexOf("=");
      if (eqIndex === -1) continue;
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

// Alias for compatibility
export const loadENV = loadAuroraEnv;
