import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../api';
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
    .filter((e: any) => e.type === 'expense')
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const totalIncome = expenses
    .filter((e: any) => e.type === 'income')
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white selection:bg-primary/30">
      {/* Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01] backdrop-blur-3xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group">
            <Wallet size={28} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Neuro Finance</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] opacity-60">Aurora Capital Manager</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all active:scale-90 shadow-inner">
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-8 pt-6 gap-8 border-b border-white/5 overflow-x-auto no-scrollbar bg-white/[0.01]">
        {[
          { id: 'dashboard', label: 'Matriz', icon: <PieChart size={18}/> },
          { id: 'history', label: 'Registros', icon: <History size={18}/> },
          { id: 'fixed', label: 'Suscripciones', icon: <Calendar size={18}/> },
          { id: 'cards', label: 'Activos', icon: <CreditCard size={18}/> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <span className={`${activeTab === tab.id ? 'text-primary' : 'text-inherit'}`}>{tab.icon}</span> 
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-in fade-in slide-in-from-bottom-1" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group border-red-500/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingDown size={120} className="text-red-500" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Flujo de Salida</p>
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter">${totalSpent.toLocaleString()}</h3>
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-[9px] bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-red-500/10">Déficit Operativo</span>
                </div>
              </div>

              <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group border-emerald-500/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={120} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Inyección de Capital</p>
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter text-emerald-400">${totalIncome.toLocaleString()}</h3>
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/10">Excedente Neto</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-6">
               <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-4 bg-white text-black py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                 <PlusCircle size={22}/> Nuevo Registro
               </button>
               <button className="flex items-center justify-center gap-4 bg-white/[0.03] border border-white/5 text-gray-400 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/[0.06] hover:text-white transition-all active:scale-95">
                 <History size={22}/> Analítica
               </button>
            </div>

            {/* Recent Movements */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Sincronizaciones Recientes</h4>
                <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Ver Todo</button>
              </div>
              <div className="space-y-3">
                {expenses.slice(0, 5).map((e: any, idx: number) => (
                  <div key={e._id} 
                       className="bg-white/[0.02] border border-white/5 p-5 rounded-[1.75rem] flex items-center justify-between hover:bg-white/[0.04] transition-all group animate-in slide-in-from-right duration-500"
                       style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${CATEGORIES.find(c => c.id === e.category)?.color || 'bg-gray-500'} bg-opacity-10 border border-current transition-transform group-hover:scale-105`}>
                        <DollarSign size={24} className={CATEGORIES.find(c => c.id === e.category)?.color.replace('bg-', 'text-') || 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight">{e.note || 'Transacción Aurora'}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.1em] mt-1">{e.paymentMethod} • <span className="text-gray-400">{e.category}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black italic tracking-tighter ${e.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {e.type === 'income' ? '+' : '-'}${e.amount.toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest mt-1">{format(new Date(e.date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Libro Mayor Digitizado</h4>
                <div className="flex gap-3">
                  <button className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><Search size={16}/></button>
                </div>
              </div>
              <div className="space-y-3">
                {expenses.map((e: any, idx: number) => (
                  <div key={e._id} className="bg-white/[0.02] border border-white/5 p-5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/[0.04] transition-all"
                       style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex items-center gap-5">
                       <div className="text-[11px] font-mono text-gray-600 w-8">{format(new Date(e.date), 'dd')}</div>
                       <div>
                         <p className="text-sm font-bold">{e.note || 'Sin etiqueta'}</p>
                         <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{e.paymentMethod} • {e.category}</p>
                       </div>
                    </div>
                    <div className={`text-lg font-black italic tracking-tighter ${e.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      ${e.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="glass-panel border border-white/10 rounded-[3rem] p-10 w-full max-w-md space-y-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
              
              <div className="text-center space-y-2 relative">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Nueva Entrada</h2>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Asignación de recursos</p>
              </div>

              <div className="space-y-6 relative">
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={24} />
                  <input type="number" placeholder="0.00" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-14 py-6 text-white text-3xl font-black italic outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-800" />
                </div>
                
                <input type="text" placeholder="Descripción de la operación" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700" />
                
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white text-[11px] font-black uppercase outline-none focus:border-primary/50 appearance-none cursor-pointer">
                    <option value="expense">Salida</option>
                    <option value="income">Entrada</option>
                  </select>
                  <select className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white text-[11px] font-black uppercase outline-none focus:border-primary/50 appearance-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 relative pt-4">
                <button className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:bg-gray-100 active:scale-[0.98] transition-all">Sincronizar Datos</button>
                <button onClick={() => setShowAddModal(false)} className="w-full py-4 text-[10px] font-black uppercase text-gray-600 tracking-widest hover:text-white transition-colors">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesHub;
