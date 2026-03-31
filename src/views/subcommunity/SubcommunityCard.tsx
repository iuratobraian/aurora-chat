import React, { memo } from 'react';

interface Props {
  subcommunity: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    currentMembers: number;
    tvIsLive: boolean;
    adsEnabled: boolean;
    plan: string;
    createdAt: number;
  };
  parentSlug: string;
  onClick: () => void;
}

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  free:      { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
  starter:   { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  growth:    { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
  scale:     { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  enterprise:{ bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratis',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  enterprise: 'Enterprise',
};

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const SubcommunityCard: React.FC<Props> = ({ subcommunity, parentSlug, onClick }) => {
  const planStyle = PLAN_COLORS[subcommunity.plan] ?? PLAN_COLORS.free;
  const planLabel = PLAN_LABELS[subcommunity.plan] ?? subcommunity.plan;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#0f1115] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wide truncate group-hover:text-primary transition-colors">
              {subcommunity.name}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold mt-0.5">
              /{parentSlug}/{subcommunity.slug}
            </p>
          </div>

          {/* Plan badge */}
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${planStyle.bg} ${planStyle.border} ${planStyle.text} border`}>
            {planLabel}
          </span>
        </div>

        {/* Description */}
        {subcommunity.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {subcommunity.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Members */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-gray-500">group</span>
            <span className="text-[10px] font-bold text-gray-400">{subcommunity.currentMembers}</span>
          </div>

          {/* Ad indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`size-2 rounded-full ${subcommunity.adsEnabled ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-[10px] font-bold text-gray-500">
              {subcommunity.adsEnabled ? 'Ads on' : 'Ads off'}
            </span>
          </div>

          {/* TV live badge */}
          {subcommunity.tvIsLive && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
              <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">En vivo</span>
            </div>
          )}

          {/* Date */}
          <span className="text-[10px] text-gray-600 font-bold ml-auto">
            {formatDate(subcommunity.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
};

export default memo(SubcommunityCard);
