#!/usr/bin/env node
/**
 * 🤖 KIMI K2.5 — Generación de código para UI-005 PublicationCard
 * 
 * Uso: node scripts/kimi-ui005.mjs
 */

import { fetch } from 'undici';
import fs from 'node:fs';
import path from 'node:path';

// Cargar .env.aurora
const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) {
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
});

const prompt = `Eres un desarrollador React senior experto en TypeScript y Tailwind CSS. Genera un componente PublicationCard para el proyecto TradeShare.

ESPECIFICACIÓN COMPLETA:

## Props Interface
\`\`\`typescript
interface MarketplaceCardProps {
  title: string;
  subtitle?: string;
  logo?: string;
  status?: 'available' | 'coming_soon' | 'premium' | 'archived';
  coreFeatures?: string[];
  otherFeatures?: string[];
  onHelp?: () => void;
  onDownload?: () => void;
  variant?: 'default' | 'compact' | 'expanded';
  className?: string;
}
\`\`\`

## Diseño
- Card vertical: w-80 (320px), h-auto, bg #07182E o card-dark
- Border-radius: rounded-2xl (16px), overflow-hidden
- Hover: shadow-[0_0_30px_rgba(59,130,246,0.5)] (cyan glow primary)
- Transition: all duration-300

## Estructura
1. Header: logo 48px rounded-xl + title truncate + status badge
   - available: bg-green-500/20 text-green-300
   - coming_soon: bg-yellow-500/20 text-yellow-300
   - premium: bg-purple-500/20 text-purple-300
2. Core Features: tags con flex-wrap, bg-white/10, rounded-full
3. Other Features: lista con checkmark SVG inline, text-xs
4. Actions: 2 botones flex (Help + Download), bg-white/10 y bg-white/20

## Colores TradeShare
- Primary: #3b82f6
- Signal Green: #10b981
- Card Dark: #1a1a2e
- Background: #0f1115
- Glass: backdrop-blur-xl + border-white/10

## Reglas
1. TypeScript estricto, exporta la interfaz MarketplaceCardProps
2. Usa solo React + Tailwind (no libs externas)
3. Manejo de errores: logo fallback con iniciales del título
4. Status badge con helper function para colores
5. Features limitados a 4 coreFeatures
6. Checkmark SVG inline simple
7. Responsive y accesible (aria-label en botones)
8. Código limpio, sin comentarios excesivos
9. Export default del componente

Genera SOLO el código del archivo src/components/marketplace/PublicationCard.tsx. No expliques nada fuera del código.`;

console.log('🤖 KIMI K2.5 — Generando PublicationCard...');
console.log('═'.repeat(60));

try {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(300000) // 5 minutos para KIMI
  });

  const data = await res.json();
  if (!res.ok) {
    console.log('❌ KIMI ERROR:', JSON.stringify(data).substring(0, 300));
    process.exit(1);
  }

  const content = data.choices?.[0]?.message?.content || 'Sin respuesta de Kimi';
  console.log(content);
} catch (e) {
  console.log('❌ KIMI ERROR:', e.message);
  process.exit(1);
}
