import { internalMutation } from "./_generated/server";

export const seedSubscriptionPlans = internalMutation({
  args: {},
  handler: async (ctx: any) => {
    const plans = [
      {
        name: "Básico",
        description: "Acceso a señales básicas y 2 comunidades",
        price: 2990,
        currency: "ARS",
        interval: "month" as const,
        features: ["Señales básicas", "2 comunidades", "Soporte estándar"],
        isActive: true,
        maxCommunities: 2,
        maxSignals: 50,
        prioritySupport: false,
        sortOrder: 1,
      },
      {
        name: "Pro",
        description: "Acceso completo a señales y 5 comunidades",
        price: 5990,
        currency: "ARS",
        interval: "month" as const,
        features: ["Señales premium", "5 comunidades", "Análisis avanzado", "Soporte prioritario"],
        isActive: true,
        maxCommunities: 5,
        maxSignals: 200,
        prioritySupport: true,
        sortOrder: 2,
      },
      {
        name: "Elite",
        description: "Acceso ilimitado a todo el ecosistema",
        price: 9990,
        currency: "ARS",
        interval: "month" as const,
        features: ["Todo ilimitado", "Comunidades privadas", "1-on-1 con expertos", "API access"],
        isActive: true,
        maxCommunities: 999,
        maxSignals: 9999,
        prioritySupport: true,
        sortOrder: 3,
      },
      {
        name: "Anual Básico",
        description: "Plan básico con 20% de descuento anual",
        price: 28704,
        currency: "ARS",
        interval: "year" as const,
        features: ["Señales básicas", "2 comunidades", "Soporte estándar", "20% descuento"],
        isActive: true,
        maxCommunities: 2,
        maxSignals: 50,
        prioritySupport: false,
        sortOrder: 4,
      },
      {
        name: "Anual Pro",
        description: "Plan Pro con 25% de descuento anual",
        price: 53910,
        currency: "ARS",
        interval: "year" as const,
        features: ["Señales premium", "5 comunidades", "Análisis avanzado", "25% descuento"],
        isActive: true,
        maxCommunities: 5,
        maxSignals: 200,
        prioritySupport: true,
        sortOrder: 5,
      },
      {
        name: "Anual Elite",
        description: "Plan Elite con 30% de descuento anual",
        price: 83916,
        currency: "ARS",
        interval: "year" as const,
        features: ["Todo ilimitado", "Comunidades privadas", "1-on-1", "API access", "30% descuento"],
        isActive: true,
        maxCommunities: 999,
        maxSignals: 9999,
        prioritySupport: true,
        sortOrder: 6,
      },
    ];

    for (const plan of plans) {
      await ctx.db.insert("subscriptionPlans", plan);
    }

    return { count: plans.length };
  },
});
