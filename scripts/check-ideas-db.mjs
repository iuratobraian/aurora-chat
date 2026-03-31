import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbIdIdeas = "33142b008df080d0a501c353494b1295";

async function checkIdeasDb() {
  try {
    const db = await notion.databases.retrieve({ database_id: dbIdIdeas });
    console.log("Database Properties:", JSON.stringify(db.properties, null, 2));
    
    // Check first 3 items
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 10
    });
    
    for (const page of response.results) {
        if (page.parent.type === 'database_id' && page.parent.database_id.replace(/-/g, '') === dbIdIdeas) {
            console.log(`\nPage ID: ${page.id}`);
            console.log(`Properties: ${Object.keys(page.properties).join(", ")}`);
            for (const [name, prop] of Object.entries(page.properties)) {
                if (prop.type === 'title') {
                    console.log(`TITLE Property [${name}]: ${JSON.stringify(prop.title)}`);
                }
            }
        }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
checkIdeasDb();
