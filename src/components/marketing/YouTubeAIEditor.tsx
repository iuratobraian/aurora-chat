import React, { useState, useCallback, memo } from 'react';

interface EditorPrompt {
  category: string;
  icon: string;
  prompts: string[];
  color: string;
}

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

function analyzeContentForEditing(transcript: any): EditorPrompt[] {
  const text = transcript?.transcripts?.map((t: any) => t.text).join(' ') || '';
  const wordCount = text.split(/\s+/).length;
  const duration = transcript?.transcripts?.[transcript.transcripts.length - 1]?.start || 0;
  const avgWPM = duration > 0 ? (wordCount / (duration / 60)) : 0;

  const hasNumbers = /\d+/.test(text);
  const hasQuestions = /[¿?]/ .test(text);
  const hasExcitement = /[!¡]/.test(text);
  const hasTechnical = /(estrategia|trading|análisis|mercado|gráfico|señal)/i.test(text);
  const hasEmotional = /(ganar|perder|frustrad|emocionad|feliz|content)/i.test(text);
  const hasEducational = /(porque|porque|aprender|enseñar|explicar)/i.test(text);

  const prompts: EditorPrompt[] = [
    {
      category: 'Tomas & B-Roll',
      icon: 'videocam',
      color: 'blue',
      prompts: [],
    },
    {
      category: 'Transiciones',
      icon: 'swap_horiz',
      color: 'purple',
      prompts: [],
    },
    {
      category: 'Música & SFX',
      icon: 'music_note',
      color: 'green',
      prompts: [],
    },
    {
      category: 'Textos & Gráficos',
      icon: 'text_fields',
      color: 'orange',
      prompts: [],
    },
    {
      category: 'Color & Estilo',
      icon: 'palette',
      color: 'pink',
      prompts: [],
    },
  ];

  prompts[0].prompts.push(
    'Insertar B-roll de gráficos de trading en momentos de análisis técnico',
    'Cortar a close-up de manos señalando pantallas durante explicaciones clave',
    'Mostrar gráficos de velas japonesas sincronizados con las explicaciones',
    'Incluir footage de plataformas de trading (MetaTrader, TradingView) como contexto',
  );

  if (hasTechnical) {
    prompts[0].prompts.push(
      'Overlay de indicadores técnicos (RSI, MACD, medias móviles) en zonas de análisis',
      'Animación de líneas de tendencia dibujándose en tiempo real',
    );
  }

  if (avgWPM > 130) {
    prompts[0].prompts.push(
      'Usar cortes rápidos (1-2 segundos) para mantener el ritmo dinámico',
      'Considerar cámara lenta en momentos de revelación de información clave',
    );
  } else {
    prompts[0].prompts.push(
      'Permitir tomas más largas (3-5 segundos) para ritmo contemplativo',
      'Enfocarse en expresiones faciales durante explicaciones profundas',
    );
  }

  prompts[1].prompts.push(
    'Usar whip pan para transiciones entre temas diferentes',
    'Match cut conectando concepto de trading con analogía visual',
    'Fade to chart para transiciones a análisis técnico',
  );

  if (hasExcitement) {
    prompts[1].prompts.push(
      'Transición rápida con glitch effect en momentos de alta emoción',
      'Zoom dinámico en puntos clave de información',
    );
  }

  prompts[2].prompts.push(
    'Música lo-fi suave de fondo durante explicaciones (sin letra)',
    'Beat drops sutiles en transiciones entre secciones',
  );

  if (hasTechnical) {
    prompts[2].prompts.push(
      'SFX de "cha-ching" o campana en momentos de resultados positivos mencionados',
      'Alert sound cuando se menciona señal de trading específica',
    );
  }

  if (hasExcitement) {
    prompts[2].prompts.push(
      'Build-up de música épica antes de revelar estrategia o resultado',
      'Drop energético en momentos de climax narrativo',
    );
  }

  prompts[3].prompts.push(
    'Lower third con nombre del tema y tiempo remaining',
    'Text pop-up destacando términos clave de trading',
    'Callout boxes para definiciones importantes',
  );

  if (hasNumbers) {
    prompts[3].prompts.push(
      'Gráficos de barras/pie animadas para datos numéricos',
      'Counter animation para estadísticas mencionadas',
    );
  }

  if (hasQuestions) {
    prompts[3].prompts.push(
      'Texto animado "¿Sabías que...?" o "¿Cuál es el resultado?"',
      'Typing effect para preguntas retóricas',
    );
  }

  prompts[4].prompts.push(
    'Palette profesional: azul oscuro (#1a237e) + dorado (#ffd700) para elementos importantes',
    'Consistent lower thirds con mismo estilo tipográfico',
  );

  if (hasTechnical) {
    prompts[4].prompts.push(
      'Modo "trading desk" - ambiente oscuro con elementos brillantes',
      'Overlay semi-transparente de gráficos como fondo en secciones de análisis',
    );
  }

  if (hasEmotional) {
    prompts[4].prompts.push(
      'Color grading más cálido en secciones positivas',
      'Shift a tonos más fríos en secciones de riesgo/pérdida',
    );
  }

  if (hasEducational) {
    prompts[4].prompts.push(
      'Estilo "pizarra digital" para secciones de enseñanza',
      'Highlight amarillo sutil sobre elementos importantes',
    );
  }

  return prompts.filter(p => p.prompts.length > 0);
}

const YouTubeAIEditor: React.FC = memo(() => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [prompts, setPrompts] = useState<EditorPrompt[]>([]);
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string } | null>(null);

  const handleAnalyze = useCallback(async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;

    setLoading(true);
    setAnalyzing(true);
    setPrompts([]);
    setVideoInfo(null);

    try {
      const { getYouTubeTranscript } = await import('../../services/ai/youtubeService');
      const transcript = await getYouTubeTranscript(videoUrl);
      
      setVideoInfo({
        title: transcript?.title || `Video ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      });

      const generatedPrompts = analyzeContentForEditing(transcript);
      setPrompts(generatedPrompts);
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, [videoUrl]);

  const handleCopyPrompt = useCallback(async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      console.error('Failed to copy');
    }
  }, []);

  const handleCopyAll = useCallback(async (categoryPrompts: string[]) => {
    try {
      await navigator.clipboard.writeText(categoryPrompts.join('\n\n'));
    } catch {
      console.error('Failed to copy');
    }
  }, []);

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', icon: 'text-pink-400' },
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">YouTube AI Editor</h2>
          <p className="text-white/60 text-sm">Genera prompts de edición basados en el contenido del video</p>
        </div>
      </div>

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
            onClick={handleAnalyze}
            disabled={loading || !videoUrl}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            {loading || analyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Analizando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_awesome</span>
                Analizar Video
              </>
            )}
          </button>
        </div>

        {videoInfo && (
          <div className="flex items-center gap-4 p-4 bg-background-dark rounded-lg border border-border-dark">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="size-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{videoInfo.title}</h3>
              <p className="text-white/60 text-sm">Listo para generar prompts de edición</p>
            </div>
            <span className="material-symbols-outlined text-green-400">check_circle</span>
          </div>
        )}

        {prompts.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Prompts Generados</h3>
              <span className="text-white/60 text-sm">{prompts.reduce((acc, p) => acc + p.prompts.length, 0)} prompts</span>
            </div>

            {prompts.map((category) => {
              const colors = colorClasses[category.color] || colorClasses.blue;
              return (
                <div key={category.category} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined ${colors.icon}`}>{category.icon}</span>
                      <h4 className={`font-semibold ${colors.text}`}>{category.category}</h4>
                      <span className="text-white/40 text-sm">({category.prompts.length})</span>
                    </div>
                    <button
                      onClick={() => handleCopyAll(category.prompts)}
                      className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copiar todos
                    </button>
                  </div>
                  <div className="space-y-2">
                    {category.prompts.map((prompt, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-background-dark/50 rounded-lg group"
                      >
                        <span className={`material-symbols-outlined ${colors.icon} text-sm mt-0.5 flex-shrink-0`}>
                          arrow_right_alt
                        </span>
                        <p className="text-white/80 text-sm flex-1">{prompt}</p>
                        <button
                          onClick={() => handleCopyPrompt(prompt)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg"
                          title="Copiar"
                        >
                          <span className="material-symbols-outlined text-white/50 hover:text-white text-sm">content_copy</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && prompts.length === 0 && !videoInfo && (
          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">movie_edit</span>
            <p className="text-white/60 mb-2">Pega una URL de YouTube para generar prompts de edición</p>
            <p className="text-white/40 text-sm">El análisis incluye: tomas, transiciones, música, textos, color y estilo</p>
          </div>
        )}
      </div>
    </div>
  );
});

YouTubeAIEditor.displayName = 'YouTubeAIEditor';

export default YouTubeAIEditor;
