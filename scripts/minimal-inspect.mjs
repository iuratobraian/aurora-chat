import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function main() {
  try {
    const db = await notion.databases.retrieve({ database_id: dbId });
    console.log("Database Object Properties Keys:", Object.keys(db.properties));
    
    const query = await notion.databases.query({ database_id: dbId, page_size: 1 });
    if (query.results.length > 0) {
      console.log("First Result Property Keys:", Object.keys(query.results[0].properties));
      console.log("Full First Result JSON (Properties):", JSON.stringify(query.results[0].properties, null, 2));
    }
  } catch (err) {
    console.error("Error details:", err);
  }
}
main();
