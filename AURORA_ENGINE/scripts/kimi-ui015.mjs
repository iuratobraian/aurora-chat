import { fetch } from 'undici';
import fs from 'node:fs';

const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) {
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
});

const spec = fs.readFileSync('.agent/designs/SIDEBAR_SEARCH_SPEC.md', 'utf8').substring(0, 2000);
const prompt = `Eres un desarrollador React senior. Crea el componente SidebarSearch para TradeShare.

SPEC:
${spec}

Colores: Primary #3b82f6, Card Dark #1a1a2e, Background #0f1115, Glass: backdrop-blur-xl + border-white/10

REGLAS:
1. TypeScript estricto, exporta interfaz SidebarSearchProps
2. Solo React + Tailwind (sin libs externas)
3. Input de búsqueda premium con animaciones CSS (@keyframes inline)
4. Accesible (aria-label)
5. Export default
6. Sin comentarios excesivos
7. Manejo de focus/hover states

Devuelve SOLO el código del archivo src/components/ui/SidebarSearch.tsx.`;

const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` },
  body: JSON.stringify({ model: 'moonshotai/kimi-k2-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: 4096, temperature: 0.2 }),
  signal: AbortSignal.timeout(300000) // 5 minutos para KIMI
});
const d = await res.json();
let c = d.choices?.[0]?.message?.content || '';
const m = c.match(/```(?:tsx|typescript)?\n([\s\S]*?)\n```/);
if (m) c = m[1];
fs.mkdirSync('src/components/ui', { recursive: true });
fs.writeFileSync('src/components/ui/SidebarSearch.tsx', c, 'utf8');
console.log(`✅ UI-015: SidebarSearch.tsx (${c.split('\n').length} líneas)`);
