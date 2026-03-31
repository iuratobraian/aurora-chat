import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs";

// Simple manual .env.local loader
if (fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8");
  env.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function main() {
  try {
    console.log("Key:", process.env.NOTION_API_KEY ? "Loaded" : "Missing");
    console.log("DB ID:", process.env.NOTION_DATABASE_ID ? "Loaded" : "Missing");
    const response = await notion.search({});
    const db = response.results[0];
    console.log("Status Property Details:", JSON.stringify(db.properties.status, null, 2));
  } catch (err) {
    console.error("Error from Notion API:", err.message);
    process.exit(1);
  }
}

main();
