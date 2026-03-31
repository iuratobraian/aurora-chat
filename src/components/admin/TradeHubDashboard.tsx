import React, { useState, useEffect, memo, useRef } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  load: number;
  tasks: number;
  icon: string;
  color: string;
}

interface ActivityItem {
  id: string;
  agent: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; hoverColor?: string }> = ({ 
  children, className = '', hoverColor 
}) => (
  <div className={`bg-[#1a1c20]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${hoverColor ? `hover:border-${hoverColor}/30 transition-all duration-300` : ''} ${className}`}>
    {children}
  </div>
);

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  subtitle?: string; 
  icon: string; 
  color: string;
  progress?: number;
}> = memo(({ label, value, subtitle, icon, color, progress }) => (
  <GlassCard>
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</span>
      <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
    </div>
    <div className="text-4xl font-bold text-white">{value}</div>
    {progress !== undefined && (
      <div className="mt-4 h-1 w-full bg-[#343538] rounded-full overflow-hidden">
        <div className={`h-full ${color.replace('text-', 'bg-')} w-[${progress}%]`} style={{ width: `${progress}%` }}></div>
      </div>
    )}
    {subtitle && (
      <div className={`mt-4 flex items-center gap-2 text-[10px] ${color}`}>
        <span className="material-symbols-outlined text-sm">trending_up</span>
        <span>{subtitle}</span>
      </div>
    )}
  </GlassCard>
));

const AgentCard: React.FC<{ 
  agent: Agent; 
  onToggle: (id: string) => void;
}> = ({ agent, onToggle }) => {
  const isActive = agent.status === 'active';
  
  return (
    <GlassCard hoverColor={agent.color}>
      <div className="flex flex-col xl:flex-row xl:items-center gap-6">
        <div className="flex items-center gap-4 xl:w-1/4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            isActive ? `bg-${agent.color}/10 border-${agent.color}/20` : 'bg-[#343538] border-white/5'
          }`}>
            <span className={`material-symbols-outlined ${isActive ? agent.color : 'text-gray-500'}`}>{agent.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{agent.role}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Processing Load</span>
            <span>{agent.load}%</span>
          </div>
          <div className="h-2 w-full bg-[#343538] rounded-full overflow-hidden p-[1px]">
            <div 
              className={`h-full rounded-full bg-gradient-to-r from-${agent.color} to-purple-400 shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
              style={{ width: `${agent.load}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-between xl:justify-end gap-6 xl:w-1/4">
          <div className="text-right">
            <div className="text-lg font-bold text-white">{agent.tasks}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest">Tasks</div>
          </div>
          <button 
            onClick={() => onToggle(agent.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
              isActive 
                ? 'bg-[#343538] border border-white/5' 
                : `bg-${agent.color}/20 border border-${agent.color}/40`
            }`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'text-gray-400' : agent.color}`} style={{ fontVariationSettings: 'FILL 1' }}>
              {isActive ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const typeColors = {
    success: 'bg-emerald-400',
    info: 'bg-blue-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
  };

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className={`w-1 h-10 rounded-full ${typeColors[activity.type]}`}></div>
          <div>
            <p className="text-xs text-gray-300 leading-relaxed">
              <span className={`font-bold ${
                activity.type === 'success' ? 'text-emerald-400' : 
                activity.type === 'error' ? 'text-red-400' :
                activity.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
              }`}>{activity.agent}</span>
              {' '}{activity.message}
            </p>
            <span className="text-[9px] text-gray-600 font-mono">{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuickAction: React.FC<{ icon: string; label: string; color: string; onClick?: () => void }> = ({ 
  icon, label, color, onClick 
}) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#1a1c20] border border-white/5 hover:bg-[#292a2d] transition-all"
  >
    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{label}</span>
  </button>
);

export const TradeHubDashboard: React.FC = () => {
  const currentTimeRef = useRef(new Date());
  const [, forceUpdate] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'opencode', name: 'OpenCode', role: 'Developer Instinct', status: 'active', load: 78, tasks: 142, icon: 'terminal', color: 'text-blue-400' },
    { id: 'minimax', name: 'Minimax #1', role: 'Optimization Cluster', status: 'active', load: 42, tasks: 89, icon: 'data_thresholding', color: 'text-emerald-400' },
    { id: 'aurora', name: 'Aurora Core', role: 'Neural Supervisor', status: 'active', load: 94, tasks: 512, icon: 'psychology', color: 'text-purple-400' },
    { id: 'gemini', name: 'Gemini', role: 'Multimodal Analyst', status: 'idle', load: 12, tasks: 14, icon: 'monitoring', color: 'text-gray-400' },
  ]);

  const activities: ActivityItem[] = [
    { id: '1', agent: 'OpenCode', message: 'successfully merged PR #1240 into production.', time: '14:40:22', type: 'success' },
    { id: '2', agent: 'Aurora Core', message: 'detected latency spike in Asia-East node. Redirecting.', time: '14:38:15', type: 'info' },
    { id: '3', agent: 'System', message: 'automatically backed up orchestration state to secure vault.', time: '14:35:00', type: 'info' },
    { id: '4', agent: 'Minimax #2', message: 'failed to authenticate. Retrying with secondary token.', time: '14:30:12', type: 'error' },
  ];

  const pendingPosts = useQuery(api.aiAgent.getPendingPosts);

  useEffect(() => {
    const timer = setInterval(() => {
      currentTimeRef.current = new Date();
      forceUpdate(n => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0);

  const handleToggleAgent = (id: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id 
        ? { ...agent, status: agent.status === 'active' ? 'idle' : 'active' }
        : agent
    ));
  };

  const formatTime = (date: Date) => {
    return date.toISOString().split('T')[1].split('.')[0] + ' UTC';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Active Agents" 
          value={`${activeAgents}/08`} 
          icon="smart_tooy" 
          color="text-blue-400"
          progress={Math.round((activeAgents / 8) * 100)}
        />
        <StatCard 
          label="Tasks Completed" 
          value={totalTasks.toLocaleString()} 
          subtitle="+12% FROM LAST SESSION"
          icon="check_circle" 
          color="text-emerald-400"
        />
        <StatCard 
          label="Pending Sync" 
          value={pendingPosts?.length || 0} 
          subtitle="PROCESSING PIPELINE ACTIVE"
          icon="sync_alt" 
          color="text-purple-400"
        />
        <StatCard 
          label="System Uptime" 
          value="99.9%" 
          subtitle="STABLE CORE OMEGA"
          icon="timer" 
          color="text-gray-400"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Orchestration Engine */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Control Bar */}
          <GlassCard>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-white px-4">ORCHESTRATION ENGINE</h2>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(125,255,162,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                  INICIAR TODOS
                </button>
                <button className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm tracking-widest uppercase hover:bg-red-500/40 transition-all">
                  DETENER
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Agent Cards */}
          <div className="space-y-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onToggle={handleToggleAgent} />
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Quick Actions */}
          <GlassCard>
            <h2 className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase mb-6">Quick Directives</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon="cloud_upload" label="Deploy" color="text-blue-400" />
              <QuickAction icon="analytics" label="Analyze" color="text-emerald-400" />
              <QuickAction icon="fork_right" label="Create PR" color="text-purple-400" />
              <QuickAction icon="sync" label="Sync" color="text-gray-400" />
            </div>
          </GlassCard>

          {/* Activity Feed */}
          <GlassCard className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase">Activity Log</h2>
              <span className="text-[9px] text-gray-600">LIVE FEED</span>
            </div>
            <ActivityFeed activities={activities} />
            
            {/* Network Load */}
            <div className="mt-8 p-4 rounded-xl bg-[#1a1c20] border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Network Load</span>
                <span className="text-[10px] font-mono text-emerald-400">2.4 GB/s</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[40, 60, 30, 80, 50, 90, 45, 30].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-400/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Debug Terminal */}
      <div className="fixed bottom-8 right-8 w-80 glass p-0 rounded-xl hidden xl:block overflow-hidden shadow-2xl border border-blue-500/20">
        <div className="bg-[#343538] px-4 py-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50"></div>
          </div>
          <span className="text-[9px] font-mono text-gray-500">aurora-debug.log</span>
        </div>
        <div className="p-4 bg-[#121316]/80 backdrop-blur-md h-48 font-mono text-[10px] text-blue-400/80 overflow-y-auto">
          <p>[{formatTime(currentTimeRef.current)}] INITIALIZING NEURAL_BRIDGE_V2...</p>
          <p>[{formatTime(new Date(Date.now() - 2000))}] HANDSHAKE WITH Minimax_Node_01 SUCCESSFUL</p>
          <p>[{formatTime(new Date(Date.now() - 4000))}] LOAD BALANCER ACTIVE [WEIGHT: 0.84]</p>
          <p>[{formatTime(new Date(Date.now() - 5000))}] ALL CORES SYNCED IN 12MS</p>
          <p>[{formatTime(new Date(Date.now() - 8000))}] WAITING FOR USER INPUT...</p>
          <p className="animate-pulse">_</p>
        </div>
      </div>
    </div>
  );
};

export default TradeHubDashboard;
