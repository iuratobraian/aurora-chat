import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: ".env.local" });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VAULT = path.join(ROOT, 'vault', '04-errores');

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function sanitizeFileName(title) {
  return title.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function syncErrors() {
  console.log('📡 Consultando errores recientes en Convex (HTTP Client)...');
  try {
    const errors = await client.query("systemErrors:getRecentErrors", { limit: 10 });

    if (!errors || errors.length === 0) {
      console.log('✅ No hay errores nuevos para sincronizar.');
      return;
    }

    await ensureDir(VAULT);

    for (const err of errors) {
      const timestamp = new Date(err.createdAt).toISOString().replace(/[-:T]/g, '').split('.')[0].slice(0, 12);
      const id = `ERR-${timestamp}`;
      const title = err.errorMessage.substring(0, 40);
      const fileName = `${id}-${sanitizeFileName(title)}.md`;
      const filePath = path.join(VAULT, fileName);

      const frontmatter = `---
id: ${id}
agente: "System-AutoLog"
severidad: ${JSON.stringify(err.severity)}
fecha: ${new Date(err.createdAt).toISOString().split('T')[0]}
estado: "open"
tags: ["error", ${JSON.stringify(err.severity)}, "autolog"]
user_id: ${JSON.stringify(err.userId || 'guest')}
url: ${JSON.stringify(err.pageUrl)}
---`;

      const body = `# 🛑 ${err.errorMessage}

## 🔍 Detalles del Error
- **Fecha**: ${new Date(err.createdAt).toLocaleString('es-AR')}
- **Usuario**: ${err.userName || 'Anónimo'} (${err.userEmail || 'S/E'})
- **URL**: ${err.pageUrl}
- **Severidad**: ${err.severity.toUpperCase()}

## 🕵️ Stack Trace
\`\`\`
${err.errorStack || 'No stack trace available'}
\`\`\`

## 🛠️ Metadata
\`\`\`json
${JSON.stringify(err.metadata || {}, null, 2)}
\`\`\`

---
## 🔗 Relacionado
- [ ] Investigar causa raíz
- [ ] Aplicar fix técnico
`;

      await writeFile(filePath, frontmatter + '\n\n' + body);
      console.log(`✅ Sincronizado: ${fileName}`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando el Vault:', error.message);
  }
}

syncErrors();
