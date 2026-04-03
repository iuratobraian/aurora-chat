import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  tasks: number;
  uptime: string;
  load: number;
  color: string;
  icon: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  updatedAt: string;
  tags: string[];
}

interface ChatMessage {
  id: string;
  agent: string;
  message: string;
  timestamp: string;
}

const initialAgents: Agent[] = [
  { id: 'opencode', name: 'OpenCode', model: 'Big Pickle 32B', role: 'Developer Instinct', status: 'offline', tasks: 0, uptime: '--:--', load: 0, color: 'orange', icon: '⚡' },
  { id: 'minimax1', name: 'Minimax #1', model: 'M2.5 Turbo', role: 'Optimization Cluster', status: 'offline', tasks: 0, uptime: '--:--', load: 0, color: 'pink', icon: '🤖' },
  { id: 'minimax2', name: 'Minimax #2', model: 'M2.5 Turbo', role: 'Analytics Processor', status: 'offline', tasks: 0, uptime: '--:--', load: 0, color: 'pink', icon: '🤖' },
  { id: 'aurora', name: 'Aurora Core', model: 'Master Mind', role: 'Neural Supervisor', status: 'offline', tasks: 0, uptime: '--:--', load: 0, color: 'purple', icon: '🧠' },
  { id: 'gemini', name: 'Gemini', model: 'Ultra 2.0', role: 'Multimodal Analyst', status: 'offline', tasks: 0, uptime: '--:--', load: 0, color: 'blue', icon: '✨' },
];

const initialTasks: Task[] = [
  { id: '1', title: 'Fix floating menu bug', description: 'Merge duplicate floating menus in portal', priority: 'high', status: 'in-progress', assignedTo: 'opencode', updatedAt: '2h ago', tags: ['bug', 'ui'] },
  { id: '2', title: 'Add dashboard analytics', description: 'Create analytics dashboard for community metrics', priority: 'medium', status: 'pending', assignedTo: 'aurora', updatedAt: '5h ago', tags: ['feature'] },
  { id: '3', title: 'Update documentation', description: 'Update API docs and README', priority: 'low', status: 'completed', assignedTo: 'minimax1', updatedAt: '1d ago', tags: ['docs'] },
  { id: '4', title: 'Design login screen', description: 'Create new login UI with glass morphism', priority: 'high', status: 'pending', assignedTo: 'gemini', updatedAt: '1d ago', tags: ['design', 'ui'] },
  { id: '5', title: 'Optimize database queries', description: 'Improve Convex query performance', priority: 'high', status: 'in-progress', assignedTo: 'opencode', updatedAt: '30m ago', tags: ['performance'] },
  { id: '6', title: 'Add Stripe webhooks', description: 'Implement payment webhooks', priority: 'medium', status: 'pending', assignedTo: 'aurora', updatedAt: '3h ago', tags: ['backend'] },
];

const initialChats: ChatMessage[] = [
  { id: '1', agent: 'Aurora Core', message: 'Tarea completada: Análisis de sentimiento completado', timestamp: '14:32' },
  { id: '2', agent: 'OpenCode', message: 'Optimizando queries de Convex...', timestamp: '14:30' },
  { id: '3', agent: 'Gemini', message: 'Nuevo diseño generado para dashboard', timestamp: '14:28' },
];

type TabType = 'dashboard' | 'design' | 'image' | 'tasks' | 'terminal' | 'chat' | 'settings';

const AuroraNexus: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [chats, setChats] = useState<ChatMessage[]>(initialChats);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<string>('opencode');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '> Aurora Nexus v1.0 initialized',
    '> Sistema de orquestación de agentes cargado',
    '> Stitch MCP: Configurado',
    '> Listo para iniciar agentes...',
  ]);
  const [designPrompt, setDesignPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startAllAgents = () => {
    setAgents(agents.map(a => ({
      ...a,
      status: 'online' as const,
      tasks: Math.floor(Math.random() * 5),
      uptime: '00:00',
      load: Math.floor(Math.random() * 30) + 10,
    })));
    setTerminalOutput(prev => [...prev, `> [${currentTime.toLocaleTimeString()}] Iniciando todos los agentes...`, '> Todos los agentes en línea']);
  };

  const stopAllAgents = () => {
    setAgents(agents.map(a => ({
      ...a,
      status: 'offline' as const,
      tasks: 0,
      uptime: '--:--',
      load: 0,
    })));
    setTerminalOutput(prev => [...prev, `> [${currentTime.toLocaleTimeString()}] Deteniendo todos los agentes...`, '> Todos los agentes desconectados']);
  };

  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(a => 
      a.id === agentId 
        ? { ...a, status: a.status === 'online' ? 'offline' : 'online' }
        : a
    ));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      priority: 'medium',
      status: 'pending',
      assignedTo: 'aurora',
      updatedAt: 'Just now',
      tags: [],
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setTerminalOutput(prev => [...prev, `> Nueva tarea creada: ${newTaskTitle}`]);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const newChat: ChatMessage = {
      id: Date.now().toString(),
      agent: 'You',
      message: chatInput,
      timestamp: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChats([...chats, newChat]);
    setChatInput('');
    setTerminalOutput(prev => [...prev, `> [${currentTime.toLocaleTimeString()}] Mensaje enviado`]);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#00e676]/20 text-[#00e676]';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getAgentGradient = (color: string) => {
    switch (color) {
      case 'orange': return 'from-orange-500 to-amber-500';
      case 'pink': return 'from-pink-500 to-rose-500';
      case 'purple': return 'from-violet-500 to-purple-600';
      case 'blue': return 'from-blue-500 to-indigo-600';
      default: return 'from-indigo-500 to-blue-600';
    }
  };

  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'design', label: 'Design Studio', icon: '🎨' },
    { id: 'image', label: 'Image Gen', icon: '🖼️' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'terminal', label: 'Terminal', icon: '💻' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#121316] text-[#e3e2e5] relative overflow-hidden font-body">
      {/* Animated Orbs - Stitch Design */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Header - Stitch Style */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#121316]/40 backdrop-blur-xl border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#adc6ff]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          <h1 className="text-xl font-bold tracking-widest text-[#adc6ff] uppercase font-headline">AURORA NEXUS</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3 bg-[#292a2d] px-4 py-1.5 rounded-full border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#62ff96] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#62ff96]"></span>
            </span>
            <span className="text-[10px] font-headline uppercase tracking-[0.15em] text-[#e3e2e5]">System Status: {onlineAgents}/5 Active</span>
          </div>
          <div className="text-[#e3e2e5] font-headline text-sm tracking-wider tabular-nums">
            {currentTime.toISOString().split('T')[1].split('.')[0]} UTC
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-all duration-300">
            <span className="material-symbols-outlined text-[#c2c6d6]">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full border border-[#adc6ff]/20 p-0.5">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#adc6ff] to-[#b76dff]" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-6">
        
        {/* Stats Section */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <div className="glass p-6 rounded-2xl group hover:bg-[#292a2d] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-[#c2c6d6]">Active Agents</span>
              <span className="material-symbols-outlined text-[#adc6ff] text-xl">smart_toy</span>
            </div>
            <div className="text-4xl font-headline font-bold text-[#e3e2e5]">0{onlineAgents}<span className="text-[#adc6ff] text-lg ml-1">/05</span></div>
            <div className="mt-4 h-1 w-full bg-[#343538] rounded-full overflow-hidden">
              <div className="h-full bg-[#adc6ff]" style={{ width: `${(onlineAgents/5)*100}%` }}></div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl group hover:bg-[#292a2d] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-[#c2c6d6]">Tasks Completed</span>
              <span className="material-symbols-outlined text-[#7dffa2] text-xl">check_circle</span>
            </div>
            <div className="text-4xl font-headline font-bold text-[#e3e2e5]">1,284</div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-[#62ff96]">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12% FROM LAST SESSION</span>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl group hover:bg-[#292a2d] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-[#c2c6d6]">Pending Sync</span>
              <span className="material-symbols-outlined text-[#ddb7ff] text-xl">sync_alt</span>
            </div>
            <div className="text-4xl font-headline font-bold text-[#e3e2e5]">18</div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-[#ddb7ff]">
              <span>PROCESSING PIPELINE ACTIVE</span>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl group hover:bg-[#292a2d] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-[#c2c6d6]">System Uptime</span>
              <span className="material-symbols-outlined text-[#c2c6d6] text-xl">timer</span>
            </div>
            <div className="text-4xl font-headline font-bold text-[#e3e2e5]">99.9<span className="text-sm">%</span></div>
            <div className="mt-4 text-[10px] text-[#c2c6d6] uppercase tracking-widest">STABLE CORE OMEGA</div>
          </div>
        </section>

        {/* Main Control Hub */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass p-4 rounded-2xl">
            <h2 className="font-headline text-lg font-bold tracking-tight text-[#e3e2e5] px-4">ORCHESTRATION ENGINE</h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={startAllAgents}
                className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-[#7dffa2] to-[#05e777] text-[#003918] font-bold font-headline text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(125,255,162,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                INICIAR TODOS
              </button>
              <button 
                onClick={stopAllAgents}
                className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] font-bold font-headline text-sm tracking-widest uppercase hover:bg-[#93000a]/40 transition-all"
              >
                DETENER
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {agents.map(agent => {
              const agentColorBg = agent.status === 'online'
                ? (agent.color === 'orange' ? 'bg-[#adc6ff]/10 border-[#adc6ff]/20' : agent.color === 'pink' ? 'bg-[#7dffa2]/10 border-[#7dffa2]/20' : 'bg-[#ddb7ff]/10 border-[#ddb7ff]/20')
                : 'bg-[#343538] border-white/5';
              const agentColorText = agent.status === 'online'
                ? (agent.color === 'orange' ? 'text-[#adc6ff]' : agent.color === 'pink' ? 'text-[#7dffa2]' : 'text-[#ddb7ff]')
                : 'text-[#c2c6d6]';
              const agentColorGradient = agent.status === 'online'
                ? (agent.color === 'orange' ? 'from-[#adc6ff] to-[#ddb7ff] shadow-[0_0_10px_rgba(173,198,255,0.5)]' : agent.color === 'pink' ? 'from-[#7dffa2] to-[#05e777] shadow-[0_0_10px_rgba(125,255,162,0.3)]' : 'from-[#ddb7ff] to-[#4d8eff] shadow-[0_0_10px_rgba(221,183,255,0.4)]')
                : 'from-[#38393c] to-[#38393c]';
              return (
              <div 
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="glass p-5 rounded-2xl flex flex-col xl:flex-row xl:items-center gap-6 group hover:border-[#adc6ff]/30 transition-all duration-500"
              >
                <div className="flex items-center gap-4 xl:w-1/4">
                  <div className={`w-12 h-12 rounded-2xl ${agentColorBg} flex items-center justify-center border`}>
                    <span className={`material-symbols-outlined ${agentColorText}`}>{agent.icon === '⚡' ? 'terminal' : agent.icon === '🤖' ? 'data_thresholding' : agent.icon === '🧠' ? 'psychology' : 'monitoring'}</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-[#e3e2e5]">{agent.name}</h3>
                    <p className="text-[10px] text-[#c2c6d6] uppercase tracking-widest">{agent.role}</p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] text-[#c2c6d6] font-headline uppercase tracking-widest">
                    <span>Processing Load</span>
                    <span>{agent.load}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#343538] rounded-full overflow-hidden p-[1px]">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${agentColorGradient}`}
                      style={{ width: `${agent.load}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between xl:justify-end gap-6 xl:w-1/4">
                  <div className="text-right">
                    <div className="text-lg font-headline font-bold text-[#e3e2e5]">{agent.tasks}</div>
                    <div className="text-[9px] text-[#c2c6d6] uppercase tracking-widest">Tasks</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleAgent(agent.id); }}
                    className={`w-10 h-10 rounded-full ${agent.status === 'online' ? 'bg-[#292a2d] border border-white/5' : 'bg-[#adc6ff]/20 border border-[#adc6ff]/40'} flex items-center justify-center hover:scale-110 active:scale-95 transition-all`}
                  >
                    <span className={`material-symbols-outlined ${agent.status === 'online' ? 'text-[#adc6ff]' : 'text-[#adc6ff]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{agent.status === 'online' ? 'pause' : 'play_arrow'}</span>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* Right Sidebar - Quick Actions + Activity Feed */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="font-headline text-sm font-bold tracking-[0.2em] text-[#e3e2e5] uppercase mb-6">Quick Directives</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'cloud_upload', label: 'Deploy', color: 'text-[#adc6ff]' },
                { icon: 'analytics', label: 'Analyze', color: 'text-[#7dffa2]' },
                { icon: 'fork_right', label: 'Create PR', color: 'text-[#ddb7ff]' },
                { icon: 'sync', label: 'Sync', color: 'text-[#c2c6d6]' },
              ].map(action => (
                <button key={action.label} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#1a1c1e] border border-white/5 hover:bg-[#292a2d] transition-all">
                  <span className={`material-symbols-outlined ${action.color}`}>{action.icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#c2c6d6]">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Activity Feed */}
          <div className="glass p-6 rounded-2xl flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-sm font-bold tracking-[0.2em] text-[#e3e2e5] uppercase">Activity Log</h2>
              <span className="text-[9px] text-[#c2c6d6]">LIVE FEED</span>
            </div>
            <div className="space-y-6">
              {chats.slice(-4).reverse().map((chat, i) => (
                <div key={chat.id} className="flex gap-4">
                  <div className={`w-1 h-10 rounded-full ${i === 0 ? 'bg-[#7dffa2]' : i === 1 ? 'bg-[#adc6ff]' : 'bg-[#38393c]'}`}></div>
                  <div>
                    <p className="text-xs text-[#e3e2e5] leading-relaxed"><span className={`font-bold ${i === 0 ? 'text-[#7dffa2]' : 'text-[#adc6ff]'}`}>{chat.agent}</span> {chat.message}</p>
                    <span className="text-[9px] text-[#c2c6d6] font-mono">{chat.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Network Load */}
            <div className="mt-8 p-4 rounded-xl bg-[#0d0e11] border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-headline tracking-widest text-[#c2c6d6] uppercase">Network Load</span>
                <span className="text-[10px] font-mono text-[#7dffa2]">2.4 GB/s</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[40, 60, 30, 80, 50, 90, 45, 30].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#7dffa2]/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Tab Navigation + Content (inside col-span-8) */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Tab Navigation */}
          <div className="flex gap-1.5 p-1.5 glass rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Tasks */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c2c6d6] mb-4">Active Tasks</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#c2c6d6]">{task.assignedTo}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(task.status)}`}>{task.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Performance */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c2c6d6] mb-4">Agent Performance</h3>
              <div className="space-y-3">
                {agents.filter(a => a.status === 'online').slice(0, 4).map(agent => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <span className="text-lg">{agent.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{agent.name}</span>
                        <span className="text-xs text-gray-500">{agent.load}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getAgentGradient(agent.color)} rounded-full`}
                          style={{ width: `${agent.load}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {onlineAgents === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No agents online</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Design Studio Main */}
            <div className="lg:col-span-2 glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">Design Studio</h3>
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30">
                    Stitch Active
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium">
                    Preview
                  </button>
                  <button className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-bold">
                    Generate
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Design Description
                  </label>
                  <textarea
                    value={designPrompt}
                    onChange={(e) => setDesignPrompt(e.target.value)}
                    placeholder="Describe your design... e.g., 'Modern trading card with glass morphism, avatar, username, and action buttons'"
                    className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none resize-none text-white placeholder:text-gray-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="rounded-xl border border-white/10 bg-black/50 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-3">🎨</div>
                      <p className="text-gray-400 font-medium">Live Preview</p>
                      <p className="text-xs text-gray-600 mt-1">Generated designs appear here</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Component Library</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['TradingCard', 'SignalBadge', 'UserAvatar', 'ActionButton', 'MetricChart', 'PostCard'].map(comp => (
                        <div key={comp} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors cursor-pointer">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <span className="text-xs">📦</span>
                          </div>
                          <span className="text-xs font-medium">{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Projects */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Recent Projects</h3>
              <div className="space-y-3">
                {[
                  { id: '1', name: 'Dashboard Redesign', status: 'ready', createdAt: '2h ago' },
                  { id: '2', name: 'Mobile Navigation', status: 'generating', createdAt: '1h ago' },
                  { id: '3', name: 'Signal Cards', status: 'draft', createdAt: '30m ago' },
                ].map((project: { id: string; name: string; status: string; createdAt: string }) => (
                  <div key={project.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        project.status === 'ready' ? 'bg-[#00e676]/20 text-[#00e676]' :
                        project.status === 'generating' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">{project.createdAt}</p>
                  </div>
                ))}
                <button className="w-full p-3 rounded-xl border border-dashed border-white/20 text-gray-500 text-sm hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                  + New Project
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="glass rounded-2xl border border-white/10 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">AI Image Generator</h3>
                <p className="text-sm text-gray-500">Generate stunning images with Gemini Ultra</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Image Prompt
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A futuristic trading interface with holographic charts and neural network visualizations..."
                    className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none resize-none text-white placeholder:text-gray-500"
                  />
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  <select className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none">
                    <option>Realistic</option>
                    <option>Anime</option>
                    <option>3D Render</option>
                    <option>Abstract</option>
                  </select>
                  <select className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none">
                    <option>1920x1080</option>
                    <option>1024x1024</option>
                    <option>512x512</option>
                    <option>1024x1792</option>
                  </select>
                  <button className="flex-1 min-w-[200px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                    Generate Image
                  </button>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Generated Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square rounded-xl border border-white/10 bg-black/50 flex items-center justify-center hover:border-blue-500/30 transition-colors cursor-pointer">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🖼️</div>
                      <p className="text-xs text-gray-500">Image {i}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tasks' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Task Board</h3>
                <p className="text-sm text-gray-500">{pendingTasks} pending, {completedTasks} completed</p>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm w-64"
                />
                <button 
                  onClick={addTask}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  + New Task
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  className="glass rounded-xl border border-white/10 p-5 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${getStatusBadge(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  
                  <h4 className="font-bold mb-2">{task.title}</h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {task.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] bg-white/5 text-gray-500 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600" />
                      <span className="text-xs text-gray-500">{task.assignedTo}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{task.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'terminal' && (
          <section className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-[#00e676]" />
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  {agents.find(a => a.id === selectedAgent)?.name || 'Aurora'} Terminal
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10 transition-colors font-medium">
                  Clear
                </button>
                <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10 transition-colors font-medium">
                  Export
                </button>
              </div>
            </div>
            
            <div className="p-4 h-[500px] overflow-y-auto font-mono text-sm bg-black/60">
              {terminalOutput.map((line, i) => (
                <div key={i} className={`mb-1 ${line.startsWith('>') ? 'text-[#00e676]' : 'text-gray-300'}`}>
                  {line}
                </div>
              ))}
              <span className="animate-pulse text-[#00e676]">▊</span>
            </div>
          </section>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Commands Panel */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Quick Commands</h3>
              <div className="space-y-2">
                {[
                  { cmd: 'npm run dev', desc: 'Start dev server', icon: '🚀' },
                  { cmd: 'npm run build', desc: 'Build project', icon: '📦' },
                  { cmd: 'npm run lint', desc: 'Run linter', icon: '🔍' },
                  { cmd: 'npm test', desc: 'Run tests', icon: '✅' },
                  { cmd: 'git status', desc: 'Check git status', icon: '📊' },
                  { cmd: 'git commit -m ""', desc: 'Commit changes', icon: '💾' },
                  { cmd: 'npx convex dev', desc: 'Start Convex', icon: '🗄️' },
                  { cmd: 'stitch design', desc: 'Open Stitch', icon: '🎨' },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => setChatInput(item.cmd)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-medium truncate group-hover:text-blue-400">{item.cmd}</p>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Custom Command</h4>
                <input
                  type="text"
                  placeholder="Type custom command..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-xs font-mono"
                />
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 glass rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
                  🧠
                </div>
                <div>
                  <h3 className="font-bold">Aurora Core</h3>
                  <p className="text-xs text-[#00e676]">Online - Ready to assist</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    Clear
                  </button>
                  <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    Export Chat
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chats.map((chat, i) => (
                  <div key={i} className={`flex ${chat.agent === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      chat.agent === 'You' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-white/10 border border-white/10'
                    }`}>
                      <p className="text-sm">{chat.message}</p>
                      <p className={`text-[10px] mt-1 ${chat.agent === 'You' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {chat.agent} • {chat.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message or command..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm font-mono"
                  />
                  <button 
                    onClick={sendChat}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <section className="glass rounded-2xl border border-white/10 p-6 max-w-2xl">
            <h3 className="text-xl font-bold mb-6">Settings</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-3">API Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Stitch API Key</label>
                    <input 
                      type="password" 
                      defaultValue="AQ.Ab8R...KYGgDJA"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Gemini API Key</label>
                    <input 
                      type="password" 
                      placeholder="Enter API key..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-3">Agent Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-sm">Auto-start agents</span>
                    <button className="w-12 h-6 rounded-full bg-blue-500 relative">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-sm">Notifications</span>
                    <button className="w-12 h-6 rounded-full bg-blue-500 relative">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              </div>

              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                Save Settings
              </button>
            </div>
          </section>
        )}
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-[#121316]/80 backdrop-blur-2xl rounded-t-2xl border-t border-white/5">
        {[
          { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
          { id: 'design', icon: 'architecture', label: 'Studio' },
          { id: 'tasks', icon: 'assignment', label: 'Tasks' },
          { id: 'terminal', icon: 'terminal', label: 'Terminal' },
          { id: 'settings', icon: 'settings', label: 'Settings' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
              activeTab === item.id ? 'text-[#adc6ff] bg-[#adc6ff]/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-[#adc6ff]'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-headline text-[10px] uppercase tracking-[0.1em]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Decorative Debug Terminal */}
      <div className="fixed bottom-8 right-8 w-80 glass p-0 rounded-xl hidden xl:block overflow-hidden shadow-2xl border-[#adc6ff]/20">
        <div className="bg-[#343538] px-4 py-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#7dffa2]/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#adc6ff]/50"></div>
          </div>
          <span className="text-[9px] font-mono text-[#c2c6d6]">aurora-debug.log</span>
        </div>
        <div className="p-4 bg-[#0d0e11]/80 backdrop-blur-md h-48 font-mono text-[10px] text-[#adc6ff]/80 overflow-y-auto no-scrollbar">
          <p>[{currentTime.toISOString().split('T')[1].split('.')[0]}] NEURAL_BRIDGE_V2 INITIALIZED</p>
          <p>[{currentTime.toISOString().split('T')[1].split('.')[0]}] HANDSHAKE SUCCESSFUL</p>
          <p>[{currentTime.toISOString().split('T')[1].split('.')[0]}] LOAD BALANCER ACTIVE [WEIGHT: 0.84]</p>
          <p>[{currentTime.toISOString().split('T')[1].split('.')[0]}] ALL CORES SYNCED</p>
          <p>[{currentTime.toISOString().split('T')[1].split('.')[0]}] WAITING FOR USER INPUT...</p>
          <p className="animate-pulse">_</p>
        </div>
      </div>
    </div>
  );
};

export default AuroraNexus;
