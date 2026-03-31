import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CREATOR_CONTEXT = `Eres un asistente para creadores de contenido en TradePortal. Ayudas con:\n\n1. Estrategias para generar contenido\n2. Ideas para posts y análisis\n3. Cómo aumentar engagement\n4. Optimización de perfil\n5. Monetización`;

const DEMO_RESPONSES: Record<string, string> = {
  'hola': '¡Hola! Soy el asistente de creadores de contenido. 🚀\n\nPuedo ayudarte con:\n\n💡 **Ideas de contenido** para tus posts\n📈 **Estrategias** para aumentar tu alcance\n🎯 **Tips** para mejorar tu perfil\n💰 **Monetización** de tu comunidad\n\n¿Sobre qué quieres crear contenido hoy?',
  'idea': 'Aquí tienes algunas ideas de contenido trending:\n\n📊 **Análisis de mercado** - Análisis técnico de activos populares\n💎 **Oportunidades** - Señales con explicación\n📚 **Educación** - Tips y conceptos básicos\n🎮 **Challenges** - Trading competitions\n\n¿Cuál te interesa más?',
  'engagement': 'Para aumentar tu engagement, te sugiero:\n\n1. **Responde comentarios** rápidamente\n2. **Crea encuestas** en tus posts\n3. **Comparte resultados** de tus operaciones\n4. **Colabora** con otros creadores\n5. **Publica en horarios peak** (9am-12pm, 6pm-9pm)',
  'default': 'Excelente pregunta. Para darte las mejores estrategias, necesito saber:\n1. ¿Qué tipo de contenido creas? (Análisis, señales, educación)\n2. ¿Cuál es tu objetivo? (Seguidores, engagement, monetización)\n3. ¿Qué temáticas cubres? (Crypto, Forex, Stocks)'
};

export const CreatorAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: DEMO_RESPONSES['hola'],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    { label: 'Ideas de posts', action: 'Dame ideas de contenido para esta semana' },
    { label: 'Aumentar seguidores', action: '¿Cómo puedo aumentar mis seguidores?' },
    { label: 'Mejorar perfil', action: '¿Cómo optimizo mi perfil de creador?' },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[450px]">
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-900/20 to-yellow-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-600 flex items-center justify-center">
            <span className="text-lg">🎨</span>
          </div>
          <div>
            <h3 className="font-bold text-white">Asistente Creador</h3>
            <p className="text-xs text-gray-400">Gestión de contenido</p>
          </div>
          <span className="ml-auto px-2 py-1 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/20">
            GOLD+
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary/20 border border-primary/30 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}>
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-white/5 p-3 rounded-2xl"><div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span></div></div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {quickActions.map(a => <button key={a.label} onClick={() => setInput(a.action)} className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300">{a.label}</button>)}
        </div>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Pregunta sobre creación..." className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-orange-500/50" />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-600 text-white font-bold text-sm disabled:opacity-50">Enviar</button>
        </div>
      </div>
    </div>
  );
};

export default CreatorAssistant;