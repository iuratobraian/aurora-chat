import { ConvexClient } from "convex/browser";
import dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";

dotenv.config();

const url = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!url) {
  console.error("❌ Error: VITE_CONVEX_URL or CONVEX_URL not set.");
  process.exit(1);
}

const client = new ConvexClient(url);

async function smokeTest() {
  console.log(`🚀 Starting smoke test for ${url}...`);
  try {
    // 1. Test Query
    const posts = await client.query(api.posts.getPostsPaginated, { numItems: 5 });
    console.log(`✅ Query successful: Found ${posts.page.length} posts.`);

    // 2. Test another query
    const communities = await client.query(api.communities.getPopularCommunities, { limit: 1 });
    console.log(`✅ Query successful: Found ${communities.length} communities.`);

    console.log("✨ All critical queries working!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Smoke test FAILED:", err);
    process.exit(1);
  }
}

smokeTest();
