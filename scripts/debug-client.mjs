import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function check() {
  console.log("Notion client methods:", Object.keys(notion));
  if (notion.databases) {
      console.log("Notion.databases methods:", Object.keys(notion.databases));
  }
}
check();
