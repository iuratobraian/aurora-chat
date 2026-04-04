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

dotenv.config({ path: ".env.local" });
dotenv.config();

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("❌ CRÍTICO: No se encontró VITE_CONVEX_URL en .env.local");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);

console.log("✨ [AURORA HIVE MIND] Iniciando Centinela Automatizado Extremo v3...");
console.log(`🌐 Control Base: ${convexUrl}`);
console.log("⏳ Modo Hands-Free activado. Mando Dual QWEN/OPENCODE listo.\n");

let lastKnownTaskId = null;
let isAgentWorking = false;

// ─────────────────────────────────────────────
// GHOST TYPER: escribe el texto directamente
// ─────────────────────────────────────────────
function createGhostTyperScript(promptText) {
  const vbsPath = path.join(process.cwd(), ".agent", "tmp", "auto-type.vbs");
  const tmpDir = path.dirname(vbsPath);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // Escapar caracteres especiales de VBScript SendKeys:
  // +, ^, %, ~, (, ), {, } necesitan envolverse en {}
  const escapedPrompt = promptText
    .replace(/\{/g, "{{}}")
    .replace(/\}/g, "{}}")
    .replace(/\[/g, "{[}")
    .replace(/\]/g, "{]}")
    .replace(/\(/g, "{(}")
    .replace(/\)/g, "{)}")
    .replace(/\+/g, "{+}")
    .replace(/\^/g, "{^}")
    .replace(/\%/g, "{%}")
    .replace(/~/g, "{~}")
    .replace(/'/g, "''");   // escape para VBS string

  // El VBScript espera a que abra la terminal y escribe el texto directamente
  const vbsCode = `
Set WshShell = WScript.CreateObject("WScript.Shell")
WScript.Sleep 8000
WshShell.SendKeys "${escapedPrompt}"
WScript.Sleep 800
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
          agentId: "AURORA_SENTINEL_01"
        });

        if (claimLog.success) {
          console.log("✅ Tarea bloqueada. Inyectando Fantasma Auto-Typer...");
          wakeAgentAndWork(task);
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

  // Actualizar foco del equipo
  const logContent = `# Foco Actual\nEjecutando Autónoma: ${task.title}\nID: ${task._id}\nTimestamp: ${new Date().toISOString()}`;
  try { fs.writeFileSync(".agent/workspace/coordination/CURRENT_FOCUS.md", logContent); } catch {}

  // Construir el prompt a inyectar
  const commandPrompt = `ORDEN SUPREMA AURORA: Ejecuta matemáticamente la tarea asignada. Tarea: ${task.title}. Descripcion: ${task.description || 'Ver TASK_BOARD.md para detalles'}. Usa los archivos pertinentes, aplica el patron defensivo try/catch si tocas Convex, y marca done en TASK_BOARD.md al terminar. Mantén el repositorio limpio y funcional.`;

  const agentCli = (process.env.AGENT_RUNNER || "opencode").toLowerCase();
  let agentsToLaunch = [];
  if (agentCli === "ambos" || task.assignedTo === "ambos") {
    agentsToLaunch = ["opencode", "qwen"];
  } else {
    agentsToLaunch = [agentCli];
  }

  agentsToLaunch.forEach((cliCommand, index) => {
    // Retardo escalonado: 0ms para el primero, 3000ms para el segundo
    setTimeout(() => {
      console.log(`🚀 Despertando Terminal Autónoma: ${cliCommand.toUpperCase()}`);

      // Crear VBScript con el texto real del prompt
      const vbsPath = createGhostTyperScript(commandPrompt);

      // Abrir nueva ventana CMD con el CLI
      const child = spawn("cmd.exe", [
        "/c", "start",
        `Aurora Hive: ${cliCommand.toUpperCase()}`,
        "cmd.exe",
        "/k",
        cliCommand
      ], {
        detached: true,
        stdio: "ignore"
      });
      child.unref();

      // Lanzar el fantasma typer (espera 8 segundos para que abra la terminal)
      const ghost = spawn("wscript.exe", [vbsPath], { detached: true, stdio: "ignore" });
      ghost.unref();

      console.log(`👻 [FANTASMA] Escribirá el prompt en ${cliCommand.toUpperCase()} en 8 segundos...`);
    }, index * 3000);
  });

  setTimeout(() => {
    isAgentWorking = false;
    console.log("\n✅ Ciclo completo. Regresando al Sistema Vigía...");
  }, agentsToLaunch.length * 3000 + 20000);
}

// ─────────────────────────────────────────────
// INICIO
// ─────────────────────────────────────────────
setInterval(checkTasks, 15000);
checkTasks();
