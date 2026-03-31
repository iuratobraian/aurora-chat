#!/usr/bin/env node

export type ClosingTechnique = 'assumptive' | 'direct' | 'urgency' | 'alternative' | 'summary';

export interface CloseAttempt {
  technique: ClosingTechnique;
  pitch: string;
  success: boolean;
  reason?: string;
}

export interface DemoScheduler {
  date: string;
  time: string;
  platform: 'zoom' | 'meet' | 'telegram' | 'discord';
  confirmation: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

const CLOSING_TECHNIQUES: Record<ClosingTechnique, (context: { name: string; pain: string; plan?: string }) => string> = {
  assumptive: ({ name, pain }) =>
    `Perfecto ${name}, Entonces ¿la demo el ${getDefaultDate()} a las ${getDefaultTime()}? Te envío el link de Zoom.`,

  direct: ({ pain }) =>
    `¿Hay alguna razón por la que no deberíamos proceder con la demo? Si no hay nada más, agendemos.`,

  urgency: ({ name }) =>
    `${name}, esta semana tenemos disponibilidad el ${getDefaultDate()}. Después se llena rápido por el launch de nuevas features.`,

  alternative: () =>
    '¿Prefieres que la demo sea por Zoom, Meet o Telegram? Así te mando el link.',

  summary: ({ name, pain, plan }) =>
    `${name}, resumiendo: la demo cubre ${pain}. Tienen el plan ${plan || 'básico'}. ¿Procedemos?`,
};

function getDefaultDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getDefaultTime(): string {
  return '10:00 AM';
}

export function generateClose(
  technique: ClosingTechnique,
  context: { name: string; pain: string; plan?: string }
): string {
  const generator = CLOSING_TECHNIQUES[technique];
  return generator(context);
}

export function getClosingForStage(stage: 'demo_done' | 'negotiation' | 'proposal' | 'closing'): ClosingTechnique[] {
  switch (stage) {
    case 'demo_done':
      return ['alternative', 'assumptive'];
    case 'negotiation':
      return ['direct', 'urgency'];
    case 'proposal':
      return ['summary', 'direct'];
    case 'closing':
      return ['direct', 'urgency'];
    default:
      return ['alternative'];
  }
}

export function scheduleDemo(details: Partial<DemoScheduler> = {}): DemoScheduler {
  return {
    date: details.date || getDefaultDate(),
    time: details.time || getDefaultTime(),
    platform: details.platform || 'zoom',
    confirmation: 'pending',
    notes: details.notes,
  };
}

export function confirmDemo(demo: DemoScheduler): DemoScheduler {
  return { ...demo, confirmation: 'confirmed' };
}

export function calculateROI(
  communitySize: number,
  monthlyRevenue: number,
  tradeportalFee: number = 0.20
): {
  monthlyRevenue: number;
  platformFee: number;
  netRevenue: number;
  yearlyProjection: number;
} {
  const platformFee = monthlyRevenue * tradeportalFee;
  const netRevenue = monthlyRevenue - platformFee;
  
  return {
    monthlyRevenue,
    platformFee,
    netRevenue,
    yearlyProjection: netRevenue * 12,
  };
}

export function getPricingTiers() {
  return {
    starter: {
      name: 'Starter',
      price: 29,
      features: ['100 miembros', '5 comunidades', 'Analytics básico'],
    },
    growth: {
      name: 'Growth',
      price: 79,
      features: ['500 miembros', '20 comunidades', 'Analytics avanzado', 'AI insights'],
    },
    scale: {
      name: 'Scale',
      price: 199,
      features: ['Miembros ilimitados', 'Comunidades ilimitadas', 'API access', 'Priority support'],
    },
  };
}

if (require.main === module) {
  console.log('🎯 TradePortal Closing Scripts\n');
  
  const context = { name: 'Juan', pain: 'señales de trading', plan: 'Growth' };
  
  console.log('Técnicas de cierre:\n');
  for (const technique of Object.keys(CLOSING_TECHNIQUES) as ClosingTechnique[]) {
    const pitch = generateClose(technique, context);
    console.log(`[${technique}]`);
    console.log(`"${pitch}"\n`);
  }
  
  console.log('\n📊 ROI Example:');
  const roi = calculateROI(200, 500);
  console.log(`Community de 200 miembros, $500/mes revenue:`);
  console.log(`  Revenue mensual: $${roi.monthlyRevenue}`);
  console.log(`  Platform fee (20%): -$${roi.platformFee}`);
  console.log(`  Net: $${roi.netRevenue}`);
  console.log(`  Yearly: $${roi.yearlyProjection}`);
}
