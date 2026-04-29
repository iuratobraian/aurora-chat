/**
 * AURORA HIVE WORKER - v3 Extreme Automation
 * Centinela de Invocación Remota con Tipeo Automático "Hands-Free"
 * Fix v3: usa SendKeys con texto real (no CTRL+V que falla en CMD)
 */

import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

dotenv.config({ path: ".env.local" });
dotenv.config();

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CRÍTICO: No se encontró VITE_CONVEX_URL en .env.local");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);
const hostname = os.hostname();
const agentUniqueId = `SENTINEL_${hostname.replace(/[^a-zA-Z0-9]/g, "_")}`;

console.log(`✨ [AURORA HIVE MIND] Iniciando Centinela: ${agentUniqueId}`);
console.log(`🌐 Control Base: ${convexUrl}`);
console.log("⏳ Modo Hands-Free activado. Mando Dual QWEN/OPENCODE listo.\n");

let lastKnownTaskId = null;
let isAgentWorking = false;
let agentRotationIndex = 0;

// ─────────────────────────────────────────────
// GHOST TYPER: escribe el texto directamente
// ─────────────────────────────────────────────
function createGhostTyperScript(promptText) {
  const vbsPath = path.join(process.cwd(), ".agent", "tmp", "auto-type.vbs");
  const tmpDir = path.dirname(vbsPath);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // Escapar caracteres especiales de VBScript SendKeys
  const escapedPrompt = promptText
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\x20-\x7E]/g, "") // Mantener ASCII imprimible
    .replace(/'/g, "")           // Quitar comillas simples
    .replace(/"/g, "")           // Quitar comillas dobles
    .replace(/[+^%~{}()\[\]]/g, "{$&}") // Envolver especiales en llaves
    .substring(0, 500);          // Límite de seguridad

  // Dividir en trozos pequeños
  const chunkSize = 100;
  let sendKeysCalls = "";
  for (let i = 0; i < escapedPrompt.length; i += chunkSize) {
    const chunk = escapedPrompt.substring(i, i + chunkSize);
    sendKeysCalls += `WshShell.SendKeys "${chunk}"\nWScript.Sleep 50\n`; 
  }

  const vbsCode = `' auto-type.vbs - Generado por Aurora Hive Worker
Set WshShell = WScript.CreateObject("WScript.Shell")
WScript.Sleep 10000
${sendKeysCalls}
WScript.Sleep 1000
WshShell.SendKeys "{ENTER}"
WScript.Sleep 2000
WshShell.SendKeys "{ENTER}"
WScript.Sleep 5000
WshShell.SendKeys "{ENTER}"
`;
  fs.writeFileSync(vbsPath, vbsCode);
  return vbsPath;
}

// ─────────────────────────────────────────────
// POLLING DE TAREAS
// ─────────────────────────────────────────────
async function checkTasks() {
  if (isAgentWorking) return;

  try {
    const pendingTasks = await convex.query("auroraHive:getPendingTasks", { limit: 1 });
    
    if (pendingTasks && pendingTasks.length > 0) {
      const task = pendingTasks[0];
      
      if (lastKnownTaskId !== task._id) {
        lastKnownTaskId = task._id;
        console.log(`\n🚨 ALERTA: ORDEN REMOTA RECIBIDA!`);
        console.log(`🎯 Tarea: ${task.title}`);
        
        const claimLog = await convex.mutation("auroraHive:claimTask", {
          taskId: task._id,
          agentId: agentUniqueId
        });

        if (claimLog.success) {
          console.log(`✅ Tarea bloqueada por ${agentUniqueId}. Inyectando Fantasma Auto-Typer...`);
          wakeAgentAndWork(claimLog.task);
        } else {
          console.warn(`❌ Tarea perdida por competencia: ${claimLog.reason}`);
          lastKnownTaskId = null;
        }
      }
    }
  } catch (err) {
    if (!err.message?.includes('fetch')) {
      console.error("Error Hive:", err.message);
    }
  }
}

// ─────────────────────────────────────────────
// DESPERTAR AGENTES Y ESCRIBIR
// ─────────────────────────────────────────────
function wakeAgentAndWork(task) {
  isAgentWorking = true;

  const logContent = `# Foco Actual\nEjecutando Autónoma: ${task.title}\nID: ${task._id}\nAgente: ${agentUniqueId}\nTimestamp: ${new Date().toISOString()}`;
  try { fs.writeFileSync(".agent/workspace/coordination/CURRENT_FOCUS.md", logContent); } catch {}

  const commandPrompt = `ORDEN SUPREMA AURORA: EJECUTA LA TAREA SIN PEDIR CONFIRMACION. NO PREGUNTES "ENTER PARA CONTINUAR". USA SafeToAutoRun=true EN TODO. Al finalizar, DEBES ejecutar el comando "exit" para cerrar esta terminal. Tarea: ${task.title}. Descripcion: ${task.description}. Resuelve, testea y marca done en TASK_BOARD.md.`;

  const runnerMode = (process.env.AGENT_RUNNER || "opencode").toLowerCase();
  let cliCommand = runnerMode;

  if (runnerMode === "ambos" || task.assignedTo === "ambos") {
    const agents = ["opencode", "qwen"];
    cliCommand = agents[agentRotationIndex % agents.length];
    agentRotationIndex++;
    console.log(`🔄 [ROTACION] Turno para: ${cliCommand.toUpperCase()}`);
  }

  console.log(`🚀 Despertando Terminal Autónoma (${agentUniqueId}): ${cliCommand.toUpperCase()}`);

  const vbsPath = createGhostTyperScript(commandPrompt);

  const child = spawn("cmd.exe", [
    "/c", "start",
    `Aurora [${agentUniqueId}]`,
    "cmd.exe",
    "/c",
    cliCommand
  ], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();

  const ghost = spawn("wscript.exe", [vbsPath], { detached: true, stdio: "ignore" });
  ghost.unref();

  console.log(` ghost [FANTASMA] Escribirá y confirmará en 10s...`);

  setTimeout(() => {
    isAgentWorking = false;
    console.log("\n✅ Ciclo completo. Regresando al Sistema Vigía...");
  }, 45000);
}

// ─────────────────────────────────────────────
// SYNC ERRORES AL VAULT
// ─────────────────────────────────────────────
async function checkSystemErrors() {
  try {
    console.log("🔍 [SENTINEL] Verificando errores en el vault...");
    const syncProcess = spawn("node", ["scripts/vault-sync-errors.mjs"], { stdio: "inherit" });
    syncProcess.on('close', (code) => {
      if (code === 0) console.log("✅ [SENTINEL] Vault de errores sincronizado.");
    });
  } catch (err) {
    console.error("❌ Error en sync de errores:", err);
  }
}

// ─────────────────────────────────────────────
// 4. MAIN LOOPS
// -----------------------------------------------------------------------------

function startLoops() {
  console.log('[Worker] Starting polling loops...');
  
  // Task processing loop: increased to 60s (from 15s) to reduce DB load
  setInterval(checkTasks, 60000);
  
  // Log and error sync loop: increased to 5m (from 1m) for stability
  setInterval(checkSystemErrors, 300000);
  
  // Initial runs
  checkTasks();
  checkSystemErrors();
}

startLoops();
