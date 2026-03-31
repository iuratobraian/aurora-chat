// Stitch Design Generator for Aurora Nexus Portal
const https = require('https');

const API_KEY = 'AQ.Ab8RN6LVlJylZuhwyBC5y_x7t3oOCUqnZt5SXjiM_GxKYGgDJA';

const prompt = `
Aurora Nexus - AI Agent Orchestration Portal

Design a complete web dashboard with dark theme featuring:

HEADER:
- Logo area on left with "AURORA NEXUS" text
- Status indicators showing "System Online"
- Agent count badge "5/5 Online"
- Clock display
- Notification bell icon

AGENT CONTROL PANEL (main section):
- 5 agent cards in a row showing:
  - Status indicator (green dot for online)
  - Agent icon/avatar
  - Agent name (OpenCode, Minimax #1, Minimax #2, Aurora Core, Gemini)
  - Model name below
  - Task count
  - Load percentage
  - Play/Pause button to toggle agent
- Two main action buttons: "INICIAR TODOS" (green gradient) and "DETENER" (red gradient)

TABS NAVIGATION:
- Dashboard, Design Studio, Image Gen, Tasks, Terminal, Chat, Settings
- Active tab has blue gradient background

DASHBOARD TAB:
- 4 stat cards: Active Agents, Completed, Pending, Uptime
- Quick Actions grid (Deploy, Analyze, Create PR, Sync)
- Activity feed with recent actions
- Agent performance bars

DESIGN STUDIO TAB:
- Prompt textarea for design description
- Large preview area for generated designs
- Component library sidebar
- "Stitch Active" badge

IMAGE GENERATOR TAB:
- Large textarea for image prompt
- Style selector dropdown
- Resolution selector
- Generate button
- 2x2 grid of generated images

TASKS TAB:
- Task cards with priority badges (high/medium/low)
- Status badges (pending/in-progress/completed)
- Assignee avatar
- Tags
- "New Task" creation form

TERMINAL TAB:
- macOS-style window with red/yellow/green dots
- Monospace terminal output area
- Dark background terminal
- Command prompt style

CHAT TAB:
- Chat interface with message bubbles
- Quick commands sidebar with buttons for: npm run dev, npm run build, git status, etc.
- Agent selector on right side

SETTINGS TAB:
- API key configuration fields
- Toggle switches for settings
- Save button

STYLE:
- Dark background (#050608)
- Glass morphism cards with backdrop-blur
- Blue primary color (#3b82f6)
- Signal green for success (#00e676)
- Violet/purple gradient accents
- White text on dark surfaces
- Rounded corners (xl, 2xl)
- Subtle borders (white/10)
- Animated orbs in background

Use modern, premium dark UI design with glass effects.
`;

async function generateScreen() {
  console.log('🎨 Generating Aurora Nexus Portal design with Stitch...');
  console.log('Prompt length:', prompt.length, 'characters');
  
  // Call Stitch MCP proxy
  const postData = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'generate_screen_from_text',
      arguments: {
        prompt: prompt,
        model_id: 'GEMINI_3_FLASH'
      }
    }
  });

  const options = {
    hostname: 'stitch.googleapis.com',
    port: 443,
    path: '/mcp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('\n===========================================');
    console.log('🎨 AURORA NEXUS - Stitch Design Generator');
    console.log('===========================================\n');
    
    const result = await generateScreen();
    console.log('\nResult:', JSON.stringify(result, null, 2).substring(0, 2000));
    
    console.log('\n===========================================');
    console.log('📋 Next Steps:');
    console.log('1. Check Stitch dashboard at stitch.withgoogle.com');
    console.log('2. Find project "Aurora Nexus" or create new');
    console.log('3. Export HTML/CSS from generated design');
    console.log('4. Convert to React + Tailwind components');
    console.log('===========================================\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
