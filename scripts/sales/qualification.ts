#!/usr/bin/env node

export type QualificationLevel = 'hot' | 'warm' | 'cold' | 'not_fit';

export interface QualifiedLead {
  name: string;
  platform: string;
  audience: string;
  size: number;
  engagement: number;
  revenue?: number;
  qualification: QualificationLevel;
  score: number;
  nextAction: string;
  notes: string[];
}

export interface QualificationCriteria {
  minMembers: number;
  maxMembers: number;
  minEngagement: number;
  targetAudience: string[];
  redFlags: string[];
}

const DEFAULT_CRITERIA: QualificationCriteria = {
  minMembers: 50,
  maxMembers: 10000,
  minEngagement: 10,
  targetAudience: [
    'trading',
    'forex',
    'crypto',
    'binance',
    'inversión',
    'stocks',
    'day trading',
    'swing trading',
  ],
  redFlags: [
    'scam',
    'signals falsos',
    'pump and dump',
    'mlm',
    'trading automatizado sin监管',
  ],
};

export function qualifyLead(
  lead: {
    name: string;
    platform: string;
    audience: string;
    size: number;
    engagement?: number;
    description?: string;
  },
  criteria: QualificationCriteria = DEFAULT_CRITERIA
): QualifiedLead {
  let score = 0;
  const notes: string[] = [];

  const audienceLower = lead.audience.toLowerCase();
  const descriptionLower = (lead.description || '').toLowerCase();
  
  for (const audience of criteria.targetAudience) {
    if (audienceLower.includes(audience)) {
      score += 25;
      notes.push(`Audience match: ${audience}`);
      break;
    }
  }
  
  if (lead.size >= criteria.minMembers && lead.size <= criteria.maxMembers) {
    score += 20;
    notes.push(`Size OK: ${lead.size} members`);
  } else if (lead.size < criteria.minMembers) {
    score -= 10;
    notes.push(`Too small: ${lead.size} members`);
  } else {
    score += 10;
    notes.push(`Large: ${lead.size} members`);
  }
  
  const engagement = lead.engagement || 0;
  if (engagement >= criteria.minEngagement) {
    score += 15;
    notes.push(`Engagement OK: ${engagement}%`);
  } else {
    score -= 5;
    notes.push(`Low engagement: ${engagement}%`);
  }
  
  for (const flag of criteria.redFlags) {
    if (audienceLower.includes(flag) || descriptionLower.includes(flag)) {
      score -= 50;
      notes.push(`RED FLAG: ${flag}`);
    }
  }

  let qualification: QualificationLevel;
  let nextAction: string;

  if (score < 0) {
    qualification = 'not_fit';
    nextAction = 'Descartar - no encaja con criteria';
  } else if (score >= 60) {
    qualification = 'hot';
    nextAction = 'Agendar demo ASAP';
  } else if (score >= 40) {
    qualification = 'warm';
    nextAction = 'Enviar info y agendar follow-up';
  } else {
    qualification = 'cold';
    nextAction = 'Nurture con contenido';
  }

  return {
    ...lead,
    engagement: engagement,
    qualification,
    score,
    nextAction,
    notes,
  };
}

export function qualifyBatch(
  leads: Array<{
    name: string;
    platform: string;
    audience: string;
    size: number;
    engagement?: number;
    description?: string;
  }>
): QualifiedLead[] {
  return leads.map(lead => qualifyLead(lead));
}

export function filterByQualification(
  leads: QualifiedLead[],
  levels: QualificationLevel[]
): QualifiedLead[] {
  return leads.filter(lead => levels.includes(lead.qualification));
}

export function getOutreachPriority(leads: QualifiedLead[]): QualifiedLead[] {
  const hotLeads = filterByQualification(leads, ['hot']);
  const warmLeads = filterByQualification(leads, ['warm']);
  const coldLeads = filterByQualification(leads, ['cold']);
  
  return [
    ...hotLeads.sort((a, b) => b.score - a.score),
    ...warmLeads.sort((a, b) => b.score - a.score),
    ...coldLeads.sort((a, b) => b.score - a.score),
  ];
}

if (require.main === module) {
  console.log('🔍 TradePortal Lead Qualification\n');

  const testLeads = [
    { name: 'Forex Argentina', platform: 'Telegram', audience: 'Forex y trading', size: 500, engagement: 15 },
    { name: 'Crypto Signals VIP', platform: 'Discord', audience: 'Señales crypto pump', size: 2000, engagement: 25 },
    { name: 'Mi Club de Inversores', platform: 'WhatsApp', audience: 'Inversión general', size: 80, engagement: 8 },
    { name: 'Trading Bot Masters', platform: 'Telegram', audience: 'Bots automatizados trading', size: 300, engagement: 5 },
  ];

  const qualified = qualifyBatch(testLeads);
  const prioritized = getOutreachPriority(qualified);

  console.log('\n📊 Resultados:\n');
  for (const lead of prioritized) {
    const icon = lead.qualification === 'hot' ? '🔥' : lead.qualification === 'warm' ? '☀️' : lead.qualification === 'cold' ? '❄️' : '🚫';
    console.log(`${icon} ${lead.name} (${lead.qualification}) - Score: ${lead.score}`);
    console.log(`   Next: ${lead.nextAction}`);
    console.log(`   Notes: ${lead.notes.join(', ')}`);
    console.log();
  }
}
