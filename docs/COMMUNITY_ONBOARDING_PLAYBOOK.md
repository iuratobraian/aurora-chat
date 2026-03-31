# Community Onboarding Playbook - TradePortal

## Overview

Sistema de activación rápida para comunidades nuevas en TradePortal. Guía al owner desde la creación hasta tener una comunidad activa con engagement.

## Objetivos

- **Reducir time-to-value**: De creación a comunidad activa en < 24h
- **Menos abandono**: Onboarding guiado con recompensas XP
- **Calidad consistente**: Templates y checklists para todos

## Flujo de Onboarding

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  PROFILE    │────▶│  CONTENT     │────▶│  MEMBERS    │────▶│ ACTIVE   │
│  Setup      │     │  Creation     │     │  Invitation │     │ Community│
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
     5 min              20 min              15 min               ongoing
```

## Pasos de Onboarding

### 1. Profile Setup (5 min, +50 XP)

- [ ] Nombre de comunidad
- [ ] Descripción (>50 caracteres)
- [ ] Cover image
- [ ] Visibilidad (public/unlisted/private)

### 2. Content Creation (20 min, +175 XP)

#### Welcome Post Template

```
👋 ¡Bienvenidos a {community_name}!

Somos una comunidad enfocada en {description}.

**¿Qué encontrarás aquí?**
- 📊 Análisis y señales
- 💬 Discusión entre miembros
- 📚 Contenido educativo
- 🤝 Networking con traders

**Reglas básicas:**
1. Respeto siempre
2. No spam ni promotions
3. Pregunta libre

¡Presentate en los comentarios! 

#Bienvenida #{hashtag}
```

#### Rules Post Template

```
📜 Reglas de {community_name}

Para mantener un espacio productivo:

1️⃣ **Respeto** - Trata a todos con dignidad
2️⃣ **No spam** - Ni links de afiliados ni promotions
3️⃣ **Calidad** - Prefiere información útil
4️⃣ **Señales** - Usa el formato oficial
5️⃣ **Dudas** - Pregunta en los threads correspondientes

⚠️ El incumplimiento puede resultar en expulsión.

¿Dudas? Comenta abajo 👇
```

### 3. Member Invitation (15 min, +150 XP)

- Invitar 5+ traders conocidos
- Compartir link de invitación
- DM a prospectos cualificados

### 4. Initial Engagement (30 min, +200 XP)

- Responder a todos los comentarios del welcome post
- Crear thread de presentación
- Daily engagement por 7 días

## Integraciones

### Telegram Bot
```typescript
// Configurar bot de Telegram para notificaciones
interface TelegramConfig {
  botToken: string;
  chatId: string;
  notifyOn: 'new_post' | 'new_member' | 'all';
}
```

### Discord Webhook
```typescript
interface DiscordConfig {
  webhookUrl: string;
  channel: string;
  events: ('post' | 'member' | 'signal')[];
}
```

## AI Assistant Setup

Opciones disponibles:

1. **Auto-reply**: Responde preguntas frecuentes
2. **Content suggestions**: Recomienda topics
3. **Moderation**: Detecta spam y contenido inappropriate
4. **Analytics**: Resume actividad semanal

## Métricas de Éxito

| Métrica | Target | Medición |
|---------|--------|----------|
| Time-to-first-post | < 1h | timestamp |
| Members invited | > 5 | count |
| Engagement 7d | > 10 comments | analytics |
| Retention 30d | > 50% | cohort |

## Scripts Disponibles

```typescript
// Scripts de onboarding
import { 
  generateWelcomeContent,
  generateRulesContent,
  getOnboardingSteps,
  createOnboardingProgress,
  completeStep,
  getOnboardingStats,
} from './communityOnboarding';
```

## Comandos

```bash
# Generar templates
node scripts/sales/communityOnboarding.ts
```

## Checklist de Setup

```
☐ Nombre de comunidad configurado
☐ Descripción completa (>50 chars)
☐ Cover image subida
☐ Visibilidad correcta
☐ Post de bienvenida publicado
☐ Post de reglas publicado
☐ Al menos 5 miembros invitados
☐ Engagement inicial (3+ comentarios)
☐ Integraciones configuradas (opcional)
☐ AI assistant activo (opcional)
```

## XP Rewards

| Step | XP | Total Acumulado |
|------|-----|-----------------|
| Profile Setup | 50 | 50 |
| Welcome Post | 100 | 150 |
| Rules Post | 75 | 225 |
| Invite Members | 150 | 375 |
| First Engagement | 200 | 575 |
| Integrations | 100 | 675 |
| AI Setup | 75 | 750 |

**Total onboarding**: 750 XP

## Timeline Recomendado

| Día | Acción |
|------|--------|
| Día 0 | Crear comunidad + Profile |
| Día 0 | Publicar Welcome + Rules |
| Día 1 | Invitar 5+ miembros |
| Día 1-3 | Engagement activo |
| Día 7 | Review y ajustes |
| Día 30 | Evaluación de retention |

## Fallos Comunes

### "No members join"
- **Causa**: Outreach insuficiente
- **Fix**: Invitar personalmente, compartir en otras comunidades

### "No engagement"
- **Causa**: Contenido genérico
- **Fix**: Posts específicos del nicho, preguntas abiertas

### "Members leave"
- **Causa**: Sin value claro
- **Fix**: Content calendar, señales exclusivas

## Herramientas

- Templates de posts (generados por IA)
- Invite link generator
- Analytics dashboard
- AI content suggestions
