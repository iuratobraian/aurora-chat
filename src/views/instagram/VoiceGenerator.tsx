import React, { useState, useCallback } from 'react';
import logger from '../../utils/logger';

type Provider = 'elevenlabs' | 'fishaudio';

interface VoiceConfig {
  voiceId: string;
  name: string;
  language: 'es' | 'en' | 'pt';
  gender: 'female' | 'male';
  provider: Provider;
  description?: string;
}

interface SpeechGenerationOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  provider: Provider;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
}

const ELEVENLABS_VOICES: VoiceConfig[] = [
  { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'es', gender: 'female', provider: 'elevenlabs', description: 'Voz cálida y profesional' },
  { voiceId: 'CYwZAkSkUdNQxY7cBexa', name: 'Diego', language: 'es', gender: 'male', provider: 'elevenlabs', description: 'Voz profunda y autoritativa' },
  { voiceId: 'XrFsEohJpTF5HTKo93pm', name: 'Sarah', language: 'en', gender: 'female', provider: 'elevenlabs', description: 'American female voice' },
  { voiceId: 'pFZP5JQG7iQjIQuC4Bku', name: 'Charlie', language: 'en', gender: 'male', provider: 'elevenlabs', description: 'American male voice' },
  { voiceId: 'FGY2WhTYpP7Gdsc4CGbj', name: 'Grace', language: 'en', gender: 'female', provider: 'elevenlabs', description: 'British female voice' },
  { voiceId: 'oWAxZDx7w5VtjUsAxdZ7', name: 'James', language: 'en', gender: 'male', provider: 'elevenlabs', description: 'British male voice' },
];

const FISH_AUDIO_VOICES: VoiceConfig[] = [
  { voiceId: 'any', name: 'Genérico', language: 'es', gender: 'female', provider: 'fishaudio', description: 'Voz neutral multilingüe' },
  { voiceId: 'any', name: 'Narrador', language: 'es', gender: 'male', provider: 'fishaudio', description: 'Narración clara' },
  { voiceId: 'any', name: 'Emotivo', language: 'en', gender: 'female', provider: 'fishaudio', description: 'Expresivo y emotivo' },
  { voiceId: 'any', name: 'Profesional', language: 'en', gender: 'male', provider: 'fishaudio', description: 'Tono profesional' },
];

const ALL_VOICES = [...ELEVENLABS_VOICES, ...FISH_AUDIO_VOICES];

const MODEL_OPTIONS = [
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Soporta 28 idiomas', provider: 'elevenlabs' as Provider },
  { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Más rápido', provider: 'elevenlabs' as Provider },
  { id: 'eleven_v2', name: 'v2 Standard', description: 'Optimizado inglés', provider: 'elevenlabs' as Provider },
];

interface VoiceGeneratorProps {
  initialText?: string;
  onAudioGenerated?: (audioUrl: string, cloudinaryUrl?: string, duration?: number) => void;
  compact?: boolean;
}

const VoiceGenerator: React.FC<VoiceGeneratorProps> = ({
  initialText = '',
  onAudioGenerated,
  compact = false,
}) => {
  const [provider, setProvider] = useState<Provider>('elevenlabs');
  const [text, setText] = useState(initialText);
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(ELEVENLABS_VOICES[0]);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.5,
    speed: 1.0,
  });

  const filteredVoices = ALL_VOICES.filter(v => v.provider === provider && v.language === selectedVoice.language);

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    const voice = ALL_VOICES.find(v => v.provider === newProvider && v.gender === selectedVoice.gender) || ALL_VOICES.find(v => v.provider === newProvider);
    if (voice) setSelectedVoice(voice);
  };

  const uploadToCloudinary = async (audioDataUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(audioDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `voice_${Date.now()}.mp3`, { type: 'audio/mpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tradeshare_uploads');
      formData.append('resource_type', 'video');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dpm4bnral/video/upload`,
        { method: 'POST', body: formData }
      );

      const data = await uploadResponse.json();
      if (uploadResponse.ok && data.secure_url) {
        logger.info('[VoiceGenerator] Audio uploaded to Cloudinary', { url: data.secure_url });
        return data.secure_url;
      }
      return null;
    } catch (err) {
      logger.error('[VoiceGenerator] Cloudinary upload failed:', err);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Ingresa el texto para generar audio');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedAudio(null);
    setCloudinaryUrl(null);

    try {
      let endpoint = provider === 'elevenlabs' 
        ? '/api/elevenlabs/text-to-speech/stream'
        : '/api/fishaudio/tts';

      const body: Record<string, unknown> = provider === 'elevenlabs'
        ? {
            text,
            voiceId: selectedVoice.voiceId,
            modelId: selectedModel.id,
            voiceSettings: {
              stability: settings.stability,
              similarityBoost: settings.similarityBoost,
              style: settings.style,
            },
          }
        : {
            text,
            model: 'any',
            speed: settings.speed,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error generando audio');
      }

      const data = await response.json();
      const audioUrl = data.audioUrl || data.audio_base64;
      
      setGeneratedAudio(audioUrl);
      setAudioDuration(data.duration || Math.ceil(text.split(' ').length / 3));

      setIsUploading(true);
      const uploadedUrl = await uploadToCloudinary(audioUrl);
      setCloudinaryUrl(uploadedUrl);
      setIsUploading(false);

      onAudioGenerated?.(audioUrl, uploadedUrl || undefined, data.duration);

      logger.info('[VoiceGenerator] Audio generated', {
        provider,
        voiceId: selectedVoice.voiceId,
        duration: data.duration,
        uploaded: !!uploadedUrl,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error generando audio';
      setError(message);
      logger.error('[VoiceGenerator] Generation failed:', err);
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedAudio) return;
    
    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `voz_${Date.now()}.mp3`;
    link.click();
  };

  const handleUseInVideo = () => {
    if (cloudinaryUrl || generatedAudio) {
      onAudioGenerated?.(cloudinaryUrl || generatedAudio!, cloudinaryUrl || undefined, audioDuration);
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe el texto para convertir a voz..."
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-violet-500/50"
          rows={3}
        />
        
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => handleProviderChange('elevenlabs')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              provider === 'elevenlabs'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            ElevenLabs
          </button>
          <button
            onClick={() => handleProviderChange('fishaudio')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              provider === 'fishaudio'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            Fish.Audio
          </button>
        </div>

        <select
          value={selectedVoice.voiceId}
          onChange={(e) => {
            const voice = ALL_VOICES.find(v => v.voiceId === e.target.value && v.provider === provider);
            if (voice) setSelectedVoice(voice);
          }}
          className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
        >
          {filteredVoices.map((voice) => (
            <option key={`${voice.provider}-${voice.voiceId}`} value={voice.voiceId}>
              {voice.name} ({voice.gender === 'female' ? '♀' : '♂'})
            </option>
          ))}
        </select>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white text-sm font-bold disabled:opacity-50"
        >
          {isGenerating ? 'Generando...' : 'Generar'}
        </button>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400">record_voice_over</span>
            Generador de Voz IA
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleProviderChange('elevenlabs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                provider === 'elevenlabs'
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="size-2 rounded-full bg-violet-500" />
              ElevenLabs
            </button>
            <button
              onClick={() => handleProviderChange('fishaudio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                provider === 'fishaudio'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="size-2 rounded-full bg-cyan-500" />
              Fish.Audio
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
              Texto
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe o pega el texto que quieres convertir a voz..."
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-violet-500/50 font-mono text-sm"
              rows={4}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">{text.length} caracteres</p>
              <p className="text-xs text-gray-500">~{Math.ceil(text.split(' ').length / 3)} segundos</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Idioma
              </label>
              <div className="flex flex-col gap-1">
                {(['es', 'en', 'pt'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      const voice = ALL_VOICES.find(v => v.provider === provider && v.language === lang && v.gender === selectedVoice.gender) 
                        || ALL_VOICES.find(v => v.provider === provider && v.language === lang);
                      if (voice) setSelectedVoice(voice);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      selectedVoice.language === lang
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Português'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                {provider === 'elevenlabs' ? 'Modelo' : 'Estilo'}
              </label>
              {provider === 'elevenlabs' ? (
                <select
                  value={selectedModel.id}
                  onChange={(e) => {
                    const model = MODEL_OPTIONS.find(m => m.id === e.target.value);
                    if (model) setSelectedModel(model);
                  }}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                >
                  {MODEL_OPTIONS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speed}
                    onChange={(e) => setSettings(s => ({ ...s, speed: Number(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Lento</span>
                    <span>{settings.speed.toFixed(1)}x</span>
                    <span>Rápido</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Voz
              </label>
              <div className="grid grid-cols-2 gap-1">
                {filteredVoices.slice(0, 4).map((voice) => (
                  <button
                    key={`${voice.provider}-${voice.voiceId}`}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-2 rounded-lg border transition-all text-left ${
                      selectedVoice.voiceId === voice.voiceId && selectedVoice.provider === voice.provider
                        ? 'bg-violet-500/20 border-violet-500/30 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg">{voice.gender === 'female' ? '♀' : '♂'}</div>
                      <div className="font-bold text-xs truncate">{voice.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {provider === 'elevenlabs' && (
            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider font-bold">Ajustes Avanzados</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Estabilidad</span>
                    <span>{Math.round(settings.stability * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.stability * 100}
                    onChange={(e) => setSettings(s => ({ ...s, stability: Number(e.target.value) / 100 }))}
                    className="w-full accent-violet-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Similitud</span>
                    <span>{Math.round(settings.similarityBoost * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.similarityBoost * 100}
                    onChange={(e) => setSettings(s => ({ ...s, similarityBoost: Number(e.target.value) / 100 }))}
                    className="w-full accent-violet-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Estilo</span>
                    <span>{Math.round(settings.style * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.style * 100}
                    onChange={(e) => setSettings(s => ({ ...s, style: Number(e.target.value) / 100 }))}
                    className="w-full accent-violet-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {generatedAudio && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <span className="text-emerald-400 font-bold text-sm">Audio Generado</span>
                {isUploading && (
                  <span className="text-xs text-gray-400 animate-pulse">Subiendo a Cloud...</span>
                )}
                {cloudinaryUrl && (
                  <span className="text-xs text-emerald-400/60">✓ Guardado</span>
                )}
              </div>
              <span className="text-gray-400 text-xs">
                {Math.round(audioDuration)} segundos
              </span>
            </div>
            <audio controls className="w-full">
              <source src={generatedAudio} type="audio/mpeg" />
              Tu navegador no soporta audio
            </audio>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDownload}
                className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Descargar
              </button>
              <button
                onClick={handleUseInVideo}
                className="flex-1 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 text-sm font-bold hover:bg-violet-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">videocam</span>
                Usar en Video
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="mt-6 w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin material-symbols-outlined">sync</span>
              Generando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">play_arrow</span>
              Generar Voz
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceGenerator;

export { ALL_VOICES, ELEVENLABS_VOICES, FISH_AUDIO_VOICES, MODEL_OPTIONS };
export type { VoiceConfig, SpeechGenerationOptions, Provider };
