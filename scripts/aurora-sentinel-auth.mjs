import fs from 'fs';
import path from 'path';

/**
 * Aurora Sentinel Auth - Analizador de Seguridad para Convex
 * Escanea los archivos de Convex en busca de mutaciones que no validen identidad.
 */

const CONVEX_DIR = './convex';
const IGNORED_FILES = ['_generated', 'schema.ts', 'logger.ts', 'moderation.ts', 'lib/auth.ts'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const vulnerabilities = [];

  // Patrón para detectar mutaciones o queries exportadas
  const funcPattern = /export const (\w+) = (mutation|query|internalMutation)/g;
  let match;

  while ((match = funcPattern.exec(content)) !== null) {
    const name = match[1];
    const type = match[2];
    
    // Si es internalMutation, se asume que se llama desde otra función segura
    if (type === 'internalMutation') continue;

    // Buscar el inicio del handler
    const handlerSearch = content.substring(match.index);
    const handlerMatch = handlerSearch.match(/handler:\s*async\s*\((ctx|{.*?})\s*,\s*(args|{.*?})\)\s*=>\s*{/);
    
    if (handlerMatch) {
      const handlerStartIndex = match.index + handlerSearch.indexOf(handlerMatch[0]) + handlerMatch[0].length;
      
      // Buscar el final del handler (simplificado, buscando el cierre de la función)
      let bracketCount = 1;
      let i = handlerStartIndex;
      while (bracketCount > 0 && i < content.length) {
        if (content[i] === '{') bracketCount++;
        if (content[i] === '}') bracketCount--;
        i++;
      }
      const handlerBody = content.substring(handlerStartIndex, i);

      // CRITERIO DE VULNERABILIDAD:
      // No llama a assertOwnershipOrAdmin, requireUser, requireAdmin o ctx.auth.getUserIdentity
      const hasAuthCheck = handlerBody.includes('assertOwnershipOrAdmin') || 
                          handlerBody.includes('requireUser') || 
                          handlerBody.includes('requireAdmin') || 
                          handlerBody.includes('getUserIdentity');

      if (!hasAuthCheck) {
        vulnerabilities.push({
          name,
          type,
          file: filePath.replace(/\\/g, '/'),
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
  }

  return vulnerabilities;
}

function scanDir(dir) {
  let allVulnerabilities = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORED_FILES.includes(file)) {
        allVulnerabilities = [...allVulnerabilities, ...scanDir(fullPath)];
      }
    } else if (file.endsWith('.ts') && !IGNORED_FILES.includes(file)) {
      allVulnerabilities = [...allVulnerabilities, ...scanFile(fullPath)];
    }
  }

  return allVulnerabilities;
}

console.log('🚀 Iniciando Aurora Sentinel Auth Scan...');
const vulnerabilities = scanDir(CONVEX_DIR);

if (vulnerabilities.length > 0) {
  console.log(`\n❌ Se encontraron ${vulnerabilities.length} posibles vulnerabilidades de autenticación:\n`);
  
  // Agrupar por archivo
  const grouped = vulnerabilities.reduce((acc, v) => {
    acc[v.file] = acc[v.file] || [];
    acc[v.file].push(v);
    return acc;
  }, {});

  for (const file in grouped) {
    console.log(`📄 ${file}:`);
    grouped[file].forEach(v => {
      console.log(`   - [${v.type}] ${v.name} (Línea ${v.line})`);
    });
  }

  // Generar reporte en markdown
  const reportPath = './.agent/workspace/coordination/AUTH_SECURITY_REPORT.md';
  let reportContent = `# AUTH_SECURITY_REPORT - ${new Date().toISOString()}\n\n`;
  reportContent += `Total hallazgos: ${vulnerabilities.length}\n\n`;
  
  for (const file in grouped) {
    reportContent += `## ${file}\n`;
    reportContent += '| Función | Tipo | Línea | Estado |\n';
    reportContent += '|---------|------|-------|--------|\n';
    grouped[file].forEach(v => {
      reportContent += `| ${v.name} | ${v.type} | ${v.line} | 🔴 Pendiente |\n`;
    });
    reportContent += '\n';
  }

  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n✅ Reporte generado en: ${reportPath}`);
  } catch (e) {
    console.error(`\n❌ No se pudo escribir el reporte: ${e.message}`);
  }
} else {
  console.log('\n✅ No se encontraron vulnerabilidades obvias. ¡Gran trabajo!');
}
