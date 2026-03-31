import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbIdIdeas = "33142b008df080d0a501c353494b1295";
const dbIdTasks = "33142b008df080f8b6b3db69d36e84d5";

async function analyzeStorage() {
  try {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 100
    });
    
    let stats = {
        ideas: { total: 0, untitled: 0, withContent: 0 },
        tasks: { total: 0, untitled: 0, withContent: 0 },
        other: 0
    };

    for (const page of response.results) {
        const parentId = page.parent.type === 'database_id' ? page.parent.database_id.replace(/-/g, '') : "other";
        
        let target = null;
        if (parentId === dbIdIdeas) target = stats.ideas;
        else if (parentId === dbIdTasks) target = stats.tasks;
        else { stats.other++; continue; }

        target.total++;
        const titleProp = page.properties.Nombre || page.properties.Name || page.properties.title || {};
        const title = titleProp.title?.[0]?.plain_text || "Untitled";
        if (title === "Untitled" || title === "Sin nombre") target.untitled++;

        const blocks = await notion.blocks.children.list({ block_id: page.id });
        if (blocks.results.length > 0) target.withContent++;
    }
    
    console.log("Notion Stats Dashboard:");
    console.log(JSON.stringify(stats, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
analyzeStorage();
