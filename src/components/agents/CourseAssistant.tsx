import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const COURSE_CONTEXT = `Eres un asistente de cursos de trading. Conoces todos los cursos disponibles en TradePortal y puedes:\n\n1. Recomendarlos según el nivel del estudiante\n2. Explicar el contenido de cada curso\n3. Responder preguntas sobre estrategias\n4. Guiar en el aprendizaje\n5. Suggest next steps\n\nCursos disponibles:\n- Principiante: Fundamentos del Trading\n- Intermedio: Análisis Técnico Avanzado\n- Avanzado: Trading Institucional\n- Especializaciones: Forex, Crypto, Acciones`;

const DEMO_RESPONSES: Record<string, string> = {
  'hola': '¡Hola! Soy tu asistente de cursos de trading. 🎓\n\nPuedo ayudarte a:\n\n📚 **Encontrar el curso ideal** según tu nivel\n💡 **Entender** el contenido de cada curso\n🎯 **Recomendarte** el siguiente paso en tu aprendizaje\n❓ **Responder** tus preguntas sobre estrategias\n\n¿Cuál es tu experiencia actual en trading?',
  'principiante': 'Para principiantes, te recomiendo comenzar con:\n\n📖 **"Fundamentos del Trading"**\n- Conceptos básicos\n- Tipos de mercados\n- Lectura de gráficos\n- Gestión de riesgo básica\n- Duración: 4 horas\n\nEste curso te dará las bases necesarias para avanzar.',
  'avanzado': 'Para nivel avanzado, te recomiendo:\n\n🎓 **"Trading Institucional"**\n- Microestructura del mercado\n- Order flow y volumen\n- Estrategias de liquidez\n- Gestión de riesgo profesional\n- Duración: 8 horas\n\nTambién tenemos especializaciones en Forex, Crypto y Acciones.',
  'default': 'Excelente pregunta. Déjame buscar en nuestros cursos...\n\nPara darte la mejor recomendación, dime:\n1. ¿Cuál es tu nivel actual? (Principiante/Intermedio/Avanzado)\n2. ¿Qué mercado te interesa? (Forex/Crypto/Acciones)\n3. ¿Cuál es tu objetivo?'
};

export const CourseAssistant: React.FC = () => {
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
    
    if (lower.includes('hola') || lower.includes('hi')) return DEMO_RESPONSES['hola'];
    if (lower.includes('principiante') || lower.includes('básico') || lower.includes('empezar')) return DEMO_RESPONSES['principiante'];
    if (lower.includes('avanzado') || lower.includes('experto') || lower.includes('profesional')) return DEMO_RESPONSES['avanzado'];
    if (lower.includes('curso') || lower.includes('aprender') || lower.includes('recomendar')) return DEMO_RESPONSES['default'];
    
    return DEMO_RESPONSES.default;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    const response: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getResponse(input),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, response]);
    setIsTyping(false);
  };

  const quickActions = [
    { label: 'Cursos principiante', action: '¿Qué cursos tengo para principiante?' },
    { label: 'Análisis técnico', action: '¿Qué cursos de análisis técnico tienen?' },
    { label: 'Mi nivel', action: '¿Cuál es mi nivel según mi experiencia?' },
    { label: 'Siguiente paso', action: '¿Cuál es el siguiente curso que debería tomar?' },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
            <span className="text-lg">📚</span>
          </div>
          <div>
            <h3 className="font-bold text-white">Asistente de Cursos</h3>
            <p className="text-xs text-gray-400">Tu guía de aprendizaje</p>
          </div>
          <span className="ml-auto px-2 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">
            GOLD+
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-primary/20 border border-primary/30 text-white' 
                : 'bg-white/5 border border-white/10 text-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => setInput(action.action)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre cursos..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseAssistant;
