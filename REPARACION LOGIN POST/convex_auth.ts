import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(), // ya viene hasheado desde el frontend con bcrypt
    nombre: v.string(),
    usuario: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsappOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Verificar que el email no exista
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // 2. Verificar usuario único
    const usernameBase = args.usuario
      ? args.usuario.toLowerCase().replace(/[^a-z0-9_]/g, "")
      : args.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");

    let username = usernameBase;
    let counter = 1;
    while (true) {
      const taken = await ctx.db
        .query("profiles")
        .withIndex("by_usuario", (q) => q.eq("usuario", username))
        .first();
      if (!taken) break;
      username = `${usernameBase}${counter++}`;
    }

    // 3. Contar usuarios para asignar número
    const count = await ctx.db.query("profiles").collect();
    const userNumber = count.length + 1;

    // 4. Crear perfil
    const now = Date.now();
    const profileId = await ctx.db.insert("profiles", {
      email: args.email.toLowerCase(),
      password: args.password,
      nombre: args.nombre,
      usuario: username,
      avatar: "",
      banner: "",
      esPro: false,
      esVerificado: false,
      rol: "FREE",
      role: 0,
      xp: 0,
      level: 1,
      biografia: "",
      instagram: "",
      seguidores: [],
      siguiendo: [],
      aportes: 0,
      accuracy: 0,
      reputation: 0,
      badges: [],
      estadisticas: {},
      saldo: 0,
      watchlist: [],
      watchedClasses: [],
      Medellas: [],
      progreso: {},
      fechaRegistro: now,
      diasActivos: 1,
      ultimoLogin: now,
      status: "active",
      referredBy: args.referralCode || null,
      streakDays: 0,
      isBlocked: false,
      avatarFrame: null,
      streakReward: null,
      weeklyXP: 0,
      monthlyXP: 0,
      userNumber,
      phone: args.phone || null,
      whatsappOptIn: args.whatsappOptIn || false,
    });

    // 5. Procesar referido si existe
    if (args.referralCode) {
      const referrer = await ctx.db
        .query("referralCodes")
        .withIndex("by_code", (q) => q.eq("code", args.referralCode!))
        .first();

      if (referrer && referrer.isActive) {
        await ctx.db.insert("referrals", {
          referrerId: referrer.userId,
          referredId: profileId,
          referralCode: args.referralCode,
          status: "completed",
          rewardType: "xp",
          referrerReward: referrer.rewardXp,
          referredReward: Math.floor(referrer.rewardXp / 2),
          referrerClaimed: false,
          referredClaimed: false,
          claimedAt: null,
          createdAt: now,
          completedAt: now,
        });

        // Actualizar uses del código
        await ctx.db.patch(referrer._id, {
          uses: referrer.uses + 1,
        });
      }
    }

    // 6. Devolver sesión
    return {
      success: true,
      user: {
        _id: profileId,
        email: args.email.toLowerCase(),
        nombre: args.nombre,
        usuario: username,
        rol: "FREE",
        role: 0,
        avatar: "",
        esPro: false,
        esVerificado: false,
      },
    };
  },
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(), // hash bcrypt del frontend
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (user.isBlocked) {
      throw new Error("ACCOUNT_BLOCKED");
    }

    if (user.status === "suspended") {
      throw new Error("ACCOUNT_SUSPENDED");
    }

    // Comparar password hasheado (el frontend envía el hash, Convex compara)
    if (user.password !== args.password) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Actualizar último login y días activos
    const now = Date.now();
    const lastLogin = user.ultimoLogin || 0;
    const oneDayMs = 86400000;
    const diasActivos =
      now - lastLogin > oneDayMs ? (user.diasActivos || 0) + 1 : user.diasActivos || 0;

    await ctx.db.patch(user._id, {
      ultimoLogin: now,
      diasActivos,
    });

    return {
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        nombre: user.nombre,
        usuario: user.usuario,
        avatar: user.avatar,
        banner: user.banner,
        rol: user.rol,
        role: user.role,
        esPro: user.esPro,
        esVerificado: user.esVerificado,
        xp: user.xp,
        level: user.level,
        saldo: user.saldo,
        badges: user.badges,
        biografia: user.biografia,
        seguidores: user.seguidores,
        siguiendo: user.siguiendo,
        userNumber: user.userNumber,
        avatarFrame: user.avatarFrame,
        streakDays: user.streakDays,
        phone: user.phone,
        whatsappOptIn: user.whatsappOptIn,
      },
    };
  },
});

// ─────────────────────────────────────────────
// GET PROFILE (para refrescar sesión)
// ─────────────────────────────────────────────
export const getProfile = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // No devolver password nunca
    const { password, ...safeUser } = user;
    return safeUser;
  },
});

// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────
export const updateProfile = mutation({
  args: {
    userId: v.id("profiles"),
    nombre: v.optional(v.string()),
    biografia: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    instagram: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsappOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Filtrar undefined
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(userId, clean);
    return { success: true };
  },
});

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────
export const changePassword = mutation({
  args: {
    userId: v.id("profiles"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    if (user.password !== args.currentPassword) {
      throw new Error("INVALID_CURRENT_PASSWORD");
    }

    await ctx.db.patch(args.userId, { password: args.newPassword });
    return { success: true };
  },
});

// ─────────────────────────────────────────────
// FOLLOW / UNFOLLOW
// ─────────────────────────────────────────────
export const toggleFollow = mutation({
  args: {
    followerId: v.id("profiles"),
    targetId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const follower = await ctx.db.get(args.followerId);
    const target = await ctx.db.get(args.targetId);
    if (!follower || !target) throw new Error("USER_NOT_FOUND");

    const isFollowing = follower.siguiendo?.includes(args.targetId) || false;

    if (isFollowing) {
      // Unfollow
      await ctx.db.patch(args.followerId, {
        siguiendo: (follower.siguiendo || []).filter((id) => id !== args.targetId),
      });
      await ctx.db.patch(args.targetId, {
        seguidores: (target.seguidores || []).filter((id) => id !== args.followerId),
      });
    } else {
      // Follow
      await ctx.db.patch(args.followerId, {
        siguiendo: [...(follower.siguiendo || []), args.targetId],
      });
      await ctx.db.patch(args.targetId, {
        seguidores: [...(target.seguidores || []), args.followerId],
      });

      // Notificación
      await ctx.db.insert("notifications", {
        userId: args.targetId,
        type: "follow",
        title: "Nuevo seguidor",
        body: `${follower.nombre} ahora te sigue`,
        data: { followerId: args.followerId },
        read: false,
        link: `/perfil/${follower.usuario}`,
        avatarUrl: follower.avatar,
        createdAt: Date.now(),
      });
    }

    return { success: true, following: !isFollowing };
  },
});
