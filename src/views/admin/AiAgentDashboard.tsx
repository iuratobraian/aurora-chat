import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import logger from '../../utils/logger';

const AiAgentDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'market' | 'social' | 'pending' | 'generate'>('market');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [userRequest, setUserRequest] = useState('');

  const config = useQuery(api.aiAgent.getAIAgentConfig);
  const pendingPosts = useQuery(api.aiAgent.getPendingPosts) || [];
  const publishedPosts = useQuery(api.aiAgent.getPublishedPosts) || [];
  const agentStats = useQuery(api.socialAgents.getAgentStats) || [];
  const agentPersonalities = useQuery(api.socialAgents.getAgentPersonalities) || [];

  const toggleAgentStatus = useMutation(api.aiAgent.toggleAgentStatus);
  const approvePost = useMutation(api.aiAgent.approvePendingPost);
  const rejectPost = useMutation(api.aiAgent.rejectPendingPost);
  const deletePost = useMutation(api.aiAgent.deletePendingPost);
  const generateMarketPost = useAction(api.aiAgent.generateMarketPost);
  const generateForexAnalysis = useAction(api.aiAgent.generateForexAnalysis);
  const generateEducationalPost = useAction(api.aiAgent.generateEducationalPost);
  const generateAgentPrompt = useAction(api.aiAgent.generateAgentPrompt);
  const postAsAgent = useAction(api.socialAgents.postAsAgent);
  const dailySocialActivity = useAction(api.socialAgents.dailySocialActivity);

  const handleGenerateMarketPost = async () => {
    setIsGenerating(true);
    setGenerationResult(null);
    try {
      const result = await generateMarketPost({});
      setGenerationResult(result);
    } catch (error) {
      logger.error('Error generating market post:', error);
      setGenerationResult({ success: false, error: String(error) });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateForex = async () => {
    setIsGenerating(true);
    setGenerationResult(null);
    try {
      const result = await generateForexAnalysis({});
      setGenerationResult(result);
    } catch (error) {
      logger.error('Error generating forex analysis:', error);
      setGenerationResult({ success: false, error: String(error) });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEducational = async () => {
    setIsGenerating(true);
    setGenerationResult(null);
    try {
      const result = await generateEducationalPost({});
      setGenerationResult(result);
    } catch (error) {
      logger.error('Error generating educational post:', error);
      setGenerationResult({ success: false, error: String(error) });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!userRequest.trim()) return;
    setIsGenerating(true);
    setGenerationResult(null);
    try {
      const result = await generateAgentPrompt({ userRequest, additionalContext: 'Genera contenido para la comunidad de trading' });
      setGenerationResult(result);
    } catch (error) {
      logger.error('Error generating prompt:', error);
      setGenerationResult({ success: false, error: String(error) });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleAgent = async () => {
    try {
      await toggleAgentStatus({ enabled: !config?.enabled });
    } catch (error) {
      logger.error('Error toggling agent:', error);
    }
  };

  const handleApprovePost = async (id: any) => {
    try {
      await approvePost({ id });
    } catch (error) {
      logger.error('Error approving post:', error);
    }
  };

  const handleRejectPost = async (id: any) => {
    try {
      await rejectPost({ id });
    } catch (error) {
      logger.error('Error rejecting post:', error);
    }
  };

  const handleDeletePost = async (id: any) => {
    try {
      await deletePost({ id });
    } catch (error) {
      logger.error('Error deleting post:', error);
    }
  };

  const handlePostAsAgent = async (agentUserId: string) => {
    try {
      await postAsAgent({ agentUserId, count: 1 });
    } catch (error) {
      logger.error('Error posting as agent:', error);
    }
  };

  const handleDailyActivity = async () => {
    try {
      await dailySocialActivity({});
    } catch (error) {
      logger.error('Error running daily activity:', error);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            AI Agent Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Control de agentes autónomos y generación de contenido
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config?.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {config?.enabled ? 'Activo' : 'Inactivo'}
          </span>
          <button
            onClick={handleToggleAgent}
            className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-all"
          >
            {config?.enabled ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'market', label: 'Mercado', icon: 'show_chart' },
          { id: 'social', label: 'Social Agents', icon: 'smart_toy' },
          { id: 'pending', label: 'Pendientes', icon: 'pending' },
          { id: 'generate', label: 'Generar', icon: 'auto_awesome' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'market' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-xs text-gray-500 uppercase">Posts Publicados</p>
              <p className="text-2xl font-black text-white">{publishedPosts.length}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-xs text-gray-500 uppercase">Posts Pendientes</p>
              <p className="text-2xl font-black text-yellow-400">{pendingPosts.length}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-xs text-gray-500 uppercase">Agentes Sociales</p>
              <p className="text-2xl font-black text-primary">{agentPersonalities.length}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Generar Contenido de Mercado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleGenerateMarketPost}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">show_chart</span>
                Resumen de Mercado
              </button>
              <button
                onClick={handleGenerateForex}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">currency_exchange</span>
                Análisis Forex
              </button>
              <button
                onClick={handleGenerateEducational}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">school</span>
                Post Educativo
              </button>
            </div>

            {generationResult && (
              <div className={`mt-4 p-4 rounded-xl ${generationResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className={`text-sm font-bold ${generationResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {generationResult.success ? 'Generado exitosamente' : 'Error'}
                </p>
                {generationResult.price && <p className="text-xs text-gray-400 mt-1">BTC: {generationResult.price}</p>}
                {generationResult.sentiment && <p className="text-xs text-gray-400">Sentimiento: {generationResult.sentiment}</p>}
                {generationResult.lessonTitle && <p className="text-xs text-gray-400 mt-1">{generationResult.lessonTitle}</p>}
                {generationResult.error && <p className="text-xs text-red-400 mt-1">{generationResult.error}</p>}
              </div>
            )}
          </div>

          {config?.schedules && (
            <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Horarios de Publicación</h3>
              <div className="space-y-2">
                {config.schedules.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-white capitalize">{s.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.hours?.join(':00, ')}:00</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {s.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'social' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Agentes Sociales ({agentPersonalities.length})</h3>
            <button
              onClick={handleDailyActivity}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-all"
            >
              Ejecutar Actividad Diaria
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentPersonalities.map((agent: any) => {
              const stats = agentStats.find((s: any) => s.userId === agent.userId);
              return (
                <div key={agent.userId} className="glass rounded-xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                      {agent.avatar ? <img src={agent.avatar} alt="" className="size-10 rounded-full" /> : '🤖'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{agent.nombre}</h4>
                      <p className="text-xs text-gray-500">@{agent.usuario}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-gray-500">Estilo</p>
                      <p className="text-white font-bold">{agent.tradingStyle}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expertise</p>
                      <p className="text-white font-bold">{agent.expertise}</p>
                    </div>
                  </div>
                  {stats && (
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-white/5 rounded">
                        <p className="text-white font-black">{stats.postsCount || 0}</p>
                        <p className="text-gray-500">Posts</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded">
                        <p className="text-white font-black">{stats.totalLikes || 0}</p>
                        <p className="text-gray-500">Likes</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded">
                        <p className="text-white font-black">{stats.engagement || 0}</p>
                        <p className="text-gray-500">Engagement</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handlePostAsAgent(agent.userId)}
                    className="w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    Publicar como {agent.nombre}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTab === 'pending' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Posts Pendientes de Aprobación ({pendingPosts.length})</h3>
          {pendingPosts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">check_circle</span>
              <h3 className="text-xl font-bold text-white mb-2">Todo al día</h3>
              <p className="text-gray-500">No hay posts pendientes de aprobación</p>
            </div>
          ) : (
            pendingPosts.map((post: any) => (
              <div key={post._id} className="glass rounded-xl p-4 bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{post.titulo}</h4>
                    <p className="text-xs text-gray-500 mt-1">{post.categoria} · {post.fuente}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    post.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    post.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-3 mb-3">{post.contenido}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovePost(post._id)}
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-all"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRejectPost(post._id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedTab === 'generate' && (
        <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10 max-w-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Generador de Contenido con IA</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold block mb-2">
                Describe lo que quieres generar
              </label>
              <textarea
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Ej: Genera un análisis técnico de BTC para la próxima semana..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none resize-none"
              />
            </div>
            <button
              onClick={handleGeneratePrompt}
              disabled={isGenerating || !userRequest.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Generando...' : 'Generar Contenido'}
            </button>

            {generationResult && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                {generationResult.success ? (
                  <div>
                    <p className="text-sm font-bold text-green-400 mb-2">Contenido generado</p>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">{generationResult.prompt}</pre>
                  </div>
                ) : (
                  <p className="text-sm text-red-400">{generationResult.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAgentDashboard;
