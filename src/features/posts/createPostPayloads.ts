import type { Id } from "../../../convex/_generated/dataModel";

type MutationPostType = "text" | "image" | "link" | "poll" | "signal";
type LegacyPostType = "Compra" | "Venta" | "Neutral";

type CreatePostDraft = {
  titulo?: string;
  contenido?: string;
  imagenUrl?: string;
  categoria?: string;
  esAnuncio?: boolean;
  par?: string;
  tipo?: MutationPostType | LegacyPostType;
  datosGrafico?: number[];
  tradingViewUrl?: string;
  zonaOperativa?: unknown;
  tags?: string[];
  comentariosCerrados?: boolean;
  isSignal?: boolean;
  signalDetails?: unknown;
};

const VALID_MUTATION_TYPES = new Set<MutationPostType>(["text", "image", "link", "poll", "signal"]);

export function validateCreatePostDraft(draft: Pick<CreatePostDraft, "contenido">) {
  const contenido = draft.contenido?.trim() || "";
  if (!contenido) {
    return { valid: false as const, error: "El post está vacío" };
  }

  return { valid: true as const, contenido };
}

export function resolveCreatePostMutationType(
  draft: Pick<CreatePostDraft, "tipo" | "imagenUrl" | "isSignal">,
): MutationPostType {
  if (draft.isSignal) {
    return "signal";
  }

  if (draft.tipo && VALID_MUTATION_TYPES.has(draft.tipo as MutationPostType)) {
    return draft.tipo as MutationPostType;
  }

  if (draft.imagenUrl?.trim()) {
    return "image";
  }

  return "text";
}

export function buildGlobalPostPayload(draft: CreatePostDraft, userId: string) {
  const contenido = draft.contenido?.trim() || "";
  const payload = {
    userId,
    titulo: draft.titulo?.trim() || "",
    contenido,
    categoria: draft.categoria || "General",
    esAnuncio: draft.esAnuncio ?? false,
    tipo: resolveCreatePostMutationType(draft),
    ...(draft.imagenUrl ? { imagenUrl: draft.imagenUrl } : {}),
    ...(draft.par ? { par: draft.par } : {}),
    ...(draft.datosGrafico ? { datosGrafico: draft.datosGrafico } : {}),
    ...(draft.tradingViewUrl ? { tradingViewUrl: draft.tradingViewUrl } : {}),
    ...(draft.zonaOperativa ? { zonaOperativa: draft.zonaOperativa } : {}),
    ...(draft.tags ? { tags: draft.tags } : {}),
    ...(draft.comentariosCerrados !== undefined
      ? { comentariosCerrados: draft.comentariosCerrados }
      : {}),
    ...(draft.isSignal !== undefined ? { isSignal: draft.isSignal } : {}),
    ...(draft.signalDetails ? { signalDetails: draft.signalDetails } : {}),
  };

  return payload;
}

export function buildCommunityPostPayload(
  draft: CreatePostDraft,
  communityId: Id<"communities">,
  userId: string,
) {
  const contenido = draft.contenido?.trim() || "";

  return {
    communityId,
    userId,
    titulo: draft.titulo?.trim() || "",
    contenido,
    ...(draft.imagenUrl ? { imagenUrl: draft.imagenUrl } : {}),
    tipo: resolveCreatePostMutationType(draft),
    ...(draft.tags ? { tags: draft.tags } : {}),
  };
}

export function buildSubcommunityPostPayload(
  draft: CreatePostDraft,
  subcommunityId: Id<"subcommunities">,
  userId: string,
) {
  return {
    ...buildGlobalPostPayload(draft, userId),
    contextType: "subcommunity" as const,
    subcommunityId,
  };
}
