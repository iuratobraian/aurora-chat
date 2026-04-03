import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage';
import { Usuario } from '../types';
import { NeonLoader } from './ui/NeonLoader';
import { GlowCard } from './ui/GlowCard';
import { GalaxyButton } from './ui/GalaxyButton';
import { Starfield, DotPattern } from './ui/PremiumBackgrounds';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';

interface AuthModalProps {
  type: 'login' | 'register';
  onClose: () => void;
  onSuccess: (u: Usuario) => void;
}

// Password strength calculator
const calcPasswordStrength = (password: string): { score: number; label: string; color: string; checks: Record<string, boolean> } => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
  return { score, label: labels[score] || '', color: colors[score] || '', checks };
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AuthModal: React.FC<AuthModalProps> = ({ type: initialType, onClose, onSuccess }) => {
  const [view, setView] = useState<'login' | 'register' | 'recover'>(initialType);
  const [formData, setFormData] = useState({ usuario: '', email: '', password: '', nombre: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeError, setReferralCodeError] = useState('');

  const passwordStrength = calcPasswordStrength(formData.password);

  // Pre-populate referral code from sessionStorage (URL param captured by App.tsx)
  useEffect(() => {
    if (view === 'register') {
      const pending = StorageService.getPendingReferralCode();
      if (pending) setReferralCode(pending);
    }
  }, [view]);

  // Check username availability on debounce
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) { setUsernameSuggestion(''); return; }
    setCheckingUsername(true);
    try {
      const users = await StorageService.getAllUsers();
      const lower = username.toLowerCase();
      const taken = users.some(u => u.usuario?.toLowerCase() === lower);
      if (taken) {
        const suffix = Math.floor(Math.random() * 900) + 100;
        setUsernameSuggestion(`${lower}${suffix}`);
      } else {
        setUsernameSuggestion('');
      }
    } catch {}
    setCheckingUsername(false);
  }, []);

  useEffect(() => {
    if (view !== 'register') return;
    const timer = setTimeout(() => checkUsername(formData.usuario), 600);
    return () => clearTimeout(timer);
  }, [formData.usuario, view, checkUsername]);

  useEffect(() => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    const initGoogle = () => {
      if (!clientId || !(window as any).google || (view !== 'login' && view !== 'register')) return;

      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true);
            try {
              const { user, error: googleError } = await StorageService.handleGoogleSignIn(response);
              if (user) onSuccess(user);
              else setError(googleError || 'Error al autenticar con Google');
            } catch (err) {
              setError('Error de conexión con Google');
            } finally {
              setLoading(false);
            }
          }
        });

        const btnContainer = document.getElementById('google-signin-btn');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(
            btnContainer,
            { theme: 'filled_black', size: 'large', width: '300px', shape: 'pill', text: view === 'login' ? 'signin_with' : 'signup_with' }
          );
        }
      } catch {
        setError('No se pudo inicializar Google Sign-In');
      }
    };

    initGoogle();
    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [view, onSuccess]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (view === 'login') {
        const { user, error: loginError } = await StorageService.login(formData.usuario, formData.password);
        if (user) onSuccess(user);
        else setError(loginError || 'Error de autenticación');
      } else if (view === 'register') {
        if (!formData.usuario || !formData.email || !formData.password) {
          setError('Completa todos los campos');
        } else if (!isValidEmail(formData.email)) {
          setError('El email no es válido');
        } else if (usernameSuggestion) {
          setError(`El nombre de usuario ya está en uso. Prueba: @${usernameSuggestion}`);
        } else if (passwordStrength.score < 3) {
          setError('La contraseña no es lo suficientemente segura. Agrega mayúsculas, números o caracteres especiales.');
        } else {
          const normalizedData = { ...formData, usuario: formData.usuario.toLowerCase().trim() };
          const { user, error: regError } = await StorageService.register(normalizedData);
          if (user) {
            await StorageService.sendWelcomeEmail(user);
            StorageService.clearPendingReferralCode();
            onSuccess(user);
          } else setError(regError || 'Error al registrar');
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-700">
      <Starfield />
      <DotPattern />
      
      <div className="relative w-full max-w-lg">
        <button 
          onClick={onClose} 
          className="absolute -top-12 right-0 size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all z-[110] text-gray-400 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">close</span>
        </button>

        <GlowCard className="overflow-hidden p-0 bg-[#0f1115]/80">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="p-8 sm:p-12">
            {loading ? (
              <div className="py-12">
                <NeonLoader size="lg" />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="flex flex-col items-center mb-10 text-center">
                  <div className="size-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
                      {view === 'login' ? 'terminal' : view === 'register' ? 'person_add' : 'key'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white">
                    {view === 'login' ? 'Conexión Segura' : view === 'register' ? 'Nuevo Miembro' : 'Recuperar Acceso'}
                  </h2>
                  <div className="w-16 h-1 bg-primary/40 mt-3 rounded-full"></div>
                </div>

                {view === 'login' && (
                  <LoginForm 
                    onLogin={handleSubmit} 
                    formData={formData} 
                    setFormData={setFormData}
                    onSwitchToRegister={() => setView('register')}
                    onForgotPassword={() => setView('recover')}
                  />
                )}

                {view === 'register' && (
                  <RegisterForm 
                    onRegister={handleSubmit} 
                    formData={formData} 
                    setFormData={setFormData}
                    onSwitchToLogin={() => setView('login')}
                    checkingUsername={checkingUsername}
                    usernameAvailable={!usernameSuggestion}
                  />
                )}

                {error && <p className="text-red-400 text-[10px] font-black text-center bg-red-400/5 py-3 px-4 rounded-xl border border-red-400/20 italic mt-6 w-full animate-in shake-1 duration-300">{error}</p>}
                
                {(view === 'login' || view === 'register') && (
                  <div className="w-full flex flex-col items-center gap-6 mt-8">
                    <div className="flex items-center gap-4 w-full opacity-30">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Redes Sociales</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
                    </div>
                    <div id="google-signin-btn" className="transition-all hover:scale-[1.02]"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlowCard>
      </div>
    </div>
  );
};

export default AuthModal;
