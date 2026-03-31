#!/usr/bin/env node

export interface GrowthMetric {
  date: string;
  followers: number;
  engagement: number;
  reach: number;
  clicks: number;
  conversions: number;
}

export interface WeeklyReport {
  week: string;
  metrics: {
    totalPosts: number;
    totalReach: number;
    avgEngagement: number;
    topPerforming: string[];
    growthFollowers: number;
    clicks: number;
    conversions: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface BatchJob {
  id: string;
  type: 'post' | 'dm' | 'engagement' | 'content';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledFor: number;
  result?: string;
  error?: string;
}

export interface AutomationConfig {
  channels: string[];
  postingTimes: string[];
  engagementActions: EngagementAction[];
  autoRespond: boolean;
  dms: DMConfig[];
}

interface EngagementAction {
  type: 'like' | 'comment' | 'follow' | 'dm';
  keywords: string[];
  response?: string;
}

interface DMConfig {
  trigger: string;
  message: string;
  delay: number;
}

const GROWTH_METRICS_KEY = 'growth_metrics';
const BATCH_JOBS_KEY = 'batch_jobs';

function getLocalStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch { return defaultVal; }
}

function setLocalStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[GrowthAutomation] Failed to save:', e);
  }
}

export function recordMetric(metric: GrowthMetric): void {
  const metrics = getLocalStorage<GrowthMetric[]>(GROWTH_METRICS_KEY, []);
  const existingIndex = metrics.findIndex(m => m.date === metric.date);
  
  if (existingIndex >= 0) {
    metrics[existingIndex] = metric;
  } else {
    metrics.push(metric);
  }
  
  metrics.sort((a, b) => b.date.localeCompare(a.date));
  setLocalStorage(GROWTH_METRICS_KEY, metrics.slice(0, 90));
}

export function getMetrics(days = 30): GrowthMetric[] {
  return getLocalStorage<GrowthMetric[]>(GROWTH_METRICS_KEY, []).slice(0, days);
}

export function generateWeeklyReport(weekStart: Date): WeeklyReport {
  const metrics = getMetrics(7);
  
  const totalPosts = metrics.length;
  const totalReach = metrics.reduce((sum, m) => sum + m.reach, 0);
  const avgEngagement = totalPosts > 0 
    ? metrics.reduce((sum, m) => sum + m.engagement, 0) / totalPosts 
    : 0;
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  
  const topPerforming = metrics
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 3)
    .map(m => m.date);
  
  const insights: string[] = [];
  if (avgEngagement > 5) insights.push('Engagement alto este semana');
  if (totalConversions > 10) insights.push('Buena conversión de contenido');
  if (totalReach > 10000) insights.push('Alto alcance logrado');
  
  const recommendations: string[] = [];
  if (avgEngagement < 2) recommendations.push('Considera usar más hooks en posts');
  if (totalConversions < 5) recommendations.push('Revisa CTAs y timing de posts');
  
  return {
    week: weekStart.toISOString().split('T')[0],
    metrics: {
      totalPosts,
      totalReach,
      avgEngagement: Math.round(avgEngagement * 100) / 100,
      topPerforming,
      growthFollowers: metrics.length > 0 ? metrics[0].followers : 0,
      clicks: totalClicks,
      conversions: totalConversions,
    },
    insights,
    recommendations,
  };
}

export function scheduleBatchJob(job: Omit<BatchJob, 'id' | 'status'>): BatchJob {
  const jobs = getLocalStorage<BatchJob[]>(BATCH_JOBS_KEY, []);
  const newJob: BatchJob = {
    ...job,
    id: `job_${Date.now()}`,
    status: 'pending',
  };
  jobs.push(newJob);
  setLocalStorage(BATCH_JOBS_KEY, jobs);
  return newJob;
}

export function processBatchJobs(): BatchJob[] {
  const jobs = getLocalStorage<BatchJob[]>(BATCH_JOBS_KEY, []);
  const now = Date.now();
  const updated: BatchJob[] = [];
  
  for (const job of jobs) {
    if (job.status === 'pending' && job.scheduledFor <= now) {
      job.status = 'running';
      job.result = `Processing ${job.type}...`;
      setTimeout(() => {
        job.status = 'completed';
        job.result = `${job.type} completed successfully`;
        setLocalStorage(BATCH_JOBS_KEY, updated);
      }, 1000);
    }
    updated.push(job);
  }
  
  setLocalStorage(BATCH_JOBS_KEY, updated);
  return updated.filter(j => j.status === 'pending' || j.status === 'running');
}

export function getPendingJobs(): BatchJob[] {
  return getLocalStorage<BatchJob[]>(BATCH_JOBS_KEY, []).filter(
    j => j.status === 'pending' || j.status === 'running'
  );
}

export function cancelJob(jobId: string): boolean {
  const jobs = getLocalStorage<BatchJob[]>(BATCH_JOBS_KEY, []);
  const job = jobs.find(j => j.id === jobId);
  if (job && job.status === 'pending') {
    job.status = 'failed';
    job.error = 'Cancelled by user';
    setLocalStorage(BATCH_JOBS_KEY, jobs);
    return true;
  }
  return false;
}

export function createEngagementActions(): EngagementAction[] {
  return [
    {
      type: 'comment',
      keywords: ['trading', 'forex', 'crypto', 'inversión'],
      response: '¡Buen punto! ¿Qué tipo de estrategias usas?',
    },
    {
      type: 'like',
      keywords: ['trading', 'señales', 'análisis'],
    },
    {
      type: 'follow',
      keywords: ['trader', 'crypto', 'forex'],
    },
  ];
}

export function createDMConfigs(): DMConfig[] {
  return [
    {
      trigger: 'welcome',
      message: '¡Bienvenido a TradePortal! ¿En qué puedo ayudarte?',
      delay: 5000,
    },
    {
      trigger: 'question',
      message: 'Veo que tienes una pregunta. Te recomiendo nuestra sección de ayuda: tradeportal.app/help',
      delay: 10000,
    },
  ];
}

export function getDefaultAutomationConfig(): AutomationConfig {
  return {
    channels: ['instagram', 'telegram'],
    postingTimes: ['08:00', '12:00', '18:00'],
    engagementActions: createEngagementActions(),
    autoRespond: true,
    dms: createDMConfigs(),
  };
}

export function calculateROI(spend: number, conversions: number, avgValue: number): {
  revenue: number;
  profit: number;
  roi: number;
} {
  const revenue = conversions * avgValue;
  const profit = revenue - spend;
  const roi = spend > 0 ? (profit / spend) * 100 : 0;
  
  return { revenue, profit, roi };
}

if (require.main === module) {
  console.log('📈 TradePortal Growth Automation\n');

  const sampleMetrics: GrowthMetric[] = [
    { date: '2026-03-15', followers: 1000, engagement: 4.5, reach: 5000, clicks: 120, conversions: 5 },
    { date: '2026-03-16', followers: 1020, engagement: 5.2, reach: 5500, clicks: 150, conversions: 8 },
    { date: '2026-03-17', followers: 1050, engagement: 4.8, reach: 5800, clicks: 140, conversions: 6 },
    { date: '2026-03-18', followers: 1080, engagement: 6.1, reach: 6200, clicks: 180, conversions: 10 },
    { date: '2026-03-19', followers: 1100, engagement: 5.5, reach: 6000, clicks: 160, conversions: 7 },
  ];

  for (const m of sampleMetrics) recordMetric(m);

  console.log('Sample Metrics:', getMetrics(5));
  
  const report = generateWeeklyReport(new Date());
  console.log('\n📊 Weekly Report:');
  console.log(JSON.stringify(report, null, 2));
  
  console.log('\n💰 ROI Example:');
  const roi = calculateROI(100, 20, 25);
  console.log(`Spend: $100, Conversions: 20, Avg Value: $25`);
  console.log(`Revenue: $${roi.revenue}, Profit: $${roi.profit}, ROI: ${roi.roi.toFixed(1)}%`);
}
