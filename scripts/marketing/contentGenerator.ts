#!/usr/bin/env node

export interface ContentBrief {
  id: string;
  topic: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'telegram';
  format: 'post' | 'story' | 'reel' | 'thread';
  hook: string;
  keyMessage: string;
  cta?: string;
  hashtags: string[];
  tone: 'educational' | 'promotional' | 'engaging' | 'authoritative';
  targetAudience: string;
  estimatedReach: number;
  status: 'draft' | 'approved' | 'published';
}

export interface ContentCampaign {
  id: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversion';
  targetAudience: string;
  startDate: string;
  endDate: string;
  briefs: ContentBrief[];
  metrics: {
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
  };
}

export interface MarketingChannel {
  id: string;
  name: string;
  platform: ContentBrief['platform'];
  followers: number;
  engagementRate: number;
  bestPostingTime: string;
  contentTypes: ContentBrief['format'][];
  status: 'active' | 'inactive';
}

const DEFAULT_CHANNELS: MarketingChannel[] = [
  {
    id: 'ig-main',
    name: 'Instagram Principal',
    platform: 'instagram',
    followers: 0,
    engagementRate: 3.5,
    bestPostingTime: '09:00',
    contentTypes: ['post', 'reel', 'story'],
    status: 'active',
  },
  {
    id: 'tg-community',
    name: 'Telegram Comunidad',
    platform: 'telegram',
    followers: 0,
    engagementRate: 15,
    bestPostingTime: '08:00',
    contentTypes: ['post'],
    status: 'active',
  },
];

export function generateContentBrief(
  topic: string,
  platform: ContentBrief['platform'],
  format: ContentBrief['format']
): ContentBrief {
  const hooks: Record<string, string[]> = {
    instagram: [
      `Lo que nadie te cuenta sobre ${topic}`,
      `3 errores con ${topic} que te costaron dinero`,
      `Tu guía definitiva de ${topic}`,
    ],
    twitter: [
      `${topic}: un thread 🧵`,
      `Hot take: sobre ${topic}`,
      `${topic} en 280 caracteres`,
    ],
    telegram: [
      `📊 Análisis: ${topic}`,
      `🎯干货: todo sobre ${topic}`,
      `💡 Insight: ${topic}`,
    ],
  };

  const platforms: Record<ContentBrief['platform'], string[]> = {
    instagram: ['El mundo del trading evoluciona constantemente...', 'Si llevas tiempo en esto sabes que...', 'Aquí va un secreto que pocos traders conocen...'],
    twitter: ['Quick take:', 'Let me explain:', 'Controversial opinion:'],
    linkedin: ['After years in trading, I\'ve learned that...', 'The data shows:', 'A thread on what most traders get wrong:'],
    telegram: ['Buenos días comunidad. Hoy hablamos de:', 'Análisis del día:', 'Resumen semanal:'],
  };

  const hashtagsByTopic: Record<string, string[]> = {
    'trading': ['#trading', '#forex', '#inversión', '#traders'],
    'signals': ['#señales', '#trading', '#forex', '#crypto'],
    'education': ['#educación', '#trading', '#aprende', '#forex'],
    'community': ['#comunidad', '#traders', '#growth'],
  };

  const randomHook = hooks[platform]?.[Math.floor(Math.random() * 3)] || hooks.instagram[0];
  const randomIntro = platforms[platform]?.[Math.floor(Math.random() * 3)] || platforms.instagram[0];
  const randomHashtags = hashtagsByTopic['trading'];

  return {
    id: `brief_${Date.now()}`,
    topic,
    platform,
    format,
    hook: randomHook,
    keyMessage: `${randomIntro} ${topic}`,
    cta: platform === 'instagram' ? '¿Qué opinas? Comenta 👇' : 'Comparte con alguien que lo necesite',
    hashtags: randomHashtags,
    tone: 'educational',
    targetAudience: 'Traders principiantes e intermedios',
    estimatedReach: platform === 'instagram' ? 1000 : platform === 'twitter' ? 500 : 200,
    status: 'draft',
  };
}

export function createCampaign(
  name: string,
  objective: ContentCampaign['objective'],
  targetAudience: string,
  topics: string[]
): ContentCampaign {
  const platforms: ContentBrief['platform'][] = ['instagram', 'twitter', 'telegram'];
  const formats: ContentBrief['format'][] = ['post', 'story', 'reel', 'thread'];

  const briefs: ContentBrief[] = topics.map(topic => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const format = platform === 'telegram' ? 'post' : formats[Math.floor(Math.random() * formats.length)];
    return generateContentBrief(topic, platform, format);
  });

  return {
    id: `campaign_${Date.now()}`,
    name,
    objective,
    targetAudience,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    briefs,
    metrics: { impressions: 0, engagement: 0, clicks: 0, conversions: 0 },
  };
}

export function calculateContentScore(brief: ContentBrief): number {
  let score = 50;

  if (brief.hashtags.length >= 3) score += 10;
  if (brief.hashtags.length >= 5) score += 5;
  if (brief.hook.length > 0 && brief.hook.length < 60) score += 10;
  if (brief.cta) score += 10;
  if (brief.format === 'reel') score += 15;
  if (brief.format === 'thread') score += 10;

  return Math.min(100, score);
}

export function getPostingSchedule(channels: MarketingChannel[]): Array<{
  time: string;
  channel: string;
  format: ContentBrief['format'];
}> {
  const schedule: Array<{ time: string; channel: string; format: ContentBrief['format'] }> = [];

  for (const channel of channels.filter(c => c.status === 'active')) {
    schedule.push({
      time: channel.bestPostingTime,
      channel: channel.name,
      format: channel.contentTypes[0],
    });

    if (channel.platform === 'instagram') {
      schedule.push({ time: '12:00', channel: channel.name, format: 'story' });
      schedule.push({ time: '18:00', channel: channel.name, format: 'reel' });
    }
  }

  return schedule.sort((a, b) => a.time.localeCompare(b.time));
}

if (require.main === module) {
  console.log('📣 TradePortal Marketing AI System\n');

  const brief = generateContentBrief('Trading con IA', 'instagram', 'reel');
  console.log('📝 Brief generado:');
  console.log(JSON.stringify(brief, null, 2));

  console.log('\n📅 Posting Schedule:');
  const schedule = getPostingSchedule(DEFAULT_CHANNELS);
  for (const item of schedule) {
    console.log(`  ${item.time} - ${item.channel} (${item.format})`);
  }
}
