import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const TASKS_DB_ID = "33142b008df080f8b6b3db69d36e84d5";
const IDEAS_DB_ID = "33142b008df080d0a501c353494b1295";

async function optimize() {
  console.log("🚀 Starting Notion Transformation...");

  try {
    // 1. Normalize TASKS database properties
    console.log("📦 Normalizing TASKS database properties...");
    await notion.databases.update({
      database_id: TASKS_DB_ID,
      properties: {
        "Status": {
          status: {
            options: [
              { name: "Backlog", color: "gray" },
              { name: "Ready", color: "blue" },
              { name: "In Progress", color: "yellow" },
              { name: "Review", color: "purple" },
              { name: "Done", color: "green" }
            ]
          }
        },
        "Priority": {
          select: {
            options: [
              { name: "Critical", color: "red" },
              { name: "High", color: "orange" },
              { name: "Medium", color: "yellow" },
              { name: "Low", color: "gray" }
            ]
          }
        },
        "Domain": {
          multi_select: {
            options: [
              { name: "Stability", color: "red" },
              { name: "Experience", color: "blue" },
              { name: "Growth", color: "green" },
              { name: "AI/Aurora", color: "purple" },
              { name: "Backend", color: "yellow" }
            ]
          }
        },
        "Blocked": {
          checkbox: {}
        },
        "Definition of Done": {
          rich_text: {}
        },
        "Dependencies": {
          relation: {
            database_id: TASKS_DB_ID,
            type: "dual_property",
            dual_property: {
              synced_property_name: "Blocked By",
              synced_property_id: "blocked_by_id_temp"
            }
          }
        },
        "Source Idea": {
          relation: {
            database_id: IDEAS_DB_ID
          }
        }
      }
    });
    console.log("✅ TASKS normalized.");

    // 2. Create "AUTO TASK GENERATION" page in IDEAS
    console.log("💡 Creating Template in IDEAS...");
    await notion.pages.create({
      parent: { database_id: IDEAS_DB_ID },
      properties: {
        "Nombre": {
          title: [
            { text: { content: "AUTO TASK GENERATION" } }
          ]
        }
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
            rich_text: [
              { text: { content: "Las tareas de esta idea serán generadas automáticamente por el agente planificador." } }
            ]
          }
        }
      ]
    });
    console.log("✅ Template created.");

    console.log("✨ Optimization Complete!");
  } catch (err) {
    console.error("❌ Optimization failed:", err.message);
    if (err.body) console.error(JSON.parse(err.body).message);
  }
}

optimize();
