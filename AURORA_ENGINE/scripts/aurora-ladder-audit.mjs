import { fetch } from 'undici';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Cargar variables de entorno
const envFile = path.join(rootDir, '.env.aurora');
try {
  const env = await readFile(envFile, 'utf8');
  env.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
  });
} catch (e) {
  console.error('⚠️  No se pudo leer .env.aurora');
}

const MODELS = [
  "openai/gpt-oss-120b:free",
  "z-ai/glm-4.5-air:free",
  "tencent/hy3-preview:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "inclusionai/ling-2.6-flash:free"
];

async function callOpenRouter(model, prompt, code) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no encontrada");

  const systemMsg = `Eres un Ingeniero de Software Senior experto en TypeScript, React y Convex.
Tu tarea es revisar y refactorizar el código proporcionado.
REGLA ABSOLUTA: Responde ÚNICAMENTE con el código resultante.
PROHIBIDO explicaciones, introducciones o bloques de texto fuera del código.
Si el código ya es perfecto, devuélvelo tal cual.`;

  const userMsg = `Refactoriza y mejora este código paso a paso. Este es el paso en la escalera de revisión para el modelo ${model}.
Código actual:
\`\`\`
${code}
\`\`\``;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://trade-share-three.vercel.app',
      'X-Title': 'TradeShare Ladder Auditor'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg }
      ],
      temperature: 0.1
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(`Error en ${model}: ${data.error.message || JSON.stringify(data.error)}`);

  let content = data.choices?.[0]?.message?.content || "";
  
  // Limpiar bloques de código markdown si los hay
  content = content.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
  
  return content.trim();
}

const targetFiles = process.argv.slice(2);
if (targetFiles.length === 0) {
  console.error("Uso: node aurora-ladder-audit.mjs <archivo1> [archivo2] ...");
  process.exit(1);
}

for (const targetFile of targetFiles) {
  try {
    let currentCode = await readFile(path.join(rootDir, targetFile), 'utf8');
    console.log(`🚀 Iniciando ESCALERA DE REVISIÓN para: ${targetFile}`);
    console.log(`📊 Total de modelos: ${MODELS.length}\n`);

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      console.log(`[PASO ${i + 1}/${MODELS.length}] 🤖 Procesando con: ${model}...`);
      
      try {
        currentCode = await callOpenRouter(model, "", currentCode);
        console.log(`✅ Completado por ${model}\n`);
      } catch (err) {
        console.error(`❌ Fallo en ${model}: ${err.message}. Saltando al siguiente...`);
      }
    }

    const outputPath = path.join(rootDir, targetFile.replace(/(\.[\w]+)$/, '.ladder$1'));
    await writeFile(outputPath, currentCode, 'utf8');
    
    console.log(`✨ ESCALERA FINALIZADA para: ${targetFile} ✨`);
    console.log(`📝 Resultado guardado en: ${targetFile.replace(/(\.[\w]+)$/, '.ladder$1')}\n`);
    console.log("----------------------------------------------------------\n");

  } catch (err) {
    console.error(`🔴 ERROR en ${targetFile}: ${err.message}`);
  }
}
