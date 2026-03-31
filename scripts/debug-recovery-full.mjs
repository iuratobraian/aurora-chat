import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbIdFromEnv = process.env.NOTION_DATABASE_ID;

async function debugRecovery() {
  try {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 100
    });
    
    console.log(`Search count: ${response.results.length}`);
    console.log(`Target DB ID Normalized: ${dbIdFromEnv.replace(/-/g, '')}`);

    for (const page of response.results) {
        const parentId = page.parent.type === 'database_id' ? page.parent.database_id.replace(/-/g, '') : "not-a-db";
        const titleProp = page.properties.Nombre || page.properties.Name || page.properties.title || {};
        const title = titleProp.title?.[0]?.plain_text || "Untitled";
        
        console.log(` - Title: ${title} | Parent DB ID: ${parentId}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
debugRecovery();
