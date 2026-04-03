/**
 * Web Scraper Example - Extrae websites como markdown
 * Space: https://huggingface.co/spaces/Agents-MCP-Hackathon/web-scraper
 */

async function scrapeWebsite(url) {
  const response = await fetch('https://huggingface.co/api/spaces/Agents-MCP-Hackathon/web-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return response.json();
}

// Alternativa con Cheerio
async function scrapeWithCheerio(url) {
  const response = await fetch(url);
  const html = await response.text();
  
  // Extraer texto limpio
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return { url, text: text.slice(0, 2000) };
}

// Ejemplo simple con fetch
async function simpleScrape() {
  const url = 'https://news.ycombinator.com';
  const res = await fetch(url);
  const html = await res.text();
  
  // Buscar títulos
  const titles = [...html.matchAll(/<a class="titleline"[^>]*>([^<]+)<\/a>/g)]
    .map(m => m[1].trim());
  
  console.log('Títulos de Hacker News:');
  titles.slice(0, 5).forEach((t, i) => console.log(`${i+1}. ${t}`));
  
  return titles;
}

simpleScrape().catch(console.error);
