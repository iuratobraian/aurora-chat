import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { Usuario, Herramienta } from '../types';
import { StorageService } from '../services/storage';
import { api } from "../../convex/_generated/api";
import CursosView from './CursosView';
import logger from '../utils/logger';

const FAQ_DATA = [
    {
        q: "¿De qué trata TradeHub?",
        a: "Somos el ecosistema número uno para analistas financieros y traders que buscan profesionalizarse. Ofrecemos herramientas, educación y una comunidad sólida para compartir análisis en tiempo real."
    },
    {
        q: "¿Cómo puedo acceder al curso privado?",
        a: "El curso privado está disponible para miembros con rango 'Cursante' o superior. Puedes contactar a soporte o revisar la sección de 'Cursos' para ver las membresías disponibles."
    },
    {
        q: "¿Cómo funciona el Bot de AutoTrading?",
        a: "Nuestro bot utiliza algoritmos institucionales para identificar setups de alta probabilidad. Es una herramienta exclusiva para la comunidad VIP."
    },
    {
        q: "¿Qué beneficios tiene ser usuario PRO?",
        a: "Los usuarios PRO obtienen el badge verificado, acceso a indicadores exclusivos, mayor visibilidad en el feed y participación en sorteos mensuales de cuentas fondeadas."
    }
];

interface Props {
    usuario: Usuario | null;
    onLoginRequest: () => void;
    onNavigate?: (tab: string) => void;
    onVisitProfile: (id: string) => void;
}

const AcademiaView: React.FC<Props> = ({ usuario, onLoginRequest, onVisitProfile }) => {
    const isAdmin = usuario?.rol === 'admin' || usuario?.rol === 'ceo';
    const ELEVATED_ROLES = ['cursante', 'vip', 'admin', 'ceo', 'programador', 'colaborador', 'trader_experimentado', 'diseñador'];
    const isMember = usuario ? ELEVATED_ROLES.includes(usuario.rol) : false;

    // Q&A Queries/Mutations
    const questions = useQuery(api.qa.getQuestions, { adminView: isAdmin });
    const ads = useQuery(api.ads.getAds);
    const askMutation = useMutation(api.qa.askQuestion);
    const answerMutation = useMutation(api.qa.answerQuestion);
    const deleteMutation = useMutation(api.qa.deleteQuestion);

    const [newQuestion, setNewQuestion] = useState('');
    const [isAnon, setIsAnon] = useState(true);
    const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});

    const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
    const [loadingHerramientas, setLoadingHerramientas] = useState(false);

    useEffect(() => {
        fetchHerramientas();
    }, []);

    const fetchHerramientas = async () => {
        setLoadingHerramientas(true);
        try {
            const data = await StorageService.getHerramientas();
            setHerramientas(data);
        } catch (err) {
            logger.error("Error fetching tools:", err);
        } finally {
            setLoadingHerramientas(false);
        }
    };

    const handleAnswer = async (id: any) => {
        if (!answerText[id]?.trim()) return;
        await answerMutation({ id, respuesta: answerText[id] });
        setAnswerText(prev => ({ ...prev, [id]: '' }));
    };

    const handleAsk = async () => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        if (!newQuestion.trim()) return;
        await askMutation({
            userId: usuario.id,
            pregunta: newQuestion,
            isAnonymous: isAnon
        });
        setNewQuestion('');
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* Banner Section - Show only to guests/logged out users */}
            {(!usuario || usuario.id === 'guest') && (
                <div className="relative rounded-2xl overflow-hidden bg-[#0f1115] border border-white/5 p-5 md:p-6 shadow-xl mb-10">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-primary text-white text-[7px] font-black uppercase tracking-[0.2em] rounded-full">Academy Pro</span>
                                <div className="size-1 rounded-full bg-signal-green animate-pulse"></div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-[1] mb-3">
                                Lleva tu Trading al <span className="text-primary italic">Siguiente Nivel</span>
                            </h1>
                            <p className="text-[10px] md:text-xs text-gray-400 font-medium leading-relaxed max-w-lg">
                                Accede a formación técnica de alto nivel, herramientas institucionales y soporte directo de analistas expertos en una sola comunidad.
                            </p>
                        </div>
                        <div className="shrink-0 relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-1000"></div>
                            <div className="relative size-24 md:size-28 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 flex items-center justify-center shadow-inner">
                                <span className="text-4xl select-none group-hover:scale-110 transition-transform duration-700">🚀</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 gap-12">
                {/* 1. SECTOR ACADEMIA (CORE) */}
                <section id="academia-main" className="animate-in fade-in duration-700">
                    {(!isMember) ? (
                        <div className="py-12 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Elegí tu camino</h2>
                                <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                                    Seleccioná el plan que mejor se adapte a tu compromiso. Todos los pagos se procesan de forma segura en pesos argentinos.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
                                {/* Mensual */}
                                <div className="bg-[#0f1115] rounded-3xl p-8 border border-white/5 flex flex-col hover:border-white/10 transition-colors shadow-lg">
                                    <h3 className="text-xl font-black text-white mb-2">Mensual</h3>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-white tracking-tighter">$150.000</span>
                                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ARS/mes</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-widest">Pago mes a mes</p>
                                    <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed">
                                        Ideal para conocer la metodología y dar los primeros pasos.
                                    </p>
                                    <ul className="space-y-4 mb-8 text-sm text-gray-300 font-medium">
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Acceso completo al curso de 0 a 100</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Sesiones en vivo (New York) L-V</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Comunidad VIP en WhatsApp (Proyecciones)</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Bitácora automatizada MT5</li>
                                        <li className="flex items-start gap-3 opacity-40"><span className="material-symbols-outlined text-gray-500 shrink-0 font-bold">close</span>BOT Autotrading no incluido</li>
                                    </ul>
                                    <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/5 text-white font-black uppercase text-xs tracking-[0.2em] transition-all" onClick={onLoginRequest}>Inscribirse</button>
                                </div>
                                
                                {/* Anual */}
                                <div className="bg-[#0f1115] rounded-3xl p-8 border-2 border-signal-green relative flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.15)] transform md:-translate-y-4">
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-signal-green text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-signal-green/20 whitespace-nowrap">
                                        RECOMENDADO
                                    </div>
                                    <div className="flex justify-between items-start mb-2 mt-2">
                                        <h3 className="text-xl font-black text-white">Anual</h3>
                                        <span className="bg-signal-green/20 text-signal-green px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-signal-green/20">16% OFF</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-[9px] text-gray-400 font-black flex flex-col leading-none uppercase tracking-widest"><span className="mb-0.5">12</span><span className="mb-0.5">cuotas</span><span>de</span></div>
                                        <span className="text-[2.6rem] leading-none font-black text-white tracking-tighter">$150.000</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ARS</span>
                                    </div>
                                    <p className="text-[11px] text-signal-green mb-6 font-bold tracking-wide">Total: $1.500 USD <span className="text-gray-500 line-through decoration-gray-500 ml-1">$1.800 USD</span></p>
                                    <p className="text-sm text-signal-green mb-8 flex-1 leading-relaxed font-bold">
                                        El tiempo necesario para ver resultados reales y consistentes.
                                    </p>
                                    <ul className="space-y-4 mb-6 text-sm text-gray-300 font-medium">
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Acceso completo al curso de 0 a 100</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Sesiones en vivo (New York) L-V</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Comunidad VIP en WhatsApp (Proyecciones)</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Bitácora automatizada MT5</li>
                                    </ul>
                                    <div className="bg-[#182321] border border-signal-green/20 rounded-xl p-3.5 mb-8 flex items-center gap-3 shadow-inner shadow-signal-green/5">
                                        <span className="material-symbols-outlined text-signal-green text-3xl animate-pulse">energy_savings_leaf</span>
                                        <p className="text-xs text-white font-black leading-tight uppercase tracking-tight">INCLUYE BOT Autotrading<br/><span className="text-[10px] text-signal-green font-bold tracking-widest leading-relaxed">de Alta Precisión</span></p>
                                    </div>
                                    <button className="w-full py-4 rounded-xl bg-signal-green hover:bg-[#10b981] text-black font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-signal-green/20" onClick={onLoginRequest}>Inscribirse al Anual</button>
                                </div>
                                
                                {/* Trimestral */}
                                <div className="bg-[#0f1115] rounded-3xl p-8 border border-white/5 flex flex-col hover:border-white/10 transition-colors shadow-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black text-white">Trimestral</h3>
                                        <span className="bg-signal-green/20 text-signal-green px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-signal-green/20">16% OFF</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-[9px] text-gray-400 font-black flex flex-col leading-none uppercase tracking-widest"><span className="mb-0.5">3</span><span className="mb-0.5">cuotas</span><span>de</span></div>
                                        <span className="text-[2.6rem] leading-none font-black text-white tracking-tighter">$125.000</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ARS</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mb-6 font-bold tracking-wide">Total: $375.000 ARS</p>
                                    <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed">
                                        Para quienes buscan un compromiso a mediano plazo.
                                    </p>
                                    <ul className="space-y-4 mb-8 text-sm text-gray-300 font-medium">
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Acceso completo al curso de 0 a 100</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Sesiones en vivo (New York) L-V</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Comunidad VIP en WhatsApp (Proyecciones)</li>
                                        <li className="flex items-start gap-3"><span className="material-symbols-outlined text-signal-green shrink-0 font-bold">check_circle</span>Bitácora automatizada MT5</li>
                                        <li className="flex items-start gap-3 opacity-40"><span className="material-symbols-outlined text-gray-500 shrink-0 font-bold">close</span>BOT Autotrading no incluido</li>
                                    </ul>
                                    <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/5 text-white font-black uppercase text-xs tracking-[0.2em] transition-all" onClick={onLoginRequest}>Inscribirse</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CursosView usuario={usuario} onVisitProfile={onVisitProfile} onLoginRequest={onLoginRequest} />
                    )}
                </section>

                {/* 2. SECTOR CONSULTAS (Integrated) */}
                <section id="consultas" className="pt-10 border-t border-white/5 space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">Consultas <span className="text-primary italic">Directas</span></h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Soporte técnico y académico para miembros activos</p>
                    </div>

                    {!isMember ? (
                        <div className="glass rounded-3xl p-12 text-center border border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 bg-primary/20 blur-[80px] rounded-full"></div>
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-6xl text-primary/40 mb-4">lock_person</span>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Acceso Restringido</h3>
                                <p className="text-[10px] text-gray-500 font-bold max-w-sm mx-auto mb-8 leading-relaxed">
                                    Esta sala es exclusiva para alumnos activos. Aquí resolvemos dudas técnicas y damos seguimiento personal a tu progreso.
                                </p>
                                <button onClick={onLoginRequest} className="px-8 py-3.5 bg-primary text-white rounded-xl font-black uppercase tracking-[0.3em] text-[9px] shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                                    Iniciar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4 lg:sticky lg:top-24">
                                <div className="glass rounded-3xl p-8 bg-white/5 border border-white/10 shadow-xl">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Nueva Consulta
                                    </h3>
                                    <textarea
                                        value={newQuestion}
                                        onChange={e => setNewQuestion(e.target.value)}
                                        placeholder="¿En qué podemos ayudarte hoy?"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] text-white outline-none focus:border-primary transition-all min-h-[140px] resize-none font-bold"
                                    />
                                    <div className="flex flex-col gap-4 mt-6">
                                        <label className="flex items-center gap-3 cursor-pointer group p-3 border border-white/5 rounded-xl hover:bg-white/5 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={isAnon}
                                                onChange={e => setIsAnon(e.target.checked)}
                                                className="size-4 accent-primary border-none rounded"
                                            />
                                            <div>
                                                <p className="text-[9px] font-black uppercase text-white tracking-widest leading-none mb-1">Modo Anónimo</p>
                                                <p className="text-[7px] font-bold text-gray-500 uppercase">Ocultar mi identidad</p>
                                            </div>
                                        </label>
                                        <button
                                            onClick={handleAsk}
                                            className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-primary/20 hover:bg-blue-600 transition-all"
                                        >
                                            Enviar Consulta
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-4">
                                {questions?.map(q => (
                                    <div key={q._id} className={`glass rounded-2xl p-6 border transition-all duration-500 overflow-hidden relative group ${q.respondida ? 'border-white/5 bg-white/[0.02]' : 'border-yellow-500/20 bg-yellow-500/[0.02]'}`}>
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                            <span className="material-symbols-outlined text-8xl">forum</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary text-base">alternate_email</span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                        {q.isAnonymous ? 'Consulta de Alumno' : 'Consulta Técnica'}
                                                    </span>
                                                </div>
                                                {!q.respondida && (
                                                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest rounded border border-yellow-500/20">En Proceso</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-white/90 font-black italic mb-6 leading-relaxed">"{q.pregunta}"</p>

                                            {q.respondida ? (
                                                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 animate-in slide-in-from-left-4 duration-700">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Respuesta de Academia TS</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-300 leading-relaxed font-bold italic">{q.respuesta}</p>
                                                </div>
                                            ) : isAdmin ? (
                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <textarea
                                                        value={answerText[q._id] || ''}
                                                        onChange={e => setAnswerText({ ...answerText, [q._id]: e.target.value })}
                                                        placeholder="Escribe la respuesta experta..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[11px] text-white outline-none focus:border-primary font-bold"
                                                    />
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => deleteMutation({ id: q._id })} className="px-4 py-2 text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 rounded-lg transition-all">Descartar</button>
                                                        <button onClick={() => handleAnswer(q._id)} className="px-6 py-2 bg-signal-green text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-signal-green/20">Publicar</button>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* FAQ Section at the end */}
            {(!usuario || usuario.id === 'guest') && (
                <section id="faq" className="pt-16 border-t border-white/5 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full"></div>
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">Preguntas <span className="text-primary italic">Frecuentes</span></h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Todo lo que necesitas saber antes de empezar</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {FAQ_DATA.map((item, i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-300">
                                <div className="flex items-start gap-5">
                                    <span className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">0{i + 1}</span>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{item.q}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AcademiaView;
