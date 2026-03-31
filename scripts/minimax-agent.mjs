#!/usr/bin/env node
import { spawn } from "node:child_process";

const PROJECT_ROOT = "C:\\Users\\iurato\\Downloads\\tradeportal-2025-platinum";

function getEnvVar(name) {
  try {
    const fs = require("fs");
    const envPath = `${PROJECT_ROOT}\\.env.local`;
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(new RegExp(`${name}=(.+)`));
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return null;
}

const HF_TOKEN = getEnvVar("HF_TOKEN") || process.env.HF_TOKEN;

async function askMiniMax(prompt, options = {}) {
  if (!HF_TOKEN) {
    return { 
      ok: false, 
      provider: "minimax", 
      answer: "HF_TOKEN no configurado. Agrega 'HF_TOKEN=hf_xxxxx' a .env.local" 
    };
  }

  const maxTokens = options.maxTokens ?? 2048;
  const temperature = options.temperature ?? 1.0;

  const body = {
    model: "MiniMaxAI/MiniMax-M2.5",
    messages: [
      { role: "system", content: options.systemMessage || "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
    max_tokens: maxTokens,
    temperature
  };

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/MiniMaxAI/MiniMax-M2.5/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return { ok: false, provider: "minimax", answer: `Error ${response.status}: ${error}` };
    }

    const data = await response.json();
    return {
      ok: true,
      provider: "minimax",
      model: "MiniMaxAI/MiniMax-M2.5",
      answer: data.choices?.[0]?.message?.content || "Sin respuesta"
    };
  } catch (error) {
    return {
      ok: false,
      provider: "minimax",
      answer: error.message
    };
  }
}

const isMain = process.argv[1]?.endsWith("minimax-agent.mjs");

if (isMain || process.argv[1]?.includes("minimax")) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "--help") {
    console.log("=== MiniMax-M2.5 Agent ===");
    console.log("Estado:", HF_TOKEN ? "✅ Configurado" : "❌ HF_TOKEN no configurado");
    console.log("Modelo: MiniMaxAI/MiniMax-M2.5 (230B MoE, 10B active)");
    console.log("\nUso:");
    console.log("  node scripts/minimax-agent.mjs \"tu pregunta\"");
    console.log("\nConfiguración:");
    console.log("  Agrega HF_TOKEN a .env.local");
    console.log("  Obtén tu token en: https://huggingface.co/settings/tokens");
    process.exit(0);
  }

  const prompt = args.join(" ");
  console.log("💬 Pregunta:", prompt);
  console.log("\n🤖 MiniMax-M2.5 responde...\n");

  const result = await askMiniMax(prompt);
  
  if (result.ok) {
    console.log(result.answer);
  } else {
    console.log("❌", result.answer);
  }
}

export { askMiniMax };
