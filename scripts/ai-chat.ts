import 'dotenv/config';
// Mock del objeto import.meta.env para Node.js si no existe
if (!(globalThis as any).import) {
  (globalThis as any).import = { meta: { env: process.env } };
}

import enquirer from 'enquirer';
const { Select, Input } = enquirer as any;
import { aiOrchestrator } from '../src/services/ai/aiOrchestrator.js';
import { AIProviderId } from '../src/services/ai/types.js';
import { getEnv } from '../src/services/ai/env.js';

const COMMON_MODELS: Record<string, string[]> = {
  'groq': ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
  'openrouter': [
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-coder:free',
    'z-ai/glm-4.5-air:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-7b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free'
  ],
  'gemini': ['gemini-1.5-flash', 'gemini-1.5-pro'],
  'huggingface': ['facebook/bart-large-cnn', 'mistralai/Mistral-7B-v0.1']
};

interface ChatState {
  provider: AIProviderId;
  model: string;
}

async function configureChat(available: string[]): Promise<ChatState> {
  const providerPrompt = new Select({
    name: 'provider',
    message: 'Selecciona un proveedor de IA:',
    choices: available
  });

  const provider = await providerPrompt.run() as AIProviderId;

  const models = COMMON_MODELS[provider] || [];
  const modelPrompt = new Select({
    name: 'model',
    message: `Selecciona un modelo para ${provider}:`,
    choices: [...models, 'Escribir ID personalizado...']
  });

  let model = await modelPrompt.run();
  if (model === 'Escribir ID personalizado...') {
    const customPrompt = new Input({
      message: 'Ingresa el ID del modelo (ej. meta-llama/llama-3-8b-instruct:free):'
    });
    model = await customPrompt.run();
  }

  return { provider, model };
}

async function main() {
  console.log('\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
  console.log('\x1b[36m   TRADESHARE AI TERMINAL - INTERACTIVE CHAT      \x1b[0m');
  console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');

  const available = aiOrchestrator.getAvailableProviders();
  if (available.length === 0) {
    console.log('\x1b[31mError: No hay proveedores de IA configurados en .env\x1b[0m');
    process.exit(1);
  }

  let state = await configureChat(available);
  console.log(`\n\x1b[32mListo! Hablando con ${state.provider} (${state.model})\x1b[0m`);
  console.log('\x1b[2mComandos: /switch (cambiar IA), /exit (salir)\x1b[0m\n');

  const askPrompt = async () => {
    const inputPrompt = new Input({
      message: `\x1b[34m[Usted][${state.provider}]\x1b[0m`
    });

    const input = await inputPrompt.run();

    if (input.toLowerCase() === '/exit') {
       console.log('\n¡Hasta luego trader! 👋\n');
       process.exit(0);
    }

    if (input.toLowerCase() === '/switch') {
      state = await configureChat(available);
      console.log(`\n\x1b[32mCambiado a ${state.provider} (${state.model})\x1b[0m\n`);
      await askPrompt();
      return;
    }

    console.log(`\n\x1b[2m[Enviando solicitud a ${state.provider} (${state.model})...]\x1b[0m`);
    console.log(`\x1b[2m[Esto puede tardar unos segundos dependiendo de la saturación del API...]\x1b[0m`);
    
    try {
      const response = await aiOrchestrator.generate({ 
        prompt: input,
        model: state.model
      }, state.provider);
      
      console.log(`\n\x1b[33m[Aurora Agent] (${response.model}):\x1b[0m`);
      console.log(`${response.generatedText}\n`);
    } catch (error: any) {
      console.log(`\n\x1b[31mError: ${error.message}\x1b[0m\n`);
    }
    
    await askPrompt();
  };

  await askPrompt();
}

main().catch(err => {
  console.error('\x1b[31mError fatal:\x1b[0m', err);
  process.exit(1);
});
