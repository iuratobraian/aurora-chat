# 🎯 AURORA - Prompt de Onboarding y UI

> Usar para: registration flows, experiencia de usuario, onboarding, perfiles públicos

## Onboarding Patterns

### Experience Selector
```typescript
// Guardar nivel de experiencia post-registro
const updateProfile = useMutation(api.users.updateProfile);
await updateProfile({
  experienceLevel: "beginner" | "advanced",
  role: "trader" | "creator" | "investor"
});
```

### Perfil Público
```typescript
// CreatorView debe ser landing pública real
// NO localStorage - siempre Convex
const creatorProfile = useQuery(api.users.getPublicProfile, { userId });
```

## UI Patterns

### Glassmorphism
```typescript
// Premium dark theme
<div className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl">
```

### Navigation
- ✅ NO floating AI icons
- ✅ NO toasts de "en desarrollo"
- ✅ Bottom controls consolidados
- ✅ Pricing debajo de Top Communities

### Empty States
```typescript
// Siempre mostrar algo significativo
{users.length === 0 ? (
  <EmptyState 
    title="No hay miembros" 
    description="Invita a tu primera comunidad"
    action={{ label: "Invitar", onClick: handleInvite }}
  />
) : (
  <UserList users={users} />
)}
```

## Checklist Onboarding

- [ ] ExperienceSelector envía a Convex
- [ ] Perfil público viene de Convex (no localStorage)
- [ ] UI sin mensajes "en desarrollo"
- [ ] Glassmorphism consistente
- [ ] Navigation sin floats

## Errores Comunes

| Error | Solución |
|-------|----------|
| Perfil con stale data | Usar useQuery de Convex |
| Onboarding no persiste | Mutation updateProfile |
| UI con placeholders | Crear EmptyState significativo |
| Glassmorphism inconsistente | Usar variables CSS del design system |
