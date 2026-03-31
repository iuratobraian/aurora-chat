import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function investigate() {
  try {
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 10 // Let's check the first 10
    });
    
    for (const page of response.results) {
      const titleProp = page.properties.Nombre || page.properties.Name || page.properties.title || {};
      const title = titleProp.title?.[0]?.plain_text || "Untitled";
      console.log(`\nTask ID: ${page.id} | Title: ${title}`);
      
      // Check properties
      console.log("Properties found:", Object.keys(page.properties).filter(k => page.properties[k].type !== 'title').map(k => {
          const p = page.properties[k];
          let val = "n/a";
          if (p.type === 'select') val = p.select?.name;
          if (p.type === 'status') val = p.status?.name;
          if (p.type === 'rich_text') val = p.rich_text[0]?.plain_text;
          return `${k}: ${val}`;
      }).join(", "));

      // Check page content (blocks)
      const blocks = await notion.blocks.children.list({ block_id: page.id });
      const text = blocks.results.map(b => {
          if (b.type === 'paragraph') return b.paragraph.rich_text[0]?.plain_text;
          if (b.type === 'heading_1') return b.heading_1.rich_text[0]?.plain_text;
          return "";
      }).filter(Boolean).join(" ");
      
      console.log(`Content: ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

investigate();
