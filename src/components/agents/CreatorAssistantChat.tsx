import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DEMO_RESPONSES: Record<string, string> = {
  'hola': '¡Hola! Soy el Asistente Creador de TradePortal. 🚀\n\nPuedo ayudarte con:\n\n💡 **Ideas de contenido** para tus posts\n📈 **Estrategias** para aumentar tu alcance\n🎯 **Tips** para mejorar tu perfil\n💰 **Monetización** de tu comunidad\n\n¿Sobre qué quieres crear contenido hoy?',
  'idea': 'Aquí tienes algunas ideas de contenido trending:\n\n📊 **Análisis de mercado** - Análisis técnico de activos populares\n💎 **Oportunidades** - Señales con explicación\n📚 **Educación** - Tips y conceptos básicos\n🎮 **Challenges** - Trading competitions\n\n¿Cuál te interesa más?',
  'engagement': 'Para aumentar tu engagement, te sugiero:\n\n1. **Responde comentarios** rápidamente\n2. **Crea encuestas** en tus posts\n3. **Comparte resultados** de tus operaciones\n4. **Colabora** con otros creadores\n5. **Publica en horarios peak** (9am-12pm, 6pm-9pm)',
  'default': 'Excelente pregunta. Para darte las mejores estrategias, necesito saber:\n1. ¿Qué tipo de contenido creas? (Análisis, señales, educación)\n2. ¿Cuál es tu objetivo? (Seguidores, engagement, monetización)\n3. ¿Qué temáticas cubres? (Crypto, Forex, Stocks)'
};

interface CreatorAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatorAssistantChat({ isOpen, onClose }: CreatorAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: DEMO_RESPONSES['hola'], timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes('hola')) return DEMO_RESPONSES['hola'];
    if (lower.includes('idea') || lower.includes('publicar') || lower.includes('contenido')) return DEMO_RESPONSES['idea'];
    if (lower.includes('engagement') || lower.includes('seguidores') || lower.includes('alcance')) return DEMO_RESPONSES['engagement'];
    return DEMO_RESPONSES.default;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const response: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: getResponse(input), timestamp: new Date() };
    setMessages(prev => [...prev, response]);
    setIsTyping(false);
  };

  const quickActions = [
    { label: 'Ideas', action: 'Dame ideas de contenido para esta semana' },
    { label: 'Seguidores', action: '¿Cómo puedo aumentar mis seguidores?' },
    { label: 'Perfil', action: '¿Cómo optimizo mi perfil de creador?' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-4 w-80 sm:w-96 z-[200] animate-in slide-in-from-right-8 duration-300">
      <div className="glass rounded-2xl overflow-hidden flex flex-col h-[450px] shadow-2xl border border-white/10">
        <div className="p-3 border-b border-white/10 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-600 flex items-center justify-center">
            <span className="text-sm">🎨</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">Asistente Creador</h3>
            <p className="text-[10px] text-gray-400">Gestión de contenido</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <span className="material-symbols-outlined text-lg text-gray-400">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-[85%] p-2.5 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-primary/20 border border-primary/30 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-2 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-2.5 border-t border-white/10 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {quickActions.map(a => (
              <button key={a.label} onClick={() => setInput(a.action)} className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300">{a.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder="Pregunta..." 
              className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-orange-500/50" 
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-600 text-white font-bold text-xs disabled:opacity-50">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorAssistantChat;