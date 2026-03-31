import React, { useState } from 'react';
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from '../ToastProvider';
import { Usuario } from '../../types';

interface AgentPromptGeneratorProps {
  usuario?: Usuario | null;
}

const AgentPromptGenerator: React.FC<AgentPromptGeneratorProps> = ({ usuario }) => {
  const [request, setRequest] = useState('');
  const [context, setContext] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();
  
  const generateAction = useAction(api.aiAgent.generateAgentPrompt);

  const handleGenerate = async () => {
    if (!request.trim()) {
      showToast('warning', 'Por favor ingresa qué necesitas que haga el agente.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAction({
        userRequest: request,
        additionalContext: context
      });
      
      if (result.success && result.prompt) {
        setGeneratedPrompt(result.prompt);
        showToast('success', 'Prompt generado exitosamente');
      } else {
        showToast('error', result.error || 'Error al generar el prompt');
      }
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      showToast('error', 'Error de conexión con el servicio de IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showToast('success', 'Prompt copiado al portapapeles');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Generador de Prompts</h2>
          <p className="text-gray-400 text-sm">Convierte tus peticiones en instrucciones estructuradas para agentes IA.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="material-symbols-outlined text-primary">psychology</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Input */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                ¿Qué debe hacer el agente?
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="Ej: Necesito un agente que analice las noticias de Bitcoin y cree un resumen para Twitter con emojis y hashtags relevantes."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 min-h-[150px] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Contexto Adicional (Opcional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ej: El tono debe ser profesional pero entusiasta. Debe incluir el precio actual de BTC."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 min-h-[100px] transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                isGenerating 
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin material-symbols-outlined">sync</span>
                  Pensando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generar Instrucción Maestra
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-amber-500 text-xl">info</span>
              <div>
                <h4 className="text-amber-500 font-bold text-sm">Consejo Pro</h4>
                <p className="text-amber-500/80 text-xs mt-1">
                  Sé lo más específico posible sobre el formato de salida y el tono que esperas del agente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Result */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 border border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Prompt Resultante
              </label>
              {generatedPrompt && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  Copiar
                </button>
              )}
            </div>

            {generatedPrompt ? (
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-5 overflow-auto max-h-[500px] custom-scrollbar">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {generatedPrompt}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl">
                <span className="material-symbols-outlined text-6xl text-white/5 mb-4">description</span>
                <p className="text-gray-500 text-sm max-w-[200px]">
                  El prompt generado aparecerá aquí después de procesar tu solicitud.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPromptGenerator;
