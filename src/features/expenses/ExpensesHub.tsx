import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  TrendingUp, TrendingDown, CreditCard, Calendar, 
  Plus, Search, ArrowRight, DollarSign, Wallet,
  PieChart, History, PlusCircle, X
} from 'lucide-react';
import { format } from 'date-fns';

interface ExpensesHubProps {
  userId: string;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'food', name: 'Alimentación', color: 'bg-orange-500' },
  { id: 'services', name: 'Servicios', color: 'bg-blue-500' },
  { id: 'transport', name: 'Transporte', color: 'bg-green-500' },
  { id: 'entertainment', name: 'Entretenimiento', color: 'bg-purple-500' },
  { id: 'health', name: 'Salud', color: 'bg-red-500' },
  { id: 'shopping', name: 'Compras', color: 'bg-pink-500' },
  { id: 'home', name: 'Hogar', color: 'bg-indigo-500' },
  { id: 'other', name: 'Otros', color: 'bg-gray-500' },
];

const ExpensesHub: React.FC<ExpensesHubProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'fixed' | 'cards'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Convex data
  const expenses = useQuery(api.expenses.getExpenses, { userId }) || [];
  const fixedExpenses = useQuery(api.expenses.getFixedExpenses, { userId }) || [];
  const cards = useQuery(api.expenses.getCards, { userId }) || [];
  
  const addExpense = useMutation(api.expenses.addExpense);

  const totalSpent = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Control de Gastos</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aurora Finance Pro</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 gap-4 border-b border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Resumen', icon: <PieChart size={16}/> },
          { id: 'history', label: 'Historial', icon: <History size={16}/> },
          { id: 'fixed', label: 'Fijos', icon: <Calendar size={16}/> },
          { id: 'cards', label: 'Tarjetas', icon: <CreditCard size={16}/> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingDown size={80} className="text-red-500" />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Gastos del Mes</p>
                <h3 className="text-3xl font-black italic tracking-tighter">${totalSpent.toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-lg font-bold">↑ 12% vs mes anterior</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={80} className="text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Ingresos del Mes</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-emerald-400">${totalIncome.toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold">Balance Positivo</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                 <PlusCircle size={18}/> Nuevo Gasto
               </button>
               <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                 <History size={18}/> Ver Reporte
               </button>
            </div>

            {/* Recent Movements */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Movimientos Recientes</h4>
              <div className="space-y-2">
                {expenses.slice(0, 5).map(e => (
                  <div key={e._id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CATEGORIES.find(c => c.id === e.category)?.color || 'bg-gray-500'} bg-opacity-20`}>
                        <DollarSign size={18} className={CATEGORIES.find(c => c.id === e.category)?.color.replace('bg-', 'text-') || 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{e.note || 'Gasto General'}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-black">{e.paymentMethod} • {e.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black italic ${e.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {e.type === 'income' ? '+' : '-'}${e.amount.toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-600 font-bold uppercase">{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Historial Completo</h4>
                <div className="flex gap-2">
                  <button className="p-1.5 bg-white/5 rounded-lg text-gray-400"><Search size={14}/></button>
                </div>
              </div>
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e._id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="text-[10px] font-mono text-gray-600">{e.date.split('-')[2]}</div>
                       <div>
                         <p className="text-xs font-bold">{e.note || 'Sin nota'}</p>
                         <p className="text-[9px] text-gray-500 uppercase font-black">{e.paymentMethod}</p>
                       </div>
                    </div>
                    <div className={`text-sm font-black italic ${e.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      ${e.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>

      {/* Add Modal (Simplified for demo) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest text-center">Registrar Gasto</h2>
              <div className="space-y-4">
                <input type="number" placeholder="Monto" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-black outline-none focus:border-primary" />
                <input type="text" placeholder="Concepto / Nota" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary" />
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-primary">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-500">Cancelar</button>
                <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-primary/20">Guardar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesHub;
