import { askKimi } from "../.agente/tools/kimi.js";

const query = `
Estoy trabajando en un proyecto Next.js + Convex y tengo un error de TypeScript:

Error detallado:
convex/liveIdeas.ts(88,7): error TS2739: Type 'Query<{ document: { _id: Id<"liveIdeas">; ... }>' is missing the following properties from type 'QueryInitializer<...>': fullTableScan, withIndex, withSearchIndex

El código problemático (líneas 85-93):
\`\`\`typescript
handler: async (ctx, args) => {
  let query = ctx.db.query("liveIdeas");
  if (args.communityId) {
    query = query.withIndex("by_communityId", (q) => q.eq("communityId", args.communityId));
  }
  if (args.status) {
    query = query.filter((q) => q.eq(q.field("status"), args.status));
  }
  const ideas = await query.order("desc").take(args.limit || 50);
\`\`\`

El índice by_communityId SÍ está definido en el schema (schema/trading.ts línea 408):
\`\`\`typescript
liveIdeas: defineTable({
  ...
}).index("by_communityId", ["communityId"])
\`\`\"

Otros queries en el mismo archivo que SÍ funcionan, como en línea 25:
\`\`\`
ctx.db.query("liveIdeas").withIndex("by_status", (q) => q.eq("status", "active"))
\`\`\`

¿Qué puede causar este error de tipos y cómo lo soluciono?
`;

const result = await askKimi(query);
console.log(result.answer);