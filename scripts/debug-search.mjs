import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbIdFromEnv = process.env.NOTION_DATABASE_ID;

async function debugSearch() {
  try {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 50 // Get more
    });
    
    console.log(`Search result count: ${response.results.length}`);
    console.log(`Database ID from ENV: ${dbIdFromEnv}`);

    for (const page of response.results) {
        const titleProp = page.properties.Nombre || page.properties.Name || page.properties.title || {};
        const title = titleProp.title?.[0]?.plain_text || "Untitled";
        const parentId = page.parent.type === 'database_id' ? page.parent.database_id : "not-a-db";
        console.log(` - Title: ${title} | Parent: ${parentId}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
debugSearch();
