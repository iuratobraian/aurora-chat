import React, { memo } from 'react';
import { MarketingChatBot } from '../marketing/MarketingChatBot';

type NodeTone = 'violet' | 'cyan' | 'emerald' | 'amber';

interface WorkflowNode {
  id: string;
  title: string;
  subtitle: string;
  tone: NodeTone;
  metric: string;
  status: 'active' | 'queued' | 'approved';
  icon: string;
}

interface CampaignCard {
  name: string;
  channel: string;
  owner: string;
  stage: string;
  reach: string;
}

interface InsightMetric {
  label: string;
  value: string;
  delta: string;
  icon: string;
}

const workflowNodes: WorkflowNode[] = [
  {
    id: 'brief',
    title: 'Brief IA',
    subtitle: 'Define objetivo, audiencia y tono',
    tone: 'violet',
    metric: '98% completado',
    status: 'active',
    icon: 'edit_note',
  },
  {
    id: 'assets',
    title: 'Assets',
    subtitle: 'Imagen, video y hooks listos',
    tone: 'cyan',
    metric: '24 piezas',
    status: 'approved',
    icon: 'dashboard_customize',
  },
  {
    id: 'distribution',
    title: 'Distribución',
    subtitle: 'Publica en email, IG y comunidad',
    tone: 'emerald',
    metric: '8 canales',
    status: 'active',
    icon: 'share',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Aprende y reentrena la secuencia',
    tone: 'amber',
    metric: '+32% CTR',
    status: 'queued',
    icon: 'analytics',
  },
];

const insightMetrics: InsightMetric[] = [
  { label: 'CTR promedio', value: '8.4%', delta: '+1.9%', icon: 'north_east' },
  { label: 'Leads calificados', value: '1.2k', delta: '+14%', icon: 'groups' },
  { label: 'Contenido activo', value: '34', delta: '+6', icon: 'auto_awesome' },
  { label: 'Conversión', value: '4.7%', delta: '+0.8%', icon: 'trending_up' },
];

const campaignQueue: CampaignCard[] = [
  { name: 'Lanzamiento Bot VIP', channel: 'Instagram + Landing', owner: 'Growth Team', stage: 'A/B test', reach: '48k' },
  { name: 'Onboarding Pro', channel: 'Email + Push', owner: 'CRM', stage: 'Automatizado', reach: '12k' },
  { name: 'Reactivación Leads', channel: 'WhatsApp + DM', owner: 'Ops', stage: 'Pendiente', reach: '8k' },
];

const timelineSteps = [
  { time: '08:30', label: 'Brief validado', tone: 'text-violet-300' },
  { time: '10:00', label: 'Creatividades aprobadas', tone: 'text-cyan-300' },
  { time: '13:15', label: 'Distribución multicanal', tone: 'text-emerald-300' },
  { time: '18:00', label: 'Reporte y optimización', tone: 'text-amber-300' },
];

const toneClasses: Record<NodeTone, string> = {
  violet: 'from-violet-500/80 via-fuchsia-500/60 to-violet-300/40 border-violet-400/30 shadow-violet-500/20',
  cyan: 'from-cyan-500/80 via-sky-500/60 to-cyan-300/40 border-cyan-400/30 shadow-cyan-500/20',
  emerald: 'from-emerald-500/80 via-green-500/60 to-emerald-300/40 border-emerald-400/30 shadow-emerald-500/20',
  amber: 'from-amber-500/80 via-orange-500/60 to-amber-300/40 border-amber-400/30 shadow-amber-500/20',
};

const MarketingProDashboard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#050816] p-4 md:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-12%] h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute right-[-5%] top-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_25%)]" />
      </div>

      <div className="relative flex flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-violet-200">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
              Marketing Pro Dashboard
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Automatiza campañas con un canvas vivo, no con formularios planos.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Diseña flujos de contenido, distribuye piezas por canal y cierra el loop con analítica accionable.
              La vista prioriza jerarquía, conectores visuales y lectura rápida tipo N8N.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[460px]">
            {insightMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-white/60">
                  <span className="material-symbols-outlined text-sm">{metric.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">{metric.delta}</span>
                </div>
                <p className="mt-4 text-2xl font-black text-white">{metric.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">{metric.label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_1.7fr_1fr]">
          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Canvas</p>
                <h2 className="mt-1 text-lg font-black text-white">Workflow operativo</h2>
              </div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-200">
                Live
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {workflowNodes.map((node, index) => (
                <div key={node.id} className="relative">
                  {index < workflowNodes.length - 1 && (
                    <div className="absolute left-6 top-14 h-[calc(100%+1rem)] w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
                  )}
                  <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${toneClasses[node.tone]} p-[1px] shadow-2xl`}>
                    <div className="rounded-[calc(1.5rem-1px)] bg-[#0b1020]/95 p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                          <span className={`material-symbols-outlined text-2xl text-white`}>{node.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-base font-black text-white">{node.title}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${node.status === 'active' ? 'bg-emerald-400/15 text-emerald-300' : node.status === 'approved' ? 'bg-cyan-400/15 text-cyan-300' : 'bg-amber-400/15 text-amber-300'}`}>
                              {node.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-white/55">{node.subtitle}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                              Node #{String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-bold text-white">{node.metric}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-violet-300">Workspace</p>
                <h2 className="mt-1 text-lg font-black text-white">Campañas y colas</h2>
              </div>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/70 transition-colors hover:bg-white/10">
                Nuevo flujo
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Pipeline</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Captura', value: 'Lead magnet', tone: 'bg-violet-400' },
                    { label: 'Nutrición', value: 'Secuencia email', tone: 'bg-cyan-400' },
                    { label: 'Conversión', value: 'Oferta VIP', tone: 'bg-emerald-400' },
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`size-2 rounded-full ${item.tone} shadow-[0_0_12px_currentColor]`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{item.label}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">0{index + 1}</span>
                        </div>
                        <p className="text-[11px] text-white/45">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Automations</p>
                <div className="mt-4 space-y-3">
                  {[
                    'Publicación cruzada',
                    'Segmentación por interés',
                    'Re-engagement automático',
                  ].map((item, index) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
                      <span className="text-sm font-medium text-white/85">{item}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-200">{index === 2 ? '07m' : 'ON'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Activity</p>
                  <h3 className="mt-1 text-base font-black text-white">Cola de campañas activas</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">3 items</span>
              </div>

              <div className="mt-4 space-y-3">
                {campaignQueue.map((campaign, index) => (
                  <div key={campaign.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">#{index + 1}</span>
                        <h4 className="truncate text-sm font-bold text-white">{campaign.name}</h4>
                      </div>
                      <p className="mt-1 text-[11px] text-white/45">{campaign.channel} · {campaign.owner}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{campaign.reach}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-200">{campaign.stage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-300">Signals</p>
                  <h2 className="mt-1 text-lg font-black text-white">Timeline e insights</h2>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-200">
                  Optimized
                </span>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">Daily flow</p>
                <div className="mt-4 space-y-4">
                  {timelineSteps.map((step, index) => (
                    <div key={step.time} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="size-3 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.8)]" />
                        {index < timelineSteps.length - 1 && <div className="mt-1 h-10 w-px bg-white/10" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-white">{step.time}</span>
                          <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${step.tone}`}>auto</span>
                        </div>
                        <p className="mt-1 text-sm text-white/55">{step.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <MarketingChatBot />
          </section>
        </div>
      </div>
    </div>
  );
};

export default memo(MarketingProDashboard);
