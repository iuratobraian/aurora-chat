#!/usr/bin/env node

import readline from 'readline';

const API_KEY = process.env.MOONSHOT_API_KEY;
if (!API_KEY) {
  console.error('ERROR: MOONSHOT_API_KEY environment variable is required');
  console.error('Obtén una key en https://platform.moonshot.ai/console');
  process.exit(1);
}
const MODEL = process.env.MOONSHOT_DEFAULT_MODEL || 'kimi-k2-0905-preview';
const BASE_URL = 'https://api.moonshot.ai/v1';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const messages = [
  { role: 'system', content: 'Eres Kimi, un asistente de IA útil y amigable. Respondes en español.' }
];

async function chat(userInput) {
  messages.push({ role: 'user', content: userInput });
  
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_completion_tokens: 1024
    })
  });

  const data = await response.json();
  
  if (data.error) {
    console.log('\n❌ Error:', data.error.message);
    return;
  }

  const reply = data.choices[0].message.content;
  messages.push({ role: 'assistant', content: reply });
  console.log('\n🤖 Kimi:', reply);
}

function ask() {
  rl.question('\n👤 Tú: ', async (input) => {
    if (input.toLowerCase() === 'salir' || input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    await chat(input);
    ask();
  });
}

console.log('='.repeat(50));
console.log('🟢 Kimi Chat Terminal');
console.log(' Modelo:', MODEL);
console.log(' Escribe "salir" para terminar');
console.log('='.repeat(50));
ask();
