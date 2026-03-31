#!/usr/bin/env node

export interface CommunityOnboardingStep {
  id: string;
  order: number;
  title: string;
  description: string;
  action: string;
  estimatedTime: number;
  xpReward: number;
  completed: boolean;
}

export interface OnboardingProgress {
  communityId: string;
  communityName: string;
  ownerId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: number;
  completedAt?: number;
}

export interface CommunitySetup {
  profile: {
    name: string;
    description: string;
    coverImage?: string;
    visibility: 'public' | 'unlisted' | 'private';
  };
  firstPost: {
    type: 'welcome' | 'rules' | 'intro';
    content: string;
  };
  settings: {
    autoPostEnabled: boolean;
    aiAutoReply: boolean;
    requireApproval: boolean;
  };
  integrations: {
    telegram?: string;
    discord?: string;
  };
}

const WELCOME_POST_TEMPLATE = `👋 ¡Bienvenidos a {community_name}!

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

#Bienvenida #{hashtag}`;

const RULES_POST_TEMPLATE = `📜 Reglas de {community_name}

Para mantener un espacio productivo:

1️⃣ **Respeto** - Trata a todos con dignidad
2️⃣ **No spam** - Ni links de afiliados ni promotions
3️⃣ **Calidad** - Prefiere información útil
4️⃣ **Señales** - Usa el formato oficial para compartir
5️⃣ **Dudas** - Pregunta en los threads correspondientes

⚠️ El incumplimiento puede resultar en expulsión.

¿Dudas? Comenta abajo 👇`;

export function generateWelcomeContent(communityName: string, description: string, hashtag: string): string {
  return WELCOME_POST_TEMPLATE
    .replace('{community_name}', communityName)
    .replace('{description}', description)
    .replace('{hashtag}', hashtag);
}

export function generateRulesContent(communityName: string): string {
  return RULES_POST_TEMPLATE.replace('{community_name}', communityName);
}

export function getOnboardingSteps(): CommunityOnboardingStep[] {
  return [
    {
      id: 'profile',
      order: 1,
      title: 'Configura tu perfil',
      description: 'Nombre, descripción y cover image',
      action: 'navigate_community_settings',
      estimatedTime: 5,
      xpReward: 50,
      completed: false,
    },
    {
      id: 'welcome-post',
      order: 2,
      title: 'Crea post de bienvenida',
      description: 'Presenta la comunidad a nuevos miembros',
      action: 'create_welcome_post',
      estimatedTime: 10,
      xpReward: 100,
      completed: false,
    },
    {
      id: 'rules-post',
      order: 3,
      title: 'Publica las reglas',
      description: 'Establece expectativas claras',
      action: 'create_rules_post',
      estimatedTime: 5,
      xpReward: 75,
      completed: false,
    },
    {
      id: 'invite-members',
      order: 4,
      title: 'Invita primeros miembros',
      description: 'Invita 5+ traders a la comunidad',
      action: 'share_invite_link',
      estimatedTime: 15,
      xpReward: 150,
      completed: false,
    },
    {
      id: 'first-engagement',
      order: 5,
      title: 'Genera engagement',
      description: '3+ comentarios o respuestas en 24h',
      action: 'post_and_respond',
      estimatedTime: 30,
      xpReward: 200,
      completed: false,
    },
    {
      id: 'setup-integrations',
      order: 6,
      title: 'Conecta integraciones',
      description: 'Telegram, Discord, etc.',
      action: 'setup_telegram_bot',
      estimatedTime: 10,
      xpReward: 100,
      completed: false,
    },
    {
      id: 'ai-setup',
      order: 7,
      title: 'Configura IA assistant',
      description: 'Activa auto-reply y análisis',
      action: 'enable_ai_features',
      estimatedTime: 5,
      xpReward: 75,
      completed: false,
    },
  ];
}

export function createOnboardingProgress(
  communityId: string,
  communityName: string,
  ownerId: string
): OnboardingProgress {
  return {
    communityId,
    communityName,
    ownerId,
    currentStep: 1,
    completedSteps: [],
    startedAt: Date.now(),
  };
}

export function completeStep(
  progress: OnboardingProgress,
  stepId: string
): OnboardingProgress {
  const steps = getOnboardingSteps();
  const step = steps.find(s => s.id === stepId);
  
  if (!step || progress.completedSteps.includes(stepId)) {
    return progress;
  }

  const newCompletedSteps = [...progress.completedSteps, stepId];
  const nextStep = steps.find(s => s.order === step.order + 1);

  return {
    ...progress,
    completedSteps: newCompletedSteps,
    currentStep: nextStep ? nextStep.order : step.order,
    completedAt: newCompletedSteps.length === steps.length ? Date.now() : undefined,
  };
}

export function getOnboardingStats(progress: OnboardingProgress): {
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  totalXpEarned: number;
  estimatedTimeRemaining: number;
} {
  const steps = getOnboardingSteps();
  const completed = progress.completedSteps.length;
  const total = steps.length;

  const completedStepsData = steps.filter(s => progress.completedSteps.includes(s.id));
  const totalXp = completedStepsData.reduce((sum, s) => sum + s.xpReward, 0);
  const remainingTime = steps
    .filter(s => !progress.completedSteps.includes(s.id))
    .reduce((sum, s) => sum + s.estimatedTime, 0);

  return {
    totalSteps: total,
    completedSteps: completed,
    percentComplete: Math.round((completed / total) * 100),
    totalXpEarned: totalXp,
    estimatedTimeRemaining: remainingTime,
  };
}

export function getSetupChecklist(): string[] {
  return [
    '☐ Nombre de comunidad configurado',
    '☐ Descripción completa (>50 chars)',
    '☐ Cover image subida',
    '☐ Visibilidad correcta',
    '☐ Post de bienvenida publicado',
    '☐ Post de reglas publicado',
    '☐ Al menos 5 miembros invitados',
    '☐ Engagement inicial (3+ comentarios)',
    '☐ Integraciones configuradas (opcional)',
    '☐ AI assistant activo (opcional)',
  ];
}

if (require.main === module) {
  console.log('🚀 TradePortal Community Onboarding\n');

  const communityName = 'Forex Latam';
  const description = 'trading y forex en latinoamérica';
  const hashtag = 'ForexLatam';

  console.log('📝 Welcome Post Preview:\n');
  console.log(generateWelcomeContent(communityName, description, hashtag));

  console.log('\n\n📜 Rules Post Preview:\n');
  console.log(generateRulesContent(communityName));

  console.log('\n\n✅ Onboarding Steps:');
  for (const step of getOnboardingSteps()) {
    console.log(`  ${step.order}. ${step.title} (+${step.xpReward} XP, ~${step.estimatedTime}min)`);
  }

  const progress = createOnboardingProgress('comm_123', communityName, 'user_456');
  console.log('\n📊 Progress Example:');
  console.log(JSON.stringify(getOnboardingStats(progress), null, 2));
}
