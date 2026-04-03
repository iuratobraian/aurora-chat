// NVIDIA Kimi/DeepSeek Agent
// Uses NVIDIA NIM API for inference

interface EnvConfig {
  NVIDIA_API_KEY?: string;
  MODEL?: string; // kimimax or deepseek-v3
}

const DEFAULT_MODEL = 'kimimax';

export async function* chat(
  messages: { role: string; content: string }[],
  config: EnvConfig = {}
) {
  const model = config.MODEL || DEFAULT_MODEL;
  const apiKey = config.NVIDIA_API_KEY;
  
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY not configured');
  }

  const endpoint = model.includes('deepseek') 
    ? 'https://integrate.api.nvidia.com/v1/chat/completions'
    : 'https://integrate.api.nvidia.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model.includes('deepseek') ? 'deepseek-ai/deepseek-v3' : 'moonshotai/kimi-k2.5',
      messages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }
}

export const agent = {
  name: 'NVIDIA Kimi Agent',
  model: DEFAULT_MODEL,
  capabilities: ['coding', 'reasoning', 'analysis'],
  provider: 'NVIDIA NIM'
};
