import { fetch } from 'undici';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// 1. Cargar variables de entorno
const envFile = path.join(process.cwd(), '.env.aurora');
const env = await readFile(envFile, 'utf8');
env.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) process.env[key.trim()] = val.trim();
});

// 2. Configurar prompt para el Briefing Estratégico
const defaultTasks = `1. [AUDIT-001]: Implementar validación de deviceFingerprint en refresco de JWT.
2. [AUDIT-002]: Agregar idempotency keys en pagos (MercadoPago/Stripe) para evitar duplicados.
3. [AUDIT-003]: Restringir suscripciones a señales y copy trading a usuarios con KYC Verificado.
4. [HIVE-008]: Corregir fallos en Aurora Hive Dashboard (Botón de audio y despacho de prompts).`;

const customTasks = process.argv.slice(2).join('\n') || defaultTasks;

const prompt = `Eres GEMMA-4, arquitecta senior de software.
Genera un BRIEFING ESTRATÉGICO para las siguientes tareas:

[OBJETIVOS]:
${customTasks}

Entrega en español:
1. Estrategia de implementación CORE.
2. Riesgos técnicos identificados.
3. Stack y patrones recomendados.
4. Consideraciones de performance y seguridad.

Responde en formato markdown conciso.`;

// 3. Llamar a la API de Gemini (Gemma-4)
const apiKey = process.env.GEMINI_API_KEY;
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

console.log('🧠 GEMMA-4: GENERANDO BRIEFING ESTRATÉGICO...\n');

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
    console.log('⚠️ Sin respuesta válida de Gemma:', JSON.stringify(data).substring(0, 500));
  }
} catch (err) {
  console.error('❌ Error de conexión con Gemma:', err.message);
}
