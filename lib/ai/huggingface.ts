import logger from "../../serverLogger";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

export interface HFInferenceOptions {
  model?: string;
  inputs: any;
  parameters?: Record<string, any>;
  options?: {
    use_cache?: boolean;
    wait_for_model?: boolean;
  };
}

export const huggingface = {
  /**
   * General Inference API call
   */
  async infer(options: HFInferenceOptions) {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HuggingFace API Key not configured');
    }

    const model = options.model || 'gpt2';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: options.inputs,
        parameters: options.parameters,
        options: options.options,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[HF Inference] Error from ${model}:`, errorText);
      throw new Error(`HF API error: ${response.status} - ${errorText}`);
    }

    // Determine response type
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('image/')) {
      const buffer = await response.arrayBuffer();
      return {
        image: `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`,
        type: 'image',
      };
    } else {
      return await response.text();
    }
  },

  /**
   * Text Generation
   */
  async generateText(prompt: string, model = 'facebook/bart-large-cnn') {
    return this.infer({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
      }
    });
  },

  /**
   * Image Generation (Flux or SDXL)
   */
  async generateImage(prompt: string, model = 'black-forest-labs/FLUX.1-schnell') {
    return this.infer({
      model,
      inputs: prompt,
      parameters: {
        width: 1024,
        height: 1024,
      }
    });
  },
  
  /**
   * Chat with a model (Mistral, Llama, etc.)
   */
  async chat(messages: {role: string, content: string}[], model = 'mistralai/Mistral-7B-Instruct-v0.3') {
    const prompt = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n');
    return this.infer({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        return_full_text: false,
      }
    });
  }
};

export default huggingface;
