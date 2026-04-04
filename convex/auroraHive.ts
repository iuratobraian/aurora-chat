import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// 1. OBTENER TAREAS PENDIENTES
export const getPendingTasks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("auroraTasks")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .order("asc")
        .take(args.limit || 10);
    } catch { return []; }
  },
});

// 1b. OBTENER TAREAS EN PROGRESO (agentes trabajando ahora)
export const getInProgressTasks = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await ctx.db
        .query("auroraTasks")
        .withIndex("by_status", (q) => q.eq("status", "in_progress"))
        .order("desc")
        .take(20);
    } catch { return []; }
  },
});

// 2. OBTENER TAREAS COMPLETADAS
export const getCompletedTasks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("auroraTasks")
        .withIndex("by_status", (q) => q.eq("status", "done"))
        .order("desc")
        .take(args.limit || 20);
    } catch { return []; }
  },
});

// 3. OBTENER MÉTRICAS GLOBALES DEL ENJAMBRE
export const getHiveMetrics = query({
  args: {},
  handler: async (ctx) => {
    try {
      const allTasks = await ctx.db.query("auroraTasks").collect();
      const pending = allTasks.filter(t => t.status === "pending").length;
      const inProgress = allTasks.filter(t => t.status === "in_progress").length;
      const done = allTasks.filter(t => t.status === "done").length;
      const total = allTasks.length;
      
      // Tareas de hoy
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const doneToday = allTasks.filter(t => t.status === "done" && (t.updatedAt || 0) >= todayStart).length;
      const createdToday = allTasks.filter(t => (t.createdAt || 0) >= todayStart).length;

      return { pending, inProgress, done, total, doneToday, createdToday };
    } catch { return { pending: 0, inProgress: 0, done: 0, total: 0, doneToday: 0, createdToday: 0 }; }
  },
});

// 4. CREAR TAREA DESDE EL PANEL ADMIN
export const createTask = mutation({
  args: {
    title: v.string(),
    epic: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
    source: v.optional(v.string()), // "manual" | "auto-diagnostic"
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("auroraTasks", {
      title: args.title,
      epic: args.epic,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: args.priority || 1,
      source: args.source || "manual",
    });
    
    await ctx.db.insert("auroraTransmissions", {
      agentId: "AURORA_CORE",
      type: "log",
      message: `[${args.source === "auto-diagnostic" ? "🔍 AUTO-DIAG" : "👤 MANUAL"}] Nueva tarea: ${args.title}`,
      relatedTaskId: taskId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    });
    
    return taskId;
  },
});

// 5. MARCAR TAREA COMO COMPLETADA
export const completeTask = mutation({
  args: {
    taskId: v.id("auroraTasks"),
    agentId: v.string(),
    result: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return { success: false };

    await ctx.db.patch(args.taskId, {
      status: "done",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auroraTransmissions", {
      agentId: args.agentId,
      type: "complete",
      message: `✅ Tarea completada: ${task.title}${args.result ? ` | ${args.result}` : ""}`,
      relatedTaskId: args.taskId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  },
});

// 6. RECLAMAR TAREA POR UN AGENTE
export const claimTask = mutation({
  args: {
    taskId: v.id("auroraTasks"),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || task.status !== "pending") return { success: false, reason: "Task not available" };

    await ctx.db.patch(args.taskId, {
      status: "in_progress",
      assignedTo: args.agentId,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auroraTransmissions", {
      agentId: args.agentId,
      type: "claim",
      message: `🤖 Agente ${args.agentId} reclamó: ${task.title}`,
      relatedTaskId: args.taskId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    });

    return { success: true, task };
  },
});

// 7. LEER TRANSMISIONES (Feed del enjambre)
export const getActiveTransmissions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("auroraTransmissions")
        .withIndex("by_createdAt")
        .order("desc")
        .take(args.limit || 50);
    } catch { return []; }
  },
});

// 8. AUTO-DIAGNÓSTICO: Crear tareas desde errores del sistema
export const createDiagnosticTasks = mutation({
  args: {
    errors: v.array(v.object({
      message: v.string(),
      severity: v.string(),
      pageUrl: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const created = [];
    for (const err of args.errors) {
      // Evitar duplicados: verificar si ya existe una tarea pendiente para este error
      const existing = await ctx.db
        .query("auroraTasks")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .filter((q) => q.eq(q.field("title"), `[AUTO-FIX] ${err.message.substring(0, 80)}`))
        .first();
      
      if (!existing) {
        const taskId = await ctx.db.insert("auroraTasks", {
          title: `[AUTO-FIX] ${err.message.substring(0, 80)}`,
          epic: "Auto-Diagnóstico",
          description: `Error detectado automáticamente en ${err.pageUrl}. Severidad: ${err.severity}. Mensaje completo: ${err.message}`,
          status: "pending",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          priority: err.severity === "critical" ? 10 : err.severity === "high" ? 7 : 3,
          source: "auto-diagnostic",
        });
        created.push(taskId);

        await ctx.db.insert("auroraTransmissions", {
          agentId: "AURORA_DIAGNOSTICS",
          type: "alert",
          message: `🚨 Error auto-detectado (${err.severity}): ${err.message.substring(0, 100)}`,
          relatedTaskId: taskId,
          createdAt: Date.now(),
          expiresAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
        });
      }
    }
    return { created: created.length };
  },
});

// 9. CRON CLEANUP
export const cleanupExpiredTransmissions = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("auroraTransmissions")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .take(100);

    for (const msg of expired) {
      await ctx.db.delete(msg._id);
    }
    return expired.length;
  },
});
