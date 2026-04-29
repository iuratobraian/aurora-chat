import { fetch } from 'undici';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function run() {
  // 1. Cargar variables de entorno
  const envFile = path.join(process.cwd(), '.env.aurora');
  let env;
  try {
    env = await readFile(envFile, 'utf8');
  } catch (err) {
    console.error('Error: No se pudo leer .env.aurora. Asegúrate de que el archivo existe.');
    process.exit(1);
  }

  env.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) process.env[key.trim()] = rest.join('=').trim();
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY no encontrada en .env.aurora');
    process.exit(1);
  }

  // 2. Cargar el plan
  const planFile = 'C:/Users/iurato/.gemini/antigravity/brain/3c23ac6e-bb9d-432c-a1f7-f15056a6350e/implementation_plan.md';
  let planContent;
  try {
    planContent = await readFile(planFile, 'utf8');
  } catch (err) {
    console.error('Error: No se pudo leer implementation_plan.md');
    process.exit(1);
  }

  // 3. Configurar prompt
  const prompt = `Eres GEMMA-4, arquitecta senior de software.
He creado el siguiente plan de implementación para optimizar el sector de Instagram Marketing en TradeShare.
El usuario reportó que el botón "Gestionar" no funciona y que tras desconectar una cuenta no puede volver a conectarla.

REVISA EL SIGUIENTE PLAN:

${planContent}

Dime si la estrategia es correcta, si falta algo crítico o si hay riesgos técnicos que no he visto.
Responde en español, formato markdown conciso.`;

  // 4. Llamar a la API
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent';

  const body = {
    system_instruction: {
      parts: [{ text: 'Eres GEMMA-4, arquitecta senior de software. Responde siempre en español.' }]
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192
    }
  };

  console.log('💎 CONSULTANDO A GEMMA-4 SOBRE EL PLAN...\n');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s!

  try {
    const res = await fetch(`${baseUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await res.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log(data.candidates[0].content.parts[0].text);
    } else {
      console.log('⚠️ Sin respuesta válida de Gemma:', JSON.stringify(data, null, 2).substring(0, 500));
    }
  } catch (err) {
    console.error('❌ Error llamando a Gemma:', err.message);
  }
}

run();
