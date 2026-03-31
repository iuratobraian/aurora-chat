import React, { useState, useRef, useCallback } from 'react';
import logger from '../../utils/logger';

interface EnhancementSettings {
  removeBackgroundNoise: boolean;
  normalizeAudio: boolean;
  enhanceSpeech: boolean;
  reduceReverb: boolean;
  volume: number;
  equalizer: {
    low: number;
    mid: number;
    high: number;
  };
}

interface AudioEnhancerProps {
  onAudioEnhanced?: (audioUrl: string, cloudinaryUrl?: string) => void;
  compact?: boolean;
}

const AudioEnhancer: React.FC<AudioEnhancerProps> = ({
  onAudioEnhanced,
  compact = false,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [enhancedAudio, setEnhancedAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [settings, setSettings] = useState<EnhancementSettings>({
    removeBackgroundNoise: true,
    normalizeAudio: true,
    enhanceSpeech: true,
    reduceReverb: false,
    volume: 100,
    equalizer: { low: 50, mid: 50, high: 50 },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Solo se permiten archivos de audio');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo supera el límite de 50 MB');
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setEnhancedAudio(null);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setEnhancedAudio(null);
      setError(null);
    }
  }, []);

  const handleProcess = async () => {
    if (!audioUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = document.createElement('canvas');
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = offlineContext.createGain();
      gainNode.gain.value = settings.volume / 100;

      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      const wav = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const enhancedUrl = URL.createObjectURL(blob);

      setEnhancedAudio(enhancedUrl);

      logger.info('[AudioEnhancer] Audio processed', {
        settings,
        originalSize: audioFile?.size,
      });
    } catch (err) {
      logger.error('[AudioEnhancer] Processing failed:', err);
      setError('Error procesando el audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadToCloudinary = async (url: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `enhanced_${Date.now()}.wav`, { type: 'audio/wav' });

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
        return data.secure_url;
      }
      return null;
    } catch (err) {
      logger.error('[AudioEnhancer] Upload failed:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseEnhanced = async () => {
    if (!enhancedAudio) return;
    
    const cloudinaryUrl = await uploadToCloudinary(enhancedAudio);
    onAudioEnhanced?.(enhancedAudio, cloudinaryUrl || undefined);
  };

  const handleDownload = () => {
    if (!enhancedAudio) return;
    
    const link = document.createElement('a');
    link.href = enhancedAudio;
    link.download = `enhanced_${Date.now()}.wav`;
    link.click();
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <label className="flex items-center justify-center gap-2 px-4 py-6 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-gray-400">upload_file</span>
          <span className="text-sm text-gray-400">Subir audio</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        
        {audioFile && (
          <div className="p-3 bg-white/5 rounded-xl">
            <p className="text-xs text-white truncate">{audioFile.name}</p>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="mt-2 w-full py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold"
            >
              {isProcessing ? 'Procesando...' : 'Mejorar Audio'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400">music_note</span>
          Mejorador de Audio
        </h3>

        {!audioUrl ? (
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center gap-4 py-12 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 hover:border-cyan-500/30 transition-all"
          >
            <span className="material-symbols-outlined text-5xl text-gray-500">audio_file</span>
            <div className="text-center">
              <p className="text-white font-medium">Arrastra tu audio aquí</p>
              <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <button
                onClick={togglePlayback}
                className="size-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all"
              >
                <span className="material-symbols-outlined">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="flex-1">
                <p className="text-white font-medium truncate">{audioFile?.name}</p>
                <p className="text-xs text-gray-400">
                  {(audioFile?.size! / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => { setAudioFile(null); setAudioUrl(null); setEnhancedAudio(null); }}
                className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Mejoras</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-all">
                  <input
                    type="checkbox"
                    checked={settings.removeBackgroundNoise}
                    onChange={(e) => setSettings(s => ({ ...s, removeBackgroundNoise: e.target.checked }))}
                    className="size-4 rounded accent-cyan-500"
                  />
                  <div>
                    <p className="text-sm text-white">Reducir Ruido</p>
                    <p className="text-xs text-gray-500">Elimina ruido de fondo</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-all">
                  <input
                    type="checkbox"
                    checked={settings.normalizeAudio}
                    onChange={(e) => setSettings(s => ({ ...s, normalizeAudio: e.target.checked }))}
                    className="size-4 rounded accent-cyan-500"
                  />
                  <div>
                    <p className="text-sm text-white">Normalizar</p>
                    <p className="text-xs text-gray-500">Nivela el volumen</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-all">
                  <input
                    type="checkbox"
                    checked={settings.enhanceSpeech}
                    onChange={(e) => setSettings(s => ({ ...s, enhanceSpeech: e.target.checked }))}
                    className="size-4 rounded accent-cyan-500"
                  />
                  <div>
                    <p className="text-sm text-white">Mejorar Voz</p>
                    <p className="text-xs text-gray-500">Claridad en diálogos</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-all">
                  <input
                    type="checkbox"
                    checked={settings.reduceReverb}
                    onChange={(e) => setSettings(s => ({ ...s, reduceReverb: e.target.checked }))}
                    className="size-4 rounded accent-cyan-500"
                  />
                  <div>
                    <p className="text-sm text-white">Reducir Reverberación</p>
                    <p className="text-xs text-gray-500">Menos eco</p>
                  </div>
                </label>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Volumen</span>
                  <span>{settings.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={settings.volume}
                  onChange={(e) => setSettings(s => ({ ...s, volume: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Bajos</span>
                    <span>{settings.equalizer.low}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.equalizer.low}
                    onChange={(e) => setSettings(s => ({ 
                      ...s, 
                      equalizer: { ...s.equalizer, low: Number(e.target.value) }
                    }))}
                    className="w-full accent-red-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Medios</span>
                    <span>{settings.equalizer.mid}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.equalizer.mid}
                    onChange={(e) => setSettings(s => ({ 
                      ...s, 
                      equalizer: { ...s.equalizer, mid: Number(e.target.value) }
                    }))}
                    className="w-full accent-green-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Altos</span>
                    <span>{settings.equalizer.high}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.equalizer.high}
                    onChange={(e) => setSettings(s => ({ 
                      ...s, 
                      equalizer: { ...s.equalizer, high: Number(e.target.value) }
                    }))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {enhancedAudio && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                  <span className="text-emerald-400 font-bold text-sm">Audio Mejorado</span>
                  {isUploading && (
                    <span className="text-xs text-gray-400 animate-pulse">Subiendo...</span>
                  )}
                </div>
                <audio controls className="w-full">
                  <source src={enhancedAudio} type="audio/wav" />
                </audio>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={handleUseEnhanced}
                    className="flex-1 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 text-sm font-bold"
                  >
                    Usar en Video
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin material-symbols-outlined">sync</span>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  Mejorar Audio
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const samples = buffer.length;
  const dataSize = samples * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return arrayBuffer;
}

export default AudioEnhancer;
