#!/usr/bin/env node
import { spawn } from "node:child_process";
import { loadAuroraEnv } from "./load-aurora-env.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

loadAuroraEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

function getApiKey() {
  let apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    try {
      const envFile = path.join(PROJECT_ROOT, ".env.nvidia");
      if (fs.existsSync(envFile)) {
        apiKey = fs.readFileSync(envFile, "utf8").trim();
      }
    } catch (e) {}
  }
  return apiKey;
}

class AuroraAgent {
  constructor() {
    this.apiKey = getApiKey();
    this.model = "moonshotai/kimi-k2-instruct";
    this.conversationHistory = [];
    this.systemPrompt = this.buildSystemPrompt();
  }

  buildSystemPrompt() {
    return `Eres Aurora Agent - El asistente de código más avanzado para TradeShare 2025.

STACK TÉCNICO:
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Convex (base de datos en tiempo real)
- PWA con service workers
- Glassmorphism UI con backdrop-blur

PROYECTO: TradeShare - Plataforma de trading social

CAPACIDADES:
1. Análisis de código: Puedo leer, entender y explicar cualquier archivo del proyecto
2. Generación de código: Creo componentes React, hooks, utilities, mutations Convex
3. Debugging: Identifico bugs y propongo soluciones
4. Refactoring: Mejoro código existente siguiendo best practices
5. Testing: Escribo tests con Vitest
6. Navegación: Conozco la estructura del proyecto

CONVENCIONES DEL PROYECTO:
- Archivos: kebab-case para archivos, PascalCase para componentes React
- Imports:先用 absolute paths desde src/ (ej: @/components/Avatar)
- Tipado: Interfaces para tipos públicos, type para unions
- Estado: useState para local, Convex queries para server state
- Styling: Tailwind classes, glass effects con backdrop-blur-xl

COMANDOS ÚTILES:
- npm run dev → Iniciar dev server
- npm run lint → Verificar TypeScript
- npm run build → Build producción
- npm test → Ejecutar tests

Cuando escribas código, usa:
- ES Modules (import/export)
- TypeScript con tipos explícitos
- Tailwind para estilos
- Componentes funcionales con hooks`;
  }

  async chat(message, options = {}) {
    if (!this.apiKey) {
      return { 
        ok: false, 
        provider: "kimi", 
        answer: "NVIDIA_API_KEY no configurada. Agrega tu token a .env.nvidia" 
      };
    }

    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 4096;

    this.conversationHistory.push({ role: "user", content: message });

    const messages = [
      { role: "system", content: this.systemPrompt },
      ...this.conversationHistory.slice(-10)
    ];

    const timeout = options.timeout ?? parseInt(process.env.AURORA_AI_TIMEOUT || "300000"); // 5 minutos default para KIMI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        return { ok: false, provider: "kimi", answer: `Error ${response.status}: ${error}` };
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "Sin respuesta";

      this.conversationHistory.push({ role: "assistant", content: answer });

      return {
        ok: true,
        provider: "kimi",
        model: this.model,
        answer
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return {
          ok: false,
          provider: "kimi",
          answer: `Timeout: La petición a Kimi excedió los ${timeout}ms`
        };
      }
      return {
        ok: false,
        provider: "kimi",
        answer: error.message
      };
    }
  }

  async readFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
      const content = fs.readFileSync(fullPath, "utf8");
      return { ok: true, content, path: fullPath };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async listFiles(pattern) {
    const { glob } = await import("glob");
    try {
      const files = await glob(pattern, { cwd: PROJECT_ROOT });
      return { ok: true, files };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async execCommand(command, args = []) {
    return new Promise((resolve) => {
      const proc = spawn(command, args, {
        cwd: PROJECT_ROOT,
        shell: true,
        stdio: "pipe"
      });

      let stdout = "";
      let stderr = "";

      proc.stdout?.on("data", (data) => { stdout += data.toString(); });
      proc.stderr?.on("data", (data) => { stderr += data.toString(); });

      proc.on("close", (code) => {
        resolve({ ok: code === 0, code, stdout, stderr });
      });

      proc.on("error", (err) => {
        resolve({ ok: false, error: err.message });
      });
    });
  }

  status() {
    return {
      apiKeyConfigured: Boolean(this.apiKey),
      model: this.model,
      endpoint: "https://integrate.api.nvidia.com/v1",
      conversationLength: this.conversationHistory.length,
      projectRoot: PROJECT_ROOT
    };
  }

  clearHistory() {
    this.conversationHistory = [];
    return { ok: true, message: "Historial limpiado" };
  }
}

const agent = new AuroraAgent();

async function runInteractive() {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  console.log("\n🟣 ═══════════════════════════════════════════");
  console.log("   AURORA AGENT - TradeShare 2025 Assistant");
  console.log("🟣 ═══════════════════════════════════════════");
  console.log("\nEstado:", agent.status().apiKeyConfigured ? "✅ Conectado" : "❌ Sin API Key");
  console.log("Modelo:", agent.status().model);
  console.log("\nComandos:");
  console.log("  /status  - Ver estado del agente");
  console.log("  /clear   - Limpiar historial");
  console.log("  /help    - Mostrar ayuda");
  console.log("  /exit    - Salir");
  console.log("\n💬 Escribe tu pregunta (o Ctrl+C para salir):\n");

  const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

  while (true) {
    const input = await prompt("🟣 > ");
    const trimmed = input.trim();

    if (!trimmed) continue;

    if (trimmed === "/exit" || trimmed === "/quit") {
      console.log("\n👋 ¡Hasta luego! Aurora Agent apagándose...");
      rl.close();
      process.exit(0);
    }

    if (trimmed === "/status") {
      console.log("\n📊 Estado de Aurora Agent:");
      console.log(JSON.stringify(agent.status(), null, 2));
      continue;
    }

    if (trimmed === "/clear") {
      const result = agent.clearHistory();
      console.log("\n🗑️", result.message);
      continue;
    }

    if (trimmed === "/help") {
      console.log("\n📖 COMANDOS DISPONIBLES:");
      console.log("  /status  - Ver estado del agente");
      console.log("  /clear   - Limpiar historial de conversación");
      console.log("  /files    - Listar archivos del proyecto");
      console.log("  /exec     - Ejecutar comando npm/git");
      console.log("  /read     - Leer archivo específico");
      console.log("  /exit     - Salir del agente");
      continue;
    }

    console.log("\n🤖 Aurora pensando...\n");

    const result = await agent.chat(trimmed);

    if (result.ok) {
      console.log(result.answer);
    } else {
      console.log("❌ Error:", result.answer);
    }

    console.log("");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log(`
  🟣 AURORA AGENT - TradeShare 2025

  Uso:
    node aurora-kimi-agent.mjs                    # Modo interactivo
    node aurora-kimi-agent.mjs "tu pregunta"     # Pregunta única
    node aurora-kimi-agent.mjs --status          # Ver estado
    node aurora-kimi-agent.mjs --clear           # Limpiar historial

  Configuración:
    Agrega tu NVIDIA_API_KEY a .env.nvidia
    Obtén tu token en: https://ngcp.nvidia.com/

  Modelos disponibles:
    - moonshotai/kimi-k2-instruct (default)
    - moonshotai/kimi-k2.5
    - deepseek-ai/deepseek-chat
    - z-ai/glm-4.7
  `);
    process.exit(0);
  }

  if (args[0] === "--status") {
    console.log(JSON.stringify(agent.status(), null, 2));
    process.exit(0);
  }

  if (args[0] === "--clear") {
    const result = agent.clearHistory();
    console.log(result.message);
    process.exit(0);
  }

  if (args[0] === "--interactive" || args[0] === "-i") {
    runInteractive();
  } else {
    const prompt = args.join(" ");
    console.log("🤖 Aurora Agent responde...\n");

    agent.chat(prompt).then((result) => {
      if (result.ok) {
        console.log(result.answer);
      } else {
        console.log("❌", result.answer);
      }
      process.exit(result.ok ? 0 : 1);
    });
  }
}

export async function askKimi(message, options = {}) {
  return await agent.chat(message, options);
}

export async function askKimiWithContext(message, context = {}) {
  const contextStr = Array.isArray(context.filesToEdit) && context.filesToEdit.length > 0
    ? `Contexto - Archivos actuales: ${context.filesToEdit.join(", ")}\n\nTarea actual: ${context.currentTask || 'N/A'}\n\n${message}`
    : message;
  return await agent.chat(contextStr, context);
}

export function getKimiStatus() {
  return agent.status();
}

export { AuroraAgent, agent };
