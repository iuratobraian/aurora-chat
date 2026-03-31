import logger from '../utils/logger';

export interface ContentGenerationRequest {
  type: 'caption' | 'hashtags' | 'content_ideas' | 'comment_reply';
  context?: {
    topic?: string;
    niche?: string;
    tone?: 'professional' | 'casual' | 'educational' | 'promotional';
    targetAudience?: string;
    keywords?: string[];
    existingCaption?: string;
    commentText?: string;
  };
  language?: 'es' | 'en' | 'pt';
  maxLength?: number;
}

export interface GeneratedContent {
  caption?: string;
  hashtags?: string[];
  ideas?: ContentIdea[];
  reply?: string;
  score?: number;
}

export interface ContentIdea {
  title: string;
  caption: string;
  hashtags: string[];
  suggestedImage?: string;
  confidence: number;
}

const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: {
      caption: 'gpt-4o-mini',
      hashtags: 'gpt-4o-mini',
      content: 'gpt-4o',
      reply: 'gpt-4o-mini',
    },
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: {
      caption: 'claude-3-5-haiku-20241022',
      hashtags: 'claude-3-5-haiku-20241022',
      content: 'claude-3-5-sonnet-20241022',
      reply: 'claude-3-5-haiku-20241022',
    },
  },
  google: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      caption: 'gemini-1.5-flash',
      hashtags: 'gemini-1.5-flash',
      content: 'gemini-1.5-pro',
      reply: 'gemini-1.5-flash',
    },
  },
} as const;

const SYSTEM_PROMPTS = {
  caption: {
    es: `Eres un experto creador de captions para Instagram en el nicho de trading y finanzas. 
Crea captions que:
- Sean atractivos y generen engagement
- Incluyan llamados a la acción cuando sea apropiado
- Usen emojis estratégicamente (no excesivos)
- Tengan entre 150-300 caracteres para mejor alcance
- Incluyan una pregunta para fomentar comentarios
- Mantengan un tono profesional pero accesible`,
    en: `You are an expert Instagram caption creator in the trading and finance niche.
Create captions that:
- Are engaging and generate engagement
- Include calls to action when appropriate
- Use emojis strategically (not excessive)
- Are 150-300 characters for optimal reach
- Include a question to encourage comments
- Maintain a professional but accessible tone`,
    pt: `Você é um especialista em criar legendas para Instagram no nicho de trading e finanças.
Crie legendas que:
- Sejam envolventes e gerem engajamento
- Incluam chamados para ação quando apropriado
- Usem emojis estrategicamente (não excessivos)
- Tenham entre 150-300 caracteres para melhor alcance
- Incluam uma pergunta para fomentar comentários
- Mantenham um tom profissional mas acessível`,
  },
  hashtags: {
    es: `Eres un experto en SEO y marketing en Instagram para el nicho de trading.
Genera una lista de 10-15 hashtags relevantes que:
- Combinen hashtags populares con algunos de nicho específico
- Sean relevantes para el contenido descrito
- Ayuden a alcanzar a la audiencia objetivo
- NO incluyas hashtags genéricos como #follow o #like`,
    en: `You are an expert in SEO and Instagram marketing for the trading niche.
Generate a list of 10-15 relevant hashtags that:
- Mix popular hashtags with niche-specific ones
- Are relevant to the described content
- Help reach the target audience
- DO NOT include generic hashtags like #follow or #like`,
    pt: `Você é um especialista em SEO e marketing no Instagram para o nicho de trading.
Gere uma lista de 10-15 hashtags relevantes que:
- Misturem hashtags populares com alguns específicos de nicho
- Sejam relevantes para o conteúdo descrito
- Ajudem a alcançar o público-alvo
- NÃO incluam hashtags genéricas como #follow ou #like`,
  },
  content_ideas: {
    es: `Eres un experto en estrategia de contenido para Instagram en trading.
Genera 3 ideas de contenido para posts que:
- Sean variados en formato y enfoque
- Tengan potencial de alto engagement
- Sean apropiados para el nicho definido
- Incluyan el tipo de contenido (imagen, video, carrusel)
- Consideren las mejores prácticas actuales de Instagram`,
    en: `You are an expert in Instagram content strategy for trading.
Generate 3 content ideas for posts that:
- Are varied in format and approach
- Have high engagement potential
- Are appropriate for the defined niche
- Include the content type (image, video, carousel)
- Consider current Instagram best practices`,
    pt: `Você é um especialista em estratégia de conteúdo para Instagram em trading.
Gere 3 ideias de conteúdo para posts que:
- Sejam variadas em formato e abordagem
- Tenham potencial de alto engajamento
- Sejam apropriadas para o nicho definido
- Incluam o tipo de conteúdo (imagem, vídeo, carrossel)
- Considerem as melhores práticas atuais do Instagram`,
  },
  reply: {
    es: `Eres un asistente de Instagram especializado en trading que responde a comentarios de manera:
- Amigable y profesional
- Breve (máximo 100 caracteres)
- Útil y informativa
- Natural, no robótica
- Appropriate para la pregunta del usuario`,
    en: `You are an Instagram assistant specialized in trading that responds to comments:
- Friendly and professional
- Brief (maximum 100 characters)
- Useful and informative
- Natural, not robotic
- Appropriate for the user's question`,
    pt: `Você é um assistente do Instagram especializado em trading que responde a comentários:
- Amigável e profissional
- Breve (máximo 100 caracteres)
- Útil e informativa
- Natural, não robótica
- Apropriada para a pergunta do usuário`,
  },
};

async function generateWithOpenAI(
  prompt: string,
  systemPrompt: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function generateWithAnthropic(
  prompt: string,
  systemPrompt: string,
  model: string = 'claude-3-5-haiku-20241022'
): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function generateWithGoogle(
  prompt: string,
  systemPrompt: string,
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateCaption(
  context: ContentGenerationRequest['context'],
  language: 'es' | 'en' | 'pt' = 'es',
  provider: 'openai' | 'anthropic' | 'google' = 'openai'
): Promise<string> {
  const lang = language || 'es';
  const systemPrompt = SYSTEM_PROMPTS.caption[lang];
  
  const prompt = `Crea un caption para Instagram sobre:
Tema: ${context?.topic || 'trading y finanzas'}
Nicho: ${context?.niche || 'trading'}
Tono: ${context?.tone || 'professional'}
Audiencia: ${context?.targetAudience || 'traders principiantes e intermedios'}
Keywords: ${context?.keywords?.join(', ') || 'trading, forex, inversiones'}

${context?.existingCaption ? `Caption actual para mejorar: "${context.existingCaption}"` : ''}`;

  switch (provider) {
    case 'anthropic':
      return generateWithAnthropic(prompt, systemPrompt, AI_PROVIDERS.anthropic.models.caption);
    case 'google':
      return generateWithGoogle(prompt, systemPrompt, AI_PROVIDERS.google.models.caption);
    default:
      return generateWithOpenAI(prompt, systemPrompt, AI_PROVIDERS.openai.models.caption);
  }
}

export async function generateHashtags(
  context: ContentGenerationRequest['context'],
  language: 'es' | 'en' | 'pt' = 'es',
  provider: 'openai' | 'anthropic' | 'google' = 'openai'
): Promise<string[]> {
  const lang = language || 'es';
  const systemPrompt = SYSTEM_PROMPTS.hashtags[lang];
  
  const prompt = `Genera hashtags para contenido sobre:
Tema: ${context?.topic || 'trading'}
Nicho: ${context?.niche || 'forex, crypto'}
Audiencia: ${context?.targetAudience || 'traders'}
Keywords relevantes: ${context?.keywords?.join(', ') || 'forex, trading, inversiones'}

Devuelve SOLO los hashtags separados por espacios, sin explicación.`;

  let result: string;
  
  switch (provider) {
    case 'anthropic':
      result = await generateWithAnthropic(prompt, systemPrompt, AI_PROVIDERS.anthropic.models.hashtags);
      break;
    case 'google':
      result = await generateWithGoogle(prompt, systemPrompt, AI_PROVIDERS.google.models.hashtags);
      break;
    default:
      result = await generateWithOpenAI(prompt, systemPrompt, AI_PROVIDERS.openai.models.hashtags);
  }

  return result
    .split(/[\s,#]+/)
    .filter(tag => tag.length > 2 && tag.length < 30)
    .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    .slice(0, 15);
}

export async function generateContentIdeas(
  context: ContentGenerationRequest['context'],
  language: 'es' | 'en' | 'pt' = 'es',
  provider: 'openai' | 'anthropic' | 'google' = 'openai'
): Promise<ContentIdea[]> {
  const lang = language || 'es';
  const systemPrompt = SYSTEM_PROMPTS.content_ideas[lang];
  
  const prompt = `Genera 3 ideas de contenido para posts de Instagram sobre:
Tema: ${context?.topic || 'trading'}
Nicho: ${context?.niche || 'forex y crypto trading'}
Tono: ${context?.tone || 'educational'}
Audiencia: ${context?.targetAudience || 'traders principiantes'}

Devuelve en formato JSON:
{
  "ideas": [
    {
      "title": "título corto",
      "caption": "caption sugerido",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "suggestedImage": "descripción de imagen sugerida",
      "confidence": 0.85
    }
  ]
}`;

  let result: string;
  
  switch (provider) {
    case 'anthropic':
      result = await generateWithAnthropic(prompt, systemPrompt, AI_PROVIDERS.anthropic.models.content);
      break;
    case 'google':
      result = await generateWithGoogle(prompt, systemPrompt, AI_PROVIDERS.google.models.content);
      break;
    default:
      result = await generateWithOpenAI(prompt, systemPrompt, AI_PROVIDERS.openai.models.content);
  }

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.ideas || [];
    }
  } catch {
    logger.error('Failed to parse AI response as JSON');
  }

  return [];
}

export async function generateCommentReply(
  commentText: string,
  context: ContentGenerationRequest['context'],
  language: 'es' | 'en' | 'pt' = 'es',
  provider: 'openai' | 'anthropic' | 'google' = 'openai'
): Promise<string> {
  const lang = language || 'es';
  const systemPrompt = SYSTEM_PROMPTS.reply[lang];
  
  const prompt = `Responde al siguiente comentario de manera apropiada:
Comentario: "${commentText}"
Contexto adicional: ${context?.topic || 'trading'}`;

  switch (provider) {
    case 'anthropic':
      return generateWithAnthropic(prompt, systemPrompt, AI_PROVIDERS.anthropic.models.reply);
    case 'google':
      return generateWithGoogle(prompt, systemPrompt, AI_PROVIDERS.google.models.reply);
    default:
      return generateWithOpenAI(prompt, systemPrompt, AI_PROVIDERS.openai.models.reply);
  }
}

export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const { type, context, language = 'es' } = request;
  
  const provider = (import.meta.env.VITE_AI_PROVIDER as any) || 'openai';

  switch (type) {
    case 'caption':
      return { caption: await generateCaption(context, language, provider) };
    case 'hashtags':
      return { hashtags: await generateHashtags(context, language, provider) };
    case 'content_ideas':
      return { ideas: await generateContentIdeas(context, language, provider) };
    case 'comment_reply':
      if (!context?.commentText) {
        throw new Error('commentText is required for comment_reply type');
      }
      return { reply: await generateCommentReply(context.commentText, context, language, provider) };
    default:
      throw new Error(`Unknown generation type: ${type}`);
  }
}

export const contentGenerator = {
  generateCaption,
  generateHashtags,
  generateContentIdeas,
  generateCommentReply,
  generateContent,
  providers: AI_PROVIDERS,
};

export default contentGenerator;
