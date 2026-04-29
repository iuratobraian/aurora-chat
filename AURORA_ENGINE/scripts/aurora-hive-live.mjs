const CONVEX_URL = 'https://diligent-wildcat-523.convex.cloud';
const DEPLOY_KEY = 'prod:diligent-wildcat-523:eyJ2MiI6Ijk0NTI1NDI3MjVmZjQ2MWZiOTlkNDliOGJmZWZjODNhIn0=';

const { ConvexHttpClient } = await import('convex/browser');
const api = new ConvexHttpClient(CONVEX_URL);

// 1. Verificar tareas in_progress con múltiples reintentos fallidos
const summary = await api.query('auroraHiveSync:getActiveSummary', {});

console.log('📊 REPORTE DE COMUNICACIÓN DE FALLAS - AURORA HIVE\n');
console.log(`Tareas in-progress: ${summary.counts.inProgress}`);
console.log(`Tareas pending: ${summary.counts.pending}`);
console.log(`Tareas done: ${summary.counts.done}`);

// 2. Analizar patrones de fallos repetidos
const inProgress = summary.inProgress || [];
const uniqueTitles = new Set(inProgress.map(t => t.title.substring(0, 50)));
const failureCounts = {};

inProgress.forEach(task => {
  const shortTitle = task.title.substring(0, 50);
  failureCounts[shortTitle] = (failureCounts[shortTitle] || 0) + 1;
});

console.log('\n🔍 ANÁLISIS DE FALLOS REPETIDOS:');
Object.entries(failureCounts).forEach(([title, count]) => {
  console.log(`  ⚠️ ${title}... → ${count} reintentos fallidos`);
});

// 3. Detectar loops críticos (más de 3 reintentos del mismo error)
const criticalLoops = Object.entries(failureCounts)
  .filter(([_, count]) => count >= 3)
  .map(([title, count]) => ({ title, count }));

if (criticalLoops.length > 0) {
  console.log('\n🚨 LOOPS CRÍTICOS DETECTADOS (≥3 reintentos):');
  criticalLoops.forEach(loop => {
    console.log(`  🔴 CRÍTICO: "${loop.title}" - ${loop.count} intentos sin éxito`);
  });
  
  // 4. Registrar en systemErrors si hay loops críticos
  for (const loop of criticalLoops) {
    try {
      await api.mutation('systemErrors:reportError', {
        errorMessage: `[SENTINEL LOOP] ${loop.title}`,
        pageUrl: 'aurora-hive-sync',
        severity: 'critical',
        sessionId: 'SENTINEL_01',
        errorStack: `Loop detectado: ${loop.count} reintentos del mismo error sin éxito`,
        componentStack: 'AURORA_SENTINEL_01 - Auto-repair loop detected',
      });
      console.log(`  ✅ Error registrado en systemErrors: "${loop.title}"`);
    } catch (err) {
      console.log(`  ❌ No se pudo registrar: "${loop.title}" - ${err.message}`);
    }
  }
} else {
  console.log('\n✅ No hay loops críticos detectados');
}

// 5. Verificar si hay tareas stuck (mismo agente, mismo error, >5 intentos)
const agentTasks = {};
inProgress.forEach(task => {
  if (!agentTasks[task.assignedTo]) {
    agentTasks[task.assignedTo] = [];
  }
  agentTasks[task.assignedTo].push(task);
});

console.log('\n👥 DISTRIBUCIÓN POR AGENTE:');
Object.entries(agentTasks).forEach(([agent, tasks]) => {
  console.log(`  🤖 ${agent}: ${tasks.length} tareas activas`);
  if (tasks.length > 5) {
    console.log(`    ⚠️ ALERTA: Agente sobrecargado (${tasks.length} tareas)`);
  }
});

// 6. Recomendaciones
console.log('\n💡 RECOMENDACIONES:');
if (criticalLoops.length > 0) {
  console.log(`  1. Detener AURORA_SENTINEL_01 - está en loop de ${criticalLoops[0].count} reintentos`);
  console.log(`  2. Investigar causa raíz del crash: ${criticalLoops[0].title}`);
  console.log('  3. Implementar backoff exponencial en sentinels (esperar más entre reintentos)');
  console.log('  4. Agregar notificación automática tras 3 fallos consecutivos');
}

if (Object.keys(agentTasks).length === 1) {
  console.log('  5. Distribuir carga - solo 1 agente activo en todo el Hive');
}

console.log('\n📋 REPORTE FINALIZADO:', new Date().toISOString());
