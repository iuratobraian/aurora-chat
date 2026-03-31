import React from 'react';

interface SignalStatisticsProps {
  stats: {
    totalSeniales: number;
    ganadoras: number;
    perdedoras: number;
    winRate: number;
    profitFactor: number;
    averageGain: number;
    averageLoss: number;
  };
  period?: string;
}

export const SignalStatistics: React.FC<SignalStatisticsProps> = ({
  stats,
  period = '30d',
}) => {
  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-400';
    if (winRate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProfitFactorColor = (pf: number) => {
    if (pf >= 2) return 'text-green-400';
    if (pf >= 1) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Estadísticas del Mentor
            </h3>
            <p className="text-gray-400 text-xs">Últimos {period}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">
            Total Señales
          </p>
          <p className="text-2xl font-black text-white">{stats.totalSeniales}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">
            Win Rate
          </p>
          <p className={`text-2xl font-black ${getWinRateColor(stats.winRate)}`}>
            {stats.winRate}%
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">
            Profit Factor
          </p>
          <p className={`text-2xl font-black ${getProfitFactorColor(stats.profitFactor)}`}>
            {stats.profitFactor}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">
            Ganadoras / Perdedoras
          </p>
          <p className="text-2xl font-black text-white">
            <span className="text-green-400">{stats.ganadoras}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-red-400">{stats.perdedoras}</span>
          </p>
        </div>
      </div>

      {/* Average Gain/Loss */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-400 text-sm">trending_up</span>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Ganancia Promedio
            </p>
          </div>
          <p className="text-xl font-black text-green-400">+{stats.averageGain.toFixed(2)}%</p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-red-400 text-sm">trending_down</span>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Pérdida Promedio
            </p>
          </div>
          <p className="text-xl font-black text-red-400">{stats.averageLoss.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default SignalStatistics;
