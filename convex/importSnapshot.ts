import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const importProfile = mutation({
  args: {
    profileData: v.any(),
  },
  handler: async (ctx, args) => {
    const { profileData } = args;
    
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", profileData.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        nombre: profileData.nombre || "",
        usuario: profileData.usuario || "",
        email: profileData.email || "",
        avatar: profileData.avatar || "",
        banner: profileData.banner || "",
        esPro: profileData.esPro || false,
        esVerificado: profileData.esVerificado || false,
        rol: profileData.rol || "visitante",
        role: profileData.role || 0,
        xp: profileData.xp || 0,
        level: profileData.level || 1,
        biografia: profileData.biografia || "",
        instagram: profileData.instagram || "",
        seguidores: profileData.seguidores || [],
        siguiendo: profileData.siguiendo || [],
        aportes: profileData.aportes || 0,
        accuracy: profileData.accuracy || 0,
        reputation: profileData.reputation || 0,
        badges: profileData.badges || [],
        estadisticas: profileData.estadisticas || {},
        saldo: profileData.saldo || 0,
        watchlist: profileData.watchlist || [],
        watchedClasses: profileData.watchedClasses || [],
        Medellas: profileData.medallas || [],
        progreso: profileData.progreso || {},
        fechaRegistro: profileData.fechaRegistro || new Date().toISOString(),
        diasActivos: profileData.diasActivos || 0,
        ultimoLogin: profileData.ultimoLogin || "",
        status: profileData.status || "active",
        referredBy: profileData.referredBy || "",
        streakDays: profileData.streakDays || 0,
        isBlocked: profileData.isBlocked || false,
        avatarFrame: profileData.avatarFrame || "",
        streakReward: profileData.streakReward || "",
        weeklyXP: profileData.weeklyXP || 0,
        monthlyXP: profileData.monthlyXP || 0,
        userNumber: profileData.userNumber,
        phone: profileData.phone || "",
        whatsappOptIn: profileData.whatsappOptIn || false,
      });
      return { action: "updated", id: existing._id };
    } else {
      const id = await ctx.db.insert("profiles", {
        createdAt: profileData._creationTime || Date.now(),
        userId: profileData.userId,
        nombre: profileData.nombre || "",
        usuario: profileData.usuario || "",
        email: profileData.email || "",
        avatar: profileData.avatar || "",
        banner: profileData.banner || "",
        esPro: profileData.esPro || false,
        esVerificado: profileData.esVerificado || false,
        rol: profileData.rol || "visitante",
        role: profileData.role || 0,
        xp: profileData.xp || 0,
        level: profileData.level || 1,
        biografia: profileData.biografia || "",
        instagram: profileData.instagram || "",
        seguidores: profileData.seguidores || [],
        siguiendo: profileData.siguiendo || [],
        aportes: profileData.aportes || 0,
        accuracy: profileData.accuracy || 0,
        reputation: profileData.reputation || 0,
        badges: profileData.badges || [],
        estadisticas: profileData.estadisticas || {},
        saldo: profileData.saldo || 0,
        watchlist: profileData.watchlist || [],
        watchedClasses: profileData.watchedClasses || [],
        Medellas: profileData.medallas || [],
        progreso: profileData.progreso || {},
        fechaRegistro: profileData.fechaRegistro || new Date().toISOString(),
        diasActivos: profileData.diasActivos || 0,
        ultimoLogin: profileData.ultimoLogin || "",
        status: profileData.status || "active",
        referredBy: profileData.referredBy || "",
        streakDays: profileData.streakDays || 0,
        isBlocked: profileData.isBlocked || false,
        avatarFrame: profileData.avatarFrame || "",
        streakReward: profileData.streakReward || "",
        weeklyXP: profileData.weeklyXP || 0,
        monthlyXP: profileData.monthlyXP || 0,
        userNumber: profileData.userNumber,
        phone: profileData.phone || "",
        whatsappOptIn: profileData.whatsappOptIn || false,
      });
      return { action: "created", id };
    }
  },
});

export const importPost = mutation({
  args: {
    postData: v.any(),
  },
  handler: async (ctx, args) => {
    const { postData } = args;
    
    const id = await ctx.db.insert("posts", {
      userId: postData.userId || "",
      titulo: postData.titulo || "",
      par: postData.par || "",
      tipo: postData.tipo || "Post",
      contenido: postData.contenido || "",
      categoria: postData.categoria || "General",
      esAnuncio: postData.esAnuncio || false,
      datosGrafico: postData.datosGrafico || [],
      tradingViewUrl: postData.tradingViewUrl || "",
      imagenUrl: postData.imagenUrl || "",
      zonaOperativa: postData.zonaOperativa || {},
      likes: postData.likes || [],
      comentarios: postData.comentarios || [],
      tags: postData.tags || [],
      reputationSnapshot: postData.reputationSnapshot || 0,
      badgesSnapshot: postData.badgesSnapshot || [],
      ratings: postData.ratings || [],
      encuesta: postData.encuesta || null,
      compartidos: postData.compartidos || 0,
      comentariosCerrados: postData.comentariosCerrados || false,
      isAiAgent: postData.isAiAgent || false,
      isSignal: postData.isSignal || false,
      signalDetails: postData.signalDetails || null,
      sentiment: postData.sentiment || "",
      subcommunityId: postData.subcommunityId || "",
      createdAt: postData.createdAt || Date.now(),
      ultimaInteraccion: postData.ultimaInteraccion || Date.now(),
      status: postData.status || "active",
      avatarFrame: postData.avatarFrame || "",
      puntos: postData.puntos || 0,
      tokenTipsReceived: postData.tokenTipsReceived || 0,
      tokenTipsCount: postData.tokenTipsCount || 0,
      monthlyTokenTips: postData.monthlyTokenTips || 0,
      monthKey: postData.monthKey || "",
      isTopMonthly: postData.isTopMonthly || false,
    });
    return { action: "created", id };
  },
});

export const importAd = mutation({
  args: {
    adData: v.any(),
  },
  handler: async (ctx, args) => {
    const { adData } = args;
    
    const id = await ctx.db.insert("ads", {
      titulo: adData.titulo || "",
      descripcion: adData.descripcion || "",
      imagenUrl: adData.imagenUrl || "",
      link: adData.link || "",
      sector: adData.sector || "general",
      activo: adData.activo !== false,
      videoUrl: adData.videoUrl || "",
      subtitle: adData.subtitle || "",
      extra: adData.extra || "",
      contenido: adData.contenido || "",
    });
    return { action: "created", id };
  },
});

export const importNotification = mutation({
  args: {
    notifData: v.any(),
  },
  handler: async (ctx, args) => {
    const { notifData } = args;
    
    const id = await ctx.db.insert("notifications", {
      userId: notifData.userId || "",
      type: notifData.type || "system",
      title: notifData.title || notifData.titulo || "",
      body: notifData.body || notifData.mensaje || "",
      read: notifData.read || notifData.leida || false,
      link: notifData.link || "",
      data: notifData.data || {},
      avatarUrl: notifData.avatarUrl || "",
      createdAt: notifData.createdAt || Date.now(),
    });
    return { action: "created", id };
  },
});

export const importChat = mutation({
  args: {
    chatData: v.any(),
  },
  handler: async (ctx, args) => {
    const { chatData } = args;
    
    const id = await ctx.db.insert("chat", {
      userId: chatData.userId || "",
      nombre: chatData.nombre || "Usuario",
      avatar: chatData.avatar || "",
      texto: chatData.texto || chatData.mensaje || "",
      imagenUrl: chatData.imagenUrl || "",
      isAi: chatData.isAi || false,
      flagged: chatData.flagged || false,
      flaggedWords: chatData.flaggedWords || [],
      channelId: chatData.channelId || "general",
      createdAt: chatData.createdAt || Date.now(),
    });
    return { action: "created", id };
  },
});

export const importQA = mutation({
  args: {
    qaData: v.any(),
  },
  handler: async (ctx, args) => {
    const { qaData } = args;
    
    const id = await ctx.db.insert("qa", {
      userId: qaData.userId || "system",
      pregunta: qaData.pregunta || "",
      respuesta: qaData.respuesta || "",
      respondida: qaData.respondida || false,
      respondidaAt: qaData.respondidaAt || 0,
      isAnonymous: qaData.isAnonymous || false,
      createdAt: qaData.createdAt || Date.now(),
    });
    return { action: "created", id };
  },
});

export const importVideo = mutation({
  args: {
    videoData: v.any(),
  },
  handler: async (ctx, args) => {
    const { videoData } = args;
    
    const id = await ctx.db.insert("videos", {
      tipo: videoData.tipo || "video",
      titulo: videoData.titulo || "",
      autor: videoData.autor || "Sistema",
      descripcion: videoData.descripcion || "",
      thumbnail: videoData.thumbnail || "",
      embedUrl: videoData.embedUrl || videoData.url || "",
      duracion: videoData.duracion || "0:00",
      categoria: videoData.categoria || "general",
      createdAt: videoData.createdAt || Date.now(),
    });
    return { action: "created", id };
  },
});

export const importGlobalConfig = mutation({
  args: {
    configData: v.any(),
  },
  handler: async (ctx, args) => {
    const { configData } = args;
    
    const existing = await ctx.db
      .query("global_config")
      .withIndex("by_key", (q) => q.eq("key", configData.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: configData.value,
      });
      return { action: "updated", id: existing._id };
    } else {
      const id = await ctx.db.insert("global_config", {
        key: configData.key || "",
        value: configData.value || {},
      });
      return { action: "created", id };
    }
  },
});
