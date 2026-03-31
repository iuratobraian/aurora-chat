import React, { useState, useRef, useEffect, memo } from 'react';

interface KimiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface KimiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const KIMI_SYSTEM_PROMPT = `Eres GLM-4.7, asistente de código avanzado con capacidades de reasoning y tool calling del proyecto TradePortal 2025 (React + TypeScript + Vite + Convex).

Tienes acceso al proyecto y puedes:
- Leer y analizar código
- Generar nuevo código con reasoning avanzado
- Corregir bugs con análisis profundo
- Explicar conceptos de trading y desarrollo
- Usar tool calling cuando sea necesario
- Mantener "Preserved Thinking" en conversaciones multi-turn

Sé helpful, específico y proporciona código funcional cuando asked. Soporta español e inglés.`;

const DEMO_RESPONSES: Record<string, string> = {
  'hola': '¡Hola! Soy GLM-4.7, tu asistente de código avanzado de TradePortal 🚀\n\nPuedo ayudarte con:\n\n💻 **Código** - Escribir, corregir, refactorizar con reasoning profundo\n📊 **Trading** - Estrategias, análisis, señales\n🔧 **Desarrollo** - React, TypeScript, Convex, Vite\n🧠 **Reasoning** - Análisis complejo y soluciones creativas\n📚 **Aprendizaje** - Conceptos de trading y programación\n\n¿En qué puedo ayudarte hoy?',
  'ayuda': 'Estos son los comandos que puedo entender:\n\n• Escribe código para... (generaré código con análisis)\n• Corrige el bug en... (analizaré profundamente y fixearé)\n• Explica qué hace... (analizaré código)\n• Cómo implementar... (daré instrucciones detalladas)\n• Optimiza el rendimiento de... (daré recomendaciones)\n• Crea un componente para... (generaré el componente completo)\n\n¡Describe tu necesidad y generaré la mejor solución!',
  'default': 'Entiendo tu solicitud. Para darte la mejor solución, necesito más contexto.\n\n¿Puedes especificar?\n1. ¿Qué archivo o componente?\n2. ¿Qué funcionalidad necesitas?\n3. ¿Hay algún error específico?'
};

const KimiChatComponent: React.FC<KimiChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<KimiMessage[]>([
    { id: '1', role: 'assistant', content: DEMO_RESPONSES['hola'], timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: KimiMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
      
      if (!apiKey) {
        // Fallback to demo responses if no API key
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = getDemoResponse(input);
        const assistantMessage: KimiMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: response, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Call NVIDIA API
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'z-ai/glm-4.7',
            messages: [
              { role: 'system', content: KIMI_SYSTEM_PROMPT },
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: input }
            ],
            max_tokens: 4096,
            temperature: 0.7,
            top_p: 0.95
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: KimiMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: data.choices[0].message.content, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Kimi chat error:', err);
      setError('Usando modo offline - algunas funciones limitadas');
      // Fallback to demo
      await new Promise(resolve => setTimeout(resolve, 600));
      const response = getDemoResponse(input);
      const assistantMessage: KimiMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response + '\n\n⚠️ *Modo offline - configura VITE_NVIDIA_API_KEY para respuestas IA completas*', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getDemoResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes('hola') || lower.includes('buenos') || lower.includes('hi')) return DEMO_RESPONSES['hola'];
    if (lower.includes('ayuda') || lower.includes('help') || lower.includes('comandos')) return DEMO_RESPONSES['ayuda'];
    if (lower.includes('código') || lower.includes('code') || lower.includes('genera') || lower.includes('crea')) {
      return `Entendido! Puedo generar código para ti.\n\nPara darte el mejor código necesito:\n1. El contexto (qué componente/archivo)\n2. La funcionalidad deseada\n3. Tecnologías a usar (React, TypeScript, etc.)\n\nDescribe tu necesidad y generaré código funcional!`;
    }
    if (lower.includes('bug') || lower.includes('error') || lower.includes('fix')) {
      return `Para ayudarte a corregir un bug necesito:\n1. El archivo donde ocurre\n2. El mensaje de error completo\n3. Pasos para reproducirlo\n\nComparte el código y lo analizaré!`;
    }
    return DEMO_RESPONSES.default;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[200]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">GLM-4.7</h3>
            <p className="text-xs text-purple-400">Asistente de Código Avanzado</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                : 'bg-white/5 text-gray-200 border border-white/5'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-xs text-yellow-400 text-center bg-yellow-400/10 py-2 rounded-lg">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0a0a0f] border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const KimiChat = memo(KimiChatComponent);
export default KimiChat;