import React, { useState, useCallback, useEffect } from 'react';
import { newsService } from '../../services/newsService';
import { NewsArticle, NewsSource, NewsCategory, NewsPreferences } from '../../types/news';
import { SOURCE_CONFIG } from '../../services/newsService';
import { useToast } from '../ToastProvider';

interface AINewsAgentProps {
  usuario: any;
  onPublish?: (article: NewsArticle) => void;
}

const SOURCE_OPTIONS: { id: NewsSource; label: string; icon: string; url: string }[] = [
  { id: 'investing', label: 'Investing.com', icon: '📈', url: 'https://www.investing.com/news/forex-news' },
  { id: 'myfxbook', label: 'MyFXBook', icon: '📊', url: 'https://www.myfxbook.com/blog' },
  { id: 'forexfactory', label: 'Forex Factory', icon: '🏭', url: 'https://www.forexfactory.com/calendar' },
  { id: 'tradingview', label: 'TradingView', icon: '📉', url: 'https://www.tradingview.com/news/' },
  { id: 'fxstreet', label: 'FXStreet', icon: '💱', url: 'https://www.fxstreet.com/news/forex' },
  { id: 'dailyfx', label: 'DailyFX', icon: '📊', url: 'https://www.dailyfx.com/news' },
  { id: 'cointelegraph', label: 'CoinTelegraph', icon: '₿', url: 'https://cointelegraph.com/news' },
];

export const AINewsAgent: React.FC<AINewsAgentProps> = ({ usuario, onPublish }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [newsPublished, setNewsPublished] = useState(0);
  const [selectedSources, setSelectedSources] = useState<NewsSource[]>(['investing', 'forexfactory', 'tradingview']);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [status, setStatus] = useState<string>('');
  const { showToast } = useToast();

  const isAdmin = usuario?.rol === 'admin' || usuario?.rol === 'ceo';

  const toggleSource = (source: NewsSource) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const runAgent = useCallback(async () => {
    if (selectedSources.length === 0) {
      showToast('warning', 'Selecciona al menos una fuente');
      return;
    }

    setIsRunning(true);
    setStatus('Extrayendo noticias...');

    try {
      setStatus('Conectando con fuentes...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('Analizando contenido...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setStatus('Publicando en el feed...');
      const news = await newsService.fetchNews({
        sources: selectedSources,
      });

      setStatus('Completado');
      setLastRun(new Date());
      setNewsPublished(prev => prev + news.length);

      showToast('success', `${news.length} noticias extraídas y publicadas`);
      
      news.forEach(article => {
        onPublish?.(article);
      });

    } catch (error) {
      console.error('Error running agent:', error);
      showToast('error', 'Error al ejecutar el agente');
      setStatus('Error');
    } finally {
      setIsRunning(false);
      setTimeout(() => setStatus(''), 2000);
    }
  }, [selectedSources, showToast, onPublish]);

  useEffect(() => {
    if (isAutoMode && isAdmin) {
      const interval = setInterval(() => {
        runAgent();
      }, 15 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isAutoMode, isAdmin, runAgent]);

  if (!isAdmin) return null;

  return (
    <div className="glass rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="material-symbols-outlined text-white text-2xl">psychology</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Agente IA de Noticias</h3>
            <p className="text-xs text-white/50">Extrae y publica noticias automáticamente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              <div className="size-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs text-purple-300 font-medium">{status}</span>
            </div>
          )}
          {lastRun && !isRunning && (
            <span className="text-[10px] text-white/30">
              Última ejecución: {lastRun.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
            Fuentes Activas
          </label>
          <div className="space-y-2">
            {SOURCE_OPTIONS.map(source => (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedSources.includes(source.id)
                    ? 'bg-purple-500/20 border border-purple-500/40 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{source.icon}</span>
                  <span className="text-sm font-medium">{source.label}</span>
                </div>
                <span className={`material-symbols-outlined text-sm ${
                  selectedSources.includes(source.id) ? 'text-purple-400' : 'text-white/30'
                }`}>
                  {selectedSources.includes(source.id) ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white">Modo Automático</span>
              <button
                onClick={() => setIsAutoMode(!isAutoMode)}
                className={`relative size-12 rounded-full transition-all ${
                  isAutoMode ? 'bg-purple-500' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
                  isAutoMode ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
            <p className="text-xs text-white/40">
              Actualiza automáticamente cada 15 minutos
            </p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Noticias Publicadas</span>
                <p className="text-xs text-white/40">Total en esta sesión</p>
              </div>
              <span className="text-3xl font-black text-purple-400">{newsPublished}</span>
            </div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
              <span className="text-sm font-bold text-white">Fuentes Seleccionadas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSources.map(source => (
                <span key={source} className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium">
                  {SOURCE_CONFIG[source].icon} {SOURCE_CONFIG[source].name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={runAgent}
        disabled={isRunning || selectedSources.length === 0}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
          isRunning
            ? 'bg-purple-500/50 text-white/50 cursor-not-allowed'
            : selectedSources.length === 0
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02]'
        }`}
      >
        {isRunning ? (
          <>
            <span className="material-symbols-outlined animate-spin">sync</span>
            Ejecutando...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">bolt</span>
            Ejecutar Agente de Noticias
          </>
        )}
      </button>
    </div>
  );
};

export default AINewsAgent;
