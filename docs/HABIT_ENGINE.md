# Habit Engine - TradePortal

## Overview

Sistema de tracking de hábitos y retorno diario para usuarios de TradePortal. Incentiva engagement diario a través de streaks, metas y XP.

## Objetivos

- **Retorno diario**: Motivar usuarios a volver cada día
- **Engagement**: Recompensar acciones valiosas (posts, comentarios, señales)
- **Streaks**: Crear "loss aversion" con rachas que se pierden
- **XP gamification**: Sistema de puntos que se acumula

## Métricas Principales

### Streak
```typescript
interface StreakData {
  currentStreak: number;    // Días consecutivos
  longestStreak: number;      // Mejor racha
  lastActiveDate: string;    // YYYY-MM-DD
  isActiveToday: boolean;     // Ya activity hoy?
  streakStartDate: string;    // Inicio de racha actual
}
```

### Metrics
```typescript
interface HabitMetrics {
  dailyReturnRate: number;    // % días activos (30d)
  avgSessionDuration: number;   // Minutos promedio
  avgDailyActions: number;    // Acciones por día
  topActiveDays: string[];    // Días favoritos
  weeklyConsistency: number;   // % días activos (7d)
  monthlyConsistency: number;  // % días activos (30d)
}
```

## Metas Diarias

5 metas que se resetean cada día:

| Meta | Target | XP Reward |
|------|--------|-----------|
| Iniciar sesión | 1 vez | 10 |
| Crear post | 1 post | 50 |
| Comentar | 1 comentario | 25 |
| Ver señales | 3 señales | 30 |
| Interacciones | 5 total | 40 |

**Total diario disponible**: 155 XP

## Hooks

### useHabitTracker

```tsx
import { useHabitTracker } from '../hooks';

function Dashboard() {
  const {
    streak,
    metrics,
    goals,
    pendingGoals,
    pendingXp,
    streakMessage,
    recordLogin,
    recordPostCreated,
    recordComment,
    recordSignalView,
  } = useHabitTracker({ userId });

  // En login
  useEffect(() => { recordLogin(); }, []);

  // En acciones
  const handlePost = async () => {
    await createPost();
    recordPostCreated();
  };

  return (
    <DailyStreakCard
      streak={streak}
      goals={goals}
      metrics={metrics}
      pendingXp={pendingXp}
      streakMessage={streakMessage}
    />
  );
}
```

### useEngagementTracker

```tsx
import { useEngagementTracker } from '../hooks';

function Feed() {
  const { timeOnPage, scrollDepth } = useEngagementTracker({
    userId,
    trackTimeOnPage: true,
    trackScrollDepth: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      recordTimeSpent(Math.floor(timeOnPage / 60));
    }, 60000);

    return () => clearInterval(interval);
  }, [timeOnPage]);
}
```

## Componentes

### DailyStreakCard

Muestra el estado actual del usuario:

```tsx
<DailyStreakCard
  streak={streak}
  goals={goals}
  metrics={metrics}
  pendingXp={pendingXp}
  streakMessage={streakMessage}
  onGoalClick={(goal) => navigateToGoal(goal)}
/>
```

**Features:**
- Gradiente visual naranja/rojo
- Días de streak con llama
- Grid de métricas (retorno, sesión, semanal)
- Barra de progreso de metas
- Lista de metas con checkbox
- Mejor racha histórica

## Servicio (HabitService)

```typescript
// Tracking
HabitService.recordLogin(userId)
HabitService.recordPostCreated(userId)
HabitService.recordComment(userId)
HabitService.recordSignalView(userId)
HabitService.recordTimeSpent(userId, minutes)

// Consultas
HabitService.getHabitProfile(userId)
HabitService.getStreakData(userId)
HabitService.getGoals()
HabitService.getCompletedGoalsToday()
HabitService.getPendingGoalsToday()
HabitService.getXpFromCompletedGoals()

// Utilidades
HabitService.getStreakMessage(streak)
HabitService.clearProfile(userId)
```

## Gamification

### XP Rewards

| Acción | XP |
|--------|-----|
| Login diario | 10 |
| Crear post | 50 |
| Comentar | 25 |
| Ver señal | 10 |
| Complete streak | 100 |
| Meta completada | variable |

### Streak Rewards

| Días | Bonus |
|------|-------|
| 3 | +50 XP |
| 7 | +100 XP |
| 14 | +200 XP |
| 30 | +500 XP |

## Algoritmo de Streak

```
1. Si no activity hoy ni ayer → streak = 0
2. Si activity hoy o ayer:
   - streak = 1
   - Recorrer días hacia atrás
   - Si día anterior existe y es连续 → streak++
3. longestStreak = max(longestStreak, currentStreak)
```

## Integración con Onboarding

```tsx
function OnboardingSuccess() {
  const { recordLogin, pendingGoals } = useHabitTracker({ userId });

  useEffect(() => {
    recordLogin();
  }, []);

  return (
    <div>
      <h2>¡Bienvenido!</h2>
      <p>{pendingGoals[0]?.name} - tu primera meta de hoy</p>
    </div>
  );
}
```

## Integración con Feed

```tsx
function PostActions({ postId }) {
  const { recordComment } = useHabitTracker({ userId });

  const handleComment = async () => {
    await submitComment(postId);
    recordComment();
  };

  return <button onClick={handleComment}>Comentar</button>;
}
```

## Storage

Datos guardados en localStorage:
- `daily_activity` - Historial de 90 días
- `streak_data_{userId}` - Datos de streak
- `habit_goals` - Metas del día

## Métricas a Monitorear

- DAU/MAU ratio (target > 40%)
- Streak completion rate
- Avg session duration
- Metas completadas por día
- Churn rate (7d, 30d)

## Futuras Mejoras

- [ ] Notifications de streak en riesgo
- [ ] Streak freeze (comprar con XP)
- [ ] Leaderboards semanales
- [ ] Achievements badges
- [ ] Social sharing de streaks
