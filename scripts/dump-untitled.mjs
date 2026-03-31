import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function dumpFirstUntitled() {
  try {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 100
    });
    
    for (const page of response.results) {
        const titleProp = page.properties.Nombre || page.properties.Name || page.properties.title || {};
        const title = titleProp.title?.[0]?.plain_text || "Untitled";
        
        if (title === "Untitled" || title === "Sin nombre") {
            console.log(`\nDUMPING PAGE: ${page.id}`);
            console.log(`Parent: ${JSON.stringify(page.parent)}`);
            console.log(`Properties: ${JSON.stringify(page.properties, null, 2)}`);
            
            const blocks = await notion.blocks.children.list({ block_id: page.id });
            console.log(`Blocks count: ${blocks.results.length}`);
            for (const block of blocks.results) {
                if (block.type === 'paragraph') console.log(`- Paragraph: ${block.paragraph.rich_text[0]?.plain_text}`);
                if (block.type === 'heading_1') console.log(`- H1: ${block.heading_1.rich_text[0]?.plain_text}`);
            }
            break; // Just do one
        }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
dumpFirstUntitled();
