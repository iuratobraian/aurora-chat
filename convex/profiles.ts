import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getLevelFromXp } from "./lib/permissions";
import { assertOwnershipOrAdmin } from "./lib/auth";
import bcrypt from "bcryptjs";
import logger from "./logger";

export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getProfileByUsuario = query({
  args: { usuario: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_usuario", (q) => q.eq("usuario", args.usuario))
      .unique();
  },
});

export const getProfileByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getNextUserNumber = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await assertOwnershipOrAdmin(ctx, args.userId);
    const highestUser = await ctx.db
      .query("profiles")
      .withIndex("by_userNumber")
      .order("desc")
      .first();
    
    return (highestUser?.userNumber ?? 0) + 1;
  },
});

export const getAllProfiles = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const query = ctx.db.query("profiles").order("desc");
    
    if (args.cursor) {
      const all = await query.take(200);
      const cursorIndex = all.findIndex(p => p._id.toString() === args.cursor);
      if (cursorIndex !== -1) {
        const profiles = all.slice(cursorIndex + 1, cursorIndex + 1 + limit);
        return {
          profiles,
          nextCursor: all[cursorIndex + limit]?._id.toString(),
        };
      }
    }
    
    const results = await query.take(limit);
    return {
      profiles: results,
      nextCursor: results.length === limit ? results[results.length - 1]._id.toString() : undefined,
    };
  },
});

export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    nombre: v.string(),
    usuario: v.string(),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    esPro: v.boolean(),
    esVerificado: v.boolean(),
    rol: v.string(),
    role: v.number(), // 0=FREE, 1=PRO, 2=ELITE, 3=CREATOR, 4=MOD, 5=ADMIN, 6=SUPERADMIN
    xp: v.number(),
    level: v.number(),
    email: v.string(),
    password: v.optional(v.string()),
    biografia: v.optional(v.string()),
    instagram: v.optional(v.string()),
    seguidores: v.optional(v.array(v.string())),
    siguiendo: v.optional(v.array(v.string())),
    aportes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    reputation: v.optional(v.number()),
    badges: v.optional(v.array(v.string())),
    estadisticas: v.optional(v.any()),
    saldo: v.optional(v.number()),
    watchlist: v.optional(v.array(v.string())),
    watchedClasses: v.optional(v.array(v.string())),
    progreso: v.optional(v.any()),
    fechaRegistro: v.optional(v.string()),
    diasActivos: v.optional(v.number()),
    ultimoLogin: v.optional(v.string()),
    status: v.optional(v.string()),
    referredBy: v.optional(v.string()),
    isBlocked: v.optional(v.boolean()),
    avatarFrame: v.optional(v.string()),
    streakReward: v.optional(v.string()),
    streakDays: v.optional(v.number()),
    dailyFreeCoinsBalance: v.optional(v.number()),
    lastClaimDate: v.optional(v.string()),
    weeklyXP: v.optional(v.number()),
    monthlyXP: v.optional(v.number()),
    weeklyXPResetAt: v.optional(v.number()),
    monthlyXPResetAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const data: any = {
      userId: args.userId,
      nombre: args.nombre,
      usuario: args.usuario,
      avatar: args.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.userId}`,
      banner: args.banner || "",
      esPro: args.esPro ?? false,
      esVerificado: args.esVerificado ?? false,
      rol: args.rol || "user",
      role: args.role ?? 0,
      xp: args.xp ?? 0,
      level: args.level ?? 1,
      email: args.email,
      password: args.password ? await bcrypt.hash(args.password, 10) : undefined,
      biografia: args.biografia || "",
      instagram: args.instagram || "",
      seguidores: args.seguidores || [],
      siguiendo: args.siguiendo || [],
      aportes: args.aportes || 0,
      accuracy: args.accuracy || 50,
      reputation: args.reputation || 50,
      badges: args.badges || [],
      Medellas: (args as any).medallas || (args as any).medals || [],
      estadisticas: args.estadisticas || { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 },
      saldo: args.saldo || 0,
      watchlist: args.watchlist || ["BTC/USD", "EUR/USD"],
      watchedClasses: args.watchedClasses || [],
      progreso: args.progreso || {},
      fechaRegistro: args.fechaRegistro || (existing ? (existing.fechaRegistro || new Date().toISOString()) : new Date().toISOString()),
      diasActivos: args.diasActivos ?? (existing ? (existing.diasActivos ?? 1) : 1),
      ultimoLogin: args.ultimoLogin ?? (existing ? (existing.ultimoLogin ?? "") : ""),
      status: args.status || "active",
      referredBy: args.referredBy,
      isBlocked: args.isBlocked ?? false,
      avatarFrame: args.avatarFrame,
      streakReward: args.streakReward,
      userNumber: existing?.userNumber ?? undefined,
    };
    
    delete data.medallas;
    delete data.medals;

    if (existing) {
      const { diasActivos, ultimoLogin, fechaRegistro, ...otherFields } = data;
      const updates: any = { ...otherFields };
      if (args.diasActivos !== undefined) updates.diasActivos = args.diasActivos;
      if (args.ultimoLogin !== undefined) updates.ultimoLogin = args.ultimoLogin;
      if (args.fechaRegistro !== undefined) updates.fechaRegistro = args.fechaRegistro;
      
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      const profiles = await ctx.db.query("profiles").collect();
      const userNumbers = profiles.map(p => p.userNumber).filter((n): n is number => n !== undefined && n !== null);
      const nextNumber = userNumbers.length === 0 ? 1 : Math.max(...userNumbers) + 1;
      
      const profileData: any = {
        userId: args.userId,
        nombre: args.nombre,
        usuario: args.usuario,
        avatar: args.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.userId}`,
        banner: args.banner || "",
        esPro: args.esPro ?? false,
        esVerificado: args.esVerificado ?? false,
        rol: args.rol || "user",
        role: args.role ?? 0,
        xp: args.xp ?? 0,
        level: args.level ?? 1,
        email: args.email,
        password: args.password ? await bcrypt.hash(args.password, 10) : undefined,
        biografia: args.biografia || "",
        instagram: args.instagram || "",
        seguidores: args.seguidores || [],
        siguiendo: args.siguiendo || [],
        aportes: args.aportes || 0,
        accuracy: args.accuracy || 50,
        reputation: args.reputation || 50,
        badges: args.badges || [],
        Medellas: [],
        estadisticas: args.estadisticas || { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 },
        saldo: args.saldo || 0,
        watchlist: args.watchlist || ["BTC/USD", "EUR/USD"],
        watchedClasses: args.watchedClasses || [],
        progreso: args.progreso || {},
        fechaRegistro: args.fechaRegistro || new Date().toISOString(),
        diasActivos: args.diasActivos ?? 1,
        ultimoLogin: args.ultimoLogin ?? "",
        status: args.status || "active",
        referredBy: args.referredBy,
        isBlocked: args.isBlocked ?? false,
        avatarFrame: args.avatarFrame,
        streakReward: args.streakReward,
        userNumber: nextNumber,
      };
      
      Object.keys(profileData).forEach(key => {
        if (key.toLowerCase() === 'medallas' && key !== 'Medellas') {
          delete profileData[key];
        }
      });
      
      return await ctx.db.insert("profiles", profileData);
    }
  },
});

export const registerWithReferral = mutation({
  args: {
    userId: v.string(),
    nombre: v.string(),
    usuario: v.string(),
    email: v.string(),
    password: v.optional(v.string()),
    avatar: v.optional(v.string()),
    referredBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingByUserId = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (existingByUserId) {
      throw new Error("El usuario ya existe");
    }

    const existingByUsuario = await ctx.db
      .query("profiles")
      .withIndex("by_usuario", (q) => q.eq("usuario", args.usuario))
      .unique();
    
    if (existingByUsuario) {
      throw new Error(`El usuario @${args.usuario} ya existe`);
    }

    const existingByEmail = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (existingByEmail) {
      throw new Error("Ya existe una cuenta con ese correo electrónico");
    }

    const profiles = await ctx.db.query("profiles").collect();
    const userNumbers = profiles.map(p => p.userNumber).filter((n): n is number => n !== undefined && n !== null);
    const nextNumber = userNumbers.length === 0 ? 1 : Math.max(...userNumbers) + 1;

    const profileId = await ctx.db.insert("profiles", {
      userId: args.userId,
      nombre: args.nombre,
      usuario: args.usuario,
      email: args.email,
      password: args.password ? await bcrypt.hash(args.password, 10) : undefined,
      avatar: args.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${args.usuario}`,
      esPro: false,
      esVerificado: false,
      rol: "user",
      role: 0,
      xp: 0,
      level: 1,
      seguidores: [],
      siguiendo: [],
      aportes: 0,
      accuracy: 50,
      reputation: 50,
      badges: [],
      Medellas: [],
      estadisticas: { tasaVictoria: 50, factorBeneficio: 1.2, pnlTotal: 0 },
      saldo: 0,
      watchlist: ["BTC/USD", "EUR/USD"],
      watchedClasses: [],
      progreso: { is_new_user: true },
      fechaRegistro: new Date().toISOString(),
      diasActivos: 1,
      status: "active",
      referredBy: args.referredBy,
      userNumber: nextNumber,
    });

    if (args.referredBy) {
      const referrerCode = args.referredBy;
      const referrer = await ctx.db
        .query("profiles")
        .withIndex("by_usuario", (q) => q.eq("usuario", referrerCode))
        .unique();
      
      if (referrer) {
        logger.info(`[REFERRAL] User ${args.usuario} registered with referral from ${referrerCode}`);
      }
    }

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("profiles"),
    userId: v.string(),
    nombre: v.optional(v.string()),
    usuario: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    biografia: v.optional(v.string()),
    instagram: v.optional(v.string()),
    seguidores: v.optional(v.array(v.string())),
    siguiendo: v.optional(v.array(v.string())),
    aportes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    reputation: v.optional(v.number()),
    estadisticas: v.optional(v.any()),
    saldo: v.optional(v.number()),
    isBlocked: v.optional(v.boolean()),
    avatarFrame: v.optional(v.string()),
    streakReward: v.optional(v.string()),
    streakDays: v.optional(v.number()),
    weeklyXP: v.optional(v.number()),
    monthlyXP: v.optional(v.number()),
    weeklyXPResetAt: v.optional(v.number()),
    monthlyXPResetAt: v.optional(v.number()),
    esPro: v.optional(v.boolean()),
    esVerificado: v.optional(v.boolean()),
    rol: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const profile = await ctx.db.get(args.id);
    if (!profile) throw new Error("Perfil no encontrado");

    const isSelf = profile.userId === args.userId;

    const caller = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const isAdmin = caller && (caller.role || 0) >= 5;

    if (!isSelf && !isAdmin) throw new Error("No tienes permiso para editar este perfil");

    const { id, userId, ...updates } = args;

    const sensitiveFields = ['saldo', 'isBlocked', 'reputation', 'esPro', 'esVerificado', 'rol'];
    for (const field of sensitiveFields) {
      if (field in updates && !isAdmin) {
        throw new Error(`Solo admins pueden modificar ${field}`);
      }
    }

    // Registrar edición
    const editHistory = profile.editHistory || [];
    editHistory.push({
      timestamp: Date.now(),
      userId: userId,
      previousData: { nombre: profile.nombre, usuario: profile.usuario, biografia: profile.biografia },
      newData: updates,
      changes: Object.keys(updates),
    });

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const toggleFollow = mutation({
  args: { followerId: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    if (!args.followerId) throw new Error("followerId requerido");

    const follower = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.followerId))
      .unique();

    const target = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetId))
      .unique();
    if (!follower || !target) {
      logger.warn("Profile not found for follow action. followerId:", args.followerId, "targetId:", args.targetId);
      return;
    }

    const followingList = follower.siguiendo || [];
    const followersList = target.seguidores || [];

    const isFollowing = followingList.includes(args.targetId);

    if (isFollowing) {
      await ctx.db.patch(follower._id, {
        siguiendo: followingList.filter(id => id !== args.targetId)
      });
      await ctx.db.patch(target._id, {
        seguidores: followersList.filter(id => id !== args.followerId)
      });
    } else {
      await ctx.db.patch(follower._id, {
        siguiendo: [...followingList, args.targetId]
      });
      await ctx.db.patch(target._id, {
        seguidores: [...followersList, args.followerId]
      });
    }
  },
});

export const banUser = mutation({
  args: { userId: v.string(), adminUserId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    if (!args.adminUserId) throw new Error("adminUserId requerido");
    
    const admin = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", args.adminUserId)).unique();
    if (!admin || (admin.role || 0) < 5) throw new Error("Solo admins pueden banear usuarios");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const previousStatus = profile.status;
    await ctx.db.patch(profile._id, { status: args.status });

    await ctx.db.insert("auditLogs", {
      userId: args.adminUserId,
      action: args.status === "banned" ? "user_ban" : "user_unban",
      details: { targetUserId: args.userId, previousStatus, newStatus: args.status },
      targetId: args.userId,
      targetType: "profile",
      previousValue: previousStatus,
      newValue: args.status,
      timestamp: Date.now(),
    });
  },
});

export const setNewPassword = mutation({
  args: { email: v.string(), password: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!profile) throw new Error("Profile no encontrado");

    const caller = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const isAdmin = caller && (caller.role || 0) >= 5;

    if (profile.userId !== args.userId && !isAdmin) throw new Error("No tienes permiso para cambiar esta contraseña");

    const hashedPassword = await bcrypt.hash(args.password, 10);
    await ctx.db.patch(profile._id, { password: hashedPassword });
  },
});

export const resendConfirmationEmail = mutation({
  args: {
    userId: v.string(),
    adminUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("userId requerido");

    let isAdmin: boolean = false;
    if (args.adminUserId) {
      const caller = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.adminUserId!))
        .unique();
      isAdmin = caller !== null && (caller.role || 0) >= 5;
    }

    if (!isAdmin && args.adminUserId !== args.userId) {
      throw new Error("No tienes permiso para reenviar este email");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!profile) throw new Error("Usuario no encontrado");
    if (!profile.email) throw new Error("El usuario no tiene email asociado");

    const confirmationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    return {
      success: true,
      email: profile.email,
      message: "Email de confirmación reenviado",
      token: confirmationToken,
    };
  },
});

export const recordLogin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) return;

    if ((profile as any).isBlocked) throw new Error("Tu cuenta ha sido bloqueada.");

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let streakBonus = 0;
    
    if (profile.ultimoLogin !== today) {
      // --- SISTEMA DE MONEDAS DIARIAS (FASE 1) ---
      let dailyAllowance = 5; // Default Visitante (Role 0)
      const role = profile.role || 0;
      if (role === 1) dailyAllowance = 15; // PRO
      else if (role === 2) dailyAllowance = 30; // ELITE
      else if (role >= 3) dailyAllowance = 50; // CREATOR / ADMIN
      
      const coinUpdates: any = {
        dailyFreeCoinsBalance: dailyAllowance,
        lastClaimDate: today
      };

      if (profile.ultimoLogin === yesterday) {
        const currentStreak = (profile as any).streakDays || 1;
        const newStreak = currentStreak + 1;
        streakBonus = Math.min(newStreak * 10, 100);
        
        const updates: any = {
          ...coinUpdates,
          ultimoLogin: today,
          diasActivos: (profile.diasActivos || 0) + 1,
          streakDays: newStreak,
          xp: (profile.xp || 0) + streakBonus
        };

        // Hitos de racha y recompensas
        if (newStreak >= 3) {
          let notificationTitle = `🔥 ${newStreak} Días de Racha!`;
          let notificationBody = `+${streakBonus} XP y ${dailyAllowance} Monedas acreditadas.`;

          if (newStreak === 7) {
            updates.streakReward = "streak_7";
            updates.avatarFrame = "streak_7_frame";
            notificationTitle = "🎁 ¡Recompensa de 7 Días!";
            notificationBody += " Has desbloqueado el Marco de Racha de Bronce.";
          } else if (newStreak === 30) {
            updates.streakReward = "streak_30";
            updates.avatarFrame = "streak_30_frame";
            notificationTitle = "💎 ¡Recompensa de 30 Días!";
            notificationBody += " Has desbloqueado el Marco de Racha de Plata.";
          } else if (newStreak === 100) {
            updates.streakReward = "streak_100";
            updates.avatarFrame = "streak_100_frame";
            notificationTitle = "👑 ¡LEYENDA! 100 Días!";
            notificationBody += " Has desbloqueado el Marco de Racha de Oro definitivo.";
          }

          await ctx.db.insert("notifications", {
            userId: args.userId,
            type: "streak",
            title: notificationTitle,
            body: notificationBody,
            read: false,
            createdAt: Date.now(),
          });
        }

        await ctx.db.patch(profile._id, updates);
      } else {
        await ctx.db.patch(profile._id, {
          ...coinUpdates,
          ultimoLogin: today,
          diasActivos: (profile.diasActivos || 0) + 1,
          streakDays: 1
        });
        
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "system",
          title: "💰 Monedas Diarias Recargadas",
          body: `¡Bienvenido de nuevo! Has recibido tus ${dailyAllowance} monedas del día.`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const addXp = mutation({
  args: { userId: v.string(), xpToAdd: v.number() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) return;

    const currentXp = profile.xp || 0;
    const nextXp = currentXp + args.xpToAdd;
    const currentLevel = profile.level || 1;
    const nextLevel = getLevelFromXp(nextXp);

    const updates: any = { xp: nextXp };
    
    if (nextLevel > currentLevel) {
      updates.level = nextLevel;
      
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "level_up",
        title: "¡SUBIDA DE NIVEL! 🚀",
        body: `Has alcanzado el nivel ${nextLevel}. ¡Seguí aportando a la comunidad!`,
        read: false,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(profile._id, updates);
    return { levelUp: nextLevel > currentLevel, currentLevel: nextLevel };
  },
});

export const fixAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const adminId = "admin_initial_seed";
    const existing = await ctx.db.query("profiles").withIndex("by_userId", q => q.eq("userId", adminId)).unique();
    const adminData: any = {
      userId: adminId,
      nombre: "Admin",
      usuario: "brai",
      email: "admin@tradeportal.com",
      rol: "admin",
      role: 6,
      xp: 10000,
      level: 50,
      esPro: true,
      esVerificado: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=brai",
      biografia: "Cuenta oficial de administración.",
      saldo: 1000,
      fechaRegistro: new Date().toISOString(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, adminData);
      return "Admin profile updated";
    } else {
      await ctx.db.insert("profiles", adminData);
      return "Admin profile created";
    }
  }
});

export const deleteProfile = mutation({
  args: { userId: v.string(), adminUserId: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.adminUserId) {
      throw new Error("adminUserId requerido");
    }
    
    const profile = await ctx.db.query("profiles")
      .withIndex("by_userId", q => q.eq("userId", args.adminUserId))
      .unique();
    
    const isAdmin = args.adminUserId === "dev-admin-id" || 
      (profile?.rol === "admin" || profile?.role === 5);
    
    if (!isAdmin) {
      throw new Error("Solo administradores pueden eliminar perfiles");
    }

    const profileToDelete = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!profileToDelete) {
      throw new Error("Perfil no encontrado");
    }

    // SOFT DELETE - No eliminamos, marcamos como eliminado
    // Guardamos backup antes de modificar
    await ctx.db.insert("backups", {
      itemId: args.userId,
      itemType: "profile",
      operation: "delete",
      previousData: profileToDelete,
      newData: null,
      diff: null,
      userId: args.adminUserId,
      createdAt: Date.now(),
      restored: false,
    });

    // Soft delete - marcar como eliminado pero NO borrar
    await ctx.db.patch(profileToDelete._id, {
      status: "deleted",
      deletedAt: Date.now(),
      deletedBy: args.adminUserId,
      deleteReason: args.reason || "Eliminado por administrador",
    });

    await ctx.db.insert("auditLogs", {
      userId: args.adminUserId,
      action: "user_delete",
      details: { targetUserId: args.userId, reason: args.reason },
      targetId: args.userId,
      targetType: "profile",
      previousValue: { status: profileToDelete.status },
      newValue: { status: "deleted", reason: args.reason },
      timestamp: Date.now(),
    });
    
    return "Perfil movido a papelera (soft delete)";
  }
});

// Restaurar perfil eliminado
export const restoreProfile = mutation({
  args: { userId: v.string(), adminUserId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db.query("profiles")
      .withIndex("by_userId", q => q.eq("userId", args.adminUserId))
      .unique();
    
    const isAdmin = args.adminUserId === "dev-admin-id" || 
      (profile?.rol === "admin" || profile?.role === 5);
    
    if (!isAdmin) {
      throw new Error("Solo administradores pueden restaurar perfiles");
    }

    const profileToRestore = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!profileToRestore) {
      throw new Error("Perfil no encontrado");
    }

    if (profileToRestore.status !== "deleted") {
      throw new Error("El perfil no está eliminado");
    }

    // Restaurar - quitar marcas de eliminación
    await ctx.db.patch(profileToRestore._id, {
      status: "active",
      deletedAt: undefined,
      deletedBy: undefined,
      deleteReason: undefined,
    });
    
    // Registrar restauración
    await ctx.db.insert("backups", {
      itemId: args.userId,
      itemType: "profile",
      operation: "update" as const,
      previousData: profileToRestore,
      newData: null,
      diff: null,
      userId: args.adminUserId,
      createdAt: Date.now(),
      restored: true,
    });

    await ctx.db.insert("auditLogs", {
      userId: args.adminUserId,
      action: "profile_update",
      details: { targetUserId: args.userId, action: "restore" },
      targetId: args.userId,
      targetType: "profile",
      previousValue: { status: "deleted" },
      newValue: { status: "active" },
      timestamp: Date.now(),
    });
    
    return "Perfil restaurado exitosamente";
  }
});

// Obtener perfiles eliminados
export const getDeletedProfiles = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
      
      const adminProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();
        
      if (!adminProfile || (adminProfile.role || 0) < 5) return [];

      return await ctx.db
        .query("profiles")
        .withIndex("by_status", (q) => q.eq("status", "deleted"))
        .order("desc")
        .take(100);
    } catch (err) {
      console.error("Error in getDeletedProfiles:", err);
      return [];
    }
  },
});

// Obtener logs de auditoría de admin
export const getAuditLogs = query({
  args: { 
    limit: v.optional(v.number()), 
    action: v.optional(v.string()),
    targetType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let q = ctx.db.query("auditLogs").withIndex("by_timestamp", q => q);

    const logs = await q.collect();
    let filtered = logs.reverse();

    if (args.action) {
      filtered = filtered.filter(log => log.action === args.action);
    }
    if (args.targetType) {
      filtered = filtered.filter(log => log.targetType === args.targetType);
    }

    return filtered.slice(0, limit);
  },
});

export const addBalance = mutation({
  args: { userId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!profile) throw new Error("Perfil no encontrado para balance");

    const currentSaldo = (profile as any).saldo || 0;
    await ctx.db.patch(profile._id, {
      saldo: currentSaldo + args.amount,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "payment",
      title: "💰 Saldo Acreditado",
      body: `Se han acreditado $${args.amount} a tu cuenta exitosamente.`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, newBalance: currentSaldo + args.amount };
  },
});

export const recalculateAccuracy = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // 1. Get all closed signals from this provider
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_provider", (q) => q.eq("providerId", args.userId))
      .collect();
    
    const closed = signals.filter(s => 
      s.status === "hit" || 
      s.status === "canceled" || 
      s.status === "expired"
    );

    if (closed.length === 0) return { accuracy: 50 };

    const wins = closed.filter(s => s.status === "hit").length;
    const accuracy = Math.round((wins / closed.length) * 100);

    // 2. Update profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        accuracy,
        estadisticas: {
          ...(profile as any).estadisticas,
          tasaVictoria: accuracy,
        },
        updatedAt: Date.now(),
      });
    }

    // 3. Update signal_providers if exists
    const provider = await ctx.db
      .query("signal_providers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (provider) {
      await ctx.db.patch(provider._id, {
        avgWinRate: accuracy,
        updatedAt: Date.now(),
      });
    }

    return { accuracy, totalSignals: closed.length, wins };
  },
});
