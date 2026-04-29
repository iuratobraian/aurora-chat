import { fetch } from 'undici';
import fs from 'node:fs';
import path from 'node:path';

const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) { const k = l.slice(0, i).trim(); const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ''); if (k && process.env[k] === undefined) process.env[k] = v; }
});

const components = [
  {
    id: 'UI-007', file: 'src/components/payment/PaymentActionButton.tsx',
    prompt: `React+TypeScript component: PaymentActionButton. Animated button that expands on hover for payment action.
TradeShare colors: Primary #3b82f6, Card Dark #1a1a2e. Glass: backdrop-blur-xl + border-white/10.
REGLAS: TypeScript strict con interfaz exportada. SOLO React useState. Tailwind. Accesible con aria-label. Export default. Manejo de errores. Sin comentarios. Sin style jsx (usa <style> normal). SOLO código.`
  },
  {
    id: 'UI-010', file: 'src/components/marketplace/ProductCard.tsx',
    prompt: `React+TypeScript component: ProductCard for marketplace. Product card with image gallery, price, size selector, add to cart button.
TradeShare colors: Primary #3b82f6, Signal Green #10b981, Card Dark #1a1a2e.
REGLAS: TypeScript strict con interfaz ProductCardProps exportada. SOLO React useState. Tailwind. Accesible. Export default. Sin comentarios. Sin style jsx. Manejo de errores de imagen. SOLO código.`
  },
  {
    id: 'UI-013', file: 'src/components/marketplace/PurchaseSwitch.tsx',
    prompt: `React+TypeScript component: PurchaseSwitch. Animated toggle switch for download vs purchase action.
TradeShare colors: Primary #3b82f6, Signal Green #10b981, Card Dark #1a1a2e.
REGLAS: TypeScript strict con interfaz exportada. role=switch, aria-checked, aria-label. SOLO React useState. Tailwind. Export default. Sin comentarios. Sin style jsx. SOLO código.`
  },
  {
    id: 'UI-016', file: 'src/components/ui/ErrorAlert.tsx',
    prompt: `React+TypeScript component: ErrorAlert. Error toast notification with red icon (#ef4444) and close button. Dark background #232531.
REGLAS: TypeScript strict con interfaz exportada. SOLO React useState useEffect. Tailwind. Accesible role=alert aria-live. Export default. Sin comentarios. Sin style jsx. SOLO código.`
  },
  {
    id: 'UI-018', file: 'src/components/ui/PreviousMonthWinnerCard.tsx',
    prompt: `React+TypeScript component: PreviousMonthWinnerCard. Golden card with rank (1st, 2nd, 3rd), username, avatar, score display (trades, accuracy, profit).
TradeShare colors: Primary #3b82f6, gold #fbbf24, Card Dark #1a1a2e.
REGLAS: TypeScript strict con interfaz PreviousMonthWinnerCardProps exportada. SOLO React useState. Tailwind. Accesible. Export default. Sin comentarios. Sin style jsx. Usa <img> normal NO next/image. SOLO código.`
  },
  {
    id: 'UI-012', file: 'src/components/ui/LogoLoader.tsx',
    prompt: `React+TypeScript component: LogoLoader. Animated logo loader with words cycle animation for "TRADE SHARE TRADE HUB".
TradeShare colors: Primary #3b82f6, Card Dark #1a1a2e, Background #0f1115.
REGLAS: TypeScript strict con interfaz exportada. SOLO React useState useEffect. Tailwind + @keyframes en <style> (NO style jsx). Accesible role=status aria-live. Export default. Sin comentarios. SOLO código.`
  },
];

async function kimiGen(comp) {
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` },
      body: JSON.stringify({ model: 'moonshotai/kimi-k2-instruct', messages: [{ role: 'user', content: comp.prompt }], max_tokens: 4096, temperature: 0.2 }),
      signal: AbortSignal.timeout(300000) // 5 minutos para KIMI
    });
    const d = await res.json();
    let c = d.choices?.[0]?.message?.content || '';
    const m = c.match(/```(?:tsx|typescript)?\n([\s\S]*?)\n```/);
    if (m) c = m[1];
    c = c.replace(/style jsx/g, 'style');
    fs.mkdirSync(path.dirname(comp.file), { recursive: true });
    fs.writeFileSync(comp.file, c, 'utf8');
    console.log(`✅ ${comp.id}: ${comp.file} (${c.split('\n').length} líneas)`);
    return true;
  } catch (e) {
    console.log(`❌ ${comp.id}: ${e.message}`);
    return false;
  }
}

console.log('🤖 KIMI K2.5 — Re-generando componentes rechazados...');
console.log('═'.repeat(60));

for (const comp of components) {
  await kimiGen(comp);
  await new Promise(r => setTimeout(r, 2000));
}
