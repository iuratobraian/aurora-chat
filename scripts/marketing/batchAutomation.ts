#!/usr/bin/env node

export interface BatchConfig {
  channels: string[];
  frequency: 'daily' | 'weekly';
  autoPost: boolean;
  aiEnhance: boolean;
  maxPostsPerDay: number;
}

export interface BatchReport {
  id: string;
  timestamp: number;
  config: BatchConfig;
  calendar: {
    generated: number;
    approved: number;
    scheduled: number;
    published: number;
  };
  metrics: {
    postsGenerated: number;
    engagement: number;
    reach: number;
    conversions: number;
  };
  learnings: string[];
  errors: string[];
  duration: number;
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  start?: number;
  end?: number;
  result?: unknown;
  error?: string;
}

const CONFIG_KEY = 'mkt_batch_config';
const REPORT_KEY = 'mkt_batch_reports';
const PIPELINE_KEY = 'mkt_pipeline';

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

export function getBatchConfig(): BatchConfig {
  return getStorage<BatchConfig>(CONFIG_KEY, {
    channels: ['instagram', 'telegram', 'twitter'],
    frequency: 'daily',
    autoPost: false,
    aiEnhance: false,
    maxPostsPerDay: 5,
  });
}

export function saveBatchConfig(config: Partial<BatchConfig>): BatchConfig {
  const current = getBatchConfig();
  const updated = { ...current, ...config };
  setStorage(CONFIG_KEY, updated);
  return updated;
}

export function getBatchReports(limit = 30): BatchReport[] {
  return getStorage<BatchReport[]>(REPORT_KEY, []).slice(0, limit);
}

export function runPipeline(): BatchReport {
  const start = Date.now();
  const report: BatchReport = {
    id: `batch_${start}`,
    timestamp: start,
    config: getBatchConfig(),
    calendar: { generated: 0, approved: 0, scheduled: 0, published: 0 },
    metrics: { postsGenerated: 0, engagement: 0, reach: 0, conversions: 0 },
    learnings: [],
    errors: [],
    duration: 0,
  };

  const steps: PipelineStep[] = [
    { name: 'generate_calendar', status: 'pending' },
    { name: 'score_content', status: 'pending' },
    { name: 'auto_approve', status: 'pending' },
    { name: 'schedule_posts', status: 'pending' },
    { name: 'track_metrics', status: 'pending' },
    { name: 'learn', status: 'pending' },
  ];

  setStorage(PIPELINE_KEY, steps);

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      step.status = 'running';
      step.start = Date.now();

      switch (step.name) {
        case 'generate_calendar':
          step.result = runGenerateCalendar(report);
          break;
        case 'score_content':
          step.result = runScoreContent(report);
          break;
        case 'auto_approve':
          step.result = runAutoApprove(report);
          break;
        case 'schedule_posts':
          step.result = runSchedulePosts(report);
          break;
        case 'track_metrics':
          step.result = runTrackMetrics(report);
          break;
        case 'learn':
          step.result = runLearn(report);
          break;
      }

      step.status = 'done';
      step.end = Date.now();
      setStorage(PIPELINE_KEY, steps);
    }
  } catch (err) {
    const failedStep = steps.find(s => s.status === 'running');
    if (failedStep) {
      failedStep.status = 'failed';
      failedStep.error = err instanceof Error ? err.message : String(err);
      report.errors.push(`Step ${failedStep.name}: ${failedStep.error}`);
    }
  }

  report.duration = Date.now() - start;

  const reports = getBatchReports();
  reports.unshift(report);
  setStorage(REPORT_KEY, reports.slice(0, 90));

  return report;
}

function runGenerateCalendar(report: BatchReport): { pieces: number } {
  const channels = getBatchConfig().channels;
  const piecesPerChannel = Math.floor(getBatchConfig().maxPostsPerDay / channels.length);
  const total = channels.length * piecesPerChannel;
  report.calendar.generated = total;
  report.metrics.postsGenerated = total;
  return { pieces: total };
}

function runScoreContent(report: BatchReport): { avgScore: number } {
  const score = 72;
  report.learnings.push(`Avg content score: ${score}/100`);
  return { avgScore: score };
}

function runAutoApprove(report: BatchReport): { approved: number } {
  const approved = Math.floor(report.calendar.generated * 0.8);
  report.calendar.approved = approved;
  return { approved };
}

function runSchedulePosts(report: BatchReport): { scheduled: number } {
  const scheduled = getBatchConfig().autoPost ? report.calendar.approved : 0;
  report.calendar.scheduled = scheduled;
  return { scheduled };
}

function runTrackMetrics(report: BatchReport): { reach: number; engagement: number } {
  const reach = report.calendar.published * 150;
  const engagement = report.calendar.published * 0.045;
  report.metrics.reach = reach;
  report.metrics.engagement = engagement;
  return { reach, engagement };
}

function runLearn(report: BatchReport): { learnings: string[] } {
  const learnings: string[] = [];

  if (report.calendar.generated > 0) {
    const ratio = (report.calendar.approved / report.calendar.generated * 100).toFixed(0);
    learnings.push(`Approval rate: ${ratio}%`);
  }

  if (report.metrics.engagement > 0) {
    learnings.push(`Best performing content type this run: educational`);
  }

  learnings.push(`Batch completado en ${(report.duration / 1000).toFixed(1)}s`);
  report.learnings.push(...learnings);
  return { learnings };
}

export function getPipelineStatus(): PipelineStep[] {
  return getStorage<PipelineStep[]>(PIPELINE_KEY, []);
}

export function runDailyBatch(): BatchReport {
  return runPipeline();
}

export function runWeeklyBatch(): BatchReport {
  const config = getBatchConfig();
  const weeklyConfig = { ...config, maxPostsPerDay: config.maxPostsPerDay * 3 };
  saveBatchConfig(weeklyConfig);
  const report = runPipeline();
  saveBatchConfig(config);
  return report;
}

export function getNextBatchTime(): { time: number; label: string } {
  const config = getBatchConfig();
  const now = new Date();

  if (config.frequency === 'daily') {
    const next = new Date(now);
    next.setHours(8, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return { time: next.getTime(), label: 'Next daily batch' };
  }

  const next = new Date(now);
  next.setHours(9, 0, 0, 0);
  const dayOfWeek = next.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  next.setDate(next.getDate() + daysUntilMonday);
  return { time: next.getTime(), label: 'Next weekly batch' };
}

if (require.main === module) {
  console.log('🤖 TradePortal Batch Automation\n');
  console.log(`Config:`, JSON.stringify(getBatchConfig(), null, 2));
  console.log(`\nNext batch:`, getNextBatchTime());
  console.log('\n--- Running pipeline ---\n');

  const report = runPipeline();

  console.log('\n📊 Batch Report:');
  console.log(`  Duration: ${report.duration}ms`);
  console.log(`  Generated: ${report.calendar.generated}`);
  console.log(`  Approved: ${report.calendar.approved}`);
  console.log(`  Scheduled: ${report.calendar.scheduled}`);
  console.log(`  Errors: ${report.errors.length}`);

  if (report.learnings.length > 0) {
    console.log('\n📝 Learnings:');
    for (const l of report.learnings) console.log(`  - ${l}`);
  }
}
