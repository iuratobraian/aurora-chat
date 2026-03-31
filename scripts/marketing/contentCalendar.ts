#!/usr/bin/env node

export interface ContentChannel {
  id: string;
  name: string;
  platform: 'instagram' | 'twitter' | 'telegram' | 'linkedin' | 'youtube';
  frequency: 'daily' | 'weekly' | 'biweekly';
  bestTime: string;
  bestDays: string[];
  contentTypes: ContentType[];
}

export type ContentType = 'educational' | 'entertainment' | 'promotional' | 'community' | 'trending';

export interface ContentPiece {
  id: string;
  channel: string;
  type: ContentType;
  topic: string;
  hook: string;
  body: string;
  cta?: string;
  hashtags: string[];
  mediaType: 'image' | 'video' | 'text' | 'carousel';
  scheduledFor?: number;
  status: 'idea' | 'draft' | 'approved' | 'published';
}

export interface ContentCalendar {
  week: string;
  pieces: ContentPiece[];
}

const CHANNELS: ContentChannel[] = [
  {
    id: 'ig-main',
    name: 'Instagram Principal',
    platform: 'instagram',
    frequency: 'daily',
    bestTime: '09:00',
    bestDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    contentTypes: ['educational', 'community', 'entertainment'],
  },
  {
    id: 'tg-community',
    name: 'Telegram Comunidad',
    platform: 'telegram',
    frequency: 'daily',
    bestTime: '08:00',
    bestDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    contentTypes: ['educational', 'trending', 'community'],
  },
  {
    id: 'tw-trading',
    name: 'Twitter Trading',
    platform: 'twitter',
    frequency: 'daily',
    bestTime: '08:00',
    bestDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    contentTypes: ['trending', 'educational'],
  },
];

const TOPICS_BY_NICHE = {
  trading: [
    'Price action basics',
    'Support and resistance',
    'Risk management',
    'Trading psychology',
    'Market analysis EUR/USD',
    'Crypto volatility',
    'Forex news',
    'Trading setups',
  ],
  education: [
    'What is trading',
    'Reading charts',
    'Indicators explained',
    'Trading strategies',
    'Money management',
    'Trading plan',
  ],
  community: [
    'Member spotlight',
    'Success stories',
    'Q&A sessions',
    'Weekly wins',
    'Tips from traders',
  ],
};

const HOOKS_TEMPLATES: Record<ContentType, string[]> = {
  educational: [
    'Did you know that {fact}?',
    'The #1 mistake traders make: {mistake}',
    'Quick tip about {topic}',
    'Here\'s what most people get wrong about {topic}',
  ],
  entertainment: [
    'POV: You just made your first profitable trade',
    'When {situation} in trading',
    'Reality check: {topic}',
    'Nobody talks about {topic}',
  ],
  promotional: [
    'Join {number}+ traders in our community',
    'Exclusive for TradePortal members: {offer}',
    'Limited time: {offer}',
    'New feature: {feature}',
  ],
  community: [
    'Meet {name}, our top trader this week',
    '{name} shares their trading journey',
    'Community win: {achievement}',
    'Join the conversation about {topic}',
  ],
  trending: [
    'Market update: {pair} analysis',
    'What the {news} means for your trades',
    'Today\'s trading opportunity in {pair}',
    'Breaking: {event} impact on markets',
  ],
};

export function getChannels(): ContentChannel[] {
  return CHANNELS;
}

export function generateTopic(channel: ContentChannel): string {
  const topics = TOPICS_BY_NICHE.trading;
  return topics[Math.floor(Math.random() * topics.length)];
}

export function generateHook(type: ContentType): string {
  const hooks = HOOKS_TEMPLATES[type] || HOOKS_TEMPLATES.educational;
  const template = hooks[Math.floor(Math.random() * hooks.length)];
  
  return template
    .replace('{fact}', '90% of traders lose money')
    .replace('{mistake}', 'not using stop loss')
    .replace('{topic}', 'risk management')
    .replace('{situation}', 'you check your trades every 5 minutes')
    .replace('{number}', '10,000')
    .replace('{pair}', 'EUR/USD')
    .replace('{news}', 'FED decision')
    .replace('{event}', 'CPI report');
}

export function generateContentPiece(
  channelId: string,
  type: ContentType = 'educational'
): ContentPiece {
  const channel = CHANNELS.find(c => c.id === channelId);
  if (!channel) throw new Error(`Channel ${channelId} not found`);

  const hook = generateHook(type);
  const topic = generateTopic(channel);
  
  const bodyTemplates: Record<ContentType, string> = {
    educational: `${topic}\n\nMost traders overlook this, but it\'s crucial for long-term success.\n\nDrop a 👍 if you learned something new!`,
    entertainment: `Tag a trader friend who needs to see this 👇\n\nFollow @tradeportal for more 💬`,
    promotional: `Ready to level up your trading?\n\nJoin TradePortal today:\n🔗 tradeportal.app\n\nWhat you\'ll get:\n✅ Real-time signals\n✅ Community support\n✅ AI-powered insights`,
    community: `We love seeing our community grow! 🚀\n\nThank you for being part of TradePortal. Keep trading! 💪`,
    trending: `${topic}\n\nWhat\'s your take? Comment below 👇`,
  };

  const hashtagSets = {
    trading: ['#trading', '#forex', '#inversión', '#traders', '#daytrading'],
    educational: ['#educación', '#trading', '#aprende', '#forex', '#crypto'],
    community: ['#comunidad', '#traders', '#growth', '#support'],
    entertainment: ['#tradinglife', '#forex', '#crypto', '#money'],
    trending: ['#EURUSD', '#forex', '#trading', '#market'],
  };

  return {
    id: `content_${Date.now()}`,
    channel: channelId,
    type,
    topic,
    hook,
    body: bodyTemplates[type],
    cta: type === 'educational' ? 'Save this post! 🔖' : 'Comment below 👇',
    hashtags: hashtagSets[type] || hashtagSets.trading,
    mediaType: channel.platform === 'instagram' ? 'image' : 'text',
    status: 'idea',
  };
}

export function generateWeekCalendar(weekStart: Date): ContentCalendar {
  const pieces: ContentPiece[] = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (const day of days) {
    for (const channel of CHANNELS) {
      if (!channel.bestDays.includes(day)) continue;
      
      const typeIndex = Math.floor(Math.random() * channel.contentTypes.length);
      const type = channel.contentTypes[typeIndex];
      
      pieces.push(generateContentPiece(channel.id, type));
    }
  }

  return {
    week: weekStart.toISOString().split('T')[0],
    pieces,
  };
}

export function getContentStats(pieces: ContentPiece[]): {
  byChannel: Record<string, number>;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const byChannel: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const piece of pieces) {
    byChannel[piece.channel] = (byChannel[piece.channel] || 0) + 1;
    byType[piece.type] = (byType[piece.type] || 0) + 1;
    byStatus[piece.status] = (byStatus[piece.status] || 0) + 1;
  }

  return { byChannel, byType, byStatus };
}

if (require.main === module) {
  console.log('📅 TradePortal Content Engine\n');

  console.log('Channels:');
  for (const channel of CHANNELS) {
    console.log(`  - ${channel.name} (${channel.platform}): ${channel.frequency}`);
  }

  console.log('\n📝 Sample Content:');
  const piece = generateContentPiece('ig-main', 'educational');
  console.log(`\n[${piece.type.toUpperCase()}]`);
  console.log(`Hook: ${piece.hook}`);
  console.log(`\n${piece.body}`);
  console.log(`\n${piece.hashtags.join(' ')}`);

  console.log('\n📊 Week Calendar:');
  const calendar = generateWeekCalendar(new Date());
  const stats = getContentStats(calendar.pieces);
  console.log(`Total pieces: ${calendar.pieces.length}`);
  console.log(`By channel:`, stats.byChannel);
  console.log(`By type:`, stats.byType);
}
