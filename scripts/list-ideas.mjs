#!/usr/bin/env node
import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const IDEAS_DB_ID = "33142b008df080d0a501c353494b1295";

async function listIdeas() {
  try {
    console.log("📋 OBTENIENDO IDEAS DE NOTION...\n");
    
    const response = await notion.databases.query({
      database_id: IDEAS_DB_ID,
      page_size: 50
    });
    
    console.log(`Encontradas ${response.results.length} Ideas:\n`);
    console.log("| # | Estado | Título |");
    console.log("|---|--------|--------|");
    
    response.results.forEach((idea, i) => {
      const title = idea.properties.Name?.title?.[0]?.plain_text || 
                    idea.properties.Nombre?.title?.[0]?.plain_text || 
                    "Sin título";
      const status = idea.properties.Status?.status?.name ||
                     idea.properties.status?.select?.name ||
                     "Sin estado";
      console.log(`| ${i+1} | ${status} | ${title.substring(0, 50)} |`);
    });
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listIdeas();
