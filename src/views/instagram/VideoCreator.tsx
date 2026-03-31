import React, { useState, useRef } from 'react';
import logger from '../../utils/logger';
import VoiceGenerator from './VoiceGenerator';
import AudioEnhancer from './AudioEnhancer';

interface VideoProject {
  id: string;
  name: string;
  script: string;
  audioUrl?: string;
  audioCloudinary?: string;
  backgroundImage?: string;
  backgroundUrl?: string;
  createdAt: number;
}

interface VideoCreatorProps {
  onVideoCreated?: (videoUrl: string) => void;
}

const VideoCreator: React.FC<VideoCreatorProps> = ({ onVideoCreated }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'projects'>('create');
  const [script, setScript] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [audioCloudinary, setAudioCloudinary] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdVideo, setCreatedVideo] = useState<string | null>(null);
  const [projects, setProjects] = useState<VideoProject[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioGenerated = (audioUrl: string, cloudinaryUrl?: string) => {
    setGeneratedAudio(audioUrl);
    setAudioCloudinary(cloudinaryUrl || null);
    logger.info('[VideoCreator] Audio ready', { cloudinaryUrl });
  };

  const handleBackgroundSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      logger.error('[VideoCreator] Invalid file type');
      return;
    }

    setBackgroundImage(file);
    const preview = URL.createObjectURL(file);
    setBackgroundPreview(preview);
  };

  const handleCreateVideo = async () => {
    if (!script.trim() || !generatedAudio) {
      logger.error('[VideoCreator] Missing script or audio');
      return;
    }

    setIsCreating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (backgroundPreview) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve();
            };
            img.onerror = () => {
              ctx.fillStyle = '#1a1a2e';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              resolve();
            };
            img.src = backgroundPreview;
          });
        } else {
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#1a1a2e');
          gradient.addColorStop(1, '#16213e');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.font = 'bold 48px Inter';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.textAlign = 'center';
          ctx.fillText('TradePortal', canvas.width / 2, canvas.height / 2);
        }

        const videoUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCreatedVideo(videoUrl);

        const newProject: VideoProject = {
          id: Date.now().toString(),
          name: script.slice(0, 30) + (script.length > 30 ? '...' : ''),
          script,
          audioUrl: generatedAudio,
          audioCloudinary: audioCloudinary || undefined,
          backgroundImage: backgroundPreview || undefined,
          createdAt: Date.now(),
        };
        setProjects(prev => [newProject, ...prev]);

        logger.info('[VideoCreator] Video created', { projectId: newProject.id });
      }
    } catch (err) {
      logger.error('[VideoCreator] Create failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!createdVideo) return;
    
    const link = document.createElement('a');
    link.href = createdVideo;
    link.download = `video_${Date.now()}.jpg`;
    link.click();
  };

  const handleSaveToCloudinary = async () => {
    if (!createdVideo) return;

    try {
      const response = await fetch(createdVideo);
      const blob = await response.blob();
      const file = new File([blob], `video_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tradeshare_uploads');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dpm4bnral/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await uploadResponse.json();
      if (uploadResponse.ok && data.secure_url) {
        onVideoCreated?.(data.secure_url);
        logger.info('[VideoCreator] Video saved to Cloudinary', { url: data.secure_url });
      }
    } catch (err) {
      logger.error('[VideoCreator] Cloudinary upload failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400">videocam</span>
            Creador de Videos
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              Crear
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">folder</span>
              Proyectos ({projects.length})
            </button>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Guion / Narración
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Escribe el guión de tu video..."
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-violet-500/50 font-mono text-sm"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Imagen de Fondo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 hover:border-violet-500/30 transition-all"
              >
                {backgroundPreview ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={backgroundPreview}
                      alt="Background"
                      className="size-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">{backgroundImage?.name}</p>
                      <p className="text-xs text-gray-400">Clic para cambiar</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-3xl text-gray-500">add_photo_alternate</span>
                    <div>
                      <p className="text-white font-medium">Subir imagen</p>
                      <p className="text-xs text-gray-400">O deja el fondo por defecto</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-400 text-lg">record_voice_over</span>
                  Generar Voz
                </h4>
                <VoiceGenerator
                  initialText={script}
                  onAudioGenerated={handleAudioGenerated}
                  compact
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-lg">music_note</span>
                  Mejorar Audio
                </h4>
                <AudioEnhancer
                  onAudioEnhanced={(url, cloudinary) => {
                    if (cloudinary) {
                      setAudioCloudinary(cloudinary);
                    }
                  }}
                  compact
                />
              </div>
            </div>

            {generatedAudio && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                  <span className="text-emerald-400 font-bold text-sm">Audio listo</span>
                </div>
              </div>
            )}

            {createdVideo && (
              <div className="space-y-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                    <span className="text-emerald-400 font-bold text-sm">Video Creado</span>
                  </div>
                </div>
                <img
                  src={createdVideo}
                  alt="Video preview"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadVideo}
                    className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={handleSaveToCloudinary}
                    className="flex-1 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 text-sm font-bold"
                  >
                    Guardar en Cloud
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateVideo}
              disabled={isCreating || !script.trim() || !generatedAudio}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-bold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <span className="animate-spin material-symbols-outlined">sync</span>
                  Creando Video...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">movie_creation</span>
                  Crear Video
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-gray-500">folder_open</span>
                <p className="text-gray-400 mt-4">No hay proyectos todavía</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  {project.backgroundUrl && (
                    <img
                      src={project.backgroundUrl}
                      alt={project.name}
                      className="size-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{project.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {project.audioCloudinary && (
                      <span className="material-symbols-outlined text-emerald-400 text-lg" title="Audio listo">
                        audiotrack
                      </span>
                    )}
                    <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-violet-500/20 hover:text-violet-400 transition-all">
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCreator;
