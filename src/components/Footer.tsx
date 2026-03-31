import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Herramienta, Ad } from '../types';

interface FooterProps {
  onNavigate?: (pestaña: string) => void;
  usuario?: { rol: string; id: string } | null;
  herramientas?: Herramienta[];
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const DEFAULT_BANNER_AD: Ad = {
  id: 'default-banner', titulo: 'Domina el Trading Institucional',
  descripcion: 'TradeShare Ecosystem: La red social definitiva para traders.',
  imagenUrl: 'https://images.unsplash.com/photo-1611974717482-972179c1955a?q=80&w=2070', link: '#',
  sector: 'dashboard', activo: true,
};

const Footer: React.FC<FooterProps> = ({ onNavigate, usuario }) => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [dynamicTools, setDynamicTools] = useState<Herramienta[]>([]);
  const [bannerAd, setBannerAd] = useState<Ad>(DEFAULT_BANNER_AD);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const isAdminOrCeo = usuario?.rol === 'admin' || usuario?.rol === 'ceo';

  useEffect(() => {
    StorageService.getHerramientas().then(tools => {
      setDynamicTools(tools.filter(t => t.activo));
    });
    StorageService.getAds().then(ads => {
      const dashboardAd = ads.find((a: Ad) => a.activo && a.sector === 'dashboard');
      if (dashboardAd) setBannerAd(dashboardAd);
    });
  }, []);

  const handleNav = (p: string) => {
    if (onNavigate) {
      onNavigate(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      
      if (response.ok) {
        setFormStatus('sent');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => { setShowContactForm(false); setFormStatus('idle'); }, 3000);
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      setFormStatus('error');
    }
  };

  // Update last seen + get online count for admin
  useEffect(() => {
    if (usuario && usuario.id !== 'guest') {
      // Update last seen for current user
      const updateLastSeen = async () => {
        try {
          const u = await StorageService.getUserById(usuario.id);
          if (u) {
            await StorageService.updateUser({ ...u, lastSeen: Date.now() } as any);
          }
        } catch (e) { /* silent */ }
      };

      updateLastSeen();
      const interval = setInterval(updateLastSeen, 60000); // Update every minute

      // Get online user count (for admin/ceo)
      if (isAdminOrCeo) {
        const fetchOnlineCount = async () => {
          try {
            const allUsers = await StorageService.getAllUsers();
            const fiveMinAgo = Date.now() - 5 * 60 * 1000;
            const online = allUsers.filter((u: any) => u.lastSeen && u.lastSeen > fiveMinAgo);
            setOnlineCount(online.length);
          } catch (e) { setOnlineCount(1); }
        };
        fetchOnlineCount();
        const countInterval = setInterval(fetchOnlineCount, 30000);
        return () => { clearInterval(interval); clearInterval(countInterval); };
      }

      return () => clearInterval(interval);
    }
  }, [usuario?.id, isAdminOrCeo]);

  return (
    <footer className="bg-white/50 dark:bg-[#0a0c10] border-t border-gray-200 dark:border-white/5 py-16 mt-20 backdrop-blur-md">

      {/* Main Banner Ad */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative w-full rounded-2xl p-[2px] overflow-hidden group shadow-2xl">
          <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#3b82f6_360deg)] z-0 opacity-60 pointer-events-none" />
          <div className="absolute inset-[-50%] animate-[spin_5s_linear_infinite_reverse] bg-[conic-gradient(from_0deg,transparent_0_220deg,#06b6d4_360deg)] z-0 opacity-60 pointer-events-none" />
          <div className="relative w-full h-32 md:h-44 rounded-[12px] overflow-hidden bg-[#050510] z-10">
            <img
              src={(bannerAd as any).imagenUrl || (bannerAd as any).tradingViewUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-[#050510]/80 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-center z-10 w-full md:w-2/3">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] font-black uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {(bannerAd as any).subtitle || 'Recomendado'}
                </span>
                <span className="text-white/50 text-[8px] font-bold uppercase tracking-widest">
                  {(bannerAd as any).extra || 'TradeShare Pro'}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 uppercase tracking-tighter leading-none mb-3 drop-shadow-md">
                {bannerAd.titulo}
              </h2>
              <a
                href={(bannerAd as any).link || '#'}
                className="self-start px-6 py-2.5 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-400 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all backdrop-blur-md"
              >
                Explorar ahora
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 px-1">Herramientas Pro</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {dynamicTools.length > 0 ? dynamicTools.map(t => (
            <ToolCard key={t.id} icon={t.icon || 'build'} name={t.nombre} link={t.link} />
          )) : (
            <>
              <ToolCard icon="show_chart" name="TradingView" link="https://tradingview.com" />
              <ToolCard icon="monitoring" name="MetaTrader 5" link="https://www.metatrader5.com" />
              <ToolCard icon="query_stats" name="MQL5 Community" link="https://mql5.com" />
              <ToolCard icon="account_balance_wallet" name="Trust Wallet" link="https://trustwallet.com" />
              <ToolCard icon="currency_exchange" name="Binance" link="https://binance.com" />
              <ToolCard icon="security" name="Ledger" link="https://ledger.com" />
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TradeHub" className="h-10 w-10" />
            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">TradeHub</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm font-bold leading-relaxed">
            El ecosistema de trading institucional más avanzado. Comparte, aprende y conquista los mercados con el poder de la comunidad.
          </p>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
              Versión Platinum 2026
            </span>
          </div>
        </div>

        {/* Site Map - Plataforma */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-6 opacity-50">Plataforma</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li><button onClick={() => handleNav('dashboard')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Inicio</button></li>
            <li><button onClick={() => handleNav('comunidad')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Comunidad</button></li>
            <li><button onClick={() => handleNav('grafico')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Gráfico</button></li>
            <li><button onClick={() => handleNav('academia')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Academia</button></li>
            <li><button onClick={() => handleNav('discover')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Descubrir</button></li>
            <li><button onClick={() => handleNav('leaderboard')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Ranking</button></li>
          </ul>
        </div>

        {/* Site Map - Servicios */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-6 opacity-50">Servicios</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li><button onClick={() => handleNav('creator')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Creador</button></li>
            <li><button onClick={() => handleNav('signals')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Señales</button></li>
            <li><button onClick={() => handleNav('propfirms')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Prop Firms</button></li>
            <li><button onClick={() => handleNav('marketing')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Marketing</button></li>
            <li><button onClick={() => handleNav('exness')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Exness</button></li>
            <li><button onClick={() => handleNav('courses')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Cursos</button></li>
          </ul>
        </div>

        {/* Site Map - Información */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-6 opacity-50">Información</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li><button onClick={() => handleNav('legal')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Términos</button></li>
            <li><button onClick={() => handleNav('legal')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Privacidad</button></li>
            <li><button onClick={() => handleNav('legal')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors text-red-500">Aviso de Riesgo</button></li>
            <li><button onClick={() => handleNav('legal')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Cookies</button></li>
            <li><button onClick={() => handleNav('legal')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Licencias</button></li>
            <li><button onClick={() => handleNav('legal')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">FAQ</button></li>
          </ul>
        </div>

        {/* Site Map - Contacto */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-6 opacity-50">Contacto</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li>
              <button 
                onClick={() => setShowContactForm(!showContactForm)} 
                className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                Contáctanos
              </button>
            </li>
            <li><a href="mailto:soporte@tradehub.com" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">soporte@tradehub.com</a></li>
            <li><span className="text-gray-500 dark:text-gray-400">+1 (555) 123-4567</span></li>
            <li><button onClick={() => handleNav('bitacora')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Bitácora</button></li>
            <li><button onClick={() => handleNav('auroraSupport')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Soporte IA</button></li>
          </ul>
        </div>
      </div>

      {/* Site Map Links Row */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-gray-200 dark:border-white/5">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-bold">
          <button onClick={() => handleNav('juegos')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Juegos</button>
          <button onClick={() => handleNav('expertadvisors')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Expert Advisors</button>
          <button onClick={() => handleNav('psicotrading')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Psicotrading</button>
          <button onClick={() => handleNav('youtube')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">YouTube AI</button>
          <button onClick={() => handleNav('instagram')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Instagram</button>
          <button onClick={() => handleNav('marketplace')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Marketplace</button>
          <button onClick={() => handleNav('news')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Noticias</button>
          <button onClick={() => handleNav('config')} className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Configuración</button>
        </div>
      </div>

      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Envíanos un mensaje</h3>
              <button onClick={() => setShowContactForm(false)} className="text-white/60 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1">Asunto</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  required
                  className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Selecciona un tema...</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="ventas">Ventas</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-white/60 mb-1">Mensaje</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              
              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formStatus === 'sending' ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Enviando...
                  </>
                ) : formStatus === 'sent' ? (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    ¡Enviado!
                  </>
                ) : formStatus === 'error' ? (
                  <>
                    <span className="material-symbols-outlined">error</span>
                    Intentar de nuevo
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          © {new Date().getFullYear()} TradeHub Ecosystem. Made with <span className="text-red-500">❤</span> for the community.
        </p>
        <div className="flex items-center gap-6">
          {/* Online Counter - Only for admin/ceo */}
          {isAdminOrCeo && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]"></div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">
                {onlineCount} {onlineCount === 1 ? 'Usuario' : 'Usuarios'} en línea
              </span>
            </div>
          )}
          <a href="#" className="text-gray-400 hover:text-primary transition-all scale-100 hover:scale-110"><span className="material-symbols-outlined">brand_awareness</span></a>
          <a href="#" className="text-gray-400 hover:text-primary transition-all scale-100 hover:scale-110"><span className="material-symbols-outlined">currency_bitcoin</span></a>
          <a href="#" className="text-gray-400 hover:text-primary transition-all scale-100 hover:scale-110"><span className="material-symbols-outlined">alternate_email</span></a>
        </div>
      </div>
    </footer>
  );
};

const ToolCard: React.FC<{ icon: string; name: string; link: string }> = ({ icon, name, link }) => (
  <a 
    href={link} target="_blank" rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-white/20 dark:bg-white/[0.02] hover:bg-white/40 dark:hover:bg-white/[0.05] transition-all group"
  >
    <span className="material-symbols-outlined text-xl text-gray-500 group-hover:text-primary transition-colors">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors">{name}</span>
  </a>
);

export default Footer;
