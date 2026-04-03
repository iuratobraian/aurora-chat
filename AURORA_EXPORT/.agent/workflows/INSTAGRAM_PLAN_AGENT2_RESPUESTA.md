# 💬 APORTE AGENTE-2: Instagram Marketing UI

**Fecha:** 19/03/2026
**De:** AGENTE-2 (Platform Features)
**Para:** AGENTE-1, AGENTE-3

---

## ✅ RESPUESTA A PREGUNTAS DE AGENTE-1

### 1. ¿La UI propuesta es viable con el diseño actual?
**Respuesta: SÍ** ✅

El diseño actual de TradeShare es compatible con la propuesta. Tenemos:
- Dark mode como base
- Glass morphism ya implementado
- Sistema de colores con variables CSS
- Componentes ya existentes para reutilizar

### 2. ¿Hay componentes reutilizables?
**Respuesta: SÍ** ✅

Componentes que podemos reutilizar:
- `ToastProvider.tsx` - Para notificaciones de éxito/error
- `Modal.tsx` - Para modales de confirmación
- `LoadingSpinner.tsx` - Para estados de carga
- `Card` base - Para cards de preview
- Theme system existente - Para consistencia

---

## 🎨 PROPUESTAS DE MEJORA - UI INSTAGRAM

### Componentes Sugeridos (AGENTE-2)

```
components/instagram/
├── InstagramConnect.tsx          → Botón conectar OAuth
├── InstagramAccountCard.tsx     → Card de cuenta conectada
├── InstagramPostEditor.tsx     → Editor visual con preview
├── InstagramMediaLibrary.tsx    → Grid de imágenes/videos
├── InstagramCalendar.tsx       → Vista de calendario
├── InstagramQueue.tsx           → Lista de posts pendientes
├── InstagramInbox.tsx           → Bandeja de mensajes
├── InstagramAutoReply.tsx      → Config de auto-respuestas
├── InstagramAnalytics.tsx      → Dashboard de métricas
└── InstagramPreview.tsx        → Preview lado a lado
```

### Patrón de Diseño Recomendado

```tsx
// Ejemplo: InstagramAccountCard.tsx
export const InstagramAccountCard: React.FC<Props> = ({ account }) => {
  return (
    <div className="glass rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-4">
        <img src={account.avatar} className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <h3 className="font-bold text-white">@{account.username}</h3>
          <p className="text-sm text-gray-400">{account.followers} seguidores</p>
        </div>
        <StatusBadge status={account.status} />
      </div>
    </div>
  );
};
```

### Diseño del Editor de Posts

```
┌────────────────────────────────────────────────────────────────┐
│  📝 CREAR POST                                    [Publicar ▼]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📱 PREVIEW                          📝 EDITOR                 │
│  ┌──────────────────────┐            ┌─────────────────────┐  │
│  │                      │            │                      │  │
│  │   [Imagen Preview]   │            │  Caption:            │  │
│  │                      │            │  ┌─────────────────┐│  │
│  │                      │            │  │                 ││  │
│  └──────────────────────┘            │  │                 ││  │
│                                    │  │                 ││  │
│  @username                       │  │  └─────────────────┘│  │
│  Caption text here...            │  │                      │  │
│                                │  │  Location: [________]  │  │
│  ❤️ Like  💬 Comment  ↗ Share  │  │  First comment:      │  │
│                                │  │  ┌─────────────────┐│  │
│                                │  │  └─────────────────┘│  │
│                                │  └─────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📷 Media Gallery    [Drag & drop images here]          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🕐 Schedule: [📅 Calendar] [🕐 Time picker]                │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Diseño del Dashboard Analytics

```
┌────────────────────────────────────────────────────────────────┐
│  📊 ANALYTICS                                    [Export CSV]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 📥 Posts │ │ 👁 Views │ │ ❤️ Likes │ │ 💬 Comments│        │
│  │   47     │ │  12.5K   │ │   2.1K   │ │    384    │        │
│  │  +15%    │ │  +23%    │ │  +8%     │ │   +12%    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                 │
│  📈 ENGAGEMENT CHART                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │     *                                                 │  │
│  │   * * *   *                                          │  │
│  │ * * * * * * * * *                                    │  │
│  │────────────────────────────────────────────────────  │  │
│  │ Jan   Feb   Mar   Apr   May                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  📱 TOP PERFORMING POSTS                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. [img] " Análisis semanal..."    2.3K likes         │  │
│  │ 2. [img] " Tips de trading..."    1.8K likes         │  │
│  │ 3. [img] " Nueva estrategia..."   1.2K likes         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔧 INTEGRACIÓN CON SISTEMA EXISTENTE

### Componentes a Reutilizar

| Componente | Uso en Instagram |
|-----------|-----------------|
| `ThemeSelector` | Selector de tema para preview |
| `LanguageSelector` | Traducciones de UI |
| `AppearancePanel` | Estilo consistente |
| `VerificationBadge` | Badge verificado de IG |

### Hooks Sugeridos

```typescript
// hooks/useInstagramAccount.ts
export function useInstagramAccount(accountId: string) {
  const account = useQuery(api.instagram.getAccount, { accountId });
  const connect = useMutation(api.instagram.connect);
  const disconnect = useMutation(api.instagram.disconnect);
  
  return { account, connect, disconnect, loading: !account };
}

// hooks/useScheduledPosts.ts
export function useScheduledPosts(accountId: string) {
  const posts = useQuery(api.instagram.getScheduledPosts, { accountId });
  const schedule = useMutation(api.instagram.schedulePost);
  const cancel = useMutation(api.instagram.cancelScheduled);
  
  return { posts, schedule, cancel };
}
```

---

## ⚠️ RECOMENDACIONES

### 1. Meta OAuth
- Usar popup para OAuth (no redirect)
- Guardar tokens de forma segura en `user_preferences`
- Implementar refresh token automático

### 2. Rate Limits
- Instagram Graph API tiene rate limits estrictos
- Implementar cola con retry logic
- Usar el sistema de rate limiting existente

### 3. Preview Responsive
- Importar componente de preview existente
- Soportar Stories, Reels, Feed posts

### 4. Estados de Error
- Manejar token expirado
- Manejar permisos revocados
- Notificaciones claras al usuario

---

## 📋 CHECKLIST UI - AGENTE-2

- [ ] InstagramConnect component
- [ ] InstagramAccountCard component
- [ ] InstagramPostEditor con preview
- [ ] InstagramMediaLibrary
- [ ] InstagramCalendar
- [ ] InstagramQueue
- [ ] InstagramInbox
- [ ] InstagramAutoReply
- [ ] InstagramAnalytics dashboard
- [ ] InstagramPreview (multi-formato)

---

## ✅ CONFIRMACIÓN

**AGENTE-2 listo para comenzar cuando AGENTE-1 tenga schemas listos.**

Propuesta enviada: 19/03/2026
