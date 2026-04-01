import fs from "node:fs";
import path from "node:path";
import { loadAuroraEnv } from "./load-aurora-env.mjs";

const ROOT = process.cwd();
loadAuroraEnv();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function getConfig() {
  return readJson(".agent/aurora/runtime-config.json");
}

async function tavilySearch(query, apiKey) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      include_answer: true,
      max_results: 5
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `Tavily error ${response.status}`);
  return {
    provider: "tavily",
    answer: data.answer || "",
    results: (data.results || []).map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.content
    }))
  };
}

async function serpApiSearch(query, apiKey) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("engine", "google");
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `SerpAPI error ${response.status}`);
  return {
    provider: "serpapi",
    answer: "",
    results: (data.organic_results || []).slice(0, 5).map((item) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet
    }))
  };
}

async function braveSearch(query, apiKey) {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": apiKey
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Brave error ${response.status}`);
  return {
    provider: "brave",
    answer: "",
    results: (data.web?.results || []).slice(0, 5).map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.description
    }))
  };
}

export async function searchWeb(query) {
  const config = getConfig();
  const providers = config.webProviders || [];
  for (const provider of providers) {
    try {
      if (provider === "tavily" && process.env.TAVILY_API_KEY) {
        return await tavilySearch(query, process.env.TAVILY_API_KEY);
      }
      if (provider === "serpapi" && process.env.SERPAPI_API_KEY) {
        return await serpApiSearch(query, process.env.SERPAPI_API_KEY);
      }
      if (provider === "brave" && process.env.BRAVE_SEARCH_API_KEY) {
        return await braveSearch(query, process.env.BRAVE_SEARCH_API_KEY);
      }
    } catch {
      // try next provider
    }
  }

  return {
    provider: null,
    answer: "",
    unavailable: true,
    message: "No web provider configured for Aurora. Set TAVILY_API_KEY, SERPAPI_API_KEY or BRAVE_SEARCH_API_KEY.",
    results: []
  };
}

if (process.argv[1] && process.argv[1].endsWith("aurora-web-search.mjs")) {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error("Usage: node scripts/aurora-web-search.mjs <query>");
    process.exit(1);
  }
  const data = await searchWeb(query);
  console.log(JSON.stringify(data, null, 2));
}
