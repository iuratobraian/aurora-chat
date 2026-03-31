import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function recoverAllUntitled() {
  try {
    console.log("Searching for all untitled pages...");
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      page_size: 100
    });
    
    let recoveredCount = 0;

    for (const page of response.results) {
      // Find the title property dynamically
      const titleEntry = Object.entries(page.properties).find(([name, prop]) => prop.type === 'title');
      if (!titleEntry) continue;

      const [titleName, titleProp] = titleEntry;
      const currentTitle = titleProp.title?.[0]?.plain_text || "Untitled";
      
      if (currentTitle === "Untitled" || currentTitle === "Sin nombre" || !currentTitle.trim()) {
        console.log(`\nRecovering Page ID: ${page.id}`);
        
        // 1. Get content from blocks
        const blocks = await notion.blocks.children.list({ block_id: page.id });
        let newTitle = "";
        
        for (const block of blocks.results) {
          if (block.type === 'paragraph' && block.paragraph.rich_text?.[0]?.plain_text) {
            newTitle = block.paragraph.rich_text[0].plain_text.split('\n')[0].substring(0, 80);
            break;
          }
          if (block.type === 'heading_1' && block.heading_1.rich_text?.[0]?.plain_text) {
            newTitle = block.heading_1.rich_text[0].plain_text.split('\n')[0].substring(0, 80);
            break;
          }
        }

        if (!newTitle) {
          newTitle = "Task (" + new Date(page.created_time).toLocaleDateString() + ")";
        }

        console.log(`Extracted Title: "${newTitle}"`);

        // 2. Update the page
        const updateProps = {};
        updateProps[titleName] = { title: [{ text: { content: newTitle } }] };
        
        // Optionally set status if it exists
        const statusEntry = Object.entries(page.properties).find(([name, prop]) => prop.type === 'status' || prop.type === 'select');
        if (statusEntry) {
            const [sName, sProp] = statusEntry;
            if (sProp.type === 'status') {
                updateProps[sName] = { status: { name: "Ready" } };
            } else if (sProp.type === 'select') {
                updateProps[sName] = { select: { name: "Ready" } };
            }
        }

        await notion.pages.update({
          page_id: page.id,
          properties: updateProps
        });
        
        console.log(`✅ Recovered: ${newTitle}`);
        recoveredCount++;
      }
    }
    
    console.log(`\n✨ Successfully recovered ${recoveredCount} tasks total.`);
  } catch (err) {
    console.error("Error during recovery:", err.message);
  }
}

recoverAllUntitled();
