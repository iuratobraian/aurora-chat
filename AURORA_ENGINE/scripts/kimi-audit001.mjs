import { fetch } from 'undici';
import fs from 'node:fs';

const lines = fs.readFileSync('.env.aurora', 'utf8').split(/\r?\n/);
lines.forEach(l => {
  const i = l.indexOf('=');
  if (i > 0) { const k = l.slice(0, i).trim(); const v = l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ''); if (k && process.env[k] === undefined) process.env[k] = v; }
});

const prompt = `Eres experto en seguridad y Convex. Implementa deviceFingerprint validation para refreshToken.

TAREA AUDIT-001:
- convex/authJwt.ts NO existe, hay que crearlo con refreshAccessToken
- Debe validar deviceFingerprint contra la tabla refreshTokens
- Token refresh debe fallar si el fingerprint no coincide

ARCHIVOS A MODIFICAR:
1. convex/authJwt.ts (NUEVO) - action refreshAccessToken con deviceFingerprint validation
2. src/services/authBase.ts - enviar deviceFingerprint al hacer refresh

CONTEXTO:
- El cliente llama: convex.action(api.authJwt.refreshAccessToken, { refreshToken, deviceFingerprint })
- deviceFingerprint se genera con: navigator.userAgent + screen.width + screen.height + timezone
- Los refresh tokens se guardan en tabla "refreshTokens" con campos: token, userId, deviceFingerprint, revoked, expiresAt

REGLAS:
1. TypeScript estricto
2. Convex internalAction o action
3. Validar que el token exista y no esté revocado
4. Validar que deviceFingerprint coincida
5. Si no coincide, rechazar con error
6. Si es válido, generar nuevo access token

Devuelve SOLO el código de convex/authJwt.ts completo.`;

const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` },
  body: JSON.stringify({ model: 'moonshotai/kimi-k2-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: 4096, temperature: 0.1 }),
  signal: AbortSignal.timeout(300000) // 5 minutos para KIMI
});
const d = await res.json();
let c = d.choices?.[0]?.message?.content || '';
const m = c.match(/```(?:ts|typescript)?\n([\s\S]*?)\n```/);
if (m) c = m[1];
fs.writeFileSync('convex/authJwt.ts', c, 'utf8');
console.log(`✅ convex/authJwt.ts (${c.split('\n').length} líneas)`);
