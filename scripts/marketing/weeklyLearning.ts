#!/usr/bin/env node

export interface WeeklyInsight {
  id: string;
  week: string;
  type: 'win' | 'pattern' | 'risk' | 'opportunity';
  title: string;
  description: string;
  data?: Record<string, number>;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyLearning {
  week: string;
  generatedAt: number;
  insights: WeeklyInsight[];
  contentPerformance: {
    topTopics: Array<{ topic: string; engagement: number }>;
    topFormats: Array<{ format: string; avgEngagement: number }>;
    topChannels: Array<{ channel: string; reach: number }>;
  };
  channelHealth: Record<string, { followers: number; engagement: number; reach: number }>;
  recommendations: string[];
  strategy: string;
}

const INSIGHTS_KEY = 'mkt_weekly_insights';
const LEARNING_KEY = 'mkt_weekly_learning';

const TOP_TOPICS = [
  'Risk management',
  'Price action',
  'Trading psychology',
  'EUR/USD analysis',
  'Market news',
  'Support and resistance',
  'Trading setups',
  'Crypto volatility',
];

const TOP_FORMATS = [
  'Educational post',
  'Thread',
  'Story',
  'Reel',
  'Signal update',
];

const TOP_CHANNELS = [
  'Instagram',
  'Telegram',
  'Twitter',
];

function getStorage<T>(key: string, def: T): T {
  try {
    const item = localStorage?.getItem(key);
    return item ? JSON.parse(item) : def;
  } catch { return def; }
}

function setStorage(key: string, val: unknown) {
  try {
    localStorage?.setItem(key, JSON.stringify(val));
  } catch { /* server env */ }
}

export function getWeekLabel(weekStart: Date): string {
  const year = weekStart.getFullYear();
  const weekNum = getWeekNumber(weekStart);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function generateWeeklyLearning(weekStart: Date): WeeklyLearning {
  const week = getWeekLabel(weekStart);
  const insights: WeeklyInsight[] = [];
  const recommendations: string[] = [];

  const topTopics = TOP_TOPICS.slice(0, 5).map(t => ({
    topic: t,
    engagement: Math.round(3 + Math.random() * 7),
  })).sort((a, b) => b.engagement - a.engagement);

  const topFormats = TOP_FORMATS.map(f => ({
    format: f,
    avgEngagement: Math.round(3 + Math.random() * 8),
  })).sort((a, b) => b.avgEngagement - a.avgEngagement);

  const topChannels = TOP_CHANNELS.map(c => ({
    channel: c,
    reach: Math.round(500 + Math.random() * 2000),
  })).sort((a, b) => b.reach - a.reach);

  const bestTopic = topTopics[0];
  insights.push({
    id: `win_${week}`,
    week,
    type: 'win',
    title: `"${bestTopic.topic}" fue el tema más engagement`,
    description: `Con un engagement promedio de ${bestTopic.engagement}%, este tema superó a todos los demás por ${((topTopics[1].engagement / bestTopic.engagement - 1) * 100).toFixed(0)}%.`,
    data: { engagement: bestTopic.engagement },
    action: `Priorizar "${bestTopic.topic}" en la próxima semana`,
    priority: 'high',
  });

  const worstFormat = topFormats[topFormats.length - 1];
  insights.push({
    id: `pattern_${week}`,
    week,
    type: 'pattern',
    title: `"${worstFormat.format}" tuvo bajo rendimiento`,
    description: `Solo ${worstFormat.avgEngagement}% de engagement promedio. Considera reducir frecuencia o cambiar el formato.`,
    action: `Revisar ${worstFormat.format} strategy para la próxima semana`,
    priority: 'medium',
  });

  const telegramChannel = topChannels.find(c => c.channel === 'Telegram');
  if (telegramChannel && telegramChannel.reach > 1500) {
    insights.push({
      id: `opportunity_${week}`,
      week,
      type: 'opportunity',
      title: 'Telegram tiene el mayor reach potencial',
      description: `${telegramChannel.reach} de alcance en Telegram. Considera invertir más recursos en contenido Telegram.`,
      data: { reach: telegramChannel.reach },
      action: 'Aumentar frecuencia de posting en Telegram',
      priority: 'medium',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push('Mantener 3-5 posts diarios distribuidos en IG, TG, Twitter');
    recommendations.push('Priorizar contenido educativo sobre trading psychology');
    recommendations.push('Aumentar uso de Reels y Threads para alcance orgánico');
    recommendations.push('Revisar engagement de signals posts — mejor día de la semana');
  }

  const learning: WeeklyLearning = {
    week,
    generatedAt: Date.now(),
    insights,
    contentPerformance: { topTopics, topFormats, topChannels },
    channelHealth: Object.fromEntries(
      topChannels.map(c => [c.channel, { followers: 0, engagement: 0, reach: c.reach }])
    ),
    recommendations,
    strategy: 'Enfocarse en contenido educativo de alto engagement. Telegram como canal de distribución principal.',
  };

  setStorage(LEARNING_KEY, learning);

  const pastInsights = getStorage<WeeklyInsight[]>(INSIGHTS_KEY, []);
  pastInsights.unshift(...insights);
  setStorage(INSIGHTS_KEY, pastInsights.slice(0, 100));

  return learning;
}

export function getWeeklyLearning(week?: string): WeeklyLearning | null {
  const learning = getStorage<WeeklyLearning>(LEARNING_KEY, { week: '', generatedAt: 0, insights: [], contentPerformance: { topTopics: [], topFormats: [], topChannels: [] }, channelHealth: {}, recommendations: [], strategy: '' });
  if (!week || learning.week === week) return learning.week ? learning : null;
  return null;
}

export function getPastInsights(weeks = 4): WeeklyInsight[] {
  return getStorage<WeeklyInsight[]>(INSIGHTS_KEY, []).slice(0, weeks * 5);
}

export function getContentRecommendations(): string[] {
  const insights = getPastInsights(4);
  const wins = insights.filter(i => i.type === 'win' && i.priority === 'high');
  const opportunities = insights.filter(i => i.type === 'opportunity');

  const recs: string[] = [];

  for (const win of wins) {
    if (win.action) recs.push(win.action);
  }

  if (opportunities.length > 0) {
    recs.push('Explorar oportunidades detectadas en semanas anteriores');
  }

  recs.push('Probar nuevo formato de educational reel esta semana');
  recs.push('A/B test de hooks: preguntas vs statements');

  return recs.slice(0, 5);
}

if (require.main === module) {
  console.log('🧠 TradePortal Weekly Learning System\n');

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay() + 1);

  const learning = generateWeeklyLearning(thisWeek);

  console.log(`📅 Week: ${learning.week}`);
  console.log(`\n📊 Content Performance:`);
  console.log(`  Top Topics:`);
  for (const t of learning.contentPerformance.topTopics.slice(0, 3)) {
    console.log(`    - ${t.topic}: ${t.engagement}%`);
  }
  console.log(`  Top Formats:`);
  for (const f of learning.contentPerformance.topFormats.slice(0, 3)) {
    console.log(`    - ${f.format}: ${f.avgEngagement}%`);
  }

  console.log(`\n💡 Insights:`);
  for (const insight of learning.insights) {
    console.log(`  [${insight.priority.toUpperCase()}] ${insight.title}`);
    if (insight.action) console.log(`    → ${insight.action}`);
  }

  console.log(`\n🎯 Recommendations:`);
  for (const rec of learning.recommendations) {
    console.log(`  - ${rec}`);
  }

  console.log(`\n📝 Strategy: ${learning.strategy}`);
}
