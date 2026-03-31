import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  maxPositionSize: number;
  recommendedStopLoss: number;
  riskReward: number;
  advice: string[];
}

const RISK_PROMPT = `Eres un especialista en gestión de riesgo financiero para trading. Tu rol es ayudar a los traders a:

1. Calcular tamaño de posición basado en su capital y riesgo máximo
2. Determinar niveles de stop-loss óptimos
3. Evaluar el riesgo de cada operación
4. Sugerir estrategias de gestión de riesgo
5. Analizar el riesgo total de la cartera

Siempre proporciona cálculos específicos y accionables. Usa fórmulas:
- Tamaño posición = (Capital × %Riesgo) / (Entry - Stop Loss)
- Risk/Reward = (Target - Entry) / (Entry - Stop Loss)

Sé preciso con los números y proporciona advertencias cuando el riesgo sea alto.`;

const DEMO_RESPONSES: Record<string, string> = {
  'hola': '¡Hola! Soy tu asistente de gestión de riesgo. Puedo ayudarte a:\n\n📊 Calcular tamaño de posición\n🛡️ Determinar stop-loss\n⚠️ Evaluar riesgo de operaciones\n💼 Analizar riesgo de cartera\n\n¿Tienes alguna operación o estrategia que quieras analizar?',
  'tamaño': 'Para calcular el tamaño de posición, necesito:\n\n1. **Capital disponible** (ej: $10,000)\n2. **% de riesgo** (recomendado: 1-2%)\n3. **Precio de entrada**\n4. **Precio de stop-loss**\n\n提供这些 datos y te calculo la posición exacta.',
  'stop': 'Para calcular un stop-loss adecuado, consideremos:\n\n📈 **Stop-loss técnico**: 2-3% del precio o basado en estructura\n📊 **Stop-loss por volatilidad**: 1.5× ATR\n🎯 **Zonas de soporte/resistencia**\n\n¿Cuál es tu setup de entrada y qué instrumento operas?',
  'default': 'Entiendo tu consulta. Para darte un análisis preciso de riesgo, necesito más detalles:\n\n1. ¿Qué instrumento operas? (Forex, Crypto, Acciones)\n2. ¿Cuál es tu capital?\n3. ¿Cuál es tu precio de entrada y stop-loss?\n4. ¿Cuál es tu objetivo de take-profit?\n\nCon esta información puedo darte un análisis completo.'
};

export const RiskAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: RISK_PROMPT.includes('¡Hola') ? DEMO_RESPONSES['hola'] : '¿En qué puedo ayudarte con tu gestión de riesgo hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeRisk = (input: string): RiskAnalysis => {
    const lowerInput = input.toLowerCase();
    
    return {
      riskLevel: lowerInput.includes('alto') || lowerInput.includes('grande') ? 'high' : 'medium',
      maxPositionSize: Math.floor(Math.random() * 5000) + 1000,
      recommendedStopLoss: Math.floor(Math.random() * 3) + 1,
      riskReward: parseFloat((Math.random() * 2 + 1).toFixed(2)),
      advice: [
        'No arriesgues más del 2% por operación',
        'Mantén el ratio riesgo/beneficio mínimo 1:2',
        'Diversifica tu cartera',
        'Revisa tu exposición total antes de operar'
      ]
    };
  };

  const getResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes('hola') || lower.includes('hi') || lower.includes('buenas')) {
      return DEMO_RESPONSES['hola'];
    }
    
    if (lower.includes('tamaño') || lower.includes('posición') || lower.includes('lote')) {
      return DEMO_RESPONSES['tamaño'];
    }
    
    if (lower.includes('stop') || lower.includes('stop-loss') || lower.includes('perdida')) {
      return DEMO_RESPONSES['stop'];
    }
    
    if (lower.includes('calcular') || lower.includes('cuanto')) {
      const analysis = analyzeRisk(userInput);
      return `Aquí está tu análisis de riesgo:\n\n⚠️ **Nivel de riesgo**: ${analysis.riskLevel.toUpperCase()}\n\n📊 **Tamaño máximo de posición**: ${analysis.maxPositionSize} unidades\n\n🛡️ **Stop-loss recomendado**: ${analysis.recommendedStopLoss}%\n\n📈 **Ratio Risk/Reward**: 1:${analysis.riskReward}\n\n**Consejos:**\n${analysis.advice.map(a => `• ${a}`).join('\n')}`;
    }
    
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
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
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
    { label: 'Calcular posición', action: 'Quiero calcular el tamaño de mi posición con capital $10,000 y riesgo 2%' },
    { label: 'Análisis de riesgo', action: 'Analiza el riesgo de mi operación: Entry 1.0850, Stop 1.0820, Target 1.0920' },
    { label: 'Stop-loss', action: '¿Cuál es un buen stop-loss para EUR/USD?' },
    { label: 'Cartera', action: '¿Cómo debo diversificar mi cartera de trading?' },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-900/20 to-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <div>
            <h3 className="font-bold text-white">Asistente de Riesgo</h3>
            <p className="text-xs text-gray-400">Especialista en gestión de riesgo</p>
          </div>
          <span className="ml-auto px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">
            ONLINE
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary/20 border border-primary/30 text-white' 
                  : 'bg-white/5 border border-white/10 text-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
              <p className="text-[10px] text-gray-500 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
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
            placeholder="Pregunta sobre gestión de riesgo..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-green-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAssistant;
