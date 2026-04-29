# ANÁLISIS KIMI: Reparación de Likes, XP y Follow

## Problemas Identificados

### 1. LIKES NO FUNCIONAN
**Backend**: `convex/communities.ts:likePost` (línea 657) existe y funciona
**Frontend**: PostCard.tsx debe llamar a la mutation correctamente
**Problema probable**: El frontend usa localStorage en lugar de Convex mutation

### 2. XP NO SE ENTREGA EN POSTS
**Backend**: `convex/lib/gamification.ts:addXpInternal` existe
**Problema**: `likePost` NO llama `addXpInternal` para el autor del post
**También**: `createPost` probablemente no da XP al crear

### 3. FOLLOW NO FUNCIONA
**Backend**: No existe mutation `toggleFollow` en Convex
**Frontend**: `PerfilView.tsx` usa `StorageService.toggleFollowUser` → localStorage
**Datos**: profiles tiene campos `seguidores` y `siguiendo` (arrays)

## Solución Requerida

### A. Seguir usuarios (más crítico)
1. Crear mutation `toggleFollow` en `convex/users.ts` o `convex/profiles.ts`
2. Actualizar `PerfilView.tsx` para usar `useMutation(api.users.toggleFollow)`
3. Migrar datos de localStorage a Convex

### B. XP en likes
1. Modificar `likePost` en `communities.ts` para:
   - Dar XP al que da like (action: "like")
   - Dar XP al autor del post cuando recibe like

### C. XP en crear posts
1. Modificar `createPost` en `communities.ts` para dar XP al autor

## Archivos a modificar
- `convex/communities.ts` - likePost + createPost XP
- `convex/users.ts` o `convex/profiles.ts` - nueva mutation toggleFollow
- `src/views/PerfilView.tsx` - cambiar StorageService → Convex
- `src/components/PostCard.tsx` - verificar like usa Convex
