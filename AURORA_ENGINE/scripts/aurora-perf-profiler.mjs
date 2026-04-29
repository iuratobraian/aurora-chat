import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    let score = 0;
    const suggestions = [];

    // Check for large components without memo
    if (content.length > 5000 && !content.includes('memo(')) {
        score += 20;
        suggestions.push(`[${fileName}] Componente extenso detectedado. Se recomienda usar React.memo() para prevenir re-renders innecesarios.`);
    }

    // Check for inline functions in props
    const inlineFuncMatches = content.match(/on[A-Z][a-zA-Z]*=\{\(\) =>/g);
    if (inlineFuncMatches && inlineFuncMatches.length > 5) {
        score += 15;
        suggestions.push(`[${fileName}] Múltiples funciones inline detectadas en props. Se recomienda extraerlas con useCallback().`);
    }

    // Check for useEffect without cleanup
    if (content.includes('useEffect(') && !content.includes('return () =>')) {
        score += 10;
        suggestions.push(`[${fileName}] useEffect detectado sin función de retorno (cleanup). Posible fuga de memoria (memory leak).`);
    }

    return { filePath, score, suggestions };
}

function runProfiler() {
    console.log("🚀 Aurora Performance Profiler - Iniciando Análisis...");
    const files = [];

    function walk(dir) {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat && stat.isDirectory() && !fullPath.includes('node_modules')) {
                walk(fullPath);
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                files.push(fullPath);
            }
        });
    }

    walk(SRC_DIR);

    const reports = files.map(scanFile).filter(r => r.score > 0).sort((a,b) => b.score - a.score);

    console.log(`\n✅ Análisis completado. ${reports.length} de ${files.length} archivos requieren atención.\n`);
    
    reports.forEach(r => {
        console.log(`📁 ${r.filePath} (Risk Score: ${r.score})`);
        r.suggestions.forEach(s => console.log(`  - ${s}`));
        console.log("");
    });

    fs.writeFileSync('./PERF_REPORT.md', `# ⚡ Aurora Performance Snapshot - ${new Date().toLocaleDateString()}\n\n` +
        reports.map(r => `## ${r.filePath}\n- **Risk Score:** ${r.score}\n${r.suggestions.map(s => `- ${s}`).join('\n')}`).join('\n\n')
    );

    console.log("📄 Reporte guardado en PERF_REPORT.md");
}

runProfiler();
