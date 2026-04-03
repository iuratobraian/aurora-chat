#!/usr/bin/env node
import { Client } from "@notionhq/client";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_API_KEY });

export const notionSync = {
  async checkConnection() {
    if (!NOTION_API_KEY) {
      return { connected: false, reason: "NOTION_API_KEY not configured in .env" };
    }
    try {
      await notion.users.me();
      return { connected: true };
    } catch (err) {
      return { connected: false, reason: err.message };
    }
  },

  async searchPages(query = "") {
    const response = await notion.search({
      query,
      filter: { property: "object", value: "page" },
      page_size: 10,
    });
    return response.results;
  },

  async getPage(pageId) {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const blocks = await notion.blocks.children.list({ block_id: pageId });
    return { page, blocks: blocks.results };
  },

  async createPage(title, content, properties = {}) {
    const page = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Nombre: { title: [{ text: { content: title } }] },
        ...properties,
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content } }],
          },
        },
      ],
    });
    return page;
  },

  async appendToPage(pageId, content) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content } }],
          },
        },
      ],
    });
  },

  async getTaskBoard() {
    if (!NOTION_DATABASE_ID) return null;
    const response = await notion.search({});
    // Filter pages that belong to our workspace or have our properties
    return response.results.filter(obj => 
      obj.object === "page" && 
      obj.properties?.status?.status?.name !== "Listo"
    );
  },

  async updateTaskStatus(pageId, status, agentName = "") {
    const properties = {
      status: { status: { name: status } },
    };
    
    if (agentName) {
      properties.agent = { rich_text: [{ text: { content: agentName } }] };
    }

    await notion.pages.update({
      page_id: pageId,
      properties
    });
  },
};

export default notionSync;

// ESM equivalent of require.main === module
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  (async () => {
    const status = await notionSync.checkConnection();
    console.log("Notion Connection:", JSON.stringify(status, null, 2));

    if (status.connected && NOTION_DATABASE_ID) {
      console.log("Fetching tasks...");
      const tasks = await notionSync.getTaskBoard();
      console.log(`\nFound ${tasks?.length || 0} active tasks:`);
      tasks?.forEach(t => {
        const title = t.properties?.Nombre?.title[0]?.plain_text || "Untitled";
        const taskStatus = t.properties?.status?.status?.name || "No Status";
        const agent = t.properties?.agent?.rich_text[0]?.plain_text || "Unassigned";
        console.log(` - [${taskStatus}] ${title} (Assigned to: ${agent})`);
      });
    }
  })();
}
