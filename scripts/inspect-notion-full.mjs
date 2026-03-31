import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function inspect() {
  if (!dbId) {
    console.error("NOTION_DATABASE_ID is not set in .env.local");
    process.exit(1);
  }
  
  try {
    console.log(`Inspecting database: ${dbId}`);
    const db = await notion.databases.retrieve({ database_id: dbId });
    console.log("Database Title:", db.title[0]?.plain_text);
    console.log("\nFULL PROPERTIES JSON:");
    console.log(JSON.stringify(db.properties, null, 2));
    
    console.log("\nQuerying first page to see sample data...");
    const query = await notion.databases.query({ database_id: dbId, page_size: 1 });
    if (query.results.length > 0) {
        console.log("Sample Page Properties:", JSON.stringify(query.results[0].properties, null, 2));
    } else {
        console.log("No results found in database.");
    }
  } catch (err) {
    console.error("Error inspecting database:", err.message);
  }
}

inspect();
