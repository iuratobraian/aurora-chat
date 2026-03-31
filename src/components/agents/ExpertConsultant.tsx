import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const EXPERT_CONTEXTS = {
  'tecnico': `Eres un experto técnico senior en TradePortal 2025. Conoces:
- Stack: Node.js, Express, React, Vite, Convex, MongoDB
- APIs: MercadoPago, Instagram Graph API, YouTube Data API
- Features: Comunidades, Subcomunidades, Chat real-time, TV Streaming, Tokens
- Deployment: Vercel, Convex
Responde con código concreto y paths reales.`,

  'arquitecto': `Eres arquitecto de software para TradePortal 2025.
Analiza decisiones de diseño, patrones arquitectura, escalabilidad.
Sugiere mejoras estructurales y justifica decisiones.`,

  'producto': `Eres PM y experto en producto para TradePortal 2025.
Conoce: roadmap, métricas, user stories, features actuales.
Sugierepriorizaciones y mejoras de UX.`,

  'negocio': `Eres experto en monetización para TradePortal 2025.
Sistema de tokens, membresías, Marketplace, Ads.
Analiza modelos de revenue y crecimiento.`
};

interface ExpertConsultantProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: keyof typeof EXPERT_CONTEXTS;
}

export function ExpertConsultant({ isOpen, onClose, initialContext = 'tecnico' }: ExpertConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: `👨‍💼 **Consultor Expert TradePortal** - Listo para ayudarte.

Soy tu asesor técnico especializado. Puedo Consultar sobre:

🔧 **Técnico** - Código, APIs, arquitectura
🏗️ **Arquitecto** - Diseño, patrones, escalabilidad
📦 **Producto** - Features, roadmap, UX
💰 **Negocios** - Monetización, revenue

Escribe tu pregunta o dime *análisis* para revisar el estado del proyecto.`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState<'tecnico' | 'arquitecto' | 'producto' | 'negocio'>(initialContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const callNVIDIA_API = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_NVIDIA_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-4-mini',
          messages: [
            { role: 'system', content: EXPERT_CONTEXTS[currentContext as keyof typeof EXPERT_CONTEXTS] || EXPERT_CONTEXTS['tecnico'] },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1024,
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Sin respuesta del modelo';
    } catch (error) {
      console.error('NVIDIA API error:', error);
      return getLocalResponse(prompt);
    }
  };

  const getLocalResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes('análisis') || lower.includes('estado') || lower.includes('review')) {
      return `📊 **Análisis del Proyecto TradePortal 2025:**

✅ **Completados:**
- Comunidades + Subcomunidades (3 máximo)
- Chat real-time (Convex)
- TV Streaming (YouTube embed)
- Posts anunciados + moderación
- Sistema de tokens
- Instagram API
- MercadoPago integración

📁 **Archivos clave:**
- \`src/views/ComunidadView.tsx\` - Comunidad principal
- \`src/views/subcommunity/\` - 6 componentes
- \`src/components/admin/ModerationPanel.tsx\`
- \`src/services/socket.ts\`

🔄 **Pendientes:**
- Cache Redis (configuración)
- BigQuery analytics

¿Quieres que profundice en algún área?`;
    }
    
    if (lower.includes('comunidad') || lower.includes('subcomunidad')) {
      return `📱 **Sistema de Comunidades:**

✅ **Implementado:**
- Comunidades privadas/públicas
- Subcomunidades (límite 3)
- Chat persistente
- TV Streaming YouTube

📁 **Archivos:**
- \`src/views/ComunidadView.tsx\`
- \`src/views/subcommunity/SubcommunityView.tsx\`
- \`src/views/comunidad/LiveTVSection.tsx\`
- \`convex/\` (chat history)`;
    }
    
    if (lower.includes('pago') || lower.includes('mercadopago') || lower.includes('stripe')) {
      return `💰 **Sistema de Pagos:**

✅ **Implementado:**
- MercadoPago: \`server.ts:1066\` + \`convex/lib/mercadopago.ts\`
- Webhooks: \`/webhooks/mercadopago\`
- Frontend: \`src/components/PaymentModal.tsx\`
- Hook: \`src/hooks/usePayment.ts\`

🔧 **Configuración:**
- \`.env.example\` tiene keys necesarias
- Vercel env vars requeridos`;
    }
    
    if (lower.includes('moderación') || lower.includes('report')) {
      return `🛡️ **Sistema de Moderación:**

✅ **Implementado:**
- Panel Admin: \`src/components/admin/ModerationPanel.tsx\`
- Tipos: spam, report, low_quality, duplicate
- Acciones: approve, reject, delete, ban
- Logs de moderación

📊 **Funcionalidades:**
- Spam reports
- Auto-moderation stats
- Bulk actions`;
    }
    
    if (lower.includes('chat') || lower.includes('socket') || lower.includes('real-time')) {
      return `💬 **Chat Real-time:**

✅ **Implementado:**
- WebSocket service: \`src/services/socket.ts\`
- Chat UI: \`src/components/LiveChatWidget.tsx\`
- Subcommunity chat: \`src/views/subcommunity/SubcommunityChat.tsx\`
- ChatBadge: \`src/components/ChatBadgeContext.tsx\`

🔄 **Nota:** Usa Convex en lugar de WebSocket directo (más robusto)`;
    }

    return `📋 Puedo ayudarte con:

- **Análisis del proyecto** - Estado actual y completados
- **Comunidades/Subcomunidades** - Sistema implementado
- **Pagos** - MercadoPago, Stripe
- **Moderación** - Panel admin, reportes
- **Chat real-time** - WebSocket/Convex
- **Instagram API** - Integración completa

¿Qué área te interesa?`;
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
    
    try {
      const responseText = await callNVIDIA_API(input);
      const response: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: responseText, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, response]);
    } catch (error) {
      const fallback = getLocalResponse(input);
      const response: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: fallback, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, response]);
    } finally {
      setIsTyping(false);
    }
  };

  const contextOptions = [
    { key: 'tecnico', label: '🔧 Técnico', icon: '💻' },
    { key: 'arquitecto', label: '🏗️ Arquitecto', icon: '📐' },
    { key: 'producto', label: '📦 Producto', icon: '📋' },
    { key: 'negocio', label: '💰 Negocios', icon: '📈' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-4 w-80 sm:w-96 z-[200] animate-in slide-in-from-right-8 duration-300">
      <div className="glass rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-2xl border border-white/10">
        <div className="p-3 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
            <span className="text-sm">👨‍💼</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">Consultor Expert</h3>
            <p className="text-[10px] text-gray-400">Asesor TradePortal</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <span className="material-symbols-outlined text-lg text-gray-400">close</span>
          </button>
        </div>
        
        <div className="px-2 py-1 bg-white/5 border-b border-white/10 flex gap-1 overflow-x-auto">
          {contextOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setCurrentContext(opt.key as 'tecnico' | 'arquitecto' | 'producto' | 'negocio')}
              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                currentContext === opt.key 
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-[85%] p-2.5 rounded-2xl text-xs ${
                msg.role === 'user' 
                  ? 'bg-primary/20 border border-primary/30 text-white' 
                  : 'bg-white/5 border border-white/10 text-gray-200'
              }`}>
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
            <button onClick={() => setInput('Análisis del proyecto')} className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300">📊 Análisis</button>
            <button onClick={() => setInput('Estado de comunidades')} className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300">📱 Comunidades</button>
            <button onClick={() => setInput('Pagos Mercadopago')} className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300">💰 Pagos</button>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder="Pregunta al experto..." 
              className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-purple-500/50" 
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs disabled:opacity-50">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertConsultant;