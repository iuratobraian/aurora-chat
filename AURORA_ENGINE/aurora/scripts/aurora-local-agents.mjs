import { execSync } from "node:child_process";
import { loadAuroraEnv } from "./load-aurora-env.mjs";

loadAuroraEnv();

function safeExec(command) {
  try {
    return execSync(command, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8"
    }).trim();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function parseOllamaList(output) {
  if (!output || typeof output !== "string") return [];
  const lines = output.split(/\r?\n/).slice(1).filter(Boolean);
  return lines.map((line) => {
    const parts = line.trim().split(/\s{2,}/);
    return {
      nombre: parts[0] || "desconocido",
      id: parts[1] || "",
      tamano: parts[2] || "",
      modificado: parts[3] || ""
    };
  });
}

export function getLocalAgentStatus() {
  const ollamaPath = safeExec('powershell.exe -NoProfile -Command "(Get-Command ollama).Source"');
  const opencodePath = safeExec('powershell.exe -NoProfile -Command "(Get-Command opencode).Source"');
  const codexPath = safeExec('powershell.exe -NoProfile -Command "(Get-Command codex).Source"');
  const qwenPath = safeExec('powershell.exe -NoProfile -Command "(Get-Command qwen).Source"');
  const ollamaList = safeExec("ollama list");
  const opencodeVersion = safeExec("opencode --version");
  const codexVersion = safeExec("codex --version");
  const qwenVersion = safeExec("qwen --version");

  return {
    ollama: {
      instalado: typeof ollamaPath === "string" && Boolean(ollamaPath),
      ruta: typeof ollamaPath === "string" ? ollamaPath : null,
      modelos: typeof ollamaList === "string" ? parseOllamaList(ollamaList) : [],
      error: typeof ollamaList === "string" ? null : ollamaList.error
    },
    opencode: {
      instalado: typeof opencodePath === "string" && Boolean(opencodePath),
      ruta: typeof opencodePath === "string" ? opencodePath : null,
      version: typeof opencodeVersion === "string" ? opencodeVersion : null,
      error: typeof opencodeVersion === "string" ? null : opencodeVersion.error
    },
    codex: {
      instalado: typeof codexPath === "string" && Boolean(codexPath),
      ruta: typeof codexPath === "string" ? codexPath : null,
      version: typeof codexVersion === "string" ? codexVersion : null,
      cloud: typeof codexPath === "string" && Boolean(codexPath),
      error: typeof codexVersion === "string" ? null : codexVersion.error
    },
    qwen: {
      instalado: typeof qwenPath === "string" && Boolean(qwenPath),
      ruta: typeof qwenPath === "string" ? qwenPath : null,
      version: typeof qwenVersion === "string" ? qwenVersion : null,
      error: typeof qwenVersion === "string" ? null : qwenVersion.error
    }
  };
}

export async function askOllama(prompt, model) {
  const status = getLocalAgentStatus();
  if (!status.ollama.instalado) {
    return { ok: false, provider: "ollama", answer: "Ollama no esta disponible en esta PC." };
  }

  const selectedModel = model || status.ollama.modelos[0]?.nombre;
  if (!selectedModel) {
    return { ok: false, provider: "ollama", answer: "Ollama esta instalado pero no hay modelos listados." };
  }

  const system = `Eres Aurora, la Mente Maestra y orquestadora de agentes del proyecto TradeShare. 
Tu objetivo es ayudar al usuario a gestionar tareas, código y coordinación del equipo de agentes (Codex, Qwen, OpenCode). 
Responde de forma concisa, técnica y proactiva. Si el usuario pide ejecutar un protocolo o tarea, confírmalo.`

  const response = await fetch(process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: selectedModel,
      system,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      provider: "ollama",
      answer: `Ollama respondio con estado ${response.status}.`
    };
  }

  const data = await response.json();
  return {
    ok: true,
    provider: "ollama",
    model: selectedModel,
    answer: data.response || "Ollama no devolvio texto."
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(JSON.stringify(getLocalAgentStatus(), null, 2));
}
