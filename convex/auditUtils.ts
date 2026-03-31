import { MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * UTILIDADES DE AUDITORÍA ROBUSTA
 * 
 * Este módulo garantiza que NUNCA se pierda información:
 * - Soft delete en lugar de eliminación permanente
 * - Backups automáticos antes de cualquier eliminación
 * - Historial de ediciones
 * - Recuperación de datos eliminados
 */

// Tipos de operaciones auditables
export type AuditOperation = "create" | "update" | "delete" | "restore";
export type ItemType = "post" | "profile" | "community" | "comment";

/**
 * Crea un registro de auditoría antes de una eliminación
 */
export async function createAuditLog(
  ctx: MutationCtx,
  itemType: ItemType,
  itemId: string,
  operation: AuditOperation,
  userId: string,
  previousData?: any,
  reason?: string
) {
  try {
    await ctx.db.insert("backups", {
      itemId,
      itemType,
      operation: operation as "create" | "update" | "delete",
      previousData,
      newData: null,
      diff: null,
      userId,
      createdAt: Date.now(),
      restored: false,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

/**
 * Realiza un soft delete seguro
 * Guarda el estado original antes de marcar como eliminado
 */
export async function safeSoftDelete(
  ctx: MutationCtx,
  tableName: string,
  itemId: Id<any>,
  userId: string,
  reason?: string
) {
  const item = await ctx.db.get(itemId);
  if (!item) throw new Error("Item no encontrado");

  await createAuditLog(
    ctx,
    tableName as ItemType,
    itemId.toString(),
    "delete",
    userId,
    item,
    reason
  );

  await ctx.db.patch(itemId, {
    deletedAt: Date.now(),
    deletedBy: userId,
    deleteReason: reason || "Eliminado por usuario",
    status: "deleted",
  } as any);

  return item;
}

/**
 * Recupera un item marcado como eliminado
 */
export async function restoreSoftDelete(
  ctx: MutationCtx,
  tableName: string,
  itemId: Id<any>
) {
  const item = await ctx.db.get(itemId);
  if (!item) throw new Error("Item no encontrado");

  if (!item.deletedAt) throw new Error("El item no está eliminado");

  await ctx.db.patch(itemId, {
    deletedAt: undefined,
    deletedBy: undefined,
    deleteReason: undefined,
    status: "active",
  } as any);

  await createAuditLog(
    ctx,
    tableName as ItemType,
    itemId.toString(),
    "restore",
    "system",
    item
  );
}

/**
 * Registra una edición en el historial
 */
export async function recordEdit(
  ctx: MutationCtx,
  tableName: string,
  itemId: Id<any>,
  previousData: any,
  newData: any,
  userId: string
) {
  const editEntry = {
    timestamp: Date.now(),
    userId,
    previousData,
    newData,
    changes: Object.keys(newData).filter((k: string) => previousData[k] !== newData[k]),
  };

  const item = await ctx.db.get(itemId);
  const editHistory = item?.editHistory || [];

  await ctx.db.patch(itemId, {
    editHistory: [...editHistory, editEntry],
    updatedAt: Date.now(),
  } as any);
}

/**
 * Obtiene el historial de auditoria de un item
 */
export async function getAuditHistory(
  ctx: QueryCtx,
  itemType: ItemType,
  itemId: string
) {
  return await ctx.db
    .query("backups")
    .withIndex("by_item", (q: any) => 
      q.eq("itemType", itemType).eq("itemId", itemId)
    )
    .order("desc")
    .collect();
}

/**
 * Obtiene todos los items eliminados de una tabla
 */
export async function getDeletedItems(
  ctx: QueryCtx,
  tableName: string
) {
  return await ctx.db
    .query(tableName as any)
    .withIndex("by_deletedAt", (q: any) => q.exists("deletedAt"))
    .collect();
}
