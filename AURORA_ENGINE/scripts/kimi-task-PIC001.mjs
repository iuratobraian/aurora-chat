import { askKimi } from "./aurora-kimi-agent.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function auditPicGenerator() {
  const root = process.cwd();
  
  // Archivos modificados en la sesión
  const files = [
    { name: "convex/imageActions.ts", path: path.join(root, "convex/imageActions.ts") },
    { name: "src/views/PicGeneratorView.tsx", path: path.join(root, "src/views/PicGeneratorView.tsx") },
    { name: "src/App.tsx", path: path.join(root, "src/App.tsx") },
    { name: "src/components/Navigation.tsx", path: path.join(root, "src/components/Navigation.tsx") },
    { name: "convex/schema.ts", path: path.join(root, "convex/schema.ts") }
  ];

  const fileContents = await Promise.all(
    files.map(async f => {
      const content = await readFile(f.path, "utf8").catch(() => "// No found");
      return `ARCHIVO: ${f.name}\n\`\`\`${f.name.endsWith('.tsx') || f.name.endsWith('.ts') ? 'typescript' : ''}\n${content}\n\`\`\``;
    })
  );

  const prompt = `Analiza la implementación COMPLETA del sistema "Pic Generator" (Generador de Imágenes AI) en Aurora Hive. 
He sido riguroso con la seguridad: El acceso en la navegación DEBE ser solo para administradores.

CONJUNTO DE ARCHIVOS:
${fileContents.join('\n\n')}

Verifica:
1. ARQUITECTURA: ¿El flujo Convex Action -> ImgBB -> Convex Mutation es óptimo?
2. SEGURIDAD: ¿El filtro en Navigation.tsx es realmente infranqueable para no-admins?
3. CALIDAD: ¿La UI en PicGeneratorView es fluida y maneja bien los estados de carga?
4. BACKEND: ¿Detección de errores y refinamiento de prompts son robustos?
5. RESTRICCIÓN: ¿El link está bien protegido en el dropdown de "Mi Comunidad"?

Dame un veredicto técnico detallado y sugerencias de mejora. Tómate tu tiempo para analizarlo todo a fondo.`;

  console.log("🚀 Enviando AUDITORÍA MAESTRA a Kimi K2.5 (Timeout: 5m)...");
  // Aumentamos el timeout a 5 minutos (300000ms) para que Kimi pueda procesar todo con calma
  const result = await askKimi(prompt, { timeout: 300000 });
  
  console.log("\n💜 RESPUESTA DE KIMI - AUDITORÍA INTEGRAL PIC-001:");
  console.log(result.answer);
}

auditPicGenerator();
