import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "ai-agent-news-generation",
  { hourUTC: 6, minuteUTC: 0 },
  internal.aiAgent.generateNewsPosts,
  {}
);

crons.daily(
  "ai-agent-scheduled-publish",
  { hourUTC: 12, minuteUTC: 0 },
  internal.aiAgent.publishScheduledPosts,
  {}
);

crons.daily(
  "ai-market-post",
  { hourUTC: 18, minuteUTC: 0 },
  internal.aiAgent.generateMarketPost,
  {}
);

crons.interval(
  "instagram-auto-publish",
  { minutes: 5 },
  internal["instagram/scheduler"].publishScheduledPosts,
  {}
);

crons.hourly(
  "sync-economic-calendar",
  { minuteUTC: 30 },
  internal.market.economicCalendar.syncEconomicCalendar,
  {}
);

crons.hourly(
  "sync-market-news",
  { minuteUTC: 15 },
  internal.market.marketNews.syncNewsFromSources,
  {}
);

export default crons;
