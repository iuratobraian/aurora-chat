import { useState, useEffect, lazy, Suspense } from 'react';
import { Usuario } from '../types';

const YouTubeAIEditor = lazy(() => import('../components/marketing/YouTubeAIEditor'));
const InstagramMarketingView = lazy(() => import('./InstagramMarketingView'));

interface MarketingViewProps {
  usuario: Usuario | null;
  activeTab?: string;
}

type MarketingTab = 'dashboard' | 'instagram' | 'youtube' | 'editor' | 'voice' | 'video' | 'content' | 'analytics';

export default function MarketingView({ usuario, activeTab = 'dashboard' }: MarketingViewProps) {
  const [currentTab, setCurrentTab] = useState<MarketingTab>((activeTab as MarketingTab) || 'dashboard');
  
  useEffect(() => {
    if (activeTab && ['dashboard', 'instagram', 'youtube', 'editor', 'voice', 'video', 'content', 'analytics'].includes(activeTab)) {
      setCurrentTab(activeTab as MarketingTab);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'instagram', label: 'Instagram', icon: 'camera_alt' },
    { id: 'youtube', label: 'YouTube', icon: 'play_circle' },
    { id: 'editor', label: 'Editor IA', icon: 'auto_awesome' },
    { id: 'voice', label: 'Voz IA', icon: 'record_voice_over' },
    { id: 'video', label: 'Video', icon: 'videocam' },
    { id: 'content', label: 'Contenido', icon: 'edit_note' },
    { id: 'analytics', label: 'Estadísticas', icon: 'analytics' },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <MarketingDashboard usuario={usuario} />;
      case 'instagram':
        return (
          <Suspense fallback={<EditorLoading />}>
            <InstagramMarketingView usuario={usuario} />
          </Suspense>
        );
      case 'youtube':
        return <YouTubeTool />;
      case 'editor':
        return (
          <Suspense fallback={<EditorLoading />}>
            <YouTubeAIEditor />
          </Suspense>
        );
      case 'voice':
        return <VoiceGeneratorTool />;
      case 'video':
        return <VideoCreatorTool />;
      case 'content':
        return <ContentGeneratorTool />;
      case 'analytics':
        return <MarketingAnalytics usuario={usuario} />;
      default:
        return <MarketingDashboard usuario={usuario} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Marketing Pro
          </h1>
          <p className="text-white/60">
            Crea contenido con IA para tus redes sociales
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as MarketingTab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                currentTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-card-dark text-white/70 hover:bg-card-dark/80 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-card-dark rounded-xl border border-border-dark p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">auto_awesome</span>
        <p className="text-white/60 mt-2">Cargando Editor IA...</p>
      </div>
    </div>
  );
}

function MarketingDashboard({ usuario }: { usuario: Usuario | null }) {
  const stats = [
    { label: 'Videos Procesados', value: '0', icon: 'video_library', color: 'text-blue-400' },
    { label: 'Audios Generados', value: '0', icon: 'audiotrack', color: 'text-purple-400' },
    { label: 'Posts Creadoss', value: '0', icon: 'article', color: 'text-green-400' },
    { label: 'Horas de Contenido', value: '0', icon: 'schedule', color: 'text-orange-400' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Resumen de Actividad</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background-dark rounded-lg p-4">
            <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
            <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-white/60 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-background-dark rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Herramientas Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickActionCard icon="play_circle" label="Transcribir YouTube" description="Extrae audio y subtítulos de videos" />
          <QuickActionCard icon="mic" label="Generar Voz IA" description="Crea voz realista con ElevenLabs" />
          <QuickActionCard icon="videocam" label="Crear Video" description="Combina voz e imágenes" />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, label, description }: { icon: string; label: string; description: string }) {
  return (
    <button className="text-left p-4 bg-card-dark rounded-lg border border-border-dark hover:border-primary/50 transition-colors group">
      <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">{icon}</span>
      <h4 className="font-medium text-white mt-2">{label}</h4>
      <p className="text-white/60 text-sm">{description}</p>
    </button>
  );
}

function YouTubeTool() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<any>(null);

  const handleExtract = async () => {
    if (!videoUrl) return;
    setLoading(true);
    try {
      const { getYouTubeTranscript } = await import('../services/ai/youtubeService');
      const result = await getYouTubeTranscript(videoUrl);
      setTranscript(result);
    } catch (error) {
      console.error('Error extracting transcript:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Transcriptor de YouTube</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Pega la URL del video de YouTube..."
            className="flex-1 px-4 py-3 bg-background-dark border border-border-dark rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleExtract}
            disabled={loading || !videoUrl}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Extrayendo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">download</span>
                Extraer
              </>
            )}
          </button>
        </div>

        {transcript && (
          <div className="mt-4 p-4 bg-background-dark rounded-lg">
            <h3 className="font-medium text-white mb-2">{transcript.title}</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {transcript.transcripts?.slice(0, 10).map((seg: any, i: number) => (
                <p key={i} className="text-white/80 text-sm">
                  <span className="text-primary text-xs">
                    {Math.floor(seg.start / 60)}:{String(Math.floor(seg.start % 60)).padStart(2, '0')}
                  </span>
                  {' '}{seg.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceGeneratorTool() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Generador de Voz IA</h2>
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-white/20 mb-4">mic</span>
        <p className="text-white/60 mb-4">Conecta tu API de ElevenLabs para generar voz</p>
        <a href="#configuracion" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined">settings</span>
          Configurar API
        </a>
      </div>
    </div>
  );
}

function VideoCreatorTool() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Creador de Video</h2>
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-white/20 mb-4">videocam</span>
        <p className="text-white/60 mb-4">Crea videos combinando voz e imágenes</p>
        <button disabled className="px-4 py-2 bg-card-dark text-white/40 rounded-lg cursor-not-allowed">
          Próximamente
        </button>
      </div>
    </div>
  );
}

function ContentGeneratorTool() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Generador de Contenido</h2>
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-white/20 mb-4">edit_note</span>
        <p className="text-white/60 mb-4">Genera posts optimizados para redes</p>
        <button disabled className="px-4 py-2 bg-card-dark text-white/40 rounded-lg cursor-not-allowed">
          Próximamente
        </button>
      </div>
    </div>
  );
}

function MarketingAnalytics({ usuario }: { usuario: Usuario | null }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Estadísticas de Marketing</h2>
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-white/20 mb-4">analytics</span>
        <p className="text-white/60">Conecta herramientas para ver estadísticas</p>
      </div>
    </div>
  );
}
