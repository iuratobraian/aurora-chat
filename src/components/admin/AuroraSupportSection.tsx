import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../ToastProvider';
import logger from '../../utils/logger';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AuditResult {
  provider: string;
  model: string;
  content: string;
}

interface JsonErrorPayload {
  error?: string;
  [key: string]: unknown;
}

interface FindingRecord {
  id: string;
  surfaceId: string;
  surfaceLabel: string;
  route: string;
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  provider: string;
  model: string;
  summary: string;
  content: string;
  taskId?: string;
  reportedAt?: string;
  reportError?: string | null;
  suggestedOwner?: string | null;
  patchSuggestion?: string | null;
  patchLoading?: boolean;
  improvementPlan?: string | null;
}

interface GrowthSnapshot {
  totalRuns: number;
  guardRuns: number;
  manualRuns: number;
  highFindings: number;
  lastGrowthAt: string | null;
  activeMinutes: number;
}

interface AuditSurface {
  id: string;
  label: string;
  route: string;
  goal: string;
  areas: string[];
  files: string[];
}

const AUDIT_SURFACES: AuditSurface[] = [
  {
    id: 'dashboard',
    label: 'Dashboard y home',
    route: '/dashboard',
    goal: 'claridad de valor y siguiente mejor acción',
    areas: ['jerarquía visual', 'cta principal', 'retención', 'briefing', 'coach'],
    files: ['views/DashboardView.tsx', 'components/MorningBriefingCard.tsx', 'components/DailyCoachCard.tsx'],
  },
  {
    id: 'community',
    label: 'Comunidad y feed',
    route: '/comunidad',
    goal: 'utilidad del feed y conversación de calidad',
    areas: ['ranking', 'legibilidad', 'comentarios', 'estados vacíos', 'retención'],
    files: ['views/ComunidadView.tsx', 'components/PostCard.tsx', 'services/feed/feedRanker.ts'],
  },
  {
    id: 'onboarding',
    label: 'Onboarding y activación',
    route: '/onboarding',
    goal: 'llevar al usuario al primer valor rápido',
    areas: ['fricción', 'claridad', 'pasos', 'feedback', 'siguiente acción'],
    files: ['components/OnboardingFlow.tsx', 'services/auth/authService.ts', 'views/DashboardView.tsx'],
  },
  {
    id: 'creator',
    label: 'Creators y monetización',
    route: '/creator',
    goal: 'activar creación, distribución y monetización',
    areas: ['analytics', 'claridad de ingresos', 'acciones', 'retención creator'],
    files: ['views/CreatorDashboard.tsx', 'services/analytics/communityAnalytics.ts', 'views/CreatorView.tsx'],
  },
  {
    id: 'profile',
    label: 'Perfil y reputación',
    route: '/perfil',
    goal: 'hacer visible confianza, reputación y aportes',
    areas: ['credibilidad', 'historial', 'señales', 'autoridad', 'claridad'],
    files: ['views/PerfilView.tsx', 'types.ts', 'convex/achievements.ts'],
  },
  {
    id: 'admin',
    label: 'Panel admin',
    route: '/admin',
    goal: 'operación rápida y control confiable',
    areas: ['jerarquía', 'velocidad operativa', 'alertas', 'acciones críticas', 'moderación'],
    files: ['views/AdminView.tsx', 'components/admin/AdminDashboard.tsx', 'components/admin/ModerationPanel.tsx'],
  },
];

const DEFAULT_PROVIDER = 'auto';
const STORAGE_KEY = 'aurora_support_findings_v1';
const GROWTH_STORAGE_KEY = 'aurora_support_growth_v1';
const MAX_FINDINGS = 30;

const SYSTEM_PROMPT = `Eres Aurora Support, un agente de apoyo de producto e ingeniería para TradePortal.
Tu trabajo es revisar superficies de la webapp y devolver mejoras concretas, no genéricas.
Responde en español.
Evalúa UX, claridad, conversión, confianza, rendimiento percibido, estados vacíos, riesgo técnico y priorización.
Devuelve exactamente estas secciones:
1. Diagnóstico breve
2. Problemas detectados
3. Mejoras prioritarias
4. Quick wins
5. Riesgos de implementación
6. Qué validar después
Sé accionable, crítico y específico.`;

const readJsonResponse = async <T,>(response: Response, fallbackMessage: string): Promise<T> => {
  const raw = await response.text();

  if (!raw.trim()) {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${fallbackMessage} Respuesta inválida del servidor.`);
  }
};

const AuroraSupportSection: React.FC = () => {
  const { showToast } = useToast();
  const [surfaceId, setSurfaceId] = useState<string>(AUDIT_SURFACES[0].id);
  const [preferredProvider, setPreferredProvider] = useState(DEFAULT_PROVIDER);
  const [extraContext, setExtraContext] = useState(
    'Quiero que Aurora revise esta superficie pensando en utilidad real para comunidad, claridad y mejoras implementables por el equipo.'
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardMode, setGuardMode] = useState(false);
  const [monitorScope, setMonitorScope] = useState<'selected' | 'all'>('selected');
  const [monitorMinutes, setMonitorMinutes] = useState<number>(5);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [growth, setGrowth] = useState<GrowthSnapshot>({
    totalRuns: 0,
    guardRuns: 0,
    manualRuns: 0,
    highFindings: 0,
    lastGrowthAt: null,
    activeMinutes: 0,
  });
  const intervalRef = useRef<number | null>(null);
  const activeSinceRef = useRef<number | null>(null);

  const convexFindings = useQuery(api.adminFindings.getFindings);
  const addFindingMutation = useMutation(api.adminFindings.addFinding);
  const updateStatusMutation = useMutation(api.adminFindings.updateFindingStatus);

  const findings: FindingRecord[] = useMemo(() => {
    if (!convexFindings) return [];
    return convexFindings.map((f: any) => ({
      id: f._id,
      surfaceId: f.category,
      surfaceLabel: f.title.split(':')[0] || f.category,
      route: f.route || '/',
      status: f.status as 'pending' | 'reviewed' | 'resolved',
      priority: f.severity === 'critical' ? 'high' : f.severity === 'warning' ? 'medium' : 'low',
      createdAt: new Date(f.detectedAt).toISOString(),
      provider: f.provider || 'unknown',
      model: f.model || 'unknown',
      summary: f.title,
      content: f.description,
      taskId: f.taskId,
      reportedAt: f.reportedAt ? new Date(f.reportedAt).toISOString() : undefined,
      reportError: null,
      suggestedOwner: null,
      patchSuggestion: null,
      patchLoading: false,
      improvementPlan: null,
    }));
  }, [convexFindings]);

  const selectedSurface = useMemo(
    () => AUDIT_SURFACES.find((surface) => surface.id === surfaceId) || AUDIT_SURFACES[0],
    [surfaceId]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GROWTH_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        setGrowth((current) => ({ ...current, ...saved }));
      }
    } catch (err) {
      logger.error('Failed to restore Aurora Support growth snapshot:', err);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(growth));
    } catch (err) {
      logger.error('Failed to persist Aurora Support growth snapshot:', err);
    }
  }, [growth]);

  const generatedPrompt = useMemo(() => {
    return [
      `Audita la superficie "${selectedSurface.label}" de TradePortal.`,
      `Ruta objetivo: ${selectedSurface.route}.`,
      `Objetivo del producto en esta superficie: ${selectedSurface.goal}.`,
      `Áreas a revisar: ${selectedSurface.areas.join(', ')}.`,
      `Archivos relevantes del repo: ${selectedSurface.files.join(', ')}.`,
      'Quiero recomendaciones útiles para mejorar la experiencia, la comprensión del usuario, la calidad del producto y la velocidad del equipo.',
      'Prioriza lo que dé más retorno compuesto y evita consejos vagos.',
      extraContext.trim(),
    ]
      .filter(Boolean)
      .join('\n');
  }, [extraContext, selectedSurface]);

  const stats = useMemo(() => {
    const pending = findings.filter((item) => item.status === 'pending').length;
    const resolved = findings.filter((item) => item.status === 'resolved').length;
    const high = findings.filter((item) => item.priority === 'high').length;
    const confidence =
      findings.length === 0 ? 38 : Math.max(42, Math.min(88, 72 - high * 8 + resolved * 3));

    return {
      pending,
      resolved,
      high,
      confidence,
      trustLabel:
        confidence >= 80
          ? 'alta con revisión'
          : confidence >= 60
            ? 'media, seguir supervisando'
            : 'en entrenamiento, no autónoma',
    };
  }, [findings]);

  const alerts = useMemo(() => {
    return findings
      .filter((item) => item.status === 'pending')
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        type: item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'info',
        message: `${item.surfaceLabel}: ${item.summary}`,
        time: item.createdAt,
      }));
  }, [findings]);

  const persistFinding = async (surface: AuditSurface, audit: AuditResult, origin: 'manual' | 'guard') => {
    const lower = audit.content.toLowerCase();
    const priority: FindingRecord['priority'] = /critico|crítico|alto|bloquea|riesgo alto|urgente/.test(lower)
      ? 'high'
      : /medio|mejora importante|atención/.test(lower)
        ? 'medium'
        : 'low';

    const summary =
      audit.content
        .split(/\r?\n/)
        .find((line) => line.trim().length > 20) ||
      `Auditoría en ${surface.label}`;

    const nextFinding: FindingRecord = {
      id: `${surface.id}-${Date.now()}`,
      surfaceId: surface.id,
      surfaceLabel: surface.label,
      route: surface.route,
      status: 'pending',
      priority,
      createdAt: new Date().toISOString(),
      provider: audit.provider,
      model: audit.model,
      summary: summary.trim(),
      content: audit.content,
      taskId: undefined,
      reportedAt: undefined,
      reportError: null,
      suggestedOwner: null,
      patchSuggestion: null,
      patchLoading: false,
      improvementPlan: null,
    };

    setLastRunAt(nextFinding.createdAt);
    setGrowth((current) => ({
      totalRuns: current.totalRuns + 1,
      guardRuns: current.guardRuns + (origin === 'guard' ? 1 : 0),
      manualRuns: current.manualRuns + (origin === 'manual' ? 1 : 0),
      highFindings: current.highFindings + (priority === 'high' ? 1 : 0),
      lastGrowthAt: nextFinding.createdAt,
      activeMinutes: current.activeMinutes,
    }));

    try {
      await addFindingMutation({
        category: surface.id,
        severity: priority === 'high' ? 'critical' : priority === 'medium' ? 'warning' : 'info',
        title: `${surface.label}: ${summary.trim().substring(0, 100)}`,
        description: audit.content,
        source: origin,
        provider: audit.provider,
        model: audit.model,
        route: surface.route,
      });
    } catch (err) {
      logger.error('Failed to persist finding to Convex:', err);
    }

    try {
      const response = await fetch('/api/admin/aurora/findings/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          findingId: nextFinding.id,
          surfaceId: surface.id,
          surfaceLabel: surface.label,
          route: surface.route,
          priority,
          summary: nextFinding.summary,
          content: nextFinding.content,
          files: surface.files,
          patchSuggestion: nextFinding.patchSuggestion || undefined,
          improvementPlan: nextFinding.improvementPlan || undefined,
        }),
      });

      const data = await readJsonResponse<JsonErrorPayload & { taskId?: string; owner?: string | null }>(
        response,
        'No se pudo subir el hallazgo a la mesa de trabajo.'
      );
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo subir el hallazgo a la mesa de trabajo.');
      }

      if (priority === 'high') {
        showToast('warning', `Aurora reportó un hallazgo crítico a la mesa: ${data.taskId}`);
      } else {
        showToast('info', `Aurora reportó un hallazgo a la mesa: ${data.taskId}`);
      }
    } catch (reportError) {
      const message = reportError instanceof Error ? reportError.message : 'Error desconocido';
      showToast('error', `Aurora no pudo subir el hallazgo a la mesa: ${message}`);
    }
  };

  const generatePatchSuggestion = async (finding: FindingRecord) => {
    showToast('info', 'Generando patch sugerido...');

    try {
      const response = await fetch('/api/admin/aurora/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredProvider,
          messages: [
            {
              role: 'system',
              content:
                'Eres un agente técnico senior. Tu trabajo es convertir un hallazgo de producto/ingeniería en un patch plan concreto y breve, en español. Devuelve exactamente: 1. Archivos a tocar 2. Cambio propuesto 3. Riesgos 4. Validación 5. Patch sketch.',
            },
            {
              role: 'user',
              content: [
                `Superficie: ${finding.surfaceLabel}`,
                `Ruta: ${finding.route}`,
                `Prioridad: ${finding.priority}`,
                `TaskId de mesa: ${finding.taskId || 'sin taskId aún'}`,
                `Owner sugerido: ${finding.suggestedOwner || 'sin owner sugerido'}`,
                `Hallazgo: ${finding.summary}`,
                `Contexto completo: ${finding.content}`,
              ].join('\n'),
            },
          ] as ChatMessage[],
        }),
      });

      const data = await readJsonResponse<JsonErrorPayload & Partial<AuditResult>>(
        response,
        'No se pudo generar el patch sugerido.'
      );
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo generar el patch sugerido.');
      }

      showToast('success', `Patch sugerido listo para ${finding.taskId || finding.surfaceLabel}`);
    } catch (patchError) {
      const message = patchError instanceof Error ? patchError.message : 'Error desconocido';
      showToast('error', `No se pudo generar patch sugerido: ${message}`);
    }
  };

  const generateImprovementPlan = async (finding: FindingRecord) => {
    showToast('info', 'Generando plan de mejora...');

    try {
      const response = await fetch('/api/admin/aurora/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredProvider,
          messages: [
            {
              role: 'system',
              content:
                'Eres un agente de producto e ingeniería. Convierte un hallazgo en un plan de mejora breve para que el equipo lo ejecute. Devuelve exactamente: 1. Objetivo 2. Cambios propuestos 3. Orden de trabajo 4. Riesgos 5. Validación.',
            },
            {
              role: 'user',
              content: [
                `Superficie: ${finding.surfaceLabel}`,
                `Ruta: ${finding.route}`,
                `Prioridad: ${finding.priority}`,
                `Hallazgo: ${finding.summary}`,
                `Contexto: ${finding.content}`,
              ].join('\n'),
            },
          ] as ChatMessage[],
        }),
      });

      const data = await readJsonResponse<JsonErrorPayload & Partial<AuditResult>>(
        response,
        'No se pudo generar el plan de mejora.'
      );
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo generar el plan de mejora.');
      }

      showToast('success', `Plan de mejora listo para ${finding.taskId || finding.surfaceLabel}`);
    } catch (planError) {
      const message = planError instanceof Error ? planError.message : 'Error desconocido';
      showToast('error', `No se pudo generar plan de mejora: ${message}`);
    }
  };

  const requestAudit = async (surface: AuditSurface): Promise<AuditResult> => {
    const prompt = [
      `Audita la superficie "${surface.label}" de TradePortal.`,
      `Ruta objetivo: ${surface.route}.`,
      `Objetivo del producto en esta superficie: ${surface.goal}.`,
      `Áreas a revisar: ${surface.areas.join(', ')}.`,
      `Archivos relevantes del repo: ${surface.files.join(', ')}.`,
      'Marca los hallazgos como pendientes de revisión manual si hay cualquier duda.',
      'Prioriza estabilidad, UX, claridad, conversión sana y riesgo técnico.',
      extraContext.trim(),
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch('/api/admin/aurora/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferredProvider,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ] as ChatMessage[],
      }),
    });

    const data = await readJsonResponse<JsonErrorPayload & Partial<AuditResult>>(
      response,
      'No se pudo ejecutar la auditoría de Aurora Support.'
    );
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo ejecutar la auditoría de Aurora Support.');
    }

    return {
      provider: data.provider || 'unknown',
      model: data.model || 'unknown',
      content: typeof data.content === 'string' ? data.content : 'Aurora Support no devolvió contenido útil.',
    };
  };

  const handleAudit = async () => {
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const data = await requestAudit(selectedSurface);
      setResult(data);
      await persistFinding(selectedSurface, data, 'manual');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      logger.error('Aurora Support audit failed:', err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!guardMode) {
      if (activeSinceRef.current) {
        const elapsedMinutes = Math.max(1, Math.round((Date.now() - activeSinceRef.current) / 60000));
        setGrowth((current) => ({
          ...current,
          activeMinutes: current.activeMinutes + elapsedMinutes,
        }));
        activeSinceRef.current = null;
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const surfacesToAudit =
      monitorScope === 'all' ? AUDIT_SURFACES : [selectedSurface];

    activeSinceRef.current = Date.now();

    const runGuardAudit = async () => {
      try {
        for (const surface of surfacesToAudit) {
          const audit = await requestAudit(surface);
          await persistFinding(surface, audit, 'guard');
        }
      } catch (err) {
        logger.error('Aurora Support guard mode failed:', err);
        setError(err instanceof Error ? err.message : 'Falló el monitoreo continuo de Aurora.');
      }
    };

    void runGuardAudit();
    intervalRef.current = window.setInterval(() => {
      void runGuardAudit();
    }, monitorMinutes * 60 * 1000);

    return () => {
      if (activeSinceRef.current) {
        const elapsedMinutes = Math.max(1, Math.round((Date.now() - activeSinceRef.current) / 60000));
        setGrowth((current) => ({
          ...current,
          activeMinutes: current.activeMinutes + elapsedMinutes,
        }));
        activeSinceRef.current = null;
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [guardMode, monitorMinutes, monitorScope, preferredProvider, selectedSurface, extraContext]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Agente interno de soporte
            </div>
            <h2 className="mt-4 text-2xl font-black uppercase tracking-[0.12em] text-white">
              Aurora Support Agent
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Este panel usa a Aurora como agente interno del equipo para revisar la webapp, detectar
              fricción y proponer mejoras accionables para UX, producto, claridad, confianza y ejecución técnica.
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-300/80">
              No es la IA del producto para usuarios finales. Es un agente interno de soporte y vigilancia para admin.
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300/80">
              Mientras no sea 100% confiable, todo hallazgo queda como pending y requiere revisión manual.
            </p>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3 min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Ruta</p>
              <p className="mt-2 text-sm font-bold text-white">{selectedSurface.route}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Objetivo</p>
              <p className="mt-2 text-sm font-bold text-white">{selectedSurface.goal}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Confianza</p>
              <p className="mt-2 text-sm font-bold text-white">{stats.confidence}%</p>
              <p className="mt-1 text-xs text-slate-400">{stats.trustLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Pendientes</p>
              <p className="mt-2 text-sm font-bold text-white">{stats.pending}</p>
              <p className="mt-1 text-xs text-slate-400">High priority: {stats.high}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Estado vivo</p>
          <p className="mt-2 text-lg font-black text-white">{guardMode ? 'Aurora activa' : 'Aurora en espera'}</p>
          <p className="mt-1 text-xs text-slate-300">Última actividad: {lastRunAt ? new Date(lastRunAt).toLocaleString('es-ES') : 'sin actividad'}</p>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Crecimiento</p>
          <p className="mt-2 text-lg font-black text-white">{growth.totalRuns} revisiones</p>
          <p className="mt-1 text-xs text-slate-300">manual {growth.manualRuns} · guard {growth.guardRuns}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Conocimiento operativo</p>
          <p className="mt-2 text-lg font-black text-white">{findings.length} hallazgos guardados</p>
          <p className="mt-1 text-xs text-slate-300">High detectados: {growth.highFindings}</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">Tiempo activo</p>
          <p className="mt-2 text-lg font-black text-white">{growth.activeMinutes} min</p>
          <p className="mt-1 text-xs text-slate-300">soporte encendido acumulado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#0b0f14] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Superficie a recorrer
              </label>
              <select
                value={surfaceId}
                onChange={(event) => setSurfaceId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                {AUDIT_SURFACES.map((surface) => (
                  <option key={surface.id} value={surface.id}>
                    {surface.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Provider
              </label>
              <select
                value={preferredProvider}
                onChange={(event) => setPreferredProvider(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option value="auto">Auto fallback</option>
                <option value="openrouter">OpenRouter</option>
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
                <option value="ollama">Ollama</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Aurora va a mirar</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSurface.areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold text-cyan-200"
                >
                  {area}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Archivos relacionados
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {selectedSurface.files.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Contexto adicional
            </label>
            <textarea
              value={extraContext}
              onChange={(event) => setExtraContext(event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAudit}
              disabled={sending}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-60"
            >
              {sending ? 'Auditando...' : 'Lanzar auditoría'}
            </button>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError(null);
                setExtraContext(
                  'Quiero que Aurora revise esta superficie pensando en utilidad real para comunidad, claridad y mejoras implementables por el equipo.'
                );
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/80"
            >
              Reset
            </button>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">Guard mode</p>
                <p className="mt-1 text-sm text-slate-300">
                  El agente interno Aurora revisa superficies en bucle mientras este panel siga abierto y reporta hallazgos rápido.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuardMode((current) => !current)}
                className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] ${
                  guardMode
                    ? 'bg-red-500/15 text-red-200 border border-red-500/20'
                    : 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/20'
                }`}
              >
                {guardMode ? 'Detener monitoreo' : 'Activar monitoreo'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Alcance
                </label>
                <select
                  value={monitorScope}
                  onChange={(event) => setMonitorScope(event.target.value as 'selected' | 'all')}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                >
                  <option value="selected">Solo superficie seleccionada</option>
                  <option value="all">Todas las superficies del panel</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Frecuencia
                </label>
                <select
                  value={monitorMinutes}
                  onChange={(event) => setMonitorMinutes(Number(event.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                >
                  <option value={1}>Cada 1 minuto</option>
                  <option value={5}>Cada 5 minutos</option>
                  <option value={15}>Cada 15 minutos</option>
                </select>
              </div>
            </div>

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-300">
                <p>Estado: {guardMode ? 'monitoreando' : 'pausado'}</p>
                <p>Última revisión: {lastRunAt ? new Date(lastRunAt).toLocaleString('es-ES') : 'sin ejecuciones aún'}</p>
                <p>Rol: agente interno de soporte para admin, no IA pública de la app.</p>
                <p>Política actual: hallazgos `pending` hasta revisión humana.</p>
              </div>
            </div>
          </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-300">notification_important</span>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Avisos rápidos</h3>
            </div>
            {!alerts.length && (
              <p className="mt-4 text-sm text-slate-300">Sin avisos urgentes ahora. Aurora sigue vigilando y reportará nuevos hallazgos aquí.</p>
            )}
            {!!alerts.length && (
              <div className="mt-4 space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-bold text-white">{alert.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(alert.time).toLocaleString('es-ES')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b0f14] p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Prompt generado</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/5 bg-black/30 p-4 text-sm leading-relaxed text-slate-300 font-sans">
              {generatedPrompt}
            </pre>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b0f14] p-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-300">tips_and_updates</span>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Recomendaciones de Aurora</h3>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {!error && !result && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-400">
                Aurora devolverá un diagnóstico breve, problemas detectados, mejoras prioritarias, quick wins,
                riesgos y validaciones sugeridas para esta superficie.
              </div>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-black uppercase text-cyan-300">
                    {result.provider}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-black uppercase text-slate-300">
                    {result.model}
                  </span>
                </div>

                <pre className="whitespace-pre-wrap rounded-2xl border border-white/5 bg-black/30 p-4 text-sm leading-relaxed text-slate-200 font-sans">
                  {result.content}
                </pre>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b0f14] p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-300">pending_actions</span>
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Pendientes detectados</h3>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-black uppercase text-slate-300">
                {findings.length} registros
              </span>
            </div>

            {!findings.length && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-400">
                Cuando Aurora audite superficies, dejará aquí hallazgos pendientes para revisión y reparación rápida.
              </div>
            )}

            {!!findings.length && (
              <div className="mt-4 space-y-3">
                {findings.map((finding) => (
                  <div key={finding.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-black uppercase text-cyan-300">
                        {finding.surfaceLabel}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                          finding.priority === 'high'
                            ? 'bg-red-500/15 text-red-300'
                            : finding.priority === 'medium'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {finding.priority}
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-black uppercase text-slate-300">
                        {finding.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-bold text-white">{finding.summary}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {finding.route} · {new Date(finding.createdAt).toLocaleString('es-ES')} · {finding.provider} / {finding.model}
                    </p>
                    {finding.taskId && (
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                        Subido a mesa: {finding.taskId}
                      </p>
                    )}
                    {finding.suggestedOwner && (
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                        Owner sugerido: {finding.suggestedOwner}
                      </p>
                    )}
                    {finding.reportError && (
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                        Error al subir a mesa: {finding.reportError}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void generatePatchSuggestion(finding)}
                        disabled={finding.patchLoading}
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase text-cyan-300 disabled:opacity-50"
                      >
                        {finding.patchLoading ? 'Generando patch...' : 'Crear patch sugerido'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void generateImprovementPlan(finding)}
                        disabled={finding.patchLoading}
                        className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-black uppercase text-violet-300 disabled:opacity-50"
                      >
                        {finding.patchLoading ? 'Generando plan...' : 'Crear plan de mejora'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            updateStatusMutation({ findingId: finding.id as any, status: 'in_progress' });
                            showToast('success', 'Estado actualizado a in_progress');
                          } catch {
                            showToast('error', 'Error al actualizar estado');
                          }
                        }}
                        className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-black uppercase text-amber-300"
                      >
                        Marcar reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            updateStatusMutation({ findingId: finding.id as any, status: 'resolved' });
                            showToast('success', 'Hallazgo marcado como resuelto');
                          } catch {
                            showToast('error', 'Error al marcar como resuelto');
                          }
                        }}
                        className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase text-emerald-300"
                      >
                        Marcar resolved
                      </button>
                    </div>
                    {finding.patchSuggestion && (
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-3 text-xs leading-relaxed text-cyan-100 font-sans">
                        {finding.patchSuggestion}
                      </pre>
                    )}
                    {finding.improvementPlan && (
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-violet-400/10 bg-violet-400/5 p-3 text-xs leading-relaxed text-violet-100 font-sans">
                        {finding.improvementPlan}
                      </pre>
                    )}
                    <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/5 bg-white/5 p-3 text-xs leading-relaxed text-slate-300 font-sans">
                      {finding.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuroraSupportSection;
