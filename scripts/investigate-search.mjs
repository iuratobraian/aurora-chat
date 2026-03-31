import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function checkContent() {
  try {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 20
    });
    
    for (const page of response.results) {
      // Filter by our database
      if (page.parent.type === 'database_id' && page.parent.database_id.replace(/-/g, '') === dbId.replace(/-/g, '')) {
          const titleProp = page.properties.Nombre || page.properties.Name || page.properties.title || {};
          const title = titleProp.title?.[0]?.plain_text || "Untitled";
          console.log(`\nPage ID: ${page.id} | Title: ${title}`);
          
          // Check for blocks
          const blocks = await notion.blocks.children.list({ block_id: page.id });
          const text = blocks.results.map(b => {
              if (b.type === 'paragraph') return b.paragraph.rich_text?.[0]?.plain_text || "";
              if (b.type === 'heading_1') return b.heading_1.rich_text?.[0]?.plain_text || "";
              return "";
          }).filter(Boolean).join(" ");
          
          console.log(`Content Sample: ${text.substring(0, 150)}`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
checkContent();
