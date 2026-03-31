// Direct MCP Proxy call to Stitch
const http = require('http');

const API_KEY = 'AQ.Ab8RN6LVlJylZuhwyBC5y_x7t3oOCUqnZt5SXjiM_GxKYGgDJA';

async function callMCP(method, params = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: params
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🎨 Aurora Nexus - Stitch Design Generator\n');

  try {
    // Initialize
    console.log('🔧 Initializing Stitch MCP...');
    const init = await callMCP('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'aurora-nexus', version: '1.0.0' }
    });
    console.log('Initialized:', JSON.stringify(init).substring(0, 200));

    // List tools
    console.log('\n📋 Listing available tools...');
    const tools = await callMCP('tools/list', {});
    console.log('Tools:', JSON.stringify(tools).substring(0, 300));

    // Generate screen
    console.log('\n✨ Generating Aurora Nexus design...');
    const prompt = `Aurora Nexus Portal - AI Agent Orchestration Dashboard

Create a premium dark theme dashboard with:

1. HEADER: AURORA NEXUS logo, System Online badge, 5/5 agents counter, clock, notifications

2. AGENT CARDS: 5 cards (OpenCode, Minimax x2, Aurora Core, Gemini) with status dots, icons, names, models, task counts, load bars, toggle buttons

3. BUTTONS: INICIAR TODOS (green), DETENER (red)

4. TABS: Dashboard, Design Studio, Image Gen, Tasks, Terminal, Chat, Settings

5. DASHBOARD: Stats cards, Quick Actions grid, Activity feed

6. DESIGN STUDIO: Prompt textarea, preview area, Stitch Active badge

7. IMAGE GEN: Prompt textarea, style/resolution dropdowns, generate button, image grid

8. TASKS: Task cards with priority/status badges

9. TERMINAL: macOS-style window with dots, dark terminal output

10. CHAT: Messages, quick commands sidebar

11. SETTINGS: API keys, toggles, save button

STYLE: Dark #050608, glass morphism, blue #3b82f6, green #00e676, violet accents`;

    const result = await callMCP('tools/call', {
      name: 'generate_screen_from_text',
      arguments: { prompt: prompt }
    });
    console.log('Result:', JSON.stringify(result, null, 2).substring(0, 1000));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
