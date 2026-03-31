import logger from '../utils/logger';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  modelId?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  modelId?: 'eleven_multilingual_v2' | 'eleven_v2' | 'eleven_turbo_v2';
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  languageCode?: string;
}

export interface TextToSpeechResponse {
  audioUrl?: string;
  audioBase64?: string;
  duration: number;
  voiceId: string;
  modelId: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

export interface AudioEnhancementOptions {
  remove_background_noise?: boolean;
  enhance_speech?: boolean;
  normalize_audio?: boolean;
}

const DEFAULT_CONFIG: ElevenLabsConfig = {
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  voiceId: 'EXAVITQu4vr4xnSDxMaL',
  modelId: 'eleven_multilingual_v2',
};

class ElevenLabsService {
  private config: ElevenLabsConfig;

  constructor(config: Partial<ElevenLabsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  setDefaultVoice(voiceId: string): void {
    this.config.voiceId = voiceId;
  }

  private getHeaders(): HeadersInit {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in environment.');
    }
    return {
      'Accept': 'application/json',
      'xi-api-key': this.config.apiKey,
    };
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = request.voiceId || this.config.voiceId;
    const modelId = request.modelId || this.config.modelId || 'eleven_multilingual_v2';

    const body: Record<string, unknown> = {
      text: request.text,
      model_id: modelId,
      voice_settings: {
        stability: request.voiceSettings?.stability ?? 0.5,
        similarity_boost: request.voiceSettings?.similarityBoost ?? 0.75,
        style: request.voiceSettings?.style ?? 0.5,
        use_speaker_boost: request.voiceSettings?.useSpeakerBoost ?? true,
      },
    };

    if (request.languageCode) {
      body.language_code = request.languageCode;
    }

    try {
      const response = await fetch(
        `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs TTS error: ${response.status} - ${error.message || response.statusText}`
        );
      }

      const data = await response.json();

      logger.info('[ElevenLabs] TTS generated', {
        voiceId,
        modelId,
        textLength: request.text.length,
        duration: data.duration || 0,
      });

      return {
        audioUrl: data.preview_url,
        audioBase64: data.audio_base64,
        duration: data.duration || 0,
        voiceId,
        modelId,
      };
    } catch (error) {
      logger.error('[ElevenLabs] TTS failed:', error);
      throw error;
    }
  }

  async textToSpeechStream(
    request: TextToSpeechRequest,
    onChunk?: (chunk: Uint8Array) => void
  ): Promise<Uint8Array> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = request.voiceId || this.config.voiceId;
    const modelId = request.modelId || this.config.modelId || 'eleven_multilingual_v2';

    const body: Record<string, unknown> = {
      text: request.text,
      model_id: modelId,
      voice_settings: {
        stability: request.voiceSettings?.stability ?? 0.5,
        similarity_boost: request.voiceSettings?.similarityBoost ?? 0.75,
        style: request.voiceSettings?.style ?? 0.5,
        use_speaker_boost: request.voiceSettings?.useSpeakerBoost ?? true,
      },
    };

    try {
      const response = await fetch(
        `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs TTS stream error: ${response.status} - ${error.message || response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioData = new Uint8Array(arrayBuffer);

      logger.info('[ElevenLabs] TTS stream generated', {
        voiceId,
        modelId,
        size: audioData.length,
      });

      return audioData;
    } catch (error) {
      logger.error('[ElevenLabs] TTS stream failed:', error);
      throw error;
    }
  }

  async getVoices(): Promise<Voice[]> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      logger.error('[ElevenLabs] Get voices failed:', error);
      throw error;
    }
  }

  async getVoiceSettings(voiceId: string): Promise<Record<string, unknown>> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}/settings`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('[ElevenLabs] Get voice settings failed:', error);
      throw error;
    }
  }

  async getModels(): Promise<Array<{ model_id: string; name: string; description: string }>> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      logger.error('[ElevenLabs] Get models failed:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }
}

export const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;

export const ELEVENLABS_VOICES = {
  ESPANOL: {
    female: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
      description: 'Español neutral, voz femenina cálida',
    },
    male: {
      voiceId: 'CYwZAkSkUdNQxY7cBexa',
      name: 'Diego',
      description: 'Español neutral, voz masculina profesional',
    },
  },
  INGLES: {
    female: {
      voiceId: 'XrFsEohJpTF5HTKo93pm',
      name: 'Sarah',
      description: 'Inglés estadounidense, voz femenina amigable',
    },
    male: {
      voiceId: 'pFZP5JQG7iQjIQuC4Bku',
      name: 'Charlie',
      description: 'Inglés estadounidense, voz masculina profesional',
    },
  },
  PORTUGUES: {
    female: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
      description: 'Portugués (usando modelo multilingüe)',
    },
  },
} as const;

export const LANGUAGE_MAP: Record<string, string> = {
  es: 'es',
  en: 'en',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  it: 'it',
};
