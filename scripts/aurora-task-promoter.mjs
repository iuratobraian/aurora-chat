#!/usr/bin/env node
import { Client } from "@notionhq/client";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error("❌ NOTION_API_KEY or NOTION_DATABASE_ID missing in .env.local");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

async function promoteTasks() {
  console.log("🔍 Aurora Task Promoter: Scanning for ready-to-be-promoted tasks...");
  
  // 1. Fetch all pages
  const response = await notion.search({
    filter: { property: "object", value: "page" },
    page_size: 100
  });

  const allPages = response.results.filter(p => p.object === "page");
  
  // 2. Map all tasks by Name for easy lookup
  const taskMap = new Map();
  allPages.forEach(p => {
    const props = p.properties;
    const name = (props.Name || props.Nombre || props.title)?.title?.[0]?.plain_text || "Untitled";
    const statusProp = props.Status || props.status;
    const status = statusProp?.status?.name || statusProp?.select?.name || "Sin empezar";
    
    taskMap.set(name.trim(), {
      id: p.id,
      name: name.trim(),
      status: status
    });
  });

  console.log(`✅ Loaded ${taskMap.size} tasks for dependency checking.`);

  // 3. Status normalization
  const isDone = (status) => ["Listo", "Done", "Listo (Done)"].includes(status);
  const isBacklog = (status) => ["Sin empezar", "Backlog", "Backlog (Sin empezar)"].includes(status);

  // 4. Check each task in Backlog
  let promotedCount = 0;
  
  for (const page of allPages) {
    const props = page.properties;
    const name = (props.Name || props.Nombre || props.title)?.title?.[0]?.plain_text || "Untitled";
    const statusProp = props.Status || props.status;
    const status = statusProp?.status?.name || statusProp?.select?.name || "Sin empezar";
    
    if (isBacklog(status)) {
      const depsString = props.Dependencies?.rich_text?.[0]?.plain_text || "None";
      
      if (depsString === "None" || !depsString.trim()) {
        console.log(`✨ [AUTO-PROMOTE] ${name}: No dependencies found. Promoting to Ready.`);
        await updateStatus(page.id, "Ready");
        promotedCount++;
        continue;
      }
      
      const depsList = depsString.split(",").map(d => d.trim()).filter(d => d.length > 0);
      let allMet = true;
      let missingDeps = [];
      
      for (const depName of depsList) {
        const depTask = taskMap.get(depName);
        if (!depTask || !isDone(depTask.status)) {
          allMet = false;
          missingDeps.push(depName);
        }
      }
      
      if (allMet) {
        console.log(`🚀 [AUTO-PROMOTE] ${name}: All dependencies (${depsList.join(", ")}) met. Promoting to Ready.`);
        await updateStatus(page.id, "Ready");
        promotedCount++;
      } else {
        // console.log(`⏳ [STAY] ${name}: Missing dependencies: ${missingDeps.join(", ")}`);
      }
    }
  }

  console.log(`\n🎉 Process finished. ${promotedCount} tasks promoted to Ready.`);
}

async function updateStatus(pageId, status) {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: { select: { name: status } }
      }
    });
  } catch (err) {
    console.error(`❌ Error updating status for ${pageId}:`, err.message);
  }
}

promoteTasks().catch(console.error);
