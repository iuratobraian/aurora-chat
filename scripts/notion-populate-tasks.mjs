import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const TASKS_DB_ID = process.env.NOTION_DATABASE_ID || "33142b008df080f8b6b3db69d36e84d5";
const IDEAS_DB_ID = "33142b008df080d0a501c353494b1295";

const TASKS_TO_IMPORT = [
  { id: "T3", title: "Global Styling: Icons, business avatars, L/D modes, Negocios cards", priority: "High", domain: "Experience", status: "Ready" },
  { id: "T4", title: "Bitácora Native & User Profiles: Sync Bitácora, premium style", priority: "High", domain: "Growth", status: "Ready" },
  { id: "T5", title: "Señales & Trading: Dynamic background, Neon loaders, VIP style", priority: "Medium", domain: "Experience", status: "Ready" },
  { id: "T6", title: "Premios (ex-Ranking): Token prize redemptions", priority: "Medium", domain: "Growth", status: "Ready" },
  { id: "T7", title: "Noticias: Newspaper styling, Economic Calendar", priority: "Low", domain: "Experience", status: "Ready" },
  { id: "T8", title: "Ads Engine: Rotating banners (Sidebar, Feed, Discover)", priority: "High", domain: "Growth", status: "Ready" },
  { id: "T9", title: "Consolidate bottom controls to ONE floating Menu button", priority: "High", domain: "Experience", status: "Ready" },
  { id: "T10", title: "Hide Pricing from nav, rename to Suscripciones, integrate", priority: "Medium", domain: "Experience", status: "Ready" },
  { id: "T11", title: "Move Mi Comunidad/Observatory to Creator Admin Panel", priority: "Medium", domain: "Stability", status: "Ready" },
  { id: "T12", title: "Rename Marketplace to Negocios, move Publicidad inside", priority: "Low", domain: "Stability", status: "Ready" },
  { id: "T13", title: "Reconfigure top menu sections (remove/move sections)", priority: "Medium", domain: "Stability", status: "Ready" },
  { id: "T14", title: "Remove floating AI from AdminView.tsx, full-width, stats", priority: "Medium", domain: "Stability", status: "Ready" },
  { id: "T15", title: "Remove floating AI icons from Navigation.tsx", priority: "Low", domain: "Experience", status: "Ready" }
];

async function populate() {
  console.log("🚀 Populating TASKS from Board...");

  for (const task of TASKS_TO_IMPORT) {
    try {
      await notion.pages.create({
        parent: { database_id: TASKS_DB_ID },
        properties: {
          "Name": { title: [{ text: { content: task.title } }] },
          "Status": { select: { name: task.status } },
          "Priority": { select: { name: task.priority } },
          "Domain": { rich_text: [{ text: { content: task.domain } }] },
          "Execution Order": { number: parseInt(task.id.substring(1)) }
        }
      });
      console.log(`✅ Created: ${task.id} - ${task.title.substring(0, 30)}...`);
    } catch (err) {
      console.error(`❌ Failed: ${task.id} - ${err.message}`);
    }
  }

  // Also create Template in IDEAS
  try {
    await notion.pages.create({
      parent: { database_id: IDEAS_DB_ID },
      properties: {
        "Nombre": { title: [{ text: { content: "AUTO TASK GENERATION" } }] }
      },
      children: [
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ text: { content: "💡 Smart Agent Planning" } }]
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: "Las tareas de esta idea serán generadas automáticamente por el agente planificador." } }]
          }
        }
      ]
    });
    console.log("✅ IDEAS template created.");
  } catch (err) {
    console.error(`❌ Template failed: ${err.message}`);
  }

  console.log("✨ Done!");
}

populate();
