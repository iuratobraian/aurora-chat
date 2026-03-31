// Aurora Nexus - Stitch Design Generator
// Usage: node scripts/generate-aurora-design.cjs

const { stitch } = require('@google/stitch-sdk');

const prompt = `Aurora Nexus - AI Agent Orchestration Portal

Design a premium dark theme web dashboard with these sections:

HEADER:
- Left: "AURORA NEXUS" logo with icon
- Center: "System Online" green badge, "5/5 Agents" counter
- Right: Clock display, notification bell

AGENT CONTROL PANEL:
- Row of 5 agent cards: OpenCode, Minimax #1, Minimax #2, Aurora Core, Gemini
- Each card: status dot (green/gray), emoji icon, agent name, model name, tasks count, load bar, toggle button
- Action buttons: "INICIAR TODOS" (green), "DETENER" (red)

TABS: Dashboard | Design Studio | Image Gen | Tasks | Terminal | Chat | Settings

DASHBOARD TAB:
- 4 stat cards: Active Agents, Completed, Pending, Uptime
- Quick Actions grid: Deploy, Analyze, Create PR, Sync
- Activity feed, Agent performance bars

DESIGN STUDIO TAB:
- Textarea for prompt, preview area with "Live Preview" text
- "Stitch Active" green badge, component library sidebar

IMAGE GENERATOR TAB:
- Prompt textarea, style/resolution dropdowns, generate button
- 2x2 image grid with placeholders

TASKS TAB:
- Task cards with priority badges (high=red, medium=amber), status badges
- Title, description, tags, assignee avatar

TERMINAL TAB:
- macOS-style window (red/yellow/green dots)
- Dark terminal with monospace font, blinking cursor

CHAT TAB:
- Message bubbles, quick commands sidebar
- Buttons: npm run dev, npm run build, git status, etc.

SETTINGS TAB:
- API key inputs, toggle switches, save button

STYLE: Dark (#050608), glass morphism, blue (#3b82f6), green (#00e676), violet accents, rounded corners`;

async function main() {
  console.log('🎨 Aurora Nexus - Stitch Design Generator\n');
  
  try {
    // List projects first
    console.log('📁 Checking existing projects...');
    const projects = await stitch.projects();
    
    if (projects.length > 0) {
      console.log('Found projects:', projects.map(p => p.title || p.id));
    }
    
    // Generate the design
    console.log('\n✨ Generating Aurora Nexus portal design...');
    console.log('Prompt:', prompt.substring(0, 100) + '...\n');
    
    // This will use the default project or create one
    const result = await stitch.callTool('generate_screen_from_text', {
      prompt: prompt,
      model_id: 'GEMINI_3_FLASH'
    });
    
    console.log('✅ Design generated!');
    console.log('Result:', JSON.stringify(result, null, 2).substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure STITCH_API_KEY is set in environment');
      console.log('   Run: export STITCH_API_KEY="your-key"');
    }
  }
}

main();
