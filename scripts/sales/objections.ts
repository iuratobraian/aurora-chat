#!/usr/bin/env node

export interface Objection {
  keywords: string[];
  category: 'price' | 'time' | 'trust' | 'competitor' | 'need' | 'authority';
  response: string;
  probeQuestion?: string;
}

export const OBJECTION_HANDLERS: Objection[] = [
  {
    keywords: ['caro', 'expensive', 'precio', 'costoso', 'no tengo presupuesto', "don't have budget"],
    category: 'price',
    response: 'Entiendo la preocupación con el presupuesto. El plan Pro incluye señales premium, IA personalizada y reportes. Para comunidades pequeñas, hay descuentos. ¿Cuántos miembros tiene tu comunidad?',
    probeQuestion: '¿Han probado alguna herramienta similar antes?',
  },
  {
    keywords: ['no tengo tiempo', 'no time', 'muy ocupado', 'too busy', 'después'],
    category: 'time',
    response: 'Totalmente, el tiempo es valioso. La demo dura 15 min y te muestra todo. Después puedes decidir sin presión. ¿Cuándo te viene mejor, mañana o la próxima semana?',
    probeQuestion: '¿Cuándo fue la última vez que evaluaron herramientas para la comunidad?',
  },
  {
    keywords: ['no lo necesito', "don't need", 'ya tenemos', 'we have', 'no nos sirve'],
    category: 'need',
    response: 'Me encanta que ya tengan algo. ¿Qué les falta? A veces una segunda opinión ayuda a mejorar lo que ya tienen.',
    probeQuestion: '¿Qué metricas usan para medir el éxito de la comunidad?',
  },
  {
    keywords: ['ya uso', 'already using', 'competidor', 'competitor', 'alternativas'],
    category: 'competitor',
    response: '¡Genial que ya exploren opciones! Cada herramienta tiene sus pros y contras. ¿Qué les gusta de lo que usan? Me interesa saber para ver si podemos complementar o mejorar.',
    probeQuestion: '¿Qué les gustaría mejorar de su solución actual?',
  },
  {
    keywords: ['no soy yo quien decide', "can't decide", 'tengo que consultar', 'have to ask', 'hablar con'],
    category: 'authority',
    response: 'Entiendo, es una decisión de equipo. ¿Quién más está involucrado? Puedo incluirlo en la próxima conversación o enviarle info directa.',
    probeQuestion: '¿Cuándo se reúnen para decidir sobre herramientas?',
  },
  {
    keywords: ['no confío', "don't trust", 'estafa', 'scam', 'no es seguro'],
    category: 'trust',
    response: 'La confianza es clave. Somos una plataforma establecida con +10k traders activos. Puedo mostrarte casos de éxito de comunidades similares a la tuya.',
    probeQuestion: '¿Ha tenido malas experiencias antes con este tipo de herramientas?',
  },
];

export function detectObjection(message: string): Objection | null {
  const lower = message.toLowerCase();
  
  for (const objection of OBJECTION_HANDLERS) {
    for (const keyword of objection.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return objection;
      }
    }
  }
  
  return null;
}

export function handleObjection(message: string): {
  recognized: boolean;
  objection?: Objection;
  response?: string;
  probeQuestion?: string;
} {
  const objection = detectObjection(message);
  
  if (!objection) {
    return { recognized: false };
  }
  
  return {
    recognized: true,
    objection,
    response: objection.response,
    probeQuestion: objection.probeQuestion,
  };
}

export function getCategoryStats(handled: Array<{ category: Objection['category']; resolved: boolean }>) {
  const stats: Record<string, { total: number; resolved: number }> = {};
  
  for (const item of handled) {
    if (!stats[item.category]) {
      stats[item.category] = { total: 0, resolved: 0 };
    }
    stats[item.category].total++;
    if (item.resolved) {
      stats[item.category].resolved++;
    }
  }
  
  return Object.entries(stats).map(([category, data]) => ({
    category,
    total: data.total,
    resolved: data.resolved,
    resolutionRate: (data.resolved / data.total * 100).toFixed(1) + '%',
  }));
}

if (require.main === module) {
  console.log('💬 TradePortal Objection Handling\n');
  
  const testMessages = [
    'Está muy caro para nosotros',
    'No tengo tiempo ahora, quizás después',
    'Ya usamos otra plataforma similar',
    'Tengo que consultarlo con mi socio',
    'No estoy seguro de que lo necesitemos',
  ];
  
  for (const msg of testMessages) {
    const result = handleObjection(msg);
    console.log(`\n❓ "${msg}"`);
    if (result.recognized) {
      console.log(`   📌 Categoría: ${result.objection?.category}`);
      console.log(`   💡 Respuesta: ${result.response}`);
      if (result.probeQuestion) {
        console.log(`   🔍 Pregunta: ${result.probeQuestion}`);
      }
    } else {
      console.log('   ⚠️ No reconocida - transferir a humano');
    }
  }
}
