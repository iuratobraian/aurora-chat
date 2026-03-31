/**
 * smolagents Example - Framework oficial HF para agentes IA
 * Docs: https://huggingface.co/docs/smolagents
 * 
 * Uso: pip install smolagents[toolkit]
 */

import { CodeAgent } from 'smolagents';

async function main() {
  const agent = new CodeAgent({
    model: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
  });

  const task = 'Busca las últimas noticias sobre trading crypto y haz un resumen';
  const result = await agent.run(task);
  
  console.log('Resultado:', result);
}

// Si no tienes API key, usa HuggingFace Inference
import { InferenceAgent } from 'smolagents';

async function withHF() {
  const agent = new InferenceAgent({
    model: 'meta-llama/Llama-3-70b',
    apiToken: process.env.HF_TOKEN,
  });

  const result = await agent.run('Explica qué es HNSW indexing');
  console.log(result);
}

main().catch(console.error);
