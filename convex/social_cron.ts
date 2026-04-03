/**
 * social-cron.ts - Daily automation for social agents
 * 
 * This runs the daily social activity for all agents:
 * - Posts content (1-5 posts per agent based on personality)
 * - Likes posts from other users (5-15 per agent)
 * - Comments on posts (3-8 per agent)
 * - Replies to comments on their own posts
 * - Learns from engagement data and adapts
 * 
 * Schedule: Runs daily via Convex cron (configured in convex.json)
 * 
 * Run manually: npx convex run socialAgents:dailySocialActivity
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily social activity at 9 AM UTC (varies by timezone)
// This ensures agents post during active hours
crons.interval(
  "daily-social-activity",
  { hours: 6 }, // Every 6 hours for more natural distribution
  internal.socialAgents.dailySocialActivity,
  {}
);

export default crons;
