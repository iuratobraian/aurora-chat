#!/usr/bin/env node

export interface OutreachTarget {
  name: string;
  platform: 'telegram' | 'discord' | 'whatsapp' | 'email' | 'twitter';
  audience: string;
  size?: number;
  contact?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  channel: OutreachTarget['platform'];
  subject?: string;
  message: string;
  followUpDays: number[];
}

export interface OutreachSequence {
  id: string;
  name: string;
  templates: OutreachTemplate[];
  goal: string;
  successMetric: string;
}

const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'cold-telegram',
    name: 'Mensaje frío Telegram',
    channel: 'telegram',
    message: `Hola {name}! 👋

Vi que tu comunidad se enfoca en {audience}. Me gustaría mostrarte TradePortal, una plataforma donde traders como tú comparten señales, estrategias y análisis.

¿Qué te parece si agendemos una demo rápida de 15 min?

El link: tradeportal.app/demo`,
    followUpDays: [3, 7],
  },
  {
    id: 'cold-discord',
    name: 'Mensaje frío Discord',
    channel: 'discord',
    message: `Hey! 👋

Soy de TradePortal. Estamos buscando comunidades de trading para compartir nuestra plataforma - los miembros pueden acceder a señales, análisis de IA y conectar con traders experimentados.

¿Te suena interesante? Puedo mostrarte cómo funciona.`,
    followUpDays: [5],
  },
  {
    id: 'warm-email',
    name: 'Email cálido',
    channel: 'email',
    subject: 'TradePortal para comunidades de trading',
    message: `Hola {name},

Vi {community_name} y me encantó el enfoque en {audience}.

En TradePortal ayudamos a comunidades como la tuya a:
- compartir señales de trading en tiempo real
- acceder a análisis generados por IA
- conectar miembros con traders pro

¿Podemos agendar 15 min esta semana para mostrarte la plataforma?

Saludos`,
    followUpDays: [4, 10],
  },
  {
    id: 'twitter-dm',
    name: 'DM Twitter/X',
    channel: 'twitter',
    message: `Hey! Vi que hablas de {audience}. 

Tengo algo que te puede servir: una plataforma donde traders comparten señales y análisis. 

Interesado/a en ver cómo funciona? 👇`,
    followUpDays: [2, 5, 12],
  },
];

export const OUTREACH_SEQUENCES: OutreachSequence[] = [
  {
    id: 'community-outreach',
    name: 'Captación de comunidades',
    templates: OUTREACH_TEMPLATES,
    goal: 'Agendar demo',
    successMetric: '3 demos agendadas por cada 100 mensajes',
  },
];

export function generateOutreachMessage(
  template: OutreachTemplate,
  target: OutreachTarget,
  customFields?: Record<string, string>
): string {
  let message = template.message;
  
  message = message.replace('{name}', target.name);
  message = message.replace('{audience}', target.audience);
  
  if (customFields) {
    for (const [key, value] of Object.entries(customFields)) {
      message = message.replace(`{${key}}`, value);
    }
  }
  
  return message;
}

export function getOutreachStats(messages: Array<{ sent: number; responded: number; demos: number }>) {
  const total = messages.reduce((sum, m) => sum + m.sent, 0);
  const totalResponded = messages.reduce((sum, m) => sum + m.responded, 0);
  const totalDemos = messages.reduce((sum, m) => sum + m.demos, 0);
  
  return {
    sent: total,
    responseRate: total > 0 ? (totalResponded / total * 100).toFixed(1) + '%' : '0%',
    demoRate: total > 0 ? (totalDemos / total * 100).toFixed(1) + '%' : '0%',
    conversionRate: totalResponded > 0 ? (totalDemos / totalResponded * 100).toFixed(1) + '%' : '0%',
  };
}

if (require.main === module) {
  console.log('📊 TradePortal Outreach Scripts\n');
  
  console.log('Templates disponibles:');
  for (const template of OUTREACH_TEMPLATES) {
    console.log(`  - ${template.id}: ${template.name} (${template.channel})`);
  }
  
  console.log('\n📝 Generar mensaje de ejemplo:');
  const target: OutreachTarget = {
    name: 'Juan Trading',
    platform: 'telegram',
    audience: 'Forex y crypto',
  };
  
  const template = OUTREACH_TEMPLATES[0];
  const message = generateOutreachMessage(template, target);
  console.log('\n' + message);
}
