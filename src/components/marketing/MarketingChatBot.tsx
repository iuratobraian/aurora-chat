import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: '¡Hola! Soy tu experto en Marketing AI. ¿En qué puedo ayudarte hoy? Puedo ayudarte a diseñar campañas, optimizar tus copies o analizar tendencias de mercado.',
  timestamp: Date.now(),
};

export const MarketingChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/external/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': 'change_me', // We should use the real key or a session token
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Eres un experto en Marketing Digital y Crecimiento. Tu objetivo es ayudar al usuario a crear campañas virales, optimizar el ROI y mejorar el branding de TradeShare. Responde de forma profesional, creativa y estratégica. Usa emojis y formato markdown.' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          model: 'qwen/qwen3-coder:free', // Default model
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Lo siento, no pude procesar tu solicitud en este momento.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hubo un error al conectar con el servidor de IA.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Marketing Expert AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/50 font-bold uppercase">Online</span>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/40">settings</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-900/20'
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none backdrop-blur-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest opacity-40 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-violet-400 animate-bounce" />
              <div className="size-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
              <div className="size-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="flex gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 focus-within:border-violet-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregúntale cualquier cosa a tu experto..."
            className="flex-1 bg-transparent border-none text-white placeholder-white/20 text-sm focus:outline-none px-2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-900/20"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
        <p className="mt-2 text-[9px] text-center text-white/20 font-bold uppercase tracking-widest">
          Desarrollado por Aurora Mente Maestra • TradeShare 2.0
        </p>
      </div>
    </div>
  );
};

export default MarketingChatBot;
