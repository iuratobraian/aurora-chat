import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { reasonTask } from "./aurora-reasoning.mjs";

const ROOT = process.cwd();

const readJson = (relativePath) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
  } catch {
    return null;
  }
};

const readJsonl = (relativePath) => {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8").trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
};

function parseTaskBoard(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("|") && !line.includes("TASK-ID") && !line.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .map(([id, status, owner, scope, files, goal]) => ({ id, status, owner, scope, files, goal }));
}

function getTasks() {
  const filePath = path.join(ROOT, ".agent/workspace/coordination/TASK_BOARD.md");
  if (!fs.existsSync(filePath)) return [];
  return parseTaskBoard(fs.readFileSync(filePath, "utf8"));
}

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
}

const SURFACE_OWNERS = {
  community_feed: "CODEX-LEAD",
  onboarding_activation: "CODEX-LEAD",
  trust_reputation: "CODEX-LEAD",
  creator_monetization: "CODEX-LEAD",
  moderation_safety: "CODEX-LEAD",
  aurora_utility: "aurora_ops",
  viral_growth: "CODEX-LEAD",
  signals_trading: "CODEX-LEAD",
  leaderboard_gamification: "CODEX-LEAD",
  ai_agent: "aurora_ops",
};

const FAILURE_MODE_REGISTRY = {
  community_feed: [
    {
      mode: "engagement_drop",
      severity: "medium",
      indicator: "likes + comentarios < umbral",
      statement: "El engagement en el feed ha disminuido por debajo del umbral saludable.",
      recommendedAction: "Revisar calidad del contenido, considerar featured posts o recompensas por interacción."
    },
    {
      mode: "feed_stale",
      severity: "low",
      indicator: "posts sin actualización > 48h",
      statement: "El feed no ha recibido contenido nuevo en las últimas 48 horas.",
      recommendedAction: "Recordar a creadores activos publicar contenido fresco."
    }
  ],
  onboarding_activation: [
    {
      mode: "onboarding_drop_off",
      severity: "high",
      indicator: "usuarios que no completan onboarding > 30%",
      statement: "Más del 30% de los usuarios abandonan durante el onboarding sin activar.",
      recommendedAction: "Simplificar pasos, mostrar valor inmediatamente, añadir progress indicator."
    },
    {
      mode: "first_value_delay",
      severity: "high",
      indicator: "tiempo hasta primera interacción > 5 min",
      statement: "Los usuarios nuevos tardan más de 5 minutos en tener su primera interacción útil.",
      recommendedAction: "Automatizar primer follow a comunidad popular, sugerir primer post."
    }
  ],
  trust_reputation: [
    {
      mode: "ghost_accounts",
      severity: "medium",
      indicator: "usuarios sin actividad > 30 días",
      statement: "Cuentas sin actividad prolongada diluyen la señal de reputación.",
      recommendedAction: "Implementar grace period de 90 días antes de ocultar del ranking."
    }
  ],
  creator_monetization: [
    {
      mode: "low_creator_activation",
      severity: "high",
      indicator: "creators activos < 5% del total",
      statement: "Menos del 5% de los usuarios han creado contenido o comunidad.",
      recommendedAction: "Campaña de activación de creators, tutoriales de monetización."
    },
    {
      mode: "low_retention_paid",
      severity: "medium",
      indicator: "retención mensual < 60%",
      statement: "La retención de miembros pagados está por debajo del 60% mensual.",
      recommendedAction: "Mejorar engagement dentro de comunidades premium, KPI de valor."
    }
  ],
  moderation_safety: [
    {
      mode: "spam_amplification",
      severity: "high",
      indicator: "reportes de spam aumentando",
      statement: "Los reportes de spam están aumentando y no se están mitigando.",
      recommendedAction: "Revisar filtros anti-spam, activar verification más agresiva."
    }
  ],
  aurora_utility: [
    {
      mode: "low_query_resolution",
      severity: "medium",
      indicator: "queries resueltas < 70%",
      statement: "Aurora no está resolviendo queries con suficiente tasa de éxito.",
      recommendedAction: "Revisar prompts, mejorar retrieval, expandir knowledge base."
    }
  ],
  viral_growth: [
    {
      mode: "referral_inactive",
      severity: "medium",
      indicator: "referidos activos < 3%",
      statement: "El programa de referidos tiene menos del 3% de usuarios activos.",
      recommendedAction: "Simplificar flow de referido, aumentar recompensas iniciales."
    }
  ],
  signals_trading: [
    {
      mode: "low_signal_accuracy",
      severity: "high",
      indicator: "winrate < 55%",
      statement: "Las señales de trading tienen un winrate por debajo del umbral rentable.",
      recommendedAction: "Revisar metodología de señal, aumentar precisión, mostrar historial."
    }
  ],
  leaderboard_gamification: [
    {
      mode: "xp_deflation",
      severity: "low",
      indicator: "XP promedio diario decreciendo",
      statement: "El XP promedio diario está decreciendo, indicando fatiga gamificación.",
      recommendedAction: "Introducir eventos temporales, bonuses por streak, nuevos logros."
    }
  ],
  ai_agent: [
    {
      mode: "context_bleed",
      severity: "medium",
      indicator: "conversaciones con inconsistencias > 10%",
      statement: "Más del 10% de las conversaciones con el agente muestran inconsistencias.",
      recommendedAction: "Revisar memoria de largo plazo, reducir contexto por turno."
    }
  ]
};

const NEXT_BEST_IMPROVEMENTS = {
  community_feed: [
    { improvement: "Añadir indicador de contenido virales en tiempo real", impact: "high", effort: "medium" },
    { improvement: "Implementar saved posts con tags personalizables", impact: "medium", effort: "high" },
    { improvement: "Optimizar feed ranking para nuevos usuarios", impact: "high", effort: "low" }
  ],
  onboarding_activation: [
    { improvement: "Reducir onboarding a 3 pasos máximo", impact: "high", effort: "medium" },
    { improvement: "Automatizar follow a creadores trending en signup", impact: "high", effort: "low" },
    { improvement: "Mostrar feed personalizado inmediatamente post-signup", impact: "medium", effort: "medium" }
  ],
  trust_reputation: [
    { improvement: "Badges de verificación más visibles", impact: "medium", effort: "low" },
    { improvement: "Scorecard público de reputación por usuario", impact: "high", effort: "high" }
  ],
  creator_monetization: [
    { improvement: "Dashboard de ingresos simplificado para creators", impact: "high", effort: "medium" },
    { improvement: "Trial premium de 7 días para nuevas comunidades", impact: "medium", effort: "low" },
    { improvement: "Integración con analytics de retención", impact: "high", effort: "medium" }
  ],
  moderation_safety: [
    { improvement: "Auto-moderation para spam con ML", impact: "high", effort: "high" },
    { improvement: "Panel de moderation con queue priorizada", impact: "medium", effort: "medium" }
  ],
  aurora_utility: [
    { improvement: "Memory refresh automático cada 24h", impact: "high", effort: "medium" },
    { improvement: "Playbooks ejecutables para operadores", impact: "medium", effort: "low" }
  ],
  viral_growth: [
    { improvement: "Simplificar link de referido a /?ref=user", impact: "high", effort: "low" },
    { improvement: "Notificaciones cuando referido se registra", impact: "medium", effort: "low" }
  ],
  signals_trading: [
    { improvement: "Historial completo de señales con resultado", impact: "high", effort: "medium" },
    { improvement: "Alertas por telegram para señales premium", impact: "medium", effort: "medium" }
  ],
  leaderboard_gamification: [
    { improvement: "Eventos semanales con XP bonus", impact: "medium", effort: "low" },
    { improvement: "Streak rewards más visibles", impact: "high", effort: "low" }
  ],
  ai_agent: [
    { improvement: "Memory pruning automático", impact: "medium", effort: "medium" },
    { improvement: "User feedback on agent responses", impact: "high", effort: "low" }
  ]
};

function scoreSurfaceHealth(surface, metrics) {
  const tasks = getTasks();
  const owner = SURFACE_OWNERS[surface.id] || "unknown";
  const ownerTasks = tasks.filter(
    (t) => t.owner === owner && t.scope !== "aurora_ops"
  );
  const blockingTasks = ownerTasks.filter((t) =>
    t.goal?.toLowerCase().includes(surface.id) ||
    t.files?.toLowerCase().includes(surface.id)
  );
  const doneTasks = blockingTasks.filter((t) => t.status === "done").length;
  const claimedTasks = blockingTasks.filter((t) => t.status === "claimed").length;

  const taskHealth = blockingTasks.length === 0 ? 1.0 :
    blockingTasks.length > 0 ? doneTasks / blockingTasks.length : 0.5;
  const ownerHealth = owner === "unknown" ? 0.3 :
    claimedTasks > 0 ? 0.9 : 0.6;
  const signalHealth = metrics.signalCount > 0 ? Math.min(1, metrics.signalCount / 50) : 0.5;
  const failureSeverity = (FAILURE_MODE_REGISTRY[surface.id] || [])
    .filter((f) => f.severity === "high").length;
  const failurePenalty = failureSeverity * 0.15;
  const health = Math.max(0, Math.min(1,
    (taskHealth * 0.3 + ownerHealth * 0.3 + signalHealth * 0.4) - failurePenalty
  ));

  return {
    score: Math.round(health * 100),
    taskHealth: Math.round(taskHealth * 100),
    ownerHealth: Math.round(ownerHealth * 100),
    signalHealth: Math.round(signalHealth * 100),
    failurePenalty: Math.round(failurePenalty * 100),
    activeTasks: blockingTasks.length,
    doneTasks,
    owner
  };
}

function computeSurfaceMetrics() {
  const activity = readJsonl(".agent/brain/db/activity_log.jsonl");
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const recentActivity = activity.filter((a) => {
    if (!a.timestamp) return false;
    const ts = new Date(a.timestamp).getTime();
    return ts > weekAgo;
  });

  const signalCount = recentActivity.length;
  const uniqueUsers = new Set(recentActivity.map((a) => a.userId || a.agent)).size;
  const domainActivity = recentActivity.reduce((acc, a) => {
    const domain = a.domain || a.type || "unknown";
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {});

  return { signalCount, uniqueUsers, domainActivity };
}

function detectProductFailureModes(surfaceId = null) {
  const surfaces = readJson(".agent/aurora/product-surfaces.json")?.prioritySurfaces || [];
  const targets = surfaceId
    ? surfaces.filter((s) => s.id === surfaceId)
    : surfaces;

  const modes = [];
  for (const surface of targets) {
    const registry = FAILURE_MODE_REGISTRY[surface.id] || [];
    for (const mode of registry) {
      const reasoning = reasonTask(`${surface.id} ${mode.mode}`);
      modes.push({
        surfaceId: surface.id,
        surfaceLabel: surface.label,
        ...mode,
        detectedAt: new Date().toISOString(),
        reasoning: reasoning.risk?.severity === "high" ? "Requiere atención inmediata" : "Monitorear"
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalDetected: modes.length,
    bySeverity: {
      high: modes.filter((m) => m.severity === "high").length,
      medium: modes.filter((m) => m.severity === "medium").length,
      low: modes.filter((m) => m.severity === "low").length
    },
    modes: modes.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    })
  };
}

function suggestNextBestImprovements(surfaceId = null) {
  const surfaces = readJson(".agent/aurora/product-surfaces.json")?.prioritySurfaces || [];
  const targets = surfaceId
    ? surfaces.filter((s) => s.id === surfaceId)
    : surfaces;

  const recommendations = [];

  for (const surface of targets) {
    const improvements = NEXT_BEST_IMPROVEMENTS[surface.id] || [];
    const health = detectProductFailureModes(surface.id);
    const hasHighFailure = health.bySeverity.high > 0;

    for (const imp of improvements) {
      const effortScore = imp.effort === "low" ? 3 : imp.effort === "medium" ? 2 : 1;
      const impactScore = imp.impact === "high" ? 3 : imp.impact === "medium" ? 2 : 1;
      const priority = effortScore * impactScore + (hasHighFailure ? 2 : 0);

      const reasoning = reasonTask(`${surface.id}: ${imp.improvement}`);
      recommendations.push({
        surfaceId: surface.id,
        surfaceLabel: surface.label,
        improvement: imp.improvement,
        impact: imp.impact,
        effort: imp.effort,
        priority,
        owner: SURFACE_OWNERS[surface.id],
        recommendedAction: reasoning.nextStep || imp.improvement,
        riskLevel: reasoning.risk?.severity || "low"
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalRecommendations: recommendations.length,
    bySurface: targets.length,
    recommendations: recommendations.sort((a, b) => b.priority - a.priority)
  };
}

function buildProductSnapshot() {
  const surfaces = readJson(".agent/aurora/product-surfaces.json")?.prioritySurfaces || [];
  const tasks = getTasks();
  const metrics = computeSurfaceMetrics();

  const surfaceHealths = surfaces.map((surface) => {
    const healthData = scoreSurfaceHealth(surface, metrics);
    const failures = (FAILURE_MODE_REGISTRY[surface.id] || [])
      .filter((f) => f.severity === "high").length;
    const recommendations = (NEXT_BEST_IMPROVEMENTS[surface.id] || [])
      .filter((r) => r.impact === "high").length;
    const surfaceTasks = tasks.filter(
      (t) => t.files?.toLowerCase().includes(surface.id) ||
        t.goal?.toLowerCase().includes(surface.id)
    );

    return {
      surfaceId: surface.id,
      label: surface.label,
      domain: surface.domain,
      goal: surface.goal,
      signals: surface.signals,
      files: surface.files,
      health: healthData,
      failuresHigh: failures,
      topRecommendations: recommendations,
      openTasks: surfaceTasks.filter((t) => t.status !== "done").length,
      doneTasks: surfaceTasks.filter((t) => t.status === "done").length
    };
  });

  const avgHealth = surfaceHealths.length > 0
    ? Math.round(surfaceHealths.reduce((sum, s) => sum + s.health.score, 0) / surfaceHealths.length)
    : 0;
  const totalFailures = surfaceHealths.reduce((sum, s) => sum + s.failuresHigh, 0);
  const totalOpenTasks = surfaceHealths.reduce((sum, s) => sum + s.openTasks, 0);
  const platformHealth = avgHealth > 70 ? "green" : avgHealth > 50 ? "yellow" : "red";

  const worstSurfaces = [...surfaceHealths]
    .sort((a, b) => a.health.score - b.health.score)
    .slice(0, 3);

  const topRecommendations = suggestNextBestImprovements().recommendations.slice(0, 5);

  return {
    generatedAt: new Date().toISOString(),
    product: "TradePortal",
    category: "community trading platform",
    overallHealth: {
      score: avgHealth,
      status: platformHealth,
      totalSurfaces: surfaces.length,
      surfacesGreen: surfaceHealths.filter((s) => s.health.score > 70).length,
      surfacesYellow: surfaceHealths.filter((s) => s.health.score > 50 && s.health.score <= 70).length,
      surfacesRed: surfaceHealths.filter((s) => s.health.score <= 50).length
    },
    summary: {
      totalFailuresHigh: totalFailures,
      openProductTasks: totalOpenTasks,
      platformHealthStatus: platformHealth
    },
    surfaceHealths,
    worstSurfaces,
    topRecommendations,
    activityMetrics: {
      signalsLast7d: metrics.signalCount,
      uniqueActiveAgents: metrics.uniqueUsers,
      domainBreakdown: metrics.domainActivity
    }
  };
}

function getSurfaceHealth(surfaceId) {
  const surfaces = readJson(".agent/aurora/product-surfaces.json")?.prioritySurfaces || [];
  const surface = surfaces.find((s) => s.id === surfaceId);
  if (!surface) return null;

  const metrics = computeSurfaceMetrics();
  const healthData = scoreSurfaceHealth(surface, metrics);
  const failures = detectProductFailureModes(surfaceId);
  const recommendations = suggestNextBestImprovements(surfaceId);
  const tasks = getTasks().filter(
    (t) => t.files?.toLowerCase().includes(surfaceId) ||
      t.goal?.toLowerCase().includes(surfaceId)
  );

  return {
    generatedAt: new Date().toISOString(),
    surface,
    health: healthData,
    failures,
    recommendations,
    tasks: tasks.map((t) => ({
      id: t.id,
      status: t.status,
      owner: t.owner,
      goal: t.goal
    }))
  };
}

function getProductSurfaces() {
  const surfaces = readJson(".agent/aurora/product-surfaces.json")?.prioritySurfaces || [];
  const domains = readJson(".agent/aurora/product-surfaces.json")?.domains || {};
  const metrics = computeSurfaceMetrics();

  return surfaces.map((surface) => {
    const healthData = scoreSurfaceHealth(surface, metrics);
    return {
      ...surface,
      health: healthData.score,
      owner: SURFACE_OWNERS[surface.id] || "unassigned",
      failuresHigh: (FAILURE_MODE_REGISTRY[surface.id] || [])
        .filter((f) => f.severity === "high").length
    };
  });
}

function saveDailyProductScore(snapshot) {
  const dir = path.join(ROOT, ".agent/aurora/scores");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const today = new Date().toISOString().split("T")[0];
  const filePath = path.join(dir, `product-${today}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
}

export function runAuroraProductIntelligence() {
  const snapshot = buildProductSnapshot();
  saveDailyProductScore(snapshot);

  console.log("AURORA PRODUCT INTELLIGENCE");
  console.log(JSON.stringify(snapshot, null, 2));

  if (snapshot.overallHealth.status === "red") {
    console.log(`\nAlert: Plataforma en estado rojo (${snapshot.overallHealth.score}%). ${snapshot.worstSurfaces.map((s) => s.surfaceId).join(", ")} requieren atención inmediata.`);
  }
  if (snapshot.summary.totalFailuresHigh > 0) {
    console.log(`\nAlert: ${snapshot.summary.totalFailuresHigh} failure modes de alta severidad detectados.`);
  }

  return snapshot;
}

const entryPointUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1]))
  : null;

if (entryPointUrl && entryPointUrl.href === import.meta.url) {
  runAuroraProductIntelligence();
}

export {
  buildProductSnapshot,
  getSurfaceHealth,
  getProductSurfaces,
  detectProductFailureModes,
  suggestNextBestImprovements
};
