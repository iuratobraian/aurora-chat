import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function main() {
  try {
    const db = await notion.databases.retrieve({ database_id: dbId });
    console.log("Database Title:", db.title[0]?.plain_text);
    console.log("Properties:", Object.keys(db.properties).join(", "));
    
    // Query entries
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 5
    });
    
    console.log(`Found ${response.results.length} results.`);
    response.results.forEach((page, i) => {
      console.log(`\n--- Page ${i+1} ---`);
      for (const [name, prop] of Object.entries(page.properties)) {
        if (prop.type === 'title') {
            const titleText = prop.title[0]?.plain_text || "EMPTY TITLE";
            console.log(`${name} (TITLE): ${titleText}`);
        } else if (prop.type === 'select') {
            console.log(`${name} (SELECT): ${prop.select?.name}`);
        } else if (prop.type === 'status') {
            console.log(`${name} (STATUS): ${prop.status?.name}`);
        } else if (prop.type === 'rich_text') {
            console.log(`${name} (TEXT): ${prop.rich_text[0]?.plain_text}`);
        }
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
