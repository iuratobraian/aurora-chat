import fs from "node:fs";
import path from "node:path";
import { searchWeb } from "./aurora-web-search.mjs";

const ROOT = process.cwd();

async function githubRepoFallback(repo) {
  const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "User-Agent": "Aurora-Core"
    }
  });

  if (!repoResponse.ok) {
    throw new Error(`GitHub repo lookup failed: ${repoResponse.status}`);
  }

  const repoData = await repoResponse.json();
  let readmeText = "";

  const readmeResponse = await fetch(`https://api.github.com/repos/${repo}/readme`, {
    headers: {
      "Accept": "application/vnd.github.raw+json",
      "User-Agent": "Aurora-Core"
    }
  });

  if (readmeResponse.ok) {
    readmeText = await readmeResponse.text();
  }

  const summaryParts = [
    repoData.description ? `Descripción: ${repoData.description}.` : "",
    repoData.language ? `Lenguaje principal: ${repoData.language}.` : "",
    Array.isArray(repoData.topics) && repoData.topics.length ? `Temas: ${repoData.topics.slice(0, 6).join(", ")}.` : "",
    readmeText ? `README: ${readmeText.replace(/\s+/g, " ").slice(0, 500)}` : ""
  ].filter(Boolean);

  return {
    provider: "github_api",
    answer: summaryParts.join(" "),
    results: [
      {
        title: repoData.full_name,
        url: repoData.html_url,
        snippet: repoData.description || ""
      }
    ]
  };
}

export async function researchRepo(repo) {
  let provider = "unknown";
  let summary = "";
  try {
    const github = await githubRepoFallback(repo);
    provider = github.provider;
    summary = github.answer || github.results?.[0]?.snippet || "";
  } catch {
    const query = `site:github.com/${repo}`;
    const results = await searchWeb(query);
    provider = results.provider || "search_fallback";
    summary = results.answer || (results.results?.[0]?.snippet || "");
  }
  const record = {
    id: `RESEARCH-${repo}-${Date.now()}`,
    title: `Research ${repo}`,
    statement: summary,
    tags: ["research", repo],
    source: `github.com/${repo}`,
    sourceType: "oss_repo",
    taskId: "OSS-RESEARCH",
    domain: "aurora_ops",
    confidence: summary ? 0.74 : 0.28,
    reuseScore: summary ? 0.7 : 0.2,
    validated: Boolean(summary),
    createdAt: new Date().toISOString()
  };
  const file = path.join(ROOT, ".agent/brain/db/oss_ai_repos.jsonl");
  fs.appendFileSync(file, JSON.stringify(record) + "\n");
  return { record, provider, success: Boolean(summary) };
}

export function recordResearch(entry) {
  const dest = path.join(ROOT, ".agent/brain/db/activity_log.jsonl");
  const payload = {
    timestamp: new Date().toISOString(),
    command: "/research",
    response: entry.record.statement,
    success: entry.success,
    repo: entry.record.source
  };
  fs.appendFileSync(dest, JSON.stringify(payload) + "\n");
}
