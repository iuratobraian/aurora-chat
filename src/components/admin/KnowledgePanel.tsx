import React, { useState } from 'react';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'user' | 'content' | 'community' | 'course';
  connections: string[];
}

const DEMO_NODES: KnowledgeNode[] = [
  { id: '1', label: 'Juan Pérez', type: 'user', connections: ['2', '3'] },
  { id: '2', label: 'Trading Masters', type: 'community', connections: ['1', '4'] },
  { id: '3', label: 'Análisis BTC', type: 'content', connections: ['1', '4'] },
  { id: '4', label: 'Curso Forex', type: 'course', connections: ['2', '3'] },
];

export const KnowledgePanel: React.FC = () => {
  const [nodes] = useState<KnowledgeNode[]>(DEMO_NODES);
  const [search, setSearch] = useState('');

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'content': return 'bg-purple-500/20 border-purple-500 text-purple-400';
      case 'community': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'course': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const filteredNodes = nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span>🧠</span> Knowledge Graph
      </h3>
      
      <input
        type="text"
        placeholder="Buscar nodos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
      />

      <div className="space-y-3">
        {filteredNodes.map(node => (
          <div key={node.id} className={`p-3 rounded-xl border ${getNodeColor(node.type)}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">{node.label}</span>
              <span className="text-xs uppercase px-2 py-0.5 bg-white/10 rounded-full">{node.type}</span>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              {node.connections.map(conn => {
                const connected = nodes.find(n => n.id === conn);
                return connected ? (
                  <span key={conn} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                    → {connected.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white/5 rounded-xl">
        <p className="text-xs text-gray-400">Estadísticas</p>
        <div className="grid grid-cols-4 gap-2 mt-2 text-center">
          <div><div className="text-lg font-bold text-blue-400">{nodes.filter(n => n.type === 'user').length}</div><div className="text-[10px] text-gray-500">Users</div></div>
          <div><div className="text-lg font-bold text-green-400">{nodes.filter(n => n.type === 'community').length}</div><div className="text-[10px] text-gray-500">Comms</div></div>
          <div><div className="text-lg font-bold text-purple-400">{nodes.filter(n => n.type === 'content').length}</div><div className="text-[10px] text-gray-500">Posts</div></div>
          <div><div className="text-lg font-bold text-orange-400">{nodes.filter(n => n.type === 'course').length}</div><div className="text-[10px] text-gray-500">Courses</div></div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePanel;