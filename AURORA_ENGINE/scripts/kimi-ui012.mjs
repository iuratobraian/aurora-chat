import { fetch } from 'undici';
import fs from 'node:fs';

const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) { const k = l.slice(0, i).trim(); const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ''); if (k && process.env[k] === undefined) process.env[k] = v; }
});

const spec = fs.readFileSync('.agent/designs/LOGO_LOADER_SPEC.md', 'utf8').substring(0, 2000);
const prompt = `React senior. Crea LogoLoader para TradeShare.

IMPORTANTE: NO uses next/image, NO uses framer-motion. Solo React + CSS/Tailwind.

SPEC:
${spec}

Colores: Primary #3b82f6, Signal Green #10b981, Card Dark #1a1a2e, Background #0f1115

REGLAS:
1. TypeScript estricto, exporta interfaz LogoLoaderProps
2. Solo React + Tailwind + @keyframes inline en <style>
3. Animación de logo "TRADE SHARE TRADE HUB" con ciclo de palabras
4. Accesible (role=status, aria-live)
5. Export default
6. Sin comentarios excesivos

SOLO código src/components/ui/LogoLoader.tsx.`;

const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` },
  body: JSON.stringify({ model: 'moonshotai/kimi-k2-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: 4096, temperature: 0.2 }),
  signal: AbortSignal.timeout(300000) // 5 minutos para KIMI
});
const d = await res.json();
let c = d.choices?.[0]?.message?.content || '';
const m = c.match(/```(?:tsx|typescript)?\n([\s\S]*?)\n```/);
if (m) c = m[1];
c = c.replace(/style jsx/g, 'style');
fs.mkdirSync('src/components/ui', { recursive: true });
fs.writeFileSync('src/components/ui/LogoLoader.tsx', c, 'utf8');
console.log(`✅ UI-012: LogoLoader.tsx (${c.split('\n').length} líneas)`);
