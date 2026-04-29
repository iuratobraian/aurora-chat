/**
 * KIMI ARCHITECTURAL BRIEFING - TASK: Community Interface Stabilization
 * Objective: Resolve layout, routing, and data consistency issues in Community & Marketing views.
 */

const architecture = {
  adminPanel: {
    problem: "Routing conflict between local admin panel and global community creation modal.",
    solution: "Context-aware initialization. If communityId is provided, the panel must prioritize direct fetching and bypass global empty-state triggers.",
    files: ["src/components/CommunityAdminPanel.tsx"]
  },
  layout: {
    problem: "Ad banners causing full-screen layout breakage in feed.",
    solution: "Strict CSS height containment and overflow management.",
    files: ["src/components/ad/MastermindAdBanner.tsx", "src/views/comunidad/CommunityFeed.tsx"]
  },
  dataSync: {
    problem: "TV ideas use tradingIdeas table, while Ideas tab uses liveIdeas table.",
    solution: "Unify TV sharing into the liveIdeas ecosystem to enable result tracking and feed visibility.",
    files: ["src/views/comunidad/LiveTVSection.tsx", "src/components/shared/SharedLiveIdeasFeed.tsx"]
  },
  marketingAuth: {
    problem: "Unauthenticated calls to OAuth URLs cause server crashes.",
    solution: "Safe return pattern (url: string | null, error: string | null) in Convex queries.",
    files: ["convex/threads/auth.ts", "convex/instagram/auth.ts"]
  }
};

console.log("KIMI: Architecture generated successfully. Proceeding with integration.");
export default architecture;
