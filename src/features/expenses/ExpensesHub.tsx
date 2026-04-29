import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../api';
import { 
  TrendingUp, TrendingDown, CreditCard, Calendar, Clock,
  Plus, Search, ArrowRight, DollarSign, Wallet,
  PieChart, History, PlusCircle, X, ChevronRight,
  ShoppingCart, Utensils, Home, Car, Coffee, 
  Heart, ShoppingBag, Settings, MoreHorizontal,
  ChevronLeft, Check, Smartphone, Mic, MicOff, Edit2, Trash2
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { expenseAgent, ParsedExpense } from '../../lib/expenseAgent';

interface ExpensesHubProps {
  userId: string;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'supermarket', name: 'Supermercado', icon: <ShoppingCart size={20}/>, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'restaurants', name: 'Restaurantes', icon: <Utensils size={20}/>, color: 'bg-orange-100 text-orange-600' },
  { id: 'vivienda', name: 'Vivienda', icon: <Home size={20}/>, color: 'bg-blue-100 text-blue-600' },
  { id: 'coche', name: 'Coche', icon: <Car size={20}/>, color: 'bg-gray-100 text-gray-600' },
  { id: 'ocio', name: 'Ocio', icon: <Coffee size={20}/>, color: 'bg-purple-100 text-purple-600' },
  { id: 'salud', name: 'Salud', icon: <Heart size={20}/>, color: 'bg-red-100 text-red-600' },
  { id: 'compras', name: 'Compras', icon: <ShoppingBag size={20}/>, color: 'bg-pink-100 text-pink-600' },
];

const ExpensesHub: React.FC<ExpensesHubProps> = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'accounts'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  
  // Convex data
  const expenses = useQuery(api.expenses.getExpenses, { userId }) || [];
  const accounts = useQuery(api.expenses.getAccounts, { userId }) || [];
  
  const addExpense = useMutation(api.expenses.addExpense);
  const addAccount = useMutation(api.expenses.addAccount);
  const updateExpense = useMutation(api.expenses.updateExpense);
  const deleteExpense = useMutation(api.expenses.deleteExpense);
  
  // Edit state
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  // Voice/Text input state
  const [naturalInput, setNaturalInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Natural language expense handler
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
  
  // Voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setNaturalInput(transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);
  
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // Form State
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

const totalBalance = accounts.reduce((acc: number, curr: { balance: number }) => acc + curr.balance, 0);
const spentToday = expenses
  .filter((e: { createdAt: string; type: string }) => isToday(new Date(e.createdAt)) && e.type === 'expense')
  .reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);

  const handleAddMovement = async () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      await addExpense({
        userId,
        amount: numAmount,
        type,
        category,
        date,
        note,
        accountId: selectedAccountId || undefined,
        paymentMethod: 'app',
        isRecurring
      });
      setShowAddModal(false);
      setAmount('0,00');
      setNote('');
    } catch (err) {
      console.error("Error adding movement", err);
    }
  };

  const groupExpensesByDate = () => {
    const groups: { [key: string]: any[] } = {};
    expenses.forEach((e: { createdAt: string }) => {
      const d = format(new Date(e.createdAt), 'yyyy-MM-dd');
      if (!groups[d]) groups[d] = [];
      groups[d].push(e);
    });
    return groups;
  };

  const groupedExpenses = groupExpensesByDate();

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      {/* Header Neto Style */}
      <div className="px-6 pt-12 pb-6 flex flex-col items-center relative bg-[#f1f3f4] border-b border-gray-100">
         <div className="w-full flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black tracking-tighter">finanzas<span className="text-emerald-500">.</span></h1>
           <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600"><Settings size={18}/></button>
         </div>
         
         <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total en cuentas</p>
            <div className="relative inline-block">
              <h2 className="text-4xl font-black tracking-tight cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setShowCurrencySelector(!showCurrencySelector)}>
                {totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
              </h2>
              {showCurrencySelector && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#f1f3f4] border border-gray-100 rounded-2xl shadow-2xl p-2 grid grid-cols-4 gap-1 z-[100] animate-in zoom-in duration-200">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => { setCurrency(c); setShowCurrencySelector(false); }} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currency === c ? 'bg-black theme-text' : 'hover:bg-gray-50 text-gray-400'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5">
               <div className="bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-gray-100">
                   <TrendingDown size={10} className="text-gray-400"/>
                   <span className="text-[10px] font-bold text-gray-500">{spentToday.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency} gastado hoy</span>
               </div>
            </div>
         </div>

         <div className="absolute top-6 left-6 md:hidden">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
         </div>
      </div>

       {/* Main Content */}
       <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-8">
         
         {/* Natural Language Input */}
         <div className="bg-[#f1f3f4] p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Agregar por voz o texto</p>
            <div className="flex items-center gap-2">
               <input 
                 type="text" 
                 value={naturalInput}
                 onChange={(e) => setNaturalInput(e.target.value)}
                 onKeyDown={(e) => { if(e.key === 'Enter') handleNaturalInput(); }}
                 placeholder="Ej: Gasté 1000 en combustible"
                 className="flex-1 bg-transparent text-sm font-medium outline-none"
               />
               <button 
                 onClick={toggleRecording}
                 className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
                 {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
               </button>
               <button 
                 onClick={handleNaturalInput}
                 className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                 Agregar
               </button>
            </div>
         </div>
         
         {/* Promoted Section */}
         <div className="bg-[#f1f3f4] p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
              <DollarSign size={24}/>
           </div>
           <div className="flex-1">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-bold">Ahorra más con nuestros socios</h3>
                 <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase font-black">Socios Promocionados</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Descubre planes de ahorro exclusivos para usuarios de Neto.</p>
           </div>
           <button className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-[10px] font-bold">Ver ofertas</button>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight">Actividad reciente</h3>
              <button className="p-1.5 bg-gray-100 rounded-lg text-gray-400"><Search size={14}/></button>
           </div>

           <div className="space-y-8">
              {Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a)).map(dateStr => {
                 const dayExpenses = groupedExpenses[dateStr];
                 const dayTotal = dayExpenses.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
                 const dateObj = parseISO(dateStr);
                 
                 let label = format(dateObj, 'd MMMM', { locale: es });
                 if (isToday(dateObj)) label = 'Hoy';
                 if (isYesterday(dateObj)) label = 'Ayer';

                 return (
                    <div key={dateStr} className="space-y-3">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span>{label}</span>
                          <span className={dayTotal >= 0 ? 'text-emerald-500' : 'text-gray-900'}>
                             {dayTotal >= 0 ? '+' : ''}{dayTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                          </span>
                       </div>
                        <div className="space-y-2">
                           {dayExpenses.map(e => {
                              const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[0];
                              return (
                                 <div key={e._id} className="bg-[#f1f3f4] p-4 rounded-2xl border border-gray-100 flex items-center gap-4 transition-all hover:border-emerald-200 group relative">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cat.color} shrink-0 shadow-sm`}>
                                       {cat.icon}
                                    </div>
                                    <div className="flex-1">
                                       <h4 className="text-xs font-bold capitalize">{e.note || cat.name}</h4>
                                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{format(new Date(e.createdAt), 'HH:mm')}</p>
                                    </div>
                                    <div className={`text-sm font-black tracking-tight ${e.type === 'income' ? 'text-emerald-500' : 'text-gray-900'}`}>
                                       {e.type === 'income' ? '+' : '-'}{e.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}
                                    </div>
                                    {/* Edit/Delete buttons - visible on hover */}
                                    <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                                       <button onClick={() => { setEditingExpense(e); setAmount(e.amount.toString()); setType(e.type); setCategory(e.category); setNote(e.note || ''); setDate(new Date(e.createdAt).toISOString().split('T')[0]); setSelectedAccountId(e.accountId || null); setShowAddModal(true); }} className="p-1 bg-blue-50 rounded-lg text-blue-500 hover:bg-blue-100">
                                          <Edit2 size={12}/>
                                       </button>
                                       <button onClick={async () => { if(confirm('¿Eliminar este movimiento?')) await deleteExpense({ id: e._id, userId }); }} className="p-1 bg-red-50 rounded-lg text-red-500 hover:bg-red-100">
                                          <Trash2 size={12}/>
                                       </button>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                    </div>
                 );
              })}
           </div>
        </div>

        <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-4">Consejo: desliza a la izquierda para editar o eliminar.</p>
      </div>

       {/* Bottom Nav - Full width, safe area */}
       <div className="px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-4 bg-[#f1f3f4] border-t border-gray-100 flex items-center justify-between relative">
          <button onClick={() => setActiveTab('dashboard')} className={`p-3 ${activeTab === 'dashboard' ? 'text-gray-900' : 'text-gray-300'}`}><Home size={22}/></button>
          <button onClick={() => { setShowCalendarView(true); setActiveTab('calendar'); }} className={`p-3 ${activeTab === 'calendar' ? 'text-gray-900' : 'text-gray-300'}`}><Calendar size={22}/></button>
          
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
             <button onClick={() => { setEditingExpense(null); setShowAddModal(true); }} className="w-16 h-16 bg-black theme-text rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                <Plus size={32}/>
             </button>
          </div>

          <button onClick={() => setActiveTab('accounts')} className={`p-3 ${activeTab === 'accounts' ? 'text-gray-900' : 'text-gray-300'}`}><Wallet size={22}/></button>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-600"><X size={22}/></button>
       </div>

      {/* Add Movement Modal Neto Style */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#f1f3f4] z-[500] flex flex-col animate-in slide-in-from-bottom duration-300">
           {/* Modal Header */}
           <div className="p-6 flex items-center justify-between">
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
              <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                 <button 
                   onClick={() => setType('expense')}
                   className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-black theme-text shadow-lg' : 'text-gray-400'}`}>Gasto</button>
                 <button 
                   onClick={() => setType('income')}
                   className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-black theme-text shadow-lg' : 'text-gray-400'}`}>Ingreso</button>
              </div>
              <button className="p-2 bg-gray-100 rounded-full text-gray-500"><MoreHorizontal size={20}/></button>
           </div>

           <div className="flex-1 overflow-y-auto px-6 space-y-10 pt-4">
              {/* Amount Input */}
              <div className="text-center">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Cantidad</p>
                 <input 
                   type="text"
                   value={amount}
                   onChange={e => setAmount(e.target.value)}
                   className="w-full text-6xl font-black text-center outline-none bg-transparent tracking-tighter"
                   autoFocus
                 />
              </div>

              {/* Date & Recurrent */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-[#f1f3f4] rounded-xl shadow-sm text-gray-400"><Calendar size={18}/></div>
                    <div>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fecha</p>
                       <input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="bg-transparent text-[11px] font-bold outline-none w-full"/>
                    </div>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-[#f1f3f4] rounded-xl shadow-sm text-gray-400"><Clock size={18}/></div>
                       <p className="text-[10px] font-bold text-gray-500">Recurrente 👑</p>
                    </div>
                    <button 
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isRecurring ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-[#f1f3f4] rounded-full transition-all ${isRecurring ? 'right-1' : 'left-1'}`}/>
                    </button>
                 </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-4">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Cuenta</p>
                 {accounts.length === 0 ? (
                    <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-dashed border-gray-200 text-center space-y-4">
                       <p className="text-xs text-gray-400 font-medium px-4">Aún no tienes cuentas. Crea una para poder asignar el movimiento.</p>
                       <button onClick={async () => {
                         await addAccount({ userId, name: 'Efectivo', type: 'cash', balance: 0 });
                       }} className="bg-black theme-text px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Ir a Cuentas</button>
                    </div>
                 ) : (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                       {accounts.map((acc: { _id: string; type: string; name: string }) => (
                          <button
                            key={acc._id}
                            onClick={() => setSelectedAccountId(acc._id)}
                            className={`px-6 py-4 rounded-3xl border transition-all whitespace-nowrap flex flex-col items-start gap-1 ${selectedAccountId === acc._id ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 bg-[#f1f3f4]'}`}>
                             <span className="text-[9px] font-bold text-gray-400 uppercase">{acc.type}</span>
                             <span className="text-sm font-black">{acc.name}</span>
                          </button>
                       ))}
                    </div>
                 )}
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Categoría</p>
                 <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                    {CATEGORIES.map(cat => (
                       <button 
                         key={cat.id}
                         onClick={() => setCategory(cat.id)}
                         className="flex flex-col items-center gap-3 shrink-0 group">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${category === cat.id ? 'bg-gray-900 theme-text shadow-xl scale-110' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                             {cat.icon}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${category === cat.id ? 'text-gray-900' : 'text-gray-400'}`}>{cat.name}</span>
                       </button>
                    ))}
                 </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Notas (Opcional)</p>
                 <input 
                   type="text" 
                   value={note}
                   onChange={e => setNote(e.target.value)}
                   placeholder="Añade una descripción..." 
                   className="w-full bg-transparent border-b border-gray-100 py-3 text-sm outline-none focus:border-gray-900 transition-all"
                 />
              </div>
           </div>

            {/* Save Button */}
            <div className="p-6">
               <button 
                 onClick={async () => {
                   if (editingExpense) {
                     await updateExpense({
                       id: editingExpense._id,
                       userId,
                       amount: parseFloat(amount.replace(',', '.')),
                       type,
                       category,
                       date,
                       note,
                       accountId: selectedAccountId || undefined,
                       paymentMethod: 'app',
                       isRecurring
                     });
                     setEditingExpense(null);
                   } else {
                     await handleAddMovement();
                   }
                   setShowAddModal(false);
                 }}
                 className="w-full bg-black theme-text py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-2xl">
                  {editingExpense ? 'Actualizar' : 'Guardar movimiento'}
               </button>
            </div>
        </div>
      )}

      {/* Accounts Management View */}
      {activeTab === 'accounts' && (
        <div className="fixed inset-0 bg-[#f1f3f4] z-[400] flex flex-col animate-in fade-in duration-300">
           <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <button onClick={() => setActiveTab('dashboard')} className="p-2 bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20}/></button>
              <h2 className="text-sm font-black uppercase tracking-widest">Mis Cuentas</h2>
              <button 
                onClick={() => addAccount({ userId, name: 'Nueva Cuenta', type: 'bank', balance: 0 })}
                className="p-2 bg-emerald-50 rounded-full text-emerald-500"><Plus size={20}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {accounts.map((acc: { _id: string; name: string; type: string; balance: number }) => (
                  <div key={acc._id} className="bg-[#f1f3f4] p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                           <CreditCard size={24}/>
                        </div>
                        <div>
                           <h4 className="text-sm font-black">{acc.name}</h4>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{acc.type}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black tracking-tight">{acc.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currency}</p>
                     </div>
                  </div>
               ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesHub;
