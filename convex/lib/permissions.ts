import { QueryCtx, MutationCtx } from "../_generated/server";

export enum Role {
  FREE = 0,
  PRO = 1,
  ELITE = 2,
  CREATOR = 3,
  MOD = 4,
  ADMIN = 5,
  SUPERADMIN = 6,
}

export type Action =
  | "post:create"
  | "post:edit"
  | "post:delete"
  | "post:moderate"
  | "comment:create"
  | "comment:delete"
  | "user:ban"
  | "user:promote"
  | "config:edit"
  | "community:create"
  | "community:moderate"
  | "resource:create"
  | "resource:premium";

export const RolePermissions: Record<Role, Action[]> = {
  [Role.FREE]: [
    "post:create",
    "comment:create",
  ],
  [Role.PRO]: [
    "post:create",
    "post:edit",
    "comment:create",
    "resource:create",
    "resource:premium",
  ],
  [Role.ELITE]: [
    "post:create",
    "post:edit",
    "comment:create",
    "resource:create",
    "resource:premium",
  ],
  [Role.CREATOR]: [
    "post:create",
    "post:edit",
    "comment:create",
    "resource:create",
    "resource:premium",
    "community:create",
  ],
  [Role.MOD]: [
    "post:create",
    "post:edit",
    "post:delete",
    "post:moderate",
    "comment:create",
    "comment:delete",
    "user:ban",
    "resource:create",
    "resource:premium",
    "community:create",
    "community:moderate",
  ],
  [Role.ADMIN]: [
    "post:create",
    "post:edit",
    "post:delete",
    "post:moderate",
    "comment:create",
    "comment:delete",
    "user:ban",
    "user:promote",
    "config:edit",
    "resource:create",
    "resource:premium",
    "community:create",
    "community:moderate",
  ],
  [Role.SUPERADMIN]: [
    "post:create",
    "post:edit",
    "post:delete",
    "post:moderate",
    "comment:create",
    "comment:delete",
    "user:ban",
    "user:promote",
    "config:edit",
    "resource:create",
    "resource:premium",
    "community:create",
    "community:moderate",
  ],
};

export function can(role: number, action: Action): boolean {
  const permissions = RolePermissions[role as Role];
  if (!permissions) return false;
  return permissions.includes(action);
}

export async function getUserRole(ctx: QueryCtx | MutationCtx, userId: string): Promise<number> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", q => q.eq("userId", userId))
    .unique();
  return profile?.role ?? Role.FREE;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  requiredRole: Role
): Promise<boolean> {
  const userRole = await getUserRole(ctx, userId);
  return userRole >= requiredRole;
}

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  while (getXpForLevel(level) <= xp) {
    level++;
  }
  return level - 1;
}

export function calculateXpGain(action: "post" | "comment" | "like" | "follower" | "chat_message"): number {
  const gains: Record<string, number> = {
    post: 50,
    comment: 10,
    chat_message: 2,
    like: 2,
    follower: 25,
  };
  return gains[action] ?? 5;
}
