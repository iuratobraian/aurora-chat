import React, { useState } from 'react';

type LegalSection = 'legal' | 'terms' | 'privacy' | 'risk';

const LegalView: React.FC = () => {
    const [activeSection, setActiveSection] = useState<LegalSection>('legal');

    const sections = [
        { id: 'legal', label: 'Legal', icon: 'gavel' },
        { id: 'terms', label: 'Términos', icon: 'description' },
        { id: 'privacy', label: 'Privacidad', icon: 'shield_lock' },
        { id: 'risk', label: 'Aviso de Riesgo', icon: 'warning' },
    ];

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in duration-700">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
                    Centro <span className="text-primary">Legal</span>
                </h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.4em]">Transparencia y Seguridad</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id as LegalSection)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border ${activeSection === s.id
                                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105'
                                : 'bg-white/50 dark:bg-white/5 text-gray-500 border-white/10 hover:bg-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                    </button>
                ))}
            </div>

            <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl">
                {activeSection === 'legal' && (
                    <div className="prose prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Información Legal</h2>
                        <p className="font-medium leading-relaxed">
                            TradeHub Ecosystem es una plataforma educativa y una comunidad de análisis financiero operada bajo los estándares internacionales de transparencia. Nuestra misión es democratizar el conocimiento del trading institucional.
                        </p>
                        <div className="bg-primary/10 p-6 rounded-2xl border-l-4 border-primary">
                            <p className="text-sm font-bold text-primary italic">
                                "La educación es el activo más valioso en los mercados financieros."
                            </p>
                        </div>
                        <p>
                            Todas las marcas, logos y contenido visual son propiedad de TradeHub. Queda prohibida la reproducción total o parcial de nuestro material académico sin autorización expresa.
                        </p>
                    </div>
                )}

                {activeSection === 'terms' && (
                    <div className="prose prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Términos de Servicio</h2>
                        <ul className="space-y-4 list-none p-0">
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                <div>
                                    <strong className="block text-gray-900 dark:text-white uppercase text-xs mb-1">Uso de la Cuenta</strong>
                                    <p className="text-sm">El acceso es personal e intransferible. El uso compartido de cuentas PRO resultará en la suspensión inmediata.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                <div>
                                    <strong className="block text-gray-900 dark:text-white uppercase text-xs mb-1">Conducta de la Comunidad</strong>
                                    <p className="text-sm">Se requiere el máximo respeto entre analistas. No se permite el spam, acoso o promoción de servicios externos no autorizados.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                <div>
                                    <strong className="block text-gray-900 dark:text-white uppercase text-xs mb-1">Propiedad Intelectual</strong>
                                    <p className="text-sm">Las ideas de trading publicadas en el feed son para fines educativos. TradeHub no se hace responsable de las copias externas.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}

                {activeSection === 'privacy' && (
                    <div className="prose prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Política de Privacidad</h2>
                        <p className="font-medium">
                            En TradeHub, la protección de tus datos es nuestra prioridad. Utilizamos tecnología de encriptación de grado militar para asegurar tu información personal.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="text-[10px] font-black uppercase text-primary mb-2">Datos Recopilados</h4>
                                <p className="text-xs">Email, nombre de usuario y métricas de desempeño para fines de gamificación y personalización educativa.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="text-[10px] font-black uppercase text-primary mb-2">Cookies</h4>
                                <p className="text-xs">Utilizamos cookies esenciales para mantener tu sesión activa y mejorar la velocidad de carga de la plataforma.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'risk' && (
                    <div className="prose prose-invert max-w-none space-y-6">
                        <div className="bg-red-500/10 border-2 border-red-500/20 p-8 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 text-red-500 mb-2">
                                <span className="material-symbols-outlined text-3xl font-black">warning</span>
                                <h2 className="text-2xl font-black uppercase">Advertencia de Riesgo</h2>
                            </div>
                            <p className="text-red-900 dark:text-red-200 font-black text-sm leading-relaxed">
                                EL TRADING CONLLEVA UN RIESGO SIGNIFICATIVO. EL 80% DE LOS TRADERS PIERDEN DINERO. NO INVIERTA CAPITAL QUE NO PUEDA PERMITIRSE PERDER.
                            </p>
                            <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed">
                                Todo el contenido compartido en TradeHub, incluyendo análisis de la IA, ideas de usuarios y material académico, tiene fines ÚNICAMENTE EDUCATIVOS. No constituimos asesoría financiera ni recomendación de inversión. El usuario es el único responsable de sus decisiones operativas en el mercado real.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Última actualización: Marzo 2026 • TradeHub Compliance Department
            </div>
        </div>
    );
};

export default LegalView;
