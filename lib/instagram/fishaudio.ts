import logger from '../utils/logger';

const FISH_AUDIO_BASE_URL = 'https://api.fish.audio/v1';

export interface FishAudioConfig {
  apiKey: string;
  defaultModel?: string;
}

export interface TextToSpeechRequest {
  text: string;
  model?: string;
  reference_audio?: string;
  reference_text?: string;
  language?: string;
  speed?: number;
}

export interface TextToSpeechResponse {
  audioUrl?: string;
  audioBase64?: string;
  duration: number;
  model: string;
}

export interface VoiceModel {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  created_at?: string;
}

const DEFAULT_CONFIG: FishAudioConfig = {
  apiKey: process.env.FISH_AUDIO_API_KEY || '',
  defaultModel: 'any',
};

class FishAudioService {
  private config: FishAudioConfig;

  constructor(config: Partial<FishAudioConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  setDefaultModel(model: string): void {
    this.config.defaultModel = model;
  }

  private getHeaders(): HeadersInit {
    if (!this.config.apiKey) {
      throw new Error('Fish.Audio API key not configured. Set FISH_AUDIO_API_KEY in environment.');
    }
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    if (!this.config.apiKey) {
      throw new Error('Fish.Audio API key not configured');
    }

    const model = request.model || this.config.defaultModel || 'any';

    try {
      const body: Record<string, unknown> = {
        text: request.text,
        model: model,
      };

      if (request.reference_audio) {
        body.reference_audio = request.reference_audio;
      }
      if (request.reference_text) {
        body.reference_text = request.reference_text;
      }
      if (request.language) {
        body.language = request.language;
      }
      if (request.speed !== undefined) {
        body.speed = request.speed;
      }

      const response = await fetch(`${FISH_AUDIO_BASE_URL}/tts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Fish.Audio TTS error: ${response.status} - ${error.detail || error.message || response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      logger.info('[Fish.Audio] TTS generated', {
        model,
        textLength: request.text.length,
        size: arrayBuffer.byteLength,
      });

      return {
        audioBase64: base64,
        audioUrl: `data:audio/mpeg;base64,${base64}`,
        duration: Math.ceil(request.text.split(' ').length / 4),
        model,
      };
    } catch (error) {
      logger.error('[Fish.Audio] TTS failed:', error);
      throw error;
    }
  }

  async getModels(): Promise<VoiceModel[]> {
    if (!this.config.apiKey) {
      throw new Error('Fish.Audio API key not configured');
    }

    try {
      const response = await fetch(`${FISH_AUDIO_BASE_URL}/model`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Fish.Audio API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      logger.error('[Fish.Audio] Get models failed:', error);
      throw error;
    }
  }

  async cloneVoice(audioUrl: string, name: string): Promise<{ voice_id: string }> {
    if (!this.config.apiKey) {
      throw new Error('Fish.Audio API key not configured');
    }

    try {
      const response = await fetch(`${FISH_AUDIO_BASE_URL}/voice/clone`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          audio_url: audioUrl,
          name: name,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Fish.Audio clone error: ${response.status} - ${error.detail || error.message || response.statusText}`
        );
      }

      const data = await response.json();

      logger.info('[Fish.Audio] Voice cloned', {
        voiceId: data.voice_id,
        name,
      });

      return data;
    } catch (error) {
      logger.error('[Fish.Audio] Voice clone failed:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }
}

export const fishAudioService = new FishAudioService();
export default fishAudioService;

export const FISH_AUDIO_VOICES = {
  ESPANOL: [
    { id: 'any', name: 'Genérico', description: 'Voz neutral en español' },
  ],
  INGLES: [
    { id: 'any', name: 'Genérico', description: 'Voz neutral en inglés' },
  ],
  PORTUGUES: [
    { id: 'any', name: 'Genérico', description: 'Voz neutral en portugués' },
  ],
} as const;

export const LANGUAGE_MAP: Record<string, string> = {
  es: 'es',
  en: 'en',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  it: 'it',
};
