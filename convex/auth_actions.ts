import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import bcrypt from "bcryptjs";

export const validateLoginAction = action({
  args: { identifier: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<any> => {
    const identifier = args.identifier.trim().toLowerCase();
    
    // Actions can't query DB directly, we must use a query
    const profile = await ctx.runQuery(api.profiles.getProfileForAuth, { identifier });
    
    if (!profile) return { success: false, error: "Usuario no encontrado" };
    if ((profile as any).isBlocked) return { success: false, error: "Cuenta bloqueada" };
    
    if (!(profile as any).password) {
       return { success: false, error: "Esta cuenta requiere inicio de sesión con Google" };
    }

    const match = await bcrypt.compare(args.password, (profile as any).password);
    
    // Legacy plaintext fallback (if needed, though match should handle it if hashed)
    if (!match && args.password === (profile as any).password) {
        const { password: _, ...safeProfile } = profile as any;
        return { success: true, user: safeProfile };
    }

    if (match) {
      const { password: _, ...safeProfile } = profile as any;
      return { success: true, user: safeProfile };
    }

    return { success: false, error: "Contraseña incorrecta" };
  },
});

export const registerAction = action({
  args: {
    nombre: v.string(),
    usuario: v.string(),
    email: v.string(),
    password: v.string(),
    avatar: v.optional(v.string()),
    referredBy: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const hashedPassword = await bcrypt.hash(args.password, 10);
    
    // Generate a unique ID (Convex doesn't have internal ID generation in actions that's like ctx.db.insert)
    // But we can just use a random one or let the mutation handle it (though mutation needs userId from Clerk/Auth usually)
    // Here we are using internal manual auth, so we generate a userId
    const userId = "user_" + Math.random().toString(36).substring(2, 11);
    
    const result = await ctx.runMutation(internal.profiles.createProfileInternal, {
      userId,
      nombre: args.nombre,
      usuario: args.usuario.toLowerCase(),
      email: args.email.toLowerCase(),
      password: hashedPassword,
      avatar: args.avatar,
      referredBy: args.referredBy,
    });
    
    return result;
  }
});

export const updatePasswordAction = action({
  args: {
    userId: v.string(),
    email: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const hashedPassword = await bcrypt.hash(args.newPassword, 10);
    await ctx.runMutation(internal.profiles.updatePasswordInternal, {
      userId: args.userId,
      email: args.email,
      hashedPassword,
    });
    return { success: true };
  }
});
