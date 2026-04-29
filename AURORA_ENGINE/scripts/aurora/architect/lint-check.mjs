import fs from 'node:fs';
import path from 'node:path';

/**
 * Aurora Architect: Pattern-First Development
 * Goal: Clean, maintainable codebase that follows root style.
 */

async function scanArchitecturalPatterns() {
  console.log('🏗️ [Aurora Architect] Scanning codebase for patterns...');

  const roots = ['views', 'components', 'convex'];
  const violations = [];

  for (const root of roots) {
    const rootPath = path.join(process.cwd(), root);
    if (!fs.existsSync(rootPath)) continue;

    const files = fs.readdirSync(rootPath, { recursive: true }).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

    for (const file of files) {
      if (file.includes('node_modules') || file.includes('_generated')) continue;
      
      const content = fs.readFileSync(path.join(rootPath, file), 'utf8');
      
      // 1. Detect 'any' usage (Tech Debt CORE-001)
      const anyCount = (content.match(/:\s*any[,\n;]/g) || []).length;
      if (anyCount > 0) {
        violations.push(`${file}: Found ${anyCount} instances of 'any' type.`);
      }

      // 2. Detect ad-hoc inline styles (CSS CORE-002)
      if (content.match(/style=\{\{/g)) {
        violations.push(`${file}: Detected inline style. Prefer Tailwind or DESIGN_SYSTEM.md classes.`);
      }
    }
  }

  if (violations.length > 0) {
     console.warn(`🏗️ [Architect] Warning: Found ${violations.length} pattern violations:`);
     violations.forEach(v => console.log(`   - ${v}`));
  } else {
     console.log('✅ [Architect] Codebase follows root patterns perfectly.');
  }

  // 3. (Optional) Save report for other agents
  fs.writeFileSync(path.join(process.cwd(), '.agent/workspace/coordination/ARCHITECT_AUDIT.md'), violations.join('\n'));
}

scanArchitecturalPatterns().catch(console.error);
