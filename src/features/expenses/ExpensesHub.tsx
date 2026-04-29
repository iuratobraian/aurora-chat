import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../api';
import { 
  TrendingUp, TrendingDown, CreditCard, Calendar, Clock,
  Plus, Search, ArrowRight, DollarSign, Wallet,
  PieChart, History, PlusCircle, X, ChevronRight,
  ShoppingCart, Utensils, Home, Car, Coffee, 
  Heart, ShoppingBag, Settings, MoreHorizontal,
  ChevronLeft, Check, Smartphone, Mic, MicOff, Edit2, Trash2, Home as HomeIcon, MessageSquare
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { expenseAgent } from '../../lib/expenseAgent';

interface ExpensesHubProps {
  userId: string;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'supermarket', name: 'Supermercado', icon: <ShoppingCart size={20}/>, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'restaurants', name: 'Restaurantes', icon: <Utensils size={20}/>, color: 'bg-orange-100 text-orange-600' },
  { id: 'vivienda', name: 'Vivienda', icon: <Home size={20}/>, color: 'bg-blue-100 text-blue-600' },
  { id: 'coche', name: 'Coche', icon: <Car size={20}/>, color: 'theme-input theme-text-sec' },
  { id: 'ocio', name: 'Ocio', icon: <Coffee size={20}/>, color: 'bg-purple-100 text-purple-600' },
  { id: 'salud', name: 'Salud', icon: <Heart size={20}/>, color: 'bg-red-100 text-red-600' },
  { id: 'compras', name: 'Compras', icon: <ShoppingBag size={20}/>, color: 'bg-pink-100 text-pink-600' },
];

const ExpensesHub: React.FC<ExpensesHubProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'accounts'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  
  const expenses = useQuery(api.expenses.getExpenses, { userId }) || [];
  const accounts = useQuery(api.expenses.getAccounts, { userId }) || [];
  
  const addExpense = useMutation(api.expenses.addExpense);
  const addAccount = useMutation(api.expenses.addAccount);
  const updateExpense = useMutation(api.expenses.updateExpense);
  const deleteExpense = useMutation(api.expenses.deleteExpense);
  
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [naturalInput, setNaturalInput] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setNaturalInput(prev => prev + (prev ? ' ' : '') + final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    try {
      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
        setInterimTranscript('');
      } else {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Mic error:", err);
      setIsRecording(false);
      alert("Error al iniciar el micrófono.");
    }
  };

  const handleNaturalInput = async () => {
    if (!naturalInput.trim()) return;
    const parsed = expenseAgent.parse(naturalInput);
    if (parsed) {
      await addExpense({
        userId,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        date: new Date().toISOString().split('T')[0],
        note: parsed.note,
        accountId: selectedAccountId || undefined,
        paymentMethod: 'app',
        isRecurring: false
      });
      setNaturalInput('');
    }
  };

  const [amount, setAmount] = useState('0,00');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('supermarket');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('€');
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  const CURRENCIES = ['€', '$', 'ARS', 'MXN', 'COP', 'CLP', 'PEN', 'UYU'];

  const totalBalance = accounts.reduce((acc: number, curr: any) => acc + curr.balance, 0);
  const spentToday = expenses
    .filter((e: any) => isToday(new Date(e.createdAt)) && e.type === 'expense')
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const handleAddMovement = async () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) return;
    await addExpense({
      userId, amount: numAmount, type, category, date, note,
      accountId: selectedAccountId || undefined, paymentMethod: 'app', isRecurring
    });
    setShowAddModal(false);
    setAmount('0,00'); setNote('');
  };

  const groupExpensesByDate = () => {
    const groups: { [key: string]: any[] } = {};
    expenses.forEach((e: any) => {
      const d = format(new Date(e.createdAt), 'yyyy-MM-dd');
      if (!groups[d]) groups[d] = [];
      groups[d].push(e);
    });
    return groups;
  };

  const groupedExpenses = groupExpensesByDate();

  return (
    <div className="flex flex-col h-full theme-bg theme-text font-sans selection:bg-emerald-100">
      <div className="px-6 pt-[env(safe-area-inset-top,40px)] pb-6 flex flex-col items-center relative theme-surface border-b theme-border">
         <div className="w-full flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black tracking-tighter">finanzas<span className="text-emerald-500">.</span></h1>
            <button onClick={() => setShowSettings(true)} className="p-2 theme-input rounded-full theme-text-sec hover:theme-text transition-colors"><Settings size={18}/></button>
         </div>
         <div className="text-center mt-2">
            <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mb-1">Total en cuentas</p>
            <div className="relative inline-block">
              <h2 className="text-4xl font-black tracking-tight cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setShowCurrencySelector(!showCurrencySelector)}>
                {totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
              </h2>
              {showCurrencySelector && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 theme-surface border theme-border rounded-2xl shadow-2xl p-2 grid grid-cols-4 gap-1 z-[100] animate-in zoom-in duration-200">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => { setCurrency(c); setShowCurrencySelector(false); }} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currency === c ? 'bg-primary text-white' : 'hover:theme-input theme-text-sec'}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5">
               <div className="theme-input px-3 py-1 rounded-full flex items-center gap-1.5 border theme-border">
                   <TrendingDown size={10} className="theme-text-muted"/>
                   <span className="text-[10px] font-bold theme-text-sec">{spentToday.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency} hoy</span>
               </div>
            </div>
         </div>
         <div className="absolute top-[env(safe-area-inset-top,24px)] left-6 md:hidden">
            <button onClick={onClose} className="p-2 theme-text-sec hover:theme-text transition-colors"><X size={20}/></button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-8">
         <div className="theme-surface p-4 rounded-3xl border theme-border shadow-sm space-y-3">
            <p className="text-[9px] font-black theme-text-muted uppercase tracking-[0.3em]">Agregar por voz o texto</p>
            <div className="flex items-center gap-2">
               <input type="text" value={naturalInput} onChange={(e) => setNaturalInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleNaturalInput(); }} placeholder="Ej: Gasté 1000 en comida" className="flex-1 bg-transparent text-sm font-medium outline-none"/>
               <button onClick={toggleRecording} className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'theme-input theme-text-sec hover:theme-text'}`}>
                 {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
               </button>
               <button onClick={handleNaturalInput} className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Agregar</button>
            </div>
         </div>

         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black tracking-tight uppercase">Actividad</h3>
               <button className="p-1.5 theme-input rounded-lg theme-text-sec"><Search size={14}/></button>
            </div>
            <div className="space-y-8">
               {Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a)).map(dateStr => (
                  <div key={dateStr} className="space-y-3">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest theme-text-muted">
                        <span>{isToday(parseISO(dateStr)) ? 'Hoy' : isYesterday(parseISO(dateStr)) ? 'Ayer' : format(parseISO(dateStr), 'd MMMM', { locale: es })}</span>
                     </div>
                     <div className="space-y-2">
                        {groupedExpenses[dateStr].map(e => {
                           const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[0];
                           return (
                              <div key={e._id} className="theme-surface p-4 rounded-2xl border theme-border flex items-center gap-4 transition-all hover:border-primary/30 group relative">
                                 <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cat.color} shrink-0 shadow-sm`}>{cat.icon}</div>
                                 <div className="flex-1">
                                    <h4 className="text-xs font-bold capitalize">{e.note || cat.name}</h4>
                                    <p className="text-[9px] theme-text-muted font-bold uppercase tracking-wide mt-0.5">{format(new Date(e.createdAt), 'HH:mm')}</p>
                                 </div>
                                 <div className={`text-sm font-black tracking-tight ${e.type === 'income' ? 'text-emerald-500' : 'theme-text'}`}>
                                    {e.type === 'income' ? '+' : '-'}{e.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                                 </div>
                                 <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                                    <button onClick={() => { setEditingExpense(e); setAmount(e.amount.toString()); setType(e.type); setCategory(e.category); setNote(e.note || ''); setDate(new Date(e.createdAt).toISOString().split('T')[0]); setSelectedAccountId(e.accountId || null); setShowAddModal(true); }} className="p-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"><Edit2 size={12}/></button>
                                    <button onClick={async () => { if(confirm('¿Eliminar?')) await deleteExpense({ id: e._id, userId }); }} className="p-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={12}/></button>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 theme-surface border-t theme-border flex items-center justify-between relative">
         <button onClick={() => setActiveTab('dashboard')} className={`p-3 ${activeTab === 'dashboard' ? 'text-primary' : 'theme-text-sec'}`}><HomeIcon size={22}/></button>
         <button onClick={() => setActiveTab('calendar')} className={`p-3 ${activeTab === 'calendar' ? 'text-primary' : 'theme-text-sec'}`}><Calendar size={22}/></button>
         <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <button onClick={() => { setEditingExpense(null); setShowAddModal(true); }} className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 theme-bg"><Plus size={32}/></button>
         </div>
         <button onClick={() => setActiveTab('accounts')} className={`p-3 ${activeTab === 'accounts' ? 'text-primary' : 'theme-text-sec'}`}><Wallet size={22}/></button>
         <button onClick={() => setShowSettings(true)} className="p-3 theme-text-sec hover:text-primary"><Settings size={22}/></button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 theme-bg z-[1000] flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="p-6 flex items-center justify-between">
              <button onClick={() => setShowAddModal(false)} className="p-2 theme-input rounded-full theme-text-sec"><X size={20}/></button>
              <div className="theme-input p-1 rounded-xl flex gap-1">
                 <button onClick={() => setType('expense')} className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-primary text-white' : 'theme-text-muted'}`}>Gasto</button>
                 <button onClick={() => setType('income')} className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-primary text-white' : 'theme-text-muted'}`}>Ingreso</button>
              </div>
              <div className="w-10"></div>
           </div>
           <div className="flex-1 overflow-y-auto px-6 space-y-10 pt-4">
              <div className="text-center">
                 <p className="text-[9px] font-black theme-text-muted uppercase tracking-[0.3em] mb-2">Cantidad</p>
                 <input type="text" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-6xl font-black text-center outline-none bg-transparent tracking-tighter" autoFocus/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="theme-surface p-4 rounded-3xl border theme-border flex items-center gap-3">
                    <div className="p-2 theme-bg rounded-xl theme-text-muted"><Calendar size={18}/></div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[8px] font-black theme-text-muted uppercase">Fecha</p>
                       <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-[11px] font-bold outline-none w-full"/>
                    </div>
                 </div>
                 <div className="theme-surface p-4 rounded-3xl border theme-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 theme-bg rounded-xl theme-text-muted"><Clock size={18}/></div>
                       <p className="text-[10px] font-bold theme-text-sec">Fijo</p>
                    </div>
                    <button onClick={() => setIsRecurring(!isRecurring)} className={`w-10 h-5 rounded-full transition-all relative ${isRecurring ? 'bg-primary' : 'bg-gray-300'}`}>
                       <div className={`absolute top-1 w-3 h-3 theme-bg rounded-full transition-all ${isRecurring ? 'right-1' : 'left-1'}`}/>
                    </button>
                 </div>
              </div>
              <div className="space-y-4">
                 <p className="text-[9px] font-black theme-text-muted uppercase tracking-[0.3em]">Categoría</p>
                 <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {CATEGORIES.map(cat => (
                       <button key={cat.id} onClick={() => setCategory(cat.id)} className="flex flex-col items-center gap-3 shrink-0">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${category === cat.id ? 'bg-primary text-white scale-110 shadow-lg' : 'theme-input theme-text-muted'}`}>{cat.icon}</div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${category === cat.id ? 'text-primary' : 'theme-text-muted'}`}>{cat.name}</span>
                       </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] font-black theme-text-muted uppercase tracking-[0.3em]">Descripción</p>
                 <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Nota..." className="w-full bg-transparent border-b theme-border py-3 text-sm outline-none focus:border-primary transition-all"/>
              </div>
           </div>
           <div className="p-6">
              <button onClick={handleAddMovement} className="w-full bg-primary text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {editingExpense ? 'Actualizar' : 'Guardar'}
              </button>
           </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 theme-bg z-[1000] flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-6 flex items-center justify-between border-b theme-border">
              <button onClick={() => setShowSettings(false)} className="p-2 theme-input rounded-full theme-text-sec"><X size={20}/></button>
              <h2 className="text-sm font-black uppercase tracking-widest">Ajustes</h2>
              <div className="w-10"></div>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="theme-surface p-5 rounded-[2rem] border theme-border flex items-center justify-between">
                 <span className="text-sm font-bold">Moneda Principal</span>
                 <span className="text-primary font-black">{currency}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesHub;
