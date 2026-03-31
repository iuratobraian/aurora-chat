import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage';
import { Usuario } from '../types';
import ElectricLoader from './ElectricLoader';

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
        // Generate suggestions
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
    // Initialize Google Identity Services
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    
    const initGoogle = () => {
      if (!clientId || !(window as any).google || (view !== 'login' && view !== 'register')) {
        return;
      }

      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true);
            try {
              const { user, error: googleError } = await StorageService.handleGoogleSignIn(response);
              if (user) {
                onSuccess(user);
              } else {
                setError(googleError || 'Error al autenticar con Google');
              }
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

    // Initial attempt
    initGoogle();

    // If script slow to load
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
          // Normalise username to lowercase before registering
          const normalizedData = { ...formData, usuario: formData.usuario.toLowerCase().trim() };
          const { user, error: regError } = await StorageService.register(normalizedData);
          if (user) {
            await StorageService.sendWelcomeEmail(user);
            StorageService.clearPendingReferralCode();
            onSuccess(user);
          } else setError(regError || 'Error al registrar');
        }
      } else if (view === 'recover') {
        if (step === 1) {
          if (!isValidEmail(formData.email)) {
            setError('El email no es válido');
          } else {
            const { success, error: recError } = await StorageService.sendPasswordResetEmail(formData.email);
            if (success) { setMessage('Se ha enviado un código de recuperación a tu correo.'); setStep(2); }
            else setError(recError || 'Error al enviar recuperación');
          }
        } else {
          if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
          } else {
            const { success, error: resError } = await StorageService.resetPassword(formData.email, formData.newPassword);
            if (success) { setMessage('Contraseña actualizada con éxito. Ya puedes iniciar sesión.'); setTimeout(() => setView('login'), 2000); }
            else setError(resError || 'Error al actualizar contraseña');
          }
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="absolute size-[600px] bg-primary/10 rounded-full blur-[140px] animate-pulse"></div>
      
      <div className="relative group">
        <button onClick={onClose} className="absolute -top-16 right-0 md:-right-16 size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-colors z-[110] text-gray-400">
            <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className={`absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-primary via-violet-500 to-cyan-400 opacity-30 blur-md group-hover:opacity-50 transition-opacity duration-1000 ${loading ? 'animate-spin-slow' : 'animate-pulse'}`}></div>
        
        <div className={`relative w-[420px] sm:w-[500px] flex flex-col items-center justify-center bg-[#0f1115]/90 backdrop-blur-2xl rounded-[3rem] border border-primary/20 p-8 sm:p-12 shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden transition-all duration-700 ${loading ? 'scale-95' : 'scale-100'}`}>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
               <ElectricLoader size="lg" text={view === 'login' ? 'Sincronizando...' : 'Procesando Perfil...'} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    {view === 'login' ? 'terminal' : view === 'register' ? 'person_add' : 'key'}
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">
                  {view === 'login' ? 'Conectar Terminal' : view === 'register' ? 'Nuevo Registro' : 'Recuperar Acceso'}
                </h2>
                <div className="w-12 h-1 bg-primary/50 mt-2 rounded-full"></div>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-3 max-h-[350px] overflow-y-auto px-4 py-2 custom-scrollbar">
                {view === 'register' && (
                  <input
                    autoFocus type="text" required
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none transition-all"
                    placeholder="Nombre Real"
                  />
                )}

                {view !== 'recover' ? (
                  <div>
                    <div className="relative">
                      <input
                        type="text" required
                        autoFocus={view === 'login'}
                        value={formData.usuario}
                        onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none transition-all ${view === 'register' && usernameSuggestion ? 'border-orange-500/50' : 'border-white/10'}`}
                        placeholder={view === 'login' ? 'Email o Usuario' : 'Nombre de Usuario (@minusculas)'}
                      />
                      {view === 'register' && checkingUsername && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin material-symbols-outlined text-sm">sync</span>
                      )}
                      {view === 'register' && !checkingUsername && formData.usuario.length >= 3 && !usernameSuggestion && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 material-symbols-outlined text-sm">check_circle</span>
                      )}
                    </div>
                    {view === 'register' && usernameSuggestion && (
                      <div className="mt-1 text-[10px] text-orange-400 font-bold flex items-center gap-1.5 px-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Usuario en uso. Sugerencia:&nbsp;
                        <button type="button" onClick={() => { setFormData(f => ({ ...f, usuario: usernameSuggestion })); setUsernameSuggestion(''); }} className="underline text-primary hover:text-blue-400">
                          @{usernameSuggestion}
                        </button>
                      </div>
                    )}
                    {view === 'register' && formData.usuario.length >= 3 && !usernameSuggestion && !checkingUsername && (
                      <p className="mt-1 text-[10px] text-green-400 font-bold px-1">✓ @{formData.usuario.toLowerCase()} disponible</p>
                    )}
                  </div>
                ) : (
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={e => { setFormData({ ...formData, email: e.target.value }); setEmailError(''); }}
                    onBlur={() => { if (formData.email && !isValidEmail(formData.email)) setEmailError('Email inválido'); else setEmailError(''); }}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none transition-all ${emailError ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder="Email de la cuenta"
                  />
                )}

                {view === 'register' && (
                  <div>
                    <input
                      type="email" required
                      value={formData.email}
                      onChange={e => { setFormData({ ...formData, email: e.target.value }); setEmailError(''); }}
                      onBlur={() => { if (formData.email && !isValidEmail(formData.email)) setEmailError('Email inválido'); else setEmailError(''); }}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none transition-all ${emailError ? 'border-red-500/50' : 'border-white/10'}`}
                      placeholder="Email corporativo o personal"
                    />
                    {emailError && <p className="mt-1 text-[9px] text-red-400 px-1">{emailError}</p>}
                  </div>
                )}

                {view === 'login' && (
                  <div className="space-y-1">
                    <input
                      type="password" required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none transition-all"
                      placeholder="Contraseña"
                    />
                    <div className="flex justify-end pr-1">
                      <button type="button" onClick={() => { setView('recover'); setStep(1); setEmailError(''); }} className="text-[9px] font-bold text-gray-500 hover:text-primary transition-colors">¿Olvidaste tu contraseña?</button>
                    </div>
                  </div>
                )}

                {view === 'register' && (
                  <div className="space-y-2">
                    <input
                      type="password" required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none transition-all"
                      placeholder="Contraseña segura"
                    />
                    {/* Password strength bar */}
                    {formData.password.length > 0 && (
                      <div className="space-y-1.5 px-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Seguridad</span>
                          <span className="text-[9px] font-black" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500" style={{ backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#ffffff10' }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1">
                          {[
                            { key: 'length', label: '8+ caracteres' },
                            { key: 'uppercase', label: 'Mayúscula' },
                            { key: 'lowercase', label: 'Minúscula' },
                            { key: 'number', label: 'Número' },
                            { key: 'special', label: 'Símbolo (!@#...)' },
                          ].map(({ key, label }) => (
                            <div key={key} className={`flex items-center gap-1 text-[9px] font-bold ${(passwordStrength.checks as any)[key] ? 'text-green-400' : 'text-gray-600'}`}>
                              <span className="material-symbols-outlined text-[11px]">{(passwordStrength.checks as any)[key] ? 'check_circle' : 'radio_button_unchecked'}</span>
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-base">card_giftcard</span>
                        <input
                          type="text"
                          value={referralCode}
                          onChange={e => {
                            const val = e.target.value.toUpperCase().trim();
                            setReferralCode(val);
                            if (val) {
                              StorageService.setPendingReferralCode(val);
                              setReferralCodeError('');
                            } else {
                              StorageService.setPendingReferralCode(null);
                            }
                          }}
                          className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary/50 outline-none transition-all uppercase font-mono tracking-wider ${referralCodeError ? 'border-red-500/50' : 'border-white/10'}`}
                          placeholder="Código de referido (opcional)"
                          maxLength={12}
                        />
                      </div>
                      {referralCodeError && (
                        <p className="mt-1 text-[9px] text-red-400 font-bold px-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                          {referralCodeError}
                        </p>
                      )}
                      {referralCode && (
                        <p className="mt-1 text-[9px] text-green-400 font-bold px-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Código aplicado: {referralCode}
                        </p>
                      )}
                      {!referralCode && (
                        <p className="mt-1 text-[9px] text-gray-600 px-1">
                          ¿Tienes un código? Ingrésalo para ganar XP de bienvenida.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {view === 'recover' && step === 2 && (
                  <div className="space-y-3">
                    <input
                      type="password" required
                      value={formData.newPassword}
                      onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none"
                      placeholder="Nueva contraseña"
                    />
                    <input
                      type="password" required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none"
                      placeholder="Confirmar contraseña"
                    />
                  </div>
                )}
              </form>

              {error && <p className="text-red-400 text-[9px] font-black text-center bg-red-400/5 py-2 px-3 rounded-lg border border-red-400/10 italic my-2 w-full">{error}</p>}
              {message && <p className="text-emerald-400 text-[9px] font-black text-center bg-emerald-400/5 py-2 px-3 rounded-lg border border-emerald-400/10 my-2 w-full">{message}</p>}

              <div className="flex flex-col items-center gap-4 pt-4 pb-2 w-full px-4">
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    className="group relative w-full py-4 bg-primary hover:bg-blue-600 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30 overflow-hidden text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 border border-transparent border-t-white/50 border-r-white/50 rounded-xl animate-spin-electric opacity-50"></div>
                    <span className="material-symbols-outlined text-lg relative z-10">
                      {view === 'login' ? 'terminal' : view === 'register' ? 'stadium' : 'lock_reset'}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-center relative z-10">
                      {view === 'login' ? 'Conectar' : view === 'register' ? 'Unirse' : 'Reset'}
                    </span>
                  </button>

                  {(view === 'login' || view === 'register') && (
                    <div className="w-full flex flex-col items-center gap-3">
                      {view === 'login' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            setError('');
                            try {
                              await StorageService.seedAdmin();
                              const { user, error: loginError } = await StorageService.login('brai', 'admin123');
                              if (user) {
                                onSuccess(user);
                              } else {
                                setError(loginError || 'Dev login failed');
                              }
                            } catch (err: any) {
                              setError(err?.message || 'Error en dev login');
                            }
                            setLoading(false);
                          }}
                          className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline"
                        >
                          🔧 Dev Login (Admin)
                        </button>
                      )}
                      <div className="flex items-center gap-3 w-full opacity-30">
                        <div className="h-[1px] flex-1 bg-white/20"></div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/50">o continuar con</span>
                        <div className="h-[1px] flex-1 bg-white/20"></div>
                      </div>
                      
                      <div id="google-signin-btn" className="min-h-[40px] flex items-center justify-center"></div>
                    </div>
                  )}
                </div>

              <div className="flex flex-col items-center gap-3 pt-2">
                {view === 'login' && (
                  <button type="button" onClick={() => { setView('recover'); setStep(1); setEmailError(''); }} className="text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                {view === 'login' ? (
                  <button type="button" onClick={() => { setView('register'); setEmailError(''); }} className="text-[10px] text-primary hover:text-primary/80 uppercase font-black tracking-widest transition-colors">
                    ¿No tienes cuenta? Regístrate
                  </button>
                ) : (
                  <button type="button" onClick={() => { setView('login'); setEmailError(''); }} className="text-[10px] text-primary hover:text-primary/80 uppercase font-black tracking-widest transition-colors">
                    ¿Ya tienes cuenta? Conectar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
